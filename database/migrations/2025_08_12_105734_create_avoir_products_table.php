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
        Schema::create('avoir_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('avoir_id')->constrained('avoirs')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('quantite_retournee');
            $table->decimal('prix_unitaire', 10, 2); // ✅ Prix original OU prix personnalisé
            $table->decimal('prix_original', 10, 2); // ✅ NOUVEAU: Prix original pour référence
            $table->boolean('prix_personnalise')->default(false); // ✅ NOUVEAU: Indique si prix modifié
            $table->decimal('montant_ligne', 15, 2)->default(0);
            $table->text('raison_detail')->nullable(); // ✅ NULLABLE
            $table->foreignId('sortie_origine_id')->nullable()->constrained('sorties')->onDelete('set null'); // ✅ NULLABLE
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avoir_products');
    }
};
