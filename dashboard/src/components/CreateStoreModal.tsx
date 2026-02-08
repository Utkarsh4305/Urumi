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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Store</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
            disabled={createStore.isPending}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Choose Store Type
            </label>
            <div className="grid grid-cols-1 gap-4">
              {/* WooCommerce Card */}
              <label
                className={`relative flex flex-col p-6 border-2 rounded-xl cursor-pointer
                           transition-all duration-200 hover:shadow-lg
                           ${storeType === 'woocommerce' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
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

                {/* Icon */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-peach flex items-center justify-center flex-shrink-0">
                    <ShoppingCartIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">WooCommerce</h4>
                    <p className="text-sm text-gray-500">WordPress + WooCommerce ecommerce platform</p>
                  </div>

                  {/* Check indicator */}
                  {storeType === 'woocommerce' && (
                    <div className="flex-shrink-0">
                      <CheckIcon className="w-6 h-6 text-primary-500" />
                    </div>
                  )}
                </div>
              </label>

              {/* Medusa card (disabled) */}
              <label className="relative flex flex-col p-6 border-2 border-gray-200 rounded-xl opacity-50 cursor-not-allowed">
                <input
                  type="radio"
                  name="storeType"
                  value="medusa"
                  checked={storeType === 'medusa'}
                  onChange={(e) => setStoreType(e.target.value as StoreType)}
                  className="sr-only"
                  disabled={true}
                />

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-lavender flex items-center justify-center flex-shrink-0">
                    <ShoppingCartIcon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Medusa</h4>
                    <p className="text-sm text-gray-500">Headless commerce platform</p>
                  </div>

                  {/* Coming Soon badge */}
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                    Coming Soon
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">Provisioning Time</p>
              <p className="text-sm text-blue-700">
                Store setup takes 2-3 minutes. You'll receive access once the status shows "Ready".
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={createStore.isPending}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createStore.isPending}
              className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 flex items-center justify-center gap-2"
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
