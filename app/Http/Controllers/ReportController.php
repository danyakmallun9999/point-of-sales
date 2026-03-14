<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display financial reports.
     */
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        // Sales summary
        $summary = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->select(
                DB::raw('SUM(subtotal) as total_subtotal'),
                DB::raw('SUM(discount_amount) as total_discount'),
                DB::raw('SUM(tax_amount) as total_tax'),
                DB::raw('SUM(total_price) as total_revenue'),
                DB::raw('COUNT(*) as total_orders')
            )
            ->first();

        // Top products
        $topProducts = OrderItem::whereHas('order', function ($query) use ($startDate, $endDate) {
            $query->where('payment_status', 'paid')
                ->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59']);
        })
            ->select('product_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(subtotal) as total_sales'))
            ->with('product:id,name')
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        // Daily sales chart data
        $dailySales = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_price) as total'))
            ->groupBy('date')
            ->get();

        return inertia('management/reports/index', [
            'summary' => $summary,
            'topProducts' => $topProducts,
            'dailySales' => $dailySales,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Export reports (Placeholder for actual export logic).
     */
    public function export(Request $request)
    {
        // Simple CSV export for now
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $orders = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
            ->get();

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Reference', 'Customer', 'Subtotal', 'Discount', 'Tax', 'Total', 'Date']);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->reference_number,
                    $order->customer_name,
                    $order->subtotal,
                    $order->discount_amount,
                    $order->tax_amount,
                    $order->total_price,
                    $order->created_at,
                ]);
            }
            fclose($file);
        };

        return response()->streamDownload($callback, "sales-report-{$startDate}-to-{$endDate}.csv", [
            'Content-Type' => 'text/csv',
        ]);
    }
}
