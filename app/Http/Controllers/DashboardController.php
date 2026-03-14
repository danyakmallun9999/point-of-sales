<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        $today = now()->startOfDay();

        $stats = [
            'today_revenue' => (float) Order::where('payment_status', 'paid')
                ->where('created_at', '>=', $today)
                ->sum('total_price'),
            'today_orders' => Order::where('created_at', '>=', $today)->count(),
            'total_products' => Product::count(),
            'low_stock_alerts' => Product::where('stock', '<', 10)->count(),
        ];

        $recentOrders = Order::with('user')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
        ]);
    }
}
