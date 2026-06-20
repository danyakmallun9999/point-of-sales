<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price',
        'stock',
        'image',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'float',
            'stock' => 'integer',
        ];
    }

    /**
     * Get the category that owns the product.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Category, \App\Models\Product>
     */
    public function category(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the order items for the product.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\OrderItem>
     */
    public function orderItems(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the inventory batches for the product.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\InventoryBatch>
     */
    public function inventoryBatches(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(InventoryBatch::class);
    }

    /**
     * Deduct stock using FEFO (First Expired, First Out) algorithm.
     */
    public function deductStockFIFO(int $quantity, ?int $outletId = null): void
    {
        $remainingToDeduct = $quantity;

        // Fetch remaining batches ordered by expiration date (earliest first, nulls last)
        $query = $this->inventoryBatches()
            ->where('remaining_quantity', '>', 0)
            ->orderByRaw('CASE WHEN expired_at IS NULL THEN 1 ELSE 0 END ASC')
            ->orderBy('expired_at', 'asc')
            ->orderBy('created_at', 'asc');

        if ($outletId !== null) {
            $query->where('outlet_id', $outletId);
        }

        $batches = $query->lockForUpdate()->get();

        foreach ($batches as $batch) {
            if ($remainingToDeduct <= 0) {
                break;
            }

            if ($batch->remaining_quantity >= $remainingToDeduct) {
                $batch->remaining_quantity -= $remainingToDeduct;
                $batch->save();
                $remainingToDeduct = 0;
            } else {
                $remainingToDeduct -= $batch->remaining_quantity;
                $batch->remaining_quantity = 0;
                $batch->save();
            }
        }

        // Deduct the general stock aggregate
        $this->decrement('stock', $quantity);
    }
}
