import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconFileInvoice,
  IconArrowRight,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconCircleX,
  IconShoppingCart,
  IconTruck,
  IconArrowsExchange,
  IconDownload,
} from '@tabler/icons-react';

const TYPE_CONFIG = {
  sale:     { label: 'Vente',     icon: IconShoppingCart,   cls: 'bg-coral-50 text-coral-700 border-coral-200',   dot: 'bg-coral-500'   },
  purchase: { label: 'Achat',     icon: IconTruck,          cls: 'bg-teal-50 text-teal-700 border-teal-200',      dot: 'bg-teal-500'    },
  transfer: { label: 'Transfer', icon: IconArrowsExchange, cls: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500'  },
};

const STATUS_CONFIG = {
  completed: { label: 'Complétée', icon: IconCircleCheck, cls: 'bg-emerald-50 text-emerald-700' },
  pending:   { label: 'En attente', icon: IconClock,       cls: 'bg-amber-50 text-amber-700'    },
  canceled:  { label: 'Annulée',   icon: IconCircleX,     cls: 'bg-red-50 text-red-600'        },
};

export default function Index({ transactions, filters, errors: serverErrors }) {
  const [search, setSearch]     = useState(filters.search ?? '');
  const [type, setType]         = useState(filters.type ?? '');
  const [status, setStatus]     = useState(filters.status ?? '');
  const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
  const [dateTo, setDateTo]     = useState(filters.date_to ?? '');

  const applyFilters = () => {
    router.get('/transactions/', {
      search, type, status, date_from: dateFrom, date_to: dateTo,
    }, { preserveState: true, replace: true });
  };

  const resetFilters = () => {
    setSearch(''); setType(''); setStatus(''); setDateFrom(''); setDateTo('');
    router.get('/transactions/', {}, { preserveState: true, replace: true });
  };

  const fmt = (val) => val
    ? new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(val) + ' DH'
    : '—';

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-1">Stock</p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Transactions</h1>
        </div>
        <button
          onClick={() => router.visit("/transactions/create")}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition shadow-sm"
        >
          <IconPlus size={17} />
          Nouvelle transaction
        </button>
      </div>

      {/* SERVER ERROR */}
      {serverErrors?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <IconAlertTriangle size={17} className="mt-0.5 shrink-0" />
          {serverErrors.error}
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          {/* Search */}
          <div className="relative lg:col-span-1">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="N° facture..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-8 pr-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
            />
          </div>

          {/* Type */}
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          >
            <option value="">Tous les types</option>
            <option value="sale">Vente</option>
            <option value="purchase">Achat</option>
            <option value="transfer">Transfert</option>
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          >
            <option value="">Tous les statuts</option>
            <option value="completed">Complétée</option>
            <option value="pending">En attente</option>
            <option value="canceled">Annulée</option>
          </select>

          {/* Date from */}
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          />

          {/* Date to */}
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">{transactions.total} résultat(s)</span>
          <div className="flex gap-2">
            <button onClick={resetFilters} className="text-xs text-gray-500 hover:text-gray-700 py-1.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
              Réinitialiser
            </button>
            <button onClick={applyFilters} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 py-1.5 px-3 rounded-lg transition">
              <IconFilter size={12} /> Filtrer
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {transactions.data.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <IconFileInvoice size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500">Aucune transaction trouvée</p>
            <p className="text-xs text-gray-400 mt-1">Créez votre première transaction pour commencer.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">N° Facture</th>
                  <th className="text-left px-5 py-3">Type</th>
                  <th className="text-left px-5 py-3">Contact</th>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Statut</th>
                  <th className="text-right px-5 py-3">Total</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.data.map(tx => {
                  const typeCfg   = TYPE_CONFIG[tx.type]   ?? {};
                  const statusCfg = STATUS_CONFIG[tx.status] ?? {};
                  const TypeIcon   = typeCfg.icon;
                  const StatusIcon = statusCfg.icon;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.visit(`transactions/${tx.id}`)}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-gray-700">
                        {tx.invoice_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${typeCfg.cls}`}>
                          {TypeIcon && <TypeIcon size={12} />}
                          {tx.type_label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {tx.contact?.name ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {fmtDate(tx.transaction_date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${statusCfg.cls}`}>
                          {StatusIcon && <StatusIcon size={12} />}
                          {tx.status_label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-gray-800">
                        {fmt(tx.grand_total)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <IconArrowRight size={15} className="text-gray-300 inline-block" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* PAGINATION */}
            {transactions.last_page > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">
                  Page {transactions.current_page} / {transactions.last_page}
                </span>
                <div className="flex gap-1">
                  {transactions.links.map((link, i) => (
                    <button
                      key={i}
                      disabled={!link.url}
                      onClick={() => link.url && router.visit(link.url)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition font-medium
                        ${link.active
                          ? 'bg-emerald-600 text-white'
                          : link.url
                          ? 'text-gray-500 hover:bg-gray-100'
                          : 'text-gray-300 cursor-not-allowed'
                        }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}