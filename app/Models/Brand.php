<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    protected $guarded = [];

    public function tires()
    {
      // Une Marque posséde plusieurs Pneus
      return $this->hasMany(Tire::class);
    }
}
