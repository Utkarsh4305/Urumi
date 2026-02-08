interface StatCardProps {
  label: string;
  value: number;
  color?: 'blue' | 'green' | 'red' | 'gray';
  icon?: React.ReactNode;
}

export function StatCard({ label, value, color = 'gray', icon }: StatCardProps) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-100',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorMap[color]} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="metric-label">{label}</p>
          <p className="metric-value mt-1">{value}</p>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
