<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashierShift extends Model
{
    protected $fillable = [
        'user_id',
        'outlet_id',
        'start_amount',
        'end_amount_expected',
        'end_amount_actual',
        'total_cash_sales',
        'total_qris_sales',
        'status',
        'opened_at',
        'closed_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'cashier_shift_id');
    }

    protected function casts(): array
    {
        return [
            'start_amount' => 'decimal:2',
            'end_amount_expected' => 'decimal:2',
            'end_amount_actual' => 'decimal:2',
            'total_cash_sales' => 'decimal:2',
            'total_qris_sales' => 'decimal:2',
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }
}
