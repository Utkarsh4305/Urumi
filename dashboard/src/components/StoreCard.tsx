import { Store, StoreStatus } from '../types/store';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../utils/formatDate';
import { useDeleteStore } from '../hooks/useStores';
import { useState } from 'react';
import { ShoppingBagIcon, TrashIcon, ArrowTopRightOnSquareIcon, CogIcon } from '@heroicons/react/24/outline';

interface StoreCardProps {
  store: Store;
}

const getCardStyles = (status: StoreStatus) => {
  switch (status) {
    case 'Provisioning':
      return {
        accent: 'border-sky-200/50',
        iconBg: 'bg-sky-100',
        iconColor: 'text-sky-600',
      };
    case 'Ready':
      return {
        accent: 'border-emerald-200/50',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
      };
    case 'Failed':
      return {
        accent: 'border-rose-200/50',
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-600',
      };
    default:
      return {
        accent: 'border-slate-200/50',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
      };
  }
};

export function StoreCard({ store }: StoreCardProps) {
  const deleteStore = useDeleteStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const styles = getCardStyles(store.status);

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
      className={`glass-card glass-card-hover p-5 ${styles.accent} animate-scale-in`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
            <ShoppingBagIcon className={`w-5 h-5 ${styles.iconColor}`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{store.id}</h3>
            <p className="text-sm text-slate-500 capitalize">{store.type}</p>
          </div>
        </div>
        <StatusBadge status={store.status} />
      </div>

      {/* URL section */}
      {store.url && (
        <div className="mb-4 p-3 bg-white/50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Store URL</p>
          <a
            href={`http://${store.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 break-all transition-colors"
          >
            {store.url}
          </a>
        </div>
      )}

      {/* Error message */}
      {store.error_message && (
        <div className="mb-4 p-3 bg-rose-50/80 border border-rose-200 rounded-xl">
          <p className="text-xs text-rose-700 font-semibold mb-1">Error:</p>
          <p className="text-sm text-rose-600">{store.error_message}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-0.5">
        <span>Created {formatDate(store.created_at)}</span>
        <span className="font-mono bg-slate-100/50 px-2 py-0.5 rounded text-slate-500">
          {store.id.slice(0, 8)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {store.status === 'Ready' && (
          <>
            <button
              onClick={openStore}
              className="flex-1 bg-violet-50 text-violet-700 px-3 py-2 rounded-lg text-sm font-medium
                         hover:bg-violet-100 transition-all flex items-center justify-center gap-1.5
                         border border-violet-200/50"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              Open
            </button>
            <button
              onClick={openAdmin}
              className="flex-1 bg-slate-50 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium
                         hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5
                         border border-slate-200/50"
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
            className="bg-rose-50 text-rose-600 px-3 py-2 rounded-lg text-sm font-medium
                       hover:bg-rose-100 transition-all disabled:opacity-50
                       disabled:cursor-not-allowed flex items-center justify-center gap-1.5
                       border border-rose-200/50"
          >
            <TrashIcon className="w-4 h-4" />
            {isDeleting ? '...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}
