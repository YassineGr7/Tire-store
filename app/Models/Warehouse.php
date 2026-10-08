<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
  protected $guarded = [];
  protected $appends = ['current_stock'];

  /**
   * Relation Many-to-Many avec les pneus (via la table pivot 'tire_warehouse)
   */
  public function tires()
  {
    return $this->belongsToMany(Tire::class, "warehouse_tire")
      ->withPivot("quantity", "purchase_price", "selling_price")
      ->withTimestamps();
  }

  /**
   * Calcule le stock total du dépôt (somme des quantités dans le pivot)
   */
  public function getCurrentStockAttribute($value = null): int
  {
    if (array_key_exists('current_stock', $this->attributes)) {
      return (int) ($value ?? 0);
    }

    return $this->tires->sum('pivot.quantity');
  }
}
