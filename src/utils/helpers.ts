import type { OrderStatus, DeliveryType, OrderChannel } from '@/types';

export const statusConfig: Record<
  OrderStatus,
  { labelAr: string; labelEn: string; color: string; bg: string; border: string; dot: string }
> = {
  new: {
    labelAr: 'جديد',
    labelEn: 'New',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
  },
  in_kitchen: {
    labelAr: 'قيد التحضير',
    labelEn: 'In Kitchen',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  ready: {
    labelAr: 'جاهز للتسليم',
    labelEn: 'Ready',
    color: 'text-success-400',
    bg: 'bg-success-500/10',
    border: 'border-success-500/30',
    dot: 'bg-success-500',
  },
  out_for_delivery: {
    labelAr: 'مع المندوب',
    labelEn: 'Out for Delivery',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/30',
    dot: 'bg-brand-500',
  },
  completed: {
    labelAr: 'مكتمل',
    labelEn: 'Completed',
    color: 'text-navy-300',
    bg: 'bg-navy-600/30',
    border: 'border-navy-500/30',
    dot: 'bg-navy-400',
  },
  cancelled: {
    labelAr: 'ملغي',
    labelEn: 'Cancelled',
    color: 'text-danger-400',
    bg: 'bg-danger-500/10',
    border: 'border-danger-500/30',
    dot: 'bg-danger-500',
  },
};

export const deliveryTypeConfig: Record<
  DeliveryType,
  { labelAr: string; icon: string }
> = {
  dine_in: { labelAr: 'صالة', icon: 'utensils' },
  takeaway: { labelAr: 'تيك أوي', icon: 'shopping-bag' },
  delivery: { labelAr: 'توصيل', icon: 'bike' },
};

export const channelConfig: Record<OrderChannel, { labelAr: string; color: string }> = {
  pos: { labelAr: 'كاشير', color: 'text-purple-400' },
  app: { labelAr: 'تطبيق', color: 'text-brand-400' },
  website: { labelAr: 'موقع', color: 'text-blue-400' },
  phone: { labelAr: 'هاتف', color: 'text-success-400' },
};

export function getElapsedMinutes(isoString: string): number {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
}

export function getElapsedSeconds(isoString: string): number {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
}

export function formatTimer(isoString: string): string {
  const totalSeconds = getElapsedSeconds(isoString);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getTimerColor(isoString: string): string {
  const minutes = getElapsedMinutes(isoString);
  if (minutes < 10) return 'text-success-400';
  if (minutes <= 20) return 'text-warning-400';
  return 'text-danger-400';
}

export function getTimerBg(isoString: string): string {
  const minutes = getElapsedMinutes(isoString);
  if (minutes < 10) return 'bg-success-500/10 border-success-500/30';
  if (minutes <= 20) return 'bg-warning-500/10 border-warning-500/30';
  return 'bg-danger-500/10 border-danger-500/30';
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ar-EG')} ج.م`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('ar-EG');
}

export type StockStatus = 'ok' | 'low' | 'critical' | 'out';

export function getStockStatus(stock: number, minLevel: number): StockStatus {
  if (stock <= 0) return 'out';
  if (stock <= minLevel * 0.5) return 'critical';
  if (stock <= minLevel) return 'low';
  return 'ok';
}

export function getStockBadge(stock: number, minLevel: number): { label: string; color: string; bg: string; dot: string } {
  const status = getStockStatus(stock, minLevel);
  switch (status) {
    case 'out':
      return { label: 'نفذ', color: 'text-danger-400', bg: 'bg-danger-500/15', dot: 'bg-danger-500' };
    case 'critical':
      return { label: 'حرج', color: 'text-danger-400', bg: 'bg-danger-500/15', dot: 'bg-danger-500' };
    case 'low':
      return { label: 'منخفض', color: 'text-warning-400', bg: 'bg-warning-500/15', dot: 'bg-warning-500' };
    default:
      return { label: 'متوفر', color: 'text-success-400', bg: 'bg-success-500/15', dot: 'bg-success-500' };
  }
}

export function calculateFoodCost(recipe: { cost: number }[]): number {
  return recipe.reduce((sum, item) => sum + item.cost, 0);
}

export function calculateProfitMargin(price: number, cost: number): number {
  if (price === 0) return 0;
  return Math.round(((price - cost) / price) * 100);
}

export function calculateProfit(price: number, cost: number): number {
  return Math.round(price - cost);
}
