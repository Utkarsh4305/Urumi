import { StoreStatus } from '../types/store';
import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';

interface StatusBadgeProps {
  status: StoreStatus;
}

interface BadgeStyle {
  bg: string;
  text: string;
  dot: string;
  icon: React.ReactNode;
  pulse: boolean;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeStyle = (status: StoreStatus): BadgeStyle => {
    switch (status) {
      case 'Provisioning':
        return {
          bg: 'bg-sky-50/80 border-sky-200/50',
          text: 'text-sky-700',
          dot: 'bg-sky-500',
          icon: <ClockIcon className="w-3.5 h-3.5" />,
          pulse: true,
        };
      case 'Ready':
        return {
          bg: 'bg-emerald-50/80 border-emerald-200/50',
          text: 'text-emerald-700',
          dot: 'bg-emerald-500',
          icon: <CheckCircleIcon className="w-3.5 h-3.5" />,
          pulse: false,
        };
      case 'Failed':
        return {
          bg: 'bg-rose-50/80 border-rose-200/50',
          text: 'text-rose-700',
          dot: 'bg-rose-500',
          icon: <ExclamationCircleIcon className="w-3.5 h-3.5" />,
          pulse: false,
        };
      case 'Deleting':
        return {
          bg: 'bg-slate-50/80 border-slate-200/50',
          text: 'text-slate-600',
          dot: 'bg-slate-500',
          icon: <TrashIcon className="w-3.5 h-3.5" />,
          pulse: true,
        };
      default:
        return {
          bg: 'bg-slate-50/80 border-slate-200/50',
          text: 'text-slate-600',
          dot: 'bg-slate-400',
          icon: null,
          pulse: false,
        };
    }
  };

  const style = getBadgeStyle(status);

  return (
    <span className={`status-pill ${style.bg} ${style.text} border`}>
      <span className="relative flex h-2 w-2">
        {style.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.dot} opacity-75`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`}></span>
      </span>
      {status}
    </span>
  );
}
