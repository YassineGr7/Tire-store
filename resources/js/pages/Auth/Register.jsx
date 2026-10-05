import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { IconUser, IconMail, IconLock, IconAlertCircle } from '@tabler/icons-react';

export default function Register({ status, error }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/register', {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      <Head title="Créer un compte" />

      {/* Panneau gauche : Branding & Visuals */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white text-xl">
            T
          </div>
          <span className="font-bold text-2xl tracking-wide">TireStore</span>
        </div>

        <div className="z-10 max-w-md space-y-4">
          <h2 className="text-3xl font-extrabold leading-tight">
            Gérez vos stocks de pneu en toute simplicité.
          </h2>
          <p className="text-slate-400 text-sm">
            Accédez à votre plateforme d'administration pour suivre vos transactions, entrepôts et inventaires en temps réel.
          </p>
        </div>

        <div className="text-xs text-slate-500 z-10">
          © {new Date().getFullYear()} TireStore. Tous droits réservés.
        </div>

        {/* Effet décoratif en arrière-plan */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Panneau droit : Formulaire d'inscription */}
      <div className="flex items-center justify-center p-6 my-auto">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
            <p className="text-xs text-gray-500 mt-1">Saisissez vos informations pour vous inscrire</p>
          </div>

          {status && (
            <div className="text-xs font-medium text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              {status}
            </div>
          )}

          {error && (
            <div className="text-xs font-medium text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Inscription avec Google */}
          {/* <a
            href="/auth/google"
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            S'inscrire avec Google
          </a> */}

          {/* Séparateur */}
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-50 px-2 text-gray-400 font-medium">ou e-mail</span>
            </div>
          </div> */}

          {/* Formulaire */}
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <div className="relative">
                <IconUser size={16} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2  bg-white border ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900`}
                  placeholder="Ahmed Kaddouri"
                  autoFocus
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <IconAlertCircle size={13} /> {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <div className="relative">
                <IconMail size={16} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2  bg-white border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900`}
                  placeholder="nom@exemple.com"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <IconAlertCircle size={13} /> {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <IconLock size={16} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2  bg-white border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                  } rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <IconAlertCircle size={13} /> {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <div className="relative">
                <IconLock size={16} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-emerald-500 focus:outline-none focus:ring-2 transition-all text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-emerald-700 transition shadow-xs disabled:opacity-50 mt-2"
            >
              {processing ? 'Création du compte...' : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

Register.layout = (page) => page;