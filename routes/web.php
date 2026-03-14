<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // POS Routes
    Route::prefix('pos')->name('pos.')->middleware(['role:cashier,manager,admin'])->group(function () {
        Route::get('/', [App\Http\Controllers\POSController::class, 'index'])->name('terminal');
        Route::post('/orders', [App\Http\Controllers\POSController::class, 'store'])->name('orders.store');
        Route::get('/orders/{order}/status', [App\Http\Controllers\PaymentController::class, 'checkStatus'])->name('orders.status');
        Route::post('/orders/{order}/qris', [App\Http\Controllers\PaymentController::class, 'createQrisCharge'])->name('orders.qris');
    });

    // Management Routes
    Route::prefix('management')->name('management.')->middleware(['role:manager,admin'])->group(function () {
        Route::resource('products', App\Http\Controllers\ProductController::class);
        Route::resource('categories', App\Http\Controllers\CategoryController::class);
        Route::resource('users', App\Http\Controllers\UserController::class)->middleware('role:admin');

        Route::get('reports', [App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/export', [App\Http\Controllers\ReportController::class, 'export'])->name('reports.export');
    });
});

Route::post('/webhooks/midtrans', [App\Http\Controllers\PaymentController::class, 'handleWebhook']);

require __DIR__.'/settings.php';
