import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Wallet, BookOpen, BarChart3, ChevronLeft,
  Plus, Search, X, Save, Building2,
  CreditCard, Package, Truck, Scale, Banknote, Wrench,
  Users, Percent, TrendingUp, Store, Bike, UtensilsCrossed,
  Home, Zap, Receipt,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';

interface AccountNode {
  code: string;
  nameAr: string;
  nameEn: string;
  balance: number;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  icon: typeof Wallet;
  children?: AccountNode[];
}

const accountTree: AccountNode[] = [
  {
    code: '1', nameAr: 'الأصول', nameEn: 'Assets', balance: 485000, type: 'asset', icon: Building2,
    children: [
      {
        code: '1.1', nameAr: 'الأصول المتداولة', nameEn: 'Current Assets', balance: 285000, type: 'asset', icon: Wallet,
        children: [
          { code: '1.1.1', nameAr: 'الخزينة', nameEn: 'Cash Drawer', balance: 4845, type: 'asset', icon: Banknote },
          { code: '1.1.2', nameAr: 'البنك', nameEn: 'Bank', balance: 120000, type: 'asset', icon: CreditCard },
          { code: '1.1.3', nameAr: 'المخزون', nameEn: 'Inventory', balance: 85000, type: 'asset', icon: Package },
          { code: '1.1.4', nameAr: 'عهد المناديب', nameEn: 'Rider Custody', balance: 2155, type: 'asset', icon: Bike },
        ],
      },
      {
        code: '1.2', nameAr: 'الأصول الثابتة', nameEn: 'Fixed Assets', balance: 200000, type: 'asset', icon: Wrench,
        children: [
          { code: '1.2.1', nameAr: 'معدات المطبخ', nameEn: 'Kitchen Equipment', balance: 150000, type: 'asset', icon: UtensilsCrossed },
          { code: '1.2.2', nameAr: 'الديكور والأثاث', nameEn: 'Furniture & Decor', balance: 50000, type: 'asset', icon: Home },
        ],
      },
    ],
  },
  {
    code: '2', nameAr: 'الالتزامات', nameEn: 'Liabilities', balance: 145000, type: 'liability', icon: Scale,
    children: [
      { code: '2.1', nameAr: 'مستحقات الموردين', nameEn: 'Accounts Payable', balance: 85000, type: 'liability', icon: Truck },
      { code: '2.2', nameAr: 'رواتب مستحقة', nameEn: 'Accrued Salaries', balance: 45000, type: 'liability', icon: Users },
      { code: '2.3', nameAr: 'ضريبة القيمة المضافة', nameEn: 'VAT Payable', balance: 15000, type: 'liability', icon: Percent },
    ],
  },
  {
    code: '3', nameAr: 'حقوق الملكية', nameEn: 'Equity', balance: 340000, type: 'equity', icon: TrendingUp,
    children: [
      { code: '3.1', nameAr: 'رأس المال', nameEn: 'Capital', balance: 300000, type: 'equity', icon: Wallet },
      { code: '3.2', nameAr: 'الأرباح المحتجزة', nameEn: 'Retained Earnings', balance: 40000, type: 'equity', icon: TrendingUp },
    ],
  },
  {
    code: '4', nameAr: 'الإيرادات', nameEn: 'Revenue', balance: 8420, type: 'revenue', icon: Store,
    children: [
      { code: '4.1', nameAr: 'مبيعات الصالة', nameEn: 'Dine-in Sales', balance: 3420, type: 'revenue', icon: UtensilsCrossed },
      { code: '4.2', nameAr: 'مبيعات التوصيل والتطبيق', nameEn: 'Delivery & App Sales', balance: 4550, type: 'revenue', icon: Bike },
      { code: '4.3', nameAr: 'خدمات إضافية', nameEn: 'Additional Services', balance: 450, type: 'revenue', icon: Receipt },
    ],
  },
  {
    code: '5', nameAr: 'المصروفات', nameEn: 'Expenses', balance: 5150, type: 'expense', icon: Receipt,
    children: [
      { code: '5.1', nameAr: 'تكلفة البضاعة المباعة (COGS)', nameEn: 'Cost of Goods Sold', balance: 2200, type: 'expense', icon: Package },
      { code: '5.2', nameAr: 'رواتب وأجور', nameEn: 'Salaries & Wages', balance: 1500, type: 'expense', icon: Users },
      { code: '5.3', nameAr: 'إيجار', nameEn: 'Rent', balance: 1000, type: 'expense', icon: Home },
      { code: '5.4', nameAr: 'فواتير تشغيلية', nameEn: 'Utilities', balance: 450, type: 'expense', icon: Zap },
    ],
  },
];

const typeColors: Record<string, string> = {
  asset: 'text-success-400',
  liability: 'text-danger-400',
  equity: 'text-blue-400',
  revenue: 'text-brand-400',
  expense: 'text-warning-400',
};

const typeBgs: Record<string, string> = {
  asset: 'bg-success-500/10',
  liability: 'bg-danger-500/10',
  equity: 'bg-blue-500/10',
  revenue: 'bg-brand-500/10',
  expense: 'bg-warning-500/10',
};

export default function ChartOfAccounts() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2', '3', '4', '5']));
  const [search, setSearch] = useState('');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const { showToast, taxRate } = useApp();

  const toggleExpand = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const matchesSearch = (node: AccountNode): boolean => {
    if (!search) return true;
    const q = search.toLowerCase();
    return node.nameAr.includes(search) || node.nameEn.toLowerCase().includes(q) || node.code.includes(search);
  };

  const nodeHasMatch = (node: AccountNode): boolean => {
    if (matchesSearch(node)) return true;
    return (node.children ?? []).some((c) => nodeHasMatch(c));
  };

  const renderNode = (node: AccountNode, depth: number): React.ReactNode => {
    if (!nodeHasMatch(node)) return null;
    const isExpanded = expanded.has(node.code) || (!!search && nodeHasMatch(node));
    const hasChildren = (node.children?.length ?? 0) > 0;
    const NodeIcon = node.icon;

    return (
      <div key={node.code}>
        <div
          className={`flex items-center gap-3 px-4 py-3 hover:bg-navy-800/30 transition-colors cursor-pointer ${depth === 0 ? 'border-b border-navy-700/30' : ''}`}
          style={{ paddingRight: `${depth * 24 + 16}px` }}
          onClick={() => hasChildren && toggleExpand(node.code)}
        >
          {hasChildren ? (
            <button className="shrink-0 w-5 h-5 flex items-center justify-center text-navy-400">
              <ChevronLeft className={`w-4 h-4 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeBgs[node.type]}`}>
            <NodeIcon className={`w-4 h-4 ${typeColors[node.type]}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-navy-400 text-xs font-mono shrink-0">{node.code}</span>
              <span className={`text-sm font-medium ${depth === 0 ? 'text-white font-bold' : 'text-navy-100'}`}>{node.nameAr}</span>
            </div>
            <span className="text-navy-500 text-xs">{node.nameEn}</span>
          </div>
          <span className={`text-sm font-mono font-bold ${typeColors[node.type]}`}>
            {formatCurrency(node.balance)}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-b border-navy-800/20">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="المالية والخزينة" description="دليل الحسابات الهرمي للمطعم" />

      {/* Sub-route nav */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit flex-wrap border border-navy-700/50">
        <Link to="/financials/cash-drawer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Wallet className="w-4 h-4" />
          الخزينة اليومية
        </Link>
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <BookOpen className="w-4 h-4" />
          دليل الحسابات
        </span>
        <Link to="/financials/reports" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <BarChart3 className="w-4 h-4" />
          التقارير والميزانية
        </Link>
        <Link to="/financials/tax-settings" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Percent className="w-4 h-4 text-brand-400" />
          إعدادات الضريبة (VAT: {taxRate}%)
        </Link>
      </div>

      {/* Search and Add */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالكود أو الاسم..."
            className="input-field pr-10"
          />
        </div>
        <button onClick={() => setShowAddAccount(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          إضافة حساب فرعي
        </button>
      </div>

      {/* Account Tree */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-700/50 flex items-center justify-between">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            الشجرة المحاسبية
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-success-400"><Building2 className="w-3.5 h-3.5" /> أصول</span>
            <span className="flex items-center gap-1 text-danger-400"><Scale className="w-3.5 h-3.5" /> التزامات</span>
            <span className="flex items-center gap-1 text-blue-400"><TrendingUp className="w-3.5 h-3.5" /> حقوق ملكية</span>
            <span className="flex items-center gap-1 text-brand-400"><Store className="w-3.5 h-3.5" /> إيرادات</span>
            <span className="flex items-center gap-1 text-warning-400"><Receipt className="w-3.5 h-3.5" /> مصروفات</span>
          </div>
        </div>
        <div>
          {accountTree.map((node) => renderNode(node, 0))}
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddAccount(false)}>
          <div className="glass-card w-full max-w-md animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-400" />
                إضافة حساب فرعي
              </h3>
              <button onClick={() => setShowAddAccount(false)} className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">الحساب الأب</label>
                <select className="input-field">
                  <option value="">اختر الحساب الأب</option>
                  <option value="1">1 - الأصول</option>
                  <option value="1.1">1.1 - الأصول المتداولة</option>
                  <option value="2">2 - الالتزامات</option>
                  <option value="3">3 - حقوق الملكية</option>
                  <option value="4">4 - الإيرادات</option>
                  <option value="5">5 - المصروفات</option>
                </select>
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">كود الحساب</label>
                <input type="text" placeholder="مثال: 1.1.5" className="input-field" />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">اسم الحساب (عربي)</label>
                <input type="text" placeholder="اسم الحساب" className="input-field" />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">اسم الحساب (إنجليزي)</label>
                <input type="text" placeholder="Account Name" className="input-field" />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">الرصيد الافتتاحي</label>
                <input type="number" placeholder="0" className="input-field text-center" />
              </div>
            </div>
            <button
              onClick={() => { setShowAddAccount(false); showToast('تم إضافة الحساب بنجاح', 'success'); }}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ الحساب
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
