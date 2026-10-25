import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Wallet, BookOpen, BarChart3, TrendingUp, TrendingDown,
  DollarSign, Scale, Building2, CheckCircle2, Calendar,
  Download, FileText, PieChart, Percent,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

type DateRange = 'today' | 'week' | 'month' | 'custom';

interface PLLine {
  labelAr: string;
  labelEn: string;
  amount: number;
  type: 'revenue' | 'expense';
  indent?: boolean;
}

const plData: Record<DateRange, PLLine[]> = {
  today: [
    { labelAr: 'مبيعات الصالة', labelEn: 'Dine-in Sales', amount: 3420, type: 'revenue' },
    { labelAr: 'مبيعات التوصيل والتطبيق', labelEn: 'Delivery & App', amount: 4550, type: 'revenue' },
    { labelAr: 'خدمات إضافية', labelEn: 'Additional Services', amount: 450, type: 'revenue' },
    { labelAr: 'إجمالي الإيرادات', labelEn: 'Total Revenue', amount: 8420, type: 'revenue' },
    { labelAr: 'تكلفة البضاعة المباعة (COGS)', labelEn: 'COGS', amount: 2200, type: 'expense', indent: true },
    { labelAr: 'رواتب وأجور', labelEn: 'Salaries', amount: 1500, type: 'expense', indent: true },
    { labelAr: 'إيجار', labelEn: 'Rent', amount: 1000, type: 'expense', indent: true },
    { labelAr: 'فواتير تشغيلية', labelEn: 'Utilities', amount: 450, type: 'expense', indent: true },
    { labelAr: 'إجمالي المصروفات', labelEn: 'Total Expenses', amount: 5150, type: 'expense' },
    { labelAr: 'صافي الربح', labelEn: 'Net Profit', amount: 3270, type: 'revenue' },
  ],
  week: [
    { labelAr: 'مبيعات الصالة', labelEn: 'Dine-in Sales', amount: 24500, type: 'revenue' },
    { labelAr: 'مبيعات التوصيل والتطبيق', labelEn: 'Delivery & App', amount: 31200, type: 'revenue' },
    { labelAr: 'خدمات إضافية', labelEn: 'Additional Services', amount: 2800, type: 'revenue' },
    { labelAr: 'إجمالي الإيرادات', labelEn: 'Total Revenue', amount: 58500, type: 'revenue' },
    { labelAr: 'تكلفة البضاعة المباعة (COGS)', labelEn: 'COGS', amount: 15400, type: 'expense', indent: true },
    { labelAr: 'رواتب وأجور', labelEn: 'Salaries', amount: 10500, type: 'expense', indent: true },
    { labelAr: 'إيجار', labelEn: 'Rent', amount: 7000, type: 'expense', indent: true },
    { labelAr: 'فواتير تشغيلية', labelEn: 'Utilities', amount: 3150, type: 'expense', indent: true },
    { labelAr: 'إجمالي المصروفات', labelEn: 'Total Expenses', amount: 36050, type: 'expense' },
    { labelAr: 'صافي الربح', labelEn: 'Net Profit', amount: 22450, type: 'revenue' },
  ],
  month: [
    { labelAr: 'مبيعات الصالة', labelEn: 'Dine-in Sales', amount: 105000, type: 'revenue' },
    { labelAr: 'مبيعات التوصيل والتطبيق', labelEn: 'Delivery & App', amount: 134000, type: 'revenue' },
    { labelAr: 'خدمات إضافية', labelEn: 'Additional Services', amount: 12000, type: 'revenue' },
    { labelAr: 'إجمالي الإيرادات', labelEn: 'Total Revenue', amount: 251000, type: 'revenue' },
    { labelAr: 'تكلفة البضاعة المباعة (COGS)', labelEn: 'COGS', amount: 66200, type: 'expense', indent: true },
    { labelAr: 'رواتب وأجور', labelEn: 'Salaries', amount: 45000, type: 'expense', indent: true },
    { labelAr: 'إيجار', labelEn: 'Rent', amount: 30000, type: 'expense', indent: true },
    { labelAr: 'فواتير تشغيلية', labelEn: 'Utilities', amount: 13500, type: 'expense', indent: true },
    { labelAr: 'إجمالي المصروفات', labelEn: 'Total Expenses', amount: 154700, type: 'expense' },
    { labelAr: 'صافي الربح', labelEn: 'Net Profit', amount: 96300, type: 'revenue' },
  ],
  custom: [
    { labelAr: 'مبيعات الصالة', labelEn: 'Dine-in Sales', amount: 68000, type: 'revenue' },
    { labelAr: 'مبيعات التوصيل والتطبيق', labelEn: 'Delivery & App', amount: 89000, type: 'revenue' },
    { labelAr: 'خدمات إضافية', labelEn: 'Additional Services', amount: 7500, type: 'revenue' },
    { labelAr: 'إجمالي الإيرادات', labelEn: 'Total Revenue', amount: 164500, type: 'revenue' },
    { labelAr: 'تكلفة البضاعة المباعة (COGS)', labelEn: 'COGS', amount: 43000, type: 'expense', indent: true },
    { labelAr: 'رواتب وأجور', labelEn: 'Salaries', amount: 28000, type: 'expense', indent: true },
    { labelAr: 'إيجار', labelEn: 'Rent', amount: 20000, type: 'expense', indent: true },
    { labelAr: 'فواتير تشغيلية', labelEn: 'Utilities', amount: 9000, type: 'expense', indent: true },
    { labelAr: 'إجمالي المصروفات', labelEn: 'Total Expenses', amount: 100000, type: 'expense' },
    { labelAr: 'صافي الربح', labelEn: 'Net Profit', amount: 64500, type: 'revenue' },
  ],
};

const rangeLabels: Record<DateRange, string> = {
  today: 'اليوم',
  week: 'هذا الأسبوع',
  month: 'هذا الشهر',
  custom: 'مخصص',
};

const balanceSheet = {
  assets: 485000,
  liabilities: 145000,
  equity: 340000,
};

export default function FinancialReports() {
  const { taxRate } = useApp();
  const [range, setRange] = useState<DateRange>('month');
  const lines = plData[range];

  const totalRevenue = lines.find((l) => l.labelEn === 'Total Revenue')?.amount ?? 0;
  const totalExpenses = lines.find((l) => l.labelEn === 'Total Expenses')?.amount ?? 0;
  const netProfit = lines.find((l) => l.labelEn === 'Net Profit')?.amount ?? 0;
  const cashOnHand = 4845;

  const totalBalance = balanceSheet.assets + balanceSheet.liabilities + balanceSheet.equity;
  const assetsPct = (balanceSheet.assets / totalBalance) * 100;
  const liabPct = (balanceSheet.liabilities / totalBalance) * 100;
  const equityPct = (balanceSheet.equity / totalBalance) * 100;
  const isBalanced = balanceSheet.assets === (balanceSheet.liabilities + balanceSheet.equity);

  return (
    <div className="animate-fade-in">
      <PageHeader title="المالية والخزينة" description="التقارير المالية وقائمة الدخل والميزانية" />

      {/* Sub-route nav */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit flex-wrap border border-navy-700/50">
        <Link to="/financials/cash-drawer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Wallet className="w-4 h-4" />
          الخزينة اليومية
        </Link>
        <Link to="/financials/chart-of-accounts" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <BookOpen className="w-4 h-4" />
          دليل الحسابات
        </Link>
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <BarChart3 className="w-4 h-4" />
          التقارير والميزانية
        </span>
        <Link to="/financials/tax-settings" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Percent className="w-4 h-4 text-brand-400" />
          إعدادات الضريبة (VAT: {taxRate}%)
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={TrendingUp} label="إجمالي الإيرادات" value={formatCurrency(totalRevenue)} color="success" />
        <StatCard icon={TrendingDown} label="إجمالي المصروفات" value={formatCurrency(totalExpenses)} color="danger" />
        <StatCard icon={DollarSign} label="صافي الربح" value={formatCurrency(netProfit)} color="brand" />
        <StatCard icon={Wallet} label="النقدية بالخزينة" value={formatCurrency(cashOnHand)} color="blue" />
      </div>

      {/* Balance Sheet Bar */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-400" />
            الميزانية المختصرة
          </h3>
          <button className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-1.5">
            <Download className="w-3.5 h-3.5" />
            تصدير
          </button>
        </div>

        {/* Proportion bars */}
        <div className="space-y-4">
          <BalanceBar label="الأصول (Assets)" amount={balanceSheet.assets} pct={assetsPct} color="bg-success-500" icon={Building2} />
          <BalanceBar label="الالتزامات (Liabilities)" amount={balanceSheet.liabilities} pct={liabPct} color="bg-danger-500" icon={Scale} />
          <BalanceBar label="حقوق الملكية + الأرباح (Equity)" amount={balanceSheet.equity} pct={equityPct} color="bg-blue-500" icon={TrendingUp} />
        </div>

        {/* Balanced check banner */}
        <div className={`mt-4 rounded-xl px-4 py-3 border flex items-center gap-3 ${
          isBalanced
            ? 'bg-success-500/10 border-success-500/20'
            : 'bg-danger-500/10 border-danger-500/20'
        }`}>
          {isBalanced ? (
            <CheckCircle2 className="w-5 h-5 text-success-400" />
          ) : (
            <Scale className="w-5 h-5 text-danger-400" />
          )}
          <div>
            <p className={`text-sm font-medium ${isBalanced ? 'text-success-400' : 'text-danger-400'}`}>
              {isBalanced ? 'الميزانية متوازنة' : 'الميزانية غير متوازنة'}
            </p>
            <p className="text-navy-400 text-xs">
              الأرقام تتحدث تلقائياً مع قيود المبيعات والمخزن — الأصول = {formatCurrency(balanceSheet.assets)} | الالتزامات + حقوق الملكية = {formatCurrency(balanceSheet.liabilities + balanceSheet.equity)}
            </p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <Calendar className="w-4 h-4 text-navy-400" />
        <div className="flex items-center gap-1 p-1 bg-navy-800/60 rounded-xl">
          {(['today', 'week', 'month', 'custom'] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${range === r ? 'bg-brand-500 text-white' : 'text-navy-400 hover:text-white'}`}
            >
              {rangeLabels[r]}
            </button>
          ))}
        </div>
        {range === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" className="input-field w-auto text-sm" />
            <span className="text-navy-400 text-sm">إلى</span>
            <input type="date" className="input-field w-auto text-sm" />
          </div>
        )}
        <span className="text-navy-400 text-sm mr-auto">عرض: {rangeLabels[range]}</span>
      </div>

      {/* P&L Breakdown */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-700/50 flex items-center justify-between">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <PieChart className="w-5 h-5 text-brand-400" />
            قائمة الدخل (Profit & Loss)
          </h3>
          <button className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-1.5">
            <FileText className="w-3.5 h-3.5" />
            تصدير PDF
          </button>
        </div>
        <div className="p-5">
          <div className="space-y-1">
            {lines.map((line, idx) => {
              const isHeader = line.labelEn.includes('Total') || line.labelEn === 'Net Profit';
              const isNetProfit = line.labelEn === 'Net Profit';
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                    isNetProfit
                      ? 'bg-brand-500/10 border border-brand-500/20 mt-3'
                      : isHeader
                        ? 'bg-navy-800/40 border border-navy-700/30'
                        : line.indent
                          ? 'bg-transparent hover:bg-navy-800/20'
                          : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {line.indent && <span className="w-4 shrink-0" />}
                    <span className={`${isHeader ? 'text-white font-bold' : isNetProfit ? 'text-brand-400 font-bold' : 'text-navy-200'} ${isNetProfit ? 'text-base' : 'text-sm'}`}>
                      {line.labelAr}
                    </span>
                    <span className="text-navy-500 text-xs">— {line.labelEn}</span>
                  </div>
                  <span className={`font-mono font-bold ${isNetProfit ? 'text-brand-400 text-lg' : line.type === 'revenue' ? (isHeader ? 'text-success-400' : 'text-success-400') : (isHeader ? 'text-danger-400' : 'text-danger-400')} ${isHeader ? 'text-base' : 'text-sm'}`}>
                    {line.type === 'expense' && !isHeader && !isNetProfit ? '-' : ''}{formatCurrency(line.amount)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Profit margin */}
          <div className="mt-4 pt-4 border-t border-navy-700/30">
            <div className="flex items-center justify-between">
              <span className="text-navy-300 text-sm">هامش الربح</span>
              <span className="text-brand-400 text-sm font-bold">
                {totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 bg-navy-800 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-l from-brand-500 to-success-500 rounded-full transition-all duration-500" style={{ width: `${totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceBar({ label, amount, pct, color, icon: Icon }: { label: string; amount: number; pct: number; color: string; icon: typeof Building2 }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-navy-300" />
          <span className="text-navy-200 text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-navy-400 text-xs">{Math.round(pct)}%</span>
          <span className="text-white text-sm font-mono font-bold">{formatCurrency(amount)}</span>
        </div>
      </div>
      <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
