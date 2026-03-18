<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'order_id',
    'product_id',
    'quantity',
    'price',
    'subtotal',
])]
class OrderItem extends Model
{
    /**
     * Get the order that owns the item.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Order, \App\Models\OrderItem>
     */
    public function order(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product for the order item.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<\App\Models\Product, \App\Models\OrderItem>
     */
    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
