import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Rider } from '@/types';
import {
  Bike, Phone, Star, MapPin, Package, Navigation,
  UtensilsCrossed, Truck, CheckCircle2, Clock,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import OrderTimer from '@/components/shared/OrderTimer';

const vehicleTypes: Record<string, { labelAr: string; icon: typeof Bike }> = {
  motorcycle: { labelAr: 'دراجة نارية', icon: Bike },
  car: { labelAr: 'سيارة', icon: Truck },
};

const riderVehicles: Record<string, 'motorcycle' | 'car'> = {
  r1: 'motorcycle', r2: 'motorcycle', r3: 'car', r4: 'motorcycle', r5: 'motorcycle', r6: 'car',
};

export default function DispatchAssignment() {
  const { orders, riders, assignRider, updateOrderStatus, showToast } = useApp();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const unassignedDelivery = orders.filter(
    (o) => o.deliveryType === 'delivery' && !o.riderId && o.status !== 'cancelled' && o.status !== 'completed',
  );
  const activeDeliveries = orders.filter((o) => o.status === 'out_for_delivery' && o.riderName);
  const availableRiders = riders.filter((r) => r.status === 'available');
  const busyRiders = riders.filter((r) => r.status === 'busy');

  const handleAssign = (orderId: string, rider: Rider) => {
    assignRider(orderId, rider.id, rider.nameAr);
    updateOrderStatus(orderId, 'out_for_delivery');
    showToast(`تم تعيين ${rider.nameAr} للطلب وتغيير الحالة إلى "مع المندوب"`, 'success');
    setSelectedOrderId(null);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="المناديب والتوزيع" description="توزيع الطلبات على المناديب وإدارة الأسطول" />

      {/* Sub-route navigation */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit">
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <Package className="w-4 h-4" />
          توزيع الطلبات
        </span>
        <Link to="/dispatch/delivery" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Bike className="w-4 h-4" />
          المناديب (Delivery)
        </Link>
        <Link to="/dispatch/tracking" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Navigation className="w-4 h-4" />
          التتبع المباشر
        </Link>
        <Link to="/dispatch/custody" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <UtensilsCrossed className="w-4 h-4" />
          العهد والخزينة
        </Link>
        <Link to="/dispatch/delivery-zones" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <MapPin className="w-4 h-4" />
          مناطق وزونات التوصيل
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Package} label="طلبات بانتظار التعيين" value={String(unassignedDelivery.length)} color="warning" />
        <StatCard icon={Navigation} label="قيد التوصيل الآن" value={String(activeDeliveries.length)} color="brand" />
        <StatCard icon={Bike} label="مناديب متاحين" value={String(availableRiders.length)} color="success" />
        <StatCard icon={Clock} label="مناديب مشغولين" value={String(busyRiders.length)} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Unassigned Orders */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-warning-400" />
            طلبات بانتظار التعيين
            <span className="text-navy-400 text-sm font-normal">({unassignedDelivery.length})</span>
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {unassignedDelivery.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-10 h-10 text-navy-600 mx-auto mb-2" />
                <p className="text-navy-400 text-sm">جميع الطلبات تم تعيينها</p>
              </div>
            ) : (
              unassignedDelivery.map((order) => {
                const isSelected = selectedOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-500/10 border-brand-500/40'
                        : 'bg-navy-900/50 border-navy-700/40 hover:border-navy-600'
                    }`}
                    onClick={() => setSelectedOrderId(isSelected ? null : order.id)}
                  >
                    <div className="px-4 py-3.5">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-9 h-9 rounded-xl bg-warning-500/15 text-warning-400 flex items-center justify-center font-bold text-sm">
                            {order.orderNumber}
                          </span>
                          <div>
                            <p className="text-white font-medium text-sm">{order.customerName}</p>
                            <p className="text-navy-400 text-xs">{order.customerPhone}</p>
                          </div>
                        </div>
                        <OrderTimer createdAt={order.createdAt} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-navy-300 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-brand-400" />
                        <span className="truncate">{order.address ?? '—'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-navy-700/30">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                          order.status === 'ready'
                            ? 'bg-success-500/10 text-success-400'
                            : order.status === 'in_kitchen'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {order.status === 'ready' ? 'جاهز للشحن' : order.status === 'in_kitchen' ? 'قيد التحضير' : 'جديد'}
                        </span>
                        <span className="text-white font-mono text-sm font-bold">{formatCurrency(order.total)}</span>
                      </div>
                    </div>

                    {/* Inline rider selection */}
                    {isSelected && (
                      <div className="px-4 pb-3.5 border-t border-navy-700/30 pt-3 animate-fade-in">
                        <p className="text-navy-300 text-xs mb-2">اختر مندوب للتعيين السريع:</p>
                        <div className="flex flex-wrap gap-2">
                          {availableRiders.length === 0 ? (
                            <p className="text-danger-400 text-xs">لا يوجد مناديب متاحين حالياً</p>
                          ) : (
                            availableRiders.map((rider) => {
                              const vehicle = riderVehicles[rider.id] ?? 'motorcycle';
                              const VIcon = vehicleTypes[vehicle].icon;
                              return (
                                <button
                                  key={rider.id}
                                  onClick={(e) => { e.stopPropagation(); handleAssign(order.id, rider); }}
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-navy-800/60 border border-navy-700/40 hover:border-brand-500/40 hover:bg-brand-500/10 transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-success-500/15 text-success-400 flex items-center justify-center text-xs font-bold">
                                    {rider.nameAr.charAt(0)}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-white text-xs font-medium">{rider.nameAr}</p>
                                    <p className="text-navy-400 text-xs flex items-center gap-1">
                                      <VIcon className="w-2.5 h-2.5" />
                                      {vehicleTypes[vehicle].labelAr}
                                    </p>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Riders */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <Bike className="w-5 h-5 text-brand-400" />
            المناديب النشطين
            <span className="text-navy-400 text-sm font-normal">({riders.filter((r) => r.status !== 'offline').length})</span>
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {riders.filter((r) => r.status !== 'offline').map((rider) => {
              const vehicle = riderVehicles[rider.id] ?? 'motorcycle';
              const VIcon = vehicleTypes[vehicle].icon;
              const riderOrders = orders.filter((o) => o.riderId === rider.id && o.status === 'out_for_delivery');
              return (
                <div
                  key={rider.id}
                  className="bg-navy-900/50 rounded-2xl border border-navy-700/40 hover:border-navy-600 transition-all overflow-hidden"
                >
                  <div className="px-4 py-3.5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg ${
                          rider.status === 'available'
                            ? 'bg-success-500/15 text-success-400'
                            : 'bg-brand-500/15 text-brand-400'
                        }`}>
                          {rider.nameAr.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{rider.nameAr}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-warning-400">
                              <Star className="w-3 h-3 fill-warning-400" />
                              {rider.rating}
                            </span>
                            <span className="text-navy-400 text-xs">•</span>
                            <span className="flex items-center gap-1 text-xs text-navy-300">
                              <VIcon className="w-3 h-3" />
                              {vehicleTypes[vehicle].labelAr}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                        rider.status === 'available'
                          ? 'bg-success-500/15 text-success-400'
                          : 'bg-brand-500/15 text-brand-400'
                      }`}>
                        {rider.status === 'available' ? 'متاح' : 'في الطريق'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-navy-400 pt-3 border-t border-navy-700/30">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {rider.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {rider.zoneAr}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        {rider.currentOrders} نشط
                      </span>
                    </div>
                  </div>

                  {/* Active orders for this rider */}
                  {riderOrders.length > 0 && (
                    <div className="bg-navy-900/30 px-4 py-2.5 border-t border-navy-700/30">
                      {riderOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold text-xs">
                              {order.orderNumber}
                            </span>
                            <div>
                              <p className="text-white text-xs font-medium">{order.customerName}</p>
                              <p className="text-navy-400 text-xs truncate max-w-32">{order.address}</p>
                            </div>
                          </div>
                          <span className="text-white text-xs font-mono font-bold">{formatCurrency(order.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recently dispatched */}
      {activeDeliveries.length > 0 && (
        <div className="glass-card p-5 mt-6">
          <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-brand-400" />
            طلبات تم إرسالها للمناديب
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeDeliveries.map((order) => (
              <div key={order.id} className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold text-xs">
                    {order.orderNumber}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-brand-400">
                    <Bike className="w-3.5 h-3.5" />
                    {order.riderName}
                  </span>
                </div>
                <p className="text-white text-sm font-medium">{order.customerName}</p>
                <p className="text-navy-400 text-xs truncate">{order.address}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-navy-700/30">
                  <OrderTimer createdAt={order.createdAt} />
                  <span className="text-white font-mono text-sm font-bold">{formatCurrency(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
