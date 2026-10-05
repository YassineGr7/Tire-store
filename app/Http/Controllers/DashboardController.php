<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $selectedMonth = $request->input('month', Carbon::now()->format('Y-m'));
        $date = Carbon::parse($selectedMonth);
        $startOfMonth = $date->copy()->startOfMonth()->toDateTimeString();
        $endOfMonth = $date->copy()->endOfMonth()->toDateTimeString();

        // 1. CA & Ventes quotidiennes du mois (Caché 10 min)
        $monthlyData = Cache::remember("dashboard:monthly:{$selectedMonth}", 600, function () use ($startOfMonth, $endOfMonth, $date) {
            $totals = DB::table('transaction_details')
                ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->where('transactions.type', 'sale')
                ->where('transactions.status', 'completed')
                ->whereBetween('transactions.transaction_date', [$startOfMonth, $endOfMonth])
                ->selectRaw('SUM(transaction_details.total_price) as revenue, SUM(transaction_details.quantity) as sold')
                ->first();

            $rawDailySales = DB::table('transaction_details')
                ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->where('transactions.type', 'sale')
                ->where('transactions.status', 'completed')
                ->whereBetween('transactions.transaction_date', [$startOfMonth, $endOfMonth])
                ->selectRaw('DATE(transactions.transaction_date) as date, SUM(transaction_details.total_price) as total')
                ->groupBy(DB::raw('DATE(transactions.transaction_date)'))
                ->pluck('total', 'date')
                ->toArray();

            $dailySales = [];
            $daysInMonth = $date->daysInMonth;
            for ($day = 1; $day <= $daysInMonth; $day++) {
                $currentDate = $date->copy()->day($day)->format('Y-m-d');
                $dailySales[] = [
                    'day'     => $date->copy()->day($day)->format('d/m'),
                    'revenue' => (float) ($rawDailySales[$currentDate] ?? 0),
                ];
            }

            return [
                'revenue' => (float) ($totals->revenue ?? 0),
                'sold'    => (int) ($totals->sold ?? 0),
                'daily'   => $dailySales,
            ];
        });

        // 2. Métriques de stock (Caché 5 min - Retourne un tableau simple pour éviter le bug stdClass)
        $stockMetrics = Cache::remember("dashboard:stock_metrics", 300, function () {
            $result = DB::table('warehouse_tire')
                ->selectRaw('
                    SUM(quantity * purchase_price) as stock_value,
                    COUNT(CASE WHEN quantity > 0 AND quantity <= 4 THEN 1 END) as low_stock_count,
                    COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock_count
                ')
                ->first();

            return [
                'stock_value'        => (float) ($result->stock_value ?? 0),
                'low_stock_count'    => (int) ($result->low_stock_count ?? 0),
                'out_of_stock_count' => (int) ($result->out_of_stock_count ?? 0),
            ];
        });

        // 3. Top 10 Pneus les plus vendus (Caché 1h - Généré directement en SQL pour la vitesse)
        $topSellingTires = Cache::remember("dashboard:top_tires", 3600, function () {
            return DB::table('transaction_details')
                ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->join('tires', 'transaction_details.tire_id', '=', 'tires.id')
                ->leftJoin('brands', 'tires.brand_id', '=', 'brands.id')
                ->where('transactions.type', 'sale')
                ->where('transactions.status', 'completed')
                ->selectRaw("
                    tires.id, 
                    SUM(transaction_details.quantity) as total_quantity,
                    CONCAT(
                        COALESCE(brands.name, ''), ' ', 
                        tires.width, '/', tires.aspect_ratio, ' ', 
                        tires.construction, tires.diameter, ' ', 
                        tires.load_index, tires.speed_index
                    ) as name
                ")
                ->groupBy('tires.id', 'brands.name', 'tires.width', 'tires.aspect_ratio', 'tires.construction', 'tires.diameter', 'tires.load_index', 'tires.speed_index')
                ->orderByDesc('total_quantity')
                ->limit(10)
                ->get()
                ->map(fn($item) => [
                    'name'     => trim($item->name) ?: "Pneu #{$item->id}",
                    'quantity' => (int) $item->total_quantity,
                ])
                ->toArray();
        });

        // 4. Stock par dépôt (Caché 10 min)
        $stockByWarehouse = Cache::remember("dashboard:stock_by_warehouse", 600, function () {
            return DB::table("warehouse_tire")
                ->join("warehouses", "warehouse_tire.warehouse_id", "=", "warehouses.id")
                ->select("warehouses.name", DB::raw("SUM(warehouse_tire.quantity) as total_quantity"))
                ->groupBy("warehouses.id", "warehouses.name")
                ->get()
                ->map(fn($item) => [
                    'name'     => $item->name,
                    'quantity' => (int) $item->total_quantity,
                ])
                ->toArray();
        });

        // 5. Flux des 5 dernières ventes (En temps réel / non-caché)
        $recentSales = Transaction::where("type", "sale")
            ->where("status", "completed")
            ->with(["contact:id,name", "details:id,transaction_id,quantity,total_price"])
            ->latest("transaction_date")
            ->take(5)
            ->get(['id', 'invoice_number', 'contact_id', 'transaction_date'])
            ->map(fn($t) => [
                "id"             => $t->id,
                "invoice_number" => $t->invoice_number,
                "client_name"    => $t->contact->name ?? "Client inconnu",
                "total_price"    => (float) $t->details->sum("total_price"),
                "total_items"    => (int) $t->details->sum("quantity"),
                "date"           => $t->transaction_date ? $t->transaction_date->format("d/m/Y H:i") : "",
            ]);

        return inertia("Dashboard", [
            "title"            => "Dashboard",
            "selectedMonth"    => $selectedMonth,
            "dailySales"       => $monthlyData['daily'],
            "topSellingTires"  => $topSellingTires,
            "stockByWarehouse" => $stockByWarehouse,
            "recentSales"      => $recentSales,
            "kpis"             => [
                "monthly_revenue"    => $monthlyData['revenue'],
                "tires_sold"         => $monthlyData['sold'],
                "stock_value"        => $stockMetrics['stock_value'],
                "low_stock_count"    => $stockMetrics['low_stock_count'],
                "out_of_stock_count" => $stockMetrics['out_of_stock_count'],
            ]
        ]);
    }
}