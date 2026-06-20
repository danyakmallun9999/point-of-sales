<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\OrderItemFactory> */
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'subtotal',
    ];

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
