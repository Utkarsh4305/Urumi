import { ArrowPathIcon } from '@heroicons/react/24/outline';

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      {/* Animated gradient circles */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-blue animate-ping opacity-75"></div>
        <div className="relative rounded-full bg-gradient-lavender w-full h-full flex items-center justify-center">
          <ArrowPathIcon className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
      </div>

      <p className="text-gray-600 font-medium">Loading your stores...</p>
    </div>
  );
}
