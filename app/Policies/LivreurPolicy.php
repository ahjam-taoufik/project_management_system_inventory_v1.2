<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\Livreur;

class LivreurPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('livreurs.view');
    }

    public function view(User $user, Livreur $livreur): bool
    {
        return $user->can('livreurs.view');
    }

    public function create(User $user): bool
    {
        return $user->can('livreurs.create');
    }

    public function update(User $user, Livreur $livreur): bool
    {
        return $user->can('livreurs.edit');
    }

    public function delete(User $user, Livreur $livreur): bool
    {
        return $user->can('livreurs.delete');
    }
}
