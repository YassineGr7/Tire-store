<?php

namespace App\Http\Controllers;

use App\Imports\TiresImport;
use App\Models\Tire;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel; 

class TireController extends Controller
{
  /**
   * Summary of index
   * Afficher le catalogue de pneus
   */
  public function index(Request $request)
  {
    // On récupère le mot-clé de recherche s'il existe
    $search = $request->input('search');

    $tires = Tire::with('brand')
      ->when($search, function ($query, $search) {
        $query->whereHas('brand', function ($q) use ($search) {
          $q->where('name', 'like', "%{$search}%");
        })
          ->orWhere('width', 'like', "%{$search}%")
          ->orWhere('aspect_ratio', 'like', "%{$search}%")
          ->orWhere('diameter', 'like', "%{$search}%");
      })
      ->latest()
      ->paginate(4) // 10 pneus par page
      ->withQueryString(); // Garde le mot-clé 'search' dans les liens de pagination

    $brands = Brand::orderBy('name')->get();

    return Inertia::render('Tires/Index', [
      'tires' => $tires, // Attention : $tires est maintenant un objet de pagination, pas un simple tableau !
      'brands' => $brands,
      'filters' => $request->only(['search']) // On renvoie le filtre actuel pour le réafficher dans l'input
    ]);
  }

  /** 
   * Summary of store
   * Enregistrer un nouveau pneu dans la base de données
   */
  public function store(Request $request)
  {
    // validation des donnees du formulaire
    $validated = $request->validate([
      "brand_id" => "required|exists:brands,id",
      "width" => "required|integer|min:100|max:400",
      "aspect_ratio" => "required|integer|min:10|max:95",
      "diameter" => "required|integer|min:10|max:30",
      "load_index" => "required|integer|min:20|max:120",
      "speed_index" => "required|string|max:3",
      "construction" => "required|string|max:2",
    ]);

    $exists = Tire::where('brand_id', $request->brand_id)
      ->where('width', $request->width)
      ->where('aspect_ratio', $request->aspect_ratio)
      ->where('diameter', $request->diameter)
      ->where('load_index', $request->load_index)
      ->where('speed_index', $request->speed_index)
      ->where('construction', $request->construction)
      ->exists();

    if ($exists) {
      return redirect()->back()->withErrors([
        'brand_id' => 'Cette référence de pneu existe déjà dans le catalogue !'
      ]);
    }

    Tire::create($validated);

    return redirect()->back()->with("success", "Pneu ajouté avec succès !");
  }

  /**
     * Importer les pneus via le package Maatwebsite Excel
     */
    public function import(Request $request)
    {
        // Le package supporte nativement le CSV, XLS, et XLSX !
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls|max:4096',
        ]);

        try {
            // Lancement de l'importation
            Excel::import(new TiresImport, $request->file('file'));

            Inertia::flash('message', 'User created successfully!');

            return redirect()->back()->with('success', 'L\'importation a été exécutée avec succès ! Les nouveaux pneus ont été ajoutés et les doublons ont été ignorés.');
            
        } catch (\Exception $e) {
            // En cas d'erreur de format ou de fichier corrompu
            return redirect()->back()->withErrors([
                'file' => 'Erreur lors de la lecture du fichier : ' . $e->getMessage()
            ]);
        }
    }
}
