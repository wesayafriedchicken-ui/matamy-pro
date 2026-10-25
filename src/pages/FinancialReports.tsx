import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Wallet, BookOpen, BarChart3, TrendingUp, TrendingDown,
  DollarSign, Scale, Building2, CheckCircle2, Calendar,
  PieChart, Percent,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import type { CashMovement } from '@/pages/CashDrawer';
import type { AccountNode } from '@/pages/ChartOfAccounts';

type DateRange = 'today' | 'week' | 'month' | 'custom';

const rangeLabels: Record<DateRange, string> = {
  today: 'اليوم',
  week: 'هذا الأسبوع',
  month: 'هذا الشهر',
  custom: 'الكل / مخصص',
};

export default function FinancialReports() {
  const { taxRate, orders, transactions } = useApp();
  const [range, setRange] = useState<DateRange>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // 1. Get real Cash on Hand from cash movements (ZERO fake data)
  const cashOnHand = useMemo(() => {
    try {
      const saved = localStorage.getItem('nine_fries_cash_movements_v2');
      if (saved) {
        const parsed: CashMovement[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[parsed.length - 1].balanceAfter;
        }
      }
    } catch {
      // ignore
    }
    return 0; // Starts at 0
  }, []);

  // 2. Get real Balance Sheet figures from the persistent Chart of Accounts
  const balanceSheet = useMemo(() => {
    let assets = 0;
    let liabilities = 0;
    let equity = 0;

    try {
      const saved = localStorage.getItem('nine_fries_chart_of_accounts_v2');
      if (saved) {
        const parsed: AccountNode[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const aNode = parsed.find((n) => n.code === '1');
          const lNode = parsed.find((n) => n.code === '2');
          const eNode = parsed.find((n) => n.code === '3');
          if (aNode) assets = Number(aNode.balance) || 0;
          if (lNode) liabilities = Number(lNode.balance) || 0;
          if (eNode) equity = Number(eNode.balance) || 0;
        }
      }
    } catch {
      // ignore
    }

    return { assets, liabilities, equity };
  }, []);

  // 3. Filter orders and transactions by range
  const isDateInRange = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;
    const now = new Date();

    if (range === 'today') {
      return d.toDateString() === now.toDateString();
    } else if (range === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return d >= sevenDaysAgo && d <= now;
    } else if (range === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } else if (range === 'custom') {
      if (customStartDate && d < new Date(customStartDate)) return false;
      if (customEndDate && d > new Date(`${customEndDate}T23:59:59`)) return false;
      return true;
    }
    return true;
  }, [range, customStartDate, customEndDate]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => isDateInRange(o.createdAt));
  }, [orders, isDateInRange]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => isDateInRange(t.date));
  }, [transactions, isDateInRange]);

  // 4. Calculate Real Profit & Loss Lines from real orders & transactions
  const { lines, totalRevenue, totalExpenses, netProfit } = useMemo(() => {
    // Only paid orders count toward confirmed revenue
    const paidOrders = filteredOrders.filter((o) => o.paid);

    const dineInSales = paidOrders
      .filter((o) => o.deliveryType === 'dine_in')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const deliveryAndAppSales = paidOrders
      .filter((o) => o.deliveryType === 'delivery' || o.deliveryType === 'talabat' || o.deliveryType === 'takeaway')
      .reduce((sum, o) => sum + ((o.total || 0) - (o.deliveryFee || 0)), 0);

    const additionalFees = paidOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    const revTotal = dineInSales + deliveryAndAppSales + additionalFees;

    // Categorize real expenses
    const expenseTxs = filteredTransactions.filter((t) => t.type === 'expense');

    const cogs = expenseTxs
      .filter((t) => {
        const cat = (t.category + ' ' + (t.categoryAr || '')).toLowerCase();
        return cat.includes('cogs') || cat.includes('inventory') || cat.includes('مخزون') || cat.includes('بضاعة') || cat.includes('شراء') || cat.includes('لحوم') || cat.includes('دجاج');
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const salaries = expenseTxs
      .filter((t) => {
        const cat = (t.category + ' ' + (t.categoryAr || '')).toLowerCase();
        return cat.includes('salaries') || cat.includes('salary') || cat.includes('رواتب') || cat.includes('أجور');
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const rent = expenseTxs
      .filter((t) => {
        const cat = (t.category + ' ' + (t.categoryAr || '')).toLowerCase();
        return cat.includes('rent') || cat.includes('إيجار');
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const utilities = expenseTxs
      .filter((t) => {
        const cat = (t.category + ' ' + (t.categoryAr || '')).toLowerCase();
        return cat.includes('utilities') || cat.includes('صيانة') || cat.includes('كهرباء') || cat.includes('مرافق') || cat.includes('ماء') || cat.includes('غاز');
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const others = expenseTxs
      .filter((t) => {
        const cat = (t.category + ' ' + (t.categoryAr || '')).toLowerCase();
        const matchesKnown =
          cat.includes('cogs') || cat.includes('inventory') || cat.includes('مخزون') || cat.includes('بضاعة') || cat.includes('شراء') || cat.includes('لحوم') || cat.includes('دجاج') ||
          cat.includes('salaries') || cat.includes('salary') || cat.includes('رواتب') || cat.includes('أجور') ||
          cat.includes('rent') || cat.includes('إيجار') ||
          cat.includes('utilities') || cat.includes('صيانة') || cat.includes('كهرباء') || cat.includes('مرافق') || cat.includes('ماء') || cat.includes('غاز');
        return !matchesKnown;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expTotal = cogs + salaries + rent + utilities + others;
    const profit = revTotal - expTotal;

    const dynamicLines = [
      { labelAr: 'مبيعات الصالة', labelEn: 'Dine-in Sales', amount: dineInSales, type: 'revenue' as const },
      { labelAr: 'مبيعات التوصيل والتطبيقات', labelEn: 'Delivery & App Sales', amount: deliveryAndAppSales, type: 'revenue' as const },
      { labelAr: 'خدمات وتوصيل إضافية', labelEn: 'Delivery & Extra Services', amount: additionalFees, type: 'revenue' as const },
      { labelAr: 'إجمالي الإيرادات', labelEn: 'Total Revenue', amount: revTotal, type: 'revenue' as const },
      { labelAr: 'تكلفة البضاعة المباعة (COGS)', labelEn: 'Cost of Goods Sold', amount: cogs, type: 'expense' as const, indent: true },
      { labelAr: 'رواتب وأجور الموظفين', labelEn: 'Salaries & Wages', amount: salaries, type: 'expense' as const, indent: true },
      { labelAr: 'إيجار المحل', labelEn: 'Rent Expense', amount: rent, type: 'expense' as const, indent: true },
      { labelAr: 'فواتير ومرافق وتشغيل', labelEn: 'Utilities & Maintenance', amount: utilities, type: 'expense' as const, indent: true },
      { labelAr: 'مصروفات نثرية وتشغيلية أخرى', labelEn: 'Other Operational Expenses', amount: others, type: 'expense' as const, indent: true },
      { labelAr: 'إجمالي المصروفات', labelEn: 'Total Expenses', amount: expTotal, type: 'expense' as const },
      { labelAr: 'صافي الربح الفعلي', labelEn: 'Net Profit', amount: profit, type: 'revenue' as const },
    ];

    return {
      lines: dynamicLines,
      totalRevenue: revTotal,
      totalExpenses: expTotal,
      netProfit: profit,
    };
  }, [filteredOrders, filteredTransactions]);

  const totalBalance = balanceSheet.assets + balanceSheet.liabilities + balanceSheet.equity;
  const assetsPct = totalBalance > 0 ? (balanceSheet.assets / totalBalance) * 100 : 0;
  const liabPct = totalBalance > 0 ? (balanceSheet.liabilities / totalBalance) * 100 : 0;
  const equityPct = totalBalance > 0 ? (balanceSheet.equity / totalBalance) * 100 : 0;
  const isBalanced = balanceSheet.assets === (balanceSheet.liabilities + balanceSheet.equity);

  return (
    <div className="animate-fade-in">
      <PageHeader title="المالية والخزينة" description="التقارير المالية وقائمة الدخل الحقيقية والميزانية" />

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

      {/* Real KPI Cards - completely derived from real transactions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={TrendingUp} label="إجمالي الإيرادات" value={formatCurrency(totalRevenue)} color="success" />
        <StatCard icon={TrendingDown} label="إجمالي المصروفات" value={formatCurrency(totalExpenses)} color="danger" />
        <StatCard icon={DollarSign} label="صافي الربح" value={formatCurrency(netProfit)} color={netProfit >= 0 ? 'brand' : 'danger'} />
        <StatCard icon={Wallet} label="النقدية الحالية بالخزينة" value={formatCurrency(cashOnHand)} color="blue" />
      </div>

      {/* Balance Sheet Bar */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-400" />
            الميزانية العمومية المختصرة (من واقع الشجرة المحاسبية)
          </h3>
          <Link
            to="/financials/chart-of-accounts"
            className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-1.5 text-navy-300 hover:text-white"
          >
            <BookOpen className="w-3.5 h-3.5" />
            تعديل أرصدة الشجرة
          </Link>
        </div>

        {/* Proportion bars */}
        <div className="space-y-4">
          <BalanceBar label="الأصول (Assets)" amount={balanceSheet.assets} pct={assetsPct} color="bg-success-500" icon={Building2} />
          <BalanceBar label="الالتزامات (Liabilities)" amount={balanceSheet.liabilities} pct={liabPct} color="bg-danger-500" icon={Scale} />
          <BalanceBar label="حقوق الملكية (Equity)" amount={balanceSheet.equity} pct={equityPct} color="bg-blue-500" icon={TrendingUp} />
        </div>

        {/* Balanced check banner */}
        <div className={`mt-4 rounded-xl px-4 py-3 border flex items-center gap-3 ${
          isBalanced
            ? 'bg-success-500/10 border-success-500/20'
            : 'bg-danger-500/10 border-danger-500/20'
        }`}>
          {isBalanced ? (
            <CheckCircle2 className="w-5 h-5 text-success-400 shrink-0" />
          ) : (
            <Scale className="w-5 h-5 text-danger-400 shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium ${isBalanced ? 'text-success-400' : 'text-danger-400'}`}>
              {isBalanced ? 'الميزانية متوازنة محاسبياً' : 'تنبيه: الميزانية غير متوازنة'}
            </p>
            <p className="text-navy-400 text-xs">
              الأصول = {formatCurrency(balanceSheet.assets)} | الالتزامات + حقوق الملكية = {formatCurrency(balanceSheet.liabilities + balanceSheet.equity)}
            </p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-navy-800/60 rounded-xl border border-navy-700/50">
          {(['today', 'week', 'month', 'custom'] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                range === r ? 'bg-brand-500 text-white shadow' : 'text-navy-300 hover:text-white'
              }`}
            >
              {rangeLabels[r]}
            </button>
          ))}
        </div>

        {range === 'custom' && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-navy-400 text-xs">من:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="input-field w-auto text-xs py-1.5"
            />
            <span className="text-navy-400 text-xs">إلى:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="input-field w-auto text-xs py-1.5"
            />
          </div>
        )}

        <span className="text-navy-400 text-xs mr-auto flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          النطاق الزمني: {rangeLabels[range]}
        </span>
      </div>

      {/* P&L Breakdown */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-700/50 flex items-center justify-between">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <PieChart className="w-5 h-5 text-brand-400" />
            قائمة الدخل والأرباح الحقيقية (Profit & Loss)
          </h3>
          <span className="text-navy-400 text-xs font-mono">
            {filteredOrders.length} طلبات | {filteredTransactions.length} معاملات
          </span>
        </div>

        <div className="p-5">
          <div className="space-y-1">
            {lines.map((line, idx) => {
              const isHeader = line.labelEn.includes('Total') || line.labelEn === 'Net Profit';
              const isNetProfit = line.labelEn === 'Net Profit';
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${
                    isNetProfit
                      ? 'bg-brand-500/15 border border-brand-500/30 mt-3'
                      : isHeader
                        ? 'bg-navy-800/40 border border-navy-700/30'
                        : line.indent
                          ? 'bg-transparent hover:bg-navy-800/20'
                          : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {line.indent && <span className="w-4 shrink-0" />}
                    <span className={`${isHeader ? 'text-white font-bold' : isNetProfit ? 'text-brand-300 font-bold' : 'text-navy-200'} ${isNetProfit ? 'text-base' : 'text-sm'}`}>
                      {line.labelAr}
                    </span>
                    <span className="text-navy-500 text-xs hidden sm:inline">— {line.labelEn}</span>
                  </div>
                  <span className={`font-mono font-bold ${
                    isNetProfit
                      ? (line.amount >= 0 ? 'text-brand-300 text-lg' : 'text-danger-400 text-lg')
                      : line.type === 'revenue'
                        ? 'text-success-400'
                        : 'text-danger-400'
                  } ${isHeader ? 'text-base' : 'text-sm'}`}>
                    {line.type === 'expense' && !isHeader && !isNetProfit && line.amount > 0 ? '-' : ''}
                    {formatCurrency(line.amount)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Profit margin */}
          <div className="mt-5 pt-4 border-t border-navy-700/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-navy-300 text-sm font-medium">هامش الربح التشغيلي</span>
              <span className="text-brand-400 text-sm font-bold font-mono">
                {totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%
              </span>
            </div>
            <div className="h-2.5 bg-navy-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-brand-500 to-success-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0))}%` }}
              />
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
          <span className="text-navy-400 text-xs font-mono">{Math.round(pct)}%</span>
          <span className="text-white text-sm font-mono font-bold">{formatCurrency(amount)}</span>
        </div>
      </div>
      <div className="h-2.5 bg-navy-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
    </div>
  );
}
