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
        Schema::create('tires', function (Blueprint $table) {
            $table->id();
            $table->foreignId("brand_id")->constrained()->onDelete("cascade");
            $table->unsignedSmallInteger("width");
            $table->unsignedSmallInteger("aspect_ratio");
            $table->unsignedSmallInteger("diameter");
            $table->unsignedSmallInteger("load_index")->nullable();
            $table->string("speed_index")->nullable();  // ex:V, T, H
            $table->string("construction", 2)->default("R"); // ex: R for Radial
            $table->timestamps();

            // Index unique composite pour éviter les doublons de fiches techniques dans le catalogue
            $table->unique(['brand_id', 'width', 'aspect_ratio', 'diameter', 'load_index', 'speed_index'], 'tire_specs_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tires');
    }
};
