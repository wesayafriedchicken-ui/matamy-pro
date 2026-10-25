import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Wallet,
  BookOpen,
  BarChart3,
  Percent,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import VatSettingsCard from '@/components/finance/VatSettingsCard';
import { formatCurrency } from '@/utils/helpers';

export default function TaxSettings() {
  const { taxRate, orders } = useApp();

  // Calculate tax statistics from orders
  const zeroTaxOrders = orders.filter((o) => !o.tax || o.tax === 0).length;
  const totalTaxCollected = orders.reduce((sum, o) => sum + (o.tax || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="المالية والخزينة"
        description="إدارة ضريبة القيمة المضافة (VAT) ونسبة الاحتساب على نقاط البيع والفواتير"
      />

      {/* Sub-route Navigation across Financials */}
      <div className="flex items-center gap-2 p-1.5 bg-navy-800/60 rounded-2xl w-fit flex-wrap border border-navy-700/50">
        <Link
          to="/financials/cash-drawer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-navy-300 hover:text-white hover:bg-navy-700/50 transition-all"
        >
          <Wallet className="w-4 h-4" />
          الخزينة اليومية
        </Link>
        <Link
          to="/financials/chart-of-accounts"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-navy-300 hover:text-white hover:bg-navy-700/50 transition-all"
        >
          <BookOpen className="w-4 h-4" />
          دليل الحسابات
        </Link>
        <Link
          to="/financials/reports"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-navy-300 hover:text-white hover:bg-navy-700/50 transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          التقارير والميزانية
        </Link>
        <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <Percent className="w-4 h-4" />
          إعدادات الضريبة (VAT)
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Percent}
          label="النسبة المطبقة حالياً في الـ POS"
          value={`${taxRate}% ${taxRate === 0 ? '(معفاة)' : ''}`}
          color={taxRate === 0 ? 'success' : 'brand'}
        />
        <StatCard
          icon={Receipt}
          label="طلبات بدون ضريبة (0%)"
          value={`${zeroTaxOrders} طلب`}
          color="blue"
        />
        <StatCard
          icon={FileSpreadsheet}
          label="إجمالي الضرائب المحصلة"
          value={formatCurrency(totalTaxCollected)}
          color="warning"
        />
      </div>

      {/* Main VAT Configuration Card */}
      <VatSettingsCard />

      {/* Info & Regulatory Guidelines */}
      <div className="glass-card p-5 border border-navy-700/60 rounded-2xl space-y-3 text-xs text-navy-300">
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ملاحظات تشغيلية للنظام المالي ونقاط البيع:
        </h4>
        <ul className="list-disc list-inside space-y-1.5 text-navy-400 pr-1">
          <li>
            تم ضبط ضريبة القيمة المضافة افتراضياً على <strong className="text-white">0%</strong> حسب الطلب، وبالتالي لن يتم إضافة أي مبالغ ضريبية لسلة المشتريات.
          </li>
          <li>
            أي تغيير لنسبة الضريبة في هذه الشاشة ينعكس مباشرة على شاشة إنشاء الطلبات الجديدة (POS) وسلة الحساب دون الحاجة لإعادة تحميل الصفحة.
          </li>
          <li>
            يتم تخزين القيمة محلياً وحفظها في إعدادات النظام المالي للمطعم، ويمكن تعديلها في أي وقت.
          </li>
          <li>
            يمكنك تفعيل أو تعطيل إظهار سطر <strong className="text-white">"ضريبة القيمة المضافة (0%)"</strong> في سلة الطلب والحساب (POS) من زر التحكم المخصص أعلاه.
          </li>
        </ul>
      </div>
    </div>
  );
}
