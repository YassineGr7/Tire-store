import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import {
  IconCoin,
  IconAperture,
  IconReportMoney,
  IconAlertTriangle,
  IconCalendar,
  IconTrendingUp,
  IconTrophy,
  IconBuildingWarehouse,
  IconReceipt,
  IconArrowRight
} from '@tabler/icons-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const WAREHOUSE_COLORS = ['#10b981', '#3b82f6', '#6366f1', '#f59e0b', '#ec4899'];

export default function Dashboard({ kpis, selectedMonth, dailySales, topSellingTires, stockByWarehouse, recentSales }) {

  const generateMonthOptions = () => {
    const options = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const value = `${year}-${month}`;
      const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
      date.setMonth(date.getMonth() - 1);
    }
    return options;
  };

  const handleMonthChange = (e) => {
    // router.get('/', { month: e.target.value }, { preserveState: true, preserveScroll: true, replace: true });
    router.get('/', { month: e.target.value }, { only: ['selectedMonth', 'kpis', 'dailySales', 'topSellingTires', 'stockByWarehouse', 'recentSales'], preserveScroll: true, replace: true });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Head title="Dashboard" />

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h2>
          <p className="text-sm text-gray-500">Statistiques et indicateurs de performance</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm w-fit">
          <IconCalendar size={18} className="text-gray-500" />
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer border-none p-0 pr-6"
          >
            {generateMonthOptions().map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartes KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <IconCoin size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">CA du mois</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.monthly_revenue)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <IconAperture size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pneus vendus</p>
            <h3 className="text-2xl font-bold text-gray-900">{kpis.tires_sold} <span className="text-sm font-normal text-gray-500">unités</span></h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
            <IconReportMoney size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Valeur stock (Actuel)</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.stock_value)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
            <IconAlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Alertes Stock</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900">{kpis.low_stock_count} <span className="text-sm font-normal text-gray-500">faibles</span></h3>
              {kpis.out_of_stock_count > 0 && (
                <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {kpis.out_of_stock_count} ruptures
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GRAPHIQUE 1 : Évolution des ventes */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <IconTrendingUp className="text-emerald-600" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Évolution des ventes quotidiennes</h3>
          </div>
          <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
            Dirhams (MAD)
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${formatCurrency(value)}`, 'Ventes']} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RANGÉE DEUXIÈME NIVEAU : Top Ventes + Stock par Dépôt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* BLOC 1 : Top Pneus les plus vendus */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col  h-fit">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <IconTrophy className="text-amber-500" size={20} />
              <h3 className="text-lg font-bold text-gray-900">Top Pneus les plus vendus</h3>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
              Historique Global
            </span>
          </div>

          <div className="space-y-4 items-center">
            {topSellingTires.map((tire, index) => {
              const maxQty = Math.max(...topSellingTires.map(t => t.quantity), 1);
              const percentage = (tire.quantity / maxQty) * 100;

              return (
                <div key={index} className="space-y-1.5" style={{ marginBottom: index !== topSellingTires.length - 1 ? '1rem' : '0' }}>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' :
                        index === 1 ? 'bg-blue-100 text-blue-700' :
                          index === 2 ? 'bg-indigo-100 text-indigo-700' :
                            'bg-gray-100 text-gray-500'
                        }`}>
                        {index + 1}
                      </span>
                      {tire.name}
                    </span>
                    <span className="font-bold text-gray-900">{tire.quantity} <span className="text-xs font-normal text-gray-500">unités</span></span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${index === 0 ? 'bg-emerald-500' :
                        index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-indigo-500' :
                            'bg-slate-400'
                        }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BLOC 2 : Répartition du stock par Dépôt */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <IconBuildingWarehouse className="text-blue-600" size={20} />
              <h3 className="text-lg font-bold text-gray-900">Stock par dépôt</h3>
            </div>
            <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
              Temps réel
            </span>
          </div>

          {/* Hauteur ajustée à h-48 pour correspondre au bloc de gauche */}
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockByWarehouse}
                  cx="50%"
                  cy="45%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="quantity"
                >
                  {stockByWarehouse.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={WAREHOUSE_COLORS[index % WAREHOUSE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} pneus`, 'Quantité']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-medium text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* RANGÉE TROISIÈME NIVEAU : Flux des Dernières Ventes (Live Activity Feed) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <IconReceipt className="text-emerald-600" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Dernières transactions</h3>
          </div>
          <span className="text-xs font-medium text-gray-500">5 dernières ventes complétées</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">N° Facture</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Articles</th>
                <th className="py-3 px-4">Montant</th>
                <th className="py-3 px-4">Date & Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900">{sale.invoice_number}</td>
                  <td className="py-3 px-4 font-medium text-slate-700">{sale.client_name}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      {sale.total_items} pneu(s)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600">{formatCurrency(sale.total_price)}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">{sale.date}</td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">
                    Aucune vente récente enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}