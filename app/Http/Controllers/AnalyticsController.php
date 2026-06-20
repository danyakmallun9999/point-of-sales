<?php

namespace App\Http\Controllers;

use App\Services\AprioriService;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Display the AI Analytics Dashboard.
     */
    public function index(): Response
    {
        $cached = \App\Models\Setting::get('apriori_insights');

        if ($cached !== null) {
            $aprioriInsights = json_decode($cached, true);
        } else {
            // Fallback: compute on-the-fly if cache is empty, then store it
            $aprioriService = new AprioriService;
            $aprioriInsights = $aprioriService->generateRecommendations(0.05, 0.3);
            \App\Models\Setting::set('apriori_insights', json_encode($aprioriInsights));
        }

        return inertia('management/analytics/index', [
            'aprioriInsights' => $aprioriInsights,
        ]);
    }
}
