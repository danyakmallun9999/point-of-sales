<?php

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('midtrans webhook updates order status correctly when no signature is sent in test env fallback', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $order = Order::create([
        'user_id' => $cashier->id,
        'customer_name' => 'Test Customer',
        'subtotal' => 10000,
        'tax_amount' => 1000,
        'total_price' => 11000,
        'payment_method' => 'qris',
        'payment_status' => 'pending',
        'reference_number' => 'REF-123',
    ]);

    $payload = [
        'transaction_status' => 'settlement',
        'payment_type' => 'qris',
        'order_id' => 'REF-123-1710520000',
        'gross_amount' => '11000.00',
    ];

    $response = $this->post('/webhooks/midtrans', $payload);

    $response->assertStatus(200);
    $this->assertEquals('paid', $order->fresh()->payment_status);
});

test('midtrans webhook rejects invalid signature', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $order = Order::create([
        'user_id' => $cashier->id,
        'customer_name' => 'Test Customer',
        'subtotal' => 10000,
        'tax_amount' => 1000,
        'total_price' => 11000,
        'payment_method' => 'qris',
        'payment_status' => 'pending',
        'reference_number' => 'REF-999',
    ]);

    $payload = [
        'transaction_status' => 'settlement',
        'payment_type' => 'qris',
        'order_id' => 'REF-999-1710520000',
        'gross_amount' => '11000.00',
        'status_code' => '200',
        'signature_key' => 'invalid_signature_here',
    ];

    $response = $this->post('/webhooks/midtrans', $payload);
    $response->assertStatus(403);
    $this->assertEquals('pending', $order->fresh()->payment_status);
});

test('midtrans webhook accepts valid signature', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $order = Order::create([
        'user_id' => $cashier->id,
        'customer_name' => 'Test Customer',
        'subtotal' => 10000,
        'tax_amount' => 1000,
        'total_price' => 11000,
        'payment_method' => 'qris',
        'payment_status' => 'pending',
        'reference_number' => 'REF-888',
    ]);

    $orderId = 'REF-888-1710520000';
    $statusCode = '200';
    $grossAmount = '11000.00';
    $serverKey = trim(config('services.midtrans.server_key'));
    $signature = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

    $payload = [
        'transaction_status' => 'settlement',
        'payment_type' => 'qris',
        'order_id' => $orderId,
        'gross_amount' => $grossAmount,
        'status_code' => $statusCode,
        'signature_key' => $signature,
    ];

    $response = $this->post('/webhooks/midtrans', $payload);
    $response->assertStatus(200);
    $this->assertEquals('paid', $order->fresh()->payment_status);
});
