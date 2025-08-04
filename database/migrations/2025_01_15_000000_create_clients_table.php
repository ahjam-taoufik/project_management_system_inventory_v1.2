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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('fullName')->unique();
            $table->foreignId('idVille')->constrained('villes')->onDelete('cascade');
            $table->foreignId('idSecteur')->constrained('secteurs')->onDelete('cascade');
            $table->foreignId('idCommercial')->nullable()->constrained('commerciaux')->onDelete('set null');
            $table->decimal('remise_special', 10, 2)->default(0);
            $table->decimal('pourcentage', 5, 2)->default(0);
            $table->string('telephone', 20)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
