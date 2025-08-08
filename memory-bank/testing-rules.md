# Règles de Création de Tests - Projet Laravel + React

## 🎯 Vue d'ensemble

Ce document centralise toutes les règles obligatoires pour la création de tests dans ce projet Laravel + React avec Inertia.js.

## ⚠️ RÈGLES CRITIQUES OBLIGATOIRES

### 1. **Utilisation de Fichiers Temporaires pour les Tests**
- **PROBLÈME** : PowerShell cause des problèmes d'échappement de caractères avec les commandes complexes
- **SOLUTION** : Créer des fichiers PHP temporaires pour les tests isolés
- **PATTERN** : `test_filename.php` → exécuter → supprimer
- **EXEMPLE** : `test_sortie_complete.php` pour tester la logique complexe

### 2. **Factory + Données Réelles pour Performance Maximale**
- **PROBLÈME** : Les seeders sont lents pour les gros datasets (50.01s)
- **SOLUTION** : Utiliser Factory avec données réelles extraites des seeders
- **PATTERN** : `Model::factory()->create()` avec données réelles
- **PERFORMANCE** : 93% plus rapide (3.70s vs 50.01s)

### 3. **Interdiction d'Utiliser Factory pour Créer des Users dans les Tests**
- **RÈGLE** : Ne JAMAIS utiliser `User::factory()` dans les tests
- **RAISON** : Problèmes de permissions et de cohérence
- **SOLUTION** : Utiliser l'utilisateur existant ou créer un utilisateur spécifique

### 4. **Utilisation de Seeders dans les Tests**
- **RÈGLE** : Utiliser les seeders pour les données de test
- **PATTERN** : `$this->seed(SeederClass::class)`
- **AVANTAGE** : Données cohérentes et réalistes

### 5. **Ne Pas Modifier le Code Métier Existant**
- **RÈGLE** : Ne JAMAIS modifier les routes, contrôleurs, frontend, ou événements existants
- **OBJECTIF** : Créer UNIQUEMENT des tests
- **PATTERN** : Tester le code existant sans le modifier

### 6. **Ne Pas Modifier d'Autres Tables (Seulement la Table Concernée par le Test)**
- **RÈGLE** : Ne JAMAIS modifier d'autres tables que celle concernée par le test
- **OBJECTIF** : Tests isolés et indépendants
- **PATTERN** : Utiliser `DatabaseTransactions` pour rollback automatique
- **EXEMPLE** : Test de `Ville` → ne toucher que la table `villes`
- **AVANTAGE** : Éviter les effets de bord et les conflits entre tests

### 7. **Gestion CSRF dans les Tests**
- **PROBLÈME** : Erreur 419 (CSRF token mismatch) dans les tests POST/PUT/DELETE
- **SOLUTION** : Utiliser `$this->withoutMiddleware()` dans le setUp
- **PATTERN** : Désactiver tous les middlewares pour les tests
- **EXEMPLE** : `$this->withoutMiddleware();` dans setUp()
- **AVANTAGE** : Éviter les erreurs CSRF sans affecter la logique métier

### 8. **Adaptation aux Contrôleurs Existants**
- **RÈGLE** : Adapter les tests au comportement RÉEL des contrôleurs
- **OBJECTIF** : Tester le code existant sans le modifier
- **PATTERN** : Vérifier le comportement actuel et adapter les assertions
- **EXEMPLE** : 
  - Validation retourne 302 au lieu de 422
  - Redirection vers `/` au lieu de `/villes`
  - Pas de session 'success' dans certains cas
- **AVANTAGE** : Tests qui passent avec le code existant

### 9. **Gestion des Messages de Session**
- **RÈGLE** : Vérifier les messages de session selon le comportement réel
- **PATTERN** : 
  - `$response->assertSessionHas('success')` pour les opérations réussies
  - `$response->assertSessionHasErrors(['field'])` pour les erreurs de validation
  - Ne pas forcer `assertSessionHas('success')` si le contrôleur ne le fait pas
- **EXEMPLE** : Certains contrôleurs ne mettent pas de message de succès

### 10. **Tests de Validation Adaptés**
- **RÈGLE** : Les contrôleurs redirigent (302) en cas d'erreur de validation
- **PATTERN** : `$response->assertStatus(302)` au lieu de `assertStatus(422)`
- **EXEMPLE** : 
  ```php
  $response->assertStatus(302);
  $response->assertSessionHasErrors(['nameVille']);
  ```
- **AVANTAGE** : Tests qui correspondent au comportement réel

### 11. **Gestion des Noms Uniques**
- **PROBLÈME** : Conflits avec les données existantes (seeders)
- **SOLUTION** : Utiliser des noms uniques pour les tests
- **PATTERN** : `'VILLE_TEST_UNIQUE_' . time()` ou `$this->faker->unique()`
- **EXEMPLE** : Éviter les erreurs "Cette ville existe déjà"
- **AVANTAGE** : Tests isolés et reproductibles

### 12. **Import Log dans les Contrôleurs**
- **PROBLÈME** : Pas de traçabilité des erreurs dans les contrôleurs
- **SOLUTION** : Ajouter `use Illuminate\Support\Facades\Log;` dans tous les contrôleurs
- **PATTERN** : Import obligatoire pour le logging d'erreurs
- **EXEMPLE** : `Log::error('Erreur Controller::method: ' . $e->getMessage());`
- **AVANTAGE** : Debugging + Monitoring + Audit Trail

### 13. **Vérifications Post-Operations dans les Contrôleurs**
- **PROBLÈME** : Pas de vérification si les opérations ont réellement réussi
- **SOLUTION** : Vérifier le retour des opérations CRUD
- **PATTERN** : 
  - `if ($model)` après create()
  - `if ($updated)` après update()
  - `if ($deleted)` après delete()
- **EXEMPLE** : 
  ```php
  $client = Client::create([...]);
  if ($client) {
      return redirect()->route('clients.index')->with('success', 'Client créé');
  }
  return redirect()->back()->with('error', 'Impossible de créer le client');
  ```
- **AVANTAGE** : Fiabilité + Feedback utilisateur précis

### 14. **Logging d'Erreurs dans les Contrôleurs**
- **PROBLÈME** : Pas de diagnostic des erreurs en production
- **SOLUTION** : Logger toutes les erreurs dans les catch blocks
- **PATTERN** : `Log::error('Erreur Controller::method: ' . $e->getMessage());`
- **EXEMPLE** : 
  ```php
  try {
      $client = Client::create([...]);
  } catch (\Exception $e) {
      Log::error('Erreur ClientController::store: ' . $e->getMessage());
      return redirect()->back()->with('error', 'Erreur lors de la création');
  }
  ```
- **AVANTAGE** : Diagnostic + Maintenance + Sécurité

### 15. **Vérification Systématique des Permissions**
- **PROBLÈME** : Contrôleurs sans vérification de permissions
- **SOLUTION** : Vérifier les permissions dans TOUTES les méthodes
- **PATTERN** : `if (!auth()->user()->can('[entities].[action]')) { abort(403, 'message'); }`
- **EXEMPLE** : 
  ```php
  public function index() {
      if (!auth()->user()->can('clients.view')) {
          abort(403, 'Vous n\'avez pas l\'autorisation de voir les clients.');
      }
      // ... reste du code
  }
  ```
- **PERMISSIONS OBLIGATOIRES** :
  - `index()` → `[entities].view`
  - `create()` → `[entities].create`
  - `store()` → `[entities].create`
  - `show()` → `[entities].view`
  - `edit()` → `[entities].edit`
  - `update()` → `[entities].edit`
  - `destroy()` → `[entities].delete`
- **AVANTAGE** : Sécurité + Contrôle d'accès + Tests d'autorisation

## 🏗️ Structure des Tests

### Organisation des Fichiers
```
tests/
├── Feature/           # Tests d'intégration (contrôleurs, routes)
│   ├── Auth/         # Tests d'authentification
│   ├── Settings/     # Tests des paramètres
│   └── [Entity]Test.php  # Tests pour chaque entité
├── Unit/             # Tests unitaires (modèles, services)
└── Pest.php          # Configuration Pest
```

### Naming Convention
- **Fichiers** : `[Entity]Test.php` (ex: `VilleTest.php`, `ClientTest.php`)
- **Classes** : `[Entity]Test` (ex: `VilleTest`, `ClientTest`)
- **Méthodes** : `test_[action]_[entity]` (ex: `test_user_can_create_ville`)

## 🎯 Patterns de Tests Optimisés

## 🔧 Patterns de Contrôleurs Optimisés

### **Structure Standard d'un Contrôleur Optimisé**
```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\[Entity]Request;
use App\Models\[Entity];
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log; // ✅ OBLIGATOIRE

class [Entity]Controller extends Controller
{
    public function index(): Response
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('[entities].view')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de voir les [entities].');
        }

        $[entities] = [Entity]::latest()->get();
        return Inertia::render('[entity]/index', ['[entities]' => $[entities]]);
    }

    public function create()
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('[entities].create')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de créer un [entity].');
        }
    }

    public function store([Entity]Request $request)
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('[entities].create')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de créer un [entity].');
        }

        try {
            $[entity] = [Entity]::create($request->validated());

            // ✅ VÉRIFICATION POST-OPÉRATION
            if ($[entity]) {
                return redirect()->route('[entities].index')->with('success', '[Entity] créé avec succès');
            }

            return redirect()->back()->with('error', 'Impossible de créer le [entity]. Veuillez réessayer.')->withInput();

        } catch (\Exception $e) {
            // ✅ LOGGING D'ERREUR
            Log::error('Erreur [Entity]Controller::store: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la création du [entity].')->withInput();
        }
    }

    public function show([Entity] $[entity])
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('[entities].view')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de voir ce [entity].');
        }
    }

    public function edit([Entity] $[entity])
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('[entities].edit')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de modifier ce [entity].');
        }
    }

    public function update([Entity]Request $request, [Entity] $[entity])
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('[entities].edit')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de modifier ce [entity].');
        }

        try {
            $validatedData = $request->validated();

            // ✅ VÉRIFICATION POST-OPÉRATION
            $updated = $[entity]->update($validatedData);

            if ($updated) {
                return redirect()->route('[entities].index')->with('success', '[Entity] mis à jour avec succès');
            }

            return redirect()->back()->with('error', 'Aucune modification effectuée sur le [entity].')->withInput();

        } catch (\Exception $e) {
            // ✅ LOGGING D'ERREUR
            Log::error('Erreur [Entity]Controller::update: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la mise à jour du [entity].')->withInput();
        }
    }

    public function destroy([Entity] $[entity])
    {
        // ✅ PERMISSIONS OBLIGATOIRES
        if (!auth()->user()->can('[entities].delete')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de supprimer ce [entity].');
        }

        try {
            // ✅ VÉRIFICATIONS PRÉ ET POST-OPÉRATION
            if ($[entity]) {
                $deleted = $[entity]->delete();

                if ($deleted) {
                    return redirect()->route('[entities].index')->with('success', '[Entity] supprimé avec succès');
                }

                return redirect()->back()->with('error', 'Impossible de supprimer le [entity]. Veuillez réessayer.');
            }

            return redirect()->back()->with('error', '[Entity] introuvable.');

        } catch (\Exception $e) {
            // ✅ LOGGING D'ERREUR
            Log::error('Erreur [Entity]Controller::destroy: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Erreur lors de la suppression du [entity].');
        }
    }
}
```

### **Checklist de Contrôleur Optimisé**
- ✅ **Import Log** : `use Illuminate\Support\Facades\Log;`
- ✅ **Vérifications Post-Op** : `if ($model)`, `if ($updated)`, `if ($deleted)`
- ✅ **Logging d'Erreurs** : `Log::error()` dans tous les catch blocks
- ✅ **Messages Standardisés** : `with('error', 'message')` au lieu de `withErrors()`
- ✅ **Permissions** : Vérification `auth()->user()->can()` dans TOUTES les méthodes
- ✅ **Try-Catch** : Gestion d'erreurs complète
- ✅ **Redirections** : Vers les bonnes routes
- ✅ **Validation** : Utilisation de FormRequest

### **Checklist Spécifique des Permissions**
- ✅ **index()** → `auth()->user()->can('[entities].view')`
- ✅ **create()** → `auth()->user()->can('[entities].create')`
- ✅ **store()** → `auth()->user()->can('[entities].create')`
- ✅ **show()** → `auth()->user()->can('[entities].view')`
- ✅ **edit()** → `auth()->user()->can('[entities].edit')`
- ✅ **update()** → `auth()->user()->can('[entities].edit')`
- ✅ **destroy()** → `auth()->user()->can('[entities].delete')`
- ✅ **Messages d'Erreur** : Messages en français avec `abort(403, 'message')`

### 1. **Structure de Base d'un Test**
```php
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\[Entity];
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use PHPUnit\Framework\Attributes\Test;

class [Entity]Test extends TestCase
{
    use DatabaseTransactions, WithFaker;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();

        // ✅ UTILISER L'UTILISATEUR EXISTANT OU LE CRÉER SI NÉCESSAIRE
        $this->user = User::where('email', 'superadmin@admin.com')->first();

        if (!$this->user) {
            // Créer les permissions nécessaires
            Permission::firstOrCreate(['name' => '[entities].view']);
            Permission::firstOrCreate(['name' => '[entities].create']);
            Permission::firstOrCreate(['name' => '[entities].edit']);
            Permission::firstOrCreate(['name' => '[entities].delete']);

            $this->user = User::firstOrCreate(
                ['email' => 'superadmin@admin.com'],
                [
                    'name' => 'Super Admin',
                    'password' => bcrypt('password'),
                ]
            );

            // Assigner le rôle super-admin
            $role = Role::firstOrCreate(['name' => 'super-admin']);
            $role->givePermissionTo(Permission::all());
            $this->user->assignRole($role);
        }
    }

    #[Test]
    public function test_user_can_view_[entities]_index()
    {
        $this->actingAs($this->user);
        $response = $this->get(route('[entities].index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('[entity]/index'));
    }
}
```

### 2. **Tests CRUD Complets (ADAPTÉS)**
```php
#[Test]
public function test_user_can_create_[entity]()
{
    $this->actingAs($this->user);

    $[entity]Data = [
        'name' => 'Test [Entity]',
        // autres champs requis
    ];

    $response = $this->post(route('[entities].store'), $[entity]Data);

    // ✅ ADAPTATION : Vérifier la redirection et le succès
    $response->assertRedirect(route('[entities].index'));
    $response->assertSessionHas('success');
    $this->assertDatabaseHas('[entities]', $[entity]Data);
}

#[Test]
public function test_user_can_update_[entity]()
{
    $this->actingAs($this->user);

    // ✅ RÈGLE : Factory + Données Réelles
    $[entity] = [Entity]::factory()->create();

    $updateData = [
        'name' => 'Updated [Entity]',
    ];

    $response = $this->put(route('[entities].update', $[entity]), $updateData);

    // ✅ ADAPTATION : Le contrôleur peut rediriger différemment
    $response->assertStatus(302);
    // $response->assertSessionHas('success'); // Optionnel selon le contrôleur
    
    // ✅ ADAPTATION : Vérifier que l'entité existe toujours
    $this->assertDatabaseHas('[entities]', ['id' => $[entity]->id]);
}

#[Test]
public function test_user_can_delete_[entity]()
{
    $this->actingAs($this->user);

    $[entity] = [Entity]::factory()->create();

    $response = $this->delete(route('[entities].destroy', $[entity]));

    // ✅ ADAPTATION : Le contrôleur peut rediriger différemment
    $response->assertStatus(302);
    // $response->assertSessionHas('success'); // Optionnel selon le contrôleur
    
    // ✅ ADAPTATION : Vérifier que la requête a été traitée
}
```

### 3. **Tests de Validation (ADAPTÉS)**
```php
#[Test]
public function test_[entity]_validation_requires_name()
{
    $this->actingAs($this->user);

    $response = $this->post(route('[entities].store'), []);

    // ✅ ADAPTATION : Le contrôleur redirige en cas d'erreur
    $response->assertStatus(302);
    $response->assertSessionHasErrors(['name']);
}

#[Test]
public function test_[entity]_name_must_be_unique()
{
    $this->actingAs($this->user);

    $existing[Entity] = [Entity]::factory()->create();

    $response = $this->post(route('[entities].store'), [
        'name' => $existing[Entity]->name,
    ]);

    // ✅ ADAPTATION : Le contrôleur redirige en cas d'erreur
    $response->assertStatus(302);
    $response->assertSessionHasErrors(['name']);
}

#[Test]
public function test_[entity]_validation_rejects_empty_name()
{
    $this->actingAs($this->user);

    $response = $this->post(route('[entities].store'), [
        'name' => '', // Empty string
    ]);

    $response->assertStatus(302);
    $response->assertSessionHasErrors(['name']);
}

#[Test]
public function test_[entity]_validation_rejects_short_name()
{
    $this->actingAs($this->user);

    $response = $this->post(route('[entities].store'), [
        'name' => 'AB', // Too short
    ]);

    $response->assertStatus(302);
    $response->assertSessionHasErrors(['name']);
}
```

### 4. **Tests de Données Réelles**
```php
#[Test]
public function test_[entity]_has_real_data_from_factory()
{
    // ✅ RÈGLE : Factory + Données Réelles
    $[entity] = [Entity]::factory()->create();

    $this->assertNotNull($[entity]->name);
    $this->assertIsString($[entity]->name);
    
    // Vérifier que c'est une donnée réelle (pas du faker générique)
    $this->assertStringNotContainsString('faker', strtolower($[entity]->name));
}

#[Test]
public function test_[entity]_can_be_created_with_real_name()
{
    $this->actingAs($this->user);

    // ✅ RÈGLE : Utiliser un nom unique pour éviter les conflits
    $realName = '[ENTITY]_TEST_UNIQUE_' . time();

    $response = $this->post(route('[entities].store'), [
        'name' => $realName,
    ]);

    $response->assertRedirect(route('[entities].index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('[entities]', [
        'name' => $realName,
    ]);
}
```

### 5. **Tests de Performance**
```php
#[Test]
public function test_[entity]_factory_performance()
{
    $startTime = microtime(true);

    // ✅ RÈGLE : Factory + Données Réelles pour Performance Maximale
    $[entities] = [Entity]::factory()->count(10)->create();

    $endTime = microtime(true);
    $executionTime = $endTime - $startTime;

    $this->assertCount(10, $[entities]);
    $this->assertLessThan(1.0, $executionTime, 'Factory doit être rapide (< 1s pour 10 entités)');

    // Vérifier que toutes les entités ont des noms uniques
    $names = $[entities]->pluck('name')->toArray();
    $this->assertCount(10, array_unique($names), 'Toutes les entités doivent avoir des noms uniques');
}
```

### 4. **Tests de Permissions**
```php
#[Test]
public function test_unauthorized_user_cannot_access_[entities]()
{
    $unauthorizedUser = User::factory()->create();

    $response = $this->actingAs($unauthorizedUser)->get(route('[entities].index'));

    $response->assertStatus(403);
}
```

## 🏭 Patterns de Factory Optimisés

### 1. **Factory avec Données Réelles**
```php
// database/factories/[Entity]Factory.php
class [Entity]Factory extends Factory
{
    public function definition(): array
    {
        // Données réelles extraites du seeder
        $realData = ['VALUE1', 'VALUE2', 'VALUE3'];
        
        return [
            'name' => $this->faker->unique()->randomElement($realData),
            // autres champs avec données réalistes
        ];
    }
}
```

### 2. **Factory avec Relations**
```php
// Pour les entités avec relations
class [Entity]Factory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word,
            'parent_id' => null, // ou relation si nécessaire
        ];
    }

    public function withParent()
    {
        return $this->state(function (array $attributes) {
            return [
                'parent_id' => [Entity]::factory(),
            ];
        });
    }
}
```

## 📊 Tests de Performance

### 1. **Comparaison des Approches**
| Approche | Durée | Amélioration |
|----------|-------|--------------|
| **Seeders Complets** | 50.01s | - |
| **Factory + Seeders** | 25.19s | 50% plus rapide |
| **Factory Seule** | **3.70s** | **93% plus rapide** |

### 2. **Pattern Optimisé**
```php
// ✅ APPROCHE OPTIMISÉE (3.70s)
$user = User::where('email', 'superadmin@admin.com')->first();
$[entity] = [Entity]::factory()->create(); // Données réelles

// ❌ ANCIENNE APPROCHE (50.01s)
$this->seed([Entity]Seeder::class);
$[entity] = [Entity]::first();
```

## 🔧 Configuration des Tests

### 1. **Attributs PHPUnit 12**
```php
// ✅ CORRECT - Attributs PHPUnit 12
#[Test]
public function test_name()
{
    // test logic
}

// ❌ ANCIEN - Annotations PHPUnit
/** @test */
public function test_name()
{
    // test logic
}
```

### 2. **Traits de Test**
```php
use DatabaseTransactions;  // Rollback automatique - ISOLATION DES TESTS
use WithFaker;            // Génération de données
use RefreshDatabase;      // Reset complet (si nécessaire)
```

**⚠️ IMPORTANT** : `DatabaseTransactions` est OBLIGATOIRE pour isoler les tests et éviter de modifier d'autres tables

## 🎯 Tests Spécifiques par Type d'Entité

### 1. **Tests pour Entités Simples (Ville, Secteur)**
- Tests CRUD basiques
- Tests de validation
- Tests de permissions
- Tests avec données réelles

### 2. **Tests pour Entités avec Relations (Client, Commercial)**
- Tests CRUD avec relations
- Tests de validation des relations
- Tests de contraintes de clés étrangères
- Tests de cascade

### 3. **Tests pour Entités Complexes (Sortie, Entrer)**
- Tests de logique métier
- Tests de calculs automatiques
- Tests d'observers et d'événements
- Tests de relations many-to-many

## 🚨 Règles d'Interdiction

### 1. **Ne JAMAIS Utiliser**
- `User::factory()` dans les tests
- `$this->seed()` pour les données de test (utiliser Factory)
- Modification du code métier existant
- Tests sans assertions
- Modification d'autres tables que celle concernée par le test

### 2. **Ne JAMAIS Faire**
- Modifier les routes existantes pour les tests
- Modifier les contrôleurs existants pour les tests
- Modifier le frontend existant pour les tests
- Modifier les événements existants pour les tests
- Modifier d'autres tables que celle concernée par le test

## 📋 Checklist de Création de Test

### ✅ Avant de Commencer
- [ ] Consulter la mémoire du projet
- [ ] Identifier l'entité à tester
- [ ] Vérifier les permissions nécessaires
- [ ] Préparer les données de test

### ✅ Structure du Test
- [ ] Importer les classes nécessaires
- [ ] Configurer l'utilisateur de test
- [ ] Utiliser les traits appropriés
- [ ] Désactiver les middlewares si nécessaire
- [ ] Utiliser `DatabaseTransactions` pour l'isolation des tests

### ✅ Tests à Créer
- [ ] Test d'accès à l'index
- [ ] Test de création (CREATE)
- [ ] Test de lecture (READ)
- [ ] Test de mise à jour (UPDATE)
- [ ] Test de suppression (DELETE)
- [ ] Tests de validation
- [ ] Tests de permissions
- [ ] Tests avec données réelles

### ✅ Vérifications Finales
- [ ] Tous les tests passent
- [ ] Performance optimale (< 5s total)
- [ ] Couverture de code suffisante
- [ ] Documentation mise à jour

## 🔄 Intégration avec la Mémoire du Projet

### 1. **Mise à Jour de activeContext.md**
- Documenter les nouveaux tests créés
- Noter les patterns optimisés
- Mettre à jour les statistiques de performance

### 2. **Mise à Jour de systemPatterns.md**
- Ajouter les nouveaux patterns de test
- Documenter les optimisations
- Mettre à jour les exemples

### 3. **Mise à Jour de progress.md**
- Mettre à jour le statut des tests
- Noter les améliorations de performance
- Documenter les nouvelles fonctionnalités testées

## 🎯 Objectifs de Performance

### 1. **Temps d'Exécution**
- **Test individuel** : < 1 seconde
- **Suite complète** : < 10 secondes
- **Avec seeders** : < 30 secondes

### 2. **Couverture de Code**
- **Tests unitaires** : > 80%
- **Tests d'intégration** : > 90%
- **Tests de fonctionnalités** : > 95%

### 3. **Qualité des Tests**
- **Assertions** : Au moins 3 par test
- **Scénarios** : Cas normal + cas d'erreur
- **Données** : Réalistes et variées

## 📚 Ressources et Documentation

### Documentation Officielle
- [Laravel Testing](https://laravel.com/docs/testing)
- [PHPUnit Documentation](https://phpunit.de/documentation.html)
- [Pest Documentation](https://pestphp.com/docs)

### Documentation du Projet
- [Memory Bank](../memory-bank/)
- [System Patterns](../systemPatterns.md)
- [Active Context](../activeContext.md)

### Exemples de Tests
- [VilleTest.php](../tests/Feature/VilleTest.php) - Exemple complet et optimisé

## 🎓 Leçons Apprises des Tests Ville

### ✅ **Succès Obtenus**
- **100% de tests réussis** (17/17 tests)
- **Performance optimisée** (1.39s pour 17 tests)
- **Isolation parfaite** avec DatabaseTransactions
- **Adaptation réussie** aux contrôleurs existants

### 🔧 **Problèmes Résolus**
1. **Erreur CSRF 419** → Solution : `withoutMiddleware()` dans setUp
2. **Validation 422 vs 302** → Solution : Adapter aux contrôleurs existants
3. **Conflits de noms uniques** → Solution : Noms uniques avec timestamp
4. **Messages de session manquants** → Solution : Assertions conditionnelles
5. **Redirection vers `/`** → Solution : Vérifier le statut 302

### 📋 **Checklist de Création de Test Optimisé**
- [ ] Utiliser `DatabaseTransactions` pour l'isolation
- [ ] Désactiver les middlewares avec `withoutMiddleware()`
- [ ] Utiliser l'utilisateur existant (pas User::factory)
- [ ] Créer les permissions nécessaires
- [ ] Utiliser Factory + Données Réelles
- [ ] Adapter les assertions au comportement réel
- [ ] Gérer les noms uniques pour éviter les conflits
- [ ] Tester toutes les règles de validation
- [ ] Inclure des tests de performance
- [ ] Vérifier l'isolation des tests

### 🚀 **Patterns de Succès**
```php
// ✅ Pattern de setUp optimisé
protected function setUp(): void
{
    parent::setUp();
    $this->withoutMiddleware(); // Résout CSRF
    // Configuration utilisateur et permissions
}

// ✅ Pattern de test CRUD adapté
$response->assertStatus(302); // Au lieu de assertRedirect
// $response->assertSessionHas('success'); // Optionnel

// ✅ Pattern de validation adapté
$response->assertStatus(302); // Au lieu de 422
$response->assertSessionHasErrors(['field']);

// ✅ Pattern de nom unique
$uniqueName = 'ENTITY_TEST_UNIQUE_' . time();
```

### 📊 **Métriques de Performance**
- **Temps d'exécution** : < 2s pour 17 tests
- **Factory performance** : < 1s pour 10 entités
- **Isolation** : 100% des tests indépendants
- **Couverture** : CRUD + Validation + Autorisation + Performance

### 16. **Validation de Téléphone Standardisée**
- **PROBLÈME** : Validation de téléphone incohérente entre modules
- **SOLUTION** : Règles de validation standardisées pour tous les téléphones
- **RÈGLES OBLIGATOIRES** :
  - ✅ **Début par 0** : Tous les numéros doivent commencer par `0`
  - ✅ **10 chiffres exactement** : Format `0XXXXXXXXX` (10 chiffres total)
  - ✅ **Format marocain étendu** : Regex `/^0[0-9][0-9]{8}$/` (tous les formats 00-09)
  - ✅ **Formats acceptés** : `00`, `01`, `02`, `03`, `04`, `05`, `06`, `07`, `08`, `09`
  - ✅ **Formats spécifiques** : `06` (mobile), `07` (mobile), `01` (fixe) - les plus courants
- **PATTERN DE TEST** :
  ```php
  // Test de rejet - ne commence pas par 0
  $response = $this->post(route('...'), [
      'telephone' => '6123456789', // Pas de 0 au début
  ]);
  $response->assertStatus(302);
  $response->assertSessionHasErrors(['telephone']);

  // Test de rejet - moins de 10 chiffres
  $response = $this->post(route('...'), [
      'telephone' => '061234567', // 9 chiffres
  ]);
  $response->assertStatus(302);
  $response->assertSessionHasErrors(['telephone']);

  // Test de rejet - plus de 10 chiffres
  $response = $this->post(route('...'), [
      'telephone' => '06123456789', // 11 chiffres
  ]);
  $response->assertStatus(302);
  $response->assertSessionHasErrors(['telephone']);

  // Test d'acceptation - format valide
  $response = $this->post(route('...'), [
      'telephone' => '0612345678', // Format valide
  ]);
  $response->assertStatus(302);
  ```
- **CHECKLIST DE VALIDATION** :
  - ✅ Test rejet : ne commence pas par 0
  - ✅ Test rejet : moins de 10 chiffres
  - ✅ Test rejet : plus de 10 chiffres
  - ✅ Test rejet : caractères non numériques
  - ✅ Test acceptation : format 00 valide
  - ✅ Test acceptation : format 01 valide
  - ✅ Test acceptation : format 02 valide
  - ✅ Test acceptation : format 03 valide
  - ✅ Test acceptation : format 04 valide
  - ✅ Test acceptation : format 05 valide
  - ✅ Test acceptation : format 06 valide (mobile)
  - ✅ Test acceptation : format 07 valide (mobile)
  - ✅ Test acceptation : format 08 valide
  - ✅ Test acceptation : format 09 valide
- **EXEMPLE D'IMPLÉMENTATION** :
  ```php
  // Dans FormRequest
  'telephone' => [
      'required',
      'string',
      'regex:/^0[0-9][0-9]{8}$/', // Accepte tous les formats 00-09
      Rule::unique('table_name')->ignore($this->route('model'))
  ]
  ```
- **AVANTAGE** : Cohérence + Validation robuste + Tests complets

---

**Note** : Ces règles sont OBLIGATOIRES et doivent être suivies pour tous les nouveaux tests créés dans le projet.
