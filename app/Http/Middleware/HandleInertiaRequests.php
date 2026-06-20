<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = [];
        try {
            if (\Schema::hasTable('settings')) {
                $settings = \App\Models\Setting::pluck('value', 'key')->toArray();
            }
        } catch (\Throwable $e) {
            // Table might not exist yet
        }

        $outlets = [];
        try {
            if (\Schema::hasTable('outlets')) {
                $outlets = \App\Models\Outlet::all()->toArray();
            }
        } catch (\Throwable $e) {
            // Table might not exist yet
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'outlet' => $request->user()->outlet ? $request->user()->outlet->toArray() : null,
                    'active_shift' => \App\Models\CashierShift::where('user_id', $request->user()->id)
                        ->where('status', 'open')
                        ->first(),
                ]) : null,
            ],
            'settings' => $settings,
            'outlets' => $outlets,
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'order' => fn () => $request->session()->get('order'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
