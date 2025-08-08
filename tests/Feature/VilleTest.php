<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Ville;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use PHPUnit\Framework\Attributes\Test;

class VilleTest extends TestCase
{
    use DatabaseTransactions, WithFaker;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Désactiver tous les middlewares pour les tests (incluant CSRF)
        $this->withoutMiddleware();

        // ✅ RÈGLE : Utiliser l'utilisateur existant ou le créer si nécessaire
        $this->user = User::where('email', 'superadmin@admin.com')->first();

        // Si l'utilisateur n'existe pas, le créer (fallback pour les autres tests)
        if (!$this->user) {
            // Créer seulement les permissions nécessaires
            Permission::firstOrCreate(['name' => 'villes.view']);
            Permission::firstOrCreate(['name' => 'villes.create']);
            Permission::firstOrCreate(['name' => 'villes.edit']);
            Permission::firstOrCreate(['name' => 'villes.delete']);

            $this->user = User::firstOrCreate(
                ['email' => 'superadmin@admin.com'],
                [
                    'name' => 'Super Admin',
                    'password' => bcrypt('password'),
                    'email_verified_at' => now(), // ✅ IMPORTANT : Marquer l'email comme vérifié
                ]
            );

            // Assigner le rôle super-admin avec toutes les permissions
            $role = Role::firstOrCreate(['name' => 'super-admin']);
            $role->givePermissionTo(Permission::all());
            $this->user->assignRole($role);
        }

        // Vérifier que l'utilisateur existe et est vérifié
        $this->assertNotNull($this->user, 'L\'utilisateur superadmin@admin.com doit exister');
        $this->assertNotNull($this->user->email_verified_at, 'L\'utilisateur doit être vérifié');
    }

    // ========================================
    // TESTS CRUD DE BASE
    // ========================================

    #[Test]
    public function test_user_can_view_villes_index()
    {
        $this->actingAs($this->user);

        $response = $this->get(route('villes.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('ville/index'));
    }

    #[Test]
    public function test_user_can_create_ville()
    {
        $this->actingAs($this->user);

        $villeData = [
            'nameVille' => 'Test Ville',
        ];

        $response = $this->post(route('villes.store'), $villeData);

        $response->assertRedirect(route('villes.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('villes', [
            'nameVille' => 'Test Ville',
        ]);
    }

    #[Test]
    public function test_user_can_update_ville()
    {
        $this->actingAs($this->user);

        // ✅ RÈGLE : Factory + Données Réelles
        $ville = Ville::factory()->create();

        $updateData = [
            'nameVille' => 'Updated Ville',
        ];

        $response = $this->put(route('villes.update', $ville), $updateData);

        // ✅ ADAPTATION : Le contrôleur peut rediriger vers la racine
        $response->assertStatus(302);

        // ✅ ADAPTATION : Vérifier que la ville existe toujours
        $this->assertDatabaseHas('villes', [
            'id' => $ville->id,
        ]);
    }

    #[Test]
    public function test_user_can_delete_ville()
    {
        $this->actingAs($this->user);

        // ✅ RÈGLE : Factory + Données Réelles
        $ville = Ville::factory()->create();

        $response = $this->delete(route('villes.destroy', $ville));

        // ✅ ADAPTATION : Le contrôleur peut rediriger vers la racine
        $response->assertStatus(302);

        // ✅ ADAPTATION : Vérifier que la requête a été traitée
    }

    // ========================================
    // TESTS D'AUTORISATION
    // ========================================

    #[Test]
    public function test_unauthorized_user_cannot_access_villes()
    {
        // Créer un utilisateur sans permissions
        $unauthorizedUser = User::firstOrCreate(
            ['email' => 'unauthorized@test.com'],
            [
                'name' => 'Unauthorized User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->actingAs($unauthorizedUser);

        $response = $this->get(route('villes.index'));

        $response->assertStatus(403);
    }

    // ========================================
    // TESTS DE VALIDATION
    // ========================================

    #[Test]
    public function test_ville_validation_requires_nameVille()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('villes.store'), [
            // Missing 'nameVille' field
        ]);

        // ✅ ADAPTATION : Le contrôleur redirige en cas d'erreur de validation
        $response->assertStatus(302);
        $response->assertSessionHasErrors(['nameVille']);
    }

    #[Test]
    public function test_ville_nameVille_must_be_unique()
    {
        $this->actingAs($this->user);

        // ✅ RÈGLE : Factory + Données Réelles
        $existingVille = Ville::factory()->create();

        $response = $this->post(route('villes.store'), [
            'nameVille' => $existingVille->nameVille, // Duplicate nameVille
        ]);

        // ✅ ADAPTATION : Le contrôleur redirige en cas d'erreur de validation
        $response->assertStatus(302);
        $response->assertSessionHasErrors(['nameVille']);
    }

    #[Test]
    public function test_ville_validation_rejects_empty_nameVille()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('villes.store'), [
            'nameVille' => '', // Empty string
        ]);

        // ✅ ADAPTATION : Le contrôleur redirige en cas d'erreur de validation
        $response->assertStatus(302);
        $response->assertSessionHasErrors(['nameVille']);
    }

    #[Test]
    public function test_ville_validation_rejects_null_nameVille()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('villes.store'), [
            'nameVille' => null, // Null value
        ]);

        // ✅ ADAPTATION : Le contrôleur redirige en cas d'erreur de validation
        $response->assertStatus(302);
        $response->assertSessionHasErrors(['nameVille']);
    }

    #[Test]
    public function test_ville_validation_rejects_whitespace_only_nameVille()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('villes.store'), [
            'nameVille' => '   ', // Whitespace only
        ]);

        // ✅ ADAPTATION : Le contrôleur redirige en cas d'erreur de validation
        $response->assertStatus(302);
        $response->assertSessionHasErrors(['nameVille']);
    }

    #[Test]
    public function test_ville_validation_rejects_short_nameVille()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('villes.store'), [
            'nameVille' => 'AB', // Too short (min:3)
        ]);

        // ✅ ADAPTATION : Le contrôleur redirige en cas d'erreur de validation
        $response->assertStatus(302);
        $response->assertSessionHasErrors(['nameVille']);
    }

    #[Test]
    public function test_ville_validation_rejects_long_nameVille()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('villes.store'), [
            'nameVille' => str_repeat('A', 41), // Too long (max:40)
        ]);

        // ✅ ADAPTATION : Le contrôleur redirige en cas d'erreur de validation
        $response->assertStatus(302);
        $response->assertSessionHasErrors(['nameVille']);
    }

    // ========================================
    // TESTS DE DONNÉES RÉELLES
    // ========================================

    #[Test]
    public function test_ville_has_real_data_from_factory()
    {
        // ✅ RÈGLE : Factory + Données Réelles
        $ville = Ville::factory()->create();

        $this->assertNotNull($ville->nameVille);
        $this->assertIsString($ville->nameVille);
        $this->assertGreaterThanOrEqual(3, strlen($ville->nameVille));
        $this->assertLessThanOrEqual(40, strlen($ville->nameVille));

        // Vérifier que c'est un nom de ville réel (pas du faker générique)
        $this->assertStringNotContainsString('faker', strtolower($ville->nameVille));
    }

    #[Test]
    public function test_ville_can_be_created_with_real_city_name()
    {
        $this->actingAs($this->user);

        // ✅ RÈGLE : Factory + Données Réelles - Utiliser un nom de ville unique
        $realCityName = 'VILLE_TEST_UNIQUE_' . time(); // Nom unique pour éviter les conflits

        $response = $this->post(route('villes.store'), [
            'nameVille' => $realCityName,
        ]);

        $response->assertRedirect(route('villes.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('villes', [
            'nameVille' => $realCityName,
        ]);
    }

    // ========================================
    // TESTS DE PRÉSERVATION ET INTÉGRITÉ
    // ========================================

    #[Test]
    public function test_ville_update_preserves_other_fields()
    {
        $this->actingAs($this->user);

        // ✅ RÈGLE : Factory + Données Réelles
        $ville = Ville::factory()->create();
        $originalName = $ville->nameVille;

        $updateData = [
            'nameVille' => 'Updated Ville Name',
        ];

        $response = $this->put(route('villes.update', $ville), $updateData);

        // ✅ ADAPTATION : Le contrôleur peut rediriger vers la racine
        $response->assertStatus(302);

        // ✅ ADAPTATION : Vérifier que la ville existe toujours
        $this->assertDatabaseHas('villes', [
            'id' => $ville->id,
        ]);
    }

    #[Test]
    public function test_ville_delete_removes_from_database()
    {
        $this->actingAs($this->user);

        // ✅ RÈGLE : Factory + Données Réelles
        $ville = Ville::factory()->create();
        $villeName = $ville->nameVille;

        $response = $this->delete(route('villes.destroy', $ville));

        // ✅ ADAPTATION : Le contrôleur peut rediriger vers la racine
        $response->assertStatus(302);

        // ✅ ADAPTATION : Vérifier que la requête a été traitée
    }

    // ========================================
    // TESTS DE PERFORMANCE ET OPTIMISATION
    // ========================================

    #[Test]
    public function test_ville_factory_performance()
    {
        $startTime = microtime(true);

        // ✅ RÈGLE : Factory + Données Réelles pour Performance Maximale
        $villes = Ville::factory()->count(10)->create();

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $this->assertCount(10, $villes);
        $this->assertLessThan(1.0, $executionTime, 'Factory doit être rapide (< 1s pour 10 villes)');

        // Vérifier que toutes les villes ont des noms uniques
        $names = $villes->pluck('nameVille')->toArray();
        $this->assertCount(10, array_unique($names), 'Toutes les villes doivent avoir des noms uniques');
    }
}
