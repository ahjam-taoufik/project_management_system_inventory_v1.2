# Commande générique de suppression de tables

## 🗑️ Commande : `table:clear`

Cette commande permet de vider n'importe quelle table de la base de données de manière sécurisée.

### Utilisation de base

```bash
# Vider une table simple
php artisan table:clear sorties

# Vider une table avec confirmation forcée
php artisan table:clear sorties --force

# Vider une table et ses tables liées
php artisan table:clear sorties --related
```

### Paramètres

- `{table}` : Nom de la table à vider (obligatoire)
- `--force` : Forcer la suppression sans demander confirmation
- `--related` : Supprimer aussi les tables liées par clés étrangères

### Exemples d'utilisation

#### 1. Vider la table sorties
```bash
php artisan table:clear sorties
```
**Résultat :**
- Compte les enregistrements dans `sorties`
- Demande confirmation
- Supprime tous les enregistrements

#### 2. Vider sorties avec ses tables liées
```bash
php artisan table:clear sorties --related
```
**Résultat :**
- Détecte automatiquement `sortie_products` (liée à `sorties`)
- Supprime d'abord `sortie_products`
- Puis supprime `sorties`

#### 3. Vider sans confirmation
```bash
php artisan table:clear sorties --force
```

#### 4. Vider avec tables liées et sans confirmation
```bash
php artisan table:clear sorties --related --force
```

### Tables couramment utilisées

```bash
# Tables de base
php artisan table:clear users
php artisan table:clear clients
php artisan table:clear products
php artisan table:clear commerciaux
php artisan table:clear livreurs

# Tables de mouvements
php artisan table:clear sorties --related
php artisan table:clear entrers --related
php artisan table:clear stocks

# Tables de configuration
php artisan table:clear categories
php artisan table:clear brands
php artisan table:clear villes
php artisan table:clear secteurs
```

### Sécurité

✅ **Vérifications automatiques :**
- Vérifie que la table existe
- Compte les enregistrements avant suppression
- Demande confirmation (sauf avec `--force`)
- Gère les clés étrangères automatiquement

✅ **Gestion des erreurs :**
- Messages d'erreur clairs
- Codes de retour appropriés
- Rollback en cas d'erreur

### Workflow typique

```bash
# 1. Vider les tables
php artisan table:clear sorties --related --force

# 2. Recréer les données
php artisan db:seed --class=SortieSeeder

# 3. Vérifier
php artisan tinker --execute="echo 'Sorties: ' . DB::table('sorties')->count();"
```

### Avantages

- 🎯 **Générique** : Fonctionne avec n'importe quelle table
- 🔒 **Sécurisé** : Confirmation et vérifications
- 🔗 **Intelligent** : Détecte automatiquement les tables liées
- 📊 **Informatif** : Affiche les statistiques
- ⚡ **Rapide** : Suppression en une commande

### Remarques

- La commande utilise `DELETE` et non `TRUNCATE` pour éviter les problèmes de clés étrangères
- Les tables liées sont supprimées dans le bon ordre (enfant avant parent)
- Les IDs ne sont pas réinitialisés (contrairement à `TRUNCATE`)
