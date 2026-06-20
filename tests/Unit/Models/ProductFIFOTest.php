<?php

use App\Models\Category;
use App\Models\InventoryBatch;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('deducts from single batch', function () {
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

    $product->deductStockFIFO(3);

    expect($product->fresh()->stock)->toBe(7);
    expect($product->inventoryBatches()->first()->remaining_quantity)->toBe(7);
});

test('deducts across multiple batches in fifo order', function () {
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Espresso',
        'price' => 20000,
        'stock' => 15,
    ]);

    $batch1 = InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 5,
        'remaining_quantity' => 5,
        'buy_price' => 10000,
    ]);

    // Small delay to ensure ordering
    $batch2 = InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 10,
        'remaining_quantity' => 10,
        'buy_price' => 12000,
    ]);

    $product->deductStockFIFO(8);

    expect($product->fresh()->stock)->toBe(7);
    expect($batch1->fresh()->remaining_quantity)->toBe(0);
    expect($batch2->fresh()->remaining_quantity)->toBe(7);
});

test('fully exhausts a batch before moving to next', function () {
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Espresso',
        'price' => 20000,
        'stock' => 10,
    ]);

    $batch1 = InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 3,
        'remaining_quantity' => 3,
        'buy_price' => 10000,
    ]);

    $batch2 = InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 7,
        'remaining_quantity' => 7,
        'buy_price' => 12000,
    ]);

    $product->deductStockFIFO(3);

    expect($batch1->fresh()->remaining_quantity)->toBe(0);
    expect($batch2->fresh()->remaining_quantity)->toBe(7);
});

test('deducts stock from product aggregate', function () {
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Espresso',
        'price' => 20000,
        'stock' => 20,
    ]);

    InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 20,
        'remaining_quantity' => 20,
        'buy_price' => 10000,
    ]);

    $product->deductStockFIFO(5);

    expect($product->fresh()->stock)->toBe(15);
});

test('handles partial batch deduction', function () {
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

    $product->deductStockFIFO(4);

    expect($product->fresh()->stock)->toBe(6);
    expect($product->inventoryBatches()->first()->remaining_quantity)->toBe(6);
});

test('deducts from three batches sequentially', function () {
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Espresso',
        'price' => 20000,
        'stock' => 15,
    ]);

    $batch1 = InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 3,
        'remaining_quantity' => 3,
        'buy_price' => 10000,
    ]);

    $batch2 = InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 5,
        'remaining_quantity' => 5,
        'buy_price' => 11000,
    ]);

    $batch3 = InventoryBatch::create([
        'product_id' => $product->id,
        'initial_quantity' => 7,
        'remaining_quantity' => 7,
        'buy_price' => 12000,
    ]);

    $product->deductStockFIFO(10);

    expect($product->fresh()->stock)->toBe(5);
    expect($batch1->fresh()->remaining_quantity)->toBe(0);
    expect($batch2->fresh()->remaining_quantity)->toBe(0);
    expect($batch3->fresh()->remaining_quantity)->toBe(5);
});
