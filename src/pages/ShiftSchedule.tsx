import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Shift } from '@/types';
import {
  Clock, CheckCircle2, XCircle, CalendarClock, UserCheck,
  UserX, Briefcase, Plus, MapPin, Coffee, Sun, Moon, Timer,
  CheckCircle, X, Save, CheckSquare, Wallet,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

type ViewMode = 'daily' | 'weekly';

const roleConfig: Record<string, { color: string; bg: string; icon: typeof Briefcase }> = {
  'طباخ': { color: 'text-amber-400', bg: 'bg-amber-500/15', icon: Briefcase },
  'كاشير': { color: 'text-blue-400', bg: 'bg-blue-500/15', icon: Briefcase },
  'جرسون': { color: 'text-success-400', bg: 'bg-success-500/15', icon: Briefcase },
  'مساعد مطبخ': { color: 'text-brand-400', bg: 'bg-brand-500/15', icon: Briefcase },
  'باريستا': { color: 'text-purple-400', bg: 'bg-purple-500/15', icon: Coffee },
  'مندوب': { color: 'text-cyan-400', bg: 'bg-cyan-500/15', icon: Briefcase },
  'مدير': { color: 'text-navy-200', bg: 'bg-navy-700/50', icon: Briefcase },
};

const statusConfig = {
  active: { labelAr: 'نشط', color: 'text-success-400', bg: 'bg-success-500/15', icon: UserCheck },
  scheduled: { labelAr: 'مجدول', color: 'text-blue-400', bg: 'bg-blue-500/15', icon: CalendarClock },
  completed: { labelAr: 'منتهي', color: 'text-navy-300', bg: 'bg-navy-700/40', icon: CheckCircle },
  absent: { labelAr: 'غائب', color: 'text-danger-400', bg: 'bg-danger-500/15', icon: UserX },
};

interface AttendanceRecord {
  shiftId: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  geofenceStatus: 'in_range' | 'late' | 'permitted';
}

const mockAttendance: Record<string, AttendanceRecord> = {
  s1: { shiftId: 's1', checkIn: '07:55', checkOut: '16:05', hoursWorked: 8.2, geofenceStatus: 'in_range' },
  s2: { shiftId: 's2', checkIn: '14:15', checkOut: '—', hoursWorked: 4.5, geofenceStatus: 'late' },
  s3: { shiftId: 's3', checkIn: '—', checkOut: '—', hoursWorked: 0, geofenceStatus: 'permitted' },
  s4: { shiftId: 's4', checkIn: '08:02', checkOut: '16:00', hoursWorked: 8, geofenceStatus: 'in_range' },
  s5: { shiftId: 's5', checkIn: '11:50', checkOut: '—', hoursWorked: 6.1, geofenceStatus: 'in_range' },
  s6: { shiftId: 's6', checkIn: '—', checkOut: '—', hoursWorked: 0, geofenceStatus: 'permitted' },
};

const geofenceConfig = {
  in_range: { labelAr: 'داخل النطاق', color: 'text-success-400', bg: 'bg-success-500/10' },
  late: { labelAr: 'تأخير', color: 'text-warning-400', bg: 'bg-warning-500/10' },
  permitted: { labelAr: 'إذن', color: 'text-navy-300', bg: 'bg-navy-700/40' },
};

const weekDays = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء'];

export default function ShiftSchedule() {
  const { shifts, showToast } = useApp();
  const [view, setView] = useState<ViewMode>('daily');
  const [showAddShift, setShowAddShift] = useState(false);
  const [showManualAttendance, setShowManualAttendance] = useState(false);

  const activeCount = shifts.filter((s) => s.status === 'active').length;
  const scheduledCount = shifts.filter((s) => s.status === 'scheduled').length;
  const absentCount = shifts.filter((s) => s.status === 'absent').length;
  const completedCount = shifts.filter((s) => s.status === 'completed').length;

  const dayShifts = shifts.filter((s) => s.startTime.startsWith('0') || (parseInt(s.startTime) < 12));
  const eveningShifts = shifts.filter((s) => parseInt(s.startTime) >= 12);

  return (
    <div className="animate-fade-in">
      <PageHeader title="الورديات والمهام" description="جدولة الورديات وتتبع الحضور والانصراف" />

      {/* Sub-route nav */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit">
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <CalendarClock className="w-4 h-4" />
          الجدولة والحضور
        </span>
        <Link to="/shifts/tasks" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <CheckSquare className="w-4 h-4" />
          المهام وتسليم الشيفت
        </Link>
        <Link to="/shifts/payroll" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Wallet className="w-4 h-4" />
          الرواتب والساعات
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={UserCheck} label="موظفين نشطين الآن" value={String(activeCount)} color="success" />
        <StatCard icon={CalendarClock} label="ورديات مجدولة اليوم" value={String(scheduledCount + activeCount)} color="blue" />
        <StatCard icon={UserX} label="غائبون" value={String(absentCount)} color="danger" />
        <StatCard icon={CheckCircle2} label="ورديات مكتملة" value={String(completedCount)} color="brand" />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-1 p-1 bg-navy-800/60 rounded-xl">
          <button onClick={() => setView('daily')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'daily' ? 'bg-brand-500 text-white' : 'text-navy-400 hover:text-white'}`}>
            يومي
          </button>
          <button onClick={() => setView('weekly')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'weekly' ? 'bg-brand-500 text-white' : 'text-navy-400 hover:text-white'}`}>
            أسبوعي
          </button>
        </div>
        <button onClick={() => setShowAddShift(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          إضافة وردية جديدة
        </button>
        <button onClick={() => setShowManualAttendance(true)} className="btn-ghost flex items-center gap-2 text-sm">
          <UserCheck className="w-4 h-4" />
          تسجيل حضور يدوي
        </button>
      </div>

      {view === 'daily' ? (
        <>
          {/* Timeline Board */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            {/* Morning shifts */}
            <div className="glass-card p-5">
              <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                وردية الصباح
                <span className="text-navy-400 text-sm font-normal">08:00 - 16:00</span>
              </h3>
              <div className="space-y-2.5">
                {dayShifts.length === 0 ? (
                  <p className="text-navy-400 text-sm text-center py-6">لا توجد ورديات صباحية</p>
                ) : (
                  dayShifts.map((shift) => <ShiftCard key={shift.id} shift={shift} />)
                )}
              </div>
            </div>

            {/* Evening shifts */}
            <div className="glass-card p-5">
              <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5 text-blue-400" />
                وردية المساء
                <span className="text-navy-400 text-sm font-normal">16:00 - 00:00</span>
              </h3>
              <div className="space-y-2.5">
                {eveningShifts.length === 0 ? (
                  <p className="text-navy-400 text-sm text-center py-6">لا توجد ورديات مسائية</p>
                ) : (
                  eveningShifts.map((shift) => <ShiftCard key={shift.id} shift={shift} />)
                )}
              </div>
            </div>
          </div>

          {/* Attendance & Geofence Table */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-700/50 flex items-center justify-between">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-400" />
                الحضور والبصمة الجغرافية (Geofence)
              </h3>
              <span className="text-navy-400 text-sm">سجل اليوم</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-700/50">
                    <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الموظف</th>
                    <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">المسمى الوظيفي</th>
                    <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الحضور الفعلي</th>
                    <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الانصراف</th>
                    <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">ساعات العمل</th>
                    <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">حالة البصمة</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift) => {
                    const att = mockAttendance[shift.id] ?? { shiftId: shift.id, checkIn: '—', checkOut: '—', hoursWorked: 0, geofenceStatus: 'permitted' as const };
                    const geo = geofenceConfig[att.geofenceStatus];
                    return (
                      <tr key={shift.id} className="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-600 to-navy-700 flex items-center justify-center text-white font-bold text-sm">
                              {shift.employeeNameAr.charAt(0)}
                            </div>
                            <p className="text-white text-sm font-medium">{shift.employeeNameAr}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-navy-200 text-sm">{shift.roleAr}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-sm font-mono ${att.checkIn === '—' ? 'text-navy-500' : 'text-white'}`}>{att.checkIn}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-sm font-mono ${att.checkOut === '—' ? 'text-navy-500' : 'text-white'}`}>{att.checkOut}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-navy-200 text-sm font-mono">{att.hoursWorked > 0 ? `${att.hoursWorked} س` : '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${geo.bg} ${geo.color}`}>
                            <MapPin className="w-3 h-3" />
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
      ) : (
        /* Weekly view */
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-700/50">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-brand-400" />
              الجدول الأسبوعي للورديات
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700/50">
                  <th className="text-right text-navy-400 text-xs font-medium px-5 py-3 sticky right-0 bg-navy-900">الموظف</th>
                  {weekDays.map((day) => (
                    <th key={day} className="text-center text-navy-400 text-xs font-medium px-3 py-3 min-w-32">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => {
                  const role = roleConfig[shift.roleAr] ?? roleConfig['مدير'];
                  const RoleIcon = role.icon;
                  return (
                    <tr key={shift.id} className="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors">
                      <td className="px-5 py-3 sticky right-0 bg-navy-900/80">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-navy-700/50 flex items-center justify-center text-white font-bold text-xs">
                            {shift.employeeNameAr.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white text-xs font-medium">{shift.employeeNameAr}</p>
                            <p className={`text-xs flex items-center gap-1 ${role.color}`}>
                              <RoleIcon className="w-2.5 h-2.5" />
                              {shift.roleAr}
                            </p>
                          </div>
                        </div>
                      </td>
                      {weekDays.map((_, dayIdx) => {
                        const isWorking = dayIdx < 5 && (shift.status === 'active' || shift.status === 'completed' || shift.status === 'scheduled');
                        const isAbsent = dayIdx === 0 && shift.status === 'absent';
                        return (
                          <td key={dayIdx} className="px-3 py-3 text-center">
                            {isWorking ? (
                              <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg px-2 py-1.5">
                                <p className="text-brand-400 text-xs font-mono">{shift.startTime}</p>
                                <p className="text-navy-400 text-xs">→ {shift.endTime}</p>
                              </div>
                            ) : isAbsent ? (
                              <div className="bg-danger-500/10 border border-danger-500/20 rounded-lg px-2 py-1.5">
                                <XCircle className="w-4 h-4 text-danger-400 mx-auto" />
                              </div>
                            ) : (
                              <span className="text-navy-600 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Shift Modal */}
      {showAddShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddShift(false)}>
          <div className="glass-card w-full max-w-md animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-400" />
                إضافة وردية جديدة
              </h3>
              <button onClick={() => setShowAddShift(false)} className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">اسم الموظف</label>
                <input type="text" placeholder="أدخل اسم الموظف" className="input-field" />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">المسمى الوظيفي</label>
                <select className="input-field">
                  <option value="">اختر الوظيفة</option>
                  <option value="طباخ">طباخ</option>
                  <option value="كاشير">كاشير</option>
                  <option value="جرسون">جرسون</option>
                  <option value="مساعد مطبخ">مساعد مطبخ</option>
                  <option value="باريستا">باريستا</option>
                  <option value="مندوب">مندوب توصيل</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-1.5 block">بداية الوردية</label>
                  <input type="time" defaultValue="08:00" className="input-field" />
                </div>
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-1.5 block">نهاية الوردية</label>
                  <input type="time" defaultValue="16:00" className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">نوع الوردية</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-brand-500/40 bg-brand-500/10 text-brand-400 text-sm font-medium">
                    <Sun className="w-4 h-4" /> صباحي
                  </button>
                  <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-navy-700/40 bg-navy-900/50 text-navy-300 text-sm font-medium hover:border-navy-600 transition-all">
                    <Moon className="w-4 h-4" /> مسائي
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setShowAddShift(false); showToast('تم إضافة الوردية بنجاح', 'success'); }}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ الوردية
            </button>
          </div>
        </div>
      )}

      {/* Manual Attendance Modal */}
      {showManualAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowManualAttendance(false)}>
          <div className="glass-card w-full max-w-md animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-400" />
                تسجيل حضور يدوي
              </h3>
              <button onClick={() => setShowManualAttendance(false)} className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">الموظف</label>
                <select className="input-field">
                  <option value="">اختر الموظف</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>{s.employeeNameAr} - {s.roleAr}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-1.5 block">وقت الحضور</label>
                  <input type="time" defaultValue="08:00" className="input-field" />
                </div>
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-1.5 block">وقت الانصراف</label>
                  <input type="time" defaultValue="16:00" className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">حالة البصمة</label>
                <select className="input-field">
                  <option value="in_range">داخل النطاق الجغرافي</option>
                  <option value="late">تأخير</option>
                  <option value="permitted">إذن خاص</option>
                </select>
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">ملاحظات</label>
                <textarea className="input-field min-h-20 resize-none" placeholder="ملاحظات إضافية..." />
              </div>
            </div>
            <button
              onClick={() => { setShowManualAttendance(false); showToast('تم تسجيل الحضور يدوياً', 'success'); }}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              تسجيل الحضور
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShiftCard({ shift }: { shift: Shift }) {
  const config = statusConfig[shift.status];
  const StatusIcon = config.icon;
  const role = roleConfig[shift.roleAr] ?? roleConfig['مدير'];
  const RoleIcon = role.icon;

  const [startH, startM] = shift.startTime.split(':').map(Number);
  const [endH, endM] = shift.endTime.split(':').map(Number);
  let durationH = endH - startH;
  let durationM = endM - startM;
  if (durationM < 0) { durationM += 60; durationH -= 1; }
  if (durationH < 0) durationH += 24;
  const duration = `${durationH}س ${durationM}د`;

  return (
    <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40 hover:border-navy-600 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-600 to-navy-700 flex items-center justify-center text-white font-bold text-sm">
            {shift.employeeNameAr.charAt(0)}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{shift.employeeNameAr}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`flex items-center gap-1 text-xs ${role.color}`}>
                <RoleIcon className="w-3 h-3" />
                {shift.roleAr}
              </span>
            </div>
          </div>
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5 text-navy-300 text-xs">
            <Clock className="w-3 h-3" />
            {shift.startTime} - {shift.endTime}
          </div>
          <div className="flex items-center gap-1.5 text-navy-400 text-xs mt-0.5">
            <Timer className="w-3 h-3" />
            {duration}
          </div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-navy-700/30">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-lg ${config.bg} ${config.color}`}>
          <StatusIcon className="w-3 h-3" />
          {config.labelAr}
        </span>
      </div>
    </div>
  );
}
