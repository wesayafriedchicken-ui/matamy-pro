import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Wallet, CalendarClock, CheckSquare, Users, Clock,
  TrendingUp, TrendingDown, DollarSign, X, Receipt,
  CheckCircle2, Download, Briefcase,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

interface PayrollRecord {
  id: string;
  employeeNameAr: string;
  roleAr: string;
  baseSalary: number;
  totalHours: number;
  overtimeHours: number;
  deductions: number;
  incentives: number;
  paid: boolean;
}

const mockPayroll: PayrollRecord[] = [
  { id: 'p1', employeeNameAr: 'أحمد علي', roleAr: 'طباخ', baseSalary: 8000, totalHours: 176, overtimeHours: 12, deductions: 0, incentives: 500, paid: false },
  { id: 'p2', employeeNameAr: 'سارة حسن', roleAr: 'كاشير', baseSalary: 6000, totalHours: 168, overtimeHours: 8, deductions: 200, incentives: 300, paid: false },
  { id: 'p3', employeeNameAr: 'محمود إبراهيم', roleAr: 'جرسون', baseSalary: 5000, totalHours: 160, overtimeHours: 0, deductions: 0, incentives: 200, paid: true },
  { id: 'p4', employeeNameAr: 'فاطمة نور', roleAr: 'مساعد مطبخ', baseSalary: 4500, totalHours: 176, overtimeHours: 4, deductions: 0, incentives: 150, paid: false },
  { id: 'p5', employeeNameAr: 'خالد سامي', roleAr: 'مندوب', baseSalary: 5500, totalHours: 168, overtimeHours: 16, deductions: 100, incentives: 400, paid: false },
  { id: 'p6', employeeNameAr: 'عمر يوسف', roleAr: 'مدير', baseSalary: 12000, totalHours: 160, overtimeHours: 0, deductions: 0, incentives: 1000, paid: true },
];

const overtimeRate = 50;
const hourRate = (base: number) => base / 176;

export default function ShiftPayroll() {
  const { showToast } = useApp();
  const [payroll, setPayroll] = useState<PayrollRecord[]>(mockPayroll);
  const [period, setPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [payRecord, setPayRecord] = useState<PayrollRecord | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const netPayable = (r: PayrollRecord) =>
    r.baseSalary + r.overtimeHours * overtimeRate + r.incentives - r.deductions;

  const totalPayroll = payroll.reduce((s, r) => s + netPayable(r), 0);
  const totalHours = payroll.reduce((s, r) => s + r.totalHours, 0);
  const totalOvertime = payroll.reduce((s, r) => s + r.overtimeHours, 0);
  const totalDeductions = payroll.reduce((s, r) => s + r.deductions, 0);
  const paidCount = payroll.filter((r) => r.paid).length;

  const handlePay = (record: PayrollRecord) => {
    setPayroll((prev) => prev.map((r) => r.id === record.id ? { ...r, paid: true } : r));
    setPayRecord(record);
    setShowReceipt(true);
    showToast(`تم اعتماد صرف راتب ${record.employeeNameAr}`, 'success');
  };

  const months = [
    { value: '2026-09', label: 'سبتمبر 2026' },
    { value: '2026-08', label: 'أغسطس 2026' },
    { value: '2026-07', label: 'يوليو 2026' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="الورديات والمهام" description="الرواتب وساعات العمل والاستقطاعات" />

      {/* Sub-route nav */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit">
        <Link to="/shifts/schedule" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <CalendarClock className="w-4 h-4" />
          الجدولة والحضور
        </Link>
        <Link to="/shifts/tasks" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <CheckSquare className="w-4 h-4" />
          المهام وتسليم الشيفت
        </Link>
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <Wallet className="w-4 h-4" />
          الرواتب والساعات
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign} label="إجمالي الرواتب المستحقة" value={formatCurrency(totalPayroll)} color="brand" />
        <StatCard icon={Clock} label="إجمالي ساعات العمل" value={`${totalHours} س`} color="blue" />
        <StatCard icon={TrendingUp} label="ساعات إضافية" value={`${totalOvertime} س`} color="success" />
        <StatCard icon={TrendingDown} label="استقطاعات" value={formatCurrency(totalDeductions)} color="danger" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-1 p-1 bg-navy-800/60 rounded-xl">
          <button onClick={() => setPeriod('month')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === 'month' ? 'bg-brand-500 text-white' : 'text-navy-400 hover:text-white'}`}>
            شهري
          </button>
          <button onClick={() => setPeriod('week')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === 'week' ? 'bg-brand-500 text-white' : 'text-navy-400 hover:text-white'}`}>
            أسبوعي
          </button>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="input-field w-auto"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <span className="text-navy-400 text-sm mr-auto">
          {paidCount} من {payroll.length} تم صرفها
        </span>
      </div>

      {/* Payroll Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-700/50">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" />
            كشف الرواتب - {months.find((m) => m.value === selectedMonth)?.label}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-700/50">
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الموظف والوظيفة</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الراتب الأساسي</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">ساعات العمل</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">ساعات إضافية</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">استقطاعات</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">بدلات ومكافآت</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">صافي الراتب</th>
                <th className="text-center text-navy-400 text-xs font-medium px-5 py-3">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {payroll.map((record) => {
                const net = netPayable(record);
                const overtimePay = record.overtimeHours * overtimeRate;
                return (
                  <tr key={record.id} className="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-600 to-navy-700 flex items-center justify-center text-white font-bold text-sm">
                          {record.employeeNameAr.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{record.employeeNameAr}</p>
                          <p className="text-navy-400 text-xs flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {record.roleAr}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white text-sm font-mono font-bold">{formatCurrency(record.baseSalary)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-navy-200 text-sm font-mono">{record.totalHours} س</span>
                      <p className="text-navy-500 text-xs font-mono">{Math.round(hourRate(record.baseSalary))} ج/س</p>
                    </td>
                    <td className="px-5 py-4">
                      {record.overtimeHours > 0 ? (
                        <div>
                          <span className="text-success-400 text-sm font-mono font-bold">{record.overtimeHours} س</span>
                          <p className="text-navy-500 text-xs font-mono">+{formatCurrency(overtimePay)}</p>
                        </div>
                      ) : (
                        <span className="text-navy-500 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {record.deductions > 0 ? (
                        <span className="text-danger-400 text-sm font-mono font-bold">-{formatCurrency(record.deductions)}</span>
                      ) : (
                        <span className="text-navy-500 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {record.incentives > 0 ? (
                        <span className="text-success-400 text-sm font-mono font-bold">+{formatCurrency(record.incentives)}</span>
                      ) : (
                        <span className="text-navy-500 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-brand-400 text-base font-mono font-bold">{formatCurrency(net)}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {record.paid ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-success-500/10 text-success-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تم الصرف
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePay(record)}
                          className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          صرف واعتماد
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-navy-700/50 bg-navy-900/50">
                <td className="px-5 py-4" colSpan={6}>
                  <span className="text-white font-bold text-sm">الإجمالي العام</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-brand-400 text-lg font-mono font-bold">{formatCurrency(totalPayroll)}</span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {payRecord && showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => { setShowReceipt(false); setPayRecord(null); }}>
          <div className="glass-card w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-navy-700/50 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5 text-success-400" />
                إيصال صرف راتب
              </h3>
              <button onClick={() => { setShowReceipt(false); setPayRecord(null); }} className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center py-3">
                <div className="w-16 h-16 rounded-full bg-success-500/15 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-success-400" />
                </div>
                <p className="text-white font-bold text-lg">تم اعتماد صرف الراتب</p>
                <p className="text-navy-400 text-sm">إيصال رقم: PAY-{Date.now().toString().slice(-6)}</p>
              </div>

              <div className="bg-navy-900/50 rounded-xl border border-navy-700/40 divide-y divide-navy-700/30">
                <ReceiptRow label="اسم الموظف" value={payRecord.employeeNameAr} />
                <ReceiptRow label="الوظيفة" value={payRecord.roleAr} />
                <ReceiptRow label="الراتب الأساسي" value={formatCurrency(payRecord.baseSalary)} />
                <ReceiptRow label="ساعات العمل الفعلية" value={`${payRecord.totalHours} ساعة`} />
                <ReceiptRow label="ساعات إضافية" value={`${payRecord.overtimeHours} س × ${overtimeRate} ج = ${formatCurrency(payRecord.overtimeHours * overtimeRate)}`} />
                {payRecord.deductions > 0 && <ReceiptRow label="استقطاعات" value={`-${formatCurrency(payRecord.deductions)}`} danger />}
                {payRecord.incentives > 0 && <ReceiptRow label="بدلات ومكافآت" value={`+${formatCurrency(payRecord.incentives)}`} success />}
                <ReceiptRow label="صافي الراتب المصروف" value={formatCurrency(netPayable(payRecord))} highlight />
                <ReceiptRow label="تاريخ الصرف" value={new Date().toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-navy-700/50 flex gap-3">
              <button
                onClick={() => { setShowReceipt(false); setPayRecord(null); showToast('تم تصدير الإيصال', 'success'); }}
                className="btn-ghost flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                تصدير
              </button>
              <button
                onClick={() => { setShowReceipt(false); setPayRecord(null); }}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                تم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptRow({ label, value, highlight, danger, success }: { label: string; value: string; highlight?: boolean; danger?: boolean; success?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-navy-400 text-sm">{label}</span>
      <span className={`text-sm font-mono font-bold ${danger ? 'text-danger-400' : success ? 'text-success-400' : highlight ? 'text-brand-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
