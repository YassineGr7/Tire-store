import React, { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
  IconPlus, IconTrash, IconArrowLeft, IconAlertTriangle,
  IconShoppingCart, IconTruck, IconArrowsExchange, IconChevronDown,
} from '@tabler/icons-react';

const TYPES = [
  { value: 'sale', label: 'Vente', desc: 'Sortie de stock vers un client', icon: IconShoppingCart, color: 'border-orange-400 bg-orange-50 text-orange-700' },
  { value: 'purchase', label: 'Achat', desc: 'Entrée de stock depuis un fournisseur', icon: IconTruck, color: 'border-teal-400 bg-teal-50 text-teal-700' },
  { value: 'transfer', label: 'Transfert', desc: 'Déplacement entre deux dépôts internes', icon: IconArrowsExchange, color: 'border-purple-400 bg-purple-50 text-purple-700' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'virement', label: 'Virement bancaire' },
];

const emptyItem = () => ({
  _key: Math.random(),
  tire_id: '',
  quantity: 1,
  unit_price: '',
  from_warehouse_id: '',
  to_warehouse_id: '',
});

export default function Create({ warehouses, tires, clients, suppliers, errors: serverErrors }) {
  const [step, setStep] = useState(1); // 1: type, 2: header, 3: items, 4: confirm

  const { data, setData, post, processing, errors, reset } = useForm({
    type: 'sale',
    contact_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    items: [emptyItem()],
  });

  // Contacts filtered by transaction type
  const filteredContacts = useMemo(() => {
    if (data.type === 'sale') return clients;
    if (data.type === 'purchase') return suppliers;
    return [];
  }, [data.type, clients, suppliers]);

  const findStockRow = (tireId, warehouseId) => {
    if (!tireId || !warehouseId) return null;

    const tire = tires.find(t => t.id === parseInt(tireId));
    return tire?.warehouses?.find(w => w.id === parseInt(warehouseId)) ?? null;
  };

  const getSaleUnitPrice = (tireId, warehouseId) => {
    const stock = findStockRow(tireId, warehouseId);
    if (!stock?.pivot) return '';

    const sellingPrice = parseFloat(stock.pivot.selling_price || 0);
    const purchasePrice = parseFloat(stock.pivot.purchase_price || 0);

    return sellingPrice > 0 ? sellingPrice : purchasePrice > 0 ? purchasePrice : '';
  };

  const handleTypeSelect = (type) => {
    setData({
      ...data,
      type,
      contact_id: '',
      payment_method: type === 'transfer' ? '' : (data.payment_method || 'cash'),
      items: [emptyItem()],
    });
  };

  // ── Item helpers ───────────────────────────────────────────────────────────

  const updateItem = (idx, field, value) => {
    const items = [...data.items];
    items[idx] = { ...items[idx], [field]: value };

    if (data.type === 'sale' && ['tire_id', 'from_warehouse_id'].includes(field)) {
      const price = getSaleUnitPrice(items[idx].tire_id, items[idx].from_warehouse_id);
      items[idx].unit_price = price === '' ? '' : String(price);
    }

    if (data.type === 'transfer') {
      items[idx].unit_price = 0;
    }

    setData('items', items);
  };

  const addItem = () => setData('items', [...data.items, emptyItem()]);

  const removeItem = (idx) => {
    if (data.items.length === 1) return;
    setData('items', data.items.filter((_, i) => i !== idx));
  };

  const grandTotal = data.items.reduce((sum, item) => {
    if (data.type === 'transfer') return sum;
    return sum + (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0));
  }, 0);

  const fmt = (v) => new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(v);

  // ── Validation per step ────────────────────────────────────────────────────

  const canGoNext = () => {
    if (step === 1) return !!data.type;
    if (step === 2) {
      if (data.type !== 'transfer' && !data.contact_id) return false;
      if (!data.transaction_date) return false;
      return true;
    }
    if (step === 3) {
      return data.items.every(item => {
        if (!item.tire_id || !item.quantity) return false;
        if (data.type !== 'transfer' && !item.unit_price) return false;
        if (data.type === 'sale' && !item.from_warehouse_id) return false;
        if (data.type === 'purchase' && !item.to_warehouse_id) return false;
        if (data.type === 'transfer' && (!item.from_warehouse_id || !item.to_warehouse_id)) return false;
        if (['sale', 'transfer'].includes(data.type)) {
          const available = parseInt(findStockRow(item.tire_id, item.from_warehouse_id)?.pivot?.quantity ?? 0);
          if (available < parseInt(item.quantity || 0)) return false;
        }
        return true;
      });
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post("/transactions/", {
      onSuccess: () => reset(),
    });
  };

  const firstError = Object.values(errors)[0] || serverErrors?.error;

  const stepLabels = ['Type', 'Informations', 'Articles', 'Confirmation'];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <button
          onClick={() => router.visit("/transactions")}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-600 transition mb-2"
        >
          <IconArrowLeft size={13} /> Retour aux transactions
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Nouvelle transaction</h1>
      </div>

      {/* SERVER ERROR */}
      {firstError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <IconAlertTriangle size={17} className="mt-0.5 shrink-0" />
          {firstError}
        </div>
      )}

      {/* STEPPER */}
      <div className="flex items-center gap-0">
        {stepLabels.map((label, i) => {
          const num = i + 1;
          const active = step === num;
          const done = step > num;
          return (
            <React.Fragment key={num}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition
                  ${done ? 'bg-emerald-600 text-white' :
                    active ? 'bg-gray-900 text-white' :
                      'bg-gray-100 text-gray-400'}`}>
                  {done ? '✓' : num}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-gray-900' : done ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`flex-1 h-px mx-3 ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── STEP 1: Type ──────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Quel type d'opération ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TYPES.map(t => {
                const Icon = t.icon;
                const selected = data.type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleTypeSelect(t.value)}
                    className={`text-left p-4 rounded-2xl border-2 transition ${selected ? t.color + ' border-current' : 'border-gray-100 hover:border-gray-300 bg-white'
                      }`}
                  >
                    <Icon size={24} className="mb-2" />
                    <p className="text-sm font-bold">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2: Header info ───────────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Informations de la transaction</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Contact (hidden for transfer) */}
              {data.type !== 'transfer' && (
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {data.type === 'sale' ? 'Client' : 'Fournisseur'}
                  </label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                    value={data.contact_id}
                    onChange={e => setData('contact_id', e.target.value)}
                  >
                    <option value="">Choisir un contact...</option>
                    {filteredContacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.contact_id && <p className="text-red-500 text-xs">{errors.contact_id}</p>}
                </div>
              )}

              {/* Date */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
                <input
                  type="date"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                  value={data.transaction_date}
                  onChange={e => setData('transaction_date', e.target.value)}
                />
                {errors.transaction_date && <p className="text-red-500 text-xs">{errors.transaction_date}</p>}
              </div>

              {/* Payment method (hidden for internal transfers) */}
              {data.type !== 'transfer' && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Mode de paiement</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                    value={data.payment_method}
                    onChange={e => setData('payment_method', e.target.value)}
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Line items ────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Articles</h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-1.5 px-3 rounded-lg transition"
              >
                <IconPlus size={13} /> Ajouter une ligne
              </button>
            </div>

            <div className="space-y-3">
              {data.items.map((item, idx) => {
                const lineTotal = parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0);
                const sourceStock = findStockRow(item.tire_id, item.from_warehouse_id);
                const availableQuantity = sourceStock?.pivot?.quantity ?? 0;
                return (
                  <div key={item._key} className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">Ligne {idx + 1}</span>
                      {data.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500 transition">
                          <IconTrash size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Tire */}
                      <div className="col-span-2 space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Pneu</label>
                        <select
                          className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                          value={item.tire_id}
                          onChange={e => updateItem(idx, 'tire_id', e.target.value)}
                        >
                          <option value="">Choisir un pneu...</option>
                          {tires.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.brand?.name} — {t.reference}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantité</label>
                        <input
                          type="number" min={1}
                          className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                          value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', e.target.value)}
                        />
                      </div>

                      {/* Unit price (not needed for transfers) */}
                      {data.type !== 'transfer' && (
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Prix unitaire</label>
                          <div className="relative">
                            <input
                              type="number" min={0} step="0.01" placeholder="0.00"
                              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                              value={item.unit_price}
                              onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">DH</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Warehouse selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* From warehouse (sale + transfer) */}
                      {(data.type === 'sale' || data.type === 'transfer') && (
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {data.type === 'transfer' ? 'Dépôt source' : 'Dépôt de sortie'}
                          </label>
                          <select
                            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                            value={item.from_warehouse_id}
                            onChange={e => updateItem(idx, 'from_warehouse_id', e.target.value)}
                          >
                            <option value="">Choisir un dépôt...</option>
                            {warehouses.map(w => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                          {item.tire_id && item.from_warehouse_id && (
                            <p className={`text-xs ${availableQuantity < parseInt(item.quantity || 0) ? 'text-red-500' : 'text-gray-400'}`}>
                              Disponible : {availableQuantity}
                            </p>
                          )}
                        </div>
                      )}

                      {/* To warehouse (purchase + transfer) */}
                      {(data.type === 'purchase' || data.type === 'transfer') && (
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {data.type === 'transfer' ? 'Dépôt destination' : 'Dépôt de réception'}
                          </label>
                          <select
                            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                            value={item.to_warehouse_id}
                            onChange={e => updateItem(idx, 'to_warehouse_id', e.target.value)}
                          >
                            <option value="">Choisir un dépôt...</option>
                            {warehouses
                              .filter(w => data.type !== 'transfer' || w.id !== parseInt(item.from_warehouse_id))
                              .map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Line total */}
                    {data.type !== 'transfer' && lineTotal > 0 && (
                      <div className="flex justify-end">
                        <span className="text-xs font-semibold text-gray-500">
                          Sous-total : <span className="text-gray-900">{fmt(lineTotal)} DH</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grand total preview */}
            {data.type !== 'transfer' && grandTotal > 0 && (
              <div className="flex justify-end border-t border-gray-100 pt-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5">Total général</p>
                  <p className="text-2xl font-extrabold text-gray-900">{fmt(grandTotal)} <span className="text-sm font-medium text-gray-400">DH</span></p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Confirmation ──────────────────────────────────────────── */}
        {step === 4 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-900">Récapitulatif</h2>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Type', value: TYPES.find(t => t.value === data.type)?.label },
                { label: 'Date', value: data.transaction_date },
                ...(data.type !== 'transfer' ? [{ label: 'Paiement', value: PAYMENT_METHODS.find(m => m.value === data.payment_method)?.label }] : []),
                { label: 'Nb. articles', value: data.items.length },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Items recap */}
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-2 rounded-l-lg">Pneu</th>
                  <th className="text-right px-4 py-2">Qté</th>
                  {data.type !== 'transfer' && <th className="text-right px-4 py-2">Prix unit.</th>}
                  {data.type !== 'transfer' && <th className="text-right px-4 py-2 rounded-r-lg">Total</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.items.map((item, idx) => {
                  const tire = tires.find(t => t.id === parseInt(item.tire_id));
                  const total = parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0);
                  return (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 text-gray-700">{tire ? `${tire.brand?.name} ${tire.reference}` : '—'}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{item.quantity}</td>
                      {data.type !== 'transfer' && <td className="px-4 py-2.5 text-right text-gray-600">{fmt(item.unit_price)} DH</td>}
                      {data.type !== 'transfer' && <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{fmt(total)} DH</td>}
                    </tr>
                  );
                })}
              </tbody>
              {data.type !== 'transfer' && (
                <tfoot>
                  <tr className="border-t-2 border-gray-100">
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-700">Total général</td>
                    <td className="px-4 py-3 text-right text-lg font-extrabold text-gray-900">{fmt(grandTotal)} DH</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* NAV BUTTONS */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => step > 1 ? setStep(s => s - 1) : router.visit(route('transactions.index'))}
            className="text-sm font-semibold text-gray-500 hover:text-gray-700 py-2.5 px-5 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          >
            {step === 1 ? 'Annuler' : '← Retour'}
          </button>

          {step < 4 ? (
            <button
              type="button"
              disabled={!canGoNext()}
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuer →
            </button>
          ) : (
            <button
              type="submit"
              disabled={processing}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-6 rounded-xl transition disabled:opacity-50"
            >
              {processing ? 'Enregistrement...' : '✓ Confirmer la transaction'}
            </button>
          )}
        </div>
      </form>

    </div>
  );
}
