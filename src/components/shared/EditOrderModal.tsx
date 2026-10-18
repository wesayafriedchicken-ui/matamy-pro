import { useState } from 'react';
import type { Order, DeliveryType, OrderStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  X,
  Check,
  Utensils,
  ShoppingBag,
  Bike,
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Banknote,
  Wallet,
} from 'lucide-react';
import { statusConfig } from '@/utils/helpers';

interface EditOrderModalProps {
  order: Order;
  onClose: () => void;
}

export default function EditOrderModal({ order, onClose }: EditOrderModalProps) {
  const { updateOrder, riders } = useApp();

  const [customerName, setCustomerName] = useState(order.customerName);
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(order.deliveryType);
  const [tableNumber, setTableNumber] = useState(order.tableNumber || '');
  const [address, setAddress] = useState(order.address || '');
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [riderId, setRiderId] = useState(order.riderId || '');
  const [notes, setNotes] = useState(order.notes || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>(order.paymentMethod);
  const [paid, setPaid] = useState(order.paid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedRider = riders.find((r) => r.id === riderId);

    const updatedOrder: Order = {
      ...order,
      customerName: customerName.trim() || 'عميل غير محدد',
      customerPhone: customerPhone.trim() || '—',
      deliveryType,
      tableNumber: deliveryType === 'dine_in' ? tableNumber.trim() || undefined : undefined,
      address: deliveryType === 'delivery' ? address.trim() || undefined : undefined,
      status,
      riderId: deliveryType === 'delivery' && riderId ? riderId : undefined,
      riderName: deliveryType === 'delivery' && selectedRider ? selectedRider.nameAr : undefined,
      notes: notes.trim() || undefined,
      paymentMethod,
      paid,
      updatedAt: new Date().toISOString(),
    };

    updateOrder(updatedOrder);
    onClose();
  };

  const statuses: { key: OrderStatus; labelAr: string }[] = [
    { key: 'new', labelAr: 'جديد' },
    { key: 'in_kitchen', labelAr: 'قيد التحضير' },
    { key: 'ready', labelAr: 'جاهز للتسليم' },
    { key: 'out_for_delivery', labelAr: 'مع المندوب' },
    { key: 'completed', labelAr: 'مكتمل' },
    { key: 'cancelled', labelAr: 'ملغي' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-navy-900 border border-navy-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-navy-800 flex items-center justify-between bg-navy-850/70">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              تعديل بيانات الطلب{' '}
              <span className="text-brand-400 font-mono font-bold">{order.orderNumber}</span>
            </h3>
            <p className="text-xs text-navy-400">تحديث تفاصيل العميل، الحالة، الملاحظات وطريقة الدفع</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 flex items-center justify-center text-navy-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Order Status Selector */}
          <div>
            <label className="text-navy-300 font-semibold mb-2 block">حالة الطلب:</label>
            <div className="grid grid-cols-3 gap-2">
              {statuses.map((s) => {
                const config = statusConfig[s.key];
                const active = status === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStatus(s.key)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      active
                        ? `${config.bg} ${config.border} ${config.color} ring-1 ring-brand-500/50`
                        : 'bg-navy-800/40 border-navy-700 text-navy-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                    <span>{s.labelAr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Type */}
          <div>
            <label className="text-navy-300 font-semibold mb-2 block">نوع الطلب:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('dine_in')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  deliveryType === 'dine_in'
                    ? 'bg-brand-500/15 border-brand-500 text-brand-400'
                    : 'bg-navy-800/40 border-navy-700 text-navy-400 hover:text-white'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>صالة</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('takeaway')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  deliveryType === 'takeaway'
                    ? 'bg-brand-500/15 border-brand-500 text-brand-400'
                    : 'bg-navy-800/40 border-navy-700 text-navy-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>تيك أوي</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  deliveryType === 'delivery'
                    ? 'bg-brand-500/15 border-brand-500 text-brand-400'
                    : 'bg-navy-800/40 border-navy-700 text-navy-400 hover:text-white'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>توصيل</span>
              </button>
            </div>
          </div>

          {/* Customer & Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-navy-300 font-medium">اسم العميل:</label>
              <div className="relative">
                <User className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-field pr-9 text-xs"
                  placeholder="اسم العميل"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-navy-300 font-medium">رقم الهاتف:</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="input-field pr-9 text-xs"
                  placeholder="رقم الهاتف"
                />
              </div>
            </div>

            {deliveryType === 'dine_in' && (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-navy-300 font-medium">رقم الطاولة:</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="input-field text-xs"
                  placeholder="مثال: 5 أو VIP-1"
                />
              </div>
            )}

            {deliveryType === 'delivery' && (
              <>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-navy-300 font-medium">عنوان التوصيل:</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-navy-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-field pr-9 text-xs"
                      placeholder="الشارع، المنطقة، رقم الشقة"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-navy-300 font-medium">تعيين مندوب التوصيل:</label>
                  <select
                    value={riderId}
                    onChange={(e) => setRiderId(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="">بدون مندوب حالياً (قيد الانتظار)</option>
                    {riders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nameAr} ({r.zoneAr} - {r.status === 'available' ? 'متاح' : 'مشغول'})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Payment Method & Paid Toggle */}
          <div className="pt-2 border-t border-navy-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-navy-300 font-semibold">طريقة الدفع وحالة السداد:</label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={paid}
                  onChange={(e) => setPaid(e.target.checked)}
                  className="rounded border-navy-700 text-brand-500 focus:ring-brand-500 w-4 h-4"
                />
                <span className={`text-xs font-semibold ${paid ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {paid ? 'تم السداد (مدفوع)' : 'غير مدفوع (آجل / عند الاستلام)'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-brand-500/15 border-brand-500 text-brand-400 font-semibold'
                    : 'bg-navy-800/40 border-navy-700 text-navy-400 hover:text-white'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>كاش</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-brand-500/15 border-brand-500 text-brand-400 font-semibold'
                    : 'bg-navy-800/40 border-navy-700 text-navy-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>بطاقة</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'online'
                    ? 'bg-brand-500/15 border-brand-500 text-brand-400 font-semibold'
                    : 'bg-navy-800/40 border-navy-700 text-navy-400 hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>إلكتروني</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 pt-1">
            <label className="text-navy-300 font-medium flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-navy-400" />
              ملاحظات الطلب:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl p-2.5 text-xs text-white placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              placeholder="أي ملاحظات خاصة بالتوصيل أو المطبخ..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-navy-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white text-xs font-semibold transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20"
            >
              <Check className="w-4 h-4" />
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
