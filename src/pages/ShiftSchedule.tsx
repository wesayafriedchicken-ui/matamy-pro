import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Shift } from '@/types';
import {
  Clock, CheckCircle2, CalendarClock, UserCheck,
  UserX, Briefcase, Plus, MapPin, Coffee, Sun, Moon, Timer,
  CheckCircle, X, Save, CheckSquare, Wallet, Users, ExternalLink,
  Trash2,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

type ViewMode = 'daily' | 'weekly';

const roleConfig: Record<string, { color: string; bg: string; icon: typeof Briefcase }> = {
  'طباخ': { color: 'text-amber-400', bg: 'bg-amber-500/15', icon: Briefcase },
  'شيف': { color: 'text-amber-400', bg: 'bg-amber-500/15', icon: Briefcase },
  'طباخ / شيف': { color: 'text-amber-400', bg: 'bg-amber-500/15', icon: Briefcase },
  'كاشير': { color: 'text-blue-400', bg: 'bg-blue-500/15', icon: Briefcase },
  'كاشير ومبيعات': { color: 'text-blue-400', bg: 'bg-blue-500/15', icon: Briefcase },
  'جرسون': { color: 'text-success-400', bg: 'bg-success-500/15', icon: Briefcase },
  'جرسون صالة': { color: 'text-success-400', bg: 'bg-success-500/15', icon: Briefcase },
  'مساعد مطبخ': { color: 'text-brand-400', bg: 'bg-brand-500/15', icon: Briefcase },
  'مساعد مطبخ وتحضير': { color: 'text-brand-400', bg: 'bg-brand-500/15', icon: Briefcase },
  'باريستا': { color: 'text-purple-400', bg: 'bg-purple-500/15', icon: Coffee },
  'باريستا ومشروبات': { color: 'text-purple-400', bg: 'bg-purple-500/15', icon: Coffee },
  'مندوب': { color: 'text-cyan-400', bg: 'bg-cyan-500/15', icon: Briefcase },
  'مندوب توصيل': { color: 'text-cyan-400', bg: 'bg-cyan-500/15', icon: Briefcase },
  'مدير': { color: 'text-navy-200', bg: 'bg-navy-700/50', icon: Briefcase },
  'مدير فرع / مشرف': { color: 'text-navy-200', bg: 'bg-navy-700/50', icon: Briefcase },
};

const statusConfig = {
  active: { labelAr: 'نشط الآن', color: 'text-success-400', bg: 'bg-success-500/15', icon: UserCheck },
  scheduled: { labelAr: 'مجدول', color: 'text-blue-400', bg: 'bg-blue-500/15', icon: CalendarClock },
  completed: { labelAr: 'مكتمل', color: 'text-navy-300', bg: 'bg-navy-700/40', icon: CheckCircle },
  absent: { labelAr: 'غائب', color: 'text-danger-400', bg: 'bg-danger-500/15', icon: UserX },
};

const geofenceConfig = {
  in_range: { labelAr: 'داخل النطاق', color: 'text-success-400', bg: 'bg-success-500/10' },
  late: { labelAr: 'تأخير', color: 'text-warning-400', bg: 'bg-warning-500/10' },
  permitted: { labelAr: 'إذن رسمي', color: 'text-navy-300', bg: 'bg-navy-700/40' },
  absent: { labelAr: 'غياب', color: 'text-danger-400', bg: 'bg-danger-500/10' },
};

export default function ShiftSchedule() {
  const { shifts, employees, addShift, deleteShift, recordAttendance, showToast } = useApp();
  const [view, setView] = useState<ViewMode>('daily');
  const [showAddShift, setShowAddShift] = useState(false);
  const [showManualAttendance, setShowManualAttendance] = useState(false);

  // New Shift Form State
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [customEmpName, setCustomEmpName] = useState('');
  const [customRoleAr, setCustomRoleAr] = useState('طباخ / شيف');
  const [newShiftDate, setNewShiftDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newShiftStart, setNewShiftStart] = useState('08:00');
  const [newShiftEnd, setNewShiftEnd] = useState('16:00');

  // Manual Attendance Form State
  const [attendanceShiftId, setAttendanceShiftId] = useState('');
  const [checkInTime, setCheckInTime] = useState('08:00');
  const [checkOutTime, setCheckOutTime] = useState('16:00');
  const [geofenceStatus, setGeofenceStatus] = useState<Shift['geofenceStatus']>('in_range');

  const activeCount = shifts.filter((s) => s.status === 'active').length;
  const scheduledCount = shifts.filter((s) => s.status === 'scheduled').length;
  const absentCount = shifts.filter((s) => s.status === 'absent').length;
  const completedCount = shifts.filter((s) => s.status === 'completed').length;

  const dayShifts = shifts.filter((s) => s.startTime.startsWith('0') || parseInt(s.startTime, 10) < 14);
  const eveningShifts = shifts.filter((s) => parseInt(s.startTime, 10) >= 14);

  const handleSaveNewShift = async (e: React.FormEvent) => {
    e.preventDefault();

    let empNameAr = customEmpName.trim();
    let empNameEn = customEmpName.trim();
    let empRole = 'Staff';
    let empRoleAr = customRoleAr;
    let employeeId: string | undefined = undefined;

    if (selectedEmpId) {
      const emp = employees.find((e) => e.id === selectedEmpId);
      if (emp) {
        empNameAr = emp.nameAr;
        empNameEn = emp.name;
        empRole = emp.role;
        empRoleAr = emp.roleAr;
        employeeId = emp.id;
      }
    }

    if (!empNameAr) {
      showToast('يرجى اختيار الموظف أو كتابة اسمه', 'warning');
      return;
    }

    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      employeeId,
      employeeName: empNameEn || empNameAr,
      employeeNameAr: empNameAr,
      role: empRole,
      roleAr: empRoleAr,
      startTime: newShiftStart,
      endTime: newShiftEnd,
      status: 'scheduled',
      date: newShiftDate,
      geofenceStatus: 'in_range',
    };

    await addShift(newShift);
    setShowAddShift(false);
    setSelectedEmpId('');
    setCustomEmpName('');
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceShiftId) {
      showToast('يرجى اختيار الوردية لتسجيل الحضور', 'warning');
      return;
    }

    const [startH, startM] = checkInTime.split(':').map(Number);
    const [endH, endM] = checkOutTime.split(':').map(Number);
    let durationHours = (endH + endM / 60) - (startH + startM / 60);
    if (durationHours < 0) durationHours += 24;
    const hoursWorked = Math.max(0, Math.round(durationHours * 10) / 10);
    const overtimeHours = Math.max(0, Math.round((hoursWorked - 8) * 10) / 10);

    await recordAttendance(attendanceShiftId, {
      checkIn: checkInTime,
      checkOut: checkOutTime,
      hoursWorked,
      overtimeHours,
      geofenceStatus,
      status: geofenceStatus === 'absent' ? 'absent' : 'completed',
    });

    setShowManualAttendance(false);
    setAttendanceShiftId('');
  };

  return (
    <div className="animate-fade-in pb-12">
      <PageHeader
        title="الورديات والمهام"
        subtitle="جدولة الورديات وتتبع الحضور والانصراف والبصمة الجغرافية"
      />

      {/* Sub-Route Navigation (4 Dedicated Tabs) */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit flex-wrap border border-navy-700/60">
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <CalendarClock className="w-4 h-4" />
          <span>الجدولة والحضور ({shifts.length})</span>
        </span>

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

        <Link
          to="/shifts/payroll"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all"
        >
          <Wallet className="w-4 h-4" />
          <span>الرواتب والساعات</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={UserCheck}
          label="موظفين نشطين الآن"
          value={String(activeCount)}
          color="success"
        />
        <StatCard
          icon={CalendarClock}
          label="ورديات مجدولة"
          value={String(scheduledCount)}
          color="blue"
        />
        <StatCard
          icon={UserX}
          label="غائبون"
          value={String(absentCount)}
          color="danger"
        />
        <StatCard
          icon={CheckCircle2}
          label="ورديات مكتملة"
          value={String(completedCount)}
          color="brand"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-navy-800/60 rounded-xl border border-navy-700/60">
          <button
            onClick={() => setView('daily')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              view === 'daily' ? 'bg-brand-500 text-white shadow-md' : 'text-navy-400 hover:text-white'
            }`}
          >
            عرض يومي
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              view === 'weekly' ? 'bg-brand-500 text-white shadow-md' : 'text-navy-400 hover:text-white'
            }`}
          >
            عرض أسبوعي
          </button>
        </div>

        <button
          onClick={() => setShowAddShift(true)}
          className="btn-primary flex items-center gap-2 text-xs font-bold cursor-pointer shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة وردية جديدة</span>
        </button>

        <button
          onClick={() => setShowManualAttendance(true)}
          className="btn-ghost flex items-center gap-2 text-xs font-bold border border-navy-700/80 cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>تسجيل حضور / انصراف</span>
        </button>
      </div>

      {shifts.length === 0 ? (
        <div className="glass-card p-12 text-center border border-dashed border-navy-700/80 rounded-2xl mb-6">
          <CalendarClock className="w-12 h-12 text-navy-500 mx-auto mb-3" />
          <h3 className="text-white font-bold text-base mb-1">لا توجد ورديات مسجلة حالياً</h3>
          <p className="text-navy-400 text-xs max-w-sm mx-auto mb-5">
            ابدأ بإضافة ورديات العمل لموظفي المطعم لتتبع الحضور وساعات العمل وحساب الرواتب بدقة.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowAddShift(true)}
              className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة وردية جديدة</span>
            </button>
            <Link
              to="/shifts/employees"
              className="btn-ghost py-2 px-4 text-xs font-bold border border-navy-700 inline-flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>تسجيل موظف جديد أولاً</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Timeline Board */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            {/* Morning shifts */}
            <div className="glass-card p-5 border border-navy-700/60">
              <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                <span>وردية الصباح والتحضير</span>
                <span className="text-navy-400 text-xs font-normal font-mono">08:00 - 16:00</span>
              </h3>
              <div className="space-y-2.5">
                {dayShifts.length === 0 ? (
                  <p className="text-navy-400 text-xs text-center py-6 bg-navy-900/40 rounded-xl">
                    لا توجد ورديات صباحية مجدولة
                  </p>
                ) : (
                  dayShifts.map((shift) => (
                    <ShiftCard key={shift.id} shift={shift} onDelete={deleteShift} />
                  ))
                )}
              </div>
            </div>

            {/* Evening shifts */}
            <div className="glass-card p-5 border border-navy-700/60">
              <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5 text-blue-400" />
                <span>وردية المساء والذروة</span>
                <span className="text-navy-400 text-xs font-normal font-mono">16:00 - 00:00</span>
              </h3>
              <div className="space-y-2.5">
                {eveningShifts.length === 0 ? (
                  <p className="text-navy-400 text-xs text-center py-6 bg-navy-900/40 rounded-xl">
                    لا توجد ورديات مسائية مجدولة
                  </p>
                ) : (
                  eveningShifts.map((shift) => (
                    <ShiftCard key={shift.id} shift={shift} onDelete={deleteShift} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Attendance & Geofence Table */}
          <div className="glass-card overflow-hidden border border-navy-700/60">
            <div className="px-5 py-4 border-b border-navy-700/50 flex items-center justify-between">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-400" />
                <span>سجل الحضور والبصمة الجغرافية الحقيقي</span>
              </h3>
              <span className="text-navy-400 text-xs">مربوط مباشرة بقاعدة البيانات وكشف الرواتب</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-navy-700/50 bg-navy-900/50">
                    <th className="text-navy-400 text-xs font-medium px-5 py-3">الموظف</th>
                    <th className="text-navy-400 text-xs font-medium px-5 py-3">المسمى الوظيفي</th>
                    <th className="text-navy-400 text-xs font-medium px-5 py-3">تاريخ الوردية</th>
                    <th className="text-navy-400 text-xs font-medium px-5 py-3">الحضور الفعلي</th>
                    <th className="text-navy-400 text-xs font-medium px-5 py-3">الانصراف</th>
                    <th className="text-navy-400 text-xs font-medium px-5 py-3">ساعات العمل</th>
                    <th className="text-navy-400 text-xs font-medium px-5 py-3">حالة البصمة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {shifts.map((shift) => {
                    const geo = geofenceConfig[shift.geofenceStatus || 'in_range'];

                    return (
                      <tr key={shift.id} className="hover:bg-navy-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          {shift.employeeId ? (
                            <Link
                              to={`/shifts/employees/${shift.employeeId}`}
                              className="text-white font-bold text-xs hover:text-brand-400 transition-colors flex items-center gap-1.5"
                            >
                              <span>{shift.employeeNameAr}</span>
                              <ExternalLink className="w-3 h-3 text-navy-400" />
                            </Link>
                          ) : (
                            <span className="text-white font-bold text-xs">{shift.employeeNameAr}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-navy-300 text-xs">{shift.roleAr}</td>
                        <td className="px-5 py-3.5 text-navy-300 text-xs font-mono">{shift.date}</td>
                        <td className="px-5 py-3.5 text-xs font-mono text-emerald-400">
                          {shift.checkIn || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-mono text-navy-300">
                          {shift.checkOut || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-mono font-bold text-white">
                          {shift.hoursWorked ? `${shift.hoursWorked} س` : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${geo.bg} ${geo.color}`}>
                            {geo.labelAr}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ==================================================== */}
      {/* Add Shift Modal */}
      {/* ==================================================== */}
      {showAddShift && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowAddShift(false)}
        >
          <div
            className="glass-card w-full max-w-md p-6 border border-navy-700 shadow-2xl rounded-2xl animate-scale-in text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-brand-400" />
                <span>إضافة وردية جديدة للجدول</span>
              </h3>
              <button onClick={() => setShowAddShift(false)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewShift} className="space-y-4 text-xs">
              {employees.length > 0 ? (
                <div>
                  <label className="text-navy-300 font-medium mb-1.5 block">
                    اختر الموظف من السجل
                  </label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="input-field w-full bg-navy-900"
                  >
                    <option value="">-- اختر موظفاً --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nameAr} ({emp.roleAr}) - {emp.employeeNumber}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <p>لا يوجد موظفون في السجل بعد. يمكنك إدخال الاسم يدوياً أو إضافة موظف في صفحة الموظفين.</p>
                </div>
              )}

              {!selectedEmpId && (
                <>
                  <div>
                    <label className="text-navy-300 font-medium mb-1.5 block">اسم الموظف</label>
                    <input
                      type="text"
                      placeholder="أدخل اسم الموظف..."
                      value={customEmpName}
                      onChange={(e) => setCustomEmpName(e.target.value)}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="text-navy-300 font-medium mb-1.5 block">المسمى الوظيفي</label>
                    <input
                      type="text"
                      placeholder="طباخ / كاشير..."
                      value={customRoleAr}
                      onChange={(e) => setCustomRoleAr(e.target.value)}
                      className="input-field w-full"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-navy-300 font-medium mb-1.5 block">تاريخ الوردية</label>
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
                  <label className="text-navy-300 font-medium mb-1.5 block">بداية الوردية</label>
                  <input
                    type="time"
                    required
                    value={newShiftStart}
                    onChange={(e) => setNewShiftStart(e.target.value)}
                    className="input-field w-full font-mono"
                  />
                </div>
                <div>
                  <label className="text-navy-300 font-medium mb-1.5 block">نهاية الوردية</label>
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
                  onClick={() => setShowAddShift(false)}
                  className="btn-ghost px-4 py-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ الوردية</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* Manual Attendance Modal */}
      {/* ==================================================== */}
      {showManualAttendance && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowManualAttendance(false)}
        >
          <div
            className="glass-card w-full max-w-md p-6 border border-navy-700 shadow-2xl rounded-2xl animate-scale-in text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-400" />
                <span>تسجيل الحضور والانصراف يدوي</span>
              </h3>
              <button onClick={() => setShowManualAttendance(false)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
              <div>
                <label className="text-navy-300 font-medium mb-1.5 block">اختر الوردية</label>
                <select
                  required
                  value={attendanceShiftId}
                  onChange={(e) => setAttendanceShiftId(e.target.value)}
                  className="input-field w-full bg-navy-900"
                >
                  <option value="">-- اختر الوردية المراد تسجيل حضورها --</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.employeeNameAr} - {s.roleAr} ({s.date} • {s.startTime} إلى {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-navy-300 font-medium mb-1.5 block">وقت الحضور الفعلي</label>
                  <input
                    type="time"
                    required
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="input-field w-full font-mono"
                  />
                </div>
                <div>
                  <label className="text-navy-300 font-medium mb-1.5 block">وقت الانصراف الفعلي</label>
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
                <label className="text-navy-300 font-medium mb-1.5 block">حالة البصمة</label>
                <select
                  value={geofenceStatus}
                  onChange={(e) => setGeofenceStatus(e.target.value as Shift['geofenceStatus'])}
                  className="input-field w-full bg-navy-900"
                >
                  <option value="in_range">داخل النطاق الجغرافي</option>
                  <option value="late">تأخير</option>
                  <option value="permitted">إذن خاص</option>
                  <option value="absent">غائب</option>
                </select>
              </div>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualAttendance(false)}
                  className="btn-ghost px-4 py-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>تأكيد تسجيل الحضور</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ShiftCard({ shift, onDelete }: { shift: Shift; onDelete: (id: string) => Promise<boolean> }) {
  const config = statusConfig[shift.status] || statusConfig.scheduled;
  const StatusIcon = config.icon;
  const role = roleConfig[shift.roleAr] ?? { color: 'text-brand-400', bg: 'bg-brand-500/15', icon: Briefcase };
  const RoleIcon = role.icon;

  const [startH, startM] = shift.startTime.split(':').map(Number);
  const [endH, endM] = shift.endTime.split(':').map(Number);
  let durationH = endH - startH;
  let durationM = endM - startM;
  if (durationM < 0) { durationM += 60; durationH -= 1; }
  if (durationH < 0) durationH += 24;
  const duration = `${durationH}س ${durationM}د`;

  return (
    <div className="bg-navy-900/60 rounded-xl px-4 py-3 border border-navy-700/60 hover:border-navy-600 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-navy-800 flex items-center justify-center text-white font-bold text-sm ring-1 ring-white/10">
            {shift.employeeNameAr.charAt(0)}
          </div>
          <div>
            {shift.employeeId ? (
              <Link
                to={`/shifts/employees/${shift.employeeId}`}
                className="text-white text-sm font-bold hover:text-brand-400 transition-colors flex items-center gap-1"
              >
                <span>{shift.employeeNameAr}</span>
                <ExternalLink className="w-3 h-3 text-navy-400" />
              </Link>
            ) : (
              <p className="text-white text-sm font-bold">{shift.employeeNameAr}</p>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`flex items-center gap-1 text-xs ${role.color}`}>
                <RoleIcon className="w-3 h-3" />
                {shift.roleAr}
              </span>
            </div>
          </div>
        </div>
        <div className="text-left font-mono">
          <div className="flex items-center gap-1.5 text-navy-300 text-xs">
            <Clock className="w-3 h-3 text-brand-400" />
            {shift.startTime} - {shift.endTime}
          </div>
          <div className="flex items-center gap-1.5 text-navy-400 text-xs mt-0.5">
            <Timer className="w-3 h-3" />
            {duration}
          </div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-navy-800 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-lg ${config.bg} ${config.color}`}>
          <StatusIcon className="w-3 h-3" />
          {config.labelAr}
        </span>

        <button
          type="button"
          onClick={() => onDelete(shift.id)}
          className="text-navy-500 hover:text-danger-400 transition-colors p-1"
          title="حذف الوردية"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
