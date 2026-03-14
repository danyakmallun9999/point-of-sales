<?php

namespace App\Http\Controllers;

use App\Http\Requests\Settings\StoreProductRequest;
use App\Http\Requests\Settings\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     */
    public function index(): Response
    {
        return inertia('management/products/index', [
            'products' => Product::with('category')->latest()->get(),
            'categories' => Category::all(),
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $validated['image'] = Storage::disk('public')->url($request->file('image')->store('products', 'public'));
        }

        Product::create($validated);

        return back()->with('message', 'Product created successfully.');
    }

    /**
     * Update the specified product in storage.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                $oldPath = str_replace(Storage::disk('public')->url(''), '', $product->image);
                Storage::disk('public')->delete($oldPath);
            }
            $validated['image'] = Storage::disk('public')->url($request->file('image')->store('products', 'public'));
        }

        $product->update($validated);

        return back()->with('message', 'Product updated successfully.');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        // Check if product has been ordered
        if ($product->orderItems()->exists()) {
            return back()->withErrors(['message' => 'Cannot delete product that has already been ordered. Try marking it as inactive instead.']);
        }

        if ($product->image) {
            $oldPath = str_replace(Storage::disk('public')->url(''), '', $product->image);
            Storage::disk('public')->delete($oldPath);
        }

        $product->delete();

        return back()->with('message', 'Product deleted successfully.');
    }
}
