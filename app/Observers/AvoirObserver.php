<?php

namespace App\Observers;

use App\Models\Avoir;
use App\Models\Stock;
use Illuminate\Support\Facades\Log;

class AvoirObserver
{
    /**
     * Handle the Avoir "created" event.
     */
    public function created(Avoir $avoir): void
    {
        Log::info("AvoirObserver::created - Avoir créé", ['avoir_id' => $avoir->id]);
        // Pas d'impact sur le stock à la création - seulement lors de la validation
    }

    /**
     * Handle the Avoir "updated" event.
     */
    public function updated(Avoir $avoir): void
    {
        Log::info("AvoirObserver::updated - Avoir mis à jour", ['avoir_id' => $avoir->id]);
        // Pas d'impact sur le stock lors de la mise à jour
    }

    /**
     * Handle the Avoir "deleting" event.
     */
    public function deleting(Avoir $avoir): void
    {
        Log::info("AvoirObserver::deleting - Avoir en cours de suppression", ['avoir_id' => $avoir->id]);

        // Restaurer le stock seulement si l'avoir était validé
        if ($avoir->statut === 'valide') {
            $this->updateStock($avoir, 'decrement');
            Log::info("AvoirObserver::deleting - Stock restauré (suppression d'avoir validé)", ['avoir_id' => $avoir->id]);
        }
    }

    /**
     * Handle the Avoir "deleted" event.
     */
    public function deleted(Avoir $avoir): void
    {
        Log::info("AvoirObserver::deleted - Avoir supprimé", ['avoir_id' => $avoir->id]);
    }

    /**
     * Handle the Avoir "restored" event.
     */
    public function restored(Avoir $avoir): void
    {
        Log::info("AvoirObserver::restored - Avoir restauré", ['avoir_id' => $avoir->id]);

        // Remettre à jour le stock seulement si l'avoir était validé
        if ($avoir->statut === 'valide') {
            $this->updateStock($avoir, 'increment');
            Log::info("AvoirObserver::restored - Stock mis à jour (restauration d'avoir validé)", ['avoir_id' => $avoir->id]);
        }
    }

    /**
     * Handle the Avoir "force deleted" event.
     */
    public function forceDeleted(Avoir $avoir): void
    {
        Log::info("AvoirObserver::forceDeleted - Avoir supprimé définitivement", ['avoir_id' => $avoir->id]);

        // Même logique que deleted - seulement si validé
        if ($avoir->statut === 'valide') {
            $this->updateStock($avoir, 'decrement');
            Log::info("AvoirObserver::forceDeleted - Stock restauré (suppression définitive d'avoir validé)", ['avoir_id' => $avoir->id]);
        }
    }

    /**
     * ✅ NOUVEAU: Mettre à jour le stock selon l'opération
     */
    private function updateStock(Avoir $avoir, string $operation): void
    {
        // ✅ NOUVEAU: Récupérer les produits directement depuis la base
        $products = \App\Models\AvoirProduct::where('avoir_id', $avoir->id)->get();

        Log::info("updateStock appelé", [
            'avoir_id' => $avoir->id,
            'operation' => $operation,
            'products_count' => $products->count()
        ]);

        foreach ($products as $product) {
            Log::info("Traitement produit", [
                'product_id' => $product->product_id,
                'quantite' => $product->quantite_retournee
            ]);

            $stock = Stock::where('product_id', $product->product_id)->first();

            if ($stock) {
                $stockAvant = $stock->stock_disponible;

                if ($operation === 'increment') {
                    $stock->increment('stock_disponible', $product->quantite_retournee);
                    Log::info("Stock incrémenté", [
                        'product_id' => $product->product_id,
                        'quantite' => $product->quantite_retournee,
                        'stock_avant' => $stockAvant,
                        'nouveau_stock' => $stock->fresh()->stock_disponible
                    ]);
                } elseif ($operation === 'decrement') {
                    $stock->decrement('stock_disponible', $product->quantite_retournee);
                    Log::info("Stock décrémenté", [
                        'product_id' => $product->product_id,
                        'quantite' => $product->quantite_retournee,
                        'stock_avant' => $stockAvant,
                        'nouveau_stock' => $stock->fresh()->stock_disponible
                    ]);
                }
            } else {
                Log::warning("Stock non trouvé pour le produit", [
                    'product_id' => $product->product_id,
                    'avoir_id' => $avoir->id
                ]);
            }
        }
    }
}
