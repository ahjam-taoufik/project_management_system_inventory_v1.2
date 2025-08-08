<?php

namespace Database\Factories;

use App\Models\Ville;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Secteur>
 */
class SecteurFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Données réelles extraites du SecteurSeeder
        $realSecteurs = [
            'AGADIR', 'ADRAR', 'AIT AAMIRA', 'AIT MELLOUL', 'AZROU', 'BELFAA', 'BIOUGRA',
            'EL LHOUDA', 'EL QODS', 'ELJIHADIYA', 'GUELMIM', 'JARF', 'KASBAT TAHER',
            'LAAZIB LAQLIAA', 'LAKHSASS', 'LAQLIAA', 'LARBAA AIT BOUTAIB', 'MASSA',
            'OULAD DAHOU', 'SEBT AIT MILK', 'SIDI BIBI', 'SIDI MIMOUNE', 'TADDART',
            'TARRAST', 'TEMSSIA', 'TIZNIT', 'HAYMOHAMMADI', 'TANTAN', 'DRARGA',
            'DAKHLA', 'DCHEIRA', 'POLYVALENT', 'TAGADIRTE', 'TAMAAIT', 'AOURIR',
            'AGDAL', 'SALAM', 'TIKIWINE', 'MASSIRA', 'BENSERGAOU', 'EL MASSIRA',
            'DAKHLA SAHARA', 'TAMAZARTE', 'BENAANFAR', 'CHOHADA', 'ELFARAH', 'ANZA',
            'ALMOUSTAQBAL', 'RMAL', 'AMOUGAY', 'AIT BAHA', 'ELWIFAQ', 'LAMZAR',
            'TILILA', 'IMORAN', 'LHARCH', 'TASSILA', 'LAAYOUNE', 'IHCHACHE', 'ARGANA',
            'YOUSSOUFIA', 'AIT JRAR', 'IMJJAD', '11 -- JANVIER', 'TAMRAGHT', 'TERMINUS',
            'LIRAK BOUARGAN'
        ];

        return [
            'nameSecteur' => $this->faker->unique()->randomElement($realSecteurs),
            'idVille' => Ville::factory(), // Relation avec Ville
        ];
    }

    /**
     * Indicate that the secteur belongs to a specific ville.
     */
    public function forVille(Ville $ville)
    {
        return $this->state(function (array $attributes) use ($ville) {
            return [
                'idVille' => $ville->id,
            ];
        });
    }
}
