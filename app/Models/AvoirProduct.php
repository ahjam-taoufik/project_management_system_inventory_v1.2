<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvoirProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'avoir_id',
        'product_id',
        'quantite_retournee',
        'prix_unitaire',
        'prix_original',
        'prix_personnalise',
        'montant_ligne',
        'raison_detail',
        'sortie_origine_id',
    ];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'prix_original' => 'decimal:2',
        'prix_personnalise' => 'boolean',
        'montant_ligne' => 'decimal:2',
        'quantite_retournee' => 'integer',
    ];

    // Relations
    public function avoir(): BelongsTo
    {
        return $this->belongsTo(Avoir::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function sortieOrigine(): BelongsTo
    {
        return $this->belongsTo(Sortie::class, 'sortie_origine_id');
    }

    // ✅ NOUVEAU: Calcul automatique du montant
    public function calculateMontantLigne(): float
    {
        return (float) $this->quantite_retournee * (float) $this->prix_unitaire;
    }

    // ✅ NOUVEAU: Mise à jour automatique du montant
    public function updateMontantLigne(): void
    {
        $this->montant_ligne = $this->calculateMontantLigne();
        $this->save();
    }

    // ✅ NOUVEAU: Vérifier si le prix a été modifié
    public function isPriceModified(): bool
    {
        return $this->prix_personnalise && $this->prix_unitaire !== $this->prix_original;
    }

    // ✅ NOUVEAU: Obtenir le prix d'origine du produit
    public function getOriginalProductPrice(): float
    {
        return $this->product ? (float) $this->product->prix_vente_colis : 0;
    }

    // ✅ NOUVEAU: Initialiser avec le prix original du produit
    public function initializeWithOriginalPrice(): void
    {
        if ($this->product) {
            $this->prix_original = $this->product->prix_vente_colis;
            $this->prix_unitaire = $this->prix_original;
            $this->prix_personnalise = false;
        }
    }
}
