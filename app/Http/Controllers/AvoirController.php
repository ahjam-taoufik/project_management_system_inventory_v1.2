<?php

namespace App\Http\Controllers;

use App\Models\Avoir;
use App\Models\AvoirProduct;
use App\Models\Client;
use App\Models\Commercial;
use App\Models\Livreur;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AvoirController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        try {
            $this->authorize('viewAny', Avoir::class);
            Log::info("Autorisation viewAny réussie pour l'utilisateur", ['user_id' => auth()->id()]);
        } catch (\Exception $e) {
            Log::error("Échec de l'autorisation viewAny", [
                'user_id' => auth()->id(),
                'error' => $e->getMessage()
            ]);
            throw $e;
        }

        $avoirs = Avoir::with(['client', 'commercial', 'livreur', 'products.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        Log::info("Avoirs récupérés", [
            'count' => $avoirs->count(),
            'user_id' => auth()->id()
        ]);

        // Données pour les dialogs
        $clients = Client::orderBy('fullName')->get();
        $commerciaux = Commercial::orderBy('commercial_fullName')->get();
        $livreurs = Livreur::orderBy('nom')->get();
        $products = Product::with('brand')->orderBy('product_libelle')->get();

        return Inertia::render('mouvements/avoir/index', [
            'avoirs' => $avoirs,
            'clients' => $clients,
            'commerciaux' => $commerciaux,
            'livreurs' => $livreurs,
            'products' => $products,
        ]);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        $this->authorize('create', Avoir::class);

        try {
            $validated = $request->validate([
                'date_avoir' => 'required|date',
                'client_id' => 'required|exists:clients,id',
                'commercial_id' => 'required|exists:commerciaux,id',
                'livreur_id' => 'nullable|exists:livreurs,id',
                'raison_retour' => 'nullable|string',
                'ajustement_financier' => 'nullable|numeric',
                'products' => 'required|array|min:1',
                'products.*.product_id' => 'required|exists:products,id',
                'products.*.quantite_retournee' => 'required|integer|min:1',
                'products.*.prix_unitaire' => 'required|numeric|min:0',
                'products.*.prix_original' => 'required|numeric|min:0',
                'products.*.prix_personnalise' => 'required|boolean',
                'products.*.raison_detail' => 'nullable|string',
                'products.*.sortie_origine_id' => 'nullable|exists:sorties,id',
            ]);

            // Calculer le montant total
            $montantTotal = 0;
            foreach ($validated['products'] as $product) {
                $montantLigne = $product['quantite_retournee'] * $product['prix_unitaire'];
                $montantTotal += $montantLigne;
            }

            // ✅ NOUVEAU: Ajout de l'ajustement financier
            $montantTotal += $validated['ajustement_financier'] ?? 0;

            // Créer l'avoir
            $avoir = Avoir::create([
                'numero_avoir' => Avoir::generateNumeroAvoir(),
                'statut' => 'en_attente', // ✅ NOUVEAU: Statut par défaut
                'date_avoir' => $validated['date_avoir'],
                'client_id' => $validated['client_id'],
                'commercial_id' => $validated['commercial_id'],
                'livreur_id' => $validated['livreur_id'],
                'raison_retour' => $validated['raison_retour'],
                'ajustement_financier' => $validated['ajustement_financier'] ?? 0,

                'montant_total' => $montantTotal,
                'poids_total' => 0, // À calculer si nécessaire
            ]);

            // Créer les lignes de produits
            foreach ($validated['products'] as $productData) {
                AvoirProduct::create([
                    'avoir_id' => $avoir->id,
                    'product_id' => $productData['product_id'],
                    'quantite_retournee' => $productData['quantite_retournee'],
                    'prix_unitaire' => $productData['prix_unitaire'],
                    'prix_original' => $productData['prix_original'],
                    'prix_personnalise' => $productData['prix_personnalise'],
                    'montant_ligne' => $productData['quantite_retournee'] * $productData['prix_unitaire'],
                    'raison_detail' => $productData['raison_detail'] ?? null,
                    'sortie_origine_id' => $productData['sortie_origine_id'] ?? null,
                ]);
            }

            Log::info("Avoir créé avec succès", ['avoir_id' => $avoir->id]);

            return back()->with('success', 'Avoir créé avec succès');

        } catch (\Exception $e) {
            Log::error("Erreur lors de la création de l'avoir", [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return back()->withErrors(['error' => 'Erreur lors de la création de l\'avoir']);
        }
    }





    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Avoir $avoir)
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        $this->authorize('edit', $avoir);

        if (!$avoir->canBeModified()) {
            return redirect()->route('avoirs.index')
                ->with('error', 'Cet avoir ne peut plus être modifié');
        }

        try {
            $validated = $request->validate([
                'date_avoir' => 'required|date',
                'client_id' => 'required|exists:clients,id',
                'commercial_id' => 'required|exists:commerciaux,id',
                'livreur_id' => 'nullable|exists:livreurs,id',
                'raison_retour' => 'nullable|string',
                'ajustement_financier' => 'nullable|numeric',
                'products' => 'required|array|min:1',
                'products.*.product_id' => 'required|exists:products,id',
                'products.*.quantite_retournee' => 'required|integer|min:1',
                'products.*.prix_unitaire' => 'required|numeric|min:0',
                'products.*.prix_original' => 'required|numeric|min:0',
                'products.*.prix_personnalise' => 'required|boolean',
                'products.*.raison_detail' => 'nullable|string',
                'products.*.sortie_origine_id' => 'nullable|exists:sorties,id',
            ]);

            // Calculer le nouveau montant total
            $montantTotal = 0;
            foreach ($validated['products'] as $product) {
                $montantLigne = $product['quantite_retournee'] * $product['prix_unitaire'];
                $montantTotal += $montantLigne;
            }

            // ✅ NOUVEAU: Ajout de l'ajustement financier
            $montantTotal += $validated['ajustement_financier'] ?? 0;

            // Mettre à jour l'avoir
            $updated = $avoir->update([
                'date_avoir' => $validated['date_avoir'],
                'client_id' => $validated['client_id'],
                'commercial_id' => $validated['commercial_id'],
                'livreur_id' => $validated['livreur_id'],
                'raison_retour' => $validated['raison_retour'],
                'ajustement_financier' => $validated['ajustement_financier'] ?? 0,
                'montant_total' => $montantTotal,
            ]);

            if ($updated) {
                // Supprimer les anciennes lignes et créer les nouvelles
                $avoir->products()->delete();

                foreach ($validated['products'] as $productData) {
                    AvoirProduct::create([
                        'avoir_id' => $avoir->id,
                        'product_id' => $productData['product_id'],
                        'quantite_retournee' => $productData['quantite_retournee'],
                        'prix_unitaire' => $productData['prix_unitaire'],
                        'prix_original' => $productData['prix_original'],
                        'prix_personnalise' => $productData['prix_personnalise'],
                        'montant_ligne' => $productData['quantite_retournee'] * $productData['prix_unitaire'],
                        'raison_detail' => $productData['raison_detail'] ?? null,
                        'sortie_origine_id' => $productData['sortie_origine_id'] ?? null,
                    ]);
                }

                Log::info("Avoir mis à jour avec succès", ['avoir_id' => $avoir->id]);

                return redirect()->route('avoirs.index')
                    ->with('success', 'Avoir mis à jour avec succès');
            }

            return back()->withErrors(['error' => 'Erreur lors de la mise à jour']);

        } catch (\Exception $e) {
            Log::error("Erreur lors de la mise à jour de l'avoir", [
                'avoir_id' => $avoir->id,
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return back()->withErrors(['error' => 'Erreur lors de la mise à jour de l\'avoir']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Avoir $avoir)
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        $this->authorize('delete', $avoir);

        if (!$avoir->canBeDeleted()) {
            return redirect()->route('avoirs.index')
                ->with('error', 'Cet avoir ne peut plus être supprimé');
        }

        try {
            $deleted = $avoir->delete();

            if ($deleted) {
                Log::info("Avoir supprimé avec succès", ['avoir_id' => $avoir->id]);

                return redirect()->route('avoirs.index')
                    ->with('success', 'Avoir supprimé avec succès');
            }

            return back()->withErrors(['error' => 'Erreur lors de la suppression']);

        } catch (\Exception $e) {
            Log::error("Erreur lors de la suppression de l'avoir", [
                'avoir_id' => $avoir->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Erreur lors de la suppression de l\'avoir']);
        }
    }



    /**
     * ✅ NOUVEAU: Valider un avoir
     */
    public function validateAvoir(Request $request, Avoir $avoir)
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        $this->authorize('validate', $avoir);

        try {
            $validated = $request->validate([
                'commentaire' => 'nullable|string|max:500',
            ]);

            $commentaire = $validated['commentaire'] ?? null;

            // Vérifier que l'avoir n'est pas déjà validé
            if ($avoir->statut === 'valide') {
                return back()->withErrors(['error' => 'Cet avoir est déjà validé']);
            }

            // Mettre à jour le statut
            $avoir->update([
                'statut' => 'valide',
                'date_validation' => now(),
                'commentaire_validation' => $commentaire,
            ]);

            // ✅ NOUVEAU: Impact sur le stock lors de la validation
            $this->updateStockOnValidation($avoir, 'increment');

            Log::info("Avoir validé avec succès", [
                'avoir_id' => $avoir->id,
                'user_id' => auth()->id(),
                'commentaire' => $commentaire
            ]);

            return redirect()->route('avoirs.index')
                ->with('success', 'Avoir validé avec succès - Stock mis à jour');

        } catch (\Exception $e) {
            Log::error("Erreur lors de la validation de l'avoir", [
                'avoir_id' => $avoir->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Erreur lors de la validation de l\'avoir']);
        }
    }

    /**
     * ✅ NOUVEAU: Mettre à jour le stock lors de la validation d'un avoir
     */
    private function updateStockOnValidation(Avoir $avoir, string $operation): void
    {
        foreach ($avoir->products as $product) {
            $stock = Stock::where('product_id', $product->product_id)->first();

            if ($stock) {
                if ($operation === 'increment') {
                    $stock->increment('stock_disponible', $product->quantite_retournee);
                    Log::info("Stock incrémenté lors de validation d'avoir", [
                        'avoir_id' => $avoir->id,
                        'product_id' => $product->product_id,
                        'quantite' => $product->quantite_retournee,
                        'nouveau_stock' => $stock->fresh()->stock_disponible
                    ]);
                } elseif ($operation === 'decrement') {
                    $stock->decrement('stock_disponible', $product->quantite_retournee);
                    Log::info("Stock décrémenté lors de validation d'avoir", [
                        'avoir_id' => $avoir->id,
                        'product_id' => $product->product_id,
                        'quantite' => $product->quantite_retournee,
                        'nouveau_stock' => $stock->fresh()->stock_disponible
                    ]);
                }
            } else {
                Log::warning("Stock non trouvé pour le produit lors de validation d'avoir", [
                    'product_id' => $product->product_id,
                    'avoir_id' => $avoir->id
                ]);
            }
        }
    }

    /**
     * ✅ NOUVEAU: Obtenir le prochain numéro d'avoir (API)
     */
    public function getNextNumeroAvoir()
    {
        // ✅ Pas de vérification de permissions pour cette route API
        return response()->json([
            'numero_avoir' => Avoir::generateNumeroAvoir()
        ]);
    }
}
