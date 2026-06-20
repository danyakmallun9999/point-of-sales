<?php

namespace Database\Seeders;

use App\Models\Outlet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $outlet = Outlet::first();
        if (! $outlet) {
            $outlet = Outlet::create([
                'name' => 'POSO Central',
                'address' => 'Jl. Teknologi No. 123, Indonesia',
            ]);
        }

        // Seed default Admin
        User::updateOrCreate(
            ['email' => 'posoadmin@gmail.com'],
            [
                'name' => 'Admin POSO',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'outlet_id' => $outlet->id,
            ]
        );

        // Seed default Manager
        User::updateOrCreate(
            ['email' => 'posomanager@gmail.com'],
            [
                'name' => 'Manager POSO',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'outlet_id' => $outlet->id,
            ]
        );

        // Seed default Cashier
        User::updateOrCreate(
            ['email' => 'posokasir@gmail.com'],
            [
                'name' => 'Cashier POSO',
                'password' => Hash::make('password'),
                'role' => 'cashier',
                'outlet_id' => $outlet->id,
            ]
        );
    }
}
