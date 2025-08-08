<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sorties', function (Blueprint $table) {
            $table->id();
            $table->string('numero_bl')->unique();
            $table->foreignId('commercial_id')->constrained('commerciaux')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->date('date_bl');
            $table->foreignId('livreur_id')->nullable()->constrained('livreurs')->onDelete('set null');
            $table->decimal('remise_speciale', 10, 2)->default(0);
            $table->decimal('remise_trimestrielle', 10, 2)->default(0);
            $table->decimal('valeur_ajoutee', 10, 2)->default(0);
            $table->decimal('retour', 10, 2)->default(0);
            $table->string('remise_es')->nullable();
            $table->decimal('client_gdg', 5, 2)->default(0);
            $table->decimal('total_general', 12, 2)->default(0);
            $table->decimal('montant_total_final', 12, 2)->default(0);
            $table->decimal('total_poids', 10, 2)->default(0);
            $table->decimal('montant_remise_especes', 10, 2)->default(0);
            $table->decimal('total_bl', 12, 2)->default(0);
            $table->boolean('archived')->default(false);
            $table->timestamps();

            $table->index(['numero_bl', 'date_bl']);
            $table->index(['commercial_id', 'client_id']);
            $table->index(['archived']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sorties');
    }
};
