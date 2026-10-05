<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
  // Rediriger l'utilisateur vers la page de connexion Google 
  public function redirectToGoogle()
  {
    return Socialite::driver('google')->redirect();
  }

  // Gere le retour de Google apres l'authentification
  public function handleGoogleCallback()
  {
    try {
      $googleUser = Socialite::driver('google')->user();

      // Rechercher l'utilisateur par google_id ou par email 
      $user = User::where("google_id", $googleUser->getId())
        ->orWhere("email", $googleUser->getEmail())
        ->first();

      if ($user) {
        // Si l'utilisateur existe deja, on met a jour son google_id et avatar si necessaire 
        $user->update([
          "google_id" => $googleUser->getId(),
          "avatar" => $googleUser->getAvatar()
        ]);
      } else {
        // Sinon, on cree un nouvel utilisateur avec les informations de Google 
        $user = User::create([
          "name" => $googleUser->getName(),
          "email" => $googleUser->getEmail(),
          "google_id" => $googleUser->getId(),
          "avatar" => $googleUser->getAvatar(),
          "password" => null, // pas de mot de passe pour les utilisateurs Google
        ]);
      }

      Auth::login($user, true); // Connecter l'utilisateur et se souvenir de lui

      return redirect()->intended("/");
    } catch (\Exception $e) {
      Log::error('Google login failed', ['message' => $e->getMessage()]);

      return redirect("/login")->with("error", "Une erreur est survenue lors de la connexion avec Google.");
    }
  }
}
