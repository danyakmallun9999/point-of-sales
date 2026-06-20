<?php

use App\Models\User;

test('admin satisfies isAdmin check', function () {
    $user = User::factory()->create(['role' => 'admin']);

    expect($user->isAdmin())->toBeTrue();
});

test('admin satisfies isManager check', function () {
    $user = User::factory()->create(['role' => 'admin']);

    expect($user->isManager())->toBeTrue();
});

test('admin satisfies isCashier check', function () {
    $user = User::factory()->create(['role' => 'admin']);

    expect($user->isCashier())->toBeTrue();
});

test('manager satisfies isManager check', function () {
    $user = User::factory()->create(['role' => 'manager']);

    expect($user->isManager())->toBeTrue();
});

test('manager satisfies isCashier check', function () {
    $user = User::factory()->create(['role' => 'manager']);

    expect($user->isCashier())->toBeTrue();
});

test('manager does not satisfy isAdmin', function () {
    $user = User::factory()->create(['role' => 'manager']);

    expect($user->isAdmin())->toBeFalse();
});

test('cashier satisfies isCashier check', function () {
    $user = User::factory()->create(['role' => 'cashier']);

    expect($user->isCashier())->toBeTrue();
});

test('cashier does not satisfy isManager or isAdmin', function () {
    $user = User::factory()->create(['role' => 'cashier']);

    expect($user->isManager())->toBeFalse();
    expect($user->isAdmin())->toBeFalse();
});
