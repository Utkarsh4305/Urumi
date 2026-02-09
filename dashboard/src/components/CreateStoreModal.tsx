import { useState } from 'react';
import { StoreType } from '../types/store';
import { useCreateStore } from '../hooks/useStores';
import { XMarkIcon, CheckIcon, ShoppingCartIcon, ClockIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStoreModal({ isOpen, onClose }: CreateStoreModalProps) {
  const [storeType, setStoreType] = useState<StoreType>('woocommerce');
  const createStore = useCreateStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createStore.mutateAsync({ type: storeType });
      onClose();
    } catch (error: any) {
      console.error('Failed to create store:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create store';
      alert(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-card max-w-lg w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Create New Store</h2>
            <p className="text-sm text-slate-500 mt-0.5">Choose your platform</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-2 hover:bg-slate-100/50"
            disabled={createStore.isPending}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 space-y-3">
            {/* WooCommerce Card */}
            <label
              className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer
                         transition-all duration-200 hover:shadow-md
                         ${storeType === 'woocommerce'
                  ? 'border-violet-400 bg-violet-50/50'
                  : 'border-slate-200/50 bg-white/50 hover:border-slate-300'}`}
            >
              <input
                type="radio"
                name="storeType"
                value="woocommerce"
                checked={storeType === 'woocommerce'}
                onChange={(e) => setStoreType(e.target.value as StoreType)}
                className="sr-only"
                disabled={createStore.isPending}
              />

              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                <ShoppingCartIcon className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 ml-4">
                <h4 className="font-semibold text-slate-800">WooCommerce</h4>
                <p className="text-sm text-slate-500">WordPress + WooCommerce</p>
              </div>

              {storeType === 'woocommerce' && (
                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              )}
            </label>

            {/* Medusa card (disabled) */}
            <label className="relative flex items-center p-4 border-2 border-slate-200/50 rounded-xl opacity-50 cursor-not-allowed bg-slate-50/30">
              <input
                type="radio"
                name="storeType"
                value="medusa"
                disabled={true}
                className="sr-only"
              />

              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <ShoppingCartIcon className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 ml-4">
                <h4 className="font-semibold text-slate-600">Medusa</h4>
                <p className="text-sm text-slate-400">Headless commerce</p>
              </div>

              <span className="px-2.5 py-1 bg-slate-200/80 text-slate-500 text-xs font-semibold rounded-full">
                Soon
              </span>
            </label>
          </div>

          {/* Info box */}
          <div className="bg-sky-50/60 border border-sky-200/50 rounded-xl p-4 mb-6 flex gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
              <InformationCircleIcon className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-sky-800 font-medium">Setup takes 2-3 minutes</p>
              <p className="text-sm text-sky-600 mt-0.5">
                You'll get access when status shows "Ready"
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={createStore.isPending}
              className="btn-secondary flex-1 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createStore.isPending}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              {createStore.isPending ? (
                <>
                  <ClockIcon className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Store'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
