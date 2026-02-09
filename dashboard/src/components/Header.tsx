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
    <header className="sticky top-0 z-20">
      {/* Transparent glass header */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Top row: Logo + Actions */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {/* Logo mark with gradient */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Urumi</h1>
                <p className="text-xs text-slate-500 font-medium">Store Platform</p>
              </div>
            </div>

            <button
              onClick={onCreateStore}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
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
