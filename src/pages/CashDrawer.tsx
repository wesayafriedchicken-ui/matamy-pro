import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Wallet, TrendingUp, TrendingDown,
  ArrowUpCircle, ArrowDownCircle, Save, X, FileText,
  Receipt, AlertCircle, CheckCircle2, Clock, User, Upload,
  BookOpen, BarChart3, Percent,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import VatSettingsCard from '@/components/finance/VatSettingsCard';

interface CashMovement {
  id: string;
  refNo: string;
  time: string;
  type: 'sales' | 'rider_deposit' | 'purchase' | 'maintenance' | 'deposit' | 'petty';
  typeAr: string;
  amount: number;
  responsible: string;
  balanceAfter: number;
}

const initialMovements: CashMovement[] = [
  { id: 'cm1', refNo: 'CM-001', time: '08:15', type: 'deposit', typeAr: 'إيداع افتتاحي', amount: 2000, responsible: 'عمر يوسف', balanceAfter: 2000 },
  { id: 'cm2', refNo: 'CM-002', time: '09:30', type: 'sales', typeAr: 'مبيعات صالة', amount: 345, responsible: 'سارة حسن', balanceAfter: 2345 },
  { id: 'cm3', refNo: 'CM-003', time: '10:15', type: 'purchase', typeAr: 'شراء خضار', amount: -180, responsible: 'أحمد علي', balanceAfter: 2165 },
  { id: 'cm4', refNo: 'CM-004', time: '11:00', type: 'sales', typeAr: 'مبيعات صالة', amount: 520, responsible: 'سارة حسن', balanceAfter: 2685 },
  { id: 'cm5', refNo: 'CM-005', time: '12:30', type: 'rider_deposit', typeAr: 'توريد مندوب', amount: 715, responsible: 'سيد أحمد', balanceAfter: 3400 },
  { id: 'cm6', refNo: 'CM-006', time: '13:45', type: 'sales', typeAr: 'مبيعات صالة', amount: 890, responsible: 'سارة حسن', balanceAfter: 4290 },
  { id: 'cm7', refNo: 'CM-007', time: '14:20', type: 'maintenance', typeAr: 'صيانة فرن', amount: -350, responsible: 'عمر يوسف', balanceAfter: 3940 },
  { id: 'cm8', refNo: 'CM-008', time: '15:30', type: 'sales', typeAr: 'مبيعات تطبيق', amount: 430, responsible: 'سارة حسن', balanceAfter: 4370 },
  { id: 'cm9', refNo: 'CM-009', time: '16:00', type: 'rider_deposit', typeAr: 'توريد مندوب', amount: 520, responsible: 'خالد سامي', balanceAfter: 4890 },
  { id: 'cm10', refNo: 'CM-010', time: '17:15', type: 'petty', typeAr: 'مصروف نثري - ماء', amount: -45, responsible: 'فاطمة نور', balanceAfter: 4845 },
];

const movementTypeConfig: Record<string, { color: string; bg: string; icon: typeof ArrowUpCircle }> = {
  sales: { color: 'text-success-400', bg: 'bg-success-500/15', icon: ArrowUpCircle },
  rider_deposit: { color: 'text-blue-400', bg: 'bg-blue-500/15', icon: ArrowUpCircle },
  purchase: { color: 'text-danger-400', bg: 'bg-danger-500/15', icon: ArrowDownCircle },
  maintenance: { color: 'text-warning-400', bg: 'bg-warning-500/15', icon: ArrowDownCircle },
  deposit: { color: 'text-success-400', bg: 'bg-success-500/15', icon: ArrowUpCircle },
  petty: { color: 'text-danger-400', bg: 'bg-danger-500/15', icon: ArrowDownCircle },
};

export default function CashDrawer() {
  const { showToast, taxRate } = useApp();
  const [movements, setMovements] = useState<CashMovement[]>(initialMovements);
  const [showPetty, setShowPetty] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showZReport, setShowZReport] = useState(false);
  const [showVatSettings, setShowVatSettings] = useState(false);

  const currentBalance = movements.length > 0 ? movements[movements.length - 1].balanceAfter : 0;
  const cashIn = movements.filter((m) => m.amount > 0).reduce((s, m) => s + m.amount, 0);
  const cashOut = movements.filter((m) => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0);

  const _addMovement = (type: CashMovement['type'], typeAr: string, amount: number, responsible: string) => {
    const newBalance = currentBalance + amount;
    const newMv: CashMovement = {
      id: `cm-${Date.now()}`,
      refNo: `CM-${String(movements.length + 1).padStart(3, '0')}`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      type, typeAr, amount, responsible, balanceAfter: newBalance,
    };
    setMovements((prev) => [...prev, newMv]);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="المالية والخزينة" description="الخزينة والحركة النقدية اليومية وإعدادات الضرائب" />

      {/* Sub-route nav */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit flex-wrap border border-navy-700/50">
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <Wallet className="w-4 h-4" />
          الخزينة اليومية
        </span>
        <Link to="/financials/chart-of-accounts" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <BookOpen className="w-4 h-4" />
          دليل الحسابات
        </Link>
        <Link to="/financials/reports" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <BarChart3 className="w-4 h-4" />
          التقارير والميزانية
        </Link>
        <Link to="/financials/tax-settings" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Percent className="w-4 h-4 text-brand-400" />
          إعدادات الضريبة (VAT: {taxRate}%)
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Wallet} label="النقدية الحالية بالخزينة" value={formatCurrency(currentBalance)} color="brand" />
        <StatCard icon={TrendingUp} label="إجمالي مقبوضات اليوم" value={formatCurrency(cashIn)} color="success" />
        <StatCard icon={TrendingDown} label="إجمالي المصروفات النثرية" value={formatCurrency(cashOut)} color="danger" />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button onClick={() => setShowPetty(true)} className="btn-primary flex items-center gap-2 text-sm">
          <ArrowDownCircle className="w-4 h-4" />
          تسجيل سحب / مصروف نثري
        </button>
        <button onClick={() => setShowDeposit(true)} className="btn-ghost flex items-center gap-2 text-sm">
          <ArrowUpCircle className="w-4 h-4" />
          توريد نقدية / إيداع
        </button>
        <button onClick={() => setShowZReport(true)} className="btn-ghost flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4" />
          إقفال اليومية وحساب العجز/الزيادة
        </button>
        <button
          onClick={() => setShowVatSettings((prev) => !prev)}
          className={`btn-ghost flex items-center gap-2 text-sm transition-all ${
            showVatSettings
              ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 shadow-sm'
              : 'text-navy-200 hover:text-white'
          }`}
        >
          <Percent className="w-4 h-4 text-brand-400" />
          {showVatSettings ? 'إخفاء لوحة الضريبة' : `تعديل ضريبة القيمة المضافة (${taxRate}%)`}
        </button>
      </div>

      {/* Inline VAT Settings Card when toggled */}
      {showVatSettings && (
        <div className="mb-6 animate-scale-in">
          <VatSettingsCard onSaved={() => {}} />
        </div>
      )}

      {/* Cash Movement Log */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-700/50 flex items-center justify-between">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-400" />
            سجل حركة الخزينة المباشر
          </h3>
          <span className="text-navy-400 text-sm">{movements.length} حركة</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-700/50">
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">رقم الحركة</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الوقت</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">نوع الحركة</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">المبلغ</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">المسؤول</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الرصيد التراكمي</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mv) => {
                const config = movementTypeConfig[mv.type] ?? movementTypeConfig.petty;
                const MvIcon = config.icon;
                return (
                  <tr key={mv.id} className="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-navy-300 text-sm font-mono">{mv.refNo}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-navy-300 text-sm font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {mv.time}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${config.bg} ${config.color}`}>
                        <MvIcon className="w-3.5 h-3.5" />
                        {mv.typeAr}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-mono font-bold ${mv.amount > 0 ? 'text-success-400' : 'text-danger-400'}`}>
                        {mv.amount > 0 ? '+' : ''}{formatCurrency(mv.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-navy-200 text-sm flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-navy-400" />
                        {mv.responsible}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-white text-sm font-mono font-bold">{formatCurrency(mv.balanceAfter)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Petty Expense Modal */}
      {showPetty && (
        <Modal title="تسجيل مصروف نثري" icon={ArrowDownCircle} onClose={() => setShowPetty(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">بند الصرف</label>
              <select className="input-field">
                <option value="">اختر بند الصرف</option>
                <option value="maintenance">صيانة معدات</option>
                <option value="supplies">مستلزمات نثرية</option>
                <option value="transport">مواصلات</option>
                <option value="cleaning">مواد تنظيف</option>
                <option value="other">أخرى</option>
              </select>
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">المبلغ</label>
              <input type="number" placeholder="0" className="input-field text-center text-lg font-bold" />
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">الموظف المسؤول</label>
              <input type="text" placeholder="اسم الموظف" className="input-field" />
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">مرفق / إيصال</label>
              <div className="h-20 rounded-xl bg-navy-900/50 border-2 border-dashed border-navy-700/60 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-brand-500/50 transition-all">
                <Upload className="w-5 h-5 text-navy-500" />
                <span className="text-navy-400 text-xs">رفع صورة الإيصال</span>
              </div>
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">ملاحظات</label>
              <textarea className="input-field min-h-16 resize-none" placeholder="تفاصيل إضافية..." />
            </div>
          </div>
          <button
            onClick={() => { setShowPetty(false); showToast('تم تسجيل المصروف النثري', 'success'); }}
            className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            تأكيد الصرف
          </button>
        </Modal>
      )}

      {/* Deposit Modal */}
      {showDeposit && (
        <Modal title="توريد نقدية / إيداع" icon={ArrowUpCircle} onClose={() => setShowDeposit(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">نوع الإيداع</label>
              <select className="input-field">
                <option value="bank">إيداع بنكي</option>
                <option value="rider">توريد من مندوب</option>
                <option value="owner">إيداع مالك</option>
                <option value="other">أخرى</option>
              </select>
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">المبلغ</label>
              <input type="number" placeholder="0" className="input-field text-center text-lg font-bold" />
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">المرجع</label>
              <input type="text" placeholder="رقم مرجعي أو اسم المندوب" className="input-field" />
            </div>
          </div>
          <button
            onClick={() => { setShowDeposit(false); showToast('تم تسجيل التوريد النقدي', 'success'); }}
            className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            تأكيد الإيداع
          </button>
        </Modal>
      )}

      {/* Z-Report Modal */}
      {showZReport && (
        <Modal title="إقفال اليومية - تقرير Z" icon={FileText} onClose={() => setShowZReport(false)}>
          <div className="space-y-4">
            <div className="bg-navy-900/50 rounded-xl border border-navy-700/40 divide-y divide-navy-700/30">
              <ReportRow label="رصيد افتتاحي" value={formatCurrency(2000)} />
              <ReportRow label="إجمالي المقبوضات" value={formatCurrency(cashIn)} success />
              <ReportRow label="إجمالي المصروفات" value={formatCurrency(cashOut)} danger />
              <ReportRow label="الرصيد المتوقع" value={formatCurrency(2000 + cashIn - cashOut)} />
              <ReportRow label="الرصيد الفعلي بالخزينة" value={formatCurrency(currentBalance)} highlight />
              {currentBalance !== (2000 + cashIn - cashOut) && (
                <div className="px-4 py-3 bg-danger-500/5 border-t border-danger-500/20">
                  <p className="text-danger-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    فرق: {formatCurrency(currentBalance - (2000 + cashIn - cashOut))}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">ملاحظات الإقفال</label>
              <textarea className="input-field min-h-20 resize-none" placeholder="ملاحظات الإقفال..." />
            </div>
          </div>
          <button
            onClick={() => { setShowZReport(false); showToast('تم إقفال اليومية بنجاح', 'success'); }}
            className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            تأكيد الإقفال
          </button>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, icon: Icon, onClose, children }: { title: string; icon: typeof Wallet; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-card w-full max-w-md animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Icon className="w-5 h-5 text-brand-400" />
            {title}
          </h3>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ReportRow({ label, value, highlight, success, danger }: { label: string; value: string; highlight?: boolean; success?: boolean; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-navy-400 text-sm">{label}</span>
      <span className={`text-sm font-mono font-bold ${danger ? 'text-danger-400' : success ? 'text-success-400' : highlight ? 'text-brand-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
