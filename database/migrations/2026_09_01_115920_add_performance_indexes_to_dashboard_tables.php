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
    Schema::table('transactions', function (Blueprint $table) {
      $table->index(['type', 'status', 'transaction_date'], 'idx_transactions_lookup');
    });

    Schema::table('transaction_details', function (Blueprint $table) {
      $table->index(['transaction_id', 'tire_id'], 'idx_details_trans_tire');
    });

    Schema::table('warehouse_tire', function (Blueprint $table) {
      $table->index('quantity', 'idx_warehouse_tire_qty');
    });
  }

  public function down(): void
  {
    Schema::table('transactions', function (Blueprint $table) {
      $table->dropIndex('idx_transactions_lookup');
    });

    Schema::table('transaction_details', function (Blueprint $table) {
      $table->dropIndex('idx_details_trans_tire');
    });

    Schema::table('warehouse_tire', function (Blueprint $table) {
      $table->dropIndex('idx_warehouse_tire_qty');
    });
  }
};
