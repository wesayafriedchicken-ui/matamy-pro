import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Sun, Moon, CheckSquare, Wallet, CalendarClock, CheckCircle2,
  Circle, Upload, Clock, User, FileText, Send, X,
  AlertCircle, ClipboardList, PenLine, CheckCheck,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

type TaskBucket = 'opening' | 'closing';

interface TaskItem {
  id: string;
  bucket: TaskBucket;
  labelAr: string;
  assignedTo: string;
  deadline: string;
  completed: boolean;
  hasProof: boolean;
  note?: string;
}

const initialTasks: TaskItem[] = [
  { id: 't1', bucket: 'opening', labelAr: 'تجهيز وتدفئة المعدات (الفرن، الشواية، القلاية)', assignedTo: 'أحمد علي', deadline: '08:30', completed: true, hasProof: true },
  { id: 't2', bucket: 'opening', labelAr: 'فحص درجات حرارة الثلاجات والمجمدات', assignedTo: 'فاطمة نور', deadline: '08:15', completed: true, hasProof: true, note: 'الحرارة ضمن المعدل الطبيعي' },
  { id: 't3', bucket: 'opening', labelAr: 'جرد الخزينة الافتتاحية وتسجيل النقدية', assignedTo: 'سارة حسن', deadline: '08:45', completed: true, hasProof: false },
  { id: 't4', bucket: 'opening', labelAr: 'استلام الخضار الطازج ومراجعة الجودة', assignedTo: 'محمود إبراهيم', deadline: '09:00', completed: false, hasProof: false },
  { id: 't5', bucket: 'closing', labelAr: 'تنظيف محطات الطبخ وتعقيم الأسطح', assignedTo: 'أحمد علي', deadline: '23:30', completed: false, hasProof: false },
  { id: 't6', bucket: 'closing', labelAr: 'إغلاق الغاز والمحابس الرئيسية', assignedTo: 'محمود إبراهيم', deadline: '23:45', completed: false, hasProof: false },
  { id: 't7', bucket: 'closing', labelAr: 'تقرير عهدة الكاشير النهائي ومطابقة الخزينة', assignedTo: 'سارة حسن', deadline: '23:50', completed: false, hasProof: false },
  { id: 't8', bucket: 'closing', labelAr: 'التخلص من الهوالك وتنظيف حاويات القمامة', assignedTo: 'فاطمة نور', deadline: '23:30', completed: false, hasProof: false },
];

export default function ShiftTasks() {
  const { showToast } = useApp();
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [showHandover, setShowHandover] = useState(false);
  const [handoverNotes, setHandoverNotes] = useState('');
  const [incidents, setIncidents] = useState('');
  const [signedBy, setSignedBy] = useState('');

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addProof = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, hasProof: true } : t));
    showToast('تم رفع إثبات التنفيذ', 'success');
  };

  const openingTasks = tasks.filter((t) => t.bucket === 'opening');
  const closingTasks = tasks.filter((t) => t.bucket === 'closing');
  const openingDone = openingTasks.filter((t) => t.completed).length;
  const closingDone = closingTasks.filter((t) => t.completed).length;
  const totalDone = tasks.filter((t) => t.completed).length;

  const submitHandover = () => {
    setShowHandover(false);
    setHandoverNotes('');
    setIncidents('');
    setSignedBy('');
    showToast('تم إرسال تقرير تسليم الشيفت بنجاح', 'success');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="الورديات والمهام" description="مهام الافتتاح والإغلاق وتسليم الشيفت" />

      {/* Sub-route nav */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit">
        <Link to="/shifts/schedule" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <CalendarClock className="w-4 h-4" />
          الجدولة والحضور
        </Link>
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <CheckSquare className="w-4 h-4" />
          المهام وتسليم الشيفت
        </span>
        <Link to="/shifts/payroll" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Wallet className="w-4 h-4" />
          الرواتب والساعات
        </Link>
      </div>

      {/* Progress summary */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <p className="text-white font-bold text-base">تقدم مهام اليوم</p>
              <p className="text-navy-400 text-sm">{totalDone} من {tasks.length} مهمة مكتملة</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-amber-400 font-bold text-2xl">{openingDone}/{openingTasks.length}</p>
              <p className="text-navy-400 text-xs">افتتاح</p>
            </div>
            <div className="text-center">
              <p className="text-blue-400 font-bold text-2xl">{closingDone}/{closingTasks.length}</p>
              <p className="text-navy-400 text-xs">إغلاق</p>
            </div>
            <div className="flex-1 max-w-48">
              <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-brand-500 to-success-500 rounded-full transition-all duration-500" style={{ width: `${(totalDone / tasks.length) * 100}%` }} />
              </div>
              <p className="text-navy-400 text-xs mt-1 text-center">{Math.round((totalDone / tasks.length) * 100)}% مكتمل</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task buckets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Opening Checklist */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              قائمة افتتاح المطعم
            </h3>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${openingDone === openingTasks.length ? 'bg-success-500/15 text-success-400' : 'bg-amber-500/15 text-amber-400'}`}>
              {openingDone}/{openingTasks.length}
            </span>
          </div>
          <div className="space-y-2.5">
            {openingTasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} onAddProof={addProof} />
            ))}
          </div>
        </div>

        {/* Closing Checklist */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Moon className="w-5 h-5 text-blue-400" />
              قائمة إغلاق المطعم وتسليم الشيفت
            </h3>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${closingDone === closingTasks.length ? 'bg-success-500/15 text-success-400' : 'bg-blue-500/15 text-blue-400'}`}>
              {closingDone}/{closingTasks.length}
            </span>
          </div>
          <div className="space-y-2.5">
            {closingTasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} onAddProof={addProof} />
            ))}
          </div>
        </div>
      </div>

      {/* Submit Handover Report */}
      <div className="mt-6 glass-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-success-500/15 flex items-center justify-center">
              <FileText className="w-5 h-5 text-success-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">تقرير تسليم الشيفت اليومي</p>
              <p className="text-navy-400 text-xs">إرسال ملخص الحوادث والملاحظات وتوقيع التسليم</p>
            </div>
          </div>
          <button
            onClick={() => setShowHandover(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Send className="w-4 h-4" />
            إرسال تقرير الشيفت
          </button>
        </div>
      </div>

      {/* Handover Report Modal */}
      {showHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowHandover(false)}>
          <div className="glass-card w-full max-w-lg animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-400" />
                تقرير تسليم الشيفت
              </h3>
              <button onClick={() => setShowHandover(false)} className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
                <p className="text-navy-300 text-xs mb-2">ملخص مهام اليوم</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-amber-400">افتتاح: {openingDone}/{openingTasks.length}</span>
                  <span className="text-blue-400">إغلاق: {closingDone}/{closingTasks.length}</span>
                  <span className="text-success-400">إجمالي: {totalDone}/{tasks.length}</span>
                </div>
              </div>

              {/* Manager notes */}
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                  <PenLine className="w-4 h-4" />
                  ملاحظات المدير
                </label>
                <textarea
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="input-field min-h-24 resize-none"
                  placeholder="ملاحظات عامة عن سير العمل اليوم..."
                />
              </div>

              {/* Incidents */}
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-warning-400" />
                  ملخص الحوادث والمشكلات
                </label>
                <textarea
                  value={incidents}
                  onChange={(e) => setIncidents(e.target.value)}
                  className="input-field min-h-20 resize-none"
                  placeholder="أي حوادث، مشكلات في المعدات، شكاوى عملاء..."
                />
              </div>

              {/* Digital sign-off */}
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  التوقيع الرقمي (اسم المسؤول)
                </label>
                <input
                  type="text"
                  value={signedBy}
                  onChange={(e) => setSignedBy(e.target.value)}
                  className="input-field"
                  placeholder="أدخل اسمك للتوقيع على التقرير..."
                />
              </div>
            </div>
            <button
              onClick={submitHandover}
              disabled={!signedBy.trim()}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCheck className="w-5 h-5" />
              تأكيد وإرسال التقرير
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onAddProof }: { task: TaskItem; onToggle: (id: string) => void; onAddProof: (id: string) => void }) {
  return (
    <div className={`rounded-xl border px-4 py-3 transition-all ${task.completed ? 'bg-success-500/5 border-success-500/20' : 'bg-navy-900/50 border-navy-700/40'}`}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggle(task.id)} className="mt-0.5 shrink-0">
          {task.completed
            ? <CheckCircle2 className="w-5 h-5 text-success-400" />
            : <Circle className="w-5 h-5 text-navy-500 hover:text-navy-400 transition-colors" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.completed ? 'text-navy-300 line-through' : 'text-white'}`}>{task.labelAr}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-navy-400">
              <User className="w-3 h-3" />
              {task.assignedTo}
            </span>
            <span className="flex items-center gap-1 text-xs text-navy-400">
              <Clock className="w-3 h-3" />
              الموعد: {task.deadline}
            </span>
            {task.hasProof && (
              <span className="flex items-center gap-1 text-xs text-success-400">
                <CheckCircle2 className="w-3 h-3" />
                تم رفع إثبات
              </span>
            )}
          </div>
          {task.note && (
            <p className="text-navy-400 text-xs mt-1.5 bg-navy-800/40 rounded-lg px-2.5 py-1.5">{task.note}</p>
          )}
        </div>
        {!task.hasProof && (
          <button
            onClick={() => onAddProof(task.id)}
            className="shrink-0 w-8 h-8 rounded-lg bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-400 hover:text-white transition-all"
            title="رفع إثبات"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
