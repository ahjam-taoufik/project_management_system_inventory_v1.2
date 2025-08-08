<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ClearSortieData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sortie:clear {--force : Forcer la suppression sans confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vider toutes les données des tables sorties et sortie_products';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🗑️  Suppression des données de sortie...');

        // Compter les données existantes
        $sortiesCount = DB::table('sorties')->count();
        $sortieProductsCount = DB::table('sortie_products')->count();

        $this->info("📊 Données trouvées :");
        $this->info("   - Sorties : {$sortiesCount}");
        $this->info("   - Produits de sortie : {$sortieProductsCount}");

        if ($sortiesCount === 0 && $sortieProductsCount === 0) {
            $this->info('✅ Les tables sont déjà vides');
            return;
        }

        // Demander confirmation sauf si --force
        if (!$this->option('force')) {
            if (!$this->confirm('Êtes-vous sûr de vouloir supprimer toutes ces données ?')) {
                $this->info('❌ Suppression annulée');
                return;
            }
        }

        try {
            // Supprimer d'abord les produits de sortie (à cause des clés étrangères)
            DB::table('sortie_products')->delete();
            $this->info('✅ Produits de sortie supprimés');

            // Puis supprimer les sorties
            DB::table('sorties')->delete();
            $this->info('✅ Sorties supprimées');

            $this->info('🎉 Toutes les données de sortie ont été supprimées avec succès !');
            $this->info('');
            $this->info('💡 Pour recréer les données, utilisez :');
            $this->info('   php artisan db:seed --class=SortieSeeder');

        } catch (\Exception $e) {
            $this->error('❌ Erreur lors de la suppression : ' . $e->getMessage());
        }
    }
}
