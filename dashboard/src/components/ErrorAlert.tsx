import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface ErrorAlertProps {
  error: string;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="mb-6 p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 rounded-xl flex items-start gap-3 animate-slide-up shadow-sm">
      <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
        <ExclamationTriangleIcon className="w-5 h-5 text-rose-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-rose-800">Something went wrong</p>
        <p className="text-sm text-rose-600 mt-0.5 break-words">{error}</p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-rose-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-100/50 flex-shrink-0"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
