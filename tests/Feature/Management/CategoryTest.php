<?php

use App\Models\Category;
use App\Models\User;

test('admin can view categories index', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Category::create(['name' => 'Coffee']);

    $response = $this->actingAs($admin)->get(route('management.categories.index'));

    $response->assertOk();
});

test('manager can view categories index', function () {
    $manager = User::factory()->create(['role' => 'manager']);

    $response = $this->actingAs($manager)->get(route('management.categories.index'));

    $response->assertOk();
});

test('cashier cannot view categories index', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    $response = $this->actingAs($cashier)->get(route('management.categories.index'));

    $response->assertForbidden();
});

test('guest is redirected to login from categories', function () {
    $response = $this->get(route('management.categories.index'));

    $response->assertRedirect(route('login'));
});

test('admin can create a category', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('management.categories.store'), [
        'name' => 'Coffee',
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('categories', ['name' => 'Coffee']);
});

test('category name must be unique', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Category::create(['name' => 'Coffee']);

    $response = $this->actingAs($admin)->post(route('management.categories.store'), [
        'name' => 'Coffee',
    ]);

    $response->assertSessionHasErrors('name');
});

test('category store validates required name', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('management.categories.store'), []);

    $response->assertSessionHasErrors('name');
});

test('admin can update a category', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Coffee']);

    $response = $this->actingAs($admin)->patch(route('management.categories.update', $category), [
        'name' => 'Hot Drinks',
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('categories', ['name' => 'Hot Drinks']);
});

test('admin can delete a category without products', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Coffee']);

    $response = $this->actingAs($admin)->delete(route('management.categories.destroy', $category));

    $response->assertStatus(302);
    $this->assertDatabaseMissing('categories', ['name' => 'Coffee']);
});

test('cannot delete category that has products', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = Category::create(['name' => 'Coffee']);
    $category->products()->create(['name' => 'Espresso', 'price' => 20000, 'stock' => 10]);

    $response = $this->actingAs($admin)->delete(route('management.categories.destroy', $category));

    $response->assertStatus(302);
    $this->assertDatabaseHas('categories', ['name' => 'Coffee']);
});

test('manager can create a category', function () {
    $manager = User::factory()->create(['role' => 'manager']);

    $response = $this->actingAs($manager)->post(route('management.categories.store'), [
        'name' => 'Food',
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('categories', ['name' => 'Food']);
});

test('cashier cannot create a category', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    $response = $this->actingAs($cashier)->post(route('management.categories.store'), [
        'name' => 'Food',
    ]);

    $response->assertForbidden();
});
