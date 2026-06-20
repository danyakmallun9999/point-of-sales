<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('pos:train-apriori command runs and caches insights successfully', function () {
    // Create cashiers and products
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Coffee']);
    $productA = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 10]);
    $productB = Product::create(['category_id' => $category->id, 'name' => 'Croissant', 'price' => 15000, 'stock' => 10]);

    // Create a transaction
    $order = Order::create([
        'user_id' => $cashier->id,
        'customer_name' => 'John Doe',
        'subtotal' => 35000,
        'tax_amount' => 3500,
        'total_price' => 38500,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'reference_number' => 'REF-XYZ',
    ]);
    $order->items()->create(['product_id' => $productA->id, 'quantity' => 1, 'price' => 20000, 'subtotal' => 20000]);
    $order->items()->create(['product_id' => $productB->id, 'quantity' => 1, 'price' => 15000, 'subtotal' => 15000]);

    // Ensure the setting is empty initially
    expect(Setting::get('apriori_insights'))->toBeNull();

    // Run the Artisan command
    $this->artisan('pos:train-apriori')
        ->expectsOutput('Starting Apriori model training...')
        ->expectsOutput('Apriori model training completed and recommendations cached successfully.')
        ->assertExitCode(0);

    // Verify it is cached in settings
    $insights = Setting::get('apriori_insights');
    expect($insights)->not->toBeNull();

    // Check that we can hit the analytics page and it reads the cache
    $manager = User::factory()->create(['role' => 'manager']);
    $response = $this->actingAs($manager)->get(route('management.analytics.index'));
    $response->assertStatus(200);
});
