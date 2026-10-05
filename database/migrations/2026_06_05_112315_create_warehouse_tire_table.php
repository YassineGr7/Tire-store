-- Active: 1780916787971@@127.0.0.1@3310@tire_store
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
        Schema::create('warehouse_tire', function (Blueprint $table) {
            $table->id();
            $table->foreignId("warehouse_id")->constrained()->onDelete("cascade");
            $table->foreignId("tire_id")->constrained()->onDelete("cascade");
            $table->unsignedInteger("quantity")->default(0);
            $table->index('quantity');
            $table->decimal("purchase_price", 10, 2)->default(0);
            $table->decimal("selling_price", 10, 2)->default(0);
            $table->timestamps();

            // RÈGLE D'UNICITÉ : Un pneu ne peut avoir qu'une seule ligne de stock par dépôt
            $table->unique(["warehouse_id", "tire_id"], "warehouse_tire_unique");

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_tire');
    }
};
