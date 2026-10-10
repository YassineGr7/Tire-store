import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { IconShieldCheck, IconAlertCircle } from '@tabler/icons-react';

export default function VerifyOtp({ email, flash }) {
  const { data, setData, post, processing, errors } = useForm({
    email: email || '',
    otp: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/verify-otp');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6">
      <Head title="Vérification OTP" />
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Code de confirmation</h1>
          <p className="text-xs text-gray-500 mt-0.5">Entrez le code à 6 chiffres envoyé à <span className="font-semibold text-gray-700">{email}</span></p>
          <span className="text-[10px] text-amber-600 block mt-1">(Vérifiez vos logs storage/logs/laravel.log en dev)</span>
        </div>

        {flash?.success && (
          <div className="mb-3 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            {flash.success}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Code OTP (6 chiffres)</label>
            <div className="relative">
              <IconShieldCheck size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                maxLength={6}
                value={data.otp}
                onChange={(e) => setData('otp', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs tracking-widest font-bold bg-slate-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="123456"
                autoFocus
              />
            </div>
            {errors.otp && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                <IconAlertCircle size={13} /> {errors.otp}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-xl text-xs hover:bg-emerald-700 transition disabled:opacity-50 mt-2"
          >
            {processing ? 'Vérification...' : 'Valider le code'}
          </button>
        </form>
      </div>
    </div>
  );
}
VerifyOtp.layout = (page) => page;