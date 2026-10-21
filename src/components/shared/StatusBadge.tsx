import type { OrderStatus } from '@/types';
import { statusConfig } from '@/utils/helpers';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.color} ${config.border} border ${padding}`}
    >
      <span className={`status-dot ${config.dot}`} />
      {config.labelAr}
    </span>
  );
}
