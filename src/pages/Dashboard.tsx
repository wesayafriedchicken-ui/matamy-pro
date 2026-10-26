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
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import StatCard from '@/components/shared/StatCard';
import OrderTimer from '@/components/shared/OrderTimer';
import DeliveryTypeBadge from '@/components/shared/DeliveryTypeBadge';
import { formatCurrency, getStockStatus } from '@/utils/helpers';

export default function Dashboard() {
  const { orders, inventory, riders, transactions } = useApp();

  const isToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  };

  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const activeOrders = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled',
  );
  const lowStock = inventory.filter((i) => i.currentStock <= i.minReorderLevel);

  // Real today's revenue from orders or transactions
  const orderTodayRevenue = todayOrders
    .filter((o) => o.paid)
    .reduce((s, o) => s + (o.total || 0), 0);

  const txTodayRevenue = transactions
    .filter((t) => t.type === 'income' && isToday(t.date))
    .reduce((s, t) => s + (t.amount || 0), 0);

  const totalRevenue = Math.max(orderTodayRevenue, txTodayRevenue);

  const todayExpenses = transactions
    .filter((t) => t.type === 'expense' && isToday(t.date))
    .reduce((s, t) => s + (t.amount || 0), 0);

  const netProfit = totalRevenue - todayExpenses;
  const availableRiders = riders.filter((r) => r.status === 'available').length;
  const busyRiders = riders.filter((r) => r.status === 'busy').length;

  const recentOrders = [...activeOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Dynamic real hourly data from today's orders
  const hoursConfig = [
    { label: '10ص', h: 10 },
    { label: '11ص', h: 11 },
    { label: '12م', h: 12 },
    { label: '1م', h: 13 },
    { label: '2م', h: 14 },
    { label: '3م', h: 15 },
    { label: '4م', h: 16 },
    { label: '5م', h: 17 },
    { label: '6م', h: 18 },
    { label: '7م', h: 19 },
    { label: '8م', h: 20 },
    { label: '9م', h: 21 },
    { label: '10م', h: 22 },
    { label: '11م', h: 23 },
  ];

  const hourlyData = hoursConfig.map(({ label, h }) => {
    const ordersAtHour = todayOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getHours() === h;
    });
    const rev = ordersAtHour
      .filter((o) => o.paid)
      .reduce((s, o) => s + (o.total || 0), 0);
    return {
      hour: label,
      orders: ordersAtHour.length,
      revenue: rev,
    };
  });

  const maxRevenue = Math.max(1, ...hourlyData.map((d) => d.revenue));
  const hasHourlyRevenue = hourlyData.some((d) => d.revenue > 0);

  const deliveryTypes = {
    dine_in: orders.filter((o) => o.deliveryType === 'dine_in').length,
    takeaway: orders.filter((o) => o.deliveryType === 'takeaway').length,
    delivery: orders.filter((o) => o.deliveryType === 'delivery').length,
    talabat: orders.filter((o) => o.deliveryType === 'talabat').length,
  };
  const totalOrders = orders.length;
  const avgOrderVal = totalOrders > 0 ? Math.round(orders.reduce((s, o) => s + (o.total || 0), 0) / totalOrders) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Real Stats Grid - ZERO fake numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="طلبات نشطة" value={String(activeOrders.length)} color="brand" />
        <StatCard icon={DollarSign} label="إيرادات اليوم" value={formatCurrency(totalRevenue)} color="success" />
        <StatCard icon={TrendingUp} label="صافي الربح" value={formatCurrency(netProfit)} color={netProfit >= 0 ? 'blue' : 'danger'} />
        <StatCard icon={AlertTriangle} label="تنبيهات المخزون" value={String(lowStock.length)} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Hourly Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <h3 className="text-white font-bold text-lg">الإيرادات حسب الساعة</h3>
              <p className="text-navy-400 text-sm mt-0.5">مبيعات اليوم الفعلية المباشرة</p>
            </div>
            <div className="flex items-center gap-2 text-navy-400 text-xs font-mono bg-navy-800/60 px-3 py-1.5 rounded-xl border border-navy-700/40">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              تحديث لحظي
            </div>
          </div>

          {!hasHourlyRevenue ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-navy-900/30 rounded-2xl border border-dashed border-navy-700/50">
              <DollarSign className="w-8 h-8 text-navy-500 mb-2" />
              <p className="text-white font-medium text-sm">لا توجد مبيعات مسجلة اليوم حتى الآن</p>
              <p className="text-navy-400 text-xs mt-1">تتحدث الأعمدة البيانية تلقائياً عند إتمام أول طلب مسدد</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-1.5 h-48">
              {hourlyData.map((d, i) => {
                const barHeight = d.revenue > 0 ? Math.max(8, (d.revenue / maxRevenue) * 100) : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full flex flex-col justify-end h-full">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 relative ${
                          d.revenue > 0
                            ? 'bg-gradient-to-t from-brand-600 to-brand-400 group-hover:from-brand-500 group-hover:to-brand-300'
                            : 'bg-navy-800/30'
                        }`}
                        style={{ height: `${barHeight}%` }}
                      >
                        {d.revenue > 0 && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-navy-700 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none z-10 font-mono">
                            {formatCurrency(d.revenue)}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-navy-400 text-xs font-mono">{d.hour}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real Order Type Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-white font-bold text-lg mb-1">توزيع الطلبات</h3>
          <p className="text-navy-400 text-sm mb-6">حسب القنوات وأنواع الطلب</p>
          <div className="space-y-4">
            <OrderTypeRow
              icon={Utensils}
              label="صالة (Dine-in)"
              count={deliveryTypes.dine_in}
              total={totalOrders}
              color="bg-blue-500"
            />
            <OrderTypeRow
              icon={ShoppingBag}
              label="تيك أوي (سفري)"
              count={deliveryTypes.takeaway}
              total={totalOrders}
              color="bg-brand-500"
            />
            <OrderTypeRow
              icon={Bike}
              label="توصيل منزلي"
              count={deliveryTypes.delivery}
              total={totalOrders}
              color="bg-success-500"
            />
            <OrderTypeRow
              icon={Smartphone}
              label="ابلكيشن طلبات"
              count={deliveryTypes.talabat}
              total={totalOrders}
              color="bg-amber-500"
            />
          </div>
          <div className="mt-6 pt-6 border-t border-navy-700/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-navy-400 text-sm">إجمالي الطلبات</span>
              <span className="text-white font-bold text-lg font-mono">{totalOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-navy-400 text-sm">متوسط قيمة الطلب</span>
              <span className="text-white font-bold text-lg font-mono">
                {formatCurrency(avgOrderVal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Active Orders */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-400" />
              الطلبات النشطة
            </h3>
            <span className="bg-brand-500/15 text-brand-400 text-sm font-medium px-3 py-1 rounded-full font-mono">
              {activeOrders.length}
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center bg-navy-900/30 rounded-2xl border border-dashed border-navy-700/50">
              <Clock className="w-8 h-8 text-navy-500 mx-auto mb-2" />
              <p className="text-white font-medium text-sm">لا توجد طلبات نشطة حالياً</p>
              <p className="text-navy-400 text-xs mt-1">تظهر الطلبات النشطة هنا فور تسجيلها من الكاشير أو التطبيق</p>
            </div>
          ) : (
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
          )}
        </div>

        {/* Real Stock Alerts + Riders */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning-400" />
                تنبيهات المخزون
              </h3>
              <span className="bg-danger-500/15 text-danger-400 text-sm font-medium px-3 py-1 rounded-full font-mono">
                {lowStock.length} عنصر
              </span>
            </div>

            {lowStock.length === 0 ? (
              <div className="p-6 text-center bg-navy-900/30 rounded-xl border border-dashed border-navy-700/50">
                <CheckCircle2 className="w-6 h-6 text-success-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">المخزون في حالة ممتازة</p>
                <p className="text-navy-400 text-xs mt-0.5">لا توجد عناصر تحت حد إعادة الطلب</p>
              </div>
            ) : (
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
            )}
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
                <p className="text-success-400 font-bold text-2xl font-mono">{availableRiders}</p>
                <p className="text-navy-300 text-xs mt-1">متاح</p>
              </div>
              <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-3 text-center">
                <p className="text-brand-400 font-bold text-2xl font-mono">{busyRiders}</p>
                <p className="text-navy-300 text-xs mt-1">مشغول</p>
              </div>
              <div className="bg-navy-700/30 border border-navy-600/30 rounded-xl p-3 text-center">
                <p className="text-navy-300 font-bold text-2xl font-mono">{Math.max(0, riders.length - availableRiders - busyRiders)}</p>
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
        <span className="text-white text-sm font-bold font-mono">{count}</span>
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
