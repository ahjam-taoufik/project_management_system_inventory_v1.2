<?php

namespace App\Console\Commands;

use App\Models\Sortie;
use Illuminate\Console\Command;

class ListSorties extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'list:sorties';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all sorties';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sorties = Sortie::all(['id', 'numero_bl', 'total_general', 'montant_total_final']);

        if ($sorties->isEmpty()) {
            $this->info("Aucune sortie trouvée");
            return 0;
        }

        $this->info("Sorties existantes:");
        $this->table(['ID', 'Numéro BL', 'Total Général', 'Montant Total Final'],
            $sorties->map(function($sortie) {
                return [
                    $sortie->id,
                    $sortie->numero_bl,
                    $sortie->total_general,
                    $sortie->montant_total_final,
                ];
            })->toArray()
        );

        return 0;
    }
}
