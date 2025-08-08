<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transporteur>
 */
class TransporteurFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // ✅ OPTIMISATION : Données réelles extraites du TransporteurSeeder
        $realTransporteurs = [
            [
                'conducteur_name' => 'TRANSPORTEUR001',
                'vehicule_matricule' => 'ABC-123-45',
                'conducteur_cin' => 'AB123456',
                'conducteur_telephone' => '06 11 22 33 44',
                'vehicule_type' => 'Camion',
            ],
            [
                'conducteur_name' => 'TRANSPORTEUR002',
                'vehicule_matricule' => 'DEF-456-78',
                'conducteur_cin' => 'CD789012',
                'conducteur_telephone' => '06 22 33 44 55',
                'vehicule_type' => 'Fourgon',
            ],
            [
                'conducteur_name' => 'TRANSPORTEUR003',
                'vehicule_matricule' => 'GHI-789-01',
                'conducteur_cin' => 'EF345678',
                'conducteur_telephone' => '06 33 44 55 66',
                'vehicule_type' => 'Camion',
            ],
            [
                'conducteur_name' => 'TRANSPORTEUR004',
                'vehicule_matricule' => 'JKL-012-34',
                'conducteur_cin' => 'GH901234',
                'conducteur_telephone' => '06 44 55 66 77',
                'vehicule_type' => 'Fourgon',
            ],
            [
                'conducteur_name' => 'TRANSPORTEUR005',
                'vehicule_matricule' => 'MNO-345-67',
                'conducteur_cin' => 'IJ567890',
                'conducteur_telephone' => '06 55 66 77 88',
                'vehicule_type' => 'Camion',
            ],
        ];

        $transporteur = $realTransporteurs[array_rand($realTransporteurs)];
        $timestamp = time() . '_' . uniqid();

        return [
            'conducteur_name' => $transporteur['conducteur_name'] . '_' . $timestamp,
            'vehicule_matricule' => $transporteur['vehicule_matricule'] . '_' . $timestamp,
            'conducteur_cin' => $transporteur['conducteur_cin'] . '_' . $timestamp,
            'conducteur_telephone' => $transporteur['conducteur_telephone'],
            'vehicule_type' => $transporteur['vehicule_type'],
        ];
    }
}
