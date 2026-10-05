<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Tire;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;


class TransactionController extends Controller
{
  /**
   * List all the transactions with filters
   * Route : GET /transactions -> transaction.index 
   */
  public function index(Request $request)
  {
    $query = Transaction::with(['contact', 'user', 'details.tire.brand'])
      ->latest("transaction_date");

    // ----- filters-------
    if ($request->filled("type")) {
      $query->where("type", $request->type);
    }

    if ($request->filled("status")) {
      $query->where("status", $request->status);
    }

    if ($request->filled("search")) {
      $query->where("invoice_number", "like", "%" . $request->search . "%");
    }

    if ($request->filled("date_from")) {
      $query->whereDate("transaction_date", ">=", $request->date_from);
    }

    if ($request->filled("date_to")) {
      $query->whereDate("transaction_date", "<=", $request->date_to);
    }

    $transactions = $query->paginate(15)->withQueryString();

    return Inertia::render("Transactions/Index", [
      "transactions" => $transactions,
      "filters" => $request->only(["type", "status", "search", "date_from", "date_to"]),
    ]);
  }

  /**
   * Show the create form 
   * Route: GET /transaction/create -> transactions.create
   */

  public function create()
  {
    return Inertia::render("Transactions/Create", [
      'warehouses' => Warehouse::select('id', 'name', 'address')->get(),
      'tires'      => Tire::with([
        'brand',
        'warehouses' => fn ($query) => $query->select('warehouses.id', 'warehouses.name'),
      ])->get(),
      'clients'    => Contact::whereIn('type', ['client', 'both'])->select('id', 'name', 'phone', 'city')->get(),
      'suppliers'  => Contact::whereIn('type', ['supplier', 'both'])->select('id', 'name', 'phone', 'city')->get(),
    ]);
  }

  /**
   * Store a new transaction, update stock, auto-generate invoice number.
   * Route: Post /transactions -> transactions.store
   */
  public function store(Request $request)
  {
    $validated = $request->validate([
      "type" => ['required', 'in:sale,purchase,transfer'],
      "contact_id" => ['nullable', 'exists:contacts,id'],
      "payment_method" => ['nullable', 'required_unless:type,transfer', 'in:cash,cheque,virement'],
      "transaction_date" => ['required', 'date'],
      "notes" => ['nullable', 'string'],
      "items" => ['required', 'array', 'min:1'],
      'items.*.tire_id'          => ['required', 'exists:tires,id'],
      'items.*.quantity'         => ['required', 'integer', 'min:1'],
      'items.*.unit_price'       => ['nullable', 'required_unless:type,transfer', 'numeric', 'min:0'],
      'items.*.from_warehouse_id' => ['nullable', 'exists:warehouses,id'],
      'items.*.to_warehouse_id'   => ['nullable', 'exists:warehouses,id'],
    ]);

    // Contact is required for sale and purchase, not for transfer
    if (in_array($validated["type"], ['sale', 'purchase']) && empty($validated['contact_id'])) {
      return back()->withErrors(['contact_id' => "un contact est requis pour ce type de transaction."]);
    }

    $this->validateTransactionItems($validated);

    DB::transaction(function () use ($validated) {

      // ---- Create Transaction header ----
      $transaction = Transaction::create([
        "type" => $validated['type'],
        "contact_id" => $validated['contact_id'] ?? null,
        "user_id" => 1,
        "invoice_number" => Transaction::generateInvoiceNumber($validated["type"]),
        "transaction_date" => $validated["transaction_date"],
        "status" => 'completed',
        'payment_method' => $validated['payment_method'] ?? 'cash'
      ]);

      // ---- Create line items + move stock ----
      foreach ($validated['items'] as $item) {
        $quantity = $item['quantity'];
        $unit_price = $validated['type'] === 'transfer' ? 0 : $item['unit_price'];

        TransactionDetail::create([
          "transaction_id" => $transaction->id,
          "tire_id" => $item['tire_id'],
          "from_warehouse_id" => $item['from_warehouse_id'] ?? null,
          "to_warehouse_id" => $item['to_warehouse_id'] ?? null,
          "quantity" => $quantity,
          'unit_price' => $unit_price,
          'total_price' => $quantity * $unit_price
        ]);

        // ---- Stock Movements ----
        $this->applyStockMovement(
          type: $validated['type'],
          tireId: $item['tire_id'],
          quantity: $quantity,
          fromWarehouseId: $item['from_warehouse_id'] ?? null,
          toWarehouseId: $item['to_warehouse_id']   ?? null,
          unitPrice: $unit_price,
        );
      }
    });

    return redirect()->route("transactions.index")->with("success", 'Transaction enregistrée avec success');
  }

  /**
   * Show a single transaction with all details.
   * Route: GET /transaction/{transaction} -> transactions.show
   */
  public function show(Transaction $transaction)
  {
    $transaction->load([
      'contact',
      'user',
      'details.tire.brand',
      'details.fromWarehouse',
      'details.toWarehouse',
    ]);

    return Inertia::render('Transactions/Show', [
      'transaction' => $transaction,
    ]);
  }

  /**
   * Cancel a transaction and reverse all stock movements.
   * Route: PATCH /transactions/{transaction}/cancel -> transactions.cancel
   */
  public function cancel(Transaction $transaction)
  {
    if ($transaction->status === "canceled") {
      return back()->withErrors([
        "error" => "Cette Transaction est deja annulée."
      ]);
    }

    DB::transaction(function () use ($transaction) {
      $transaction->load('details');
      
      // reverse every stock movement
      foreach ($transaction->details as $detail) {
        $this->applyStockMovement(
          type:            $transaction->type,
          tireId:          $detail->tire_id,
          quantity:        $detail->quantity,
          fromWarehouseId: $detail->from_warehouse_id,
          toWarehouseId:   $detail->to_warehouse_id,
          unitPrice:       $detail->unit_price,
          reverse:         true, 
        );
      }

      $transaction->update(['status' => 'canceled']);
    });

    return back()->with("success", "Transactions annulée et stock restauré.");
  }

  /**
   * Generate and download a PDF invoce (sale only)
   * Route: Get /transactions/{transaction}/pdf -> transactions.pdf
   */
  public function downloadPdf(Transaction $transaction) 
  {
    if ($transaction->type !== "sale") {
      abort(403, "Le PDF est disponible uniquement pour les ventes");
    }

    $transaction->load([
      "contact",
      "user",
      "details.tire.brand",
      "details.fromWarehouse"
    ]);

    $pdf = Pdf::loadView("pdf.invoice", [
      'transaction' => $transaction,
    ])->setPaper('a4', 'portrait');

    $filename = "{$transaction->invoice_number}.pdf";

    return $pdf->download($filename);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────
 
  /**
   * Apply (or reverse) a stock movement on the warehouse_tire pivot.
   * - sale:     decrement from_warehouse
   * - purchase: increment to_warehouse
   * - transfer: decrement from_warehouse, increment to_warehouse
   */
  private function applyStockMovement(
    string $type,
    int    $tireId,
    int    $quantity,
    ?int   $fromWarehouseId,
    ?int   $toWarehouseId,
    float  $unitPrice,
    bool   $reverse = false,
  ): void {
    $add      = $reverse ? -$quantity : $quantity;
    $subtract = $reverse ? $quantity  : -$quantity;
 
    match ($type) {
      'sale' => $this->adjustPivot($fromWarehouseId, $tireId, $subtract),
 
      'purchase' => $this->adjustPivot($toWarehouseId, $tireId, $add, $unitPrice),
 
      'transfer' => null,
 
      default => null,
    };
 
    // Handle transfer as it can't be a simple match return
    if ($type === 'transfer') {
      $sourceStock = $this->getWarehouseTire($fromWarehouseId, $tireId);
      $this->adjustPivot($fromWarehouseId, $tireId, $subtract);
      $this->adjustPivot(
        $toWarehouseId,
        $tireId,
        $add,
        $sourceStock?->pivot->purchase_price ?? 0,
        $sourceStock?->pivot->selling_price ?? 0,
      );
    }
  }

  /**
   * Validate transaction-specific warehouse requirements before stock movement.
   */
  private function validateTransactionItems(array $validated): void
  {
    foreach ($validated['items'] as $index => $item) {
      $line = $index + 1;

      if (in_array($validated['type'], ['sale', 'transfer']) && empty($item['from_warehouse_id'])) {
        throw ValidationException::withMessages([
          "items.$index.from_warehouse_id" => "Le depot source est requis pour la ligne $line.",
        ]);
      }

      if (in_array($validated['type'], ['purchase', 'transfer']) && empty($item['to_warehouse_id'])) {
        throw ValidationException::withMessages([
          "items.$index.to_warehouse_id" => "Le depot destination est requis pour la ligne $line.",
        ]);
      }

      if ($validated['type'] === 'transfer' && $item['from_warehouse_id'] === $item['to_warehouse_id']) {
        throw ValidationException::withMessages([
          "items.$index.to_warehouse_id" => "Le depot destination doit etre different du depot source pour la ligne $line.",
        ]);
      }

      if (in_array($validated['type'], ['sale', 'transfer'])) {
        $stock = $this->getWarehouseTire($item['from_warehouse_id'], $item['tire_id']);
        $available = (int) ($stock?->pivot->quantity ?? 0);

        if ($available < $item['quantity']) {
          throw ValidationException::withMessages([
            "items.$index.quantity" => "Stock insuffisant pour la ligne $line. Disponible: $available.",
          ]);
        }
      }
    }
  }

  private function getWarehouseTire(?int $warehouseId, int $tireId): ?Tire
  {
    if (!$warehouseId) return null;

    $warehouse = Warehouse::find($warehouseId);
    if (!$warehouse) return null;

    return $warehouse->tires()->where('tire_id', $tireId)->first();
  }
 
  /**
   * Increment or decrement quantity in the warehouse_tire pivot.
   * If the pivot row doesn't exist yet (purchase), it creates it.
   */
  private function adjustPivot(
    ?int  $warehouseId,
    int   $tireId,
    int   $delta,
    float $purchasePrice = 0,
    float $sellingPrice = 0,
  ): void {
    if (!$warehouseId) return;
 
    $warehouse = Warehouse::find($warehouseId);
    if (!$warehouse) return;
 
    $existing = $this->getWarehouseTire($warehouseId, $tireId);
 
    if ($existing) {
      $newQuantity = $existing->pivot->quantity + $delta;
      if ($newQuantity < 0) {
        throw ValidationException::withMessages([
          'items' => "Stock insuffisant pour ce pneu dans le depot selectionne.",
        ]);
      }

      $warehouse->tires()->updateExistingPivot($tireId, [
        'quantity'   => $newQuantity,
        'updated_at' => now(),
      ]);
    } else {
      // Only create if adding (purchase bringing in new stock)
      if ($delta > 0) {
        $warehouse->tires()->attach($tireId, [
          'quantity'       => $delta,
          'purchase_price' => $purchasePrice,
          'selling_price'  => $sellingPrice,
          'created_at'     => now(),
          'updated_at'     => now(),
        ]);
      }
    }
  }
}
