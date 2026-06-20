<?php

use App\Models\Category;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Models\User;

test('cashier can create a qris order', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 10]);
    InventoryBatch::create(['product_id' => $product->id, 'initial_quantity' => 10, 'remaining_quantity' => 10, 'buy_price' => 10000]);

    $response = $this->actingAs($cashier)->post(route('pos.orders.store'), [
        'customer_name' => 'John Doe',
        'payment_method' => 'qris',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('orders', [
        'customer_name' => 'John Doe',
        'payment_method' => 'qris',
        'payment_status' => 'pending',
    ]);

    // Stock should NOT be deducted for QRIS
    expect($product->fresh()->stock)->toBe(10);
});

test('order calculates discount correctly', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 10]);

    $response = $this->actingAs($cashier)->post(route('pos.orders.store'), [
        'payment_method' => 'cash',
        'discount_amount' => 5000,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
    ]);

    $response->assertStatus(302);

    // subtotal = 20000, discount = 5000, tax = (20000-5000)*0.1 = 1500, total = 20000-5000+1500 = 16500
    $this->assertDatabaseHas('orders', [
        'subtotal' => 20000,
        'discount_amount' => 5000,
        'tax_amount' => 1500,
        'total_price' => 16500,
    ]);
});

test('order calculates 10 percent tax after discount', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Latte', 'price' => 30000, 'stock' => 10]);

    $response = $this->actingAs($cashier)->post(route('pos.orders.store'), [
        'payment_method' => 'cash',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
    ]);

    // subtotal = 30000, discount = 0, tax = 30000*0.1 = 3000, total = 33000
    $this->assertDatabaseHas('orders', [
        'subtotal' => 30000,
        'tax_amount' => 3000,
        'total_price' => 33000,
    ]);
});

test('order with multiple items', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Coffee']);
    $productA = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 10]);
    $productB = Product::create(['category_id' => $category->id, 'name' => 'Latte', 'price' => 25000, 'stock' => 10]);

    $response = $this->actingAs($cashier)->post(route('pos.orders.store'), [
        'payment_method' => 'cash',
        'items' => [
            ['product_id' => $productA->id, 'quantity' => 2],
            ['product_id' => $productB->id, 'quantity' => 1],
        ],
    ]);

    // subtotal = 20000*2 + 25000 = 65000, tax = 65000*0.1 = 6500, total = 71500
    $this->assertDatabaseHas('orders', [
        'subtotal' => 65000,
        'tax_amount' => 6500,
        'total_price' => 71500,
    ]);
});

test('order fails with insufficient stock', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 2]);

    $response = $this->actingAs($cashier)->post(route('pos.orders.store'), [
        'payment_method' => 'cash',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 5],
        ],
    ]);

    $response->assertSessionHasErrors('items');
});

test('order validates product exists', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    $response = $this->actingAs($cashier)->post(route('pos.orders.store'), [
        'payment_method' => 'cash',
        'items' => [
            ['product_id' => 999, 'quantity' => 1],
        ],
    ]);

    $response->assertSessionHasErrors('items.0.product_id');
});

test('cash order deducts stock immediately', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 10]);
    InventoryBatch::create(['product_id' => $product->id, 'initial_quantity' => 10, 'remaining_quantity' => 10, 'buy_price' => 10000]);

    $this->actingAs($cashier)->post(route('pos.orders.store'), [
        'payment_method' => 'cash',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 3],
        ],
    ]);

    expect($product->fresh()->stock)->toBe(7);
});

test('qris order does not deduct stock at creation', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 10]);
    InventoryBatch::create(['product_id' => $product->id, 'initial_quantity' => 10, 'remaining_quantity' => 10, 'buy_price' => 10000]);

    $this->actingAs($cashier)->post(route('pos.orders.store'), [
        'payment_method' => 'qris',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 3],
        ],
    ]);

    expect($product->fresh()->stock)->toBe(10);
});
