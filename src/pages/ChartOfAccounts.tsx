import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Wallet, BookOpen, BarChart3, ChevronLeft,
  Plus, Search, X, Save, Building2,
  CreditCard, Package, Truck, Scale, Banknote, Wrench,
  Users, Percent, TrendingUp, Store, Bike, UtensilsCrossed,
  Home, Zap, Receipt, Edit3, Trash2, RotateCcw,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';

export interface AccountNode {
  code: string;
  nameAr: string;
  nameEn: string;
  balance: number;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  icon?: string;
  children?: AccountNode[];
}

const defaultAccountTree: AccountNode[] = [
  {
    code: '1', nameAr: 'الأصول', nameEn: 'Assets', balance: 0, type: 'asset', icon: 'Building2',
    children: [
      {
        code: '1.1', nameAr: 'الأصول المتداولة', nameEn: 'Current Assets', balance: 0, type: 'asset', icon: 'Wallet',
        children: [
          { code: '1.1.1', nameAr: 'الخزينة النقدية', nameEn: 'Cash Drawer', balance: 0, type: 'asset', icon: 'Banknote' },
          { code: '1.1.2', nameAr: 'الحساب البنكي', nameEn: 'Bank Account', balance: 0, type: 'asset', icon: 'CreditCard' },
          { code: '1.1.3', nameAr: 'مخزون المواد الخام', nameEn: 'Inventory', balance: 0, type: 'asset', icon: 'Package' },
          { code: '1.1.4', nameAr: 'عهد المناديب النقدية', nameEn: 'Rider Custody', balance: 0, type: 'asset', icon: 'Bike' },
        ],
      },
      {
        code: '1.2', nameAr: 'الأصول الثابتة', nameEn: 'Fixed Assets', balance: 0, type: 'asset', icon: 'Wrench',
        children: [
          { code: '1.2.1', nameAr: 'معدات وآلات المطبخ', nameEn: 'Kitchen Equipment', balance: 0, type: 'asset', icon: 'UtensilsCrossed' },
          { code: '1.2.2', nameAr: 'الديكور والأثاث', nameEn: 'Furniture & Decor', balance: 0, type: 'asset', icon: 'Home' },
        ],
      },
    ],
  },
  {
    code: '2', nameAr: 'الالتزامات', nameEn: 'Liabilities', balance: 0, type: 'liability', icon: 'Scale',
    children: [
      { code: '2.1', nameAr: 'مستحقات الموردين', nameEn: 'Accounts Payable', balance: 0, type: 'liability', icon: 'Truck' },
      { code: '2.2', nameAr: 'رواتب مستحقة', nameEn: 'Accrued Salaries', balance: 0, type: 'liability', icon: 'Users' },
      { code: '2.3', nameAr: 'ضريبة القيمة المضافة المستحقة', nameEn: 'VAT Payable', balance: 0, type: 'liability', icon: 'Percent' },
    ],
  },
  {
    code: '3', nameAr: 'حقوق الملكية', nameEn: 'Equity', balance: 0, type: 'equity', icon: 'TrendingUp',
    children: [
      { code: '3.1', nameAr: 'رأس مال المطعم', nameEn: 'Capital', balance: 0, type: 'equity', icon: 'Wallet' },
      { code: '3.2', nameAr: 'الأرباح / الخسائر المرحلة', nameEn: 'Retained Earnings', balance: 0, type: 'equity', icon: 'TrendingUp' },
    ],
  },
  {
    code: '4', nameAr: 'الإيرادات', nameEn: 'Revenue', balance: 0, type: 'revenue', icon: 'Store',
    children: [
      { code: '4.1', nameAr: 'مبيعات الصالة', nameEn: 'Dine-in Sales', balance: 0, type: 'revenue', icon: 'UtensilsCrossed' },
      { code: '4.2', nameAr: 'مبيعات التوصيل والتطبيقات', nameEn: 'Delivery & Apps Sales', balance: 0, type: 'revenue', icon: 'Bike' },
      { code: '4.3', nameAr: 'خدمات وإيرادات أخرى', nameEn: 'Other Revenues', balance: 0, type: 'revenue', icon: 'Receipt' },
    ],
  },
  {
    code: '5', nameAr: 'المصروفات', nameEn: 'Expenses', balance: 0, type: 'expense', icon: 'Receipt',
    children: [
      { code: '5.1', nameAr: 'تكلفة البضاعة المباعة (COGS)', nameEn: 'Cost of Goods Sold', balance: 0, type: 'expense', icon: 'Package' },
      { code: '5.2', nameAr: 'رواتب وأجور العاملين', nameEn: 'Salaries & Wages', balance: 0, type: 'expense', icon: 'Users' },
      { code: '5.3', nameAr: 'إيجار المحل', nameEn: 'Rent Expense', balance: 0, type: 'expense', icon: 'Home' },
      { code: '5.4', nameAr: 'مرافق وتشغيل (كهرباء / غاز / ماء)', nameEn: 'Utilities', balance: 0, type: 'expense', icon: 'Zap' },
    ],
  },
];

const iconMap: Record<string, typeof Wallet> = {
  Building2,
  Wallet,
  Banknote,
  CreditCard,
  Package,
  Bike,
  Wrench,
  UtensilsCrossed,
  Home,
  Scale,
  Truck,
  Users,
  Percent,
  TrendingUp,
  Store,
  Receipt,
  Zap,
};

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

// Recursively calculate balances: parent balance = sum of child balances
function computeTreeBalances(nodes: AccountNode[]): AccountNode[] {
  return nodes.map((node) => {
    if (node.children && node.children.length > 0) {
      const updatedChildren = computeTreeBalances(node.children);
      const sum = updatedChildren.reduce((s, c) => s + (Number(c.balance) || 0), 0);
      return {
        ...node,
        balance: sum,
        children: updatedChildren,
      };
    }
    return {
      ...node,
      balance: Number(node.balance) || 0,
    };
  });
}

// Flatten tree for parent selection
function flattenAccounts(nodes: AccountNode[]): { code: string; nameAr: string; type: AccountNode['type'] }[] {
  const list: { code: string; nameAr: string; type: AccountNode['type'] }[] = [];
  function traverse(items: AccountNode[]) {
    for (const item of items) {
      list.push({ code: item.code, nameAr: `${item.code} - ${item.nameAr}`, type: item.type });
      if (item.children) traverse(item.children);
    }
  }
  traverse(nodes);
  return list;
}

export default function ChartOfAccounts() {
  const { showToast, taxRate } = useApp();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2', '3', '4', '5', '1.1']));
  const [search, setSearch] = useState('');

  // Persistent tree state with ZERO fake initial data
  const [tree, setTree] = useState<AccountNode[]>(() => {
    try {
      const saved = localStorage.getItem('nine_fries_chart_of_accounts_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return computeTreeBalances(parsed);
        }
      }
    } catch {
      // fallback
    }
    return computeTreeBalances(defaultAccountTree);
  });

  // Modals state
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingNode, setEditingNode] = useState<AccountNode | null>(null);

  // Add Account form state
  const [parentCode, setParentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newNameAr, setNewNameAr] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newBalance, setNewBalance] = useState('0');

  // Edit Account form state
  const [editNameAr, setEditNameAr] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editBalance, setEditBalance] = useState('0');
  const [editType, setEditType] = useState<AccountNode['type']>('asset');

  // Save tree to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('nine_fries_chart_of_accounts_v2', JSON.stringify(tree));
    } catch {
      // ignore
    }
  }, [tree]);

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

  // Open Edit Modal for a node
  const handleOpenEdit = (node: AccountNode) => {
    setEditingNode(node);
    setEditNameAr(node.nameAr);
    setEditNameEn(node.nameEn);
    setEditCode(node.code);
    setEditBalance(String(node.balance || 0));
    setEditType(node.type);
  };

  // Save Account Edit
  const handleSaveEdit = () => {
    if (!editingNode) return;
    if (!editNameAr.trim()) {
      showToast('يرجى إدخال اسم الحساب بالعربية', 'warning');
      return;
    }

    const bal = parseFloat(editBalance) || 0;

    function updateRecursive(nodes: AccountNode[]): AccountNode[] {
      return nodes.map((n) => {
        if (n.code === editingNode?.code) {
          return {
            ...n,
            code: editCode.trim() || n.code,
            nameAr: editNameAr.trim(),
            nameEn: editNameEn.trim() || editNameAr.trim(),
            type: editType,
            // If leaf node, apply edited balance; if parent, compute from children
            balance: (n.children && n.children.length > 0) ? n.balance : bal,
            children: n.children ? updateRecursive(n.children) : undefined,
          };
        }
        if (n.children) {
          return {
            ...n,
            children: updateRecursive(n.children),
          };
        }
        return n;
      });
    }

    const updated = computeTreeBalances(updateRecursive(tree));
    setTree(updated);
    setEditingNode(null);
    showToast('تم حفظ تعديل الحساب في الشجرة المحاسبية بنجاح', 'success');
  };

  // Handle Add Sub-Account
  const handleSaveNewAccount = () => {
    if (!newNameAr.trim()) {
      showToast('يرجى إدخال اسم الحساب بالعربية', 'warning');
      return;
    }
    if (!parentCode) {
      showToast('يرجى اختيار الحساب الأب', 'warning');
      return;
    }

    const bal = parseFloat(newBalance) || 0;

    function insertRecursive(nodes: AccountNode[]): AccountNode[] {
      return nodes.map((n) => {
        if (n.code === parentCode) {
          const generatedCode = newCode.trim() || `${n.code}.${(n.children?.length ?? 0) + 1}`;
          const newNode: AccountNode = {
            code: generatedCode,
            nameAr: newNameAr.trim(),
            nameEn: newNameEn.trim() || newNameAr.trim(),
            balance: bal,
            type: n.type,
            icon: 'Wallet',
          };
          return {
            ...n,
            children: [...(n.children || []), newNode],
          };
        }
        if (n.children) {
          return {
            ...n,
            children: insertRecursive(n.children),
          };
        }
        return n;
      });
    }

    const updated = computeTreeBalances(insertRecursive(tree));
    setTree(updated);
    setExpanded((prev) => new Set([...prev, parentCode]));
    setShowAddAccount(false);
    setNewNameAr('');
    setNewNameEn('');
    setNewCode('');
    setNewBalance('0');
    showToast('تمت إضافة الحساب الفرعي وحفظه بنجاح', 'success');
  };

  // Handle Delete Account
  const handleDeleteNode = (code: string, nameAr: string) => {
    if (['1', '2', '3', '4', '5'].includes(code)) {
      showToast('لا يمكن حذف المجموعات المحاسبية الرئيسية الخمس', 'warning');
      return;
    }

    if (window.confirm(`هل أنت متأكد من حذف الحساب "${nameAr}" (${code})؟`)) {
      function deleteRecursive(nodes: AccountNode[]): AccountNode[] {
        return nodes
          .filter((n) => n.code !== code)
          .map((n) => ({
            ...n,
            children: n.children ? deleteRecursive(n.children) : undefined,
          }));
      }

      const updated = computeTreeBalances(deleteRecursive(tree));
      setTree(updated);
      showToast(`تم حذف الحساب "${nameAr}"`, 'info');
    }
  };

  // Reset to clean zero-balance chart
  const handleResetToZero = () => {
    if (window.confirm('هل تريد إعادة تعيين الشجرة المحاسبية إلى الهيكل القياسي مع تصفير كافة الأرصدة (0.00 ج.م)؟')) {
      const clean = computeTreeBalances(defaultAccountTree);
      setTree(clean);
      localStorage.setItem('nine_fries_chart_of_accounts_v2', JSON.stringify(clean));
      showToast('تم تصفير الشجرة المحاسبية وإعادة ضبطها بأرصدة 0.00 ج.م', 'info');
    }
  };

  const renderNode = (node: AccountNode, depth: number): React.ReactNode => {
    if (!nodeHasMatch(node)) return null;
    const isExpanded = expanded.has(node.code) || (!!search && nodeHasMatch(node));
    const hasChildren = (node.children?.length ?? 0) > 0;
    const NodeIcon = (node.icon && iconMap[node.icon]) || Wallet;

    return (
      <div key={node.code}>
        <div
          className={`flex items-center gap-3 px-4 py-3 hover:bg-navy-800/40 transition-colors group ${
            depth === 0 ? 'border-b border-navy-700/40 bg-navy-900/30' : ''
          }`}
          style={{ paddingRight: `${depth * 22 + 16}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node.code)}
              className="shrink-0 w-6 h-6 rounded-lg hover:bg-navy-700/60 flex items-center justify-center text-navy-400 hover:text-white transition-colors"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />
            </button>
          ) : (
            <span className="w-6 shrink-0" />
          )}

          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${typeBgs[node.type]}`}>
            <NodeIcon className={`w-4 h-4 ${typeColors[node.type]}`} />
          </div>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => hasChildren && toggleExpand(node.code)}
          >
            <div className="flex items-center gap-2">
              <span className="text-navy-400 text-xs font-mono font-bold shrink-0">{node.code}</span>
              <span className={`text-sm ${depth === 0 ? 'text-white font-bold' : 'text-navy-100 font-medium'}`}>
                {node.nameAr}
              </span>
            </div>
            <span className="text-navy-500 text-xs block">{node.nameEn}</span>
          </div>

          {/* Action buttons (Edit, Add Sub-account, Delete) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleOpenEdit(node)}
              className="p-1.5 rounded-lg text-navy-400 hover:text-brand-300 hover:bg-navy-700/60 transition-colors"
              title="تعديل الحساب"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setParentCode(node.code);
                setNewCode(`${node.code}.${(node.children?.length ?? 0) + 1}`);
                setShowAddAccount(true);
              }}
              className="p-1.5 rounded-lg text-navy-400 hover:text-success-400 hover:bg-navy-700/60 transition-colors"
              title="إضافة حساب فرعي تحته"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {!['1', '2', '3', '4', '5'].includes(node.code) && (
              <button
                onClick={() => handleDeleteNode(node.code, node.nameAr)}
                className="p-1.5 rounded-lg text-navy-400 hover:text-danger-400 hover:bg-navy-700/60 transition-colors"
                title="حذف الحساب"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Balance display */}
          <span className={`text-sm font-mono font-bold shrink-0 ${typeColors[node.type]}`}>
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

  const flattenedList = flattenAccounts(tree);

  return (
    <div className="animate-fade-in">
      <PageHeader title="المالية والخزينة" description="دليل وشجرة الحسابات الهرمية القابلة للتعديل بالكامل" />

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

      {/* Search and Actions */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالكود أو الاسم العربي / الإنجليزي..."
            className="input-field pr-10"
          />
        </div>
        <button
          onClick={() => {
            setParentCode('1.1');
            setNewCode('');
            setShowAddAccount(true);
          }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة حساب فرعي
        </button>
        <button
          onClick={handleResetToZero}
          className="btn-ghost flex items-center gap-2 text-xs text-navy-300 hover:text-white"
          title="تصفير كافة الأرصدة إلى 0.00 ج.م"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          تصفير الأرصدة الافتراضية
        </button>
      </div>

      {/* Account Tree Glass Card */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-700/50 flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            الشجرة المحاسبية للمطعم
          </h3>
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1 text-success-400"><Building2 className="w-3.5 h-3.5" /> أصول</span>
            <span className="flex items-center gap-1 text-danger-400"><Scale className="w-3.5 h-3.5" /> التزامات</span>
            <span className="flex items-center gap-1 text-blue-400"><TrendingUp className="w-3.5 h-3.5" /> حقوق ملكية</span>
            <span className="flex items-center gap-1 text-brand-400"><Store className="w-3.5 h-3.5" /> إيرادات</span>
            <span className="flex items-center gap-1 text-warning-400"><Receipt className="w-3.5 h-3.5" /> مصروفات</span>
          </div>
        </div>

        <div>
          {tree.map((node) => renderNode(node, 0))}
        </div>
      </div>

      {/* Add Sub-Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddAccount(false)}>
          <div className="glass-card w-full max-w-md animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-400" />
                إضافة حساب فرعي جديد
              </h3>
              <button onClick={() => setShowAddAccount(false)} className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">الحساب الأب</label>
                <select
                  value={parentCode}
                  onChange={(e) => setParentCode(e.target.value)}
                  className="input-field"
                >
                  <option value="">اختر الحساب الأب...</option>
                  {flattenedList.map((acc) => (
                    <option key={acc.code} value={acc.code}>
                      {acc.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">كود الحساب (اختياري)</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="مثال: 1.1.5"
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">اسم الحساب (عربي)</label>
                <input
                  type="text"
                  value={newNameAr}
                  onChange={(e) => setNewNameAr(e.target.value)}
                  placeholder="مثال: حساب فودافون كاش"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">اسم الحساب (إنجليزي)</label>
                <input
                  type="text"
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                  placeholder="مثال: Vodafone Cash Account"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">الرصيد الافتتاحي (ج.م)</label>
                <input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="0"
                  className="input-field text-center font-bold"
                />
              </div>
            </div>
            <button
              onClick={handleSaveNewAccount}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ الحساب في الشجرة
            </button>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setEditingNode(null)}>
          <div className="glass-card w-full max-w-md animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-400" />
                تعديل الحساب المحاسبي
              </h3>
              <button onClick={() => setEditingNode(null)} className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">كود الحساب</label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="input-field font-mono"
                />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">اسم الحساب (عربي)</label>
                <input
                  type="text"
                  value={editNameAr}
                  onChange={(e) => setEditNameAr(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">اسم الحساب (إنجليزي)</label>
                <input
                  type="text"
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">نوع الحساب</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as AccountNode['type'])}
                  className="input-field"
                >
                  <option value="asset">أصول (Asset)</option>
                  <option value="liability">التزامات (Liability)</option>
                  <option value="equity">حقوق ملكية (Equity)</option>
                  <option value="revenue">إيرادات (Revenue)</option>
                  <option value="expense">مصروفات (Expense)</option>
                </select>
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">
                  رصيد الحساب (ج.م)
                  {editingNode.children && editingNode.children.length > 0 && (
                    <span className="text-navy-500 text-xs mr-2 font-normal">(يُحسب تلقائياً من الحسابات الفرعية)</span>
                  )}
                </label>
                <input
                  type="number"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  disabled={Boolean(editingNode.children && editingNode.children.length > 0)}
                  placeholder="0"
                  className="input-field text-center font-bold disabled:opacity-50"
                />
              </div>
            </div>
            <button
              onClick={handleSaveEdit}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ التعديلات
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
