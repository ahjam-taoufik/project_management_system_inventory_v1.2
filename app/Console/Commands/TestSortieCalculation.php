<?php

namespace App\Console\Commands;

use App\Models\Sortie;
use Illuminate\Console\Command;

class TestSortieCalculation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:sortie-calculation {sortie_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the calculateAllTotals method on a specific sortie';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sortieId = $this->argument('sortie_id');

        $sortie = Sortie::with('products')->find($sortieId);

        if (!$sortie) {
            $this->error("Sortie with ID {$sortieId} not found");
            return 1;
        }

        $this->info("Testing calculateAllTotals for Sortie #{$sortie->numero_bl}");

        // Afficher les totaux avant
        $this->info("Totaux AVANT:");
        $this->table(['Champ', 'Valeur'], [
            ['total_general', $sortie->total_general],
            ['montant_total_final', $sortie->montant_total_final],
            ['total_poids', $sortie->total_poids],
            ['montant_remise_especes', $sortie->montant_remise_especes],
            ['total_bl', $sortie->total_bl],
        ]);

        // Afficher les produits
        $this->info("Produits:");
        $products = $sortie->products->map(function($product) {
            return [
                $product->product->product_Ref,
                $product->quantite_produit,
                $product->prix_produit,
                $product->total_ligne,
                $product->poids_produit,
            ];
        })->toArray();

        $this->table(['Ref', 'Quantité', 'Prix', 'Total Ligne', 'Poids'], $products);

        // Appeler la méthode
        $sortie->calculateAllTotals();

        // Recharger les données
        $sortie->refresh();

        // Afficher les totaux après
        $this->info("Totaux APRÈS:");
        $this->table(['Champ', 'Valeur'], [
            ['total_general', $sortie->total_general],
            ['montant_total_final', $sortie->montant_total_final],
            ['total_poids', $sortie->total_poids],
            ['montant_remise_especes', $sortie->montant_remise_especes],
            ['total_bl', $sortie->total_bl],
        ]);

        $this->info("Test terminé!");

        return 0;
    }
}
