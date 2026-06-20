<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\CashierShift;
use App\Models\Order;
use App\Models\Outlet;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CashierShiftController extends Controller
{
    /**
     * Open a new cashier shift.
     */
    public function open(Request $request): RedirectResponse
    {
        $request->validate([
            'start_amount' => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        // Check if there is already an active shift
        $activeShift = CashierShift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if ($activeShift) {
            return back()->withErrors(['shift' => 'Anda sudah memiliki shift yang aktif.']);
        }

        $outletId = $user->outlet_id;
        if ($outletId === null && Outlet::exists()) {
            $outletId = Outlet::first()->id;
        }

        CashierShift::create([
            'user_id' => $user->id,
            'outlet_id' => $outletId,
            'start_amount' => $request->input('start_amount'),
            'end_amount_expected' => $request->input('start_amount'),
            'status' => 'open',
            'opened_at' => now(),
        ]);

        return back()->with('message', 'Shift berhasil dibuka.');
    }

    /**
     * Close the current cashier shift.
     */
    public function close(Request $request): RedirectResponse
    {
        $request->validate([
            'end_amount_actual' => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        $activeShift = CashierShift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if (! $activeShift) {
            return back()->withErrors(['shift' => 'Tidak ada shift aktif untuk ditutup.']);
        }

        // Calculate totals
        $totals = DB::table('orders')
            ->where('cashier_shift_id', $activeShift->id)
            ->where('payment_status', 'paid')
            ->selectRaw("
                SUM(CASE WHEN payment_method = 'cash' THEN total_price ELSE 0 END) as total_cash,
                SUM(CASE WHEN payment_method = 'qris' THEN total_price ELSE 0 END) as total_qris
            ")
            ->first();

        $totalCashSales = (float) ($totals->total_cash ?? 0);
        $totalQrisSales = (float) ($totals->total_qris ?? 0);
        $endAmountExpected = (float) $activeShift->start_amount + $totalCashSales;
        $endAmountActual = (float) $request->input('end_amount_actual');

        $activeShift->update([
            'total_cash_sales' => $totalCashSales,
            'total_qris_sales' => $totalQrisSales,
            'end_amount_expected' => $endAmountExpected,
            'end_amount_actual' => $endAmountActual,
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        return back()->with('message', 'Shift berhasil ditutup.')->with('print_shift_id', $activeShift->id);
    }

    /**
     * Get live calculations for active shift totals.
     */
    public function currentTotals(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $activeShift = CashierShift::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if (! $activeShift) {
            return response()->json(['error' => 'No active shift'], 404);
        }

        $totals = DB::table('orders')
            ->where('cashier_shift_id', $activeShift->id)
            ->where('payment_status', 'paid')
            ->selectRaw("
                SUM(CASE WHEN payment_method = 'cash' THEN total_price ELSE 0 END) as total_cash,
                SUM(CASE WHEN payment_method = 'qris' THEN total_price ELSE 0 END) as total_qris
            ")
            ->first();

        return response()->json([
            'start_amount' => (float) $activeShift->start_amount,
            'total_cash_sales' => (float) ($totals->total_cash ?? 0),
            'total_qris_sales' => (float) ($totals->total_qris ?? 0),
            'expected_amount' => (float) $activeShift->start_amount + (float) ($totals->total_cash ?? 0),
        ]);
    }

    /**
     * Print the shift summary.
     */
    public function printSummary(Request $request, CashierShift $shift): View
    {
        // Enforce user authorization (cashier's own shift, or manager/admin)
        $user = $request->user();
        if ($user->role === 'cashier' && $shift->user_id !== $user->id) {
            abort(403, 'Unauthorized.');
        }

        // Load relations
        $shift->load(['user', 'outlet']);

        // Fetch shift orders
        $orders = Order::where('cashier_shift_id', $shift->id)->where('payment_status', 'paid')->get();

        return view('print.shift-summary', compact('shift', 'orders'));
    }
}
