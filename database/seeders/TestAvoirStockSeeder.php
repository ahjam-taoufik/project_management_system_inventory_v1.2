<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Avoir;
use App\Models\AvoirProduct;
use App\Models\Client;
use App\Models\Commercial;
use App\Models\Product;
use App\Models\Stock;

class TestAvoirStockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer les données nécessaires
        $client = Client::first();
        $commercial = Commercial::first();
        $product = Product::first();

        if (!$client || !$commercial || !$product) {
            $this->command->error('Données manquantes pour créer un avoir de test');
            return;
        }

        // Créer ou mettre à jour le stock initial
        $stock = Stock::where('product_id', $product->id)->first();
        if (!$stock) {
            $stock = Stock::create([
                'product_id' => $product->id,
                'stock_disponible' => 100,
                'quantite_totale_entree' => 100,
                'quantite_totale_sortie' => 0,
                'stock_minimum' => 10,
                'stock_maximum' => 1000,
                'valeur_stock' => 1000,
            ]);
        } else {
            $stock->update(['stock_disponible' => 100, 'quantite_totale_entree' => 100]);
        }

        $this->command->info("Stock initial créé: {$stock->stock_disponible}");

        // Créer un avoir validé
        $avoir = Avoir::create([
            'numero_avoir' => 'AV2508001',
            'date_avoir' => '2025-08-12',
            'client_id' => $client->id,
            'commercial_id' => $commercial->id,
            'statut' => 'valide',
            'montant_total' => 100,
            'poids_total' => 10,
        ]);

        // Créer une ligne de produit
        AvoirProduct::create([
            'avoir_id' => $avoir->id,
            'product_id' => $product->id,
            'quantite_retournee' => 5,
            'prix_unitaire' => 20,
            'prix_original' => 20,
            'prix_personnalise' => false,
            'montant_ligne' => 100,
        ]);

        // Vérifier le stock avant suppression
        $stockAvant = $stock->fresh()->stock_disponible;
        $this->command->info("Avoir de test créé avec ID: {$avoir->id}");
        $this->command->info("Stock avant suppression: {$stockAvant}");

        // Supprimer l'avoir
        $avoir->delete();

        // Vérifier le stock après
        $stockApres = $stock->fresh()->stock_disponible;
        $this->command->info("Stock après suppression: {$stockApres}");
        $this->command->info("Différence: " . ($stockApres - $stockAvant));

        if ($stockApres < $stockAvant) {
            $this->command->info("✅ SUCCÈS: Le stock a été diminué lors de la suppression de l'avoir validé");
        } else {
            $this->command->error("❌ ÉCHEC: Le stock n'a pas été modifié lors de la suppression");
        }
    }
}
