<?php

namespace App\Policies;

use App\Models\Avoir;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AvoirPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('avoirs.view') || $user->hasPermissionTo('avoirs.viewAny');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Avoir $avoir): bool
    {
        return $user->hasPermissionTo('avoirs.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('avoirs.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Avoir $avoir): bool
    {
        return $user->hasPermissionTo('avoirs.edit');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Avoir $avoir): bool
    {
        return $user->hasPermissionTo('avoirs.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Avoir $avoir): bool
    {
        return $user->hasPermissionTo('avoirs.edit');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Avoir $avoir): bool
    {
        return $user->hasPermissionTo('avoirs.delete');
    }

    /**
     * ✅ NOUVEAU: Determine whether the user can validate the model.
     */
    public function validate(User $user, Avoir $avoir): bool
    {
        return $user->hasPermissionTo('avoirs.validate');
    }
}
