<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Category::create(['name' => 'Coffee', 'description' => 'Hot and cold coffee drinks']);
        \App\Models\Category::create(['name' => 'Non-Coffee', 'description' => 'Tea, chocolate, and others']);
        \App\Models\Category::create(['name' => 'Food', 'description' => 'Snacks and heavy meals']);
    }
}
