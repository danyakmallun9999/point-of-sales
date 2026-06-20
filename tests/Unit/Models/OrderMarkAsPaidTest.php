<?php

use App\Models\Category;
use App\Models\InventoryBatch;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('marks pending order as paid', function () {
    $user = User::factory()->create();
    $order = Order::factory()->qris()->create(['user_id' => $user->id]);

    $order->markAsPaid();

    expect($order->fresh()->payment_status)->toBe('paid');
});

test('deducts stock via fifo on markAsPaid', function () {
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Espresso',
        'price' => 20000,
        'stock' => 10,
    ]);

    InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 10,
        'remaining_quantity' => 10,
        'buy_price' => 10000,
    ]);

    $user = User::factory()->create();
    $order = Order::factory()->qris()->create(['user_id' => $user->id]);

    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 3,
        'price' => 20000,
        'subtotal' => 60000,
    ]);

    $order->markAsPaid();

    expect($product->fresh()->stock)->toBe(7);
    expect($product->inventoryBatches()->first()->remaining_quantity)->toBe(7);
});

test('does nothing if already paid', function () {
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Espresso',
        'price' => 20000,
        'stock' => 10,
    ]);

    InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 10,
        'remaining_quantity' => 10,
        'buy_price' => 10000,
    ]);

    $user = User::factory()->create();
    $order = Order::factory()->cash()->create(['user_id' => $user->id]);

    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 3,
        'price' => 20000,
        'subtotal' => 60000,
    ]);

    // Mark as paid twice
    $order->markAsPaid();
    $order->markAsPaid();

    // Stock should only be deducted once (already deducted at creation for cash)
    expect($product->fresh()->stock)->toBe(10);
});

test('deducts stock for multiple order items', function () {
    $category = Category::create(['name' => 'Coffee']);
    $productA = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 10]);
    $productB = Product::create(['category_id' => $category->id, 'name' => 'Latte', 'price' => 25000, 'stock' => 10]);

    InventoryBatch::create(['product_id' => $productA->id, 'initial_quantity' => 10, 'remaining_quantity' => 10, 'buy_price' => 10000]);
    InventoryBatch::create(['product_id' => $productB->id, 'initial_quantity' => 10, 'remaining_quantity' => 10, 'buy_price' => 12000]);

    $user = User::factory()->create();
    $order = Order::factory()->qris()->create(['user_id' => $user->id]);

    OrderItem::create(['order_id' => $order->id, 'product_id' => $productA->id, 'quantity' => 2, 'price' => 20000, 'subtotal' => 40000]);
    OrderItem::create(['order_id' => $order->id, 'product_id' => $productB->id, 'quantity' => 4, 'price' => 25000, 'subtotal' => 100000]);

    $order->markAsPaid();

    expect($productA->fresh()->stock)->toBe(8);
    expect($productB->fresh()->stock)->toBe(6);
});
