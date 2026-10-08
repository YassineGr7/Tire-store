<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;


class Transaction extends Model
{
  protected $guarded = [];

  protected $casts = [
    "transaction_date" => "datetime",
  ];

  /**
   * Append grand_total to JSON output
   */
  protected $appends = ['grand_total'];


    // ── Invoice number auto-generation ──────────────────────────────────────────

  /**
   * Generates a unique invoice number based on transaction type and current year.
   * Format: FA-2025-0001 (sale) | AC-2025-0001 (purchase) | TR-2025-0001 (transfer)
   */
  public static function generateInvoiceNumber(string $type): string
  {
    $prefix = match ($type) {
      'sale'     => 'FA',
      'purchase' => 'AC',
      'transfer' => 'TR',
      default    => 'TX',
    };

    $year = now()->year;

    // Count existing transactions of this type this year, then increment
    $count = static::where('type', $type)
      ->whereYear('created_at', $year)
      ->count();

    return sprintf('%s-%d-%04d', $prefix, $year, $count + 1);
  }

  protected function grandTotal(): Attribute
  {
    return Attribute::make(
      get: fn ($value) => array_key_exists('grand_total', $this->attributes)
        ? (float) ($value ?? 0)
        : $this->details->sum(fn ($detail) => $detail->total_price)
    );
  }



  /**
   * Une Transaction est liee a un client ou fournisseur
   */
  public function contact()
  {
    return $this->belongsTo(Contact::class);
  }

  /**
   * Une Transaction est saisie par un utilisateur
   */
  public function user()
  {
    return $this->belongsTo(User::class);
  }

  /**
   * Une Transaction peut avoir plusieurs lignes de transaction
   */
  public function details()
  {
    return $this->hasMany(TransactionDetail::class);
  }
}
