interface StatCardProps {
  label: string;
  value: number;
  variant?: 'default' | 'info' | 'success' | 'danger';
  icon?: React.ReactNode;
}

export function StatCard({ label, value, variant = 'default', icon }: StatCardProps) {
  const variantStyles = {
    default: {
      bg: 'from-white/50 to-slate-50/40',
      iconBg: 'bg-gradient-to-br from-slate-100 to-slate-200/80',
      iconColor: 'text-slate-600',
      valueColor: 'bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent',
    },
    info: {
      bg: 'from-sky-50/60 to-cyan-50/40',
      iconBg: 'bg-gradient-to-br from-sky-100 to-cyan-100',
      iconColor: 'text-sky-600',
      valueColor: 'bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent',
    },
    success: {
      bg: 'from-emerald-50/60 to-teal-50/40',
      iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
      iconColor: 'text-emerald-600',
      valueColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent',
    },
    danger: {
      bg: 'from-rose-50/60 to-pink-50/40',
      iconBg: 'bg-gradient-to-br from-rose-100 to-pink-100',
      iconColor: 'text-rose-600',
      valueColor: 'bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`bg-gradient-to-br ${styles.bg} backdrop-blur-md rounded-xl p-4 
                  border border-white/60 shadow-sm
                  transition-all duration-300 
                  hover:shadow-lg hover:shadow-violet-500/10 
                  hover:-translate-y-0.5 hover:border-white/80`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80">{label}</p>
          <p className={`text-2xl font-extrabold tracking-tight mt-1 ${styles.valueColor}`}>{value}</p>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${styles.iconBg} ${styles.iconColor}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
