import { ShoppingBagIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  onCreateStore: () => void;
}

export function EmptyState({ onCreateStore }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      {/* Large gradient circle with icon */}
      <div className="w-32 h-32 rounded-full bg-gradient-peach mb-6 flex items-center justify-center shadow-lg">
        <ShoppingBagIcon className="w-16 h-16 text-white" />
      </div>

      <h3 className="text-2xl font-semibold text-gray-900 mb-2">No stores yet</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Get started by creating your first store. It only takes a few minutes!
      </p>

      <button
        onClick={onCreateStore}
        className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium
                   hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30
                   hover:shadow-xl hover:shadow-primary-500/40 transform hover:scale-105
                   transition-all duration-200"
      >
        Create Your First Store
      </button>
    </div>
  );
}
