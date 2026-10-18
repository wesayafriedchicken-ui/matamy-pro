import { useState } from 'react';
import { X, Phone, MapPin, CreditCard, User, Table, Bike, Check, Clock } from 'lucide-react';
import type { Order, Rider } from '@/types';
import { statusConfig, channelConfig, formatCurrency } from '@/utils/helpers';
import { useApp } from '@/context/AppContext';
import OrderTimer from './OrderTimer';
import StatusBadge from './StatusBadge';
import DeliveryTypeBadge from './DeliveryTypeBadge';

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
}

const statusFlow: Order['status'][] = [
  'new',
  'in_kitchen',
  'ready',
  'out_for_delivery',
  'completed',
];

export default function OrderModal({ order, onClose }: OrderModalProps) {
  const { riders, updateOrderStatus, assignRider } = useApp();
  const [selectedRider, setSelectedRider] = useState<string>('');

  if (!order) return null;

  const config = statusConfig[order.status];
  const availableRiders = riders.filter((r) => r.status === 'available');
  const currentStatusIndex = statusFlow.indexOf(order.status);
  const nextStatus = statusFlow[currentStatusIndex + 1];
  const canAdvance = order.status !== 'completed' && order.status !== 'cancelled' && nextStatus;

  const handleAdvance = () => {
    if (nextStatus) updateOrderStatus(order.id, nextStatus);
  };

  const handleAssignRider = () => {
    const rider = riders.find((r) => r.id === selectedRider);
    if (rider) {
      assignRider(order.id, rider.id, rider.nameAr);
      setSelectedRider('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-navy-800/95 backdrop-blur-xl px-6 py-4 border-b border-navy-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${config.bg} ${config.border} border flex items-center justify-center`}>
              <span className={`font-bold text-lg ${config.color}`}>#</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{order.orderNumber}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={order.status} size="sm" />
                <DeliveryTypeBadge type={order.deliveryType} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Timer */}
          <div className="flex items-center justify-between bg-navy-900/50 rounded-2xl px-5 py-4 border border-navy-700/40">
            <div className="flex items-center gap-2 text-navy-300">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">الوقت المنقضي</span>
            </div>
            <OrderTimer createdAt={order.createdAt} />
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard icon={User} label="العميل" value={order.customerName} />
            <InfoCard icon={Phone} label="الهاتف" value={order.customerPhone} />
            {order.tableNumber && (
              <InfoCard icon={Table} label="الطاولة" value={`طاولة ${order.tableNumber}`} />
            )}
            {order.address && (
              <InfoCard icon={MapPin} label="العنوان" value={order.address} />
            )}
            <InfoCard
              icon={CreditCard}
              label="طريقة الدفع"
              value={
                order.paymentMethod === 'cash'
                  ? 'كاش'
                  : order.paymentMethod === 'card'
                    ? 'بطاقة'
                    : 'أونلاين'
              }
            />
            <InfoCard
              icon={order.paid ? Check : Clock}
              label="حالة الدفع"
              value={order.paid ? 'مدفوع' : 'غير مدفوع'}
              valueColor={order.paid ? 'text-success-400' : 'text-warning-400'}
            />
          </div>

          {/* Channel */}
          <div className="flex items-center gap-2">
            <span className="text-navy-400 text-sm">المصدر:</span>
            <span className={`text-sm font-medium ${channelConfig[order.channel].color}`}>
              {channelConfig[order.channel].labelAr}
            </span>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">الأصناف</h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40 flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center text-sm font-bold">
                        {item.quantity}×
                      </span>
                      <span className="text-white font-medium text-sm">{item.nameAr}</span>
                    </div>
                    {item.notes && (
                      <p className="text-warning-400 text-xs mt-1.5 pr-9">⚠ {item.notes}</p>
                    )}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 pr-9">
                        {item.modifiers.map((mod, i) => (
                          <span
                            key={i}
                            className="bg-brand-500/10 text-brand-400 text-xs px-2 py-0.5 rounded-md border border-brand-500/20"
                          >
                            {mod}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-navy-200 text-sm font-mono">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-navy-900/50 rounded-2xl px-5 py-4 border border-navy-700/40 space-y-2">
            <div className="flex justify-between text-navy-300 text-sm">
              <span>المجموع الفرعي</span>
              <span className="font-mono">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-navy-300 text-sm">
              <span>الضريبة</span>
              <span className="font-mono">{formatCurrency(order.tax)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-navy-300 text-sm">
                <span>رسوم التوصيل</span>
                <span className="font-mono">{formatCurrency(order.deliveryFee)}</span>
              </div>
            )}
            <div className="border-t border-navy-700/40 pt-2 flex justify-between text-white font-bold">
              <span>الإجمالي</span>
              <span className="font-mono text-lg">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Rider Assignment */}
          {order.deliveryType === 'delivery' && order.status !== 'completed' && order.status !== 'cancelled' && (
            <div>
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Bike className="w-4 h-4" />
                تعيين مندوب التوصيل
              </h4>
              {order.riderName ? (
                <div className="bg-success-500/10 border border-success-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success-500/20 flex items-center justify-center text-success-400 font-bold">
                    {order.riderName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{order.riderName}</p>
                    <p className="text-success-400 text-xs">مندوب معين</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={selectedRider}
                    onChange={(e) => setSelectedRider(e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="">اختر مندوب متاح...</option>
                    {availableRiders.map((r: Rider) => (
                      <option key={r.id} value={r.id}>
                        {r.nameAr} - {r.zoneAr} ⭐ {r.rating}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignRider}
                    disabled={!selectedRider}
                    className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    تعيين
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-warning-500/10 border border-warning-500/30 rounded-xl px-4 py-3">
              <p className="text-warning-400 text-sm">📝 {order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-navy-800/95 backdrop-blur-xl px-6 py-4 border-t border-navy-700/50 flex gap-3">
          {canAdvance && (
            <button onClick={handleAdvance} className="btn-primary flex-1">
              {nextStatus === 'in_kitchen'
                ? 'بدء التحضير'
                : nextStatus === 'ready'
                  ? 'جاهز للتسليم'
                  : nextStatus === 'out_for_delivery'
                    ? 'إرسال للمندوب'
                    : nextStatus === 'completed'
                      ? 'إكمال الطلب'
                      : 'التالي'}
            </button>
          )}
          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'cancelled')}
              className="btn-ghost text-danger-400 hover:bg-danger-500/10"
            >
              إلغاء
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: typeof User;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
      <div className="flex items-center gap-1.5 text-navy-400 text-xs mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className={`text-sm font-medium ${valueColor ?? 'text-white'}`}>{value}</p>
    </div>
  );
}
