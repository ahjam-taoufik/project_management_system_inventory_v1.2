<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Permission;

class AssignAvoirValidationPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer l'utilisateur avec l'ID 1
        $user = User::find(1);

        if (!$user) {
            $this->command->error('Utilisateur avec ID 1 non trouvé');
            return;
        }

        // Permissions à assigner
        $permissions = [
            'avoirs.create',
            'avoirs.edit',
            'avoirs.delete',
            'avoirs.validate',
            'avoirs.view'
        ];

        foreach ($permissions as $permissionName) {
            $permission = Permission::where('name', $permissionName)->first();

            if (!$permission) {
                $this->command->error("Permission {$permissionName} non trouvée");
                continue;
            }

            // Assigner la permission à l'utilisateur
            $user->givePermissionTo($permission);
            $this->command->info("Permission {$permissionName} assignée à l'utilisateur ID 1");
        }
    }
}
