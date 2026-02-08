import { Store, StoreStatus } from '../types/store';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../utils/formatDate';
import { useDeleteStore } from '../hooks/useStores';
import { useState } from 'react';
import { ShoppingBagIcon, TrashIcon, ArrowTopRightOnSquareIcon, CogIcon } from '@heroicons/react/24/outline';

interface StoreCardProps {
  store: Store;
}

// Assign gradient background based on status
const getCardGradient = (status: StoreStatus) => {
  switch (status) {
    case 'Provisioning':
      return 'bg-gradient-blue';
    case 'Ready':
      return 'bg-gradient-mint';
    case 'Failed':
      return 'bg-gradient-coral';
    default:
      return 'bg-gradient-sand';
  }
};

export function StoreCard({ store }: StoreCardProps) {
  const deleteStore = useDeleteStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete store ${store.id}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteStore.mutateAsync(store.id);
    } catch (error) {
      console.error('Failed to delete store:', error);
      alert('Failed to delete store. Please try again.');
      setIsDeleting(false);
    }
  };

  const openStore = () => {
    if (store.url) {
      window.open(`http://${store.url}`, '_blank');
    }
  };

  const openAdmin = () => {
    if (store.url) {
      window.open(`http://${store.url}/wp-admin`, '_blank');
    }
  };

  return (
    <div
      className={`rounded-2xl p-6 ${getCardGradient(store.status)}
                  border border-gray-100 hover:shadow-xl transition-all duration-300
                  animate-scale-in`}
    >
      {/* Header with icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
            <ShoppingBagIcon className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h3 className="card-title">{store.id}</h3>
            <p className="card-subtitle capitalize">{store.type}</p>
          </div>
        </div>
        <StatusBadge status={store.status} />
      </div>

      {/* URL section with better styling */}
      {store.url && (
        <div className="mb-4 p-3 bg-white/60 rounded-lg backdrop-blur-sm">
          <p className="text-xs text-gray-500 mb-1 font-medium">Store URL</p>
          <a
            href={`http://${store.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 break-all"
          >
            {store.url}
          </a>
        </div>
      )}

      {/* Error message */}
      {store.error_message && (
        <div className="mb-4 p-3 bg-white/80 border border-red-200 rounded-lg">
          <p className="text-xs text-red-800 font-semibold mb-1">Error:</p>
          <p className="text-sm text-red-700">{store.error_message}</p>
        </div>
      )}

      {/* Metadata row */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
        <span>Created {formatDate(store.created_at)}</span>
        <span className="font-mono">ID: {store.id.slice(0, 8)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {store.status === 'Ready' && (
          <>
            <button
              onClick={openStore}
              className="flex-1 bg-white/90 text-primary-700 px-4 py-2.5 rounded-lg text-sm font-medium
                         hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-2
                         border border-primary-200"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              Open Store
            </button>
            <button
              onClick={openAdmin}
              className="flex-1 bg-white/70 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium
                         hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-2
                         border border-gray-200"
            >
              <CogIcon className="w-4 h-4" />
              Admin
            </button>
          </>
        )}

        {(store.status === 'Ready' || store.status === 'Failed') && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-white/70 text-red-700 px-4 py-2.5 rounded-lg text-sm font-medium
                       hover:bg-white hover:shadow-md transition-all disabled:opacity-50
                       disabled:cursor-not-allowed flex items-center justify-center gap-2
                       border border-red-200"
          >
            <TrashIcon className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}
