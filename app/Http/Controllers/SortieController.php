<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sortie;
use App\Models\SortieProduct;
use App\Models\Product;
use App\Models\Commercial;
use App\Models\Client;
use App\Models\Livreur;
use App\Http\Requests\SortieRequest;
use App\Http\Requests\SortieArchivedRequest;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\RedirectResponse;
use App\Models\Stock; // Added this import for stock validation

class SortieController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        abort_unless(auth()->user()->can('sorties.view'), 403);

        $sorties = Sortie::with([
            'commercial',
            'client.ville',
            'client.secteur',
            'products.product'
        ])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($sortie) {
            return [
                'id' => $sortie->id,
                'numero_bl' => $sortie->numero_bl,
                'commercial' => [
                    'id' => $sortie->commercial->id,
                    'commercial_code' => $sortie->commercial->commercial_code,
                    'commercial_fullName' => $sortie->commercial->commercial_fullName,
                    'commercial_telephone' => $sortie->commercial->commercial_telephone,
                ],
                'client' => [
                    'id' => $sortie->client->id,
                    'code' => $sortie->client->code,
                    'nom' => $sortie->client->fullName,
                    'telephone' => $sortie->client->telephone,
                    'ville' => $sortie->client->ville?->nameVille ?? '',
                    'secteur' => $sortie->client->secteur?->nameSecteur ?? '',
                    'type_client' => $sortie->client->remise_special ? 'Spécial' : 'Normal',
                ],
                'date_bl' => $sortie->date_bl->format('Y-m-d'),
                'livreur_id' => $sortie->livreur_id,
                'livreur' => $sortie->livreur ? [
                    'id' => $sortie->livreur->id,
                    'nom' => $sortie->livreur->nom,
                    'telephone' => $sortie->livreur->telephone,
                ] : null,
                'remise_speciale' => $sortie->remise_speciale,
                'remise_trimestrielle' => $sortie->remise_trimestrielle,
                'valeur_ajoutee' => $sortie->valeur_ajoutee,
                'retour' => $sortie->retour,
                'remise_es' => $sortie->remise_es,
                'client_gdg' => $sortie->client_gdg,
                'total_general' => $sortie->total_general,
                'montant_total_final' => $sortie->montant_total_final,
                'total_poids' => $sortie->total_poids,
                'montant_remise_especes' => $sortie->montant_remise_especes,
                'product_count' => $sortie->products->count(),
                'total_bl' => $sortie->total_bl,
                'archived' => $sortie->archived,
                'updated_at' => $sortie->updated_at,
                'products' => $sortie->products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'product' => [
                            'id' => $product->product->id,
                            'product_libelle' => $product->product->product_libelle,
                            'product_Ref' => $product->product->product_Ref,
                        ],
                        'ref_produit' => $product->ref_produit,
                        'prix_produit' => $product->prix_produit,
                        'quantite_produit' => $product->quantite_produit,
                        'poids_produit' => $product->poids_produit,
                        'total_ligne' => $product->total_ligne,
                        'use_achat_price' => $product->use_achat_price,
                    ];
                }),
            ];
        });

        $products = Product::where('product_isActive', true)
            ->orderBy('product_libelle')
            ->get();

        $commerciaux = Commercial::orderBy('commercial_fullName')->get();

        $clients = Client::with(['ville', 'secteur'])
            ->orderBy('fullName')
            ->get();

        // Récupérer la liste des livreurs depuis le modèle Livreur
        $livreurs = Livreur::orderBy('nom')->get();

        return Inertia::render('mouvements/sortie/index', [
            'sorties' => $sorties,
            'products' => $products,
            'commerciaux' => $commerciaux,
            'clients' => $clients,
            'livreurs' => $livreurs,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        abort_unless(auth()->user()->can('sorties.create'), 403);
        // Méthode vide - la création se fait via dialog
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SortieRequest $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('sorties.create'), 403);

        try {
            $validatedData = $request->validated();

            DB::beginTransaction();

            // Créer la sortie principale
            $sortie = Sortie::create([
                'numero_bl' => $validatedData['numero_bl'],
                'commercial_id' => $validatedData['commercial_id'],
                'client_id' => $validatedData['client_id'],
                'date_bl' => $validatedData['date_bl'],
                'livreur_id' => $validatedData['livreur_id'] ?? null,
                'remise_speciale' => $validatedData['remise_speciale'] ?? 0,
                'remise_trimestrielle' => $validatedData['remise_trimestrielle'] ?? 0,
                'valeur_ajoutee' => $validatedData['valeur_ajoutee'] ?? 0,
                'retour' => $validatedData['retour'] ?? 0,
                'remise_es' => $validatedData['remise_es'] ?? null,
                'client_gdg' => $validatedData['client_gdg'] ?? 0,
                'total_general' => $validatedData['total_general'] ?? 0,
                'montant_total_final' => $validatedData['montant_total_final'] ?? 0,
                'total_poids' => $validatedData['total_poids'] ?? 0,
                'montant_remise_especes' => $validatedData['montant_remise_especes'] ?? 0,
            ]);

            // Créer les produits associés
            foreach ($validatedData['products'] as $productData) {
                $product = Product::find($productData['product_id']);

                \Illuminate\Support\Facades\Log::info('Création SortieProduct:', [
                    'product_id' => $productData['product_id'],
                    'use_achat_price' => $productData['use_achat_price'] ?? false,
                    'prix_produit' => $productData['prix_produit']
                ]);

                SortieProduct::create([
                    'sortie_id' => $sortie->id,
                    'product_id' => $productData['product_id'],
                    'ref_produit' => $product->product_Ref,
                    'prix_produit' => $productData['prix_produit'],
                    'quantite_produit' => $productData['quantite_produit'],
                    'poids_produit' => $productData['poids_produit'] ?? 0,
                    'total_ligne' => $productData['prix_produit'] * $productData['quantite_produit'],
                    'use_achat_price' => $productData['use_achat_price'] ?? false,
                ]);
            }

            // Calculer et mettre à jour tous les totaux de la sortie
            $sortie->calculateAllTotals();

            DB::commit();

            return redirect()->route('sorties.index')
                ->with('success', 'Sortie créée avec succès');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->withErrors(['message' => 'Erreur lors de la création: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Sortie $sortie): Response
    {
        abort_unless(auth()->user()->can('sorties.view'), 403);

        $sortie->load([
            'commercial',
            'client.ville',
            'client.secteur',
            'products.product'
        ]);

        // Transformer les données dans le même format que index
        $sortieData = [
            'id' => $sortie->id,
            'numero_bl' => $sortie->numero_bl,
            'commercial' => [
                'id' => $sortie->commercial->id,
                'commercial_code' => $sortie->commercial->commercial_code,
                'commercial_fullName' => $sortie->commercial->commercial_fullName,
                'commercial_telephone' => $sortie->commercial->commercial_telephone,
            ],
            'client' => [
                'id' => $sortie->client->id,
                'code' => $sortie->client->code,
                'nom' => $sortie->client->fullName,
                'telephone' => $sortie->client->telephone,
                'ville' => $sortie->client->ville?->nameVille ?? '',
                'secteur' => $sortie->client->secteur?->nameSecteur ?? '',
                'type_client' => $sortie->client->remise_special ? 'Spécial' : 'Normal',
            ],
            'date_bl' => $sortie->date_bl->format('Y-m-d'),
            'livreur_id' => $sortie->livreur_id,
            'livreur' => $sortie->livreur ? [
                'id' => $sortie->livreur->id,
                'nom' => $sortie->livreur->nom,
                'telephone' => $sortie->livreur->telephone,
            ] : null,
            'remise_speciale' => $sortie->remise_speciale,
            'remise_trimestrielle' => $sortie->remise_trimestrielle,
            'valeur_ajoutee' => $sortie->valeur_ajoutee,
            'retour' => $sortie->retour,
            'remise_es' => $sortie->remise_es,
            'client_gdg' => $sortie->client_gdg,
            'total_general' => $sortie->total_general,
            'montant_total_final' => $sortie->montant_total_final,
            'total_poids' => $sortie->total_poids,
            'montant_remise_especes' => $sortie->montant_remise_especes,
            'product_count' => $sortie->products->count(),
            'total_bl' => $sortie->total_bl,
            'archived' => $sortie->archived,
            'updated_at' => $sortie->updated_at,
            'products' => $sortie->products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'product' => [
                        'id' => $product->product->id,
                        'product_libelle' => $product->product->product_libelle,
                        'product_Ref' => $product->product->product_Ref,
                    ],
                    'ref_produit' => $product->ref_produit,
                    'prix_produit' => $product->prix_produit,
                    'quantite_produit' => $product->quantite_produit,
                    'poids_produit' => $product->poids_produit,
                    'total_ligne' => $product->total_ligne,
                    'use_achat_price' => $product->use_achat_price,
                ];
            }),
        ];

        return Inertia::render('mouvements/sortie/show', [
            'sortie' => $sortieData
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sortie $sortie)
    {
        abort_unless(auth()->user()->can('sorties.edit'), 403);
        // Méthode vide - l'édition se fait via dialog
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SortieRequest $request, Sortie $sortie): RedirectResponse
    {
        abort_unless(auth()->user()->can('sorties.edit'), 403);

        try {
            $validatedData = $request->validated();

            DB::beginTransaction();

            // Mettre à jour la sortie principale (sans les totaux qui seront recalculés)
            $sortie->update([
                'numero_bl' => $validatedData['numero_bl'],
                'commercial_id' => $validatedData['commercial_id'],
                'client_id' => $validatedData['client_id'],
                'date_bl' => $validatedData['date_bl'],
                'livreur_id' => $validatedData['livreur_id'] ?? null,
                'remise_speciale' => $validatedData['remise_speciale'] ?? 0,
                'remise_trimestrielle' => $validatedData['remise_trimestrielle'] ?? 0,
                'valeur_ajoutee' => $validatedData['valeur_ajoutee'] ?? 0,
                'retour' => $validatedData['retour'] ?? 0,
                'remise_es' => $validatedData['remise_es'] ?? null,
                'client_gdg' => $validatedData['client_gdg'] ?? 0,
                'archived' => $validatedData['archived'] ?? false,
            ]);

            // Si des produits sont fournis, les mettre à jour
            if (isset($validatedData['products'])) {
                // Charger les produits existants
                $sortie->load('products');

                // Remettre le stock en place pour tous les produits existants
                foreach ($sortie->products as $existingProduct) {
                    $stock = \App\Models\Stock::where('product_id', $existingProduct->product_id)->first();
                    if ($stock) {
                        // Augmenter le stock disponible
                        $stock->increment('stock_disponible', $existingProduct->quantite_produit);
                        // Diminuer la quantité totale sortie
                        $stock->decrement('quantite_totale_sortie', $existingProduct->quantite_produit);
                    }
                }

                // Supprimer tous les produits existants
                $sortie->products()->delete();

                // Créer tous les nouveaux produits
                foreach ($validatedData['products'] as $productData) {
                    $product = Product::find($productData['product_id']);

                    SortieProduct::create([
                        'sortie_id' => $sortie->id,
                        'product_id' => $productData['product_id'],
                        'ref_produit' => $product->product_Ref,
                        'prix_produit' => $productData['prix_produit'],
                        'quantite_produit' => $productData['quantite_produit'],
                        'poids_produit' => $productData['poids_produit'] ?? 0,
                        'total_ligne' => $productData['prix_produit'] * $productData['quantite_produit'],
                        'use_achat_price' => $productData['use_achat_price'] ?? false,
                    ]);
                }

                // Recalculer tous les totaux après mise à jour des produits
                $sortie->calculateAllTotals();
            } else {
                // Même si aucun produit n'est modifié, recalculer les totaux pour les remises
                $sortie->calculateAllTotals();
            }

            DB::commit();

            return redirect()->route('sorties.index')
                ->with('success', 'Sortie modifiée avec succès');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->withErrors(['message' => 'Erreur lors de la modification: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sortie $sortie): RedirectResponse
    {
        abort_unless(auth()->user()->can('sorties.delete'), 403);

        try {
            DB::beginTransaction();

            // Charger explicitement les produits de la sortie
            $sortie->load('products');

            // Remettre le stock en place avant de supprimer les produits
            foreach ($sortie->products as $sortieProduct) {
                $stock = \App\Models\Stock::where('product_id', $sortieProduct->product_id)->first();
                if ($stock) {
                    // Augmenter le stock disponible
                    $stock->increment('stock_disponible', $sortieProduct->quantite_produit);
                    // Diminuer la quantité totale sortie
                    $stock->decrement('quantite_totale_sortie', $sortieProduct->quantite_produit);
                }
            }

            // Supprimer les produits associés
            $sortie->products()->delete();

            // Supprimer la sortie
            $sortie->delete();

            DB::commit();

            return redirect()->route('sorties.index')
                ->with('success', 'Sortie supprimée avec succès');

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Erreur lors de la suppression de la sortie: " . $e->getMessage());
            return redirect()->back()
                ->withErrors(['message' => 'Erreur lors de la suppression: ' . $e->getMessage()]);
        }
    }

    /**
     * Get product details for API
     */
    public function getProductDetails($productId)
    {
        $product = Product::find($productId);

        if (!$product) {
            return response()->json(['error' => 'Produit non trouvé'], 404);
        }

        return response()->json([
            'ref_produit' => $product->product_Ref,
            'prix_vente_colis' => $product->prix_vente_colis
        ]);
    }

    /**
     * Check if BL number already exists
     */
    public function checkBlExists($numeroBl)
    {
        $exists = Sortie::where('numero_bl', $numeroBl)->exists();

        return response()->json([
            'exists' => $exists,
            'numero_bl' => $numeroBl
        ]);
    }

    /**
     * Get clients by commercial
     */
    public function getClientsByCommercial($commercialId)
    {
        $clients = Client::with(['ville', 'secteur'])
            ->where('idCommercial', $commercialId)
            ->orderBy('fullName')
            ->get();

        return response()->json($clients);
    }

        /**
     * Get the next suggested BL number
     */
    public function getNextBlNumber()
    {
        // Obtenir la dernière sortie par ordre de création
        $lastSortie = Sortie::orderBy('created_at', 'desc')->first();

        $currentYear = date('y'); // Année sur 2 chiffres (ex: 25 pour 2025)
        $currentMonth = date('m'); // Mois sur 2 chiffres (ex: 08 pour août)
        $nextNumber = 'BL' . $currentYear . $currentMonth . '001'; // Valeur par défaut

        if ($lastSortie) {
            // Extraire le numéro de la dernière sortie
            $lastNumber = $lastSortie->numero_bl;

            // Pattern pour extraire les composants (ex: BL2508001 -> 25, 08, 001)
            if (preg_match('/^BL(\d{2})(\d{2})(\d{3})$/', $lastNumber, $matches)) {
                $year = $matches[1];
                $month = $matches[2];
                $sequence = intval($matches[3]);

                // Si c'est le même mois et la même année, incrémenter le numéro
                if ($year == $currentYear && $month == $currentMonth) {
                    $nextSequence = $sequence + 1;
                    $nextNumber = 'BL' . $currentYear . $currentMonth . str_pad((string)$nextSequence, 3, '0', STR_PAD_LEFT);
                } else {
                    // Nouveau mois ou nouvelle année, recommencer à 001
                    $nextNumber = 'BL' . $currentYear . $currentMonth . '001';
                }
            }
        }

        return response()->json([
            'next_number' => $nextNumber
        ]);
    }

        /**
     * Toggle the archived status of a sortie
     */
    public function toggleArchived(SortieArchivedRequest $request, Sortie $sortie)
    {
        abort_unless(auth()->user()->can('sorties.edit'), 403);

        try {
            $sortie->update(['archived' => $request->archived]);

            return redirect()->back()->with('success', $request->archived ? 'Sortie archivée avec succès' : 'Sortie désarchivée avec succès');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['message' => 'Erreur lors de la modification du statut d\'archivage']);
        }
    }
}
