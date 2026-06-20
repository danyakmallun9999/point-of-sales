<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'customer_name' => fake()->name(),
            'subtotal' => 0,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'total_price' => 0,
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'reference_number' => 'POS-'.fake()->numerify('##########').'-'.fake()->numerify('####'),
            'notes' => null,
        ];
    }

    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'cash',
            'payment_status' => 'paid',
        ]);
    }

    public function qris(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'qris',
            'payment_status' => 'pending',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'pending',
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'failed',
        ]);
    }

    public function withTotals(float $subtotal, float $discount = 0, float $tax = 0): static
    {
        return $this->state(fn (array $attributes) => [
            'subtotal' => $subtotal,
            'discount_amount' => $discount,
            'tax_amount' => $tax,
            'total_price' => $subtotal - $discount + $tax,
        ]);
    }
}
