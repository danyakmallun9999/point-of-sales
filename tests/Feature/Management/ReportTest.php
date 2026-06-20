<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

test('admin can view reports', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('management.reports.index'));

    $response->assertOk();
});

test('manager can view reports', function () {
    $manager = User::factory()->create(['role' => 'manager']);

    $response = $this->actingAs($manager)->get(route('management.reports.index'));

    $response->assertOk();
});

test('cashier cannot view reports', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    $response = $this->actingAs($cashier)->get(route('management.reports.index'));

    $response->assertForbidden();
});

test('guest is redirected to login from reports', function () {
    $response = $this->get(route('management.reports.index'));

    $response->assertRedirect(route('login'));
});

test('reports summary includes only paid orders', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    // Paid order
    Order::factory()->cash()->create([
        'user_id' => $user->id,
        'subtotal' => 10000,
        'discount_amount' => 0,
        'tax_amount' => 1000,
        'total_price' => 11000,
        'created_at' => now(),
    ]);

    // Pending order
    Order::factory()->qris()->create([
        'user_id' => $user->id,
        'subtotal' => 50000,
        'discount_amount' => 0,
        'tax_amount' => 5000,
        'total_price' => 55000,
        'created_at' => now(),
    ]);

    $response = $this->actingAs($admin)->get(route('management.reports.index'));

    $response->assertOk();
});

test('admin can export reports as csv', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    Order::factory()->cash()->create([
        'user_id' => $user->id,
        'customer_name' => 'Test Customer',
        'subtotal' => 10000,
        'discount_amount' => 0,
        'tax_amount' => 1000,
        'total_price' => 11000,
        'created_at' => now(),
    ]);

    $startDate = now()->toDateString();
    $endDate = now()->toDateString();

    $response = $this->actingAs($admin)->get(route('management.reports.export', [
        'start_date' => $startDate,
        'end_date' => $endDate,
    ]));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('manager can export reports', function () {
    $manager = User::factory()->create(['role' => 'manager']);

    $startDate = now()->toDateString();
    $endDate = now()->toDateString();

    $response = $this->actingAs($manager)->get(route('management.reports.export', [
        'start_date' => $startDate,
        'end_date' => $endDate,
    ]));

    $response->assertOk();
});

test('csv export includes correct columns', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    Order::factory()->cash()->create([
        'user_id' => $user->id,
        'customer_name' => 'CSV Customer',
        'subtotal' => 20000,
        'discount_amount' => 2000,
        'tax_amount' => 1800,
        'total_price' => 19800,
        'created_at' => now(),
    ]);

    $startDate = now()->toDateString();
    $endDate = now()->toDateString();

    $response = $this->actingAs($admin)->get(route('management.reports.export', [
        'start_date' => $startDate,
        'end_date' => $endDate,
    ]));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

    ob_start();
    $response->sendContent();
    $content = ob_get_clean();

    $this->assertStringContainsString('Reference', $content);
    $this->assertStringContainsString('CSV Customer', $content);
});
