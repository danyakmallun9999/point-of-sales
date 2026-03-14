<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class POSController extends Controller
{
    /**
     * Display the POS terminal.
     */
    public function index(): Response
    {
        return Inertia::render('POS/Terminal', [
            'products' => Product::with('category')->get(),
            'categories' => Category::all(),
        ]);
    }

    /**
     * Store a new order.
     */
    public function store(StoreOrderRequest $request): RedirectResponse
    {
        return DB::transaction(function () use ($request) {
            $validated = $request->validated();

            $totalPrice = 0;
            $orderItemsData = [];

            // Check stock first for all items
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                $itemPrice = (float) $product->price;
                $subtotalItem = $itemPrice * $item['quantity'];
                $totalPrice += $subtotalItem;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $itemPrice,
                    'subtotal' => $subtotalItem,
                ];
            }
            // If all stock checks pass, proceed
            $subtotal = $totalPrice;
            $discountAmount = $validated['discount_amount'] ?? 0;
            $taxAmount = ($subtotal - $discountAmount) * 0.1; // 10% TAX
            $finalTotal = $subtotal - $discountAmount + $taxAmount;

            $order = Order::create([
                'user_id' => $request->user()->id,
                'customer_name' => $validated['customer_name'] ?? null,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'total_price' => $finalTotal,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === 'cash' ? 'paid' : 'pending',
                'notes' => $validated['notes'] ?? null,
                'reference_number' => 'POS-'.now()->format('YmdHis').'-'.strtoupper(bin2hex(random_bytes(2))),
                'created_at' => $request->input('created_at', now()),
            ]);

            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);
                // Deduct stock after order item creation
                Product::where('id', $itemData['product_id'])->decrement('stock', $itemData['quantity']);
            }

            return back()->with('order', $order->load('items.product'));
        });
    }
}
