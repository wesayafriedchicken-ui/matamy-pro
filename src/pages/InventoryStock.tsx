import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { InventoryItem } from '@/types';
import {
  Plus, Search, Package, AlertTriangle, TrendingDown, Boxes, Truck,
  X, Edit3, Minus, Sliders, Trash2, ChefHat,
} from 'lucide-react';
import {
  formatCurrency, getStockBadge, getStockStatus,
} from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

export default function InventoryStock() {
  const { inventory, updateInventoryItem, addInventoryItem, deleteInventoryItem, adjustStock } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'ok'>('all');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustValue, setAdjustValue] = useState('');

  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.nameAr.includes(search) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const status = getStockStatus(item.currentStock, item.minReorderLevel);
    const matchesFilter = filter === 'all' || (filter === 'low' && status !== 'ok') || (filter === 'ok' && status === 'ok');
    return matchesSearch && matchesFilter;
  });

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) !== 'ok');
  const outItems = inventory.filter((i) => getStockStatus(i.currentStock, i.minReorderLevel) === 'out');
  const totalValue = inventory.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0);

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

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="المخزون والوصفات"
        description="المواد الخام بالمخزن - إدارة وتتبع المخزون والجرد"
        actions={
          <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            إضافة مادة خام
          </button>
        }
      />

      {/* Route-based navigation (replaces tab switcher) */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit">
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <Package className="w-4 h-4" />
          المواد الخام بالمخزن
        </span>
        <Link to="/inventory/recipes" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <ChefHat className="w-4 h-4" />
          تركيب الوجبات والوصفات
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Boxes} label="إجمالي الأصناف" value={String(totalItems)} color="blue" />
        <StatCard icon={AlertTriangle} label="مخزون منخفض" value={String(lowStockItems.length)} color="warning" />
        <StatCard icon={TrendingDown} label="نفذ من المخزون" value={String(outItems.length)} color="danger" />
        <StatCard icon={Package} label="قيمة المخزون" value={formatCurrency(Math.round(totalValue))} color="success" />
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="بحث بالاسم أو الكود..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pr-10" />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'low', 'ok'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === f ? 'bg-brand-500 text-white' : 'bg-navy-800/60 text-navy-300 hover:bg-navy-700'
              }`}>
              {f === 'all' ? 'الكل' : f === 'low' ? 'منخفض / نفذ' : 'متوفر'}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-700/50">
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">كود الصنف</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">المادة الخام</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">التصنيف</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الوحدة</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">تكلفة الوحدة</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الكمية الحالية</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">حد الطلب الأدنى</th>
                <th className="text-right text-navy-400 text-xs font-medium px-5 py-3">الحالة</th>
                <th className="text-center text-navy-400 text-xs font-medium px-5 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const badge = getStockBadge(item.currentStock, item.minReorderLevel);
                const stockPct = Math.min((item.currentStock / item.maxStock) * 100, 100);
                const reorderPct = (item.minReorderLevel / item.maxStock) * 100;
                return (
                  <tr key={item.id} className="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors">
                    <td className="px-5 py-3.5"><span className="text-navy-300 font-mono text-xs">{item.sku}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-navy-700/50 flex items-center justify-center">
                          <Package className="w-4 h-4 text-navy-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{item.nameAr}</p>
                          <p className="text-navy-400 text-xs">{item.supplier}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><span className="text-navy-200 text-sm">{item.categoryAr}</span></td>
                    <td className="px-5 py-3.5"><span className="text-navy-300 text-sm">{item.unitAr}</span></td>
                    <td className="px-5 py-3.5"><span className="text-white text-sm font-mono">{item.costPerUnit} ج</span></td>
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
                        <button onClick={() => { setEditingItem(item); setShowForm(true); }}
                          className="w-8 h-8 rounded-lg bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
                          <Edit3 className="w-4 h-4" />
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
            <p className="text-navy-400 text-sm">لا توجد مواد مطابقة</p>
          </div>
        )}
      </div>

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
  const [form, setForm] = useState<InventoryItem>(
    item ?? {
      id: `inv-${Date.now()}`, sku: '', name: '', nameAr: '',
      unit: 'kg', unitAr: 'كيلو', costPerUnit: 0, currentStock: 0,
      minReorderLevel: 0, maxStock: 100, supplier: '',
      lastRestocked: new Date().toISOString(), category: '', categoryAr: '',
    },
  );

  const unitOptions = [
    { value: 'kg', labelAr: 'كيلو' },
    { value: 'pcs', labelAr: 'حبة' },
    { value: 'liters', labelAr: 'لتر' },
    { value: 'grams', labelAr: 'جرام' },
  ];

  const categoryOptions = [
    { value: 'Meat', labelAr: 'لحوم' },
    { value: 'Vegetables', labelAr: 'خضروات' },
    { value: 'Dairy', labelAr: 'ألبان' },
    { value: 'Sauces', labelAr: 'صوصات' },
    { value: 'Bakery', labelAr: 'مخبوزات' },
    { value: 'Beverages', labelAr: 'مشروبات' },
    { value: 'Packaging', labelAr: 'تغليف ومطبوعات' },
    { value: 'Seasoning', labelAr: 'توابل' },
    { value: 'Oils', labelAr: 'زيوت' },
    { value: 'Grains', labelAr: 'حبوب' },
  ];

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
              <label className="text-navy-300 text-sm font-medium mb-2 block">التصنيف</label>
              <select value={form.category}
                onChange={(e) => {
                  const opt = categoryOptions.find((o) => o.value === e.target.value);
                  setForm({ ...form, category: e.target.value, categoryAr: opt?.labelAr ?? '' });
                }} className="input-field">
                <option value="">اختر تصنيف...</option>
                {categoryOptions.map((o) => (<option key={o.value} value={o.value}>{o.labelAr}</option>))}
              </select>
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-2 block">وحدة القياس</label>
              <select value={form.unit}
                onChange={(e) => {
                  const opt = unitOptions.find((o) => o.value === e.target.value);
                  setForm({ ...form, unit: e.target.value as InventoryItem['unit'], unitAr: opt?.labelAr ?? '' });
                }} className="input-field">
                {unitOptions.map((o) => (<option key={o.value} value={o.value}>{o.labelAr}</option>))}
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
    </div>
  );
}
