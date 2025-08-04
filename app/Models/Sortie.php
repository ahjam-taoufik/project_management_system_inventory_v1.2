<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sortie extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_bl',
        'commercial_id',
        'client_id',
        'date_bl',
        'livreur_id',
        'remise_speciale',
        'remise_trimestrielle',
        'valeur_ajoutee',
        'retour',
        'remise_es',
        'client_gdg',
        'total_general',
        'montant_total_final',
        'total_poids',
        'montant_remise_especes',
        'total_bl',
    ];

    protected $casts = [
        'date_bl' => 'date',
        'remise_speciale' => 'decimal:2',
        'remise_trimestrielle' => 'decimal:2',
        'valeur_ajoutee' => 'decimal:2',
        'retour' => 'decimal:2',
        'client_gdg' => 'decimal:2',
        'total_general' => 'decimal:2',
        'montant_total_final' => 'decimal:2',
        'total_poids' => 'decimal:2',
        'montant_remise_especes' => 'decimal:2',
        'total_bl' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the commercial that owns the sortie.
     */
    public function commercial(): BelongsTo
    {
        return $this->belongsTo(Commercial::class);
    }

    /**
     * Get the client that owns the sortie.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the livreur that owns the sortie.
     */
    public function livreur(): BelongsTo
    {
        return $this->belongsTo(Livreur::class);
    }



    /**
     * Get the products for the sortie.
     */
    public function products(): HasMany
    {
        return $this->hasMany(SortieProduct::class);
    }

    /**
     * Calculate and update the total BL
     */
    public function calculateTotal(): void
    {
        $total = $this->products()->sum('total_ligne');
        $this->update(['total_bl' => $total]);
    }

        /**
     * Calculate and update all totals including remises
     */
    public function calculateAllTotals(): void
    {
        // Calculer le total général (somme des lignes de produits)
        $totalGeneral = $this->products()->sum('total_ligne');

        // Calculer le total poids (somme des poids totaux de chaque ligne)
        $totalPoids = $this->products()->sum('poids_produit');

        // Calculer la remise espèces (si remise_es est un pourcentage)
        $montantRemiseEspeces = 0;
        if (!empty($this->remise_es)) {
            $remiseEsPourcentage = floatval($this->remise_es);
            $montantRemiseEspeces = ($totalGeneral * $remiseEsPourcentage) / 100;
        }

        // Calculer le montant total final
        $montantTotalFinal = $totalGeneral
            - $montantRemiseEspeces
            - ($this->remise_speciale ?? 0)
            - ($this->remise_trimestrielle ?? 0)
            + ($this->valeur_ajoutee ?? 0)
            + ($this->retour ?? 0);

        // Mettre à jour tous les totaux
        $this->total_general = $totalGeneral;
        $this->total_poids = $totalPoids;
        $this->montant_remise_especes = $montantRemiseEspeces;
        $this->montant_total_final = $montantTotalFinal;
        $this->total_bl = $montantTotalFinal; // total_bl = montant_total_final

        $this->save();
    }

    /**
     * Get the product count attribute
     */
    public function getProductCountAttribute(): int
    {
        return $this->products()->count();
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Removed automatic total calculation to prevent infinite loops
        // Total will be calculated manually when needed
    }
}
