<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    protected $guarded = [];
    protected $casts = [
      'unit_price'  => 'float',
      'total_price' => 'float',
      'quantity'    => 'integer',
    ];

    /**
     * La ligne appartient a une transaction parente
    */
    public function transaction()
    {
      return $this->belongsTo(Transaction::class);
    }

    /**
     * La ligne concern un pneu precis
    */
    public function tire()
    {
      return $this->belongsTo(Tire::class);
    }

    /**
     * Depot source (si achat) ou destination (si vente)
     */

    public function fromWarehouse()
    {
      return $this->belongsTo(Warehouse::class, "from_warehouse_id");
    }

      public function toWarehouse()
    {
      return $this->belongsTo(Warehouse::class, "to_warehouse_id");
    }
}