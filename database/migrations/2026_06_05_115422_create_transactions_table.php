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
    Schema::create('transactions', function (Blueprint $table) {
      $table->id();
      $table->foreignId("contact_id")->constrained()->onDelete("restrict");
      $table->foreignId("user_id")->constrained()->onDelete("restrict");
      $table->enum("type", ["sale", "purchase", "transfer"])->default("sale"); // vente , achat, Transfert inter-Depot 
      $table->string("invoice_number")->unique();
      // Optimise le filtrage type/status/date utilisé dans toutes les requêtes
      $table->index(['type', 'status', 'transaction_date']);
      $table->timestamp("transaction_date");
      $table->enum("status", ["pending", "completed", "canceled"])->default("pending");
      $table->enum("payment_method", ["cash", "cheque", "virement"])->default("cash");
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('transactions');
  }
};
