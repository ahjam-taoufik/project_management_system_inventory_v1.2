<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Permission\Traits\HasRoles;

class Livreur extends Model
{
    use HasFactory, HasRoles;

    protected $fillable = [
        'nom',
        'telephone',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the sorties for the livreur.
     */
    public function sorties(): HasMany
    {
        return $this->hasMany(Sortie::class);
    }
}
