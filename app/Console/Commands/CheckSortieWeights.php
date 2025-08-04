<?php

namespace App\Console\Commands;

use App\Models\Sortie;
use App\Models\Product;
use Illuminate\Console\Command;

class CheckSortieWeights extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:sortie-weights {sortie_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check weights for sorties and products';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sortieId = $this->argument('sortie_id');

        if ($sortieId) {
            $this->checkSpecificSortie($sortieId);
        } else {
            $this->checkAllSorties();
        }

        return 0;
    }

    private function checkSpecificSortie($sortieId)
    {
        $sortie = Sortie::with('products.product')->find($sortieId);

        if (!$sortie) {
            $this->error("Sortie with ID {$sortieId} not found");
            return;
        }

        $this->info("=== Vérification de la Sortie #{$sortie->numero_bl} ===");

        // Afficher les informations de la sortie
        $this->info("Total poids stocké: {$sortie->total_poids} kg");

        // Afficher les produits
        $this->info("\nProduits de la sortie:");
        $this->table(
            ['Ref', 'Nom', 'Quantité', 'Poids Unit.', 'Poids Total Ligne', 'Poids Calc.'],
            $sortie->products->map(function($sortieProduct) {
                $product = $sortieProduct->product;
                $calculatedWeight = $sortieProduct->quantite_produit * ($product->product_Poids ?? 0);

                return [
                    $product->product_Ref ?? 'N/A',
                    $product->product_libelle ?? 'N/A',
                    $sortieProduct->quantite_produit,
                    ($product->product_Poids ?? 0) . ' kg',
                    $sortieProduct->poids_produit . ' kg',
                    $calculatedWeight . ' kg',
                ];
            })->toArray()
        );

        // Calculer le total poids manuellement
        $manualTotalWeight = $sortie->products->sum('poids_produit');
        $this->info("Total poids calculé manuellement: {$manualTotalWeight} kg");

        if ($manualTotalWeight != $sortie->total_poids) {
            $this->error("❌ INCOHÉRENCE: Le total poids stocké ({$sortie->total_poids}) ne correspond pas au calcul manuel ({$manualTotalWeight})");
        } else {
            $this->info("✅ Le total poids est cohérent");
        }
    }

    private function checkAllSorties()
    {
        $sorties = Sortie::with('products.product')->get();

        if ($sorties->isEmpty()) {
            $this->info("Aucune sortie trouvée");
            return;
        }

        $this->info("=== Vérification de toutes les sorties ===");

        $inconsistentSorties = [];

        foreach ($sorties as $sortie) {
            $manualTotalWeight = $sortie->products->sum('poids_produit');

            if (abs($manualTotalWeight - $sortie->total_poids) > 0.01) {
                $inconsistentSorties[] = [
                    $sortie->id,
                    $sortie->numero_bl,
                    $sortie->total_poids,
                    $manualTotalWeight,
                    $sortie->products->count(),
                ];
            }
        }

        if (empty($inconsistentSorties)) {
            $this->info("✅ Toutes les sorties ont des poids cohérents");
        } else {
            $this->error("❌ Sorties avec des poids incohérents:");
            $this->table(
                ['ID', 'Numéro BL', 'Poids Stocké', 'Poids Calculé', 'Nb Produits'],
                $inconsistentSorties
            );
        }

        // Vérifier les produits sans poids
        $productsWithoutWeight = Product::whereNull('product_Poids')
            ->orWhere('product_Poids', 0)
            ->get(['id', 'product_Ref', 'product_libelle', 'product_Poids']);

        if ($productsWithoutWeight->isNotEmpty()) {
            $this->warn("⚠️ Produits sans poids défini:");
            $this->table(
                ['ID', 'Référence', 'Nom', 'Poids'],
                $productsWithoutWeight->map(function($product) {
                    return [
                        $product->id,
                        $product->product_Ref,
                        $product->product_libelle,
                        $product->product_Poids ?? 'NULL'
                    ];
                })->toArray()
            );
        }
    }
}
