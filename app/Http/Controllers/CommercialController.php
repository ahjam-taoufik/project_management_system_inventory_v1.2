<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\CommercialRequest;
use App\Models\Commercial;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class CommercialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        // Vérifier la permission de voir les commerciaux
        if (!auth()->user()->can('commerciaux.view')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de voir les commerciaux.');
        }

        $commerciaux = Commercial::latest()->get();

        return Inertia::render('commercial/index', [
            'commerciaux' => $commerciaux
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Vérifier la permission de créer un commercial
        if (!auth()->user()->can('commerciaux.create')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de créer un commercial.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CommercialRequest $request)
    {
        // Vérifier la permission de créer un commercial
        if (!auth()->user()->can('commerciaux.create')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de créer un commercial.');
        }

        try {
            $commercial = Commercial::create([
                'commercial_code' => $request->validated()['commercial_code'],
                'commercial_fullName' => $request->validated()['commercial_fullName'],
                'commercial_telephone' => $request->validated()['commercial_telephone'],
            ]);

            if ($commercial) {
                return redirect()->route('commerciaux.index')->with('success', 'Commercial créé avec succès');
            }

            return redirect()->back()->with('error', 'Impossible de créer le commercial. Veuillez réessayer.')->withInput();

        } catch (\Exception $e) {
            Log::error('Erreur CommercialController::store: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la création du commercial.')->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Commercial $commercial)
    {
        // Vérifier la permission de voir les commerciaux
        if (!auth()->user()->can('commerciaux.view')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de voir ce commercial.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Commercial $commercial)
    {
        // Vérifier la permission d'éditer un commercial
        if (!auth()->user()->can('commerciaux.edit')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de modifier ce commercial.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CommercialRequest $request, Commercial $commercial)
    {
        // Vérifier la permission d'éditer un commercial
        if (!auth()->user()->can('commerciaux.edit')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de modifier ce commercial.');
        }

        try {
            $validatedData = $request->validated();

            $updated = $commercial->update([
                'commercial_code' => $validatedData['commercial_code'],
                'commercial_fullName' => $validatedData['commercial_fullName'],
                'commercial_telephone' => $validatedData['commercial_telephone']
            ]);

            if ($updated) {
                return redirect()->route('commerciaux.index')->with('success', 'Commercial mis à jour avec succès');
            }

            return redirect()->back()->with('error', 'Aucune modification effectuée sur le commercial.')->withInput();

        } catch (\Exception $e) {
            Log::error('Erreur CommercialController::update: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la mise à jour du commercial.')->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Commercial $commercial)
    {
        // Vérifier la permission de supprimer un commercial
        if (!auth()->user()->can('commerciaux.delete')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de supprimer ce commercial.');
        }

        try {
            if ($commercial) {
                $deleted = $commercial->delete();

                if ($deleted) {
                    return redirect()->route('commerciaux.index')->with('success', 'Commercial supprimé avec succès');
                }

                return redirect()->back()->with('error', 'Impossible de supprimer le commercial. Veuillez réessayer.');
            }

            return redirect()->back()->with('error', 'Commercial introuvable.');

        } catch (\Exception $e) {
            Log::error('Erreur CommercialController::destroy: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la suppression du commercial.');
        }
    }
}
