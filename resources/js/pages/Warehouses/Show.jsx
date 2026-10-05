import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
  IconPlus,
  IconBuilding,
  IconMapPin,
  IconPackage,
  IconChartBar,
  IconAlertTriangle,
  IconTrash,
  IconX,
  IconArrowLeft,
  IconSearch,
  IconCurrencyDirham,
} from '@tabler/icons-react';

export default function Show({ warehouse, tires, errors: serverErrors }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const { data, setData, post, processing, errors, reset } = useForm({
    tire_id: '',
    quantity: 1,
    purchase_price: '',
    selling_price: '',
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getCapacityPercent = () => {
    if (!warehouse.max_capacity || warehouse.max_capacity === 0) return null;
    return Math.min(100, Math.round((warehouse.current_stock / warehouse.max_capacity) * 100));
  };

  const getCapacityColor = (pct) => {
    if (pct >= 90) return { bar: 'bg-red-500', text: 'text-red-600' };
    if (pct >= 70) return { bar: 'bg-amber-400', text: 'text-amber-600' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const pct = getCapacityPercent();
  const colors = pct !== null ? getCapacityColor(pct) : null;

  // Filter already-stocked tires out of the dropdown (optional: remove if re-stocking is allowed)
  const stockedTireIds = new Set(warehouse.tires.map(t => t.id));
  const availableTires = tires ;

  // Search filter on the stock table
  const filteredStock = warehouse.tires.filter(t =>
    t.reference?.toLowerCase().includes(search.toLowerCase()) ||
    t.brand?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault();
    post(`/warehouses/${warehouse.id}/stock`, {
      onSuccess: () => {
        reset();
        setShowForm(false);
      },
    });
  };

  const handleRemoveTire = (tireId) => {
    if (confirm('Retirer ce pneu du dépôt ?')) {
      router.delete(`/warehouses/${warehouse.id}/stock/${tireId}`, { warehouse: warehouse.id, tire: tireId });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* BACK + HEADER */}
      <div className="flex items-end justify-between">
        <div>
          <button
            onClick={() => router.visit("/warehouses")}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-600 transition mb-2"
          >
            <IconArrowLeft size={13} /> Retour aux dépôts
          </button>
          <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-1">Logistique</p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{warehouse.name}</h1>
          {warehouse.address && (
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
              <IconMapPin size={13} /> {warehouse.address}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition shadow-sm"
        >
          <IconPlus size={17} />
          Ajouter un pneu
        </button>
      </div>

      {/* SERVER ERROR */}
      {serverErrors?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <IconAlertTriangle size={17} className="mt-0.5 shrink-0" />
          {serverErrors.error}
        </div>
      )}

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stock courant */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconPackage size={15} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Stock courant</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {warehouse.current_stock ?? 0}
            <span className="text-xs font-medium text-gray-400 ml-1">unités</span>
          </p>
        </div>

        {/* Capacité */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconChartBar size={15} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Capacité totale</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {warehouse.max_capacity > 0
              ? <>{warehouse.max_capacity}<span className="text-xs font-medium text-gray-400 ml-1">unités</span></>
              : <span className="text-base font-semibold text-gray-400">Illimitée</span>
            }
          </p>
        </div>

        {/* Références */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconBuilding size={15} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Références stockées</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {warehouse.tires.length}
            <span className="text-xs font-medium text-gray-400 ml-1">références</span>
          </p>
        </div>
      </div>

      {/* CAPACITY BAR */}
      {pct !== null && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Usage de la capacité</span>
            <span className={`text-xs font-bold ${colors.text}`}>{pct}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct >= 90 && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <IconAlertTriangle size={11} /> Capacité presque atteinte
            </p>
          )}
        </div>
      )}

      {/* ADD FORM — inline expandable card */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <IconPlus size={18} className="text-white" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Ajouter un pneu au stock</h2>
            </div>
            <button
              onClick={() => { setShowForm(false); reset(); }}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <IconX size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Tire selector */}
            <div className="space-y-1 lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Référence pneu
              </label>
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                value={data.tire_id}
                onChange={e => setData('tire_id', e.target.value)}
              >
                <option value="">Choisir un pneu...</option>
                {availableTires.map(tire => (
                  <option key={tire.id} value={tire.id}>
                    {tire.brand?.name} — {tire.reference}
                  </option>
                ))}
              </select>
              {errors.tire_id && <p className="text-red-500 text-xs">{errors.tire_id}</p>}
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantité</label>
              <input
                type="number"
                min={1}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                value={data.quantity}
                onChange={e => setData('quantity', e.target.value)}
              />
              {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity}</p>}
            </div>

            {/* Purchase price */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Prix d'achat</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  value={data.purchase_price}
                  onChange={e => setData('purchase_price', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">DH</span>
              </div>
              {errors.purchase_price && <p className="text-red-500 text-xs">{errors.purchase_price}</p>}
            </div>

            {/* Selling price */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Prix de vente</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  value={data.selling_price}
                  onChange={e => setData('selling_price', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">DH</span>
              </div>
              {errors.selling_price && <p className="text-red-500 text-xs">{errors.selling_price}</p>}
            </div>

            {/* Actions */}
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 pt-1">
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
                {processing ? 'Enregistrement...' : 'Ajouter au stock'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STOCK TABLE */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-bold text-gray-900">Stock de ce dépôt</h2>
          <div className="relative">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl py-2 pl-8 pr-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition w-52"
            />
          </div>
        </div>

        {/* Empty state */}
        {warehouse.tires.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <IconPackage size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500">Aucun pneu dans ce dépôt</p>
            <p className="text-xs text-gray-400 mt-1">Cliquez sur "Ajouter un pneu" pour commencer à remplir ce dépôt.</p>
          </div>
        ) : filteredStock.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-400">Aucun résultat pour "<span className="font-semibold">{search}</span>"</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Marque</th>
                <th className="text-left px-5 py-3">Référence</th>
                <th className="text-right px-5 py-3">Quantité</th>
                <th className="text-right px-5 py-3">Prix d'achat</th>
                <th className="text-right px-5 py-3">Prix de vente</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStock.map(tire => (
                <tr key={tire.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{tire.brand?.name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">{tire.reference}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-lg text-xs font-bold
                      ${tire.pivot.quantity <= 0
                        ? 'bg-red-50 text-red-600'
                        : tire.pivot.quantity <= 5
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                      {tire.pivot.quantity}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-gray-600">
                    {tire.pivot.purchase_price
                      ? <>{parseFloat(tire.pivot.purchase_price).toFixed(2)} <span className="text-gray-400 text-xs">DH</span></>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-gray-800">
                    {tire.pivot.selling_price
                      ? <>{parseFloat(tire.pivot.selling_price).toFixed(2)} <span className="text-gray-400 text-xs font-normal">DH</span></>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleRemoveTire(tire.id)}
                      className="text-gray-300 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50"
                      title="Retirer du dépôt"
                    >
                      <IconTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}