<?php

use App\Models\User;

test('admin can view users index', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('management.users.index'));

    $response->assertOk();
});

test('manager cannot view users index', function () {
    $manager = User::factory()->create(['role' => 'manager']);

    $response = $this->actingAs($manager)->get(route('management.users.index'));

    $response->assertForbidden();
});

test('cashier cannot view users index', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    $response = $this->actingAs($cashier)->get(route('management.users.index'));

    $response->assertForbidden();
});

test('guest is redirected to login from users', function () {
    $response = $this->get(route('management.users.index'));

    $response->assertRedirect(route('login'));
});

test('admin can create a user', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('management.users.store'), [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'role' => 'cashier',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('users', ['name' => 'New User', 'email' => 'newuser@example.com', 'role' => 'cashier']);
});

test('user store validates unique email', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    User::factory()->create(['email' => 'taken@example.com']);

    $response = $this->actingAs($admin)->post(route('management.users.store'), [
        'name' => 'New User',
        'email' => 'taken@example.com',
        'role' => 'cashier',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
});

test('user store validates required fields', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('management.users.store'), []);

    $response->assertSessionHasErrors(['name', 'email', 'role', 'password']);
});

test('user store validates password confirmation', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('management.users.store'), [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'role' => 'cashier',
        'password' => 'password123',
        'password_confirmation' => 'different',
    ]);

    $response->assertSessionHasErrors('password');
});

test('user store validates role values', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('management.users.store'), [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'role' => 'invalid-role',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors('role');
});

test('admin can update a user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['name' => 'Old Name', 'role' => 'cashier']);

    $response = $this->actingAs($admin)->patch(route('management.users.update', $user), [
        'name' => 'New Name',
        'role' => 'manager',
    ]);

    $response->assertStatus(302);
    $this->assertDatabaseHas('users', ['name' => 'New Name', 'role' => 'manager']);
});

test('admin can delete another user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'cashier']);

    $response = $this->actingAs($admin)->delete(route('management.users.destroy', $user));

    $response->assertStatus(302);
    expect($user->fresh())->toBeNull();
});

test('admin cannot delete themselves', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->delete(route('management.users.destroy', $admin));

    $response->assertStatus(302);
    expect($admin->fresh())->not->toBeNull();
});

test('manager cannot create a user', function () {
    $manager = User::factory()->create(['role' => 'manager']);

    $response = $this->actingAs($manager)->post(route('management.users.store'), [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'role' => 'cashier',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertForbidden();
});
