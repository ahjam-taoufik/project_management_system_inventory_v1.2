<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Sortie;
use App\Models\SortieProduct;

class SortieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Création des sorties existantes...');

        // Sortie 1
        $sortie1 = Sortie::firstOrCreate(
            ['numero_bl' => 'BL2508001'],
            [
            'numero_bl' => 'BL2508001',
            'commercial_id' => 1,
            'client_id' => 1,
            'date_bl' => '2025-08-08',
            'livreur_id' => 1,
            'remise_speciale' => 0.00,
            'remise_trimestrielle' => 0.00,
            'valeur_ajoutee' => 0.00,
            'retour' => 0.00,
            'remise_es' => '0.00',
            'client_gdg' => 0.00,
            'total_general' => 2541.60,
            'montant_total_final' => 2541.60,
            'total_poids' => 132.00,
            'montant_remise_especes' => 0.00,
            'total_bl' => 2541.60,
            'archived' => false,
            'created_at' => '2025-08-08 16:57:16',
            'updated_at' => '2025-08-08 16:57:26',
        ]);

        // Produits de la sortie 1
        SortieProduct::create([
            'sortie_id' => $sortie1->id,
            'product_id' => 155,
            'ref_produit' => '80010072',
            'prix_produit' => 141.60,
            'quantite_produit' => 1,
            'poids_produit' => 12.00,
            'total_ligne' => 141.60,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 16:57:26',
            'updated_at' => '2025-08-08 16:57:26',
        ]);

        SortieProduct::create([
            'sortie_id' => $sortie1->id,
            'product_id' => 157,
            'ref_produit' => '80020069',
            'prix_produit' => 240.00,
            'quantite_produit' => 10,
            'poids_produit' => 120.00,
            'total_ligne' => 2400.00,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 16:57:26',
            'updated_at' => '2025-08-08 16:57:26',
        ]);

        // Sortie 2
        $sortie2 = Sortie::create([
            'numero_bl' => 'BL2508002',
            'commercial_id' => 1,
            'client_id' => 1,
            'date_bl' => '2025-08-08',
            'livreur_id' => null,
            'remise_speciale' => 0.00,
            'remise_trimestrielle' => 0.00,
            'valeur_ajoutee' => 0.00,
            'retour' => 0.00,
            'remise_es' => '1',
            'client_gdg' => 0.00,
            'total_general' => 90.40,
            'montant_total_final' => 89.50,
            'total_poids' => 9.00,
            'montant_remise_especes' => 0.90,
            'total_bl' => 89.50,
            'archived' => false,
            'created_at' => '2025-08-08 17:00:08',
            'updated_at' => '2025-08-08 17:03:20',
        ]);

        // Produit de la sortie 2
        SortieProduct::create([
            'sortie_id' => $sortie2->id,
            'product_id' => 154,
            'ref_produit' => '80010059',
            'prix_produit' => 90.40,
            'quantite_produit' => 1,
            'poids_produit' => 9.00,
            'total_ligne' => 90.40,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 17:47:17',
            'updated_at' => '2025-08-08 17:47:17',
        ]);

        // Sortie 3
        $sortie3 = Sortie::create([
            'numero_bl' => 'BL2508003',
            'commercial_id' => 1,
            'client_id' => 1,
            'date_bl' => '2025-08-08',
            'livreur_id' => null,
            'remise_speciale' => 0.00,
            'remise_trimestrielle' => 0.00,
            'valeur_ajoutee' => 0.00,
            'retour' => 0.00,
            'remise_es' => '0.00',
            'client_gdg' => 0.00,
            'total_general' => 19914.00,
            'montant_total_final' => 19914.00,
            'total_poids' => 1515.00,
            'montant_remise_especes' => 0.00,
            'total_bl' => 19914.00,
            'archived' => false,
            'created_at' => '2025-08-08 18:32:06',
            'updated_at' => '2025-08-08 18:32:06',
        ]);

        // Produits de la sortie 3
        SortieProduct::create([
            'sortie_id' => $sortie3->id,
            'product_id' => 154,
            'ref_produit' => '80010059',
            'prix_produit' => 90.40,
            'quantite_produit' => 15,
            'poids_produit' => 135.00,
            'total_ligne' => 1356.00,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 18:32:06',
            'updated_at' => '2025-08-08 18:32:06',
        ]);

        SortieProduct::create([
            'sortie_id' => $sortie3->id,
            'product_id' => 155,
            'ref_produit' => '80010072',
            'prix_produit' => 141.60,
            'quantite_produit' => 5,
            'poids_produit' => 60.00,
            'total_ligne' => 708.00,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 18:32:06',
            'updated_at' => '2025-08-08 18:32:06',
        ]);

        SortieProduct::create([
            'sortie_id' => $sortie3->id,
            'product_id' => 156,
            'ref_produit' => '80010073',
            'prix_produit' => 154.50,
            'quantite_produit' => 100,
            'poids_produit' => 1200.00,
            'total_ligne' => 15450.00,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 18:32:06',
            'updated_at' => '2025-08-08 18:32:06',
        ]);

        SortieProduct::create([
            'sortie_id' => $sortie3->id,
            'product_id' => 157,
            'ref_produit' => '80020069',
            'prix_produit' => 240.00,
            'quantite_produit' => 10,
            'poids_produit' => 120.00,
            'total_ligne' => 2400.00,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 18:32:06',
            'updated_at' => '2025-08-08 18:32:06',
        ]);

        // Sortie 4
        $sortie4 = Sortie::create([
            'numero_bl' => 'BL2508004',
            'commercial_id' => 1,
            'client_id' => 3,
            'date_bl' => '2025-08-08',
            'livreur_id' => null,
            'remise_speciale' => 0.00,
            'remise_trimestrielle' => 0.00,
            'valeur_ajoutee' => 0.00,
            'retour' => 0.00,
            'remise_es' => '0.00',
            'client_gdg' => 0.00,
            'total_general' => 51202.50,
            'montant_total_final' => 51202.50,
            'total_poids' => 4170.00,
            'montant_remise_especes' => 0.00,
            'total_bl' => 51202.50,
            'archived' => false,
            'created_at' => '2025-08-08 18:36:40',
            'updated_at' => '2025-08-08 18:36:40',
        ]);

        // Produits de la sortie 4
        SortieProduct::create([
            'sortie_id' => $sortie4->id,
            'product_id' => 153,
            'ref_produit' => '80000074',
            'prix_produit' => 114.00,
            'quantite_produit' => 60,
            'poids_produit' => 720.00,
            'total_ligne' => 6840.00,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 18:36:40',
            'updated_at' => '2025-08-08 18:36:40',
        ]);

        SortieProduct::create([
            'sortie_id' => $sortie4->id,
            'product_id' => 163,
            'ref_produit' => '80020100',
            'prix_produit' => 135.75,
            'quantite_produit' => 150,
            'poids_produit' => 2250.00,
            'total_ligne' => 20362.50,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 18:36:40',
            'updated_at' => '2025-08-08 18:36:40',
        ]);

        SortieProduct::create([
            'sortie_id' => $sortie4->id,
            'product_id' => 157,
            'ref_produit' => '80020069',
            'prix_produit' => 240.00,
            'quantite_produit' => 100,
            'poids_produit' => 1200.00,
            'total_ligne' => 24000.00,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 18:36:40',
            'updated_at' => '2025-08-08 18:36:40',
        ]);

        // Sortie 5
        $sortie5 = Sortie::create([
            'numero_bl' => 'BL2508005',
            'commercial_id' => 1,
            'client_id' => 8,
            'date_bl' => '2025-08-08',
            'livreur_id' => null,
            'remise_speciale' => 0.00,
            'remise_trimestrielle' => 0.00,
            'valeur_ajoutee' => 0.00,
            'retour' => 0.00,
            'remise_es' => '0.00',
            'client_gdg' => 0.00,
            'total_general' => 28380.00,
            'montant_total_final' => 28380.00,
            'total_poids' => 2720.00,
            'montant_remise_especes' => 0.00,
            'total_bl' => 28380.00,
            'archived' => false,
            'created_at' => '2025-08-08 18:37:28',
            'updated_at' => '2025-08-08 18:37:28',
        ]);

        // Produits de la sortie 5
        SortieProduct::create([
            'sortie_id' => $sortie5->id,
            'product_id' => 152,
            'ref_produit' => '80000076',
            'prix_produit' => 77.00,
            'quantite_produit' => 80,
            'poids_produit' => 720.00,
            'total_ligne' => 6160.00,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 18:37:28',
            'updated_at' => '2025-08-08 18:37:28',
        ]);

        SortieProduct::create([
            'sortie_id' => $sortie5->id,
            'product_id' => 162,
            'ref_produit' => '80020057',
            'prix_produit' => 111.10,
            'quantite_produit' => 200,
            'poids_produit' => 2000.00,
            'total_ligne' => 22220.00,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 18:37:28',
            'updated_at' => '2025-08-08 18:37:28',
        ]);

        // Sortie 6
        $sortie6 = Sortie::create([
            'numero_bl' => 'BL2508006',
            'commercial_id' => 1,
            'client_id' => 2,
            'date_bl' => '2025-08-08',
            'livreur_id' => null,
            'remise_speciale' => 0.00,
            'remise_trimestrielle' => 0.00,
            'valeur_ajoutee' => 0.00,
            'retour' => 0.00,
            'remise_es' => '0.00',
            'client_gdg' => 0.00,
            'total_general' => 13824.00,
            'montant_total_final' => 13824.00,
            'total_poids' => 600.00,
            'montant_remise_especes' => 0.00,
            'total_bl' => 13824.00,
            'archived' => false,
            'created_at' => '2025-08-08 18:39:48',
            'updated_at' => '2025-08-08 18:39:48',
        ]);

        // Produits de la sortie 6
        SortieProduct::create([
            'sortie_id' => $sortie6->id,
            'product_id' => 146,
            'ref_produit' => '',
            'prix_produit' => 115.20,
            'quantite_produit' => 20,
            'poids_produit' => 120.00,
            'total_ligne' => 2304.00,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 18:39:48',
            'updated_at' => '2025-08-08 18:39:48',
        ]);

        SortieProduct::create([
            'sortie_id' => $sortie6->id,
            'product_id' => 147,
            'ref_produit' => '80120000',
            'prix_produit' => 115.20,
            'quantite_produit' => 100,
            'poids_produit' => 480.00,
            'total_ligne' => 11520.00,
            'use_achat_price' => false,
            'created_at' => '2025-08-08 18:39:48',
            'updated_at' => '2025-08-08 18:39:48',
        ]);

        $this->command->info('6 sorties créées avec succès');
    }
}
