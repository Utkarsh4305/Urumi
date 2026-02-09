import { ShoppingBagIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  onCreateStore: () => void;
}

export function EmptyState({ onCreateStore }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      {/* Illustration */}
      <div className="relative mb-8">
        {/* Glow */}
        <div className="absolute inset-0 w-32 h-32 rounded-full bg-violet-200/50 blur-2xl" />

        {/* Main icon */}
        <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/30 animate-float">
          <ShoppingBagIcon className="w-12 h-12 text-white" />
        </div>

        {/* Sparkle */}
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
          <SparklesIcon className="w-4 h-4 text-violet-500" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-slate-800 mb-2">No stores yet</h3>
      <p className="text-slate-500 mb-8 text-center max-w-sm">
        Get started by creating your first store. It only takes a few minutes!
      </p>

      <button
        onClick={onCreateStore}
        className="btn-primary px-8 py-3 text-base transform hover:scale-105 transition-transform"
      >
        Create Your First Store
      </button>
    </div>
  );
}
