<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Commercial>
 */
class CommercialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // ✅ RÈGLE : Données Réelles Extraites des Seeders pour Performance Maximale
        $commercialCodes = [
            'COM001', 'COM002', 'COM003', 'COM004', 'COM005',
            'COM006', 'COM007', 'COM008', 'COM009', 'COM010',
            'COM011', 'COM012', 'COM013', 'COM014', 'COM015',
            'COM016', 'COM017', 'COM018', 'COM019', 'COM020',
            'COM021', 'COM022', 'COM023', 'COM024', 'COM025',
            'COM026', 'COM027', 'COM028', 'COM029', 'COM030',
            'COM031', 'COM032', 'COM033', 'COM034', 'COM035',
            'COM036', 'COM037', 'COM038', 'COM039', 'COM040',
            'COM041', 'COM042', 'COM043', 'COM044', 'COM045',
            'COM046', 'COM047', 'COM048', 'COM049', 'COM050',
        ];

        $commercialNames = [
            'Ahmed Benali', 'Fatima Zahra', 'Mohammed Alami', 'Amina Tazi', 'Hassan El Fassi',
            'Khadija Bennani', 'Omar Idrissi', 'Zineb Mansouri', 'Youssef Berrada', 'Nadia El Khadir',
            'Karim Bennis', 'Samira Alaoui', 'Rachid Tazi', 'Leila Benjelloun', 'Adil El Amrani',
            'Sanaa Bennani', 'Hicham El Fassi', 'Aicha Mansouri', 'Mehdi Berrada', 'Naima El Khadir',
            'Yassine Bennis', 'Hafsa Alaoui', 'Anas Tazi', 'Imane Benjelloun', 'Bilal El Amrani',
            'Souad Bennani', 'Reda El Fassi', 'Kenza Mansouri', 'Younes Berrada', 'Hanae El Khadir',
            'Ayoub Bennis', 'Salma Alaoui', 'Adam Tazi', 'Ines Benjelloun', 'Hamza El Amrani',
            'Nouha Bennani', 'Ilyas El Fassi', 'Yasmin Mansouri', 'Zakaria Berrada', 'Rania El Khadir',
            'Taha Bennis', 'Dounia Alaoui', 'Rayane Tazi', 'Lina Benjelloun', 'Amin El Amrani',
            'Malak Bennani', 'Yahya El Fassi', 'Nour Mansouri', 'Othmane Berrada', 'Hajar El Khadir',
            'Ahmad Bennis', 'Rim Alaoui', 'Yassin Tazi', 'Layla Benjelloun', 'Ziad El Amrani',
        ];

        $telephonePrefixes = ['06', '07', '01'];
        $telephoneSuffixes = [
            '12345678', '23456789', '34567890', '45678901', '56789012',
            '67890123', '78901234', '89012345', '90123456', '01234567',
            '11111111', '22222222', '33333333', '44444444', '55555555',
            '66666666', '77777777', '88888888', '99999999', '00000000',
            '12121212', '23232323', '34343434', '45454545', '56565656',
            '67676767', '78787878', '89898989', '90909090', '01010101',
            '20202020', '30303030', '40404040', '50505050', '60606060',
            '70707070', '80808080', '90909090', '10101010', '20202020',
            '30303030', '40404040', '50505050', '60606060', '70707070',
            '80808080', '90909090', '10101010', '20202020', '30303030',
        ];

        return [
            'commercial_code' => 'COM' . str_pad($this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'commercial_fullName' => $this->faker->unique()->randomElement($commercialNames),
            'commercial_telephone' => $this->faker->unique()->randomElement($telephonePrefixes) .
                                    str_pad($this->faker->unique()->numberBetween(1, 99999999), 8, '0', STR_PAD_LEFT),
        ];
    }
}
