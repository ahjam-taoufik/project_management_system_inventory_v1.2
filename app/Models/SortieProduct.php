<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SortieProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'sortie_id',
        'product_id',
        'ref_produit',
        'prix_produit',
        'quantite_produit',
        'poids_produit',
        'total_ligne',
        'use_achat_price',
    ];

    protected $casts = [
        'prix_produit' => 'decimal:2',
        'quantite_produit' => 'integer',
        'poids_produit' => 'decimal:2',
        'total_ligne' => 'decimal:2',
        'use_achat_price' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the sortie that owns the product.
     */
    public function sortie(): BelongsTo
    {
        return $this->belongsTo(Sortie::class);
    }

    /**
     * Get the product that owns the sortie product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate the total ligne
     */
    public function calculateTotalLigne(): void
    {
        $this->total_ligne = $this->prix_produit * $this->quantite_produit;
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sortieProduct) {
            $sortieProduct->calculateTotalLigne();
        });

        static::updating(function ($sortieProduct) {
            $sortieProduct->calculateTotalLigne();
        });

        // Removed automatic sortie total calculation to prevent infinite loops
        // Total will be calculated manually in the controller
    }
}
