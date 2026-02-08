import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorAlertProps {
  error: string;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slide-up">
      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-red-900 mb-1">Error</h4>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    </div>
  );
}
