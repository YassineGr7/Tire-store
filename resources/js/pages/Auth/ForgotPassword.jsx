import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { IconMail, IconAlertCircle, IconCheck } from '@tabler/icons-react';

export default function ForgotPassword({ flash }) {
  const { data, setData, post, processing, errors } = useForm({ email: '' });

  const submit = (e) => {
    e.preventDefault();
    post('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6">
      <Head title="Mot de passe oublié" />
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p className="text-xs text-gray-500 mt-0.5">Entrez votre e-mail pour recevoir un code OTP</p>
        </div>

        {flash?.success && (
          <div className="mb-3 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            {flash.success}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">E-mail</label>
            <div className="relative">
              <IconMail size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="nom@exemple.com"
                autoFocus
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                <IconAlertCircle size={13} /> {errors.email}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-xl text-xs hover:bg-emerald-700 transition disabled:opacity-50 mt-2"
          >
            {processing ? 'Envoi en cours...' : 'Envoyer le code OTP'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs">
          <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
ForgotPassword.layout = (page) => page;