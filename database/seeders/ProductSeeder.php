<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $coffee = \App\Models\Category::where('name', 'Coffee')->first();
        \App\Models\Product::create([
            'category_id' => $coffee->id,
            'name' => 'Espresso',
            'description' => 'Rich and bold double shot espresso',
            'price' => 20000,
            'stock' => 100,
        ]);
        \App\Models\Product::create([
            'category_id' => $coffee->id,
            'name' => 'Cafe Latte',
            'description' => 'Smooth espresso mixed with steamed milk',
            'price' => 30000,
            'stock' => 100,
        ]);
        \App\Models\Product::create([
            'category_id' => $coffee->id,
            'name' => 'Cappuccino',
            'description' => 'Espresso with balanced milk and dense foam',
            'price' => 28000,
            'stock' => 100,
        ]);
    }
}
