<?php

namespace App\Console\Commands;

use App\Models\Setting;
use App\Services\AprioriService;
use Illuminate\Console\Command;

class TrainAprioriModel extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pos:train-apriori';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Train the Apriori association rules model using paid orders history and cache the results.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting Apriori model training...');

        $aprioriService = new AprioriService;

        // Train model (Support 5%, Confidence 30%)
        $insights = $aprioriService->generateRecommendations(0.05, 0.3);

        // Cache results in settings
        Setting::set('apriori_insights', json_encode($insights));

        $this->info('Apriori model training completed and recommendations cached successfully.');

        return Command::SUCCESS;
    }
}
