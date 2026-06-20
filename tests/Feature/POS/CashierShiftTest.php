<?php

use App\Models\CashierShift;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('cashier can open a shift successfully', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    $response = $this->actingAs($cashier)->post(route('pos.shift.open'), [
        'start_amount' => 50000,
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('cashier_shifts', [
        'user_id' => $cashier->id,
        'start_amount' => 50000,
        'status' => 'open',
    ]);
});

test('cashier can close shift and reconcile totals', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    // Open shift
    $shift = CashierShift::create([
        'user_id' => $cashier->id,
        'start_amount' => 50000,
        'end_amount_expected' => 50000,
        'status' => 'open',
        'opened_at' => now(),
    ]);

    // Create an order linked to this shift
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Espresso',
        'price' => 20000,
        'stock' => 10,
    ]);

    // Create a paid cash order linked to this shift
    Order::create([
        'user_id' => $cashier->id,
        'customer_name' => 'John Doe',
        'subtotal' => 20000,
        'discount_amount' => 0,
        'tax_amount' => 2000,
        'total_price' => 22000,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'reference_number' => 'POS-123',
        'cashier_shift_id' => $shift->id,
        'created_at' => now(),
    ]);

    // Close shift
    $response = $this->actingAs($cashier)->post(route('pos.shift.close'), [
        'end_amount_actual' => 72000, // 50000 + 22000 = 72000 (No variance)
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('cashier_shifts', [
        'id' => $shift->id,
        'total_cash_sales' => 22000,
        'total_qris_sales' => 0,
        'end_amount_expected' => 72000,
        'end_amount_actual' => 72000,
        'status' => 'closed',
    ]);
});

test('unauthorized cashier cannot print other shift summaries', function () {
    $cashierA = User::factory()->create(['role' => 'cashier']);
    $cashierB = User::factory()->create(['role' => 'cashier']);

    $shift = CashierShift::create([
        'user_id' => $cashierA->id,
        'start_amount' => 50000,
        'status' => 'open',
        'opened_at' => now(),
    ]);

    // Cashier B tries to view Cashier A's shift
    $response = $this->actingAs($cashierB)->get(route('pos.shift.print', $shift->id));
    $response->assertStatus(403);
});

test('admin or manager can print any shift summaries', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $admin = User::factory()->create(['role' => 'admin']);

    $shift = CashierShift::create([
        'user_id' => $cashier->id,
        'start_amount' => 50000,
        'status' => 'open',
        'opened_at' => now(),
    ]);

    $response = $this->actingAs($admin)->get(route('pos.shift.print', $shift->id));
    $response->assertStatus(200);
});
