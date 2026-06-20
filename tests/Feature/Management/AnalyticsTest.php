<?php

use App\Models\User;

test('admin can view analytics', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('management.analytics.index'));

    $response->assertOk();
});

test('manager can view analytics', function () {
    $manager = User::factory()->create(['role' => 'manager']);

    $response = $this->actingAs($manager)->get(route('management.analytics.index'));

    $response->assertOk();
});

test('cashier cannot view analytics', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    $response = $this->actingAs($cashier)->get(route('management.analytics.index'));

    $response->assertForbidden();
});

test('guest is redirected to login from analytics', function () {
    $response = $this->get(route('management.analytics.index'));

    $response->assertRedirect(route('login'));
});
