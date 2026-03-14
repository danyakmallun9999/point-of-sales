<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Users
        User::create([
            'name' => 'Admin Brew',
            'email' => 'admin@brew.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Manager Brew',
            'email' => 'manager@brew.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
        ]);

        User::create([
            'name' => 'Cashier Brew',
            'email' => 'cashier@brew.com',
            'password' => Hash::make('password'),
            'role' => 'cashier',
        ]);

        // Seed Categories
        $coffee = Category::create(['name' => 'Coffee']);
        $nonCoffee = Category::create(['name' => 'Non-Coffee']);
        $food = Category::create(['name' => 'Food']);

        // Seed Products
        Product::create([
            'category_id' => $coffee->id,
            'name' => 'Espresso',
            'description' => 'Pure and intense coffee hit.',
            'price' => 20000,
            'stock' => 100,
        ]);

        Product::create([
            'category_id' => $coffee->id,
            'name' => 'Caffe Latte',
            'description' => 'Espresso with steamed milk.',
            'price' => 28000,
            'stock' => 100,
        ]);

        Product::create([
            'category_id' => $nonCoffee->id,
            'name' => 'Matcha Latte',
            'description' => 'Premium Japanese green tea with milk.',
            'price' => 32000,
            'stock' => 50,
        ]);

        Product::create([
            'category_id' => $food->id,
            'name' => 'Croissant',
            'description' => 'Buttery and flaky French pastry.',
            'price' => 25000,
            'stock' => 20,
        ]);
    }
}
