<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Client;
use App\Models\Ville;
use App\Models\Secteur;
use App\Models\Commercial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Client>
 */
class ClientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // ✅ RÈGLE : Utiliser des données réalistes extraites des seeders
        $codes = ['CL000', 'CL001', 'CL002', 'CL003', 'CL004', 'CL005', 'CL006', 'CL007', 'CL008', 'CL009', 'CL010'];
        $noms = [
            'ELHILALY ABDENNABI', 'LHAJ LHASSROUF', 'TAFOUKT YOUSSEF', 'CHIRAOUI ABDERRAHMANE', 'OUBARI MBAREK',
            'OUCHEN MOHAMED', 'BENTAHER HAMID', 'AHMED NADAFA', 'KHALED BEN TAHER', 'OUMAST LAHCEN',
            'AZOUZ MOHAMED', 'LHAJ HASSAN EL AADODI', 'AFRIAD MOHAMED', 'LHAJ LAAZIB', 'RARA RABII',
            'ADERQAOU LHAJ HASSAN', 'ABRABRI ABDELLAH', 'TAFRAOUT', 'ANAROUZ', 'ALI LAAZIB',
            'ABDELLAH ADRAR', 'BAHA MOHAMED', 'ELMOUDEN SAID', 'AAROUF TADDART', 'CHMOURRE MOHAMED',
            'RAHHAL BIMGHAREN', 'SALEH AIT BOUTAIB', 'KASMI LAQLIAA', 'ZOUHARI SAID', 'KALTOUMA EL MELLALI',
            'GRICH ABDESSAMAD', 'SAID OULAD DAHOU', 'WARGHEN ABDELAZIZ', 'TALLA LAQUAIA', 'DAAF AYOUB'
        ];
        $suffixes = ['', ' SARL', ' EURL', ' SNC', ' SCS', ' SCA', ' SPRL', ' SA', ' SARL-AU', ' EIRL'];

        // ✅ RÈGLE : Validation téléphone standardisée
        $telephonePrefixes = ['06', '07', '01'];
        $telephone = $this->faker->randomElement($telephonePrefixes) .
                    str_pad((string) $this->faker->unique()->numberBetween(1, 99999999), 8, '0', STR_PAD_LEFT);

        // ✅ RÈGLE : Utiliser des données uniques pour éviter les conflits
        $code = 'CLI_FACTORY_' . $this->faker->unique()->numberBetween(1000, 9999);
        $nom = $this->faker->unique()->randomElement($noms) . ' ' . $this->faker->unique()->numberBetween(1000, 9999) . $this->faker->randomElement($suffixes);

        return [
            'code' => $code,
            'fullName' => $nom,
            'idVille' => Ville::inRandomOrder()->first()->id ?? Ville::factory(),
            'idSecteur' => Secteur::inRandomOrder()->first()->id ?? Secteur::factory(),
            'idCommercial' => Commercial::inRandomOrder()->first()->id ?? Commercial::factory(),
            'remise_special' => $this->faker->numberBetween(0, 50),
            'pourcentage' => $this->faker->numberBetween(0, 100),
            'telephone' => $telephone,
        ];
    }

    /**
     * Indicate that the client has no telephone.
     */
    public function withoutTelephone(): static
    {
        return $this->state(fn (array $attributes) => [
            'telephone' => null,
        ]);
    }

    /**
     * Indicate that the client has a specific telephone format.
     */
    public function withTelephoneFormat(string $format): static
    {
        $telephone = $format . str_pad((string) $this->faker->unique()->numberBetween(1, 99999999), 8, '0', STR_PAD_LEFT);

        return $this->state(fn (array $attributes) => [
            'telephone' => $telephone,
        ]);
    }

    /**
     * Indicate that the client has a 06 telephone format.
     */
    public function withTelephone06(): static
    {
        return $this->withTelephoneFormat('06');
    }

    /**
     * Indicate that the client has a 07 telephone format.
     */
    public function withTelephone07(): static
    {
        return $this->withTelephoneFormat('07');
    }

    /**
     * Indicate that the client has a 01 telephone format.
     */
    public function withTelephone01(): static
    {
        return $this->withTelephoneFormat('01');
    }
}
