<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SortieRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $sortieId = $this->route('sortie') ? $this->route('sortie')->id : null;

        return [
            'numero_bl' => [
                'required',
                'string',
                'max:255',
                'regex:/^BL\d{7}$/', // Format: BLYYMMNNN (BL + 2 chiffres année + 2 chiffres mois + 3 chiffres numéro)
                Rule::unique('sorties', 'numero_bl')->ignore($sortieId),
            ],
            'commercial_id' => 'required|exists:commerciaux,id',
            'client_id' => 'required|exists:clients,id',
            'date_bl' => 'required|date',
            'livreur_id' => 'nullable|exists:livreurs,id',
            'remise_speciale' => 'nullable|numeric|min:0',
            'remise_trimestrielle' => 'nullable|numeric|min:0',
            'valeur_ajoutee' => 'nullable|numeric',
            'retour' => 'nullable|numeric',
            'remise_es' => 'nullable|string|max:255',
            'client_gdg' => 'nullable|numeric|min:0|max:100',
            'total_general' => 'nullable|numeric|min:0',
            'montant_total_final' => 'nullable|numeric|min:0',
            'total_poids' => 'nullable|numeric|min:0',
            'montant_remise_especes' => 'nullable|numeric|min:0',
            'archived' => 'nullable|boolean',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantite_produit' => 'required|numeric|min:0.01',
            'products.*.prix_produit' => 'required|numeric|min:0',
            'products.*.poids_produit' => 'nullable|numeric|min:0',
            'products.*.use_achat_price' => 'nullable|boolean',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'numero_bl.required' => 'Le numéro de BL est obligatoire.',
            'numero_bl.regex' => 'Le numéro de BL doit être au format BLYYMMNNN (ex: BL2508001).',
            'numero_bl.unique' => 'Ce numéro de BL existe déjà.',
            'commercial_id.required' => 'Le commercial est obligatoire.',
            'commercial_id.exists' => 'Le commercial sélectionné n\'existe pas.',
            'client_id.required' => 'Le client est obligatoire.',
            'client_id.exists' => 'Le client sélectionné n\'existe pas.',
            'date_bl.required' => 'La date du BL est obligatoire.',
            'date_bl.date' => 'La date du BL doit être une date valide.',
            'livreur_id.exists' => 'Le livreur sélectionné n\'existe pas.',
            'remise_speciale.numeric' => 'La remise spéciale doit être un nombre.',
            'remise_speciale.min' => 'La remise spéciale doit être positive.',
            'remise_trimestrielle.numeric' => 'La remise trimestrielle doit être un nombre.',
            'remise_trimestrielle.min' => 'La remise trimestrielle doit être positive.',
            'valeur_ajoutee.numeric' => 'La valeur ajoutée doit être un nombre.',
            'retour.numeric' => 'Le retour doit être un nombre.',
            'client_gdg.numeric' => 'Le pourcentage client G/DG doit être un nombre.',
            'client_gdg.min' => 'Le pourcentage client G/DG doit être positif.',
            'client_gdg.max' => 'Le pourcentage client G/DG ne peut pas dépasser 100%.',
            'total_general.numeric' => 'Le total général doit être un nombre.',
            'total_general.min' => 'Le total général doit être positif.',
            'montant_total_final.numeric' => 'Le montant total final doit être un nombre.',
            'montant_total_final.min' => 'Le montant total final doit être positif.',
            'total_poids.numeric' => 'Le poids total doit être un nombre.',
            'total_poids.min' => 'Le poids total doit être positif.',
            'montant_remise_especes.numeric' => 'Le montant de remise espèces doit être un nombre.',
            'montant_remise_especes.min' => 'Le montant de remise espèces doit être positif.',
            'products.required' => 'Au moins un produit est obligatoire.',
            'products.min' => 'Au moins un produit est obligatoire.',
            'products.*.product_id.required' => 'Le produit est obligatoire.',
            'products.*.product_id.exists' => 'Le produit sélectionné n\'existe pas.',
            'products.*.quantite_produit.required' => 'La quantité est obligatoire.',
            'products.*.quantite_produit.min' => 'La quantité doit être supérieure à 0.',
            'products.*.prix_produit.required' => 'Le prix du produit est obligatoire.',
            'products.*.prix_produit.min' => 'Le prix du produit doit être positif.',
            'products.*.poids_produit.numeric' => 'Le poids du produit doit être un nombre.',
            'products.*.poids_produit.min' => 'Le poids du produit doit être positif.',
        ];
    }
}
