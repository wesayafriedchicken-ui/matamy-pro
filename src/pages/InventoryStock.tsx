import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { InventoryItem } from '@/types';
import {
  Plus, Search, Package, AlertTriangle, TrendingDown, Boxes, Truck,
  X, Edit3, Minus, Sliders, Trash2, RotateCcw, Filter,
  List, LayoutGrid, BarChart3, ChefHat,
  ChevronLeft, ChevronRight, Download, Printer,
  Layers, Check, TrendingUp, DollarSign, ArrowUpRight,
} from 'lucide-react';
import {
  formatCurrency, getStockBadge, getStockStatus,
} from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

const CATEGORY_STYLES: Record<string, string> = {
  spices: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  sauces: 'bg-red-500/15 text-red-300 border-red-500/30',
  bread: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  proteins: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  dairy: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  vegetables: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  raw_materials: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  packaging: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
};

function getCategoryStyle(catKey?: string): string {
  if (!catKey) return 'bg-navy-800 text-navy-300 border-navy-700';
  if (CATEGORY_STYLES[catKey]) return CATEGORY_STYLES[catKey];
  const colors = [
    'bg-teal-500/15 text-teal-300 border-teal-500/30',
    'bg-violet-500/15 text-violet-300 border-violet-500/30',
    'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
    'bg-orange-500/15 text-orange-300 border-orange-500/30',
  ];
  let hash = 0;
  for (let i = 0; i < catKey.length; i++) {
    hash = (hash << 5) - hash + catKey.charCodeAt(i);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function InventoryStock() {
  const {
    inventory,
    updateInventoryItem,
    addInventoryItem,
    deleteInventoryItem,
    resetToDefaultInventory,
    adjustStock,
    inventoryCategories,
  } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustValue, setAdjustValue] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // View Mode: 'list' | 'board' | 'report'
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'report'>('list');
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  // Status Checkbox Filter: جميع الحالات / متوفر / منخفض أو نفذ
  const [statusFilter, setStatusFilter] = useState<{
    all: boolean;
    ok: boolean;
    low_or_out: boolean;
  }>({
    all: true,
    ok: true,
    low_or_out: true,
  });

  // Pagination limit per page
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Close view menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setIsViewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = useMemo(() => {
    return [
      { id: 'all', labelAr: 'جميع التصنيفات' },
      ...inventoryCategories.map((c) => ({ id: c.id, labelAr: c.labelAr })),
    ];
  }, [inventoryCategories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: inventory.length };
    inventory.forEach((item) => {
      const cat = item.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [inventory]);

  // Status counts for checkboxes
  const statusCounts = useMemo(() => {
    let ok = 0;
    let lowOrOut = 0;
    inventory.forEach((i) => {
      const st = getStockStatus(i.currentStock, i.minReorderLevel);
      if (st === 'ok') ok++;
      else lowOrOut++;
    });
    return { all: inventory.length, ok, lowOrOut };
  }, [inventory]);

  // Toggle status filter checkboxes
  const toggleStatusFilter = (key: 'all' | 'ok' | 'low_or_out') => {
    setCurrentPage(1);
    if (key === 'all') {
      setStatusFilter({ all: true, ok: true, low_or_out: true });
    } else if (key === 'ok') {
      setStatusFilter((prev) => {
        // If "all" was selected, clicking "ok" isolates ok
        if (prev.all) {
          return { all: false, ok: true, low_or_out: false };
        }
        const nextOk = !prev.ok;
        const nextLow = prev.low_or_out;
        // If both would be unchecked, reset to all
        if (!nextOk && !nextLow) {
          return { all: true, ok: true, low_or_out: true };
        }
        const isAll = nextOk && nextLow;
        return {
          all: isAll,
          ok: nextOk,
          low_or_out: nextLow,
        };
      });
    } else if (key === 'low_or_out') {
      setStatusFilter((prev) => {
        // If "all" was selected, clicking "low_or_out" isolates low_or_out
        if (prev.all) {
          return { all: false, ok: false, low_or_out: true };
        }
        const nextLow = !prev.low_or_out;
        const nextOk = prev.ok;
        // If both would be unchecked, reset to all
        if (!nextOk && !nextLow) {
          return { all: true, ok: true, low_or_out: true };
        }
        const isAll = nextOk && nextLow;
        return {
          all: isAll,
          ok: nextOk,
          low_or_out: nextLow,
        };
      });
    }
  };

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.nameAr.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q) ||
        item.categoryAr.toLowerCase().includes(q);

      const status = getStockStatus(item.currentStock, item.minReorderLevel);
      const isOk = status === 'ok';
      const isLowOrOut = status !== 'ok';

      let matchesStatus = false;
      if (statusFilter.all) {
        matchesStatus = true;
      } else {
        if (statusFilter.ok && isOk) matchesStatus = true;
        if (statusFilter.low_or_out && isLowOrOut) matchesStatus = true;
      }

      const matchesCategory =
        selectedCategory === 'all' ||
        item.category === selectedCategory ||
        item.categoryAr === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [inventory, search, statusFilter, selectedCategory]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, statusFilter, pageSize]);

  // Pagination computations
  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedItems = useMemo(() => {
    return filtered.slice(startIndex, endIndex);
  }, [filtered, startIndex, endIndex]);

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) !== 'ok');
  const outItems = inventory.filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) === 'out');
  const totalValue = inventory.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0);

  // Export filtered inventory to CSV
  const exportCSV = () => {
    const headers = ['كود الصنف (SKU)', 'المادة الخام', 'التصنيف', 'الوحدة', 'تكلفة الوحدة (ج.م)', 'الكمية الحالية', 'حد الطلب الأدنى', 'الحد الأقصى', 'المورد', 'إجمالي القيمة (ج.م)', 'حالة المخزون'];
    const rows = filtered.map((item) => {
      const badge = getStockBadge(item.currentStock, item.minReorderLevel);
      return [
        item.sku,
        `"${item.nameAr.replace(/"/g, '""')}"`,
        item.categoryAr,
        item.unitAr,
        item.costPerUnit,
        item.currentStock,
        item.minReorderLevel,
        item.maxStock,
        `"${(item.supplier || '').replace(/"/g, '""')}"`,
        item.currentStock * item.costPerUnit,
        badge.label,
      ];
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_المخزون_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = (item: InventoryItem) => {
    if (inventory.find((i) => i.id === item.id)) {
      updateInventoryItem(item);
    } else {
      addInventoryItem(item);
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const handleAdjust = () => {
    if (adjustItem && adjustValue) {
      const delta = Number(adjustValue);
      if (!isNaN(delta) && delta !== 0) {
        adjustStock(adjustItem.id, delta);
      }
    }
    setAdjustItem(null);
    setAdjustValue('');
  };

  const handleConfirmReset = () => {
    resetToDefaultInventory();
    setShowResetConfirm(false);
    setSelectedCategory('all');
    setStatusFilter({ all: true, ok: true, low_or_out: true });
    setSearch('');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="المخزون والوصفات"
        description="المواد الخام بالمخزن - إدارة وتتبع المخزون والجرد وقائمة الأسعار المعتمدة"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="btn-ghost flex items-center gap-2 border border-navy-700/80 hover:border-brand-500/40 text-navy-200 hover:text-white px-3.5 py-2 text-xs font-semibold rounded-xl"
              title="استعادة الـ 45 مادة خام من القائمة الرسمية"
            >
              <RotateCcw className="w-4 h-4 text-brand-400" />
              استعادة القائمة الرسمية
            </button>
            <button
              onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="btn-primary flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              إضافة مادة خام
            </button>
          </div>
        }
      />

      {/* Route-based navigation (replaces tab switcher) */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit">
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <Package className="w-4 h-4" />
          المواد الخام بالمخزن ({inventory.length})
        </span>
        <Link to="/inventory/recipes" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <ChefHat className="w-4 h-4" />
          تركيب الوجبات والوصفات
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Boxes} label="إجمالي المواد الخام" value={String(totalItems)} color="blue" />
        <StatCard icon={AlertTriangle} label="مخزون منخفض" value={String(lowStockItems.length)} color="warning" />
        <StatCard icon={TrendingDown} label="نفذ من المخزون" value={String(outItems.length)} color="danger" />
        <StatCard icon={Package} label="قيمة المخزون الإجمالية" value={formatCurrency(Math.round(totalValue))} color="success" />
      </div>

      {/* Category Chips Filter */}
      <div className="glass-card p-3 mb-5 border border-navy-700/60">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-navy-300 px-1">
          <Filter className="w-3.5 h-3.5 text-brand-400" />
          <span>تصفية حسب التصنيف:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => {
            const count = categoryCounts[cat.id] ?? 0;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-navy-800/80 text-navy-300 hover:bg-navy-700 hover:text-white border border-navy-700/50'
                }`}
              >
                <span>{cat.labelAr}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-navy-900/60 text-navy-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search, Status Checkboxes, View Switcher Icon, and Page Limit */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-64">
          <Search className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالصنف أو العبوة أو المورد أو الكود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pr-10 text-xs"
          />
        </div>

        {/* Status Checkbox Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-navy-800/80 rounded-2xl border border-navy-700/60 text-xs shadow-inner">
          {/* Checkbox: جميع الحالات */}
          <button
            type="button"
            onClick={() => toggleStatusFilter('all')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold transition-all select-none ${
              statusFilter.all
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/40 shadow-sm'
                : 'text-navy-300 hover:text-white hover:bg-navy-700/50 border border-transparent'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                statusFilter.all
                  ? 'bg-brand-500 border-brand-400 text-white shadow-sm shadow-brand-500/40'
                  : 'border-navy-600 bg-navy-900/80 text-transparent'
              }`}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>جميع الحالات</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                statusFilter.all ? 'bg-brand-500/25 text-brand-300 border border-brand-500/30' : 'bg-navy-900 text-navy-400'
              }`}
            >
              {statusCounts.all}
            </span>
          </button>

          {/* Checkbox: متوفر */}
          <button
            type="button"
            onClick={() => toggleStatusFilter('ok')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold transition-all select-none ${
              statusFilter.ok
                ? 'bg-success-500/15 text-success-300 border border-success-500/40 shadow-sm'
                : 'text-navy-400 hover:text-navy-200 hover:bg-navy-700/30 border border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                statusFilter.ok
                  ? 'bg-success-500 border-success-400 text-white shadow-sm shadow-success-500/40'
                  : 'border-navy-600 bg-navy-900/80 text-transparent'
              }`}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success-400" />
              <span>متوفر</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-navy-900 text-navy-300">
              {statusCounts.ok}
            </span>
          </button>

          {/* Checkbox: منخفض / نفذ */}
          <button
            type="button"
            onClick={() => toggleStatusFilter('low_or_out')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold transition-all select-none ${
              statusFilter.low_or_out
                ? 'bg-danger-500/15 text-danger-300 border border-danger-500/40 shadow-sm'
                : 'text-navy-400 hover:text-navy-200 hover:bg-navy-700/30 border border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                statusFilter.low_or_out
                  ? 'bg-danger-500 border-danger-400 text-white shadow-sm shadow-danger-500/40'
                  : 'border-navy-600 bg-navy-900/80 text-transparent'
              }`}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-warning-400" />
              <span>منخفض / نفذ</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-navy-900 text-navy-300">
              {statusCounts.lowOrOut}
            </span>
          </button>
        </div>

        {/* View Switcher Icon Only (List view, Board, Report) */}
        <div className="relative" ref={viewMenuRef}>
          <button
            type="button"
            onClick={() => setIsViewMenuOpen((prev) => !prev)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              isViewMenuOpen
                ? 'bg-brand-500 text-white border-brand-400 shadow-lg shadow-brand-500/25 ring-2 ring-brand-500/20'
                : 'bg-navy-800/80 hover:bg-navy-700 text-navy-200 hover:text-white border-navy-700/60'
            }`}
            title={`طريقة العرض: ${viewMode === 'list' ? 'List View (قائمة جدولية)' : viewMode === 'board' ? 'Board (لوحة كانبان)' : 'Report (تقرير تحليلي)'}`}
            aria-label="تغيير طريقة العرض"
          >
            {viewMode === 'list' ? (
              <List className="w-4 h-4 text-brand-400" />
            ) : viewMode === 'board' ? (
              <LayoutGrid className="w-4 h-4 text-brand-400" />
            ) : (
              <BarChart3 className="w-4 h-4 text-brand-400" />
            )}
          </button>

          {/* View Dropdown Menu */}
          {isViewMenuOpen && (
            <div className="absolute left-0 mt-2 w-56 glass-card p-2 border border-navy-700/80 shadow-2xl rounded-2xl z-40 animate-scale-in space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-navy-400 border-b border-navy-800/80 flex items-center justify-between">
                <span>طريقة العرض</span>
                <Layers className="w-3.5 h-3.5 text-navy-400" />
              </div>

              {/* 1. List View */}
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                  setIsViewMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20'
                    : 'text-navy-200 hover:bg-navy-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <List className="w-4 h-4" />
                  <div className="text-right">
                    <div>List View</div>
                    <div className="text-[10px] opacity-75 font-normal">عرض القائمة والجدول</div>
                  </div>
                </div>
                {viewMode === 'list' && <Check className="w-4 h-4" />}
              </button>

              {/* 2. Board View */}
              <button
                type="button"
                onClick={() => {
                  setViewMode('board');
                  setIsViewMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'board'
                    ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20'
                    : 'text-navy-200 hover:bg-navy-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="w-4 h-4" />
                  <div className="text-right">
                    <div>Board</div>
                    <div className="text-[10px] opacity-75 font-normal">عرض لوحة كانبان</div>
                  </div>
                </div>
                {viewMode === 'board' && <Check className="w-4 h-4" />}
              </button>

              {/* 3. Report View */}
              <button
                type="button"
                onClick={() => {
                  setViewMode('report');
                  setIsViewMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'report'
                    ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20'
                    : 'text-navy-200 hover:bg-navy-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4" />
                  <div className="text-right">
                    <div>Report</div>
                    <div className="text-[10px] opacity-75 font-normal">تقرير تحليلي للجرد</div>
                  </div>
                </div>
                {viewMode === 'report' && <Check className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Page Limit Selector */}
        <div className="flex items-center gap-1.5 bg-navy-800/80 border border-navy-700/60 px-3 py-2 rounded-xl text-xs text-navy-300">
          <span className="text-[11px] font-medium text-navy-400">لكل صفحة:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-transparent text-white font-bold font-mono outline-none cursor-pointer pr-1"
          >
            <option value={10} className="bg-navy-900 text-white">10</option>
            <option value={20} className="bg-navy-900 text-white">20</option>
            <option value={30} className="bg-navy-900 text-white">30</option>
            <option value={50} className="bg-navy-900 text-white">50</option>
            <option value={100} className="bg-navy-900 text-white">100</option>
          </select>
        </div>
      </div>

      {/* ===================== 1. LIST VIEW ===================== */}
      {viewMode === 'list' && (
        <div className="glass-card overflow-hidden shadow-2xl border border-navy-700/60 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700/50 bg-navy-900/40">
                  <th className="text-right text-navy-400 text-xs font-semibold px-5 py-3.5">كود الصنف</th>
                  <th className="text-right text-navy-400 text-xs font-semibold px-5 py-3.5">المادة الخام</th>
                  <th className="text-right text-navy-400 text-xs font-semibold px-5 py-3.5">التصنيف</th>
                  <th className="text-right text-navy-400 text-xs font-semibold px-5 py-3.5">الوحدة</th>
                  <th className="text-right text-navy-400 text-xs font-semibold px-5 py-3.5">تكلفة الوحدة</th>
                  <th className="text-right text-navy-400 text-xs font-semibold px-5 py-3.5">الكمية الحالية</th>
                  <th className="text-right text-navy-400 text-xs font-semibold px-5 py-3.5">حد الطلب الأدنى</th>
                  <th className="text-right text-navy-400 text-xs font-semibold px-5 py-3.5">الحالة</th>
                  <th className="text-center text-navy-400 text-xs font-semibold px-5 py-3.5">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => {
                  const badge = getStockBadge(item.currentStock, item.minReorderLevel);
                  const stockPct = Math.min((item.currentStock / item.maxStock) * 100, 100);
                  const reorderPct = (item.minReorderLevel / item.maxStock) * 100;
                  return (
                    <tr key={item.id} className="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors">
                      <td className="px-5 py-3.5"><span className="text-navy-300 font-mono text-xs">{item.sku}</span></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-navy-700/50 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-navy-400" />
                          </div>
                          <Link to={`/inventory/${item.id}`} className="group hover:opacity-90">
                            <p className="text-white text-sm font-semibold group-hover:text-brand-400 transition-colors">{item.nameAr}</p>
                            <p className="text-navy-400 text-xs">{item.supplier || 'مورد غير محدد'}</p>
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getCategoryStyle(item.category)}`}>
                          {item.categoryAr}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-navy-200 text-xs font-medium bg-navy-800/80 px-2 py-1 rounded-md border border-navy-700/60">
                          {item.unitAr}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {item.costPerUnit === 0 ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            غير محدد
                          </span>
                        ) : (
                          <span className="text-white text-sm font-bold font-mono">
                            {item.costPerUnit} <span className="text-[11px] text-navy-400 font-normal">ج</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="w-28">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm font-bold font-mono">{item.currentStock}</span>
                            <span className="text-navy-400 text-xs">/ {item.maxStock}</span>
                          </div>
                          <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden relative">
                            <div className={`h-full rounded-full transition-all duration-500 ${
                              badge.label === 'نفذ' ? 'bg-danger-500'
                                : badge.label === 'حرج' ? 'bg-danger-500'
                                : badge.label === 'منخفض' ? 'bg-warning-500'
                                : 'bg-success-500'
                            }`} style={{ width: `${stockPct}%` }} />
                            {reorderPct > 0 && (
                              <div className="absolute top-0 bottom-0 w-0.5 bg-warning-400/60" style={{ right: `${100 - reorderPct}%` }} />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><span className="text-navy-300 text-sm font-mono">{item.minReorderLevel}</span></td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${badge.bg} ${badge.color}`}>
                          <span className={`status-dot ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => { setAdjustItem(item); setAdjustValue(''); }}
                            className="w-8 h-8 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 flex items-center justify-center text-brand-400 transition-all" title="جرد سريع / تسوية">
                            <Sliders className="w-4 h-4" />
                          </button>
                          {badge.label !== 'متوفر' && (
                            <button className="w-8 h-8 rounded-lg bg-success-500/10 hover:bg-success-500/20 flex items-center justify-center text-success-400 transition-all" title="إعادة طلب">
                              <Truck className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            to={`/inventory/${item.id}`}
                            className="w-8 h-8 rounded-lg bg-navy-700/50 hover:bg-brand-500/20 hover:text-brand-400 flex items-center justify-center text-navy-300 hover:text-white transition-all"
                            title="تعديل مادة خام وسجل الحركات"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button onClick={() => deleteInventoryItem(item.id)}
                            className="w-8 h-8 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 flex items-center justify-center text-danger-400 transition-all" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Package className="w-12 h-12 text-navy-600 mx-auto mb-3" />
              <p className="text-navy-400 text-sm">لا توجد مواد مطابقة للبحث والتصنيف المحدد</p>
            </div>
          )}

          {/* Pagination Controls */}
          {filtered.length > 0 && (
            <PaginationBar
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={totalFiltered}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={(p) => setCurrentPage(p)}
              pageSize={pageSize}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      )}

      {/* ===================== 2. BOARD (KANBAN) VIEW ===================== */}
      {viewMode === 'board' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: متوفر */}
            <div className="glass-card p-4 border border-success-500/30 space-y-3.5 bg-gradient-to-b from-success-500/5 to-transparent">
              <div className="flex items-center justify-between pb-3 border-b border-navy-700/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success-400 shadow-sm shadow-success-400/50" />
                  <h3 className="text-white font-bold text-sm">متوفر بالمخزن</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-success-500/20 text-success-300 border border-success-500/30">
                  {filtered.filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) === 'ok').length}
                </span>
              </div>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
                {paginatedItems
                  .filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) === 'ok')
                  .map((item) => (
                    <BoardCard
                      key={item.id}
                      item={item}
                      onAdjust={() => { setAdjustItem(item); setAdjustValue(''); }}
                      onDelete={() => deleteInventoryItem(item.id)}
                    />
                  ))}

                {paginatedItems.filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) === 'ok').length === 0 && (
                  <div className="py-8 text-center text-navy-400 text-xs">
                    لا توجد مواد بحالة متوفر في هذه الصفحة
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: مخزون منخفض */}
            <div className="glass-card p-4 border border-warning-500/30 space-y-3.5 bg-gradient-to-b from-warning-500/5 to-transparent">
              <div className="flex items-center justify-between pb-3 border-b border-navy-700/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning-400 shadow-sm shadow-warning-400/50" />
                  <h3 className="text-white font-bold text-sm">مخزون منخفض (تنبيه الطلب)</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-warning-500/20 text-warning-300 border border-warning-500/30">
                  {filtered.filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) === 'low').length}
                </span>
              </div>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
                {paginatedItems
                  .filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) === 'low')
                  .map((item) => (
                    <BoardCard
                      key={item.id}
                      item={item}
                      onAdjust={() => { setAdjustItem(item); setAdjustValue(''); }}
                      onDelete={() => deleteInventoryItem(item.id)}
                    />
                  ))}

                {paginatedItems.filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) === 'low').length === 0 && (
                  <div className="py-8 text-center text-navy-400 text-xs">
                    لا توجد مواد منخفضة في هذه الصفحة
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: نفذ من المخزون */}
            <div className="glass-card p-4 border border-danger-500/30 space-y-3.5 bg-gradient-to-b from-danger-500/5 to-transparent">
              <div className="flex items-center justify-between pb-3 border-b border-navy-700/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger-400 shadow-sm shadow-danger-400/50" />
                  <h3 className="text-white font-bold text-sm">نفذ من المخزون (عاجل)</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-danger-500/20 text-danger-300 border border-danger-500/30">
                  {filtered.filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) === 'out').length}
                </span>
              </div>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
                {paginatedItems
                  .filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) === 'out')
                  .map((item) => (
                    <BoardCard
                      key={item.id}
                      item={item}
                      onAdjust={() => { setAdjustItem(item); setAdjustValue(''); }}
                      onDelete={() => deleteInventoryItem(item.id)}
                    />
                  ))}

                {paginatedItems.filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) === 'out').length === 0 && (
                  <div className="py-8 text-center text-navy-400 text-xs">
                    لا توجد مواد نافذة في هذه الصفحة
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pagination Controls for Board View */}
          {filtered.length > 0 && (
            <div className="glass-card">
              <PaginationBar
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                totalItems={totalFiltered}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={(p) => setCurrentPage(p)}
                pageSize={pageSize}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ===================== 3. REPORT VIEW ===================== */}
      {viewMode === 'report' && (
        <InventoryReportView
          filteredItems={filtered}
          totalValue={totalValue}
          totalItems={totalItems}
          lowStockItemsCount={lowStockItems.length}
          onExportCSV={exportCSV}
          onAdjustItem={(item) => { setAdjustItem(item); setAdjustValue(''); }}
        />
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setShowResetConfirm(false)}>
          <div className="glass-card w-full max-w-md p-6 animate-scale-in border border-navy-700/80 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-white font-bold text-lg">استعادة قائمة المواد الخام الرسمية؟</h3>
              <p className="text-navy-300 text-xs leading-relaxed">
                سيتم مسح وتحديث كافة المواد الخام وإعادة ضبطها على قائمة الأسعار الرسمية المعتمدة (45 مادة مصنفة بالوحدات والكميات والأسعار).
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmReset}
                className="btn-primary flex-1 py-2.5 text-xs font-bold"
              >
                تأكيد الاستعادة
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-ghost flex-1 py-2.5 text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <InventoryForm
          item={editingItem}
          onSave={handleSave}
          onDelete={(id) => { deleteInventoryItem(id); setShowForm(false); setEditingItem(null); }}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
        />
      )}

      {adjustItem && (
        <AdjustModal
          item={adjustItem}
          value={adjustValue}
          onChange={setAdjustValue}
          onConfirm={handleAdjust}
          onClose={() => { setAdjustItem(null); setAdjustValue(''); }}
        />
      )}
    </div>
  );
}

/* ===================== Pagination Controls ===================== */

function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (p: number) => void;
  pageSize: number;
  onPageSizeChange: (s: number) => void;
}) {
  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 px-5 py-4 border-t border-navy-700/50 text-xs bg-navy-900/30">
      <div className="text-navy-400 font-medium flex items-center gap-1.5">
        <span>عرض</span>
        <span className="font-bold text-white font-mono">{startIndex + 1}</span>
        <span>-</span>
        <span className="font-bold text-white font-mono">{endIndex}</span>
        <span>من أصل</span>
        <span className="font-bold text-brand-400 font-mono">{totalItems}</span>
        <span>مادة خام</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-navy-800/80 hover:bg-navy-700 text-navy-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all border border-navy-700/50"
          title="الصفحة السابقة"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((p, idx, arr) => {
            const prev = arr[idx - 1];
            const hasGap = prev && p - prev > 1;
            return (
              <span key={p} className="flex items-center gap-1.5">
                {hasGap && <span className="text-navy-600 px-1 font-mono">...</span>}
                <button
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all ${
                    currentPage === p
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 ring-1 ring-brand-400'
                      : 'bg-navy-800/60 hover:bg-navy-700 text-navy-300 hover:text-white border border-navy-700/40'
                  }`}
                >
                  {p}
                </button>
              </span>
            );
          })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-navy-800/80 hover:bg-navy-700 text-navy-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all border border-navy-700/50"
          title="الصفحة التالية"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-navy-400 text-[11px]">عدد العناصر:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-navy-900 border border-navy-700/70 text-white text-xs rounded-lg px-2.5 py-1 font-bold font-mono outline-none cursor-pointer"
        >
          <option value={10}>10 / صفحة</option>
          <option value={20}>20 / صفحة</option>
          <option value={30}>30 / صفحة</option>
          <option value={50}>50 / صفحة</option>
          <option value={100}>100 / صفحة</option>
        </select>
      </div>
    </div>
  );
}

/* ===================== Board (Kanban) Card ===================== */

function BoardCard({
  item,
  onAdjust,
  onDelete,
}: {
  item: InventoryItem;
  onAdjust: () => void;
  onDelete: () => void;
}) {
  const badge = getStockBadge(item.currentStock, item.minReorderLevel);
  const stockPct = Math.min((item.currentStock / item.maxStock) * 100, 100);
  const reorderPct = (item.minReorderLevel / item.maxStock) * 100;
  const totalItemVal = item.currentStock * item.costPerUnit;

  return (
    <div className="p-4 rounded-2xl bg-navy-900/70 border border-navy-700/60 hover:border-brand-500/40 hover:shadow-lg transition-all space-y-3 group">
      {/* Top badges */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-navy-400 font-bold bg-navy-950/60 px-2 py-0.5 rounded-lg border border-navy-800">
          {item.sku}
        </span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${getCategoryStyle(item.category)}`}>
          {item.categoryAr}
        </span>
      </div>

      {/* Item title & Supplier */}
      <div>
        <Link to={`/inventory/${item.id}`} className="group-hover:text-brand-400 transition-colors">
          <h4 className="text-white text-sm font-bold line-clamp-1">{item.nameAr}</h4>
        </Link>
        <p className="text-navy-400 text-xs mt-0.5 flex items-center gap-1">
          <Truck className="w-3 h-3 text-navy-500" />
          <span>{item.supplier || 'مورد غير محدد'}</span>
        </p>
      </div>

      {/* Stock gauge */}
      <div className="space-y-1.5 bg-navy-950/40 p-2.5 rounded-xl border border-navy-800/60">
        <div className="flex justify-between items-center text-xs">
          <span className="text-navy-300 font-medium">الرصيد بالمخزن:</span>
          <span className="text-white font-bold font-mono">
            {item.currentStock} {item.unitAr}
          </span>
        </div>
        <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              badge.label === 'نفذ'
                ? 'bg-danger-500'
                : badge.label === 'حرج'
                ? 'bg-danger-500'
                : badge.label === 'منخفض'
                ? 'bg-warning-500'
                : 'bg-success-500'
            }`}
            style={{ width: `${stockPct}%` }}
          />
          {reorderPct > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-warning-400/80 z-10"
              style={{ right: `${100 - reorderPct}%` }}
              title={`حد إعادة الطلب: ${item.minReorderLevel}`}
            />
          )}
        </div>
        <div className="flex justify-between text-[10px] text-navy-400">
          <span>حد الطلب: {item.minReorderLevel} {item.unitAr}</span>
          <span>الحد الأقصى: {item.maxStock}</span>
        </div>
      </div>

      {/* Price & Value */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-navy-800/60">
        <div>
          <span className="text-navy-400 text-[10px] block">تكلفة الوحدة:</span>
          <span className="text-white font-bold font-mono">
            {item.costPerUnit === 0 ? 'غير محدد' : `${item.costPerUnit} ج`}
          </span>
        </div>
        <div className="text-left">
          <span className="text-navy-400 text-[10px] block">قيمة الرصيد:</span>
          <span className="text-success-400 font-bold font-mono">
            {formatCurrency(Math.round(totalItemVal))}
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-navy-800/60">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onAdjust}
            className="w-8 h-8 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 flex items-center justify-center transition-all"
            title="تسوية جردية سريعة"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 flex items-center justify-center transition-all"
            title="حذف المادة"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <Link
          to={`/inventory/${item.id}`}
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 transition-all"
        >
          <span>التفاصيل والـ Logs</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ===================== Inventory Report View ===================== */

function InventoryReportView({
  filteredItems,
  totalValue,
  totalItems,
  lowStockItemsCount: _lowStockItemsCount,
  onExportCSV,
  onAdjustItem,
}: {
  filteredItems: InventoryItem[];
  totalValue: number;
  totalItems: number;
  lowStockItemsCount: number;
  onExportCSV: () => void;
  onAdjustItem: (item: InventoryItem) => void;
}) {
  const urgentReorderItems = useMemo(() => {
    return filteredItems.filter((i) => i.currentStock <= i.minReorderLevel);
  }, [filteredItems]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { nameAr: string; count: number; totalStock: number; totalVal: number }> = {};
    filteredItems.forEach((item) => {
      const cat = item.category || 'other';
      if (!map[cat]) {
        map[cat] = {
          nameAr: item.categoryAr || cat,
          count: 0,
          totalStock: 0,
          totalVal: 0,
        };
      }
      map[cat].count += 1;
      map[cat].totalStock += item.currentStock;
      map[cat].totalVal += item.currentStock * item.costPerUnit;
    });
    return Object.entries(map).sort((a, b) => b[1].totalVal - a[1].totalVal);
  }, [filteredItems]);

  const topValueItems = useMemo(() => {
    return [...filteredItems]
      .sort((a, b) => b.currentStock * b.costPerUnit - a.currentStock * a.costPerUnit)
      .slice(0, 5);
  }, [filteredItems]);

  const totalReorderEstimatedCost = useMemo(() => {
    return urgentReorderItems.reduce((sum, item) => {
      const need = Math.max(0, item.maxStock - item.currentStock);
      return sum + need * item.costPerUnit;
    }, 0);
  }, [urgentReorderItems]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Report Action Banner */}
      <div className="glass-card p-5 border border-navy-700/60 flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">تقرير جرد المخزون العام والقيمة التشغيلية</h3>
            <p className="text-navy-400 text-xs">
              ملخص إحصائي شامل لأصول المخزون، توزيع القيمة المالية حسب التصنيفات، وتوصيات التوريد
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="btn-ghost flex items-center gap-2 border border-navy-700 hover:border-navy-600 text-navy-200 hover:text-white px-3.5 py-2 text-xs font-semibold rounded-xl"
            title="طباعة التقرير"
          >
            <Printer className="w-4 h-4 text-brand-400" />
            <span>طباعة التقرير</span>
          </button>
          <button
            onClick={onExportCSV}
            className="btn-primary flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-brand-500/20"
            title="تصدير كملف CSV"
          >
            <Download className="w-4 h-4" />
            <span>تصدير CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-navy-700/60 space-y-1">
          <span className="text-navy-400 text-xs flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-success-400" />
            إجمالي رأس مال المخزون
          </span>
          <div className="text-xl font-bold font-mono text-success-400">
            {formatCurrency(Math.round(totalValue))}
          </div>
          <span className="text-[11px] text-navy-400">قيمة الأرصدة الفعلية</span>
        </div>

        <div className="glass-card p-4 border border-navy-700/60 space-y-1">
          <span className="text-navy-400 text-xs flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-blue-400" />
            الأصناف المسجلة
          </span>
          <div className="text-xl font-bold font-mono text-white">
            {filteredItems.length} <span className="text-xs text-navy-400 font-normal">صنف</span>
          </div>
          <span className="text-[11px] text-navy-400">من إجمالي {totalItems} مسجل</span>
        </div>

        <div className="glass-card p-4 border border-navy-700/60 space-y-1">
          <span className="text-navy-400 text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-warning-400" />
            أصناف تحتاج إعادة طلب
          </span>
          <div className="text-xl font-bold font-mono text-warning-400">
            {urgentReorderItems.length} <span className="text-xs text-navy-400 font-normal">صنف</span>
          </div>
          <span className="text-[11px] text-navy-400">وصلت لحد إعادة الطلب الأدنى</span>
        </div>

        <div className="glass-card p-4 border border-navy-700/60 space-y-1">
          <span className="text-navy-400 text-xs flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-brand-400" />
            ميزانية التوريد المقترحة
          </span>
          <div className="text-xl font-bold font-mono text-brand-300">
            {formatCurrency(Math.round(totalReorderEstimatedCost))}
          </div>
          <span className="text-[11px] text-navy-400">لاستعادة السعة القصوى</span>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="glass-card p-6 border border-navy-700/60 shadow-xl space-y-4">
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-400" />
          توزيع القيمة المالية والأرصدة حسب التصنيف
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-navy-700/50 bg-navy-900/30">
                <th className="text-right text-navy-400 font-semibold px-4 py-3">التصنيف</th>
                <th className="text-right text-navy-400 font-semibold px-4 py-3">عدد الأصناف</th>
                <th className="text-right text-navy-400 font-semibold px-4 py-3">إجمالي القيمة</th>
                <th className="text-right text-navy-400 font-semibold px-4 py-3">نسبة المساهمة المالية</th>
                <th className="text-right text-navy-400 font-semibold px-4 py-3">شريط التوزيع</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map(([catKey, data]) => {
                const sharePct = totalValue > 0 ? (data.totalVal / totalValue) * 100 : 0;
                return (
                  <tr key={catKey} className="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getCategoryStyle(catKey)}`}>
                        {data.nameAr}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-white">{data.count} صنف</td>
                    <td className="px-4 py-3 font-mono font-bold text-success-400">{formatCurrency(Math.round(data.totalVal))}</td>
                    <td className="px-4 py-3 font-mono text-navy-300">{sharePct.toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <div className="w-32 h-2 bg-navy-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(5, sharePct))}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Urgent Reorder Table */}
      <div className="glass-card p-6 border border-navy-700/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-bold text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning-400" />
            الأصناف التي تتطلب إعادة توريد عاجل ({urgentReorderItems.length})
          </h4>
          <span className="text-xs text-navy-400">الأصناف التي وصلت أو نزلت عن حد الطلب الأدنى</span>
        </div>

        {urgentReorderItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-navy-700/50 bg-navy-900/30">
                  <th className="text-right text-navy-400 font-semibold px-4 py-3">كود الصنف</th>
                  <th className="text-right text-navy-400 font-semibold px-4 py-3">المادة الخام</th>
                  <th className="text-right text-navy-400 font-semibold px-4 py-3">الرصيد الفعلي</th>
                  <th className="text-right text-navy-400 font-semibold px-4 py-3">حد الطلب الأدنى</th>
                  <th className="text-right text-navy-400 font-semibold px-4 py-3">الكمية المقترح طلبها</th>
                  <th className="text-right text-navy-400 font-semibold px-4 py-3">تكلفة التوريد التقديرية</th>
                  <th className="text-right text-navy-400 font-semibold px-4 py-3">المورد المعتمد</th>
                  <th className="text-center text-navy-400 font-semibold px-4 py-3">إجراء سريع</th>
                </tr>
              </thead>
              <tbody>
                {urgentReorderItems.map((item) => {
                  const suggestedNeed = Math.max(0, item.maxStock - item.currentStock);
                  const estCost = suggestedNeed * item.costPerUnit;
                  return (
                    <tr key={item.id} className="border-b border-navy-800/40 hover:bg-navy-800/30">
                      <td className="px-4 py-3 font-mono text-navy-300 font-bold">{item.sku}</td>
                      <td className="px-4 py-3">
                        <Link to={`/inventory/${item.id}`} className="text-white font-semibold hover:text-brand-400">
                          {item.nameAr}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-danger-400">
                        {item.currentStock} {item.unitAr}
                      </td>
                      <td className="px-4 py-3 font-mono text-warning-400">
                        {item.minReorderLevel} {item.unitAr}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-brand-300">
                        +{suggestedNeed} {item.unitAr}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {item.costPerUnit > 0 ? formatCurrency(Math.round(estCost)) : 'غير محدد'}
                      </td>
                      <td className="px-4 py-3 text-navy-300">{item.supplier || 'غير محدد'}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onAdjustItem(item)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 border border-brand-500/30 transition-all inline-flex items-center gap-1"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>تسوية / وارد</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-success-400 text-xs bg-success-500/5 rounded-2xl border border-success-500/20 flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-success-400" />
            <span>ممتاز! كافة المواد الخام في مستوى رصيد آمن ولا توجد نواقص تستدعي التوريد العاجل.</span>
          </div>
        )}
      </div>

      {/* Top 5 Highest Value Assets */}
      <div className="glass-card p-6 border border-navy-700/60 shadow-xl space-y-4">
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-success-400" />
          أعلى 5 أصناف من حيث القيمة المالية بالمخزن
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {topValueItems.map((item, idx) => (
            <div key={item.id} className="p-3.5 rounded-xl bg-navy-950/60 border border-navy-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-navy-400 font-bold">#{idx + 1}</span>
                <span className="text-[10px] font-mono text-brand-400">{item.sku}</span>
              </div>
              <h5 className="text-white font-bold text-xs truncate" title={item.nameAr}>
                {item.nameAr}
              </h5>
              <div className="text-success-400 font-mono font-bold text-sm">
                {formatCurrency(Math.round(item.currentStock * item.costPerUnit))}
              </div>
              <p className="text-[10px] text-navy-400">
                {item.currentStock} {item.unitAr} × {item.costPerUnit} ج
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===================== Quick Adjust Modal ===================== */

function AdjustModal({
  item, value, onChange, onConfirm, onClose,
}: {
  item: InventoryItem; value: string; onChange: (v: string) => void; onConfirm: () => void; onClose: () => void;
}) {
  const numValue = Number(value) || 0;
  const newStock = Math.max(0, Math.round((item.currentStock + numValue) * 100) / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-card w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-navy-700/50 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-400" />
            جرد سريع / تسوية مخزنية
          </h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
            <div className="w-11 h-11 rounded-xl bg-navy-700/50 flex items-center justify-center">
              <Package className="w-5 h-5 text-navy-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{item.nameAr}</p>
              <p className="text-navy-400 text-xs font-mono">{item.sku} • الكمية الحالية: {item.currentStock} {item.unitAr}</p>
            </div>
          </div>
          <div>
            <label className="text-navy-300 text-sm font-medium mb-2 block">قيمة التسوية (+ إضافة / - خصم)</label>
            <div className="flex items-center gap-2">
              <button onClick={() => onChange(String(Math.max(numValue - 1, -999)))}
                className="w-11 h-11 rounded-xl bg-danger-500/10 hover:bg-danger-500/20 flex items-center justify-center text-danger-400 transition-all shrink-0">
                <Minus className="w-5 h-5" />
              </button>
              <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
                className="input-field text-center text-lg font-bold" placeholder="0" autoFocus />
              <button onClick={() => onChange(String(numValue + 1))}
                className="w-11 h-11 rounded-xl bg-success-500/10 hover:bg-success-500/20 flex items-center justify-center text-success-400 transition-all shrink-0">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
            <span className="text-navy-300 text-sm">الكمية بعد التسوية:</span>
            <span className={`text-lg font-bold font-mono ${newStock <= item.minReorderLevel ? 'text-warning-400' : 'text-success-400'}`}>
              {newStock} {item.unitAr}
            </span>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-navy-700/50 flex gap-3">
          <button onClick={onConfirm} className="btn-primary flex-1">تأكيد التسوية</button>
          <button onClick={onClose} className="btn-ghost">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Inventory Form Modal ===================== */

function InventoryForm({
  item, onSave, onDelete, onClose,
}: {
  item: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const { inventoryCategories, inventoryUnits, addInventoryCategory, addInventoryUnit } = useApp();
  const [form, setForm] = useState<InventoryItem>(
    item ?? {
      id: `inv-${Date.now()}`, sku: '', name: '', nameAr: '',
      unit: 'kg', unitAr: 'كيلو', costPerUnit: 0, currentStock: 0,
      minReorderLevel: 0, maxStock: 100, supplier: '',
      lastRestocked: new Date().toISOString(), category: '', categoryAr: '',
    },
  );

  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');

  const handleCreateCategory = (nameToUse?: string) => {
    const trimmed = (nameToUse || newCatName).trim();
    if (!trimmed) return;
    const cat = addInventoryCategory(trimmed);
    setForm((prev) => ({ ...prev, category: cat.id, categoryAr: cat.labelAr }));
    setShowAddCatModal(false);
    setNewCatName('');
  };

  const handleCreateUnit = (nameToUse?: string) => {
    const trimmed = (nameToUse || newUnitName).trim();
    if (!trimmed) return;
    const unit = addInventoryUnit(trimmed);
    setForm((prev) => ({ ...prev, unit: unit.id, unitAr: unit.labelAr }));
    setShowAddUnitModal(false);
    setNewUnitName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-navy-800/95 backdrop-blur-xl px-6 py-4 border-b border-navy-700/50 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-400" />
            {item ? 'تعديل مادة خام' : 'إضافة مادة خام جديدة'}
          </h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-navy-300 text-sm font-medium mb-2 block">كود الصنف (SKU)</label>
              <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input-field" placeholder="RMP-024" />
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-2 block">اسم المادة الخام</label>
              <input type="text" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="input-field" placeholder="اسم المادة" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-navy-300 text-sm font-medium">التصنيف</label>
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(true)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-bold bg-brand-500/10 hover:bg-brand-500/20 px-2 py-0.5 rounded border border-brand-500/20 transition-all flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ تصنيف</span>
                </button>
              </div>
              <select
                value={form.category}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setShowAddCatModal(true);
                    return;
                  }
                  const opt = inventoryCategories.find((o) => o.id === e.target.value);
                  setForm({ ...form, category: e.target.value, categoryAr: opt?.labelAr ?? '' });
                }}
                className="input-field"
              >
                <option value="">اختر تصنيف...</option>
                {inventoryCategories.map((o) => (
                  <option key={o.id} value={o.id} className="bg-navy-900 text-white">
                    {o.labelAr}
                  </option>
                ))}
                <option value="__add_new__" className="bg-navy-900 text-brand-400 font-bold">
                  + إضافة تصنيف جديد...
                </option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-navy-300 text-sm font-medium">وحدة القياس</label>
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(true)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-bold bg-brand-500/10 hover:bg-brand-500/20 px-2 py-0.5 rounded border border-brand-500/20 transition-all flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ وحدة</span>
                </button>
              </div>
              <select
                value={form.unit}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setShowAddUnitModal(true);
                    return;
                  }
                  const opt = inventoryUnits.find((o) => o.id === e.target.value);
                  setForm({ ...form, unit: e.target.value, unitAr: opt?.labelAr ?? '' });
                }}
                className="input-field"
              >
                {inventoryUnits.map((o) => (
                  <option key={o.id} value={o.id} className="bg-navy-900 text-white">
                    {o.labelAr}
                  </option>
                ))}
                <option value="__add_new__" className="bg-navy-900 text-brand-400 font-bold">
                  + إضافة وحدة قياس جديدة...
                </option>
              </select>
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-2 block">تكلفة الوحدة</label>
              <input type="number" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: Number(e.target.value) })} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-2 block">الكمية الحالية</label>
              <input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-2 block">حد الطلب الأدنى</label>
              <input type="number" value={form.minReorderLevel} onChange={(e) => setForm({ ...form, minReorderLevel: Number(e.target.value) })} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-2 block">الحد الأقصى</label>
              <input type="number" value={form.maxStock} onChange={(e) => setForm({ ...form, maxStock: Number(e.target.value) })} className="input-field" placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="text-navy-300 text-sm font-medium mb-2 block">المورد</label>
              <input type="text" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="input-field" placeholder="اسم المورد" />
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-navy-800/95 backdrop-blur-xl px-6 py-4 border-t border-navy-700/50 flex gap-3">
          <button onClick={() => onSave(form)} className="btn-primary flex-1">{item ? 'حفظ' : 'إضافة'}</button>
          {item && (
            <button onClick={() => onDelete(item.id)} className="btn-ghost text-danger-400 hover:bg-danger-500/10 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              حذف
            </button>
          )}
          <button onClick={onClose} className="btn-ghost">إلغاء</button>
        </div>
      </div>

      {/* Nested Add Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddCatModal(false)}>
          <div className="glass-card w-full max-w-sm p-5 animate-scale-in border border-navy-700/80 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-navy-700/50">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-400" />
                إضافة تصنيف جديد
              </h4>
              <button onClick={() => setShowAddCatModal(false)} className="w-8 h-8 rounded-lg bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-navy-300 text-xs font-semibold mb-1.5 block">اسم التصنيف بالعربية</label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="مثال: مجمدات ومشروبات"
                className="input-field text-xs font-semibold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {['مجمدات', 'مشروبات', 'حلويات', 'نظافة وتشغيل'].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleCreateCategory(sug)}
                  className="px-2 py-0.5 rounded text-[11px] bg-navy-800 text-navy-300 hover:text-brand-300 hover:bg-brand-500/20 border border-navy-700/60"
                >
                  + {sug}
                </button>
              ))}
            </div>
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => handleCreateCategory()}
                disabled={!newCatName.trim()}
                className="btn-primary flex-1 py-1.5 text-xs font-bold"
              >
                إضافة
              </button>
              <button type="button" onClick={() => setShowAddCatModal(false)} className="btn-ghost flex-1 py-1.5 text-xs">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nested Add Unit Modal */}
      {showAddUnitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddUnitModal(false)}>
          <div className="glass-card w-full max-w-sm p-5 animate-scale-in border border-navy-700/80 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-navy-700/50">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <Boxes className="w-4 h-4 text-brand-400" />
                إضافة وحدة قياس جديدة
              </h4>
              <button onClick={() => setShowAddUnitModal(false)} className="w-8 h-8 rounded-lg bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-navy-300 text-xs font-semibold mb-1.5 block">اسم وحدة القياس بالعربية</label>
              <input
                type="text"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                placeholder="مثال: باكت، شيكارة، دستة..."
                className="input-field text-xs font-semibold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateUnit();
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {['باكت', 'شيكارة', 'دستة', 'برميل', 'ربطة', 'صندوق'].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleCreateUnit(sug)}
                  className="px-2 py-0.5 rounded text-[11px] bg-navy-800 text-navy-300 hover:text-brand-300 hover:bg-brand-500/20 border border-navy-700/60"
                >
                  + {sug}
                </button>
              ))}
            </div>
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => handleCreateUnit()}
                disabled={!newUnitName.trim()}
                className="btn-primary flex-1 py-1.5 text-xs font-bold"
              >
                إضافة
              </button>
              <button type="button" onClick={() => setShowAddUnitModal(false)} className="btn-ghost flex-1 py-1.5 text-xs">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
