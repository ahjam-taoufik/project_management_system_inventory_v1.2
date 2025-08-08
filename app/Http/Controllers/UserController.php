<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('users.view')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de voir les utilisateurs.');
        }

        $users = User::with('roles')->latest()->get();
        $roles = Role::orderBy('name')->get();

        return Inertia::render('user/index', [
            'users' => $users,
            'roles' => $roles
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('users.create')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de créer un utilisateur.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request)
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('users.create')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de créer un utilisateur.');
        }

        try {
            $validated = $request->validated();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
            ]);

            // Assigner les rôles sélectionnés
            if (isset($validated['roles']) && is_array($validated['roles']) && !empty($validated['roles'])) {
                $user->syncRoles($validated['roles']);
            }

            if ($user) {
                return redirect()->route('users.index')->with('success', 'Utilisateur créé avec succès');
            }

            return redirect()->back()->with('error', 'Impossible de créer l\'utilisateur. Veuillez réessayer.')->withInput();

        } catch (\Exception $e) {
            Log::error('Erreur UserController::store: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la création de l\'utilisateur.')->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('users.view')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de voir cet utilisateur.');
        }

        // Implementation can be added here if needed
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('users.edit')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de modifier cet utilisateur.');
        }

        // Implementation can be added here if needed
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserRequest $request, User $user)
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('users.edit')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de modifier cet utilisateur.');
        }

        try {
            $validated = $request->validated();

            $user->name = $validated['name'];
            $user->email = $validated['email'];

            // Only update password if provided
            if (!empty($validated['password'])) {
                $user->password = $validated['password'];
            }

            $updated = $user->save();

            // Mettre à jour les rôles
            if (isset($validated['roles'])) {
                if (is_array($validated['roles']) && !empty($validated['roles'])) {
                    $user->syncRoles($validated['roles']);
                } else {
                    $user->syncRoles([]);
                }
            }

            if ($updated) {
                return redirect()->route('users.index')->with('success', 'Utilisateur mis à jour avec succès');
            }

            return redirect()->back()->with('error', 'Aucune modification effectuée sur l\'utilisateur.')->withInput();

        } catch (\Exception $e) {
            Log::error('Erreur UserController::update: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la mise à jour de l\'utilisateur.')->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('users.delete')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de supprimer cet utilisateur.');
        }

        try {
            if ($user) {
                $deleted = $user->delete();

                if ($deleted) {
                    return redirect()->route('users.index')->with('success', 'Utilisateur supprimé avec succès');
                }

                return redirect()->back()->with('error', 'Impossible de supprimer l\'utilisateur. Veuillez réessayer.');
            }

            return redirect()->back()->with('error', 'Utilisateur introuvable.');

        } catch (\Exception $e) {
            Log::error('Erreur UserController::destroy: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la suppression de l\'utilisateur.');
        }
    }
}
