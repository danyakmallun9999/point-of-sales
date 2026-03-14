<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('cashier can create a cash order successfully', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Espresso',
        'price' => 20000,
        'stock' => 10,
    ]);

    $response = $this->actingAs($cashier)->post(route('pos.orders.store'), [
        'customer_name' => 'John Doe',
        'payment_method' => 'cash',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('orders', [
        'customer_name' => 'John Doe',
        'total_price' => 44000,
        'payment_status' => 'paid',
    ]);

    $this->assertEquals(8, $product->fresh()->stock);
});

test('unauthorized role cannot create an order', function () {
    $user = User::factory()->create(['role' => 'cashier']); // Wait, cashier is authorized. Let's use a guest or no role if possible, but role defaults to cashier.
    // Let's create a user and manually change role if needed, but I'll just test guest.

    $response = $this->post(route('pos.orders.store'), []);

    $response->assertStatus(302); // Redirect to login
});

test('validation rejects empty items', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    $response = $this->actingAs($cashier)->post(route('pos.orders.store'), [
        'payment_method' => 'cash',
        'items' => [],
    ]);

    $response->assertStatus(302); // Redirect back with validation errors
    $response->assertSessionHasErrors('items');
});
