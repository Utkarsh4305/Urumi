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
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Top row: Logo + Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Urumi</h1>
            <p className="text-sm text-gray-500 mt-1">Store Provisioning Platform</p>
          </div>
          <button
            onClick={onCreateStore}
            className="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium
                       hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30
                       hover:shadow-xl hover:shadow-primary-500/40 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Store
          </button>
        </div>

        {/* Stats row: Quick metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Stores"
            value={totalStores}
            color="gray"
            icon={<ShoppingBagIcon className="w-5 h-5" />}
          />
          <StatCard
            label="Provisioning"
            value={provisioningCount}
            color="blue"
            icon={<ClockIcon className="w-5 h-5" />}
          />
          <StatCard
            label="Ready"
            value={readyCount}
            color="green"
            icon={<CheckCircleIcon className="w-5 h-5" />}
          />
          <StatCard
            label="Failed"
            value={failedCount}
            color="red"
            icon={<ExclamationCircleIcon className="w-5 h-5" />}
          />
        </div>
      </div>
    </header>
  );
}
