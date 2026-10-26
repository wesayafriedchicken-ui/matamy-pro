import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { ShiftTask } from '@/types';
import {
  Sun, Moon, CheckSquare, Wallet, CalendarClock, Users, CheckCircle2,
  Circle, Upload, Clock, User, FileText, Send, X,
  Plus, Trash2, Check,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

export default function ShiftTasks() {
  const { shiftTasks, addShiftTask, updateShiftTask, toggleShiftTask, deleteShiftTask, employees, showToast } = useApp();

  const [showHandover, setShowHandover] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskBucket, setTaskBucket] = useState<ShiftTask['bucket']>('opening');
  const [taskLabelAr, setTaskLabelAr] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('08:30');

  // Handover state
  const [handoverNotes, setHandoverNotes] = useState('');
  const [incidents, setIncidents] = useState('');
  const [signedBy, setSignedBy] = useState('');

  const openingTasks = shiftTasks.filter((t) => t.bucket === 'opening');
  const closingTasks = shiftTasks.filter((t) => t.bucket === 'closing');
  const openingDone = openingTasks.filter((t) => t.completed).length;
  const closingDone = closingTasks.filter((t) => t.completed).length;
  const totalDone = shiftTasks.filter((t) => t.completed).length;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskLabelAr.trim()) {
      showToast('يرجى إدخال وصف المهمة', 'warning');
      return;
    }

    const newTask: ShiftTask = {
      id: `task-${Date.now()}`,
      bucket: taskBucket,
      labelAr: taskLabelAr.trim(),
      assignedTo: taskAssignedTo.trim() || 'فريق التشغيل',
      deadline: taskDeadline,
      completed: false,
      hasProof: false,
      date: new Date().toISOString().split('T')[0],
    };

    await addShiftTask(newTask);
    setShowAddTaskModal(false);
    setTaskLabelAr('');
    setTaskAssignedTo('');
  };

  const handleAddProof = async (task: ShiftTask) => {
    await updateShiftTask({
      ...task,
      hasProof: true,
    });
    showToast(`تم توثيق ورفع إثبات تنفيذ مهمة: ${task.labelAr}`, 'success');
  };

  const submitHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signedBy.trim()) {
      showToast('يرجى توقيع التقرير باسم المشرف المسلم', 'warning');
      return;
    }

    setShowHandover(false);
    setHandoverNotes('');
    setIncidents('');
    setSignedBy('');
    showToast('تم اعتماد وإرسال تقرير تسليم الشيفت وحفظه في سجلات النظام بنجاح', 'success');
  };

  return (
    <div className="animate-fade-in pb-12">
      <PageHeader
        title="الورديات والمهام"
        subtitle="قوائم مهام الافتتاح والإغلاق والتسليم بين الشيفتات"
      >
        <button
          type="button"
          onClick={() => setShowAddTaskModal(true)}
          className="btn-primary flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-500/20 text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهمة جديدة</span>
        </button>
      </PageHeader>

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

        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <CheckSquare className="w-4 h-4" />
          <span>المهام وتسليم الشيفت ({shiftTasks.length})</span>
        </span>

        <Link
          to="/shifts/payroll"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all"
        >
          <Wallet className="w-4 h-4" />
          <span>الرواتب والساعات</span>
        </Link>
      </div>

      {/* Progress & Handover Banner */}
      <div className="glass-card p-5 border border-navy-700/60 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-bold text-base mb-1">
            نسبة إنجاز مهام الشيفت اليومي ({totalDone} / {shiftTasks.length})
          </h3>
          <p className="text-navy-400 text-xs">
            يتم تحديث وحفظ حالة المهام فورياً بقاعدة البيانات
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setShowHandover(true)}
            className="btn-ghost py-2 px-4 text-xs font-bold border border-navy-700 hover:border-brand-500/40 hover:text-brand-400 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>تسليم الشيفت للمشرف التالي</span>
          </button>
        </div>
      </div>

      {shiftTasks.length === 0 ? (
        <div className="glass-card p-12 text-center border border-dashed border-navy-700/80 rounded-2xl mb-6">
          <CheckSquare className="w-12 h-12 text-navy-500 mx-auto mb-3" />
          <h3 className="text-white font-bold text-base mb-1">لا توجد مهام شيفت مسجلة</h3>
          <p className="text-navy-400 text-xs max-w-sm mx-auto mb-5">
            أضف مهام الافتتاح أو الإغلاق التشغيلية (فحص المعدات، جرد الخزينة، النظافة) وإسنادها للموظفين.
          </p>
          <button
            type="button"
            onClick={() => setShowAddTaskModal(true)}
            className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول مهمة الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Opening Tasks */}
          <div className="glass-card p-5 border border-navy-700/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-bold text-base">مهام الافتتاح والتشغيل</h3>
              </div>
              <span className="text-xs font-mono text-navy-400">
                {openingDone} / {openingTasks.length} مكتمل
              </span>
            </div>

            {openingTasks.length === 0 ? (
              <p className="text-navy-400 text-xs text-center py-6">لا توجد مهام افتتاح مسجلة</p>
            ) : (
              <div className="space-y-3">
                {openingTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onToggle={() => toggleShiftTask(t.id)}
                    onProof={() => handleAddProof(t)}
                    onDelete={() => deleteShiftTask(t.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Closing Tasks */}
          <div className="glass-card p-5 border border-navy-700/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-bold text-base">مهام الإغلاق والجرد</h3>
              </div>
              <span className="text-xs font-mono text-navy-400">
                {closingDone} / {closingTasks.length} مكتمل
              </span>
            </div>

            {closingTasks.length === 0 ? (
              <p className="text-navy-400 text-xs text-center py-6">لا توجد مهام إغلاق مسجلة</p>
            ) : (
              <div className="space-y-3">
                {closingTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onToggle={() => toggleShiftTask(t.id)}
                    onProof={() => handleAddProof(t)}
                    onDelete={() => deleteShiftTask(t.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* Add Task Modal */}
      {/* ==================================================== */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 border border-navy-700 shadow-2xl rounded-2xl animate-scale-in text-right">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-400" />
                <span>إضافة مهمة شيفت جديدة</span>
              </h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="text-navy-300 font-medium mb-1 block">تصنيف المهمة</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTaskBucket('opening')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      taskBucket === 'opening'
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                        : 'border-navy-700 text-navy-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>مهام الافتتاح</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskBucket('closing')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      taskBucket === 'closing'
                        ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                        : 'border-navy-700 text-navy-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>مهام الإغلاق</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-navy-300 font-medium mb-1 block">
                  وصف المهمة <span className="text-danger-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فحص درجات حرارة الثلاجات والمجمدات"
                  value={taskLabelAr}
                  onChange={(e) => setTaskLabelAr(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="text-navy-300 font-medium mb-1 block">إسناد إلى الموظف</label>
                {employees.length > 0 ? (
                  <select
                    value={taskAssignedTo}
                    onChange={(e) => setTaskAssignedTo(e.target.value)}
                    className="input-field w-full bg-navy-900"
                  >
                    <option value="">-- اختر موظفاً --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.nameAr}>
                        {emp.nameAr} ({emp.roleAr})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="اسم الموظف أو القسم المسند إليه..."
                    value={taskAssignedTo}
                    onChange={(e) => setTaskAssignedTo(e.target.value)}
                    className="input-field w-full"
                  />
                )}
              </div>

              <div>
                <label className="text-navy-300 font-medium mb-1 block">الموعد الأقصى للإنجاز</label>
                <input
                  type="time"
                  required
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  className="input-field w-full font-mono"
                />
              </div>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="btn-ghost px-4 py-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
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
      {/* Handover Modal */}
      {/* ==================================================== */}
      {showHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 border border-navy-700 shadow-2xl rounded-2xl animate-scale-in text-right">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-400" />
                <span>تقرير تسليم واستلام الشيفت</span>
              </h3>
              <button onClick={() => setShowHandover(false)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitHandover} className="space-y-4 text-xs">
              <div>
                <label className="text-navy-300 font-medium mb-1 block">ملاحظات الشيفت والتسليم</label>
                <textarea
                  rows={3}
                  required
                  placeholder="سجل حالة الصالة، التحضيرات المتبقية، الملاحظات التشغيلية..."
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="text-navy-300 font-medium mb-1 block">معوقات أو حوادث استثنائية (إن وجدت)</label>
                <textarea
                  rows={2}
                  placeholder="أي عطل بالمعدات أو هالك أو شكوى عميل..."
                  value={incidents}
                  onChange={(e) => setIncidents(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="text-navy-300 font-medium mb-1 block">
                  اسم المشرف المعتمد للتسليم <span className="text-danger-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="اسم مشرف الوردية..."
                  value={signedBy}
                  onChange={(e) => setSignedBy(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowHandover(false)}
                  className="btn-ghost px-4 py-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>اعتماد وإرسال التقرير</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onToggle,
  onProof,
  onDelete,
}: {
  task: ShiftTask;
  onToggle: () => void;
  onProof: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 text-xs ${
        task.completed
          ? 'bg-navy-900/40 border-navy-800/60 opacity-80'
          : 'bg-navy-900/80 border-navy-700/60 hover:border-brand-500/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="mt-0.5 text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5 text-navy-500" />
          )}
        </button>

        <div>
          <p className={`font-medium ${task.completed ? 'line-through text-navy-400' : 'text-white'}`}>
            {task.labelAr}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-navy-400 font-mono">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-navy-400" />
              <span>{task.assignedTo}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-400">
              <Clock className="w-3 h-3" />
              <span>{task.deadline}</span>
            </span>
            {task.completedAt ? (
              <span className="text-emerald-400">(تم في {task.completedAt})</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!task.hasProof ? (
          <button
            type="button"
            onClick={onProof}
            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white transition-colors"
            title="توثيق وإرفاق إثبات"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold">
            موثقة
          </span>
        )}

        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-lg text-navy-500 hover:text-danger-400 transition-colors"
          title="حذف المهمة"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
