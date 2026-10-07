<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password ;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings', [
            'company' => [
                "company_name"      => Setting::get("company_name", "TireStore SARL"),
                "ice_number"        => Setting::get("ice_number", ""),
                "phone"             => Setting::get("phone", ""),
                "invoice_footer"    => Setting::get("invoice_footer", "Merci pour votre confiance."),
            ],
            'preferences' => [
                "currency"              => Setting::get("currency", "MAD"),
                "default_tva"           => (int) Setting::get("default_tva", 20),
                "low_stock_threshold"   => (int) Setting::get("low_stock_threshold", 5),
                "enable_email_alerts"   => Setting::get("enable_email_alerts", '1') === '1',
            ],
        ]);
    }


    /**
     * Update user profile and password
    */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            "name"  => ["required", "string", "max:255"],
            "email" => ["required", "string", "email", "max:255", "unique:users,email," . $user->id],
        ]);

        $user->fill([
            "name"  => $request->name,
            "email" => $request->email,
        ]);

        // Update Password if current_password was provided
        if ($request->filled("current_password")) {
            $request->validate([
                "current_password" => ["required", "current_password"],
                "new_password"     => ["required", Password::defaults(), "confirmed"],
            ]);

            $user->password = Hash::make($request->new_password);
        }

        $user->save();

        return back()->with("success", "Profil mis à jour avec succès.");

    }

    /**
     * Update company details for PDF Invoices.
    */
    public function updateCompany(Request $request)
    {
        $validated = $request->validate([
            "company_name"     => ["required", "string", "max:255"],
            "ice_number"       => ["nullable", "string", "max:100"],
            "phone"            => ["nullable", "string", "max:20"],
            "address"          => ["nullable", "string", "max:255"],
            "invoice_footer"   => ["nullable", "string", "max:500"],
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value ?? '');
        }

        return back()->with("success", "Détails de l'entreprise mis à jour avec succès.");
    }

    /**
     * Update Stock rules & preferences.
    */
    public function updatePreferences(Request $request)
    {
        $validated = $request->validate([
            "currency" => ["required", "string", "in:MAD,EUR,USD"],
            "default_tva" => ["required", "numeric", "min:0", "max:100"],
            "low_stock_threshold" => ["required", "integer", "min:0"],
            "enable_email_alerts" => ["boolean"],
        ]);

        Setting::set("currency", $validated["currency"]);
        Setting::set("default_tva", $validated["default_tva"]);
        Setting::set("low_stock_threshold", $validated["low_stock_threshold"]);
        Setting::set("enable_email_alerts", $request->boolean("enable_email_alerts") ? '1' : '0');

        return back()->with("success", "Préférences mises à jour avec succès.");
    }
}
