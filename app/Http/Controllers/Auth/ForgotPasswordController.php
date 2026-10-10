<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ForgotPasswordController extends Controller
{
    // Show Email Request Form
    public function showEmailForm()
    {
        return Inertia::render("Auth/ForgotPassword");
    }

    // Generate OTP and send to email (now we just log it to the console)
    public function sendOtp(Request $request) 
    {
        $request->validate([
            "email" => ["required", "email", "exists:users,email"]
        ]);

        $user = User::where("email", $request->email)->first();

        // prevent Google-only users from resetting password if they don't have local auth
        if ($user->google_id && !$user->password) {
            return back()->withErrors([
            "email" => "Ce compte utilise Google OAuth . Veuillez vous connecter via Google."
            ]);
        }

        // Generate 6-digits code 
        $otp = rand(100000, 999999);

        $user->update([
            "otp_code" => $otp,
            "otp_expires_at" => now()->addMinutes(2), // Code valid for 2 minutes
        ]);

        // In production , you would send the OTP to the user's email here. For now, we will just log it to the console.
        Log::info("Password reset OTP for {$user->email}: {$otp}");

        // redirect to OTP verification page passing the email via session or query
        return redirect()->route("password.verify", ["email" => $user->email])
            ->with("success", "Un code OTP a été envoyé à votre adresse e-mail. Veuillez vérifier votre boîte de réception.");
    }

    public function showVerifyForm(Request $request) 
    {
        return Inertia::render("Auth/VerifyOtp", [
            "email" => $request->query("email")
        ]);
    }


    public function verifyOtp(Request $request)
    {
        $request->validate([
            "email" => ["required", "email", "exists:users,email"],
            "otp" => ["required", "string", "size:6"],
        ]);

        $user = User::where("email", $request->email)->first();

        if (!$user || $user->otp_code !== $request->otp || now()->greaterThan($user->otp_expires_at)) {
            return back()->withErrors([
                "otp" => "Le code OTP est invalide ou a expiré."
            ]);
        }

        // code is valid, Store a temporary verification flag in session for resetting
        session(["verified_reset_email" => $user->email]);

        return redirect()->route("password.reset");
    }


    //show new password form
    public function showResetForm()
    {
        // check if the user has verified their email via OTP
        if (!session()->has("verified_reset_email")) {
            return redirect()->route("password.request");
        }

        return Inertia::render("Auth/ResetPassword", [
            "email" => session("verified_reset_email")
        ]);
    }


    // update password 
    public function updatePassword(Request $request) 
    {
        $request->validate([
            "email" => ["required", "email", "exists:users,email"],
            "password" => ["required", "confirmed", Password::defaults()],
        ]);

        // Ensure session matches
        if (session('verified_reset_email') !== $request->email) {
            return redirect()->route("password.request")->withErrors([
                'email' => 'Session expirée. Recommencez.'
            ]);
        }

        $user = User::where("email", $request->email)->first();
        $user->update([
            "password" => Hash::make($request->password),
            "otp_code" => null,
            "otp_expires_at" => null
        ]);

        session()->forget("verified_reset_email");

        return redirect()->route("login")->with("status", "Votre mot de passe a été mis à jour avec succès.");
    }

}
