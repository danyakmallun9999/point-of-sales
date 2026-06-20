<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

test('dashboard returns today revenue stat', function () {
    $user = User::factory()->create();
    Order::factory()->cash()->create([
        'user_id' => $user->id,
        'total_price' => 50000,
        'created_at' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('stats.today_revenue', 50000)
    );
});

test('dashboard returns today orders count', function () {
    $user = User::factory()->create();
    Order::factory()->cash()->create(['user_id' => $user->id, 'created_at' => now()]);
    Order::factory()->cash()->create(['user_id' => $user->id, 'created_at' => now()]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->where('stats.today_orders', 2)
    );
});

test('dashboard returns total products count', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Coffee']);
    Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 10]);
    Product::create(['category_id' => $category->id, 'name' => 'Latte', 'price' => 25000, 'stock' => 15]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->where('stats.total_products', 2)
    );
});

test('dashboard returns low stock alerts', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Coffee']);
    Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 5]);
    Product::create(['category_id' => $category->id, 'name' => 'Latte', 'price' => 25000, 'stock' => 50]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->where('stats.low_stock_alerts', 1)
    );
});

test('dashboard returns recent orders', function () {
    $user = User::factory()->create();
    Order::factory()->cash()->create(['user_id' => $user->id, 'created_at' => now()]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->has('recentOrders', 1)
    );
});

test('dashboard returns apriori insights', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->has('aprioriInsights')
    );
});
