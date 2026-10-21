import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Order, OrderStatus } from '@/types';
import { statusConfig, channelConfig, formatCurrency } from '@/utils/helpers';
import OrderTimer from '@/components/shared/OrderTimer';
import DeliveryTypeBadge from '@/components/shared/DeliveryTypeBadge';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import EditOrderModal from '@/components/shared/EditOrderModal';
import DeleteOrderModal from '@/components/shared/DeleteOrderModal';
import {
  Utensils,
  ShoppingBag,
  Bike,
  Plus,
  Kanban,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Search,
  X,
  Clock,
  Receipt,
} from 'lucide-react';

const columns: { status: OrderStatus; labelAr: string; color: string }[] = [
  { status: 'new', labelAr: 'جديد', color: 'text-blue-400' },
  { status: 'in_kitchen', labelAr: 'قيد التحضير', color: 'text-amber-400' },
  { status: 'ready', labelAr: 'جاهز للتسليم', color: 'text-success-400' },
  { status: 'out_for_delivery', labelAr: 'مع المندوب', color: 'text-brand-400' },
  { status: 'completed', labelAr: 'مكتمل / ملغي', color: 'text-navy-300' },
];

export default function LiveOrders() {
  const { orders, updateOrderStatus, showToast } = useApp();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [activeMenuOrderId, setActiveMenuOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  // Filtered orders for search and status filters
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerPhone.includes(search) ||
        (o.tableNumber && o.tableNumber.includes(search));

      const matchesStatus =
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'completed'
          ? o.status === 'completed' || o.status === 'cancelled'
          : o.status === selectedStatusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, selectedStatusFilter]);

  const handleQuickStatusAdvance = (order: Order, nextStatus: OrderStatus) => {
    updateOrderStatus(order.id, nextStatus);
    showToast(`تم تحديث حالة الطلب ${order.orderNumber} إلى ${statusConfig[nextStatus].labelAr}`, 'info');
    setActiveMenuOrderId(null);
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in" onClick={() => setActiveMenuOrderId(null)}>
      {/* Top Page Header with View Switcher Icons and Action Button */}
      <PageHeader
        title="الطلبات اللحظية"
        description="متابعة وإدارة الطلبات في الوقت الفعلي مع إمكانية التعديل والحذف"
        actions={
          <div className="flex items-center gap-3">
            {/* View Mode Toggle: Icons only as requested */}
            <div className="flex items-center bg-navy-900 border border-navy-700/70 p-1 rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
                }`}
                title="عرض الأعمدة (Kanban Board)"
                aria-label="Kanban Board View"
              >
                <Kanban className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
                }`}
                title="عرض القائمة (List View)"
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Create Order Button */}
            <button
              onClick={() => navigate('/orders/new')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إنشاء طلب جديد
            </button>
          </div>
        }
      />

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-navy-900/60 border border-navy-800 p-3 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم الطلب، اسم العميل، الهاتف أو الطاولة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-950/70 border border-navy-700/60 rounded-xl pr-9 pl-8 py-2 text-xs text-white placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Chips in List View or General Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedStatusFilter === 'all'
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                : 'text-navy-400 hover:text-white bg-navy-800/40 border border-navy-700/40'
            }`}
          >
            الكل ({orders.length})
          </button>
          {columns.map((c) => {
            const count = orders.filter((o) =>
              c.status === 'completed'
                ? o.status === 'completed' || o.status === 'cancelled'
                : o.status === c.status,
            ).length;
            return (
              <button
                key={c.status}
                type="button"
                onClick={() => setSelectedStatusFilter(c.status)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  selectedStatusFilter === c.status
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                    : 'text-navy-400 hover:text-white bg-navy-800/40 border border-navy-700/40'
                }`}
              >
                {c.labelAr} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="flex-1 overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max h-full">
            {columns.map((col) => {
              const colOrders = filteredOrders.filter((o) =>
                col.status === 'completed'
                  ? o.status === 'completed' || o.status === 'cancelled'
                  : o.status === col.status,
              );
              const config = statusConfig[col.status];

              return (
                <div key={col.status} className="w-80 shrink-0 flex flex-col">
                  {/* Column Header */}
                  <div className="glass-card mb-3 px-4 py-3 flex items-center justify-between border-b border-navy-700/60">
                    <div className="flex items-center gap-2.5">
                      <span className={`status-dot ${config.dot}`} />
                      <span className={`font-bold text-sm ${col.color}`}>{col.labelAr}</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Column Body */}
                  <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1">
                    {colOrders.length === 0 ? (
                      <div className="glass-card p-8 text-center text-navy-400 text-xs border border-dashed border-navy-800">
                        لا توجد طلبات في هذه الحالة
                      </div>
                    ) : (
                      colOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          isMenuOpen={activeMenuOrderId === order.id}
                          onToggleMenu={(e) => {
                            e.stopPropagation();
                            setActiveMenuOrderId(activeMenuOrderId === order.id ? null : order.id);
                          }}
                          onEdit={(e) => {
                            e.stopPropagation();
                            setActiveMenuOrderId(null);
                            setEditingOrder(order);
                          }}
                          onDelete={(e) => {
                            e.stopPropagation();
                            setActiveMenuOrderId(null);
                            setDeletingOrder(order);
                          }}
                          onAdvanceStatus={(next) => handleQuickStatusAdvance(order, next)}
                          onClick={() => navigate(`/orders/${order.id}`)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. List View (Table / Rows) */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-y-auto glass-card border border-navy-800 rounded-2xl overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-navy-400 space-y-2">
              <ShoppingBag className="w-10 h-10 text-navy-600 mx-auto" />
              <p className="text-sm font-semibold text-white">لا توجد طلبات مطابقة للبحث أو الفلتر</p>
              <p className="text-xs">جرب تغيير كلمات البحث أو اختيار فلتر حالة آخر.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-navy-900/90 text-navy-400 border-b border-navy-800 font-semibold">
                    <th className="py-3.5 px-4">رقم الطلب</th>
                    <th className="py-3.5 px-4">العميل</th>
                    <th className="py-3.5 px-4">نوع الطلب</th>
                    <th className="py-3.5 px-4">القناة</th>
                    <th className="py-3.5 px-4">الأصناف</th>
                    <th className="py-3.5 px-4">الإجمالي</th>
                    <th className="py-3.5 px-4">الوقت المنقضي</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  {filteredOrders.map((order) => {
                    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                    const config = statusConfig[order.status];
                    const isMenuOpen = activeMenuOrderId === order.id;

                    return (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="hover:bg-navy-850/60 transition-colors cursor-pointer group"
                      >
                        {/* Order Number */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 font-bold font-mono px-2.5 py-1 rounded-lg border text-xs ${config.bg} ${config.border} ${config.color}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                            {order.orderNumber}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <p className="text-white font-semibold">{order.customerName}</p>
                          <p className="text-navy-400 text-[11px] font-mono">{order.customerPhone}</p>
                        </td>

                        {/* Delivery Type */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <DeliveryTypeBadge type={order.deliveryType} />
                            {order.tableNumber && (
                              <span className="text-[11px] text-navy-300 bg-navy-800 px-2 py-0.5 rounded border border-navy-700/50">
                                ط {order.tableNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Channel */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-navy-300 bg-navy-800/70 border border-navy-700/40 px-2 py-1 rounded-md text-[11px]">
                            {channelConfig[order.channel]?.labelAr || order.channel}
                          </span>
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-medium">{itemCount} عنصر</span>
                            <span className="text-navy-400 text-[11px] truncate">
                              ({order.items.map((i) => i.nameAr).join('، ')})
                            </span>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono">
                            <p className="text-white font-bold">{formatCurrency(order.total)}</p>
                            <p className={`text-[10px] ${order.paid ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {order.paid ? 'مدفوع' : 'غير مدفوع'}
                            </p>
                          </div>
                        </td>

                        {/* Elapsed Timer */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <OrderTimer createdAt={order.createdAt} />
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* Action Icon Button */}
                        <td className="py-3.5 px-4 text-center relative whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuOrderId(isMenuOpen ? null : order.id);
                              }}
                              className="w-8 h-8 rounded-lg bg-navy-800/80 hover:bg-brand-500 hover:text-white flex items-center justify-center text-navy-400 transition-all border border-navy-700/60 shadow-sm"
                              title="الإجراءات (تعديل / حذف / عرض)"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <OrderActionMenu
                                order={order}
                                onEdit={() => {
                                  setActiveMenuOrderId(null);
                                  setEditingOrder(order);
                                }}
                                onDelete={() => {
                                  setActiveMenuOrderId(null);
                                  setDeletingOrder(order);
                                }}
                                onView={() => navigate(`/orders/${order.id}`)}
                                onAdvanceStatus={(next) => handleQuickStatusAdvance(order, next)}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
        />
      )}

      {/* Delete Order Confirmation Dialog */}
      {deletingOrder && (
        <DeleteOrderModal
          order={deletingOrder}
          onClose={() => setDeletingOrder(null)}
        />
      )}
    </div>
  );
}

// =========================================================================
// Kanban Order Card
// =========================================================================
interface OrderCardProps {
  order: Order;
  isMenuOpen: boolean;
  onToggleMenu: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onAdvanceStatus: (next: OrderStatus) => void;
  onClick: () => void;
}

function OrderCard({
  order,
  isMenuOpen,
  onToggleMenu,
  onEdit,
  onDelete,
  onAdvanceStatus,
  onClick,
}: OrderCardProps) {
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const deliveryIcon =
    order.deliveryType === 'dine_in' ? Utensils : order.deliveryType === 'takeaway' ? ShoppingBag : Bike;
  const DeliveryIcon = deliveryIcon;
  const config = statusConfig[order.status];

  return (
    <div
      onClick={onClick}
      className="glass-card p-4 cursor-pointer hover:border-brand-500/50 hover:shadow-xl transition-all duration-200 group relative"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-9 h-9 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center font-bold text-sm ${config.color} shadow-sm`}
          >
            {order.orderNumber}
          </span>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{order.customerName}</p>
            <p className="text-navy-400 text-xs font-mono">{order.customerPhone}</p>
          </div>
        </div>

        {/* Action Icon Button */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onToggleMenu}
            className="w-8 h-8 rounded-lg bg-navy-800/80 hover:bg-brand-500 hover:text-white flex items-center justify-center text-navy-400 transition-all border border-navy-700/60 shadow-sm"
            title="الإجراءات (تعديل / حذف)"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Action Menu Dropdown */}
          {isMenuOpen && (
            <OrderActionMenu
              order={order}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onClick}
              onAdvanceStatus={onAdvanceStatus}
            />
          )}
        </div>
      </div>

      {/* Items preview */}
      <div className="bg-navy-900/60 rounded-xl px-3 py-2 mb-3 border border-navy-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-navy-400 text-[11px]">الأصناف:</span>
          <span className="text-brand-400 text-[11px] font-bold font-mono">{itemCount} عنصر</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {order.items.slice(0, 2).map((item, i) => (
            <span
              key={i}
              className="text-[11px] text-navy-300 bg-navy-800/80 border border-navy-700/40 px-2 py-0.5 rounded-md"
            >
              {item.quantity}× {item.nameAr}
            </span>
          ))}
          {order.items.length > 2 && (
            <span className="text-[11px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md font-medium">
              +{order.items.length - 2} المزيد
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DeliveryTypeBadge type={order.deliveryType} />
          {order.tableNumber && (
            <span className="text-xs text-navy-300 bg-navy-800 px-2 py-0.5 rounded-md border border-navy-700/50">
              طاولة {order.tableNumber}
            </span>
          )}
        </div>
        <div className="text-left font-mono">
          <p className="text-white font-bold text-sm">{formatCurrency(order.total)}</p>
        </div>
      </div>

      {/* Timer & Rider info */}
      {order.status !== 'completed' && order.status !== 'cancelled' && (
        <div className="mt-3 pt-2.5 border-t border-navy-800/80 flex items-center justify-between">
          <OrderTimer createdAt={order.createdAt} />
          {order.riderName && order.deliveryType === 'delivery' && (
            <div className="flex items-center gap-1.5 text-xs text-brand-400">
              <DeliveryIcon className="w-3.5 h-3.5" />
              <span>{order.riderName}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// Order Action Menu Component
// =========================================================================
interface OrderActionMenuProps {
  order: Order;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onView: () => void;
  onAdvanceStatus: (next: OrderStatus) => void;
}

function OrderActionMenu({
  order,
  onEdit,
  onDelete,
  onView,
  onAdvanceStatus,
}: OrderActionMenuProps) {
  return (
    <div
      className="absolute left-0 top-full mt-1.5 z-40 w-48 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl overflow-hidden py-1.5 text-xs animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 border-b border-navy-800/80 text-[11px] text-navy-400 font-medium">
        إجراءات الطلب <span className="font-mono text-white font-bold">{order.orderNumber}</span>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="w-full px-3 py-2 text-right hover:bg-navy-800 text-navy-200 hover:text-white flex items-center gap-2 transition-colors"
      >
        <Edit className="w-3.5 h-3.5 text-brand-400" />
        <span>تعديل بيانات الطلب</span>
      </button>

      <button
        type="button"
        onClick={onView}
        className="w-full px-3 py-2 text-right hover:bg-navy-800 text-navy-200 hover:text-white flex items-center gap-2 transition-colors"
      >
        <Eye className="w-3.5 h-3.5 text-blue-400" />
        <span>عرض صفحة التفاصيل</span>
      </button>

      {/* Quick Status Advance */}
      {order.status === 'new' && (
        <button
          type="button"
          onClick={() => onAdvanceStatus('in_kitchen')}
          className="w-full px-3 py-2 text-right hover:bg-navy-800 text-amber-300 hover:text-amber-200 flex items-center gap-2 transition-colors"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>بدء التحضير بالمطبخ</span>
        </button>
      )}

      {order.status === 'in_kitchen' && (
        <button
          type="button"
          onClick={() => onAdvanceStatus('ready')}
          className="w-full px-3 py-2 text-right hover:bg-navy-800 text-emerald-300 hover:text-emerald-200 flex items-center gap-2 transition-colors"
        >
          <Utensils className="w-3.5 h-3.5 text-emerald-400" />
          <span>جاهز للتسليم</span>
        </button>
      )}

      {order.status === 'ready' && order.deliveryType === 'delivery' && (
        <button
          type="button"
          onClick={() => onAdvanceStatus('out_for_delivery')}
          className="w-full px-3 py-2 text-right hover:bg-navy-800 text-brand-300 hover:text-brand-200 flex items-center gap-2 transition-colors"
        >
          <Bike className="w-3.5 h-3.5 text-brand-400" />
          <span>تسليم للمندوب</span>
        </button>
      )}

      {(order.status === 'ready' || order.status === 'out_for_delivery') && (
        <button
          type="button"
          onClick={() => onAdvanceStatus('completed')}
          className="w-full px-3 py-2 text-right hover:bg-navy-800 text-emerald-300 hover:text-emerald-200 flex items-center gap-2 transition-colors"
        >
          <Receipt className="w-3.5 h-3.5 text-emerald-400" />
          <span>اكتمال الطلب</span>
        </button>
      )}

      <div className="border-t border-navy-800/80 my-1" />

      <button
        type="button"
        onClick={onDelete}
        className="w-full px-3 py-2 text-right hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>حذف الطلب نهائياً</span>
      </button>
    </div>
  );
}
