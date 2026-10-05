import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
  IconPlus,
  IconBuilding,
  IconMapPin,
  IconPackage,
  IconTrash,
  IconX,
  IconChartBar,
  IconAlertTriangle,
} from '@tabler/icons-react';

export default function Index({ warehouses, errors: serverErrors }) {
  const [showForm, setShowForm] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    address: '',
    max_capacity: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('warehouses', {
      onSuccess: () => {
        reset();
        setShowForm(false);
      },
    });
  };

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dépôt ?')) {
      router.delete(`/warehouses/${id}`);
    }
  };

  const getCapacityPercent = (warehouse) => {
    if (!warehouse.max_capacity || warehouse.max_capacity === 0) return null;
    return Math.min(100, Math.round((warehouse.current_stock / warehouse.max_capacity) * 100));
  };

  const getCapacityColor = (pct) => {
    if (pct >= 90) return { bar: 'bg-red-500', text: 'text-red-600' };
    if (pct >= 70) return { bar: 'bg-amber-400', text: 'text-amber-600' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* PAGE HEADER */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-1">Logistique</p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dépôts</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition shadow-sm"
        >
          <IconPlus size={17} />
          Nouveau dépôt
        </button>
      </div>

      {/* SERVER ERROR */}
      {serverErrors?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <IconAlertTriangle size={17} className="mt-0.5 shrink-0" />
          {serverErrors.error}
        </div>
      )}

      {/* ADD FORM — inline expandable card */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <IconBuilding size={18} className="text-white" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Créer un nouveau dépôt</h2>
            </div>
            <button onClick={() => { setShowForm(false); reset(); }} className="text-gray-400 hover:text-gray-600 transition">
              <IconX size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom du dépôt</label>
              <input
                type="text"
                placeholder="Ex: Magasin Principal"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                value={data.name}
                onChange={e => setData('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Adresse <span className="normal-case font-normal text-gray-400">(optionnelle)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Rue Hassan II, Casablanca"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                value={data.address}
                onChange={e => setData('address', e.target.value)}
              />
              {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Capacité max <span className="normal-case font-normal text-gray-400">(0 = illimitée)</span>
              </label>
              <input
                type="number"
                min={0}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                value={data.max_capacity}
                onChange={e => setData('max_capacity', e.target.value)}
              />
              {errors.max_capacity && <p className="text-red-500 text-xs">{errors.max_capacity}</p>}
            </div>

            <div className="sm:col-span-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); reset(); }}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700 py-2.5 px-5 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={processing}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition disabled:opacity-50"
              >
                <IconPlus size={16} />
                {processing ? 'Enregistrement...' : 'Créer le dépôt'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EMPTY STATE */}
      {warehouses.length === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <IconBuilding size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-500">Aucun dépôt configuré</p>
          <p className="text-xs text-gray-400 mt-1">Créez votre premier dépôt pour commencer à gérer votre stock.</p>
        </div>
      )}

      {/* WAREHOUSE CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {warehouses.map(warehouse => {
          const pct = getCapacityPercent(warehouse);
          const colors = pct !== null ? getCapacityColor(pct) : null;

          return (
            <div key={warehouse.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">

              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <IconBuilding size={20} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{warehouse.name}</h3>
                    {warehouse.address ? (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                        <IconMapPin size={11} /> {warehouse.address}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-300 mt-0.5">Adresse non renseignée</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(warehouse.id)}
                  className="shrink-0 text-gray-300 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50"
                  title="Supprimer"
                >
                  <IconTrash size={15} />
                </button>
              </div>

              <div className="h-px bg-gray-50" />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <IconPackage size={13} className="text-gray-400" />
                    <span className="text-xs text-gray-400 font-medium">Stock courant</span>
                  </div>
                  <p className="text-xl font-extrabold text-gray-900">
                    {warehouse.current_stock ?? 0}
                    <span className="text-xs font-medium text-gray-400 ml-1">unités</span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <IconChartBar size={13} className="text-gray-400" />
                    <span className="text-xs text-gray-400 font-medium">Capacité totale</span>
                  </div>
                  <p className="text-xl font-extrabold text-gray-900">
                    {warehouse.max_capacity > 0
                      ? <>{warehouse.max_capacity}<span className="text-xs font-medium text-gray-400 ml-1">unités</span></>
                      : <span className="text-sm font-semibold text-gray-400">Illimitée</span>
                    }
                  </p>
                </div>
              </div>

              {/* Capacity bar */}
              {pct !== null && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400 font-medium">Usage de la capacité</span>
                    <span className={`text-xs font-bold ${colors.text}`}>{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {pct >= 90 && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <IconAlertTriangle size={11} /> Capacité presque atteinte
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => router.visit(`/warehouses/${warehouse.id}`)}
                  className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 py-2 rounded-xl transition"
                >
                  Voir le stock
                </button>
                <button
                  onClick={() => router.visit(route('warehouses.transactions', warehouse.id))}
                  className="text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 py-2 rounded-xl transition"
                >
                  Transactions
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}