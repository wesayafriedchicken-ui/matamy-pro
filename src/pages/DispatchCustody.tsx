import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Rider } from '@/types';
import {
  Wallet,
  Package,
  UtensilsCrossed,
  Bike,
  Banknote,
  AlertCircle,
  CheckCircle2,
  Clock,
  Receipt,
  X,
  ChevronLeft,
  TrendingUp,
  Scale,
  MapPin,
  Plus,
  Coins,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

interface RiderCustodyMeta {
  openingFloat: number;
  settled: boolean;
  deficit: number;
  collectedAmount?: number;
  settledAt?: string;
}

interface CustodyItem {
  rider: Rider;
  codOrders: number;
  cashCollected: number;
  openingFloat: number;
  settled: boolean;
  deficit: number;
  due: number;
}

export default function DispatchCustody() {
  const { riders, orders, showToast } = useApp();

  // Persistent custody state per rider without mock numbers
  const [custodyMeta, setCustodyMeta] = useState<Record<string, RiderCustodyMeta>>(() => {
    try {
      const saved = localStorage.getItem('nine_fries_custody_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  const saveCustodyMeta = (newMeta: Record<string, RiderCustodyMeta>) => {
    setCustodyMeta(newMeta);
    try {
      localStorage.setItem('nine_fries_custody_v2', JSON.stringify(newMeta));
    } catch {
      // ignore
    }
  };

  const [settleItem, setSettleItem] = useState<CustodyItem | null>(null);
  const [collectedAmount, setCollectedAmount] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  // Edit float modal state
  const [editingFloatRider, setEditingFloatRider] = useState<Rider | null>(null);
  const [floatInput, setFloatInput] = useState('');

  // Compute real custody items directly from real riders and orders in system
  const custodyItems: CustodyItem[] = useMemo(() => {
    return riders.map((rider) => {
      // Cash orders assigned to this rider from actual orders list
      const riderCashOrders = orders.filter(
        (o) => o.riderId === rider.id && o.paymentMethod === 'cash' && o.status !== 'cancelled'
      );
      const codOrders = riderCashOrders.length;
      const cashCollected = riderCashOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      const meta = custodyMeta[rider.id] || {
        openingFloat: 0,
        settled: false,
        deficit: 0,
      };

      const openingFloat = meta.openingFloat || 0;
      const due = cashCollected + openingFloat;

      return {
        rider,
        codOrders,
        cashCollected,
        openingFloat,
        settled: meta.settled || false,
        deficit: meta.deficit || 0,
        due,
      };
    });
  }, [riders, orders, custodyMeta]);

  // KPI calculations based strictly on real active riders in system
  const totalCashInField = useMemo(() => {
    return custodyItems
      .filter((c) => !c.settled)
      .reduce((s, c) => s + c.due, 0);
  }, [custodyItems]);

  const settledToday = useMemo(() => {
    return custodyItems.filter((c) => c.settled).length;
  }, [custodyItems]);

  const pendingAmount = useMemo(() => {
    return custodyItems
      .filter((c) => !c.settled)
      .reduce((s, c) => s + c.due, 0);
  }, [custodyItems]);

  const totalDeficit = useMemo(() => {
    return custodyItems.reduce((s, c) => s + c.deficit, 0);
  }, [custodyItems]);

  const handleOpenSettle = (item: CustodyItem) => {
    setSettleItem(item);
    setCollectedAmount(String(item.due));
    setShowReceipt(false);
  };

  const handleSettle = () => {
    if (!settleItem) return;
    const expected = settleItem.due;
    const collected = Number(collectedAmount) || 0;
    const deficit = Math.max(0, expected - collected);

    const updatedMeta: Record<string, RiderCustodyMeta> = {
      ...custodyMeta,
      [settleItem.rider.id]: {
        openingFloat: settleItem.openingFloat,
        settled: true,
        deficit,
        collectedAmount: collected,
        settledAt: new Date().toISOString(),
      },
    };
    saveCustodyMeta(updatedMeta);
    showToast(
      `تمت تسوية عهدة ${settleItem.rider.nameAr} بنجاح - تم استلام ${formatCurrency(collected)}`,
      'success'
    );
    setShowReceipt(true);
  };

  const handleResetSettlement = (riderId: string) => {
    const updatedMeta = {
      ...custodyMeta,
      [riderId]: {
        ...(custodyMeta[riderId] || { openingFloat: 0 }),
        settled: false,
        deficit: 0,
      },
    };
    saveCustodyMeta(updatedMeta);
    showToast('تمت إعادة فتح عهدة المندوب للتسوية', 'info');
  };

  const handleSaveFloat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFloatRider) return;
    const amount = Math.max(0, parseFloat(floatInput) || 0);
    const updatedMeta = {
      ...custodyMeta,
      [editingFloatRider.id]: {
        ...(custodyMeta[editingFloatRider.id] || { settled: false, deficit: 0 }),
        openingFloat: amount,
      },
    };
    saveCustodyMeta(updatedMeta);
    showToast(`تم تعيين رصيد افتتاحي (${formatCurrency(amount)}) للمندوب ${editingFloatRider.nameAr}`, 'success');
    setEditingFloatRider(null);
    setFloatInput('');
  };

  const closeSettlement = () => {
    setSettleItem(null);
    setCollectedAmount('');
    setShowReceipt(false);
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <PageHeader title="المناديب والتوزيع" description="تسوية العهد النقدية للمناديب" />

      {/* Sub-route navigation */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit flex-wrap border border-navy-700/50">
        <Link
          to="/dispatch"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all"
        >
          <Package className="w-4 h-4" />
          توزيع الطلبات
        </Link>
        <Link
          to="/dispatch/delivery"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all"
        >
          <Bike className="w-4 h-4" />
          المناديب (Delivery)
        </Link>
        <Link
          to="/dispatch/tracking"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all"
        >
          <UtensilsCrossed className="w-4 h-4" />
          التتبع المباشر
        </Link>
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <Wallet className="w-4 h-4" />
          العهد والخزينة
        </span>
        <Link
          to="/dispatch/delivery-zones"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all"
        >
          <MapPin className="w-4 h-4" />
          مناطق وزونات التوصيل
        </Link>
      </div>

      {/* KPI Cards - Calculated strictly from real data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Banknote}
          label="كاش مع المناديب"
          value={formatCurrency(totalCashInField)}
          color="brand"
        />
        <StatCard
          icon={CheckCircle2}
          label="عهد تم تسويتها"
          value={String(settledToday)}
          color="success"
        />
        <StatCard
          icon={Clock}
          label="مبالغ معلقة للتحصيل"
          value={formatCurrency(pendingAmount)}
          color="warning"
        />
        <StatCard
          icon={AlertCircle}
          label="إجمالي العجز"
          value={formatCurrency(totalDeficit)}
          color={totalDeficit > 0 ? 'danger' : 'blue'}
        />
      </div>

      {/* Custody Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-700/50 flex items-center justify-between">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-400" />
            جدول تسوية العهد - مناديب التوصيل
          </h3>
          <span className="text-navy-400 text-xs">
            {custodyItems.length} مندوب مسجل
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-700/50">
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">اسم المندوب</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">طلبات كاش</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">النقدية المحصلة</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">رصيد افتتاحي (عهدة)</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">المستحق للخزينة</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">العجز</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">حالة التسوية</th>
                <th className="text-center text-navy-400 text-xs font-medium px-5 py-3">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {custodyItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-navy-800 border border-navy-700 flex items-center justify-center text-navy-400">
                        <Bike className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">لا يوجد مناديب مسجلين في النظام حالياً</p>
                        <p className="text-navy-400 text-xs mt-1">
                          أضف مناديب توصيل من شاشة المناديب لتبدأ متابعة العهد النقدية والطلبات المستحقة بشكل فعلي وحقيقي.
                        </p>
                      </div>
                      <Link
                        to="/dispatch/delivery/new"
                        className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة مندوب جديد</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                custodyItems.map((item) => {
                  const { rider, codOrders, cashCollected, openingFloat, due, deficit, settled } = item;
                  return (
                    <tr
                      key={rider.id}
                      className="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-navy-700/50 flex items-center justify-center font-bold text-sm text-navy-200">
                            {rider.nameAr.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{rider.nameAr}</p>
                            <p className="text-navy-400 text-xs">{rider.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-navy-200 text-sm font-mono">{codOrders}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-white text-sm font-mono font-bold">
                          {formatCurrency(cashCollected)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-navy-300 text-sm font-mono">
                            {formatCurrency(openingFloat)}
                          </span>
                          {!settled && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFloatRider(rider);
                                setFloatInput(String(openingFloat));
                              }}
                              className="text-[11px] text-brand-400 hover:text-brand-300 hover:underline flex items-center gap-0.5"
                              title="تعديل الرصيد الافتتاحي"
                            >
                              <Coins className="w-3 h-3" />
                              <span>تحديد</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-brand-400 text-sm font-mono font-bold">
                          {formatCurrency(due)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {deficit > 0 ? (
                          <span className="text-danger-400 text-sm font-mono font-bold">
                            {formatCurrency(deficit)}
                          </span>
                        ) : (
                          <span className="text-navy-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {settled ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-success-500/10 text-success-400 border border-success-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            تم التوريد
                          </span>
                        ) : due > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-warning-500/10 text-warning-400 border border-warning-500/20">
                            <Clock className="w-3.5 h-3.5" />
                            معلق للتسوية
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-navy-800 text-navy-400 border border-navy-700/50">
                            لا توجد مستحقات
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {!settled ? (
                          <button
                            onClick={() => handleOpenSettle(item)}
                            className="btn-primary text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            تسوية واستلام
                          </button>
                        ) : (
                          <button
                            onClick={() => handleResetSettlement(rider.id)}
                            className="btn-ghost text-xs px-3 py-1.5 inline-flex items-center gap-1 text-navy-400 hover:text-white"
                            title="إلغاء التسوية وإعادة فتح العهدة"
                          >
                            <RotateCcw className="w-3 h-3" />
                            إعادة فتح
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Set Opening Float Modal */}
      {editingFloatRider && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setEditingFloatRider(null)}
        >
          <div
            className="glass-card w-full max-w-sm animate-scale-in p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-navy-700/60">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Coins className="w-4 h-4 text-brand-400" />
                تحديد الرصيد الافتتاحي (عهدة بداية الشيفت)
              </h3>
              <button
                onClick={() => setEditingFloatRider(null)}
                className="w-8 h-8 rounded-lg bg-navy-800 text-navy-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFloat} className="space-y-4">
              <div>
                <p className="text-xs text-navy-300 mb-2">
                  المندوب: <strong className="text-white">{editingFloatRider.nameAr}</strong>
                </p>
                <label className="text-xs text-navy-400 block mb-1.5">
                  قيمة العهدة النقدية المسلمة للمندوب (ج.م):
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={floatInput}
                  onChange={(e) => setFloatInput(e.target.value)}
                  placeholder="0"
                  className="input-field text-center font-mono font-bold text-lg"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1 text-xs py-2.5">
                  حفظ وتطبيق
                </button>
                <button
                  type="button"
                  onClick={() => setEditingFloatRider(null)}
                  className="btn-ghost text-xs px-4"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settlement Modal */}
      {settleItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={closeSettlement}
        >
          <div
            className="glass-card w-full max-w-md animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {!showReceipt ? (
              <>
                <div className="px-6 py-4 border-b border-navy-700/50 flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Scale className="w-5 h-5 text-brand-400" />
                    تسوية عهدة مندوب
                  </h3>
                  <button
                    onClick={closeSettlement}
                    className="w-10 h-10 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Rider info */}
                  <div className="flex items-center gap-3 bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
                    <div className="w-11 h-11 rounded-xl bg-navy-700/50 flex items-center justify-center">
                      <Bike className="w-5 h-5 text-navy-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{settleItem.rider.nameAr}</p>
                      <p className="text-navy-400 text-xs">{settleItem.rider.phone}</p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-navy-900/50 rounded-xl px-4 py-2.5 border border-navy-700/40">
                      <span className="text-navy-300 text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success-400" />
                        النقدية المحصلة من الطلبات
                      </span>
                      <span className="text-white font-mono text-sm font-bold">
                        {formatCurrency(settleItem.cashCollected)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-navy-900/50 rounded-xl px-4 py-2.5 border border-navy-700/40">
                      <span className="text-navy-300 text-sm flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-brand-400" />
                        الرصيد الافتتاحي (عهدة)
                      </span>
                      <span className="text-white font-mono text-sm font-bold">
                        {formatCurrency(settleItem.openingFloat)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-brand-500/10 rounded-xl px-4 py-3 border border-brand-500/20">
                      <span className="text-brand-400 text-sm font-medium">المبلغ المستحق توريده للخزينة</span>
                      <span className="text-white font-mono text-lg font-bold">
                        {formatCurrency(settleItem.due)}
                      </span>
                    </div>
                  </div>

                  {/* Collected input */}
                  <div>
                    <label className="text-navy-300 text-sm font-medium mb-2 block">المبلغ المستلم فعلياً</label>
                    <input
                      type="number"
                      value={collectedAmount}
                      onChange={(e) => setCollectedAmount(e.target.value)}
                      className="input-field text-center text-lg font-bold"
                      placeholder="0"
                    />
                    {Number(collectedAmount) < settleItem.due && (
                      <p className="text-danger-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        يوجد عجز بمقدار {formatCurrency(settleItem.due - Number(collectedAmount))}
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-navy-700/50 flex gap-3">
                  <button onClick={handleSettle} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    تأكيد التسوية والتوريد
                  </button>
                  <button onClick={closeSettlement} className="btn-ghost">إلغاء</button>
                </div>
              </>
            ) : (
              /* Receipt */
              <>
                <div className="px-6 py-4 border-b border-navy-700/50 flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-success-400" />
                    إيصال التسوية
                  </h3>
                  <button
                    onClick={closeSettlement}
                    className="w-10 h-10 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-success-500/15 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-8 h-8 text-success-400" />
                    </div>
                    <p className="text-white font-bold text-lg">تمت التسوية بنجاح</p>
                    <p className="text-navy-400 text-sm">إيصال رقم: REC-{Date.now().toString().slice(-6)}</p>
                  </div>

                  <div className="bg-navy-900/50 rounded-xl border border-navy-700/40 divide-y divide-navy-700/30">
                    <ReceiptRow label="اسم المندوب" value={settleItem.rider.nameAr} />
                    <ReceiptRow label="رقم الهاتف" value={settleItem.rider.phone} />
                    <ReceiptRow label="عدد الطلبات المسلمة" value={String(settleItem.codOrders)} />
                    <ReceiptRow label="النقدية المحصلة" value={formatCurrency(settleItem.cashCollected)} />
                    <ReceiptRow label="الرصيد الافتتاحي" value={formatCurrency(settleItem.openingFloat)} />
                    <ReceiptRow label="المبلغ المستلم" value={formatCurrency(Number(collectedAmount) || 0)} highlight />
                    {Number(collectedAmount) < settleItem.due && (
                      <ReceiptRow
                        label="العجز"
                        value={formatCurrency(settleItem.due - Number(collectedAmount))}
                        danger
                      />
                    )}
                    <ReceiptRow
                      label="تاريخ التسوية"
                      value={new Date().toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                    />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-navy-700/50">
                  <button onClick={closeSettlement} className="btn-primary w-full flex items-center justify-center gap-2">
                    <ChevronLeft className="w-5 h-5" />
                    تم
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-navy-400 text-sm">{label}</span>
      <span
        className={`text-sm font-mono font-bold ${
          danger ? 'text-danger-400' : highlight ? 'text-success-400' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
