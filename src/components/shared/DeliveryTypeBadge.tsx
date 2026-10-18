import { Utensils, ShoppingBag, Bike } from 'lucide-react';
import type { DeliveryType } from '@/types';
import { deliveryTypeConfig } from '@/utils/helpers';

interface DeliveryTypeBadgeProps {
  type: DeliveryType;
}

export default function DeliveryTypeBadge({ type }: DeliveryTypeBadgeProps) {
  const config = deliveryTypeConfig[type];
  const Icon = type === 'dine_in' ? Utensils : type === 'takeaway' ? ShoppingBag : Bike;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-700/50 px-2.5 py-1 text-xs font-medium text-navy-200">
      <Icon className="w-3.5 h-3.5" />
      {config.labelAr}
    </span>
  );
}
