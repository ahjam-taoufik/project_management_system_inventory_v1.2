<?php

namespace App\Http\Controllers;

use App\Http\Requests\VilleRequest;
use App\Models\Ville;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class VilleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index():Response
    {
        // Vérifier la permission de voir les villes
        if (!auth()->user()->can('villes.view')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de voir les villes.');
        }

        $villes=Ville::latest()->get();
         return Inertia::render('ville/index',
         ['villes' => $villes]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Vérifier la permission de créer une ville
        if (!auth()->user()->can('villes.create')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de créer une ville.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
   public function store(VilleRequest $request)
   {
        // Vérifier la permission de créer une ville
        if (!auth()->user()->can('villes.create')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de créer une ville.');
        }

        try {
            $ville = Ville::create([
                'nameVille' => $request->validated()['nameVille'],
            ]);

            if ($ville) {
                return redirect()->route('villes.index')->with('success', 'Ville créée avec succès');
            }

            return redirect()->back()->with('error', 'Impossible de créer la ville. Veuillez réessayer.')->withInput();

        } catch (\Exception $e) {
            Log::error('Erreur VilleController::store: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la création de la ville.')->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Vérifier la permission de voir les villes
        if (!auth()->user()->can('villes.view')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de voir cette ville.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Ville $ville)
    {
        // Vérifier la permission d'éditer une ville
        if (!auth()->user()->can('villes.edit')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de modifier cette ville.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(VilleRequest $request, Ville $ville)
    {
        // Vérifier la permission d'éditer une ville
        if (!auth()->user()->can('villes.edit')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de modifier cette ville.');
        }

        try {
            $updated = $ville->update([
                'nameVille' => $request->validated()['nameVille'],
            ]);

            if ($updated) {
                return redirect()->route('villes.index')->with('success', 'Ville mise à jour avec succès');
            }

            return redirect()->back()->with('error', 'Aucune modification effectuée sur la ville.')->withInput();

        } catch (\Exception $e) {
            Log::error('Erreur VilleController::update: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la mise à jour de la ville.')->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
     public function destroy(Ville $ville)
    {
        // Vérifier la permission de supprimer une ville
        if (!auth()->user()->can('villes.delete')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de supprimer cette ville.');
        }

        try {
            if ($ville) {
                $deleted = $ville->delete();

                if ($deleted) {
                    return redirect()->route('villes.index')->with('success', 'Ville supprimée avec succès');
                }

                return redirect()->back()->with('error', 'Impossible de supprimer la ville. Veuillez réessayer.');
            }

            return redirect()->back()->with('error', 'Ville introuvable.');

        } catch (\Exception $e) {
            Log::error('Erreur VilleController::destroy: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la suppression de la ville.');
        }
    }
}
