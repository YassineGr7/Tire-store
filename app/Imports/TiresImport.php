<?php

namespace App\Imports;

use App\Models\Brand;
use App\Models\Tire;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class TiresImport implements ToModel, WithHeadingRow
{
  /**
   * @param array $row
   *
   * @return \Illuminate\Database\Eloquent\Model|null
   */

  private Collection $brands;

  public function __construct()
  {
    // On va charger toutes les marques une seule fois au debut de l'importation
    $this->brands = Brand::all();
  }
  public function model(array $row)
  {
    // Nettoyage des données reçues (vérifie les clés en fonction des entêtes de ton Excel)
    // Si ton Excel a pour entête "Marque", "Largeur", etc., Laravel Excel les transforme en minuscules : 'marque', 'largeur'
    $brandName = trim($row['marque'] ?? $row['brand'] ?? '');

    if (empty($brandName)) {
      return null; // on ignore les lignes vides
    }

    $matchedBrand = null;
    $highestPercent = 0;

    // 1. Chercher la meilleure correspondance avec similar_text()
    foreach ($this->brands as $brand) {
      $percent = 0;
      // on convertit tout en minuscules pour ignorer la case !
      similar_text(strtolower($brandName), strtolower($brand->name), $percent);

      // on garde en memoire la marque qui a le plus haut score 
      if ($percent > $highestPercent) {
        $highestPercent = $percent;
        $matchedBrand = $brand;
      }
    }

    // 2. Decision : Est-ce la meme marque ou une nouvelle ? 
    // On fixe le seuil de tolérance à 85% (ideal pour les petite fautes des frappe)
    if ($highestPercent >= 85) {
      $finalBrand = $matchedBrand;
    } else {
      // La marque est vraiment nouvelle (score < 85%) , on la créer proprement
      $finalBrand = Brand::create(['name' => $brandName]);

      // on l'ajout immediatement a notre cache pour que les lignes suivantes de l'excel la reconnaissent
      $this->brands->push($finalBrand);
    }

    // 3. Preparer les caracteristiques techniques de pneu 
    $specs = [
      'brand_id'     => $finalBrand->id,
      'width'        => (int)($row['largeur'] ?? $row['width'] ?? 0),
      'aspect_ratio' => (int)($row['serie'] ?? $row['aspect_ratio'] ?? 0),
      'diameter'     => (int)($row['diametre'] ?? $row['diameter'] ?? 0),
      'load_index'   => (int)($row['charge'] ?? $row['load_index'] ?? 0),
      'speed_index'  => strtoupper(trim($row['vitesse'] ?? $row['speed_index'] ?? 'V')),
      'construction' => strtoupper(trim($row['construction'] ?? 'R')),
    ];

    // 4. Eviter le crash du "Duplicate Entry" (Pneu deja existant)
    if(Tire::where($specs)->exists()) {
      return null; // Le package ignore silencieusement cette ligne et passe à la suivante
    }


    // 4. Si c'est un nouveau pneu, on l'insère dans la base de données
    return new Tire($specs);
  }
}
