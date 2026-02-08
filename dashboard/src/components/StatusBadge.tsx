import { StoreStatus } from '../types/store';
import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';

interface StatusBadgeProps {
  status: StoreStatus;
}

interface BadgeStyle {
  className: string;
  icon: React.ReactNode;
  pulse: boolean;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeStyle = (status: StoreStatus): BadgeStyle => {
    switch (status) {
      case 'Provisioning':
        return {
          className: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <ClockIcon className="w-3.5 h-3.5 animate-spin" />,
          pulse: true,
        };
      case 'Ready':
        return {
          className: 'bg-green-50 text-green-700 border-green-200',
          icon: <CheckCircleIcon className="w-3.5 h-3.5" />,
          pulse: false,
        };
      case 'Failed':
        return {
          className: 'bg-red-50 text-red-700 border-red-200',
          icon: <ExclamationCircleIcon className="w-3.5 h-3.5" />,
          pulse: false,
        };
      case 'Deleting':
        return {
          className: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: <TrashIcon className="w-3.5 h-3.5" />,
          pulse: true,
        };
      default:
        return {
          className: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: null,
          pulse: false,
        };
    }
  };

  const style = getBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                  text-xs font-semibold border ${style.className}
                  ${style.pulse ? 'animate-pulse' : ''}`}
    >
      {style.icon}
      {status}
    </span>
  );
}
