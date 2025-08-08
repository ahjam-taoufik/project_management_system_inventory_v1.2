<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ville>
 */
class VilleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Données réelles extraites du VilleSeeder
        $realVilles = [
            'INZEGANE',
            'AGADIR',
            'CASABLANCA',
            'MARRAKECH',
            'FES',
            'RABAT',
            'TANGER',
            'MEKNES',
            'OUJDA',
            'SAFI',
            'EL JADIDA',
            'BENI MELLAL',
            'TETOUAN',
            'LARACHE',
            'KENITRA',
            'TAZA',
            'OUARZAZATE',
            'TAROUDANT',
            'ESSAOUIRA',
            'IFRANE',
            'AZROU',
            'MIDELT',
            'ERRACHIDIA',
            'FIGUIG',
            'BERKANE',
            'NADOR',
            'AL HOCEIMA',
            'TAOURIRT',
            'GUERCIF'
        ];

        return [
            'nameVille' => $this->faker->unique()->randomElement($realVilles),
        ];
    }
}
