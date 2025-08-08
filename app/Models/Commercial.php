<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Commercial extends Model
{
    use HasFactory;

    protected $table = 'commerciaux';

    protected $fillable = [
        'commercial_code',
        'commercial_fullName',
        'commercial_telephone',
    ];

    /**
     * Get the clients for the commercial.
     */
    public function clients(): HasMany
    {
        return $this->hasMany(Client::class, 'idCommercial');
    }

    /**
     * Get the sorties for the commercial.
     */
    public function sorties(): HasMany
    {
        return $this->hasMany(Sortie::class);
    }
}
