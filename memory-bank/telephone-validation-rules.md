# Règles de Validation de Téléphone - Projet Standardisé

## 🎯 Vue d'ensemble

Ce document définit les règles OBLIGATOIRES de validation de téléphone pour tous les modules du projet Laravel + React.

## 📱 Règles de Validation Standardisées

### **RÈGLES OBLIGATOIRES**

#### 1. **Début par 0**
- **RÈGLE** : Tous les numéros de téléphone doivent commencer par `0`
- **EXEMPLE VALIDE** : `0612345678`
- **EXEMPLE INVALIDE** : `6123456789`

#### 2. **10 chiffres exactement**
- **RÈGLE** : Format `0XXXXXXXXX` (10 chiffres au total)
- **EXEMPLE VALIDE** : `0612345678` (10 chiffres)
- **EXEMPLE INVALIDE** : `061234567` (9 chiffres) ou `06123456789` (11 chiffres)

#### 3. **Format marocain**
- **RÈGLE** : Regex `/^0[671][0-9]{8}$/`
- **FORMATS ACCEPTÉS** : `06`, `07`, `01`
- **EXEMPLE VALIDE** : `0612345678`, `0712345678`, `0112345678`
- **EXEMPLE INVALIDE** : `0812345678`, `0912345678`

## 🔧 Implémentation Technique

### **✅ NOUVELLE APPROCHE : ValidationHelper (Recommandée)**

**Utilisation du Helper centralisé :**

```php
<?php

namespace App\Http\Requests;

use App\Helpers\ValidationHelper;
use Illuminate\Foundation\Http\FormRequest;

class ExampleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'telephone' => ValidationHelper::telephoneRules('telephone', 'table_name', $this->route('model'))
        ];
    }

    public function messages(): array
    {
        return [
            ...ValidationHelper::telephoneMessages('telephone')
        ];
    }
}
```

### **Méthodes disponibles dans ValidationHelper :**

1. **`telephoneRules($fieldName, $tableName, $ignoreId = null)`** : Règles obligatoires
2. **`optionalTelephoneRules($fieldName, $tableName, $ignoreId = null)`** : Règles optionnelles (nullable)
3. **`telephoneMessages($fieldName)`** : Messages d'erreur standardisés

### **Ancienne Approche (Dépréciée)**

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExampleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'telephone' => [
                'required',
                'string',
                'min:10',
                'max:10',
                'regex:/^0[0-9][0-9]{8}$/',
                Rule::unique('table_name')->ignore($this->route('model'))
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'telephone.required' => 'Le numéro de téléphone est obligatoire.',
            'telephone.min' => 'Le numéro de téléphone doit contenir exactement 10 chiffres.',
            'telephone.max' => 'Le numéro de téléphone doit contenir exactement 10 chiffres.',
            'telephone.regex' => 'Le numéro de téléphone doit être au format marocain (0xxxxxxxxx).',
            'telephone.unique' => 'Ce numéro de téléphone existe déjà.'
        ];
    }
}
```

### **Dans Factory**

```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ExampleFactory extends Factory
{
    public function definition(): array
    {
        $telephonePrefixes = ['06', '07', '01'];
        
        return [
            'telephone' => $this->faker->unique()->randomElement($telephonePrefixes) . 
                          str_pad($this->faker->unique()->numberBetween(1, 99999999), 8, '0', STR_PAD_LEFT),
        ];
    }
}
```

## 🧪 Tests de Validation OBLIGATOIRES

### **Tests de Rejet (Format Invalide)**

```php
#[Test]
public function test_validation_rejects_telephone_not_starting_with_0()
{
    $response = $this->post(route('...'), [
        'telephone' => '6123456789', // Ne commence pas par 0
    ]);

    $response->assertStatus(302);
    $response->assertSessionHasErrors(['telephone']);
}

#[Test]
public function test_validation_rejects_telephone_with_less_than_10_digits()
{
    $response = $this->post(route('...'), [
        'telephone' => '061234567', // 9 chiffres
    ]);

    $response->assertStatus(302);
    $response->assertSessionHasErrors(['telephone']);
}

#[Test]
public function test_validation_rejects_telephone_with_more_than_10_digits()
{
    $response = $this->post(route('...'), [
        'telephone' => '06123456789', // 11 chiffres
    ]);

    $response->assertStatus(302);
    $response->assertSessionHasErrors(['telephone']);
}

#[Test]
public function test_validation_rejects_telephone_with_invalid_format()
{
    $response = $this->post(route('...'), [
        'telephone' => '0812345678', // Format invalide (08)
    ]);

    $response->assertStatus(302);
    $response->assertSessionHasErrors(['telephone']);
}

#[Test]
public function test_validation_rejects_telephone_with_non_numeric_characters()
{
    $response = $this->post(route('...'), [
        'telephone' => '0612345abc', // Caractères non numériques
    ]);

    $response->assertStatus(302);
    $response->assertSessionHasErrors(['telephone']);
}
```

### **Tests d'Acceptation (Format Valide)**

```php
#[Test]
public function test_validation_accepts_telephone_starting_with_06()
{
    $response = $this->post(route('...'), [
        'telephone' => '0612345678', // Format valide 06
    ]);

    $response->assertStatus(302);
}

#[Test]
public function test_validation_accepts_telephone_starting_with_07()
{
    $response = $this->post(route('...'), [
        'telephone' => '0712345678', // Format valide 07
    ]);

    $response->assertStatus(302);
}

#[Test]
public function test_validation_accepts_telephone_starting_with_01()
{
    $response = $this->post(route('...'), [
        'telephone' => '0112345678', // Format valide 01
    ]);

    $response->assertStatus(302);
}
```

### **Tests de Format Complet**

```php
#[Test]
public function test_telephone_format_validation()
{
    $invalidPhones = [
        '1234567890',      // Pas de 0 au début
        '6123456789',      // Ne commence pas par 0
        '0812345678',      // Format invalide (08)
        '061234567',       // Trop court (9 chiffres)
        '06123456789',     // Trop long (11 chiffres)
        '06 12 34 56 78',  // Avec espaces
        '06-12-34-56-78',  // Avec tirets
        '06.12.34.56.78',  // Avec points
        'abc1234567',      // Avec lettres
        '0612345abc',      // Mélange chiffres et lettres
        '061234567a',      // Lettre à la fin
        'a061234567',      // Lettre au début
    ];

    foreach ($invalidPhones as $invalidPhone) {
        $response = $this->post(route('...'), [
            'telephone' => $invalidPhone,
        ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['telephone']);
    }
}

#[Test]
public function test_telephone_format_acceptance()
{
    $validPhones = [
        '0612345678', // Format standard 06
        '0712345678', // Format standard 07
        '0112345678', // Format standard 01
        '0600000000', // Tous les zéros après 06
        '0799999999', // Tous les neufs après 07
        '0100000000', // Tous les zéros après 01
        '0611111111', // Tous les uns après 06
        '0711111111', // Tous les uns après 07
        '0111111111', // Tous les uns après 01
    ];

    foreach ($validPhones as $validPhone) {
        $response = $this->post(route('...'), [
            'telephone' => $validPhone,
        ]);

        $response->assertStatus(302);
    }
}
```

## 📋 Checklist de Validation OBLIGATOIRE

### **Tests de Rejet**
- [ ] Test rejet : ne commence pas par 0
- [ ] Test rejet : moins de 10 chiffres
- [ ] Test rejet : plus de 10 chiffres
- [ ] Test rejet : format invalide (08, 09, etc.)
- [ ] Test rejet : caractères non numériques
- [ ] Test rejet : espaces, tirets, points
- [ ] Test rejet : mélange chiffres et lettres

### **Tests d'Acceptation**
- [ ] Test acceptation : format 06 valide
- [ ] Test acceptation : format 07 valide
- [ ] Test acceptation : format 01 valide
- [ ] Test acceptation : cas limites (00000000, 99999999, etc.)

### **Tests de Factory**
- [ ] Factory génère des téléphones valides
- [ ] Factory respecte le regex `/^0[671][0-9]{8}$/`
- [ ] Factory utilise des données uniques

## 🎯 Modules Concernés

### **Modules avec Validation de Téléphone**
- ✅ **Commercial** - Implémenté et testé avec ValidationHelper
- ✅ **Client** - Implémenté et testé avec ValidationHelper
- ✅ **Livreur** - Implémenté avec ValidationHelper
- ✅ **Transporteur** - Implémenté avec ValidationHelper
- ❌ **User** - À vérifier
- ❌ **Autres modules** - À vérifier

### **Statut d'Implémentation**
- **Commercial** : ✅ **Complet et Refactorisé** (utilise ValidationHelper)
- **Client** : ✅ **Complet et Refactorisé** (utilise ValidationHelper)
- **Livreur** : ✅ **Complet** (validation téléphone ajoutée avec ValidationHelper)
- **Transporteur** : ✅ **Complet** (validation téléphone ajoutée avec ValidationHelper)
- **User** : ❌ **En attente**

## 🚀 Prochaines Étapes

1. **Implémenter la validation** dans les modules Client et User
2. **Créer les tests** pour chaque module
3. **Vérifier la cohérence** entre tous les modules
4. **Documenter les exceptions** si nécessaire

## 📚 Références

- **Regex officiel** : `/^0[671][0-9]{8}$/`
- **Formats acceptés** : `06`, `07`, `01`
- **Longueur** : 10 chiffres exactement
- **Début** : Toujours `0`

---

**Note** : Ces règles sont OBLIGATOIRES pour tous les modules du projet. Toute exception doit être documentée et justifiée.
