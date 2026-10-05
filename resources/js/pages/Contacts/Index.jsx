import React, { useState, useEffect } from 'react';
import { useForm, router, Link } from '@inertiajs/react';

export default function Index({ contacts, filters, errors: serverErrors }) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeType, setActiveType] = useState(filters.type || '');
    const [isEditing, setIsEditing] = useState(null);

    // Formulaire Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        type: 'client',
        name: '',
        phone: '',
        city: '',
    });

    // Gestion de la recherche et des filtres
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search === (filters.search || '') && activeType === (filters.type || '')) return;

            router.get('/customers', { search, type: activeType }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, activeType, filters.search, filters.type]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
          router.put("/customers/" + isEditing, data, {
            onSuccess: () => cancelEdit(),
          });
        }
        else {
          router.post("/customers", data, {
            onSuccess: () => reset(),
          });
        }
      
    };

    const handleEdit = (contact) => {
        setIsEditing(contact.id);
        setData({
            type: contact.type,
            name: contact.name,
            phone: contact.phone || '',
            city: contact.city || '',
        });
        clearErrors();
    };

    const cancelEdit = () => {
        setIsEditing(null);
        reset();
        clearErrors();
    };

    const handleDelete = (id) => {
        if (confirm('Voulez-vous vraiment supprimer ce contact ?')) {
            router.delete(route('contacts.destroy', id));
        }
    };

    // Helper pour afficher un badge selon le type
    const renderTypeBadge = (type) => {
        switch (type) {
            case 'client': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">Client</span>;
            case 'supplier': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">Fournisseur</span>;
            case 'both': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium">Client & Fournisseur</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Erreur serveur globale (ex: suppression refusée) */}
            {serverErrors.error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg font-medium">
                    {serverErrors.error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* FORMULAIRE (Ajout / Édition) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-lg font-bold mb-4 text-gray-800">
                        {isEditing ? 'Modifier le contact' : 'Nouveau contact'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type de contact</label>
                            <select 
                                className="mt-1 block w-full rounded-lg border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 border"
                                value={data.type}
                                onChange={e => setData('type', e.target.value)}
                            >
                                <option value="client">Client</option>
                                <option value="supplier">Fournisseur</option>
                                <option value="both">Les deux (Mixte)</option>
                            </select>
                            {errors.type && <span className="text-red-500 text-xs">{errors.type}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom complet / Entreprise</label>
                            <input 
                                type="text" 
                                className="mt-1 block w-full rounded-lg border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 border"
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                            />
                            {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                            <input 
                                type="text" 
                                className="mt-1 block w-full rounded-lg border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 border"
                                value={data.phone} 
                                onChange={e => setData('phone', e.target.value)} 
                            />
                            {errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ville</label>
                            <input 
                                type="text" 
                                className="mt-1 block w-full rounded-lg border-gray-300 py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 border"
                                value={data.city} 
                                onChange={e => setData('city', e.target.value)} 
                            />
                            {errors.city && <span className="text-red-500 text-xs">{errors.city}</span>}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition font-medium"
                            >
                                {processing ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Ajouter')}
                            </button>
                            
                            {isEditing && (
                                <button 
                                    type="button" 
                                    onClick={cancelEdit}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                                >
                                    Annuler
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* LISTE DES CONTACTS */}
                <div className="lg:col-span-2 space-y-4">
                    
                    {/* Filtres & Recherche */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                            <button onClick={() => setActiveType('')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex-1 ${activeType === '' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Tous</button>
                            <button onClick={() => setActiveType('client')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex-1 ${activeType === 'client' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>Clients</button>
                            <button onClick={() => setActiveType('supplier')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex-1 ${activeType === 'supplier' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}>Fournisseurs</button>
                        </div>
                        
                        <div className="w-full sm:w-64 relative">
                            <input 
                                type="text"
                                placeholder="Rechercher (Nom, Ville...)"
                                className="w-full rounded-lg border-gray-300 py-1.5 pl-3 pr-4 focus:ring-emerald-500 focus:border-emerald-500 border text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Tableau */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {contacts.data.map(contact => (
                                        <tr key={contact.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{contact.name}</div>
                                                <div className="mt-1">{renderTypeBadge(contact.type)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {contact.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {contact.city || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEdit(contact)} className="text-emerald-600 hover:text-emerald-900 mr-4">Edit</button>
                                                <button onClick={() => handleDelete(contact.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {contacts.data.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                Aucun contact trouvé.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination (si nécessaire) */}
                        {contacts.links.length > 3 && (
                            <div className="bg-gray-50 px-6 py-3 border-t flex justify-center gap-1">
                                {contacts.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 text-xs rounded border ${
                                            link.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 hover:bg-gray-100'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        onClick={e => !link.url && e.preventDefault()}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}