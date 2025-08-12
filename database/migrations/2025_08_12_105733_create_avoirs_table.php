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
        Schema::create('avoirs', function (Blueprint $table) {
            $table->id();
            $table->string('numero_avoir')->unique(); // Format: AVYYYYMMNNN
            $table->date('date_avoir');
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('commercial_id')->constrained('commerciaux')->onDelete('cascade');
            $table->foreignId('livreur_id')->nullable()->constrained('livreurs')->onDelete('set null');
            $table->text('raison_retour')->nullable(); // ✅ NULLABLE
            $table->decimal('ajustement_financier', 15, 2)->default(0); // ✅ NOUVEAU: Valeur +/- pour ajuster le total

            // ✅ NOUVEAU: Champs de validation
            $table->enum('statut', ['en_attente', 'valide'])->default('en_attente');
            $table->timestamp('date_validation')->nullable();
            $table->text('commentaire_validation')->nullable();

            $table->decimal('montant_total', 15, 2)->default(0);
            $table->decimal('poids_total', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avoirs');
    }
};
