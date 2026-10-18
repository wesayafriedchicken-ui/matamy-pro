import {
  ClipboardList,
  Package,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  Bike,
  Utensils,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import StatCard from '@/components/shared/StatCard';
import OrderTimer from '@/components/shared/OrderTimer';
import DeliveryTypeBadge from '@/components/shared/DeliveryTypeBadge';
import { formatCurrency, getStockStatus } from '@/utils/helpers';

export default function Dashboard() {
  const { orders, inventory, riders, transactions } = useApp();

  const activeOrders = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled',
  );
  const lowStock = inventory.filter((i) => i.currentStock <= i.minReorderLevel);
  const totalRevenue = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const availableRiders = riders.filter((r) => r.status === 'available').length;
  const busyRiders = riders.filter((r) => r.status === 'busy').length;

  const recentOrders = [...activeOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const hourlyData = [
    { hour: '10ص', orders: 12, revenue: 840 },
    { hour: '11ص', orders: 18, revenue: 1260 },
    { hour: '12م', orders: 32, revenue: 2840 },
    { hour: '1م', orders: 45, revenue: 3920 },
    { hour: '2م', orders: 38, revenue: 3210 },
    { hour: '3م', orders: 25, revenue: 2150 },
    { hour: '4م', orders: 20, revenue: 1680 },
    { hour: '5م', orders: 28, revenue: 2450 },
    { hour: '6م', orders: 42, revenue: 3780 },
    { hour: '7م', orders: 55, revenue: 4820 },
    { hour: '8م', orders: 48, revenue: 4120 },
    { hour: '9م', orders: 35, revenue: 2980 },
  ];

  const maxRevenue = Math.max(...hourlyData.map((d) => d.revenue));
  const deliveryTypes = {
    dine_in: orders.filter((o) => o.deliveryType === 'dine_in').length,
    takeaway: orders.filter((o) => o.deliveryType === 'takeaway').length,
    delivery: orders.filter((o) => o.deliveryType === 'delivery').length,
  };
  const totalOrders = orders.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="طلبات نشطة" value={String(activeOrders.length)} change={12} color="brand" />
        <StatCard icon={DollarSign} label="إيرادات اليوم" value={formatCurrency(totalRevenue)} change={8} color="success" />
        <StatCard icon={TrendingUp} label="صافي الربح" value={formatCurrency(netProfit)} change={5} color="blue" />
        <StatCard icon={AlertTriangle} label="تنبيهات المخزون" value={String(lowStock.length)} change={-3} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-bold text-lg">الإيرادات حسب الساعة</h3>
              <p className="text-navy-400 text-sm mt-0.5">أداء المبيعات اليوم</p>
            </div>
            <div className="flex items-center gap-2 text-success-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +15% عن الأمس
            </div>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-48">
            {hourlyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex flex-col justify-end h-full">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-300 group-hover:from-brand-500 group-hover:to-brand-300 relative"
                    style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-navy-700 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none">
                      {formatCurrency(d.revenue)}
                    </div>
                  </div>
                </div>
                <span className="text-navy-400 text-xs">{d.hour}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Type Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-white font-bold text-lg mb-1">توزيع الطلبات</h3>
          <p className="text-navy-400 text-sm mb-6">حسب نوع الطلب</p>
          <div className="space-y-4">
            <OrderTypeRow
              icon={Utensils}
              label="صالة"
              count={deliveryTypes.dine_in}
              total={totalOrders}
              color="bg-blue-500"
            />
            <OrderTypeRow
              icon={ShoppingBag}
              label="تيك أوي"
              count={deliveryTypes.takeaway}
              total={totalOrders}
              color="bg-brand-500"
            />
            <OrderTypeRow
              icon={Bike}
              label="توصيل"
              count={deliveryTypes.delivery}
              total={totalOrders}
              color="bg-success-500"
            />
          </div>
          <div className="mt-6 pt-6 border-t border-navy-700/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-navy-400 text-sm">إجمالي الطلبات</span>
              <span className="text-white font-bold text-lg">{totalOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-navy-400 text-sm">متوسط قيمة الطلب</span>
              <span className="text-white font-bold text-lg">
                {formatCurrency(Math.round(orders.reduce((s, o) => s + o.total, 0) / totalOrders))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Orders */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-400" />
              الطلبات النشطة
            </h3>
            <span className="bg-brand-500/15 text-brand-400 text-sm font-medium px-3 py-1 rounded-full">
              {activeOrders.length}
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentOrders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40 flex items-center justify-between gap-3 hover:border-navy-600 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-700/50 flex items-center justify-center text-white font-bold text-sm">
                    {order.orderNumber}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{order.customerName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <DeliveryTypeBadge type={order.deliveryType} />
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <OrderTimer createdAt={order.createdAt} showIcon={false} />
                  <p className="text-navy-300 text-xs mt-1 font-mono">{formatCurrency(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Alerts + Riders */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning-400" />
                تنبيهات المخزون
              </h3>
              <span className="bg-danger-500/15 text-danger-400 text-sm font-medium px-3 py-1 rounded-full">
                {lowStock.length} عنصر
              </span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {lowStock.map((item) => {
                const status = getStockStatus(item.currentStock, item.minReorderLevel);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-navy-900/50 rounded-xl px-4 py-2.5 border border-navy-700/40"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-navy-400" />
                      <span className="text-white text-sm font-medium">{item.nameAr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-navy-300 text-xs font-mono">
                        {item.currentStock} {item.unitAr}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md ${
                          status === 'critical'
                            ? 'bg-danger-500/15 text-danger-400'
                            : 'bg-warning-500/15 text-warning-400'
                        }`}
                      >
                        {status === 'critical' ? 'حرج' : 'منخفض'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Bike className="w-5 h-5 text-brand-400" />
                حالة المناديب
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-success-500/10 border border-success-500/30 rounded-xl p-3 text-center">
                <p className="text-success-400 font-bold text-2xl">{availableRiders}</p>
                <p className="text-navy-300 text-xs mt-1">متاح</p>
              </div>
              <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-3 text-center">
                <p className="text-brand-400 font-bold text-2xl">{busyRiders}</p>
                <p className="text-navy-300 text-xs mt-1">مشغول</p>
              </div>
              <div className="bg-navy-700/30 border border-navy-600/30 rounded-xl p-3 text-center">
                <p className="text-navy-300 font-bold text-2xl">{riders.length - availableRiders - busyRiders}</p>
                <p className="text-navy-400 text-xs mt-1">غير متصل</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderTypeRow({
  icon: Icon,
  label,
  count,
  total,
  color,
}: {
  icon: typeof Utensils;
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-navy-300" />
          <span className="text-navy-200 text-sm font-medium">{label}</span>
        </div>
        <span className="text-white text-sm font-bold">{count}</span>
      </div>
      <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
