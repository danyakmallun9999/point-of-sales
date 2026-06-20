<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

test('admin can view products index', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('management.products.index'));

    $response->assertOk();
});

test('manager can view products index', function () {
    $manager = User::factory()->create(['role' => 'manager']);

    $response = $this->actingAs($manager)->get(route('management.products.index'));

    $response->assertOk();
});

test('cashier cannot view products index', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    $response = $this->actingAs($cashier)->get(route('management.products.index'));

    $response->assertForbidden();
});

test('guest is redirected to login from products', function () {
    $response = $this->get(route('management.products.index'));

    $response->assertRedirect(route('login'));
});

test('admin can create a product', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Coffee']);

    $response = $this->actingAs($admin)->post(route('management.products.store'), [
        'category_id' => $category->id,
        'name' => 'Espresso',
        'description' => 'Strong coffee',
        'price' => 20000,
        'stock' => 10,
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('products', ['name' => 'Espresso', 'price' => 20000]);
});

test('creating product with stock creates inventory batch', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Coffee']);

    $this->actingAs($admin)->post(route('management.products.store'), [
        'category_id' => $category->id,
        'name' => 'Espresso',
        'price' => 20000,
        'stock' => 15,
    ]);

    $product = Product::where('name', 'Espresso')->first();
    $this->assertDatabaseHas('inventory_batches', [
        'product_id' => $product->id,
        'initial_quantity' => 15,
        'remaining_quantity' => 15,
    ]);
});

test('product store validates required fields', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('management.products.store'), []);

    $response->assertSessionHasErrors(['category_id', 'name', 'price', 'stock']);
});

test('product store validates category exists', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('management.products.store'), [
        'category_id' => 999,
        'name' => 'Espresso',
        'price' => 20000,
        'stock' => 10,
    ]);

    $response->assertSessionHasErrors('category_id');
});

test('admin can update a product', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 10]);

    $response = $this->actingAs($admin)->patch(route('management.products.update', $product), [
        'name' => 'Double Espresso',
        'price' => 25000,
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('products', ['name' => 'Double Espresso', 'price' => 25000]);
});

test('admin can delete a product without orders', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 10]);

    $response = $this->actingAs($admin)->delete(route('management.products.destroy', $product));

    $response->assertStatus(302);
    $this->assertDatabaseMissing('products', ['name' => 'Espresso']);
});

test('cannot delete product that has been ordered', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Coffee']);
    $product = Product::create(['category_id' => $category->id, 'name' => 'Espresso', 'price' => 20000, 'stock' => 10]);

    $user = User::factory()->create();
    $order = Order::factory()->cash()->create(['user_id' => $user->id]);
    OrderItem::create(['order_id' => $order->id, 'product_id' => $product->id, 'quantity' => 1, 'price' => 20000, 'subtotal' => 20000]);

    $response = $this->actingAs($admin)->delete(route('management.products.destroy', $product));

    $response->assertStatus(302);
    $this->assertDatabaseHas('products', ['name' => 'Espresso']);
});

test('cashier cannot create a product', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create(['name' => 'Coffee']);

    $response = $this->actingAs($cashier)->post(route('management.products.store'), [
        'category_id' => $category->id,
        'name' => 'Espresso',
        'price' => 20000,
        'stock' => 10,
    ]);

    $response->assertForbidden();
});
