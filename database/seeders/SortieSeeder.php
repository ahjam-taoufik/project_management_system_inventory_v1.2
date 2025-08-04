<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Sortie;
use App\Models\SortieProduct;
use App\Models\Commercial;
use App\Models\Client;
use App\Models\Product;
use Carbon\Carbon;

class SortieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer des données existantes
        $commerciaux = Commercial::all();
        $clients = Client::all();
        $products = Product::where('product_isActive', true)->get();

        if ($commerciaux->isEmpty() || $clients->isEmpty() || $products->isEmpty()) {
            $this->command->warn('Veuillez d\'abord exécuter les seeders pour commerciaux, clients et produits');
            return;
        }

        // Récupérer les livreurs existants ou créer des livreurs de test
        $livreurs = \App\Models\Livreur::all();

        if ($livreurs->isEmpty()) {
            // Créer des livreurs de test si aucun n'existe
            $livreurNoms = [
                'Ahmed Benali',
                'Mohamed Alami',
                'Youssef Tazi',
                'Hassan Idrissi',
                'Omar Benjelloun',
                'Khalid Fassi',
                'Rachid Berrada',
                'Abdelkader Lahlou'
            ];

            foreach ($livreurNoms as $nom) {
                \App\Models\Livreur::create([
                    'nom' => $nom,
                    'telephone' => '06' . rand(10000000, 99999999),
                ]);
            }
            $livreurs = \App\Models\Livreur::all();
        }

        // Créer 10 sorties de test (réduit pour éviter les problèmes de mémoire)
        for ($i = 1; $i <= 10; $i++) {
            $commercial = $commerciaux->random();
            // Filtrer les clients par commercial, sinon prendre un client aléatoire
            $clientsForCommercial = $clients->where('idCommercial', $commercial->id);
            $client = $clientsForCommercial->isNotEmpty() ? $clientsForCommercial->random() : $clients->random();

            // Générer un numéro BL unique
            $numeroBl = 'BL-S-' . time() . '-' . str_pad($i, 3, '0', STR_PAD_LEFT);

            $sortie = Sortie::create([
                'numero_bl' => $numeroBl,
                'commercial_id' => $commercial->id,
                'client_id' => $client->id,
                'date_bl' => Carbon::now()->subDays(rand(0, 30)),
                'livreur_id' => $livreurs->random()->id,
                'remise_speciale' => rand(0, 50),
                'remise_trimestrielle' => rand(0, 30),
                'valeur_ajoutee' => rand(-10, 20),
                'retour' => rand(0, 15),
                'remise_es' => rand(0, 1) ? 'Oui' : null,
                'client_gdg' => rand(0, 100) / 100,
                'total_general' => 0, // Sera calculé après
                'montant_total_final' => 0, // Sera calculé après
                'total_poids' => 0, // Sera calculé après
                'montant_remise_especes' => rand(0, 100),
                'total_bl' => 0, // Sera calculé après
            ]);

            // Ajouter 1 à 3 produits par sortie (réduit)
            $numberOfProducts = rand(1, 3);
            $selectedProducts = $products->random($numberOfProducts);
            $totalSortie = 0;
            $totalPoids = 0;

            foreach ($selectedProducts as $product) {
                $quantite = rand(1, 5);
                $prixVente = $product->prix_vente_colis ?? rand(50, 200);
                $poidsProduit = $product->poids_colis ?? rand(1, 10);
                $totalLigne = $prixVente * $quantite;
                $totalSortie += $totalLigne;
                $totalPoids += $poidsProduit * $quantite;

                SortieProduct::create([
                    'sortie_id' => $sortie->id,
                    'product_id' => $product->id,
                    'ref_produit' => $product->product_Ref,
                    'prix_produit' => $prixVente,
                    'quantite_produit' => $quantite,
                    'poids_produit' => $poidsProduit,
                    'total_ligne' => $totalLigne,
                ]);
            }

            // Calculer les totaux avec les remises
            $totalGeneral = $totalSortie;
            $montantTotalFinal = $totalGeneral - $sortie->remise_speciale - $sortie->remise_trimestrielle + $sortie->valeur_ajoutee - $sortie->retour;

            // Mettre à jour tous les totaux
            $sortie->update([
                'total_general' => $totalGeneral,
                'montant_total_final' => $montantTotalFinal,
                'total_poids' => $totalPoids,
                'total_bl' => $montantTotalFinal,
            ]);
        }

        $this->command->info('10 sorties créées avec succès');
    }
}
