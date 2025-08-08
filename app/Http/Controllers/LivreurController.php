<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Livreur;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\LivreurRequest;

class LivreurController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(auth()->user()->can('livreurs.view'), 403);

        $perPage = (int) $request->get('perPage', 8);
        $livreurs = \App\Models\Livreur::orderByDesc('created_at')->paginate($perPage)->withQueryString();

        return \Inertia\Inertia::render('livreur/index', [
            'livreurs' => [
                'data' => $livreurs->items(),
                'meta' => [
                    'current_page' => $livreurs->currentPage(),
                    'last_page' => $livreurs->lastPage(),
                    'per_page' => $livreurs->perPage(),
                    'total' => $livreurs->total(),
                ],
                'links' => $livreurs->linkCollection(),
            ],
        ]);
    }

    public function store(LivreurRequest $request)
    {
        abort_unless(auth()->user()->can('livreurs.create'), 403);

        Livreur::create($request->validated());
        return redirect()->back()->with('success', 'Livreur ajouté avec succès');
    }

    public function update(LivreurRequest $request, Livreur $livreur)
    {
        abort_unless(auth()->user()->can('livreurs.edit'), 403);

        $livreur->update($request->validated());
        return redirect()->back()->with('success', 'Livreur modifié avec succès');
    }

    public function destroy(Livreur $livreur)
    {
        abort_unless(auth()->user()->can('livreurs.delete'), 403);

        $livreur->delete();
        return redirect()->back()->with('success', 'Livreur supprimé avec succès');
    }
}
