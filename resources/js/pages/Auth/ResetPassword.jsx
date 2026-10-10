import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { IconLock, IconAlertCircle } from '@tabler/icons-react';

export default function ResetPassword({ email }) {
  const { data, setData, post, processing, errors } = useForm({
    email: email || '',
    password: '',
    password_confirmation: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/reset-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6">
      <Head title="Nouveau mot de passe" />
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Nouveau mot de passe</h1>
          <p className="text-xs text-gray-500 mt-0.5">Choisissez un nouveau mot de passe sécurisé</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <IconLock size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="••••••••"
                autoFocus
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                <IconAlertCircle size={13} /> {errors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <div className="relative">
              <IconLock size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="password"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-xl text-xs hover:bg-emerald-700 transition disabled:opacity-50 mt-2"
          >
            {processing ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
ResetPassword.layout = (page) => page;