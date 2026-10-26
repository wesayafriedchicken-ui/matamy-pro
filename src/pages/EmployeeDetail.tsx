import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Shift, Employee } from '@/types';
import {
  ArrowRight,
  Copy,
  Check,
  CalendarClock,
  Clock,
  DollarSign,
  Plus,
  Edit2,
  FileText,
  UserCheck,
  AlertTriangle,
  CreditCard,
  Calendar,
} from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import { formatCurrency } from '@/utils/helpers';

export default function EmployeeDetail() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const { employees, shifts, addShift, updateShift, updateEmployee, showToast } = useApp();

  const employee = useMemo(() => {
    return employees.find((e) => e.id === employeeId);
  }, [employees, employeeId]);

  // Shifts for this specific employee
  const employeeShifts = useMemo(() => {
    if (!employee) return [];
    return shifts.filter(
      (s) => s.employeeId === employee.id || s.employeeNameAr === employee.nameAr
    );
  }, [shifts, employee]);

  // Copy route URL
  const [copied, setCopied] = useState(false);

  // Quick Shift Modal
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [newShiftDate, setNewShiftDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newShiftStart, setNewShiftStart] = useState('08:00');
  const [newShiftEnd, setNewShiftEnd] = useState('16:00');

  // Quick Attendance Modal
  const [selectedShiftForAttendance, setSelectedShiftForAttendance] = useState<Shift | null>(null);
  const [checkInTime, setCheckInTime] = useState('08:00');
  const [checkOutTime, setCheckOutTime] = useState('16:00');
  const [geofenceStatus, setGeofenceStatus] = useState<Shift['geofenceStatus']>('in_range');

  // Edit employee modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nameAr, setNameAr] = useState('');
  const [phone, setPhone] = useState('');
  const [roleAr, setRoleAr] = useState('');
  const [baseSalary, setBaseSalary] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [overtimeRate, setOvertimeRate] = useState(0);
  const [monthlyIncentives, setMonthlyIncentives] = useState(0);
  const [status, setStatus] = useState<Employee['status']>('active');

  // Statistics calculation
  const totalWorkedHours = employeeShifts.reduce((acc, s) => acc + (s.hoursWorked || 0), 0);
  const totalOvertimeHours = employeeShifts.reduce((acc, s) => acc + (s.overtimeHours || 0), 0);
  const activeOrScheduledShifts = employeeShifts.filter((s) => s.status === 'active' || s.status === 'scheduled').length;

  if (!employee) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-danger-500/15 text-danger-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">الموظف غير موجود أو تم حذفه</h2>
        <p className="text-navy-400 text-sm">
          المسار المطلوب: <span className="font-mono text-brand-400">/shifts/employees/{employeeId}</span>
        </p>
        <Link to="/shifts/employees" className="btn-primary inline-flex items-center gap-2 mt-4">
          <ArrowRight className="w-4 h-4" />
          <span>العودة لسجل الموظفين</span>
        </Link>
      </div>
    );
  }

  const rolePath = `/shifts/employees/${employee.id}`;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(rolePath);
    setCopied(true);
    showToast(`تم نسخ مسار صفحة الموظف: ${rolePath}`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEdit = () => {
    setNameAr(employee.nameAr);
    setPhone(employee.phone);
    setRoleAr(employee.roleAr);
    setBaseSalary(employee.baseSalary);
    setHourlyRate(employee.hourlyRate);
    setOvertimeRate(employee.overtimeRate);
    setMonthlyIncentives(employee.monthlyIncentives || 0);
    setStatus(employee.status);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateEmployee({
      ...employee,
      nameAr,
      phone,
      roleAr,
      baseSalary: Number(baseSalary) || 0,
      hourlyRate: Number(hourlyRate) || 0,
      overtimeRate: Number(overtimeRate) || 0,
      monthlyIncentives: Number(monthlyIncentives) || 0,
      status,
      updatedAt: new Date().toISOString(),
    });
    setIsEditModalOpen(false);
  };

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    await addShift({
      id: `shift-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeNameAr: employee.nameAr,
      role: employee.role,
      roleAr: employee.roleAr,
      startTime: newShiftStart,
      endTime: newShiftEnd,
      status: 'scheduled',
      date: newShiftDate,
      geofenceStatus: 'in_range',
    });
    setShowAddShiftModal(false);
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftForAttendance) return;

    // Calculate hours worked
    const [startH, startM] = checkInTime.split(':').map(Number);
    const [endH, endM] = checkOutTime.split(':').map(Number);
    let durationHours = (endH + endM / 60) - (startH + startM / 60);
    if (durationHours < 0) durationHours += 24;
    const hoursWorked = Math.max(0, Math.round(durationHours * 10) / 10);
    const overtimeHours = Math.max(0, Math.round((hoursWorked - 8) * 10) / 10);

    await updateShift({
      ...selectedShiftForAttendance,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      hoursWorked,
      overtimeHours,
      geofenceStatus,
      status: 'completed',
    });

    setSelectedShiftForAttendance(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <Link
            to="/shifts/employees"
            className="w-9 h-9 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white flex items-center justify-center transition-colors"
            title="العودة لسجل الموظفين"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-xl">{employee.nameAr}</h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  employee.status === 'active'
                    ? 'bg-success-500/15 text-success-400 border-success-500/25'
                    : employee.status === 'on_leave'
                    ? 'bg-warning-500/15 text-warning-400 border-warning-500/25'
                    : 'bg-danger-500/15 text-danger-400 border-danger-500/25'
                }`}
              >
                {employee.status === 'active' ? 'نشط' : employee.status === 'on_leave' ? 'إجازة' : 'موقوف'}
              </span>
            </div>
            <p className="text-navy-400 text-xs font-mono">
              {employee.employeeNumber} • {employee.roleAr}
            </p>
          </div>
        </div>

        {/* Dedicated Route Path Badge & Quick Actions */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-navy-900/90 border border-navy-700/80 flex items-center gap-2">
            <span className="text-[10px] text-navy-400">المسار الخاص:</span>
            <span className="text-xs font-mono text-cyan-400" dir="ltr">
              {rolePath}
            </span>
            <button
              type="button"
              onClick={handleCopyPath}
              className="p-1 rounded hover:bg-navy-700 text-navy-400 hover:text-white transition-colors"
              title="نسخ المسار"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenEdit}
            className="btn-ghost py-2 text-xs flex items-center gap-1.5 border border-navy-700"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>تعديل البيانات والراتب</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddShiftModal(true)}
            className="btn-primary py-2 text-xs flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>جدولة وردية جديدة</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="الراتب الأساسي"
          value={formatCurrency(employee.baseSalary)}
          sublabel={`${formatCurrency(employee.hourlyRate)} / س`}
          color="brand"
        />
        <StatCard
          icon={CalendarClock}
          label="إجمالي الورديات المسجلة"
          value={String(employeeShifts.length)}
          sublabel={`${activeOrScheduledShifts} ورديات قادمة/نشطة`}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="ساعات العمل المنجزة"
          value={`${totalWorkedHours} س`}
          sublabel="مجموع ساعات الحضور الفعلي"
          color="success"
        />
        <StatCard
          icon={UserCheck}
          label="ساعات إضافية (أوفرتايم)"
          value={`${totalOvertimeHours} س`}
          sublabel={`بمعدل ${formatCurrency(employee.overtimeRate)} / س`}
          color="purple"
        />
      </div>

      {/* Grid: Employee Details & Shifts Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contract & Salary Card */}
        <div className="glass-card p-5 border border-navy-700/60 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-navy-800">
            <CreditCard className="w-4 h-4 text-brand-400" />
            <h3 className="text-white font-bold text-sm">بيانات التعاقد والرواتب</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
              <span className="text-navy-400">نوع العقد:</span>
              <span className="text-white font-medium">
                {employee.contractType === 'full_time'
                  ? 'دوام كامل (شهري)'
                  : employee.contractType === 'part_time'
                  ? 'دوام جزئي'
                  : 'بالساعة'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
              <span className="text-navy-400">تاريخ التعيين:</span>
              <span className="text-white font-mono">{employee.hireDate || '—'}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
              <span className="text-navy-400">رقم الهاتف:</span>
              <span className="text-brand-300 font-mono" dir="ltr">{employee.phone || '—'}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
              <span className="text-navy-400">الرقم القومي:</span>
              <span className="text-white font-mono">{employee.nationalId || '—'}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
              <span className="text-navy-400">الراتب الأساسي:</span>
              <span className="font-bold text-white font-mono text-sm">
                {formatCurrency(employee.baseSalary)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
              <span className="text-navy-400">معدل أجر الساعة:</span>
              <span className="text-white font-mono">{formatCurrency(employee.hourlyRate)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
              <span className="text-navy-400">أجر الساعة الإضافية:</span>
              <span className="text-amber-400 font-mono font-bold">
                {formatCurrency(employee.overtimeRate)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
              <span className="text-navy-400">بدلات وحوافز شهرية:</span>
              <span className="text-emerald-400 font-mono">
                +{formatCurrency(employee.monthlyIncentives || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-navy-400">بيانات التحويل البنكي:</span>
              <span className="text-navy-300">{employee.bankAccount || 'نقدي عبر الخزينة'}</span>
            </div>
          </div>

          {employee.notes && (
            <div className="p-3 rounded-xl bg-navy-900/80 border border-navy-800 text-xs">
              <span className="text-navy-400 block mb-1">ملاحظات:</span>
              <p className="text-navy-200">{employee.notes}</p>
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/shifts/payroll"
              className="btn-ghost w-full py-2.5 text-xs flex items-center justify-center gap-2 border border-navy-700/80 hover:text-brand-400"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>مراجعة الموظف في كشف الرواتب الشهري</span>
            </Link>
          </div>
        </div>

        {/* Right Columns: Shifts & Attendance Timeline */}
        <div className="lg:col-span-2 glass-card p-5 border border-navy-700/60 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-brand-400" />
              <h3 className="text-white font-bold text-sm">
                جدول الورديات وتتبع الحضور والانصراف ({employeeShifts.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddShiftModal(true)}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>جدولة وردية</span>
            </button>
          </div>

          {employeeShifts.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-navy-800 rounded-xl">
              <Calendar className="w-8 h-8 text-navy-500 mx-auto mb-2" />
              <p className="text-navy-400 text-xs mb-3">لا توجد ورديات مجدولة لهذا الموظف حتى الآن</p>
              <button
                type="button"
                onClick={() => setShowAddShiftModal(true)}
                className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>جدولة أول وردية</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {employeeShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="p-3.5 rounded-xl bg-navy-900/60 border border-navy-800 hover:border-navy-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-bold">{shift.date}</span>
                        <span className="text-navy-400">•</span>
                        <span className="text-brand-400 font-bold">{shift.startTime} - {shift.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-navy-400">
                        {shift.checkIn ? (
                          <span className="text-success-400 font-mono">
                            حضور: {shift.checkIn} {shift.checkOut ? `• انصراف: ${shift.checkOut}` : ''}
                          </span>
                        ) : (
                          <span>لم يسجل الحضور بعد</span>
                        )}
                        {shift.hoursWorked ? (
                          <span className="bg-navy-800 px-1.5 py-0.5 rounded text-navy-200">
                            {shift.hoursWorked} ساعة عمل
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        shift.status === 'completed'
                          ? 'bg-success-500/15 text-success-400 border-success-500/25'
                          : shift.status === 'active'
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                          : shift.status === 'absent'
                          ? 'bg-danger-500/15 text-danger-400 border-danger-500/25'
                          : 'bg-navy-800 text-navy-300 border-navy-700'
                      }`}
                    >
                      {shift.status === 'completed'
                        ? 'مكتمل'
                        : shift.status === 'active'
                        ? 'نشط الآن'
                        : shift.status === 'absent'
                        ? 'غائب'
                        : 'مجدول'}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedShiftForAttendance(shift);
                        setCheckInTime(shift.checkIn || shift.startTime);
                        setCheckOutTime(shift.checkOut || shift.endTime);
                        setGeofenceStatus(shift.geofenceStatus || 'in_range');
                      }}
                      className="btn-ghost py-1.5 px-3 text-[11px] border border-navy-700 hover:text-brand-400"
                    >
                      تسجيل / تعديل الحضور
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* Quick Add Shift Modal */}
      {/* ==================================================== */}
      {showAddShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 border border-navy-700 shadow-2xl rounded-2xl animate-scale-in text-right">
            <h3 className="text-white font-bold text-base mb-4 pb-2 border-b border-navy-800">
              جدولة وردية جديدة لـ {employee.nameAr}
            </h3>

            <form onSubmit={handleAddShift} className="space-y-4 text-xs">
              <div>
                <label className="block text-navy-300 mb-1">تاريخ الوردية</label>
                <input
                  type="date"
                  required
                  value={newShiftDate}
                  onChange={(e) => setNewShiftDate(e.target.value)}
                  className="input-field w-full font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy-300 mb-1">وقت البدء</label>
                  <input
                    type="time"
                    required
                    value={newShiftStart}
                    onChange={(e) => setNewShiftStart(e.target.value)}
                    className="input-field w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block text-navy-300 mb-1">وقت الانتهاء</label>
                  <input
                    type="time"
                    required
                    value={newShiftEnd}
                    onChange={(e) => setNewShiftEnd(e.target.value)}
                    className="input-field w-full font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddShiftModal(false)}
                  className="btn-ghost px-4 py-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد الإضافة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* Attendance Recording Modal */}
      {/* ==================================================== */}
      {selectedShiftForAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 border border-navy-700 shadow-2xl rounded-2xl animate-scale-in text-right">
            <h3 className="text-white font-bold text-base mb-1">
              تسجيل الحضور والانصراف
            </h3>
            <p className="text-navy-400 text-xs mb-4 pb-2 border-b border-navy-800">
              وردية {selectedShiftForAttendance.date} ({selectedShiftForAttendance.startTime} - {selectedShiftForAttendance.endTime})
            </p>

            <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy-300 mb-1">وقت الحضور الفعلي</label>
                  <input
                    type="time"
                    required
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="input-field w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block text-navy-300 mb-1">وقت الانصراف الفعلي</label>
                  <input
                    type="time"
                    required
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="input-field w-full font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-navy-300 mb-1">حالة الالتزام بالنطاق والموعد</label>
                <select
                  value={geofenceStatus}
                  onChange={(e) => setGeofenceStatus(e.target.value as Shift['geofenceStatus'])}
                  className="input-field w-full bg-navy-900"
                >
                  <option value="in_range">داخل النطاق الجغرافي (حضور في الموعد)</option>
                  <option value="late">تأخير بعذر / بدون عذر</option>
                  <option value="permitted">إذن رسمي أو مأمورية</option>
                  <option value="absent">غائب</option>
                </select>
              </div>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedShiftForAttendance(null)}
                  className="btn-ghost px-4 py-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ سجل الحضور</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* Edit Employee Info Modal */}
      {/* ==================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 border border-navy-700 shadow-2xl rounded-2xl animate-scale-in text-right">
            <h3 className="text-white font-bold text-base mb-4 pb-2 border-b border-navy-800">
              تعديل بيانات {employee.nameAr}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-navy-300 mb-1">الاسم بالعربية</label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy-300 mb-1">المسمى الوظيفي</label>
                  <input
                    type="text"
                    required
                    value={roleAr}
                    onChange={(e) => setRoleAr(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-navy-300 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field w-full font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-navy-300 mb-1">الراتب الأساسي</label>
                  <input
                    type="number"
                    min="0"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="input-field w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block text-navy-300 mb-1">أجر الساعة</label>
                  <input
                    type="number"
                    min="0"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="input-field w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block text-navy-300 mb-1">أجر الإضافي</label>
                  <input
                    type="number"
                    min="0"
                    value={overtimeRate}
                    onChange={(e) => setOvertimeRate(Number(e.target.value))}
                    className="input-field w-full font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-navy-300 mb-1">حالة الموظف</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Employee['status'])}
                  className="input-field w-full bg-navy-900"
                >
                  <option value="active">نشط على رأس العمل</option>
                  <option value="on_leave">في إجازة</option>
                  <option value="suspended">موقوف مؤقتاً</option>
                </select>
              </div>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-ghost px-4 py-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
