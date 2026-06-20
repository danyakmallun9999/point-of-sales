<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'customer_name',
    'subtotal',
    'discount_amount',
    'tax_amount',
    'total_price',
    'payment_method',
    'payment_status',
    'reference_number',
    'notes',
    'created_at',
])]
class Order extends Model
{
    /**
     * Get the user who placed the order.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\User, \App\Models\Order>
     */
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items for the order.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\OrderItem>
     */
    public function items(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Mark the order as paid and deduct stock (for QRIS; cash already deducted at creation).
     */
    public function markAsPaid(): bool
    {
        if ($this->payment_status === 'paid') {
            return true;
        }

        $this->load('items.product');
        foreach ($this->items as $item) {
            if ($item->product) {
                $item->product->deductStockFIFO($item->quantity);
            }
        }

        return $this->update(['payment_status' => 'paid']);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_price' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }
}
