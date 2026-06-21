<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

if (! Features::enabled(Features::registration())) {
    Route::get('/register', fn () => abort(404))->name('register');
    Route::post('/register', fn () => abort(404))->name('register.store');
}

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // POS Routes
    Route::prefix('pos')->name('pos.')->middleware(['role:cashier,manager,admin'])->group(function () {
        Route::get('/', [App\Http\Controllers\POSController::class, 'index'])->name('terminal');
        Route::post('/orders', [App\Http\Controllers\POSController::class, 'store'])->name('orders.store');
        Route::get('/orders/{order}/status', [App\Http\Controllers\PaymentController::class, 'checkStatus'])->name('orders.status');
        Route::post('/orders/{order}/qris', [App\Http\Controllers\PaymentController::class, 'createQrisCharge'])->name('orders.qris');

        // Cashier Shift Routes
        Route::post('/shift/open', [App\Http\Controllers\POS\CashierShiftController::class, 'open'])->name('shift.open');
        Route::post('/shift/close', [App\Http\Controllers\POS\CashierShiftController::class, 'close'])->name('shift.close');
        Route::get('/shift/current-totals', [App\Http\Controllers\POS\CashierShiftController::class, 'currentTotals'])->name('shift.current-totals');
        Route::get('/shift/{shift}/print', [App\Http\Controllers\POS\CashierShiftController::class, 'printSummary'])->name('shift.print');
    });

    // Management Routes
    Route::prefix('management')->name('management.')->middleware(['role:manager,admin'])->group(function () {
        Route::resource('products', App\Http\Controllers\ProductController::class);
        Route::get('products/{product}/batches', [App\Http\Controllers\ProductBatchController::class, 'index'])->name('products.batches.index');
        Route::post('products/{product}/batches', [App\Http\Controllers\ProductBatchController::class, 'store'])->name('products.batches.store');
        Route::resource('categories', App\Http\Controllers\CategoryController::class);
        Route::resource('users', App\Http\Controllers\UserController::class)->middleware('role:admin');
        Route::get('analytics', [App\Http\Controllers\AnalyticsController::class, 'index'])->name('analytics.index');

        Route::get('reports', [App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/export', [App\Http\Controllers\ReportController::class, 'export'])->name('reports.export');
        Route::get('reports/print', [App\Http\Controllers\ReportController::class, 'printReport'])->name('reports.print');

        Route::get('settings', [App\Http\Controllers\Settings\SystemSettingController::class, 'index'])->name('settings.index');
        Route::post('settings', [App\Http\Controllers\Settings\SystemSettingController::class, 'update'])->name('settings.update');
        Route::post('settings/outlets', [App\Http\Controllers\Settings\SystemSettingController::class, 'storeOutlet'])->name('settings.outlets.store');
    });
});

Route::post('/webhooks/midtrans', [App\Http\Controllers\PaymentController::class, 'handleWebhook']);

require __DIR__.'/settings.php';
