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
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="max-w-lg w-full animate-scale-in">
        {/* Modal with gradient border effect */}
        <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-violet-400/50 via-white/80 to-indigo-400/50">
          <div className="glass-header rounded-3xl p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-primary-heading">Create New Store</h2>
                <p className="text-sm text-tertiary-body mt-0.5">Choose your platform</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-violet-600 transition-all duration-200 rounded-xl p-2.5 hover:bg-violet-50/80 hover:shadow-sm"
                disabled={createStore.isPending}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6 space-y-3">
                {/* WooCommerce Card */}
                <label
                  className={`relative flex items-center p-4 border-2 rounded-2xl cursor-pointer
                             transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10
                             ${storeType === 'woocommerce'
                      ? 'border-violet-400/80 bg-gradient-to-br from-violet-50/80 to-indigo-50/60 shadow-md shadow-violet-500/10'
                      : 'border-white/60 bg-white/40 hover:border-violet-300/60 hover:bg-white/60'}`}
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

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30 ring-2 ring-white/30">
                    <ShoppingCartIcon className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>

                  <div className="flex-1 ml-4">
                    <h4 className="font-bold text-slate-800">WooCommerce</h4>
                    <p className="text-sm text-slate-500/90">WordPress + WooCommerce</p>
                  </div>

                  {storeType === 'woocommerce' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/30">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </label>

                {/* Medusa card (disabled) */}
                <label className="relative flex items-center p-4 border-2 border-slate-200/40 rounded-2xl opacity-50 cursor-not-allowed bg-slate-50/20">
                  <input
                    type="radio"
                    name="storeType"
                    value="medusa"
                    disabled={true}
                    className="sr-only"
                  />

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-400 to-purple-500 flex items-center justify-center flex-shrink-0 opacity-60">
                    <ShoppingCartIcon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 ml-4">
                    <h4 className="font-semibold text-slate-500">Medusa</h4>
                    <p className="text-sm text-slate-400">Headless commerce</p>
                  </div>

                  <span className="px-3 py-1 bg-slate-200/60 text-slate-500 text-xs font-bold rounded-full tracking-wide">
                    Soon
                  </span>
                </label>
              </div>

              {/* Info box */}
              <div className="bg-gradient-to-br from-sky-50/70 to-cyan-50/50 border border-sky-200/50 rounded-2xl p-4 mb-6 flex gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/20">
                  <InformationCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-sky-800 font-semibold">Setup takes 2-3 minutes</p>
                  <p className="text-sm text-sky-600/90 mt-0.5">
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
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 
                             bg-white/60 border border-slate-200/60 backdrop-blur-sm
                             hover:bg-white/90 hover:border-slate-300/80 hover:shadow-md
                             transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createStore.isPending}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white
                             bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600
                             shadow-lg shadow-violet-500/30
                             hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5
                             transition-all duration-200 flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
}
