<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingController extends Controller
{
    /**
     * Display the system settings.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('management/settings/index', [
            'settings' => Setting::pluck('value', 'key')->toArray(),
            'outlets' => Outlet::all(),
        ]);
    }

    /**
     * Update the system settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tax_rate' => 'required|numeric|min:0|max:1',
            'receipt_header' => 'required|string|max:255',
            'receipt_footer' => 'required|string|max:255',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, (string) $value);
        }

        return back()->with('message', 'System settings updated successfully.');
    }

    /**
     * Store a new outlet.
     */
    public function storeOutlet(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        Outlet::create($validated);

        return back()->with('message', 'Outlet created successfully.');
    }
}
