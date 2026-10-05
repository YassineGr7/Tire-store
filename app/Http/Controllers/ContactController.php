<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index(Request $request)
    {
      $query = Contact::query();

      // Filter par type (client , supplier) 
      if ($request->filled("type")) {
        $query->where("type", $request->type);
      }

      // Filter par recherche text (nom, telephone, ville) 
      if ($request->filled("search")) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
          $q->where("name", "like", "%{$search}%")
            ->orWhere("phone", "like", "%{$search}%")
            ->orWhere("city", "like", "%{$search}%");
        });
      }

      $contacts = $query->latest()->paginate(10)->withQueryString();

      return Inertia::render("Contacts/Index", [
        "contacts" => $contacts,
        "filters" =>$request->only(["search", "type"]),
      ]);
    }

    /* 
      save a new contact
    */
    
    public function store(Request $request)
    {
      $validated = $request->validate([
        "type" => ["required", "in:client,supplier,both"],
        "name" => ["required", "string", "max:255"],
        "phone" => ["nullable", "string", "max:20"],
        "city" => ["nullable", "string", "max:100"]
      ]);

      Contact::create($validated);

      return back()->with("success", "Contact ajouté avec succés");
    }

    /* 
      update a contact
    */
    public function update(Request $request, Contact $customer)
    {
      $validated = $request->validate([
        "type" => ["required", "in:client,supplier,both"],
        "name" => ["required", "string", "max:255"],
        "phone" => ["nullable", "string", "max:20"],
        "city" => ["nullable", "string", "max:100"]
      ]);

      $customer->update($validated);

      return back()->with("success", "Contact mis à jour avec succés.");
    }

    /* 
      delete a contact
    */
    public function destroy(Contact $contact)
    {
      if (method_exists($contact, "transactions") && $contact->transactions()->count() > 0) {
        return back()->withErrors(["error" => "Impossible de supprimer ce contact car il est lié à des transactions."]);
      }

      $contact->delete();
      return back()->with("success", "Contact supprimé avec succés.");
    }

}
