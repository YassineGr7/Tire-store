<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;


class Tire extends Model
{
  protected $guarded = [];

  // On ajoute un attribut "reference" qui n'existe pas dans la table, mais qui est calculé a partir des autres champs
  protected $appends = ['reference'];


  /**
   * Accessor pour generer la reference complete d'un pneu (ex: 205/55 R16 91V)
   * Trés pratique pour l'affichage direct dans React
   */
  protected function getReferenceAttribute()
  {
    return "{$this->width}/{$this->aspect_ratio} {$this->construction}{$this->diameter} {$this->load_index}{$this->speed_index}";
  }

  /**
   * Un pneu appartient a une marque
   */
  public function brand()
  {
    return $this->belongsTo(Brand::class);
  }

  /**
   * Relation many-to-many avec les depot (via la table pivot du stock)
   */
  public function warehouses()
  {
    return $this->belongsToMany(Warehouse::class, "warehouse_tire")
      ->withPivot("quantity", "purchase_price", "selling_price")
      ->withTimestamps();
  }
}
