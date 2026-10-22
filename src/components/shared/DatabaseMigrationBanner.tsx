import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ROLES_AND_USERS_SQL } from '@/data/supabaseSchema';
import { SUPABASE_PROJECT_ID, SUPABASE_SQL_EDITOR_URL } from '@/lib/supabase';

export default function DatabaseMigrationBanner() {
  const { rolesTableExists, usersTableExists, dbStatus, checkConnection, showToast } = useApp();
  const [isCopied, setIsCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const bothTablesExist = rolesTableExists && usersTableExists;

  const handleCopySql = () => {
    navigator.clipboard.writeText(ROLES_AND_USERS_SQL);
    setIsCopied(true);
    showToast('تم نسخ كود SQL لإنشاء جدولي roles و app_users إلى الحافظة', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleRefresh = async () => {
    setIsChecking(true);
    await checkConnection();
    setIsChecking(false);
    showToast('تم فحص حالة جداول قاعدة البيانات', 'info');
  };

  if (bothTablesExist && dbStatus === 'connected') {
    return (
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold">المزامنة السحابية مكتملة:</span>{' '}
            <span className="text-emerald-200">
              جدولا الأدوار (<code className="font-mono text-emerald-300">roles</code>) والمستخدمين (<code className="font-mono text-emerald-300">app_users</code>) مفعلة ومتزامنة حياً مع Supabase.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold border border-emerald-500/30">
            Live Realtime Sync
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-navy-900 to-navy-950 border border-amber-500/30 shadow-xl space-y-4">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>تنبيه المزامنة السحابية: يلزم تشغيل كود إنشاء جدولي الأدوار والمستخدمين في Supabase</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                PGRST205 / Tables Pending
              </span>
            </h4>
            <p className="text-xs text-navy-300 mt-1 leading-relaxed">
              مشروع Supabase الخاص بك (<span className="text-brand-300 font-mono font-semibold">{SUPABASE_PROJECT_ID}</span>) متصل وجداول الطلبات والمخزون تعمل.
              لكن جدولي <strong className="text-amber-300 font-mono">roles</strong> و <strong className="text-amber-300 font-mono">app_users</strong> لم يتم إنشاؤهما بعد داخل قاعدة البيانات السحابية.
              (النظام يعمل حالياً بالحفظ المحلي السريع بدون توقف).
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 pr-12 sm:pr-0">
          <button
            type="button"
            onClick={handleCopySql}
            className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-500/20"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isCopied ? 'تم النسخ!' : 'نسخ كود SQL'}</span>
          </button>

          <a
            href={SUPABASE_SQL_EDITOR_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost py-2 px-3 text-xs font-semibold flex items-center gap-1.5 text-navy-200 hover:text-white border border-navy-700 bg-navy-850"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>محرر SQL في Supabase</span>
          </a>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isChecking}
            className="btn-ghost py-2 px-3 text-xs font-semibold flex items-center gap-1.5 text-navy-200 hover:text-white border border-navy-700 bg-navy-850"
            title="إعادة فحص الاتصال"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>تحديث الفحص</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="btn-ghost py-2 px-2.5 text-xs font-medium text-navy-300 hover:text-white border border-navy-700"
          >
            <Code2 className="w-3.5 h-3.5" />
            {showCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Step Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-1 text-xs">
        <div className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
          <span className="text-navy-300">انسخ كود SQL بالزر أعلاه</span>
        </div>
        <div className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
          <span className="text-navy-300">افتح محرر SQL في Supabase</span>
        </div>
        <div className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
          <span className="text-navy-300">الصق الكود واضغط Run (تشغيل)</span>
        </div>
        <div className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
          <span className="text-navy-300">اضغط "تحديث الفحص" للتأكيد</span>
        </div>
      </div>

      {/* Collapsible SQL preview */}
      {showCode && (
        <div className="space-y-2 pt-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-navy-400">
            <span>كود SQL الخاص بإنشاء الجداول وصلاحيات الوصول والبيانات الأولية:</span>
            <span className="font-mono text-[11px]">public.roles & public.app_users</span>
          </div>
          <pre className="p-3.5 bg-navy-950 border border-navy-800 rounded-2xl font-mono text-[11px] text-emerald-400/90 dir-ltr text-left overflow-x-auto max-h-56 overflow-y-auto selection:bg-brand-500 selection:text-white">
            {ROLES_AND_USERS_SQL}
          </pre>
        </div>
      )}
    </div>
  );
}
