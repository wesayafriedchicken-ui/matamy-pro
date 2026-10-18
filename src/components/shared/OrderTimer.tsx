import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatTimer, getTimerColor } from '@/utils/helpers';

interface OrderTimerProps {
  createdAt: string;
  showIcon?: boolean;
}

export default function OrderTimer({ createdAt, showIcon = true }: OrderTimerProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const color = getTimerColor(createdAt);
  const time = formatTimer(createdAt);

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono font-bold text-sm ${color}`}>
      {showIcon && <Clock className="w-3.5 h-3.5" />}
      {time}
    </div>
  );
}
