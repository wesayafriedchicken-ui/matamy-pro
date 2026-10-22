import { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  Layers,
  Zap,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SUPABASE_PROJECT_ID, SUPABASE_SQL_EDITOR_URL } from '@/lib/supabase';
import { SUPABASE_SQL_SCHEMA, ROLES_AND_USERS_SQL } from '@/data/supabaseSchema';

export default function DatabaseStatusModal() {
  const { dbStatus, dbError, isDbModalOpen, setIsDbModalOpen, checkConnection, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSqlTab, setSelectedSqlTab] = useState<'roles_users' | 'full'>('roles_users');

  if (!isDbModalOpen) return null;

  const currentSql = selectedSqlTab === 'roles_users' ? ROLES_AND_USERS_SQL : SUPABASE_SQL_SCHEMA;

  const handleCopySql = () => {
    navigator.clipboard.writeText(currentSql);
    setCopied(true);
    showToast(
      selectedSqlTab === 'roles_users'
        ? 'تم نسخ كود SQL لإنشاء جدولي roles و app_users'
        : 'تم نسخ كود SQL لجميع الجداول',
      'success'
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkConnection();
    setIsRefreshing(false);
    showToast('تم تحديث حالة الاتصال بقاعدة البيانات', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-navy-900 border border-navy-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-navy-800 flex items-center justify-between bg-navy-850/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">اتصال قاعدة البيانات Supabase</h3>
              <p className="text-xs text-navy-400">مشروع معرف: {SUPABASE_PROJECT_ID}</p>
            </div>
          </div>
          <button
            onClick={() => setIsDbModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 flex items-center justify-center text-navy-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              dbStatus === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : dbStatus === 'pending_tables'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : dbStatus === 'checking'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            }`}
          >
            {dbStatus === 'connected' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {dbStatus === 'pending_tables' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {dbStatus === 'checking' && <RefreshCw className="w-5 h-5 text-blue-400 animate-spin shrink-0 mt-0.5" />}
            {dbStatus === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}

            <div className="flex-1">
              <div className="font-bold text-base">
                {dbStatus === 'connected' && 'قاعدة البيانات متصلة وجاهزة بالكامل'}
                {dbStatus === 'pending_tables' && 'تم الاتصال بـ Supabase (في انتظار تنفيذ كود إنشاء الجداول)'}
                {dbStatus === 'checking' && 'جاري التحقق من الاتصال بقاعدة البيانات...'}
                {dbStatus === 'error' && 'تعذر الاتصال بقاعدة البيانات'}
              </div>
              <p className="text-xs mt-1 opacity-90">
                {dbStatus === 'connected' &&
                  'جميع الجداول (الطلبات، الأصناف، المخزون، السائقين، المطبخ، الورديات، الحسابات) متزامنة مع Supabase لحظياً.'}
                {dbStatus === 'pending_tables' &&
                  'تم ربط مفاتيح Supabase بنجاح! يلزم فقط تشغيل كود الـ SQL أدناه لإنشاء الجداول وسيتم تفعيل المزامنة التلقائية فوراً.'}
                {dbStatus === 'error' && (dbError || 'يرجى مراجعة إعدادات المفاتيح أو حالة الاتصال.')}
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-medium flex items-center gap-1.5 transition-all shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </div>

          {/* Database Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-navy-800/40 border border-navy-700/60 rounded-xl space-y-1">
              <span className="text-navy-400">رابط Supabase URL:</span>
              <p className="font-mono text-navy-200 select-all truncate">
                https://ldbthhnykxrbpnhuvdxj.supabase.co
              </p>
            </div>
            <div className="p-3 bg-navy-800/40 border border-navy-700/60 rounded-xl space-y-1">
              <span className="text-navy-400">حالة المزامنة الحية (Realtime):</span>
              <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                مفعلة تلقائياً عبر WebSockets
              </p>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-navy-800/30 border border-navy-700/50 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" />
              خطوات تفعيل وتجهيز الجداول في Supabase:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs text-navy-300 leading-relaxed pr-1">
              <li>
                اضغط على زر <strong className="text-white">"فتح محرر SQL في Supabase"</strong> أدناه للانتقال لمشروعك مباشرة.
              </li>
              <li>
                اضغط على <strong className="text-white">"نسخ كود SQL"</strong> والصقه في صفحة محرر SQL.
              </li>
              <li>
                اضغط على زر <strong className="text-emerald-400 font-bold">Run (تشغيل)</strong> في Supabase.
              </li>
              <li>
                ارجع هنا واضغط على زر <strong className="text-brand-400 font-bold">"تحديث الاتصال"</strong>، وستبدأ قراءة البيانات الحية فوراً!
              </li>
            </ol>
          </div>

          {/* SQL Preview Box with Tabs */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-navy-950/80 border border-navy-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedSqlTab('roles_users')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedSqlTab === 'roles_users'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-navy-400 hover:text-white hover:bg-navy-800/50'
                  }`}
                >
                  الأدوار والمستخدمين (roles & app_users)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSqlTab('full')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedSqlTab === 'full'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-navy-400 hover:text-white hover:bg-navy-800/50'
                  }`}
                >
                  كافة جداول المنظومة (Full Schema)
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20 active:scale-95 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'تم النسخ!' : 'نسخ كود SQL'}
                </button>
                <a
                  href={SUPABASE_SQL_EDITOR_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  فتح محرر SQL
                </a>
              </div>
            </div>

            <div className="relative">
              <pre className="h-44 overflow-y-auto bg-navy-950/90 border border-navy-800 rounded-xl p-3 font-mono text-[11px] text-emerald-400/90 dir-ltr text-left selection:bg-brand-500 selection:text-white">
                {currentSql}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-navy-800 flex items-center justify-between bg-navy-850/60">
          <div className="text-xs text-navy-400">
            ملف الاسكربت متاح أيضاً في جذر المشروع: <code className="text-navy-200">supabase_schema.sql</code>
          </div>
          <button
            onClick={() => setIsDbModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
