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
    Schema::create('transaction_details', function (Blueprint $table) {
      $table->id();
      $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
      $table->foreignId('tire_id')->constrained()->onDelete('restrict');
      $table->index(['transaction_id', 'tire_id']);
      // Dépôts concernés (Permet d'historiser d'où est sorti le pneu et où il est entré)
      $table->foreignId('from_warehouse_id')->nullable()->constrained('warehouses')->onDelete('restrict');
      $table->foreignId('to_warehouse_id')->nullable()->constrained('warehouses')->onDelete('restrict');
      $table->unsignedInteger('quantity');
      $table->decimal('unit_price', 10, 2);
      $table->decimal('total_price', 10, 2); // quantity * unit_price

      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('transaction_details');
  }
};
