<?php

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('midtrans webhook updates order status correctly', function () {
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

    // Mock Midtrans Notification
    // We can't easily mock the 'Notification' class because it reads from php://input in constructor
    // So we'll test the logic by manually calling the method or mocking the request if possible.
    // However, the best way is to send a POST request with the expected JSON structure
    // AND we might need to mock the Notification class itself if it verifies signatures.
    
    // For this test, let's just mock the 'Notification' class behavior or assume the controller logic
    // Actually, let's just test that the order status updates when settlement is received.
    
    $payload = [
        'transaction_status' => 'settlement',
        'payment_type' => 'qris',
        'order_id' => 'REF-123-1710520000', // Unique ID with timestamp suffix
        'gross_amount' => '11000.00',
    ];

    $response = $this->post('/webhooks/midtrans', $payload);

    // Note: The controller creates 'new Notification()' which will fail if there's no valid payload in php://input
    // To make this testable, we might need to refactor the controller to accept an optional notification object.
    // For now, let's see if we can satisfy the Notification class.
    
    // If the test fails due to 'Invalid Notification', I will refactor the controller.
    
    $response->assertStatus(200);
    $this->assertEquals('paid', $order->fresh()->payment_status);
});
