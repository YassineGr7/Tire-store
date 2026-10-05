import React from 'react';
import { router } from '@inertiajs/react';
import {
  IconArrowLeft, IconDownload, IconCircleX, IconAlertTriangle,
  IconShoppingCart, IconTruck, IconArrowsExchange,
  IconCircleCheck, IconClock, IconUser, IconCalendar,
  IconCreditCard, IconFileInvoice,
} from '@tabler/icons-react';

const STATUS_CONFIG = {
  completed: { label: 'Complétée', cls: 'bg-emerald-50 text-emerald-700', icon: IconCircleCheck },
  pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-700',    icon: IconClock       },
  canceled:  { label: 'Annulée',   cls: 'bg-red-50 text-red-600',         icon: IconCircleX     },
};

const TYPE_CONFIG = {
  sale:     { label: 'Vente',     icon: IconShoppingCart,   cls: 'bg-orange-50 text-orange-700' },
  purchase: { label: 'Achat',     icon: IconTruck,          cls: 'bg-teal-50 text-teal-700'     },
  transfer: { label: 'Transfert', icon: IconArrowsExchange, cls: 'bg-purple-50 text-purple-700' },
};

const PAYMENT_LABELS = {
  cash:     'Espèces',
  cheque:   'Chèque',
  virement: 'Virement bancaire',
};

export default function Show({ transaction, errors: serverErrors }) {
  const status  = STATUS_CONFIG[transaction.status] ?? {};
  const type    = TYPE_CONFIG[transaction.type] ?? {};
  const TypeIcon   = type.icon;
  const StatusIcon = status.icon;

  const fmt = (v) => v != null
    ? new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2 }).format(v) + ' DH'
    : '—';

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const handleCancel = () => {
    if (confirm('Annuler cette transaction ? Le stock sera restauré automatiquement.')) {
      router.post(`/transactions/${transaction.id}/cancel`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.visit('/transactions')}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-600 transition mb-2"
          >
            <IconArrowLeft size={13} /> Retour aux transactions
          </button>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-mono">
              {transaction.invoice_number}
            </h1>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${status.cls}`}>
              {StatusIcon && <StatusIcon size={12} />}
              {status.label}
            </span>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${type.cls}`}>
            {TypeIcon && <TypeIcon size={12} />}
            {type.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* PDF download - only for sales */}
          {transaction.type === 'sale' && transaction.status === 'completed' && (
            <a
              href={`${transaction.id}/pdf`}
              target="_blank"
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition"
            >
              <IconDownload size={15} />
              Facture PDF
            </a>
          )}

          {/* Cancel button */}
          {transaction.status === 'completed' && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold py-2.5 px-4 rounded-xl transition border border-red-200"
            >
              <IconCircleX size={15} />
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* SERVER ERROR */}
      {serverErrors?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <IconAlertTriangle size={17} className="mt-0.5 shrink-0" />
          {serverErrors.error}
        </div>
      )}

      {/* INFO CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconUser size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">{transaction.contact?.name ?? '—'}</p>
          {transaction.contact?.phone && (
            <p className="text-xs text-gray-400 mt-0.5">{transaction.contact.phone}</p>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconCalendar size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">{fmtDate(transaction.transaction_date)}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconCreditCard size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Paiement</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">{PAYMENT_LABELS[transaction.payment_method] ?? '—'}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconFileInvoice size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</span>
          </div>
          <p className="text-xl font-extrabold text-gray-900">{fmt(transaction.grand_total)}</p>
        </div>
      </div>

      {/* LINE ITEMS TABLE */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-bold text-gray-900">Détail des articles</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <th className="text-left px-5 py-3">Pneu</th>
              {transaction.type !== 'purchase' && (
                <th className="text-left px-5 py-3">Dépôt source</th>
              )}
              {transaction.type !== 'sale' && (
                <th className="text-left px-5 py-3">Dépôt destination</th>
              )}
              <th className="text-right px-5 py-3">Quantité</th>
              <th className="text-right px-5 py-3">Prix unit.</th>
              <th className="text-right px-5 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transaction.details.map(detail => (
              <tr key={detail.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-gray-800">{detail.tire?.brand?.name ?? '—'}</p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{detail.tire?.reference}</p>
                </td>
                {transaction.type !== 'purchase' && (
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{detail.from_warehouse?.name ?? '—'}</td>
                )}
                {transaction.type !== 'sale' && (
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{detail.to_warehouse?.name ?? '—'}</td>
                )}
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                    {detail.quantity}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right text-gray-600">
                  {fmt(detail.unit_price)}
                </td>
                <td className="px-5 py-3.5 text-right font-semibold text-gray-800">
                  {fmt(detail.total_price)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-100">
              <td
                colSpan={transaction.type === 'transfer' ? 5 : 4}
                className="px-5 py-4 text-right text-sm font-bold text-gray-700"
              >
                Total général
              </td>
              <td className="px-5 py-4 text-right text-xl font-extrabold text-gray-900">
                {fmt(transaction.grand_total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}