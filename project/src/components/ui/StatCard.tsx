import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export default function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  trend,
  color = 'bg-brand-50 text-brand-600',
}: StatCardProps) {
  return (
    <div className="card p-5 transition-all duration-200 hover:shadow-cardhover">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="badge bg-success-50 text-success-700">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
      {sublabel && <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>}
    </div>
  );
}
