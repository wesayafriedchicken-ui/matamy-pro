import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { PayrollRecord } from '@/types';
import {
  Wallet, CalendarClock, CheckSquare, Users, Clock,
  DollarSign, X, Receipt, CheckCircle2, Download,
  ExternalLink, Plus, Check,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

export default function ShiftPayroll() {
  const { employees, shifts, payrollRecords, disbursePayroll } = useApp();

  const [period, setPeriod] = useState<'month' | 'week'>('month');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [payRecord, setPayRecord] = useState<PayrollRecord | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Dynamic Payroll calculation based on actual Employees + Shifts
  const dynamicPayroll = useMemo(() => {
    return employees.map((emp) => {
      // Find shifts for this employee in selected month
      const empShifts = shifts.filter((s) => {
        const matchesEmployee = s.employeeId === emp.id || s.employeeNameAr === emp.nameAr;
        const matchesMonth = s.date.startsWith(selectedMonth);
        return matchesEmployee && matchesMonth;
      });

      // Calculate hours from shifts or fallback to contract standard
      const recordedHours = empShifts.reduce((acc, s) => acc + (s.hoursWorked || 0), 0);
      const totalHours = recordedHours > 0 ? recordedHours : (emp.contractType === 'full_time' ? 176 : 80);
      const overtimeHours = empShifts.reduce((acc, s) => acc + (s.overtimeHours || 0), 0);

      // Check if existing saved record exists in database
      const savedRecord = payrollRecords.find(
        (r) => (r.employeeId === emp.id || r.employeeNameAr === emp.nameAr) && r.period === selectedMonth
      );

      const baseSalary = emp.baseSalary || 0;
      const incentives = savedRecord ? savedRecord.incentives : (emp.monthlyIncentives || 0);
      const deductions = savedRecord ? savedRecord.deductions : 0;
      const overtimePay = overtimeHours * (emp.overtimeRate || 50);
      const netSalary = Math.max(0, baseSalary + overtimePay + incentives - deductions);
      const paid = savedRecord ? savedRecord.paid : false;

      const record: PayrollRecord = {
        id: savedRecord ? savedRecord.id : `payroll-${emp.id}-${selectedMonth}`,
        employeeId: emp.id,
        employeeNameAr: emp.nameAr,
        roleAr: emp.roleAr,
        period: selectedMonth,
        baseSalary,
        totalHours,
        overtimeHours,
        deductions,
        incentives,
        netSalary,
        paid,
        paidAt: savedRecord?.paidAt,
        paymentMethod: savedRecord?.paymentMethod || 'cash',
      };

      return record;
    });
  }, [employees, shifts, payrollRecords, selectedMonth]);

  const totalPayroll = dynamicPayroll.reduce((s, r) => s + r.netSalary, 0);
  const totalHours = dynamicPayroll.reduce((s, r) => s + r.totalHours, 0);
  const totalOvertime = dynamicPayroll.reduce((s, r) => s + r.overtimeHours, 0);
  const totalDeductions = dynamicPayroll.reduce((s, r) => s + r.deductions, 0);
  const paidCount = dynamicPayroll.filter((r) => r.paid).length;

  const handlePay = async (record: PayrollRecord) => {
    await disbursePayroll(record);
    setPayRecord({ ...record, paid: true, paidAt: new Date().toISOString() });
    setShowReceipt(true);
  };

  const months = [
    { value: '2026-09', label: 'سبتمبر 2026' },
    { value: '2026-08', label: 'أغسطس 2026' },
    { value: '2026-07', label: 'يوليو 2026' },
    { value: '2026-06', label: 'يونيو 2026' },
  ];

  return (
    <div className="animate-fade-in pb-12">
      <PageHeader
        title="الورديات والمهام"
        subtitle="كشف الرواتب وساعات العمل والاستقطاعات المربوطة بسجل الموظفين والورديات"
      />

      {/* Sub-Route Navigation (4 Dedicated Tabs) */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit flex-wrap border border-navy-700/60">
        <Link
          to="/shifts/schedule"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all"
        >
          <CalendarClock className="w-4 h-4" />
          <span>الجدولة والحضور</span>
        </Link>

        <Link
          to="/shifts/employees"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all"
        >
          <Users className="w-4 h-4" />
          <span>سجل الموظفين ({employees.length})</span>
        </Link>

        <Link
          to="/shifts/tasks"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all"
        >
          <CheckSquare className="w-4 h-4" />
          <span>المهام وتسليم الشيفت</span>
        </Link>

        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <Wallet className="w-4 h-4" />
          <span>الرواتب والساعات</span>
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={DollarSign}
          label="إجمالي الرواتب المستحقة"
          value={formatCurrency(totalPayroll)}
          color="brand"
        />
        <StatCard
          icon={Clock}
          label="إجمالي ساعات العمل"
          value={`${totalHours} س`}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="ساعات إضافية"
          value={`${totalOvertime} س`}
          color="success"
        />
        <StatCard
          icon={DollarSign}
          label="استقطاعات وجزاءات"
          value={formatCurrency(totalDeductions)}
          color="danger"
        />
      </div>

      {/* Filter and Period Selection */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <span className="text-xs text-navy-400">
          تم صرف واعتماد رواتب ({paidCount} من {dynamicPayroll.length}) موظف
        </span>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field text-xs py-2 bg-navy-900 border-navy-700 font-mono"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 bg-navy-800/60 rounded-xl border border-navy-700/60">
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === 'month' ? 'bg-brand-500 text-white' : 'text-navy-400 hover:text-white'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === 'week' ? 'bg-brand-500 text-white' : 'text-navy-400 hover:text-white'
              }`}
            >
              أسبوعي
            </button>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      {dynamicPayroll.length === 0 ? (
        <div className="glass-card p-12 text-center border border-dashed border-navy-700/80 rounded-2xl mb-6">
          <Wallet className="w-12 h-12 text-navy-500 mx-auto mb-3" />
          <h3 className="text-white font-bold text-base mb-1">لا توجد بيانات موظفين مسجلة لحساب الرواتب</h3>
          <p className="text-navy-400 text-xs max-w-sm mx-auto mb-5">
            يقرأ كشف الرواتب تلقائياً من صفحة سجل الموظفين بناءً على الراتب الأساسي وساعات الورديات المسجلة.
          </p>
          <Link
            to="/shifts/employees"
            className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة موظفين في سجل الموظفين</span>
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden border border-navy-700/60">
          <div className="px-5 py-4 border-b border-navy-700/50 flex items-center justify-between">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" />
              <span>كشف الرواتب - {months.find((m) => m.value === selectedMonth)?.label}</span>
            </h3>
            <span className="text-xs text-navy-400">
              يُحسب الصافي تلقائياً (الأساسي + الإضافي + البدلات - الاستقطاعات)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-navy-700/50 bg-navy-900/50">
                  <th className="text-navy-400 font-medium px-5 py-3">الموظف والوظيفة</th>
                  <th className="text-navy-400 font-medium px-5 py-3">الراتب الأساسي</th>
                  <th className="text-navy-400 font-medium px-5 py-3">ساعات العمل</th>
                  <th className="text-navy-400 font-medium px-5 py-3">ساعات إضافية</th>
                  <th className="text-navy-400 font-medium px-5 py-3">استقطاعات</th>
                  <th className="text-navy-400 font-medium px-5 py-3">بدلات ومكافآت</th>
                  <th className="text-navy-400 font-medium px-5 py-3">صافي الراتب</th>
                  <th className="text-navy-400 font-medium px-5 py-3 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {dynamicPayroll.map((rec) => {
                  return (
                    <tr key={rec.id} className="hover:bg-navy-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-navy-700/60 flex items-center justify-center font-bold text-white text-xs">
                            {rec.employeeNameAr.charAt(0)}
                          </div>
                          <div>
                            <Link
                              to={`/shifts/employees/${rec.employeeId}`}
                              className="font-bold text-white hover:text-brand-400 transition-colors flex items-center gap-1"
                            >
                              <span>{rec.employeeNameAr}</span>
                              <ExternalLink className="w-3 h-3 text-navy-400" />
                            </Link>
                            <span className="text-[11px] text-navy-400">{rec.roleAr}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono font-medium text-white">
                        {formatCurrency(rec.baseSalary)}
                      </td>

                      <td className="px-5 py-4 font-mono text-navy-300">
                        {rec.totalHours} س
                      </td>

                      <td className="px-5 py-4 font-mono text-emerald-400">
                        {rec.overtimeHours > 0 ? (
                          <span>
                            {rec.overtimeHours} س
                            <span className="text-[10px] text-navy-400 block font-normal">
                              +{formatCurrency(rec.overtimeHours * 50)}
                            </span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono text-danger-400">
                        {rec.deductions > 0 ? `-${formatCurrency(rec.deductions)}` : '—'}
                      </td>

                      <td className="px-5 py-4 font-mono text-emerald-400">
                        {rec.incentives > 0 ? `+${formatCurrency(rec.incentives)}` : '—'}
                      </td>

                      <td className="px-5 py-4 font-mono font-bold text-brand-400 text-sm">
                        {formatCurrency(rec.netSalary)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {rec.paid ? (
                          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-success-500/10 text-success-400 border border-success-500/20 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تم الصرف</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePay(rec)}
                            className="btn-primary py-1.5 px-4 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-brand-500/20"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>صرف واعتماد</span>
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
      )}

      {/* ==================================================== */}
      {/* Payslip Receipt Modal */}
      {/* ==================================================== */}
      {showReceipt && payRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowReceipt(false)}
        >
          <div
            className="glass-card w-full max-w-md p-6 border border-navy-700 shadow-2xl rounded-2xl animate-scale-in text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-400" />
                <h3 className="text-white font-bold text-base">سند صرف راتب معتمد</h3>
              </div>
              <button onClick={() => setShowReceipt(false)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="p-3 rounded-xl bg-navy-900/80 border border-navy-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-navy-400">اسم الموظف:</span>
                  <span className="text-white font-bold">{payRecord.employeeNameAr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">الوظيفة:</span>
                  <span className="text-navy-200">{payRecord.roleAr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">الفترة المستحقة:</span>
                  <span className="text-brand-300 font-mono">{payRecord.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">تاريخ وساعة الصرف:</span>
                  <span className="text-navy-300 font-mono">
                    {new Date().toLocaleDateString('ar-EG')} - {new Date().toLocaleTimeString('ar-EG')}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-navy-900/40 border border-navy-800/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-navy-400">الراتب الأساسي:</span>
                  <span className="font-mono text-white">{formatCurrency(payRecord.baseSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">ساعات إضافية ({payRecord.overtimeHours} س):</span>
                  <span className="font-mono text-emerald-400">+{formatCurrency(payRecord.overtimeHours * 50)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">بدلات ومكافآت:</span>
                  <span className="font-mono text-emerald-400">+{formatCurrency(payRecord.incentives)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">استقطاعات وجزاءات:</span>
                  <span className="font-mono text-danger-400">-{formatCurrency(payRecord.deductions)}</span>
                </div>
                <div className="pt-2 border-t border-navy-800 flex justify-between font-bold text-sm">
                  <span className="text-white">الصافي المنصرف:</span>
                  <span className="font-mono text-brand-400">{formatCurrency(payRecord.netSalary)}</span>
                </div>
              </div>

              <p className="text-[11px] text-navy-400 text-center">
                تم تسجيل المعاملة كمصروف في شاشة الخزينة اليومية وحسابات الرواتب.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="btn-ghost flex-1 py-2 text-xs font-bold border border-navy-700 flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>طباعة السند</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceipt(false)}
                className="btn-primary flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>تم الاعتماد</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
