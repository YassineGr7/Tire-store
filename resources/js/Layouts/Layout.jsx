import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  IconLayoutDashboard,
  IconArrowsExchange,
  IconDatabase,
  IconUsers,
  IconMichelinBibGourmand,
  IconBuildingWarehouse,
  IconSettings,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
  IconMenu2,
} from '@tabler/icons-react';

const navItems = [
  { label: 'Dashboard', icon: IconLayoutDashboard, href: '/' },
  { label: 'Transactions', icon: IconArrowsExchange, href: '/transactions' },
  { label: 'Stock', icon: IconDatabase, href: '/tires' },
  { label: 'Warehouses', icon: IconBuildingWarehouse, href: '/warehouses' },
  { label: 'Customers & Suppliers', icon: IconUsers, href: '/customers' },
  { label: 'Brands', icon: IconMichelinBibGourmand, href: '/brands' },
  { label: 'Settings', icon: IconSettings, href: '/settings' },
];

export default function Layout({ children }) {
  const { url, props } = usePage();
  const pageTitle = props.title || "Welcome";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract user data from Inertia props
  const user = props.auth?.user;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '#';

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col transition-all duration-300 ease-in-out shadow-lg`}>

        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white">
              T
            </div>
            {sidebarOpen && <span className="font-bold text-lg">TireStore</span>}
          </div>
        </div>

        <nav className="flex-1 py-3 px-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${url === item.href
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={18} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {sidebarOpen && url === item.href && (
                  <div className="ml-auto w-1 h-6 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-2 border-t border-slate-700 space-y-2">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700/50 transition cursor-pointer ${!sidebarOpen && 'justify-center'}`}>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {userInitial}
              </div>
            )}

            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || "Utilisateur" }</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition"
          >
            {sidebarOpen ? <IconLayoutSidebarLeftCollapse size={20} /> : <IconLayoutSidebarRightCollapse size={20} />}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <IconMenu2 size={22} className="text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenue, {user?.name || "Guest"} 👋
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
              <IconBell size={22} className="text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button> */}


            {/* Logout Button */}
            {/* <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-700 hover:text-red-600"
              title="Déconnexion"
            >
              <IconLogout size={22} />
            </button> */}

            {/* Logout Button */}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-1 text-red-600 bg-red-200 hover:bg-red-500 hover:text-white rounded-2xl transition"
              >
                <span className="font-medium text-current">
                  <span className="absolute top-7 right-28 w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="ml-2">Logout</span>
                </span>
              </button>
            )}

            {!user && (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-1 text-green-600 bg-green-200 hover:bg-green-400 hover:text-white rounded-2xl transition"
              >
                <span className="font-medium text-current">
                  <span className="absolute top-7 right-25 w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="ml-2">Login</span>
                </span>
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}