<?php

namespace App\Http\Controllers;

use App\Models\Tire;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseController extends Controller
{
  public function index()
  {
    $warehouses = Warehouse::withSum('tires as current_stock', 'warehouse_tire.quantity')
      ->latest()
      ->get();

    return Inertia::render("Warehouses/Index", [
      "warehouses" => $warehouses
    ]);
  }

  public function show(Warehouse $warehouse)
  {
    // Eager-load the pivot columns so the frontend gets quantity + prices 
    $warehouse->load(['tires' => function ($query) {
      $query->with("brand")
        ->withPivot("quantity", "purchase_price", "selling_price");
    }]);

    // all tires with their brand, for the "add" dropdown 
    $tires = Tire::with("brand")->orderBy("id")->get();

    return Inertia::render("Warehouses/Show", [
      "warehouse" => $warehouse,
      "tires" => $tires
    ]);
  }

  /**
   * Store a new tire in the warehouse stock (attach via pivot).
   * Route: POST /warehouses/{warehouse}/stock  →  warehouses.stock.store
   */
  public function storeStock(Request $request, Warehouse $warehouse)
  {
    $validated = $request->validate([
      "tire_id" => ["required", "exists:tires,id"],
      "quantity" => ["required", "integer", "min:1"],
      "purchase_price" => ["nullable", "numeric", "min:0"],
      "selling_price" => ["nullable", "numeric", "min:0"]
    ]);

    // Prevent duplicates - use syncWithoutDetaching so re-posting 
    // only updates quantities instead of throwing a unique-key error .
    $existing = $warehouse->tires()->where("tire_id", $validated["tire_id"])->first();

    if ($existing) {
      $warehouse->tires()->updateExistingPivot($validated['tire_id'], [
        'quantity'       => $existing->pivot->quantity + $validated['quantity'],
        'purchase_price' => $validated['purchase_price'] ?? $existing->pivot->purchase_price,
        'selling_price'  => $validated['selling_price']  ?? $existing->pivot->selling_price,
        'updated_at'     => now(),
      ]);
    } else {
      $warehouse->tires()->attach($validated["tire_id"], [
        'quantity'       => $validated['quantity'],
        'purchase_price' => $validated['purchase_price'],
        'selling_price'  => $validated['selling_price'],
        'created_at'     => now(),
        'updated_at'     => now(),
      ]);
    }

    // check capacity constraint
    $warehouse->refresh()->load("tires");
    if (
      $warehouse->max_capacity > 0 &&
      $warehouse->current_stock > $warehouse->max_capacity
    ) {
      // Roll back and return an error 
      $warehouse->tires()->detach($validated["tire_id"]);
      return back()->withErrors([
        'error' => "Stock insuffisant : ce dépôt ne peut contenir que {$warehouse->max_capacity} unités.",
      ]);
    }

    return redirect()->route("warehouses.show", $warehouse->id);
  }

  public function store(Request $request)
  {
    $validated = $request->validate([
      "name" => "required|string|max:255|unique:warehouses,name",
      "address" => "nullable|string|max:255",
      "max_capacity" => "required|integer|min:0"
    ]);

    Warehouse::create($validated);
    Inertia::flash("message", "Dépôt ajouté avec succès !");

    return redirect()->back()->with("success", "Dépôt ajouté avec succès !");
  }

  public function update(Request $request, Warehouse $warehouse)
  {
    $validated = $request->validate([
      "name" => "required|string|max:255|unique:warehouses,name," . $warehouse->id,
      "address" => "nullable|string|max:255",
      "max_capacity" => "required|integer|min:0"
    ]);

    $warehouse->update($validated);
    Inertia::flash("message", "Dépôt mis à jour!");

    return redirect()->back()->with("success", "Dépôt mis à jour");
  }


  public function destroyStock(Warehouse $warehouse, Tire $tire)
  {
    $warehouse->tires()->detach($tire->id);

    return redirect()->route('warehouses.show', $warehouse->id);
  }

  public function destroy(Warehouse $warehouse)
  {
    // Security: On verifie si le depot contient des pneus avant de le supprimer
    if ($warehouse->tires()->count() > 0) {
      return redirect()->back()->withErrors([
        'error' => 'Impossible de supprimer ce dépôt car il contient encore du stock ! Videz-le d\'abord.'
      ]);
    }
    $warehouse->tires()->detach();

    $warehouse->delete();
    return redirect()->back()->with('success', 'Dépôt supprimé avec succès.');
  }
}
