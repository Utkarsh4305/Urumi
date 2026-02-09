import { PlusIcon, ShoppingBagIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { StatCard } from './StatCard';
import { Store } from '../types/store';

interface HeaderProps {
  stores: Store[];
  onCreateStore: () => void;
}

export function Header({ stores, onCreateStore }: HeaderProps) {
  const totalStores = stores.length;
  const provisioningCount = stores.filter((s) => s.status === 'Provisioning').length;
  const readyCount = stores.filter((s) => s.status === 'Ready').length;
  const failedCount = stores.filter((s) => s.status === 'Failed').length;

  return (
    <header className="sticky top-0 z-20 pt-4 px-4 sm:px-6 lg:px-8">
      {/* Glass morphism header container */}
      <div className="max-w-7xl mx-auto">
        <div className="glass-header rounded-2xl p-4 sm:p-6">
          {/* Top row: Logo + Actions */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {/* Logo mark with animated gradient */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 ring-2 ring-white/20">
                <span className="text-white font-extrabold text-lg drop-shadow-sm">U</span>
              </div>
              <div>
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-slate-800 via-violet-700 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                  Urumi
                </h1>
                <p className="text-xs text-slate-500/90 font-semibold tracking-wide uppercase">Store Platform</p>
              </div>
            </div>

            <button
              onClick={onCreateStore}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm
                         bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600
                         shadow-lg shadow-violet-500/30 ring-1 ring-white/20
                         hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5
                         active:scale-[0.98] transition-all duration-200"
            >
              <PlusIcon className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Create Store</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Stores"
              value={totalStores}
              variant="default"
              icon={<ShoppingBagIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Provisioning"
              value={provisioningCount}
              variant="info"
              icon={<ClockIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Ready"
              value={readyCount}
              variant="success"
              icon={<CheckCircleIcon className="w-5 h-5" />}
            />
            <StatCard
              label="Failed"
              value={failedCount}
              variant="danger"
              icon={<ExclamationCircleIcon className="w-5 h-5" />}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
