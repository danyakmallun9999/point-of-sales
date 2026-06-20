<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\AprioriService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('returns empty array when no paid orders exist', function () {
    $service = new AprioriService;

    $result = $service->generateRecommendations(0.1, 0.5);

    expect($result)->toBe([]);
});

test('generates recommendations from paid orders', function () {
    $category = Category::create(['name' => 'Coffee']);
    $productA = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 100]);
    $productB = Product::create(['category_id' => $category->id, 'name' => 'Latte', 'price' => 25000, 'stock' => 100]);
    $productC = Product::create(['category_id' => $category->id, 'name' => 'Cappuccino', 'price' => 22000, 'stock' => 100]);

    $user = User::factory()->create();

    // Create multiple paid orders with overlapping items
    for ($i = 0; $i < 10; $i++) {
        $order = Order::create([
            'user_id' => $user->id,
            'customer_name' => "Customer $i",
            'subtotal' => 45000,
            'discount_amount' => 0,
            'tax_amount' => 4500,
            'total_price' => 49500,
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'reference_number' => "POS-TEST-{$i}",
        ]);

        OrderItem::create(['order_id' => $order->id, 'product_id' => $productA->id, 'quantity' => 1, 'price' => 20000, 'subtotal' => 20000]);
        OrderItem::create(['order_id' => $order->id, 'product_id' => $productB->id, 'quantity' => 1, 'price' => 25000, 'subtotal' => 25000]);
        OrderItem::create(['order_id' => $order->id, 'product_id' => $productC->id, 'quantity' => 1, 'price' => 22000, 'subtotal' => 22000]);
    }

    $service = new AprioriService;
    $result = $service->generateRecommendations(0.05, 0.3);

    expect($result)->toBeArray();
    expect($result)->not->toBeEmpty();
});

test('each recommendation has required fields', function () {
    $category = Category::create(['name' => 'Coffee']);
    $productA = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 100]);
    $productB = Product::create(['category_id' => $category->id, 'name' => 'Latte', 'price' => 25000, 'stock' => 100]);

    $user = User::factory()->create();

    for ($i = 0; $i < 10; $i++) {
        $order = Order::create([
            'user_id' => $user->id,
            'customer_name' => "Customer $i",
            'subtotal' => 45000,
            'discount_amount' => 0,
            'tax_amount' => 4500,
            'total_price' => 49500,
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'reference_number' => "POS-TEST-{$i}",
        ]);

        OrderItem::create(['order_id' => $order->id, 'product_id' => $productA->id, 'quantity' => 1, 'price' => 20000, 'subtotal' => 20000]);
        OrderItem::create(['order_id' => $order->id, 'product_id' => $productB->id, 'quantity' => 1, 'price' => 25000, 'subtotal' => 25000]);
    }

    $service = new AprioriService;
    $result = $service->generateRecommendations(0.05, 0.3);

    foreach ($result as $rule) {
        expect($rule)->toHaveKeys(['antecedent', 'consequent', 'support', 'confidence']);
    }
});

test('returns at most 5 recommendations', function () {
    $category = Category::create(['name' => 'Coffee']);
    $products = [];
    $names = ['Espresso', 'Latte', 'Cappuccino', 'Mocha', 'Americano', 'Macchiato'];
    foreach ($names as $name) {
        $products[] = Product::create(['category_id' => $category->id, 'name' => $name, 'price' => 20000, 'stock' => 100]);
    }

    $user = User::factory()->create();

    for ($i = 0; $i < 20; $i++) {
        $order = Order::create([
            'user_id' => $user->id,
            'customer_name' => "Customer $i",
            'subtotal' => 120000,
            'discount_amount' => 0,
            'tax_amount' => 12000,
            'total_price' => 132000,
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'reference_number' => "POS-TEST-{$i}",
        ]);

        foreach ($products as $product) {
            OrderItem::create(['order_id' => $order->id, 'product_id' => $product->id, 'quantity' => 1, 'price' => 20000, 'subtotal' => 20000]);
        }
    }

    $service = new AprioriService;
    $result = $service->generateRecommendations(0.01, 0.1);

    expect(count($result))->toBeLessThanOrEqual(5);
});

test('ignores unpaid orders', function () {
    $category = Category::create(['name' => 'Coffee']);
    $productA = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 100]);
    $productB = Product::create(['category_id' => $category->id, 'name' => 'Latte', 'price' => 25000, 'stock' => 100]);

    $user = User::factory()->create();

    // Only pending orders
    for ($i = 0; $i < 10; $i++) {
        $order = Order::create([
            'user_id' => $user->id,
            'customer_name' => "Customer $i",
            'subtotal' => 45000,
            'discount_amount' => 0,
            'tax_amount' => 4500,
            'total_price' => 49500,
            'payment_method' => 'qris',
            'payment_status' => 'pending',
            'reference_number' => "POS-TEST-{$i}",
        ]);

        OrderItem::create(['order_id' => $order->id, 'product_id' => $productA->id, 'quantity' => 1, 'price' => 20000, 'subtotal' => 20000]);
        OrderItem::create(['order_id' => $order->id, 'product_id' => $productB->id, 'quantity' => 1, 'price' => 25000, 'subtotal' => 25000]);
    }

    $service = new AprioriService;
    $result = $service->generateRecommendations(0.1, 0.5);

    expect($result)->toBe([]);
});
