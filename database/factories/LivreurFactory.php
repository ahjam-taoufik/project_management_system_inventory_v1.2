<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Livreur>
 */
class LivreurFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // ✅ OPTIMISATION : Données réelles extraites du LivreurSeeder
        $realLivreurs = [
            [
                'nom' => 'LIVREUR001',
                'telephone' => '06 12 34 56 78',
            ],
            [
                'nom' => 'LIVREUR002',
                'telephone' => '06 23 45 67 89',
            ],
            [
                'nom' => 'LIVREUR003',
                'telephone' => '06 34 56 78 90',
            ],
            [
                'nom' => 'LIVREUR004',
                'telephone' => '06 45 67 89 01',
            ],
            [
                'nom' => 'LIVREUR005',
                'telephone' => '06 56 78 90 12',
            ],
        ];

        $livreur = $realLivreurs[array_rand($realLivreurs)];
        $timestamp = time() . '_' . uniqid();

        return [
            'nom' => $livreur['nom'] . '_' . $timestamp,
            'telephone' => $livreur['telephone'],
        ];
    }
}
