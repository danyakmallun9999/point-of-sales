<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Midtrans\Config;
use Midtrans\CoreApi;
use Midtrans\Notification;
use Midtrans\Transaction as MidtransTransaction;

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

        $order->load('items.product');

        $itemDetails = [];
        $calculatedGrossAmount = 0;

        foreach ($order->items as $item) {
            $price = (int) round($item->price);
            $qty = $item->quantity;
            $itemDetails[] = [
                'id' => 'PROD-'.$item->product_id,
                'price' => $price,
                'quantity' => $qty,
                'name' => substr($item->product->name, 0, 50),
            ];
            $calculatedGrossAmount += ($price * $qty);
        }

        // Add Discount as a negative item if present
        if ($order->discount_amount > 0) {
            $discount = (int) round($order->discount_amount);
            $itemDetails[] = [
                'id' => 'DISCOUNT',
                'price' => -$discount,
                'quantity' => 1,
                'name' => 'Discount',
            ];
            $calculatedGrossAmount -= $discount;
        }

        // Add Tax as an item
        if ($order->tax_amount > 0) {
            $tax = (int) round($order->tax_amount);
            $itemDetails[] = [
                'id' => 'TAX',
                'price' => $tax,
                'quantity' => 1,
                'name' => 'Tax (10%)',
            ];
            $calculatedGrossAmount += $tax;
        }

        $midtransOrderId = $order->reference_number.'-'.time();

        $params = [
            'payment_type' => 'qris',
            'transaction_details' => [
                'order_id' => $midtransOrderId,
                'gross_amount' => $calculatedGrossAmount,
            ],
            'item_details' => $itemDetails,
            'customer_details' => [
                'first_name' => $order->customer_name ?? 'Customer',
            ],
        ];

        try {
            $response = CoreApi::charge($params);
            $responseArray = is_array($response) ? $response : (array) $response;

            // Include order total and gross_amount so frontend can show amount in QRIS modal
            return response()->json(array_merge($responseArray, [
                'order_total' => (float) $order->total_price,
                'gross_amount' => $calculatedGrossAmount,
            ]));
        } catch (\Exception $e) {
            \Log::error('Midtrans QRIS Charge Error: '.$e->getMessage());

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Check order status (for polling).
     */
    public function checkStatus(Order $order, Request $request): JsonResponse
    {
        try {
            // If already paid in DB, return success immediately with order for receipt
            if ($order->payment_status === 'paid') {
                return response()->json([
                    'payment_status' => 'paid',
                    'order' => $order->load('items.product'),
                ]);
            }

            // FALLBACK: If status is still pending, check Midtrans API directly.
            // This is crucial for local development where webhooks might not reach the server.
            $midtransOrderId = $request->query('midtrans_order_id');

            if ($midtransOrderId) {
                try {
                    $status = MidtransTransaction::status($midtransOrderId);
                    $transactionStatus = is_array($status) ? ($status['transaction_status'] ?? null) : ($status->transaction_status ?? null);

                    if ($transactionStatus === 'settlement' || $transactionStatus === 'capture') {
                        $order->markAsPaid();

                        return response()->json([
                            'payment_status' => 'paid',
                            'source' => 'midtrans_api',
                            'order' => $order->load('items.product'),
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::debug('Midtrans status check: '.$e->getMessage());
                    // Ignore errors from Midtrans (e.g. 404 if not found yet); return pending below
                }
            }

            return response()->json([
                'payment_status' => $order->fresh()->payment_status,
            ]);
        } catch (\Throwable $e) {
            \Log::error('checkStatus error: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json(['payment_status' => 'pending']);
        }
    }

    /**
     * Handle Midtrans webhook notification.
     */
    public function handleWebhook(Request $request): Response
    {
        $payload = $request->all();

        // If we have a payload from the request, we can use it (useful for testing)
        // Otherwise, Midtrans SDK will try to read from php://input
        if (! empty($payload)) {
            $transaction = $payload['transaction_status'] ?? null;
            $type = $payload['payment_type'] ?? null;
            $orderIdAndTimestamp = $payload['order_id'] ?? null;
            $fraud = $payload['fraud_status'] ?? null;

            $signatureKey = $payload['signature_key'] ?? null;
            $statusCode = $payload['status_code'] ?? null;
            $grossAmount = $payload['gross_amount'] ?? null;
        } else {
            try {
                $notif = new Notification;
                $transaction = $notif->transaction_status;
                $type = $notif->payment_type;
                $orderIdAndTimestamp = $notif->order_id;
                $fraud = $notif->fraud_status;

                $signatureKey = $notif->signature_key ?? null;
                $statusCode = $notif->status_code ?? null;
                $grossAmount = $notif->gross_amount ?? null;
            } catch (\Exception $e) {
                \Log::error('Midtrans Webhook Error: '.$e->getMessage());

                return response('Invalid Notification', 400);
            }
        }

        if (! $orderIdAndTimestamp) {
            return response('Missing order_id', 400);
        }

        // Verify Midtrans Signature Key using order_id + status_code + gross_amount + server_key
        $serverKey = trim(config('services.midtrans.server_key'));
        if ($signatureKey || ! app()->environment('testing')) {
            $computedSignature = hash('sha512', $orderIdAndTimestamp.$statusCode.$grossAmount.$serverKey);
            if ($signatureKey !== $computedSignature) {
                \Log::warning("Midtrans Webhook: Invalid signature. Computed: {$computedSignature}, Received: {$signatureKey}");

                return response('Invalid Signature', 403);
            }
        }

        // Parse order_id from "REF-TIMESTAMP"
        $parts = explode('-', $orderIdAndTimestamp);
        // Assuming reference number is always the parts before the last dash (timestamp)
        // Or better, just find by reference_number since we use a prefix
        array_pop($parts); // Remove timestamp
        $referenceNumber = implode('-', $parts);

        $order = Order::where('reference_number', $referenceNumber)->first();

        if (! $order) {
            \Log::warning('Order not found for reference: '.$referenceNumber);

            return response('Order not found', 404);
        }

        \Log::info("Webhook received for Order {$order->id}: {$transaction}");

        if ($transaction == 'capture') {
            if ($type == 'credit_card') {
                if ($fraud == 'challenge') {
                    $order->update(['payment_status' => 'pending']);
                } else {
                    $order->markAsPaid();
                }
            }
        } elseif ($transaction == 'settlement') {
            $order->markAsPaid();
        } elseif ($transaction == 'pending') {
            $order->update(['payment_status' => 'pending']);
        } elseif ($transaction == 'deny' || $transaction == 'expire' || $transaction == 'cancel') {
            $order->update(['payment_status' => 'failed']);
        }

        return response('OK');
    }
}
