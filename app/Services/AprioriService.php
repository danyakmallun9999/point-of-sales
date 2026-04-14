<?php

namespace App\Services;

use App\Models\Order;
use Phpml\Association\Apriori;

class AprioriService
{
    /**
     * Generate Market Basket Analysis rules from paid orders.
     */
    public function generateRecommendations(float $minSupport = 0.1, float $minConfidence = 0.5): array
    {
        // 1. Ambil transaksi yang sudah 'paid' beserta itemnya
        $orders = Order::where('payment_status', 'paid')
            ->with(['items.product:id,name'])
            ->get();

        if ($orders->isEmpty()) {
            return [];
        }

        // 2. Siapkan array of arrays (setiap row adalah list nama item dalam satu struk)
        $samples = [];
        foreach ($orders as $order) {
            $transaction = [];
            foreach ($order->items as $item) {
                if ($item->product) {
                    $transaction[] = $item->product->name;
                }
            }
            // Pastikan item unik per transaksi, karena support berdasar keberadaan item dalam struk
            $transaction = array_unique($transaction);
            if (! empty($transaction)) {
                $samples[] = array_values($transaction);
            }
        }

        if (empty($samples)) {
            return [];
        }

        // 3. Eksekusi Apriori via PHP-ML
        $associator = new Apriori($minSupport, $minConfidence);
        $associator->train($samples, []);

        // 4. Ambil aturan/rules
        $rules = $associator->getRules();

        $formattedRules = [];
        foreach ($rules as $rule) {
            $formattedRules[] = [
                'antecedent' => implode(', ', $rule['antecedent']),
                'consequent' => implode(', ', $rule['consequent']),
                'support' => round($rule['support'], 4),
                'confidence' => round($rule['confidence'], 4),
            ];
        }

        // Urutkan berdasarkan confidence tertinggi
        usort($formattedRules, function ($a, $b) {
            return $b['confidence'] <=> $a['confidence'];
        });

        // Ambil 5 teratas
        return array_slice($formattedRules, 0, 5);
    }
}
