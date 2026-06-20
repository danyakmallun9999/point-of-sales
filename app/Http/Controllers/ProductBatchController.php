<?php

namespace App\Http\Controllers;

use App\Models\InventoryBatch;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProductBatchController extends Controller
{
    /**
     * List all inventory batches for a product.
     */
    public function index(Product $product): JsonResponse
    {
        $batches = $product->inventoryBatches()
            ->with('outlet')
            ->orderByRaw('CASE WHEN expired_at IS NULL THEN 1 ELSE 0 END ASC')
            ->orderBy('expired_at', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($batches);
    }

    /**
     * Store a new inventory batch and update product stock.
     */
    public function store(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'outlet_id' => 'required|exists:outlets,id',
            'initial_quantity' => 'required|integer|min:1',
            'buy_price' => 'required|numeric|min:0',
            'expired_at' => 'nullable|date',
        ]);

        \DB::transaction(function () use ($product, $validated) {
            // Create the batch
            InventoryBatch::create([
                'product_id' => $product->id,
                'outlet_id' => $validated['outlet_id'],
                'initial_quantity' => $validated['initial_quantity'],
                'remaining_quantity' => $validated['initial_quantity'],
                'buy_price' => $validated['buy_price'],
                'expired_at' => $validated['expired_at'] ?: null,
            ]);

            // Increment the aggregate product stock
            $product->increment('stock', $validated['initial_quantity']);
        });

        return back()->with('message', 'Batch inventaris berhasil ditambahkan.');
    }
}
