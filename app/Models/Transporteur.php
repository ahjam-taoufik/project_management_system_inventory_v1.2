<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transporteur extends Model
{
    /** @use HasFactory<\Database\Factories\TransporteurFactory> */
    use HasFactory;

    protected $fillable = [
        'conducteur_name',
        'vehicule_matricule',
        'conducteur_cin',
        'conducteur_telephone',
        'vehicule_type',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the entrers for the transporteur.
     */
    public function entrers(): HasMany
    {
        return $this->hasMany(Entrer::class);
    }
}
