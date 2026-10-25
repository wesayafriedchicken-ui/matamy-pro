import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Wallet, TrendingUp, TrendingDown,
  ArrowUpCircle, ArrowDownCircle, Save, X, FileText,
  Receipt, AlertCircle, CheckCircle2, Clock, User,
  BookOpen, BarChart3, Percent, RotateCcw,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import VatSettingsCard from '@/components/finance/VatSettingsCard';

export interface CashMovement {
  id: string;
  refNo: string;
  time: string;
  type: 'sales' | 'rider_deposit' | 'purchase' | 'maintenance' | 'deposit' | 'petty';
  typeAr: string;
  amount: number;
  responsible: string;
  notes?: string;
  balanceAfter: number;
}

const movementTypeConfig: Record<string, { color: string; bg: string; icon: typeof ArrowUpCircle }> = {
  sales: { color: 'text-success-400', bg: 'bg-success-500/15', icon: ArrowUpCircle },
  rider_deposit: { color: 'text-blue-400', bg: 'bg-blue-500/15', icon: ArrowUpCircle },
  purchase: { color: 'text-danger-400', bg: 'bg-danger-500/15', icon: ArrowDownCircle },
  maintenance: { color: 'text-warning-400', bg: 'bg-warning-500/15', icon: ArrowDownCircle },
  deposit: { color: 'text-success-400', bg: 'bg-success-500/15', icon: ArrowUpCircle },
  petty: { color: 'text-danger-400', bg: 'bg-danger-500/15', icon: ArrowDownCircle },
};

export default function CashDrawer() {
  const { showToast, taxRate, addTransaction, currentUser } = useApp();

  // Load real persistent movements from localStorage, defaulting to empty array (ZERO fake data)
  const [movements, setMovements] = useState<CashMovement[]>(() => {
    try {
      const saved = localStorage.getItem('nine_fries_cash_movements_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return []; // Zero fake data by default
  });

  // Modals state
  const [showPetty, setShowPetty] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showZReport, setShowZReport] = useState(false);
  const [showVatSettings, setShowVatSettings] = useState(false);

  // Form states for Petty Cash
  const [pettyCategory, setPettyCategory] = useState('supplies');
  const [pettyAmount, setPettyAmount] = useState('');
  const [pettyResponsible, setPettyResponsible] = useState(currentUser?.nameAr || '');
  const [pettyNotes, setPettyNotes] = useState('');

  // Form states for Cash Deposit
  const [depositType, setDepositType] = useState('deposit');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositRef, setDepositRef] = useState(currentUser?.nameAr || '');
  const [depositNotes, setDepositNotes] = useState('');

  // Sync movements to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nine_fries_cash_movements_v2', JSON.stringify(movements));
    } catch {
      // ignore
    }
  }, [movements]);

  const currentBalance = movements.length > 0 ? movements[movements.length - 1].balanceAfter : 0;
  const cashIn = movements.filter((m) => m.amount > 0).reduce((s, m) => s + m.amount, 0);
  const cashOut = movements.filter((m) => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0);

  // Initial opening balance is the first deposit if any, or 0
  const openingDeposit = movements.length > 0 && movements[0].type === 'deposit' ? movements[0].amount : 0;

  // Handle Adding Petty Expense
  const handleSavePetty = async () => {
    const amt = parseFloat(pettyAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('يرجى إدخال مبلغ صحيح للمصروف النثري', 'warning');
      return;
    }

    const typeArMap: Record<string, string> = {
      maintenance: 'صيانة ومعدات',
      supplies: 'مستلزمات ونثريات',
      transport: 'انتقالات ومواصلات',
      cleaning: 'مواد نظافة',
      other: 'مصروفات نثرية أخرى',
    };

    const typeAr = typeArMap[pettyCategory] || 'مصروف نثري';
    const newBalance = currentBalance - amt;

    const newMv: CashMovement = {
      id: `cm-${Date.now()}`,
      refNo: `CM-${String(movements.length + 1).padStart(3, '0')}`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      type: 'petty',
      typeAr,
      amount: -amt,
      responsible: pettyResponsible.trim() || currentUser?.nameAr || 'المسؤول',
      notes: pettyNotes.trim(),
      balanceAfter: newBalance,
    };

    setMovements((prev) => [...prev, newMv]);

    // Mirror to AppContext transactions and Supabase database
    await addTransaction({
      id: newMv.id,
      type: 'expense',
      category: 'Petty Expense',
      categoryAr: typeAr,
      amount: amt,
      description: pettyNotes ? `مصروف نثري: ${pettyNotes}` : typeAr,
      descriptionAr: pettyNotes ? `مصروف نثري: ${pettyNotes}` : typeAr,
      date: new Date().toISOString(),
      method: 'cash',
    });

    setPettyAmount('');
    setPettyNotes('');
    setShowPetty(false);
    showToast('تم تسجيل المصروف النثري وخصمه من الخزينة بنجاح', 'success');
  };

  // Handle Adding Deposit / Cash-in
  const handleSaveDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('يرجى إدخال مبلغ إيداع صحيح', 'warning');
      return;
    }

    const depositLabels: Record<string, string> = {
      deposit: 'إيداع افتتاحي / نقدي',
      rider_deposit: 'توريد عهدة من مندوب',
      sales: 'مبيعات نقدية مجمعة',
      owner: 'تمويل إضافي / المالك',
      other: 'توريد نقدي آخر',
    };

    const typeAr = depositLabels[depositType] || 'توريد نقدية';
    const mvType = depositType === 'rider_deposit' ? 'rider_deposit' : depositType === 'sales' ? 'sales' : 'deposit';
    const newBalance = currentBalance + amt;

    const newMv: CashMovement = {
      id: `cm-${Date.now()}`,
      refNo: `CM-${String(movements.length + 1).padStart(3, '0')}`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      type: mvType,
      typeAr,
      amount: amt,
      responsible: depositRef.trim() || currentUser?.nameAr || 'المسؤول',
      notes: depositNotes.trim(),
      balanceAfter: newBalance,
    };

    setMovements((prev) => [...prev, newMv]);

    // Mirror to AppContext transactions and Supabase database
    await addTransaction({
      id: newMv.id,
      type: 'income',
      category: 'Cash Drawer Deposit',
      categoryAr: typeAr,
      amount: amt,
      description: depositNotes ? `توريد خزينة: ${depositNotes}` : typeAr,
      descriptionAr: depositNotes ? `توريد خزينة: ${depositNotes}` : typeAr,
      date: new Date().toISOString(),
      method: 'cash',
    });

    setDepositAmount('');
    setDepositNotes('');
    setShowDeposit(false);
    showToast('تم تسجيل التوريد النقدي وحفظه بالخزينة وقاعدة البيانات', 'success');
  };

  // Reset Drawer (Clear all movements to 0)
  const handleResetDrawer = () => {
    if (window.confirm('هل أنت متأكد من تصفير سجل الخزينة بالكامل؟ سيبدأ الرصيد من 0.00 ج.م.')) {
      setMovements([]);
      localStorage.removeItem('nine_fries_cash_movements_v2');
      showToast('تم تصفير الخزينة بنجاح، الرصيد الآن 0.00 ج.م', 'info');
    }
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

      {/* Real KPI Cards - ZERO fake data */}
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
        {movements.length > 0 && (
          <button
            onClick={handleResetDrawer}
            className="btn-ghost text-xs text-navy-400 hover:text-danger-400 mr-auto flex items-center gap-1.5"
            title="تصفير الخزينة"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            تصفير الخزينة
          </button>
        )}
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

        {movements.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800/80 border border-navy-700 flex items-center justify-center mx-auto mb-4 text-navy-400">
              <Wallet className="w-8 h-8 text-brand-400" />
            </div>
            <h4 className="text-white font-bold text-lg mb-1">الخزينة فارغة (0.00 ج.م)</h4>
            <p className="text-navy-400 text-sm max-w-md mx-auto mb-5">
              لا توجد حركات نقدية مسجلة بعد. يمكنك تسجيل رصيد افتتاحي أو توريد نقدية لبدء الحركة اليومية.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setDepositType('deposit');
                  setShowDeposit(true);
                }}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <ArrowUpCircle className="w-4 h-4" />
                إيداع رصيد افتتاحي
              </button>
              <button
                onClick={() => setShowPetty(true)}
                className="btn-ghost flex items-center gap-2 text-sm text-navy-300"
              >
                <ArrowDownCircle className="w-4 h-4" />
                تسجيل مصروف نثري
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700/50">
                  <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">رقم الحركة</th>
                  <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الوقت</th>
                  <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">نوع الحركة</th>
                  <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">المبلغ</th>
                  <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">المسؤول</th>
                  <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">ملاحظات</th>
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
                        <span className="text-navy-400 text-xs">{mv.notes || '—'}</span>
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
        )}
      </div>

      {/* Petty Expense Modal */}
      {showPetty && (
        <Modal title="تسجيل مصروف نثري" icon={ArrowDownCircle} onClose={() => setShowPetty(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">بند الصرف</label>
              <select
                value={pettyCategory}
                onChange={(e) => setPettyCategory(e.target.value)}
                className="input-field"
              >
                <option value="supplies">مستلزمات نثرية وتشغيل</option>
                <option value="maintenance">صيانة معدات المطعم</option>
                <option value="transport">مواصلات وانتقالات</option>
                <option value="cleaning">مواد تنظيف وتعقيم</option>
                <option value="other">مصروفات أخرى</option>
              </select>
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">المبلغ (ج.م)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={pettyAmount}
                onChange={(e) => setPettyAmount(e.target.value)}
                placeholder="0"
                className="input-field text-center text-lg font-bold"
                autoFocus
              />
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">الموظف المسؤول</label>
              <input
                type="text"
                value={pettyResponsible}
                onChange={(e) => setPettyResponsible(e.target.value)}
                placeholder="اسم المستلم أو الموظف"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">ملاحظات / بيان المصروف</label>
              <textarea
                value={pettyNotes}
                onChange={(e) => setPettyNotes(e.target.value)}
                className="input-field min-h-16 resize-none"
                placeholder="تفاصيل المصروف..."
              />
            </div>
          </div>
          <button
            onClick={handleSavePetty}
            className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            تأكيد الصرف وحفظ الحركة
          </button>
        </Modal>
      )}

      {/* Deposit Modal */}
      {showDeposit && (
        <Modal title="توريد نقدية / إيداع" icon={ArrowUpCircle} onClose={() => setShowDeposit(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">نوع الإيداع</label>
              <select
                value={depositType}
                onChange={(e) => setDepositType(e.target.value)}
                className="input-field"
              >
                <option value="deposit">إيداع افتتاحي بالخزينة</option>
                <option value="rider_deposit">توريد عهدة نقدية من مندوب</option>
                <option value="sales">مبيعات نقدية مجمعة</option>
                <option value="owner">إيداع / تمويل من المالك</option>
                <option value="other">توريد نقدي آخر</option>
              </select>
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">المبلغ (ج.م)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0"
                className="input-field text-center text-lg font-bold"
                autoFocus
              />
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">المسؤول / المرجع</label>
              <input
                type="text"
                value={depositRef}
                onChange={(e) => setDepositRef(e.target.value)}
                placeholder="رقم مرجعي أو اسم المودع"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">ملاحظات الإيداع</label>
              <textarea
                value={depositNotes}
                onChange={(e) => setDepositNotes(e.target.value)}
                className="input-field min-h-16 resize-none"
                placeholder="تفاصيل التوريد..."
              />
            </div>
          </div>
          <button
            onClick={handleSaveDeposit}
            className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            تأكيد الإيداع وحفظ الحركة
          </button>
        </Modal>
      )}

      {/* Z-Report Modal */}
      {showZReport && (
        <Modal title="إقفال اليومية - تقرير Z" icon={FileText} onClose={() => setShowZReport(false)}>
          <div className="space-y-4">
            <div className="bg-navy-900/50 rounded-xl border border-navy-700/40 divide-y divide-navy-700/30">
              <ReportRow label="رصيد افتتاحي" value={formatCurrency(openingDeposit)} />
              <ReportRow label="إجمالي المقبوضات النقدية" value={formatCurrency(cashIn)} success />
              <ReportRow label="إجمالي المصروفات النثرية" value={formatCurrency(cashOut)} danger />
              <ReportRow label="الرصيد المتوقع بالخزينة" value={formatCurrency(cashIn - cashOut)} />
              <ReportRow label="الرصيد الفعلي التراكمي" value={formatCurrency(currentBalance)} highlight />
              {currentBalance !== (cashIn - cashOut) && (
                <div className="px-4 py-3 bg-danger-500/5 border-t border-danger-500/20">
                  <p className="text-danger-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    فرق حسابي: {formatCurrency(currentBalance - (cashIn - cashOut))}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-1.5 block">ملاحظات الإقفال</label>
              <textarea className="input-field min-h-20 resize-none" placeholder="ملاحظات مسؤول الخزينة..." />
            </div>
          </div>
          <button
            onClick={() => { setShowZReport(false); showToast('تم إقفال اليومية بنجاح واعتماد الأرصدة', 'success'); }}
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
