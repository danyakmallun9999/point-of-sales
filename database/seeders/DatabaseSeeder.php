<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed default outlet
        $outlet = \App\Models\Outlet::create([
            'name' => 'POSO Central',
            'address' => 'Jl. Teknologi No. 123, Indonesia',
        ]);

        // Seed Users linked to default outlet
        $this->call(UserSeeder::class);

        // Seed default settings
        \App\Models\Setting::create(['key' => 'tax_rate', 'value' => '0.1']);
        \App\Models\Setting::create(['key' => 'receipt_header', 'value' => 'POSO']);
        \App\Models\Setting::create(['key' => 'receipt_footer', 'value' => 'Jl. Teknologi No. 123, Indonesia']);

        // Seed Categories
        $coffee = Category::create(['name' => 'Coffee']);
        $nonCoffee = Category::create(['name' => 'Non-Coffee']);
        $food = Category::create(['name' => 'Food']);

        // Seed Products & Inventory Batches
        $p1 = Product::create([
            'category_id' => $coffee->id,
            'name' => 'Espresso',
            'description' => 'Pure and intense coffee hit.',
            'price' => 20000,
            'stock' => 100,
        ]);
        \App\Models\InventoryBatch::create([
            'product_id' => $p1->id,
            'initial_quantity' => 100,
            'remaining_quantity' => 100,
            'buy_price' => 10000,
            'outlet_id' => $outlet->id,
        ]);

        $p2 = Product::create([
            'category_id' => $coffee->id,
            'name' => 'Caffe Latte',
            'description' => 'Espresso with steamed milk.',
            'price' => 28000,
            'stock' => 100,
        ]);
        \App\Models\InventoryBatch::create([
            'product_id' => $p2->id,
            'initial_quantity' => 100,
            'remaining_quantity' => 100,
            'buy_price' => 12000,
            'outlet_id' => $outlet->id,
        ]);

        $p3 = Product::create([
            'category_id' => $nonCoffee->id,
            'name' => 'Matcha Latte',
            'description' => 'Premium Japanese green tea with milk.',
            'price' => 32000,
            'stock' => 50,
        ]);
        \App\Models\InventoryBatch::create([
            'product_id' => $p3->id,
            'initial_quantity' => 50,
            'remaining_quantity' => 50,
            'buy_price' => 15000,
            'outlet_id' => $outlet->id,
        ]);

        $p4 = Product::create([
            'category_id' => $food->id,
            'name' => 'Croissant',
            'description' => 'Buttery and flaky French pastry.',
            'price' => 25000,
            'stock' => 20,
        ]);
        \App\Models\InventoryBatch::create([
            'product_id' => $p4->id,
            'initial_quantity' => 20,
            'remaining_quantity' => 20,
            'buy_price' => 10000,
            'outlet_id' => $outlet->id,
        ]);
    }
}
