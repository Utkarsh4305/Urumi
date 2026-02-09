interface StatCardProps {
  label: string;
  value: number;
  variant?: 'default' | 'info' | 'success' | 'danger';
  icon?: React.ReactNode;
}

export function StatCard({ label, value, variant = 'default', icon }: StatCardProps) {
  const variantStyles = {
    default: {
      bg: 'bg-white/60',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-800',
    },
    info: {
      bg: 'bg-sky-50/60',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      valueColor: 'text-sky-700',
    },
    success: {
      bg: 'bg-emerald-50/60',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
    },
    danger: {
      bg: 'bg-rose-50/60',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      valueColor: 'text-rose-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`${styles.bg} backdrop-blur-sm rounded-xl p-4 border border-white/60
                  transition-all duration-300 hover:bg-white/80 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="metric-label">{label}</p>
          <p className={`text-2xl font-bold tracking-tight mt-1 ${styles.valueColor}`}>{value}</p>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconBg} ${styles.iconColor}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
