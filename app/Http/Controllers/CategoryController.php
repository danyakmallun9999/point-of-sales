<?php

namespace App\Http\Controllers;

use App\Http\Requests\Settings\StoreCategoryRequest;
use App\Http\Requests\Settings\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index(): Response
    {
        return inertia('management/categories/index', [
            'categories' => Category::withCount('products')->get(),
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::create($request->validated());

        return back()->with('message', 'Category created successfully.');
    }

    /**
     * Update the specified category in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        return back()->with('message', 'Category updated successfully.');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            return back()->withErrors(['message' => 'Cannot delete category with associated products.']);
        }

        $category->delete();

        return back()->with('message', 'Category deleted successfully.');
    }
}
