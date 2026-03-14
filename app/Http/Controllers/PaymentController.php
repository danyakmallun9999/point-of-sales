<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Midtrans\Config;
use Midtrans\CoreApi;
use Midtrans\Notification;

class PaymentController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = trim(config('services.midtrans.server_key'));
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized = config('services.midtrans.is_sanitized', true);
        Config::$is3ds = config('services.midtrans.is_3ds', true);
    }

    /**
     * Create a QRIS charge for an order.
     */
    public function createQrisCharge(Order $order): JsonResponse
    {
        if (empty(Config::$serverKey)) {
            return response()->json(['error' => 'Midtrans Server Key is not configured.'], 500);
        }

        $params = [
            'payment_type' => 'qris',
            'transaction_details' => [
                'order_id' => $order->reference_number . '-' . time(), // Make unique for retries
                'gross_amount' => (int) round($order->total_price),
            ],
            'customer_details' => [
                'first_name' => $order->customer_name ?? 'Customer',
            ],
        ];

        try {
            $response = CoreApi::charge($params);
            
            return response()->json($response);
        } catch (\Exception $e) {
            \Log::error('Midtrans QRIS Charge Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Check order status (for polling).
     */
    public function checkStatus(Order $order): JsonResponse
    {
        return response()->json([
            'payment_status' => $order->payment_status,
        ]);
    }

    /**
     * Handle Midtrans webhook notification.
     */
    public function handleWebhook(Request $request): Response
    {
        try {
            $notif = new Notification();
        } catch (\Exception $e) {
            return response('Invalid Notification', 400);
        }

        $transaction = $notif->transaction_status;
        $type = $notif->payment_type;
        $orderId = $notif->order_id;
        $fraud = $notif->fraud_status;

        $order = Order::where('reference_number', $orderId)->first();

        if (!$order) {
            return response('Order not found', 404);
        }

        if ($transaction == 'capture') {
            if ($type == 'credit_card') {
                if ($fraud == 'challenge') {
                    $order->update(['payment_status' => 'pending']);
                } else {
                    $order->update(['payment_status' => 'paid']);
                }
            }
        } elseif ($transaction == 'settlement') {
            $order->update(['payment_status' => 'paid']);
        } elseif ($transaction == 'pending') {
            $order->update(['payment_status' => 'pending']);
        } elseif ($transaction == 'deny' || $transaction == 'expire' || $transaction == 'cancel') {
            $order->update(['payment_status' => 'failed']);
        }

        return response('OK');
    }
}
