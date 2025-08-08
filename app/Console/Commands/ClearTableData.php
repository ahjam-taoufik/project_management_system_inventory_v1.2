<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ClearTableData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'table:clear
                            {table : Nom de la table à vider}
                            {--force : Forcer la suppression sans confirmation}
                            {--related : Supprimer aussi les tables liées par clés étrangères}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vider les données d\'une table spécifique';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tableName = $this->argument('table');
        $force = $this->option('force');
        $related = $this->option('related');

        $this->info("🗑️  Suppression des données de la table : {$tableName}");

        // Vérifier si la table existe
        if (!Schema::hasTable($tableName)) {
            $this->error("❌ La table '{$tableName}' n'existe pas");
            return 1;
        }

        // Compter les données existantes
        $count = DB::table($tableName)->count();
        $this->info("📊 Données trouvées dans '{$tableName}' : {$count}");

        if ($count === 0) {
            $this->info('✅ La table est déjà vide');
            return 0;
        }

        // Si on veut supprimer les tables liées
        if ($related) {
            $relatedTables = $this->getRelatedTables($tableName);
            if (!empty($relatedTables)) {
                $this->info("🔗 Tables liées trouvées :");
                foreach ($relatedTables as $relatedTable) {
                    $relatedCount = DB::table($relatedTable)->count();
                    $this->info("   - {$relatedTable} : {$relatedCount} enregistrements");
                }
            }
        }

        // Demander confirmation sauf si --force
        if (!$force) {
            $message = "Êtes-vous sûr de vouloir supprimer {$count} enregistrement(s) de '{$tableName}' ?";
            if ($related && !empty($relatedTables)) {
                $message .= " (et les tables liées)";
            }

            if (!$this->confirm($message)) {
                $this->info('❌ Suppression annulée');
                return 0;
            }
        }

        try {
            // Si on veut supprimer les tables liées, commencer par elles
            if ($related) {
                $relatedTables = $this->getRelatedTables($tableName);
                foreach ($relatedTables as $relatedTable) {
                    $relatedCount = DB::table($relatedTable)->count();
                    if ($relatedCount > 0) {
                        DB::table($relatedTable)->delete();
                        $this->info("✅ Table '{$relatedTable}' vidée ({$relatedCount} enregistrements)");
                    }
                }
            }

            // Supprimer les données de la table principale
            DB::table($tableName)->delete();
            $this->info("✅ Table '{$tableName}' vidée ({$count} enregistrements)");

            $this->info('🎉 Suppression terminée avec succès !');

        } catch (\Exception $e) {
            $this->error('❌ Erreur lors de la suppression : ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    /**
     * Obtenir les tables liées par clés étrangères
     */
    private function getRelatedTables($tableName)
    {
        $relatedTables = [];

        // Récupérer toutes les contraintes de clé étrangère qui référencent cette table
        $foreignKeys = DB::select("
            SELECT
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME = ?
        ", [$tableName]);

        foreach ($foreignKeys as $fk) {
            $relatedTables[] = $fk->TABLE_NAME;
        }

        return array_unique($relatedTables);
    }
}
