<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryBatch extends Model
{
    /** @use HasFactory<\Database\Factories\InventoryBatchFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'initial_quantity',
        'remaining_quantity',
        'buy_price',
        'outlet_id',
        'expired_at',
    ];

    public function outlet(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

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
            'expired_at' => 'date',
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
