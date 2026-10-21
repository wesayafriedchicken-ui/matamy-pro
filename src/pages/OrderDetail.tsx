import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Order, OrderStatus } from '@/types';
import {
  ArrowRight, Printer, RefreshCw, Clock, User, Phone, MapPin, CreditCard,
  Bike, Package, ChefHat, CheckCircle2, Navigation, Battery, Gauge,
  Receipt, Utensils, AlertCircle, ChevronDown, ChevronUp,
  MapPinned, Zap, CircleDot,
} from 'lucide-react';
import { statusConfig, channelConfig, formatCurrency, getElapsedMinutes } from '@/utils/helpers';
import StatusBadge from '@/components/shared/StatusBadge';
import DeliveryTypeBadge from '@/components/shared/DeliveryTypeBadge';

const statusFlow: OrderStatus[] = ['new', 'in_kitchen', 'ready', 'out_for_delivery', 'completed'];

const timelineSteps = [
  { key: 'created', labelAr: 'إنشاء الطلب', icon: CircleDot },
  { key: 'accepted', labelAr: 'قبول المطعم', icon: CheckCircle2 },
  { key: 'kds_ready', labelAr: 'جاهز بالمطبخ', icon: ChefHat },
  { key: 'picked_up', labelAr: 'استلام المندوب', icon: Package },
  { key: 'near_destination', labelAr: 'قرب موقع العميل', icon: Navigation },
  { key: 'delivered', labelAr: 'تم التسليم بنجاح', icon: CheckCircle2 },
];

interface AuditEntry {
  action: string;
  timestamp: string;
  actor: string;
  lat: number;
  lng: number;
  notes: string;
}

function generateAuditLog(order: Order): AuditEntry[] {
  const created = new Date(order.createdAt);
  const fmt = (d: Date) => d.toISOString();
  const baseLat = 30.0626;
  const baseLng = 31.2497;

  const entries: AuditEntry[] = [
    { action: 'ORDER_CREATED', timestamp: fmt(created), actor: 'النظام', lat: baseLat, lng: baseLng, notes: `طلب ${order.orderNumber} من ${channelConfig[order.channel].labelAr}` },
    { action: 'ORDER_ACCEPTED', timestamp: fmt(new Date(created.getTime() + 60000)), actor: 'أحمد علي (مدير)', lat: baseLat, lng: baseLng, notes: 'تم قبول الطلب تلقائياً' },
  { action: 'KDS_STARTED', timestamp: fmt(new Date(created.getTime() + 120000)), actor: 'النظام', lat: baseLat, lng: baseLng, notes: 'تم إرسال الطلب لشاشة المطبخ' },
    { action: 'KDS_READY', timestamp: fmt(new Date(created.getTime() + (order.items.length * 3 + 5) * 60000)), actor: 'سيد المطبخ', lat: baseLat, lng: baseLng, notes: 'تم إنهاء التحضير' },
  { action: 'DISPATCH_ASSIGNED', timestamp: fmt(new Date(created.getTime() + (order.items.length * 3 + 6) * 60000)), actor: 'النظام', lat: baseLat, lng: baseLng, notes: order.riderName ? `تم تعيين ${order.riderName}` : 'في انتظار تعيين مندوب' },
    { action: 'RIDER_PICKED_UP', timestamp: fmt(new Date(created.getTime() + (order.items.length * 3 + 8) * 60000)), actor: order.riderName ?? '—', lat: baseLat + 0.001, lng: baseLng + 0.001, notes: 'استلام الطلب من المطعم' },
    { action: 'RIDER_NEAR_DESTINATION', timestamp: fmt(new Date(created.getTime() + (order.items.length * 3 + 18) * 60000)), actor: order.riderName ?? '—', lat: baseLat + 0.01, lng: baseLng + 0.015, notes: 'على بعد 500م من العميل' },
    { action: 'ORDER_DELIVERED', timestamp: fmt(new Date(created.getTime() + (order.items.length * 3 + 22) * 60000)), actor: order.riderName ?? '—', lat: baseLat + 0.012, lng: baseLng + 0.018, notes: 'تم التسليم للعميل بنجاح' },
  ];

  return entries;
}

function getTimelineProgress(status: OrderStatus): number {
  switch (status) {
    case 'new': return 1;
    case 'in_kitchen': return 3;
    case 'ready': return 3;
    case 'out_for_delivery': return 5;
    case 'completed': return 6;
    case 'cancelled': return 1;
    default: return 1;
  }
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, menuItems, inventory, riders, updateOrderStatus, assignRider, showToast } = useApp();
  const [showBom, setShowBom] = useState(false);
  const [riderProgress, setRiderProgress] = useState(0);
  const [selectedRider, setSelectedRider] = useState('');

  const order = orders.find((o) => o.id === orderId);

  const isOutForDelivery = order?.status === 'out_for_delivery';

  useEffect(() => {
    if (isOutForDelivery) {
      const interval = setInterval(() => {
        setRiderProgress((p) => Math.min(p + 1, 100));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isOutForDelivery]);

  const auditLog = useMemo(() => (order ? generateAuditLog(order) : []), [order]);
  const timelineProgress = order ? getTimelineProgress(order.status) : 0;

  // BOM consumption calculation
  const bomConsumption = useMemo(() => {
    if (!order) return [];
    const consumption: Record<string, { nameAr: string; unitAr: string; totalQty: number; cost: number }> = {};
    for (const item of order.items) {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      if (!menuItem) continue;
      for (const ing of menuItem.recipe) {
        const key = ing.inventoryId;
        if (!consumption[key]) {
          consumption[key] = { nameAr: ing.nameAr, unitAr: ing.unitAr, totalQty: 0, cost: 0 };
        }
        consumption[key].totalQty += ing.quantity * item.quantity;
        consumption[key].cost += ing.cost * item.quantity;
      }
    }
    return Object.entries(consumption).map(([invId, data]) => {
      const inv = inventory.find((i) => i.id === invId);
      return { invId, ...data, currentStock: inv?.currentStock ?? 0 };
    });
  }, [order, menuItems, inventory]);

  if (!order) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-navy-600 mx-auto mb-3" />
          <p className="text-navy-400 text-lg">الطلب غير موجود</p>
          <button onClick={() => navigate('/orders')} className="btn-primary mt-4">العودة للطلبات</button>
        </div>
      </div>
    );
  }

  const config = statusConfig[order.status];
  const currentStatusIndex = statusFlow.indexOf(order.status);
  const nextStatus = statusFlow[currentStatusIndex + 1];
  const canAdvance = order.status !== 'completed' && order.status !== 'cancelled' && nextStatus;
  const elapsedMin = getElapsedMinutes(order.createdAt);
  const availableRiders = riders.filter((r) => r.status === 'available');

  const handleAdvance = () => {
    if (nextStatus) {
      updateOrderStatus(order.id, nextStatus);
      if (nextStatus === 'in_kitchen') {
        showToast(`تم خصم مكونات الطلب ${order.orderNumber} تلقائياً من رصيد المخزن (BOM Updated)`, 'info');
      } else if (nextStatus === 'completed') {
        showToast(`تم إكمال الطلب ${order.orderNumber} - خصم نهائي للمخزون`, 'success');
      }
    }
  };

  const handleAssignRider = () => {
    const rider = riders.find((r) => r.id === selectedRider);
    if (rider) {
      assignRider(order.id, rider.id, rider.nameAr);
      setSelectedRider('');
      showToast(`تم تعيين ${rider.nameAr} للطلب ${order.orderNumber}`, 'success');
    }
  };

  // Stage durations for donut chart
  const prepTime = order.items.length * 3 + 5;
  const tripTime = 14;
  const acceptTime = 1;
  const totalTime = acceptTime + prepTime + tripTime;
  const stagePct = {
    accept: Math.round((acceptTime / totalTime) * 100),
    prep: Math.round((prepTime / totalTime) * 100),
    trip: Math.round((tripTime / totalTime) * 100),
    deliver: Math.round(((totalTime - acceptTime - prepTime - tripTime + 2) / totalTime) * 100),
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Top Bar */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="w-10 h-10 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <span className={`w-12 h-12 rounded-2xl ${config.bg} ${config.border} border flex items-center justify-center font-bold text-lg ${config.color}`}>
                {order.orderNumber}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} size="sm" />
                  <DeliveryTypeBadge type={order.deliveryType} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg ${config.bg} ${config.color}`}>
                    <Clock className="w-3 h-3" />
                    {elapsedMin} دقيقة
                  </span>
                  <span className="text-navy-400 text-xs">{channelConfig[order.channel].labelAr}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-ghost flex items-center gap-2 text-sm">
              <Printer className="w-4 h-4" />
              طباعة الفاتورة
            </button>
            {canAdvance && (
              <button onClick={handleAdvance} className="btn-primary flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4" />
                {nextStatus === 'in_kitchen' ? 'بدء التحضير' : nextStatus === 'ready' ? 'جاهز' : nextStatus === 'out_for_delivery' ? 'إرسال للمندوب' : 'إكمال'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Panel: Process Duration & Customer Info */}
        <div className="space-y-5">
          {/* Process Duration Donut */}
          <div className="glass-card p-5">
            <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-brand-400" />
              توزيع زمن المراحل
            </h4>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(30 41 59)" strokeWidth="12" />
                  {(() => {
                    const segments = [
                      { pct: stagePct.accept, color: '#3b82f6' },
                      { pct: stagePct.prep, color: '#f59e0b' },
                      { pct: stagePct.trip, color: '#3b82f6' },
                      { pct: stagePct.deliver, color: '#10b981' },
                    ];
                    let offset = 0;
                    return segments.map((seg, i) => {
                      const len = (seg.pct / 100) * 314;
                      const el = (
                        <circle
                          key={i}
                          cx="60" cy="60" r="50" fill="none"
                          stroke={seg.color} strokeWidth="12"
                          strokeDasharray={`${len} 314`}
                          strokeDashoffset={-offset}
                          strokeLinecap="round"
                        />
                      );
                      offset += len;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-2xl">{totalTime}</span>
                  <span className="text-navy-400 text-xs">دقيقة</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'قبول', pct: stagePct.accept, color: 'bg-blue-500' },
                { label: 'تجهيز', pct: stagePct.prep, color: 'bg-amber-500' },
                { label: 'تحرك المندوب', pct: stagePct.trip, color: 'bg-brand-500' },
                { label: 'تسليم', pct: stagePct.deliver, color: 'bg-success-500' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  <span className="text-navy-300 text-xs">{s.label}</span>
                  <span className="text-white text-xs font-bold mr-auto">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time Metrics */}
          <div className="glass-card p-5">
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              مقاييس الوقت
            </h4>
            <div className="space-y-2.5">
              <TimeMetric label="وقت استلام الطلب" value={new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} icon={CircleDot} />
              <TimeMetric label="وقت إنهاء المطبخ" value={`${prepTime} دقيقة`} icon={ChefHat} color="text-amber-400" />
              <TimeMetric label="وقت انطلاق المندوب" value={`${tripTime} دقيقة`} icon={Bike} color="text-brand-400" />
              <TimeMetric label="الوقت المتبقي المقدر" value={`${Math.max(0, totalTime - elapsedMin)} دقيقة`} icon={Navigation} color="text-success-400" />
            </div>
          </div>

          {/* Customer Info */}
          <div className="glass-card p-5">
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400" />
              بيانات العميل
            </h4>
            <div className="space-y-2.5">
              <InfoRow icon={User} label="اسم العميل" value={order.customerName} />
              <InfoRow icon={Phone} label="رقم الهاتف" value={order.customerPhone} />
              <InfoRow icon={Phone} label="هاتف بديل" value="01099887766" />
              <InfoRow
                icon={CreditCard}
                label="طريقة الدفع"
                value={order.paymentMethod === 'cash' ? 'كاش عند الاستلام' : order.paymentMethod === 'card' ? 'بطاقة' : 'محفظة إلكترونية'}
              />
              {order.address && <InfoRow icon={MapPin} label="العنوان" value={order.address} />}
              {order.tableNumber && <InfoRow icon={MapPin} label="الطاولة" value={`طاولة ${order.tableNumber}`} />}
            </div>
          </div>
        </div>

        {/* Right Panel: Map & Order Items */}
        <div className="lg:col-span-2 space-y-5">
          {/* Map Simulator */}
          {order.deliveryType === 'delivery' && (
            <div className="glass-card p-5">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <MapPinned className="w-4 h-4 text-brand-400" />
                خريطة التوصيل المباشر
              </h4>
              <div className="relative h-64 rounded-2xl overflow-hidden bg-navy-900 border border-navy-700/40">
                {/* Grid background */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }} />
                {/* Route line */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 80 180 Q 200 100 350 60"
                    fill="none"
                    stroke="url(#routeGrad)"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                </svg>
                {/* Restaurant pin */}
                <div className="absolute" style={{ right: '12%', bottom: '20%' }}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                        <Utensils className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-brand-400 font-medium whitespace-nowrap">المطعم</span>
                  </div>
                </div>
                {/* Customer pin */}
                <div className="absolute" style={{ right: '55%', top: '15%' }}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-success-500/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-success-500 flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-success-400 font-medium whitespace-nowrap">العميل</span>
                  </div>
                </div>
                {/* Rider marker */}
                {order.riderName && (
                  <div
                    className="absolute transition-all duration-1000"
                    style={{
                      right: `${12 + (riderProgress / 100) * 43}%`,
                      bottom: `${20 + (riderProgress / 100) * 65}%`,
                    }}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center animate-pulse">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <Bike className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Rider info overlay */}
                {order.riderName && (
                  <div className="absolute top-3 right-3 bg-navy-800/90 backdrop-blur-md rounded-xl px-3 py-2 border border-navy-700/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Bike className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-medium">{order.riderName}</p>
                        <p className="text-navy-400 text-xs">{riders.find((r) => r.id === order.riderId)?.phone ?? '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-brand-400">
                        <Gauge className="w-3 h-3" />
                        {Math.round(20 + riderProgress * 0.3)} كم/س
                      </span>
                      <span className="flex items-center gap-1 text-success-400">
                        <Battery className="w-3 h-3" />
                        {Math.max(20, 85 - riderProgress)}%
                      </span>
                    </div>
                  </div>
                )}
                {/* Progress bar */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-l from-brand-500 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${riderProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rider Assignment */}
          {order.deliveryType === 'delivery' && !order.riderName && order.status !== 'cancelled' && order.status !== 'completed' && (
            <div className="glass-card p-5">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Bike className="w-4 h-4 text-brand-400" />
                تعيين مندوب التوصيل
              </h4>
              <div className="flex gap-2">
                <select value={selectedRider} onChange={(e) => setSelectedRider(e.target.value)} className="input-field flex-1">
                  <option value="">اختر مندوب متاح...</option>
                  {availableRiders.map((r) => (
                    <option key={r.id} value={r.id}>{r.nameAr} - {r.zoneAr} ⭐ {r.rating}</option>
                  ))}
                </select>
                <button onClick={handleAssignRider} disabled={!selectedRider} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">تعيين</button>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="glass-card p-5">
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-400" />
              أصناف الطلب
            </h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center text-sm font-bold">
                        {item.quantity}×
                      </span>
                      <span className="text-white font-medium text-sm">{item.nameAr}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-navy-200 text-sm font-mono">{formatCurrency(item.price * item.quantity)}</span>
                      <p className="text-navy-400 text-xs">{item.price} ج / قطعة</p>
                    </div>
                  </div>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5 pr-9">
                      {item.modifiers.map((mod, i) => (
                        <span key={i} className="bg-brand-500/10 text-brand-400 text-xs px-2 py-0.5 rounded-md border border-brand-500/20">{mod}</span>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <p className="text-warning-400 text-xs mt-1.5 pr-9">⚠ {item.notes}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="mt-4 bg-navy-900/50 rounded-2xl px-5 py-4 border border-navy-700/40 space-y-2">
              <div className="flex justify-between text-navy-300 text-sm">
                <span>المجموع الفرعي</span>
                <span className="font-mono">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-navy-300 text-sm">
                <span>ضريبة القيمة المضافة (14%)</span>
                <span className="font-mono">{formatCurrency(order.tax)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-navy-300 text-sm">
                  <span>
                    رسوم التوصيل {order.deliveryZoneCode ? `(زون ${order.deliveryZoneCode}${order.deliveryZoneAr ? ` - ${order.deliveryZoneAr}` : ''})` : ''}
                  </span>
                  <span className="font-mono text-amber-400 font-bold">{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              <div className="border-t border-navy-700/40 pt-2 flex justify-between text-white font-bold">
                <span>الإجمالي المستحق</span>
                <span className="font-mono text-lg">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* BOM Consumption */}
          <div className="glass-card overflow-hidden">
            <button
              onClick={() => setShowBom(!showBom)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-navy-800/30 transition-colors"
            >
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-400" />
                استهلاك المخزون لهذا الطلب
                <span className="text-navy-400 text-xs">({bomConsumption.length} مكون)</span>
              </h4>
              {showBom ? <ChevronUp className="w-4 h-4 text-navy-400" /> : <ChevronDown className="w-4 h-4 text-navy-400" />}
            </button>
            {showBom && (
              <div className="px-5 pb-5 space-y-2">
                {bomConsumption.map((item) => (
                  <div key={item.invId} className="flex items-center gap-3 bg-navy-900/50 rounded-xl px-4 py-2.5 border border-navy-700/40">
                    <div className="w-8 h-8 rounded-lg bg-navy-700/50 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-navy-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{item.nameAr}</p>
                      <p className="text-navy-400 text-xs">الرصيد الحالي: {item.currentStock} {item.unitAr}</p>
                    </div>
                    <div className="text-left shrink-0">
                      <p className="text-warning-400 text-sm font-bold font-mono">-{item.totalQty} {item.unitAr}</p>
                      <p className="text-navy-400 text-xs">{Math.round(item.cost)} ج</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-brand-500/10 rounded-xl px-4 py-2.5 border border-brand-500/20">
                  <span className="text-brand-400 text-sm font-medium flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    إجمالي التكلفة المستهلكة
                  </span>
                  <span className="text-white font-bold font-mono">{Math.round(bomConsumption.reduce((s, i) => s + i.cost, 0))} ج</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card p-5">
        <h4 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-brand-400" />
          مسار تتبع الطلب
        </h4>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {timelineSteps.map((step, i) => {
            const Icon = step.icon;
            const isDone = i < timelineProgress;
            const isCurrent = i === timelineProgress - 1;
            const isCancelled = order.status === 'cancelled';
            return (
              <div key={step.key} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-2 min-w-28">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    isCancelled && i > 0
                      ? 'bg-navy-800 border-navy-700 text-navy-500'
                      : isDone
                        ? isCurrent
                          ? 'bg-brand-500/20 border-brand-500 text-brand-400 animate-pulse'
                          : 'bg-success-500/15 border-success-500/40 text-success-400'
                        : 'bg-navy-800 border-navy-700 text-navy-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-medium text-center max-w-24 ${isDone ? 'text-white' : 'text-navy-500'}`}>
                    {step.labelAr}
                  </span>
                </div>
                {i < timelineSteps.length - 1 && (
                  <div className={`h-0.5 w-16 mx-1 transition-all ${
                    i < timelineProgress - 1 ? 'bg-success-500/50' : 'bg-navy-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Log */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-700/50">
          <h4 className="text-white font-semibold text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brand-400" />
            سجل العمليات والتدقيق (Audit Log)
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-700/50">
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الحدث</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الوقت والتاريخ</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">المسؤول</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الإحداثيات</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((entry, i) => (
                <tr key={i} className="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-lg ${
                      entry.action === 'ORDER_CREATED' ? 'bg-blue-500/10 text-blue-400'
                        : entry.action === 'KDS_READY' ? 'bg-amber-500/10 text-amber-400'
                        : entry.action === 'DISPATCH_ASSIGNED' ? 'bg-brand-500/10 text-brand-400'
                        : entry.action === 'ORDER_DELIVERED' ? 'bg-success-500/10 text-success-400'
                        : 'bg-navy-700/40 text-navy-300'
                    }`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-navy-200 text-xs font-mono">
                      {new Date(entry.timestamp).toLocaleString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-navy-200 text-sm">{entry.actor}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-navy-300 text-xs font-mono">{entry.lat.toFixed(4)}, {entry.lng.toFixed(4)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-navy-300 text-xs">{entry.notes}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel button */}
      {order.status !== 'cancelled' && order.status !== 'completed' && (
        <div className="flex justify-end">
          <button
            onClick={() => { updateOrderStatus(order.id, 'cancelled'); showToast(`تم إلغاء الطلب ${order.orderNumber}`, 'warning'); }}
            className="btn-ghost text-danger-400 hover:bg-danger-500/10 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            إلغاء الطلب
          </button>
        </div>
      )}
    </div>
  );
}

function TimeMetric({ label, value, icon: Icon, color = 'text-navy-200' }: { label: string; value: string; icon: typeof Clock; color?: string }) {
  return (
    <div className="flex items-center justify-between bg-navy-900/50 rounded-xl px-3 py-2.5 border border-navy-700/40">
      <div className="flex items-center gap-2 text-navy-400 text-xs">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        {label}
      </div>
      <span className={`text-sm font-medium ${color}`}>{value}</span>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-navy-700/50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-navy-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-navy-400 text-xs">{label}</p>
        <p className="text-white text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
