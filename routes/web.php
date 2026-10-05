<?php

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\TireController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WarehouseController;


use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Guest Routes (Accessible ONLY when NOT logged in)
|--------------------------------------------------------------------------
*/

Route::middleware("guest")->group(function () {
  // Inscription
  Route::get('/register', [RegisterController::class, 'create'])->name('register');
  Route::post('/register', [RegisterController::class, 'store']);

  // Connexion
  Route::get('/login', [LoginController::class, 'create'])->name('login');
  Route::post('/login', [LoginController::class, 'store']);

  // Authentification Google OAuth
  Route::get("/auth/google", [GoogleController::class, 'redirectToGoogle'])->name("auth.google");
  Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);
});


/*
|--------------------------------------------------------------------------
| Authenticated Routes (Protected - Requires Login)
|--------------------------------------------------------------------------
*/
Route::middleware("auth")->group(function () {

  // Déconnexion
  Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

  // Dashboard
  Route::get("/", [DashboardController::class, "index"])->name('dashboard');

  // Brands
  Route::resource('brands', BrandController::class);

  // Tire Routes
  Route::get("/tires", [TireController::class, "index"])->name('tires.index');
  Route::post("/tires", [TireController::class, "store"]);
  Route::post('/tires/import', [TireController::class, 'import']);

  // Warehouse Routes
  Route::prefix('warehouses')->name('warehouses.')->group(function () {
    Route::get('/', [WarehouseController::class, 'index'])->name('index');
    Route::post('/', [WarehouseController::class, 'store'])->name('store');
    Route::get('/{warehouse}', [WarehouseController::class, 'show'])->name('show');
    Route::delete('/{warehouse}', [WarehouseController::class, 'destroy'])->name('destroy');

    // Stock sub-routes
    Route::prefix('/{warehouse}/stock')->name('stock.')->group(function () {
      Route::post('/', [WarehouseController::class, 'storeStock'])->name('store');
      Route::delete('/{tire}', [WarehouseController::class, 'destroyStock'])->name('destroy');
    });
  });

  // Transaction Routes
  Route::prefix('transactions')->name('transactions.')->group(function () {
    Route::get('/', [TransactionController::class, 'index'])->name('index');
    Route::get('/create', [TransactionController::class, 'create'])->name('create');
    Route::post('/', [TransactionController::class, 'store'])->name('store');
    Route::get('/{transaction}', [TransactionController::class, 'show'])->name('show');
    Route::post('/{transaction}/cancel', [TransactionController::class, 'cancel'])->name('cancel');
    Route::get('/{transaction}/pdf', [TransactionController::class, 'downloadPdf'])->name('pdf');
  });

  // Contacts / Customers Routes
  Route::resource('customers', ContactController::class)
    ->names('contacts')
    ->except(['create', 'show', 'edit']);
});



// Route::middleware("guest")->group(function () {

//   // Inscription
//   Route::get('/register', [RegisterController::class, 'create'])->name('register');
//   Route::post('/register', [RegisterController::class, 'store']);

//   // Afficher la page de connexion
//   Route::get('/login', [LoginController::class, 'create'])->name('login');

//   // Traiter la soumission du formulaire classique
//   Route::post('/login', [LoginController::class, 'store']);

//   // Authentification Google OAuth
//   Route::get("/auth/google", [GoogleController::class, 'redirectToGoogle'])->name("auth.google");
//   Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);
// });

// Route de déconnexion (nécessite d'être connecté)
Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');
