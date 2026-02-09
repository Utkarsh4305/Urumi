import { ArrowPathIcon } from '@heroicons/react/24/outline';

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      {/* Animated loader */}
      <div className="relative w-20 h-20 mb-6">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-violet-100"></div>

        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin"></div>

        {/* Inner icon */}
        <div className="absolute inset-3 rounded-full bg-violet-50 flex items-center justify-center">
          <ArrowPathIcon className="w-8 h-8 text-violet-500 animate-pulse" />
        </div>
      </div>

      <p className="text-slate-700 font-medium">Loading your stores...</p>
      <p className="text-sm text-slate-400 mt-1">This won't take long</p>
    </div>
  );
}
