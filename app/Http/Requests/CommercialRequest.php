<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Helpers\ValidationHelper;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CommercialRequest extends FormRequest
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
        return [
            "commercial_code" => [
                "required",
                "string",
                "min:3",
                "max:20",
                Rule::unique('commerciaux')->ignore($this->route('commercial'))
            ],
            "commercial_fullName" => [
                "required",
                "string",
                "min:3",
                "max:100"
            ],
            "commercial_telephone" => ValidationHelper::telephoneRules('commercial_telephone', 'commerciaux', $this->route('commercial'))
        ];
    }

    public function messages(): array
    {
        return [
            "commercial_code.required" => "Le code commercial est obligatoire.",
            "commercial_code.min" => "Le code doit contenir au moins 3 caractères.",
            "commercial_code.max" => "Le code doit contenir au plus 20 caractères.",
            "commercial_code.unique" => "Ce code commercial existe déjà.",

            "commercial_fullName.required" => "Le nom complet est obligatoire.",
            "commercial_fullName.min" => "Le nom doit contenir au moins 3 caractères.",
            "commercial_fullName.max" => "Le nom doit contenir au plus 100 caractères.",

            ...ValidationHelper::telephoneMessages('commercial_telephone')
        ];
    }
}
