import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Rider } from '@/types';
import {
  Wallet, Package, UtensilsCrossed, Bike, Banknote, AlertCircle,
  CheckCircle2, Clock, Receipt, X, ChevronLeft,
  TrendingUp, Scale,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

interface CustodyRecord {
  riderId: string;
  codOrders: number;
  cashCollected: number;
  openingFloat: number;
  settled: boolean;
  deficit: number;
}

const mockCustody: CustodyRecord[] = [
  { riderId: 'r1', codOrders: 4, cashCollected: 715, openingFloat: 200, settled: false, deficit: 0 },
  { riderId: 'r2', codOrders: 3, cashCollected: 520, openingFloat: 150, settled: false, deficit: 0 },
  { riderId: 'r3', codOrders: 2, cashCollected: 310, openingFloat: 100, settled: true, deficit: 0 },
  { riderId: 'r4', codOrders: 1, cashCollected: 176, openingFloat: 100, settled: false, deficit: 15 },
  { riderId: 'r6', codOrders: 0, cashCollected: 0, openingFloat: 50, settled: true, deficit: 0 },
];

export default function DispatchCustody() {
  const { riders, showToast } = useApp();
  const [custody, setCustody] = useState<CustodyRecord[]>(mockCustody);
  const [settleRider, setSettleRider] = useState<Rider | null>(null);
  const [settleRecord, setSettleRecord] = useState<CustodyRecord | null>(null);
  const [collectedAmount, setCollectedAmount] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  const totalCashInField = custody
    .filter((c) => !c.settled)
    .reduce((s, c) => s + c.cashCollected + c.openingFloat, 0);
  const settledToday = custody.filter((c) => c.settled).length;
  const pendingAmount = custody
    .filter((c) => !c.settled)
    .reduce((s, c) => s + c.cashCollected + c.openingFloat, 0);
  const totalDeficit = custody.reduce((s, c) => s + c.deficit, 0);

  const handleSettle = () => {
    if (!settleRider || !settleRecord) return;
    const expected = settleRecord.cashCollected + settleRecord.openingFloat;
    const collected = Number(collectedAmount) || 0;
    const deficit = Math.max(0, expected - collected);

    setCustody((prev) =>
      prev.map((c) =>
        c.riderId === settleRider.id
          ? { ...c, settled: true, deficit, cashCollected: collected - c.openingFloat }
          : c,
      ),
    );
    showToast(`تمت تسوية عهدة ${settleRider.nameAr} بنجاح - تم استلام ${formatCurrency(collected)}`, 'success');
    setShowReceipt(true);
  };

  const closeSettlement = () => {
    setSettleRider(null);
    setSettleRecord(null);
    setCollectedAmount('');
    setShowReceipt(false);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="المناديب والتوزيع" description="تسوية العهد النقدية للمناديب" />

      {/* Sub-route navigation */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit">
        <Link to="/dispatch" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Package className="w-4 h-4" />
          توزيع الطلبات
        </Link>
        <Link to="/dispatch/delivery" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Bike className="w-4 h-4" />
          المناديب (Delivery)
        </Link>
        <Link to="/dispatch/tracking" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <UtensilsCrossed className="w-4 h-4" />
          التتبع المباشر
        </Link>
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <Wallet className="w-4 h-4" />
          العهد والخزينة
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Banknote} label="كاش مع المناديب" value={formatCurrency(totalCashInField)} color="brand" />
        <StatCard icon={CheckCircle2} label="عهد تم تسويتها" value={String(settledToday)} color="success" />
        <StatCard icon={Clock} label="مبالغ معلقة للتحصيل" value={formatCurrency(pendingAmount)} color="warning" />
        <StatCard icon={AlertCircle} label="إجمالي العجز" value={formatCurrency(totalDeficit)} color="danger" />
      </div>

      {/* Custody Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-700/50">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-400" />
            جدول تسوية العهد - مناديب التوصيل
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-700/50">
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">اسم المندوب</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">طلبات كاش</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">النقدية المحصلة</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">رصيد افتتاحي</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">المستحق للخزينة</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">العجز</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">حالة التسوية</th>
                <th className="text-center text-navy-400 text-xs font-medium px-5 py-3">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {custody.map((record) => {
                const rider = riders.find((r) => r.id === record.riderId);
                if (!rider) return null;
                const due = record.cashCollected + record.openingFloat;
                return (
                  <tr key={record.riderId} className="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors">
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
                      <span className="text-navy-200 text-sm font-mono">{record.codOrders}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white text-sm font-mono font-bold">{formatCurrency(record.cashCollected)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-navy-300 text-sm font-mono">{formatCurrency(record.openingFloat)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-brand-400 text-sm font-mono font-bold">{formatCurrency(due)}</span>
                    </td>
                    <td className="px-5 py-4">
                      {record.deficit > 0 ? (
                        <span className="text-danger-400 text-sm font-mono font-bold">{formatCurrency(record.deficit)}</span>
                      ) : (
                        <span className="text-success-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {record.settled ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-success-500/10 text-success-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تم التوريد
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-warning-500/10 text-warning-400">
                          <Clock className="w-3.5 h-3.5" />
                          معلق
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {!record.settled && (
                        <button
                          onClick={() => {
                            setSettleRider(rider);
                            setSettleRecord(record);
                            setCollectedAmount(String(due));
                          }}
                          className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-1.5"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          تسوية واستلام
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlement Modal */}
      {settleRider && settleRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeSettlement}>
          <div className="glass-card w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {!showReceipt ? (
              <>
                <div className="px-6 py-4 border-b border-navy-700/50 flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Scale className="w-5 h-5 text-brand-400" />
                    تسوية عهدة مندوب
                  </h3>
                  <button onClick={closeSettlement} className="w-10 h-10 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
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
                      <p className="text-white font-medium text-sm">{settleRider.nameAr}</p>
                      <p className="text-navy-400 text-xs">{settleRider.phone}</p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-navy-900/50 rounded-xl px-4 py-2.5 border border-navy-700/40">
                      <span className="text-navy-300 text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success-400" />
                        النقدية المحصلة من الطلبات
                      </span>
                      <span className="text-white font-mono text-sm font-bold">{formatCurrency(settleRecord.cashCollected)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-navy-900/50 rounded-xl px-4 py-2.5 border border-navy-700/40">
                      <span className="text-navy-300 text-sm flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-brand-400" />
                        الرصيد الافتتاحي (عهدة)
                      </span>
                      <span className="text-white font-mono text-sm font-bold">{formatCurrency(settleRecord.openingFloat)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-brand-500/10 rounded-xl px-4 py-3 border border-brand-500/20">
                      <span className="text-brand-400 text-sm font-medium">المبلغ المستحق توريده للخزينة</span>
                      <span className="text-white font-mono text-lg font-bold">{formatCurrency(settleRecord.cashCollected + settleRecord.openingFloat)}</span>
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
                    {Number(collectedAmount) < (settleRecord.cashCollected + settleRecord.openingFloat) && (
                      <p className="text-danger-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        يوجد عجز بمقدار {formatCurrency((settleRecord.cashCollected + settleRecord.openingFloat) - Number(collectedAmount))}
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
                  <button onClick={closeSettlement} className="w-10 h-10 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
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
                    <ReceiptRow label="اسم المندوب" value={settleRider.nameAr} />
                    <ReceiptRow label="رقم الهاتف" value={settleRider.phone} />
                    <ReceiptRow label="عدد الطلبات المسلمة" value={String(settleRecord.codOrders)} />
                    <ReceiptRow label="النقدية المحصلة" value={formatCurrency(settleRecord.cashCollected)} />
                    <ReceiptRow label="الرصيد الافتتاحي" value={formatCurrency(settleRecord.openingFloat)} />
                    <ReceiptRow label="المبلغ المستلم" value={formatCurrency(Number(collectedAmount) || 0)} highlight />
                    {Number(collectedAmount) < (settleRecord.cashCollected + settleRecord.openingFloat) && (
                      <ReceiptRow
                        label="العجز"
                        value={formatCurrency((settleRecord.cashCollected + settleRecord.openingFloat) - Number(collectedAmount))}
                        danger
                      />
                    )}
                    <ReceiptRow label="تاريخ التسوية" value={new Date().toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })} />
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

function ReceiptRow({ label, value, highlight, danger }: { label: string; value: string; highlight?: boolean; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-navy-400 text-sm">{label}</span>
      <span className={`text-sm font-mono font-bold ${
        danger ? 'text-danger-400' : highlight ? 'text-success-400' : 'text-white'
      }`}>
        {value}
      </span>
    </div>
  );
}
