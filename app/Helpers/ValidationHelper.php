<?php

declare(strict_types=1);

namespace App\Helpers;

use Illuminate\Validation\Rule;

class ValidationHelper
{
    /**
     * Génère les règles de validation pour un champ téléphone
     *
     * @param string $fieldName Nom du champ (ex: 'telephone', 'commercial_telephone')
     * @param string $tableName Nom de la table pour l'unicité
     * @param mixed $ignoreId ID à ignorer pour l'unicité (pour les mises à jour)
     * @return array
     */
    public static function telephoneRules(string $fieldName, string $tableName, $ignoreId = null): array
    {
        $rules = [
            'required',
            'string',
            'min:10',
            'max:10',
            'regex:/^0[0-9][0-9]{8}$/',
        ];

        if ($ignoreId) {
            $rules[] = Rule::unique($tableName, $fieldName)->ignore($ignoreId);
        } else {
            $rules[] = Rule::unique($tableName, $fieldName);
        }

        return $rules;
    }

    /**
     * Génère les messages d'erreur pour un champ téléphone
     *
     * @param string $fieldName Nom du champ (ex: 'telephone', 'commercial_telephone')
     * @return array
     */
    public static function telephoneMessages(string $fieldName): array
    {
        return [
            "{$fieldName}.required" => "Le numéro de téléphone est obligatoire.",
            "{$fieldName}.string" => "Le téléphone doit être une chaîne de caractères.",
            "{$fieldName}.min" => "Le numéro de téléphone doit contenir exactement 10 chiffres.",
            "{$fieldName}.max" => "Le numéro de téléphone doit contenir exactement 10 chiffres.",
            "{$fieldName}.regex" => "Le numéro de téléphone doit être au format marocain (0xxxxxxxxx).",
            "{$fieldName}.unique" => "Ce numéro de téléphone existe déjà."
        ];
    }

    /**
     * Génère les règles de validation pour un champ téléphone optionnel
     *
     * @param string $fieldName Nom du champ
     * @param string $tableName Nom de la table pour l'unicité
     * @param mixed $ignoreId ID à ignorer pour l'unicité
     * @return array
     */
    public static function optionalTelephoneRules(string $fieldName, string $tableName, $ignoreId = null): array
    {
        $rules = [
            'nullable',
            'string',
            'min:10',
            'max:10',
            'regex:/^0[0-9][0-9]{8}$/',
        ];

        if ($ignoreId) {
            $rules[] = Rule::unique($tableName, $fieldName)->ignore($ignoreId);
        } else {
            $rules[] = Rule::unique($tableName, $fieldName);
        }

        return $rules;
    }
}
