<?php

use App\Models\Category;
use App\Models\InventoryBatch;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('stock is deducted using FEFO algorithm (earliest expiration first)', function () {
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Espresso',
        'price' => 20000,
        'stock' => 30,
    ]);

    // Batch A: expires in 10 days
    $batchA = InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 10,
        'remaining_quantity' => 10,
        'buy_price' => 10000,
        'expired_at' => now()->addDays(10)->toDateString(),
    ]);

    // Batch B: expires in 5 days (expires earlier, should be deducted first!)
    $batchB = InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 10,
        'remaining_quantity' => 10,
        'buy_price' => 10000,
        'expired_at' => now()->addDays(5)->toDateString(),
    ]);

    // Batch C: no expiration date (should be deducted last)
    $batchC = InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 10,
        'remaining_quantity' => 10,
        'buy_price' => 10000,
        'expired_at' => null,
    ]);

    // Deduct 15 units
    $product->deductStockFIFO(15);

    // Batch B (expires in 5 days) should be completely depleted (remaining = 0)
    // Batch A (expires in 10 days) should have 5 units deducted (remaining = 5)
    // Batch C (no expiration) should be untouched (remaining = 10)
    expect($batchB->fresh()->remaining_quantity)->toBe(0);
    expect($batchA->fresh()->remaining_quantity)->toBe(5);
    expect($batchC->fresh()->remaining_quantity)->toBe(10);
    expect($product->fresh()->stock)->toBe(15);
});
