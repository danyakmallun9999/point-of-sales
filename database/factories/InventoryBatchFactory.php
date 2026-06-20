<?php

namespace Database\Factories;

use App\Models\InventoryBatch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InventoryBatch>
 */
class InventoryBatchFactory extends Factory
{
    protected $model = InventoryBatch::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(10, 100);

        return [
            'product_id' => \App\Models\Product::factory(),
            'initial_quantity' => $quantity,
            'remaining_quantity' => $quantity,
            'buy_price' => fake()->randomFloat(2, 3000, 50000),
        ];
    }

    public function exhausted(): static
    {
        return $this->state(fn (array $attributes) => [
            'remaining_quantity' => 0,
        ]);
    }

    public function withQuantity(int $initial, ?int $remaining = null): static
    {
        return $this->state(fn (array $attributes) => [
            'initial_quantity' => $initial,
            'remaining_quantity' => $remaining ?? $initial,
        ]);
    }
}
