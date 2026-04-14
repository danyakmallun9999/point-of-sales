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
        $aprioriService = new AprioriService;
        // Menggunakan parameter lebih longgar (Support 5%, Confidence 30%)
        $aprioriInsights = $aprioriService->generateRecommendations(0.05, 0.3);

        return inertia('management/analytics/index', [
            'aprioriInsights' => $aprioriInsights,
        ]);
    }
}
