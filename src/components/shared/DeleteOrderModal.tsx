import type { Order } from '@/types';
import { useApp } from '@/context/AppContext';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

interface DeleteOrderModalProps {
  order: Order;
  onClose: () => void;
}

export default function DeleteOrderModal({ order, onClose }: DeleteOrderModalProps) {
  const { deleteOrder } = useApp();

  const handleConfirm = () => {
    deleteOrder(order.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-navy-900 border border-navy-700/80 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">حذف الطلب {order.orderNumber}</h3>
            <p className="text-xs text-navy-300 mt-1.5 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً من النظام؟
            </p>
          </div>

          <div className="p-3 bg-navy-950/60 rounded-xl border border-navy-800 text-xs text-navy-300 space-y-1 text-right">
            <div className="flex justify-between">
              <span className="text-navy-400">اسم العميل:</span>
              <span className="text-white font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">إجمالي المبلغ:</span>
              <span className="text-brand-400 font-bold font-mono">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-400">عدد الأصناف:</span>
              <span className="text-white font-mono">{order.items.reduce((s, i) => s + i.quantity, 0)} عنصر</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white text-xs font-semibold transition-all"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20 active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              تأكيد الحذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
