<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $guarded = [];

    /**
     * Un contact peut etre lie a plusieurs transactions (achat ou vente)
     */
    public function transactions()
    {
      return $this->hasMany(Transaction::class);
    } 
}
