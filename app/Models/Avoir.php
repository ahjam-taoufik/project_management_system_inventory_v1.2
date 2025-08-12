<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Avoir extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_avoir',
        'date_avoir',
        'client_id',
        'commercial_id',
        'livreur_id',
        'raison_retour',
        'ajustement_financier',
        'statut',
        'date_validation',
        'commentaire_validation',
        'montant_total',
        'poids_total',
    ];

    protected $casts = [
        'date_avoir' => 'date',
        'ajustement_financier' => 'decimal:2',
        'montant_total' => 'decimal:2',
        'poids_total' => 'decimal:2',
        'date_validation' => 'datetime',
    ];



    // Relations
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function commercial(): BelongsTo
    {
        return $this->belongsTo(Commercial::class);
    }

    public function livreur(): BelongsTo
    {
        return $this->belongsTo(Livreur::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(AvoirProduct::class);
    }

    // ✅ NOUVEAU: Calcul du montant total
    public function calculateTotal(): float
    {
        $totalLignes = $this->products->sum('montant_ligne');
        return $totalLignes + (float) $this->ajustement_financier;
    }

    // ✅ NOUVEAU: Génération automatique du numéro d'avoir
    public static function generateNumeroAvoir(): string
    {
        // Format: AV + YYMM + NNN (ex: AV2508001)
        $year = date('y'); // Année sur 2 chiffres (25 pour 2025)
        $month = date('m'); // Mois sur 2 chiffres (08 pour août)
        $yearMonth = $year . $month; // YYMM (2508)

        // Chercher le dernier avoir du mois
        $lastAvoir = self::where('numero_avoir', 'like', 'AV' . $yearMonth . '%')
            ->orderBy('numero_avoir', 'desc')
            ->first();

        $sequence = 1;

        if ($lastAvoir) {
            // Extraire les 3 derniers chiffres du numéro
            $lastSequence = (int) substr($lastAvoir->numero_avoir, -3);
            $sequence = $lastSequence + 1;
        }

        // Format final: AV + YYMM + NNN (ex: AV2508001)
        return 'AV' . $yearMonth . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    // ✅ NOUVEAU: Vérifier si l'avoir peut être modifié
    public function canBeModified(): bool
    {
        return true; // Tous les avoirs peuvent être modifiés
    }

    // ✅ NOUVEAU: Vérifier si l'avoir peut être supprimé
    public function canBeDeleted(): bool
    {
        return true; // Tous les avoirs peuvent être supprimés
    }

    // ✅ NOUVEAU: Vérifier si l'avoir peut être validé
    public function canBeValidated(): bool
    {
        return $this->statut === 'en_attente';
    }

    // ✅ NOUVEAU: Vérifier si l'avoir est validé
    public function isValidated(): bool
    {
        return $this->statut === 'valide';
    }

    // ✅ NOUVEAU: Vérifier si l'avoir est en attente
    public function isPending(): bool
    {
        return $this->statut === 'en_attente';
    }
}
