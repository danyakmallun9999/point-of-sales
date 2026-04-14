<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryBatch extends Model
{
    protected $fillable = [
        'product_id',
        'initial_quantity',
        'remaining_quantity',
        'buy_price',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'initial_quantity' => 'integer',
            'remaining_quantity' => 'integer',
            'buy_price' => 'float',
        ];
    }

    /**
     * Get the product that owns the batch.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Product, \App\Models\InventoryBatch>
     */
    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
