import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: number;
  color: 'brand' | 'success' | 'warning' | 'danger' | 'blue' | 'purple';
}

const colorMap = {
  brand: { bg: 'bg-brand-500/10', text: 'text-brand-400', ring: 'ring-brand-500/20' },
  success: { bg: 'bg-success-500/10', text: 'text-success-400', ring: 'ring-success-500/20' },
  warning: { bg: 'bg-warning-500/10', text: 'text-warning-400', ring: 'ring-warning-500/20' },
  danger: { bg: 'bg-danger-500/10', text: 'text-danger-400', ring: 'ring-danger-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', ring: 'ring-blue-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', ring: 'ring-purple-500/20' },
};

export default function StatCard({ icon: Icon, label, value, change, color }: StatCardProps) {
  const c = colorMap[color];
  const positive = (change ?? 0) >= 0;

  return (
    <div className="glass-card p-5 hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center ring-1 ${c.ring}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-success-400' : 'text-danger-400'}`}>
            {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-navy-400 text-sm mt-4">{label}</p>
      <p className="text-white font-bold text-2xl mt-1">{value}</p>
    </div>
  );
}
