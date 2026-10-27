import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { MenuItem, RecipeIngredient, Modifier, ModifierOption, DigitalChannel } from '@/types';
import {
  Plus,
  X,
  UtensilsCrossed,
  Search,
  DollarSign,
  TrendingUp,
  Package,
  Edit3,
  ChefHat,
  Clock,
  Grid3x3,
  List,
  Globe,
  Store,
  Bike,
  Barcode,
  Check,
  Trash2,
  ToggleRight,
  ToggleLeft,
  RotateCcw,
  Eye,
  Sparkles,
  Tv,
} from 'lucide-react';
import MenuBoardView from '@/components/menu/MenuBoardView';
import {
  calculateFoodCost,
  calculateProfitMargin,
  calculateProfit,
} from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';

export default function MenuManagement() {
  const { menuItems, inventory, updateMenuItem, addMenuItem, deleteMenuItem, deleteAllMenuItems, resetToDefaultMenu } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'board'>('grid');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showMenuBoardModal, setShowMenuBoardModal] = useState(false);
  const [deleteItemTarget, setDeleteItemTarget] = useState<MenuItem | null>(null);

  const categories = ['all', ...Array.from(new Set(menuItems.map((m) => m.categoryAr)))];

  const filtered = menuItems.filter((m) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      m.nameAr.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      (m.descriptionAr && m.descriptionAr.toLowerCase().includes(q)) ||
      (m.barcode && m.barcode.includes(q));
    const matchesCategory = selectedCategory === 'all' || m.categoryAr === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = (item: MenuItem) => {
    if (menuItems.find((m) => m.id === item.id)) {
      updateMenuItem(item);
    } else {
      addMenuItem(item);
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const handleConfirmDelete = () => {
    if (deleteItemTarget) {
      deleteMenuItem(deleteItemTarget.id);
      setDeleteItemTarget(null);
    }
  };

  const handleConfirmReset = async () => {
    await resetToDefaultMenu();
    setShowResetConfirm(false);
    setSelectedCategory('all');
    setSearch('');
  };

  const handleConfirmDeleteAll = async () => {
    await deleteAllMenuItems();
    setShowDeleteAllConfirm(false);
    setSelectedCategory('all');
    setSearch('');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="المنيو والأصناف (Nine Fries)"
        description="إدارة قائمة أسعار ناين فرايز الرسمية، خيارات التخصيص، تكلفة المكونات، وتتبع الوجبات"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="btn-primary flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 border border-navy-700/60 flex items-center justify-between">
          <div>
            <p className="text-navy-400 text-xs mb-1">إجمالي أصناف المنيو</p>
            <p className="text-2xl font-bold font-mono text-white">{menuItems.length} <span className="text-xs font-normal text-navy-400">صنف</span></p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center text-brand-400">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 border border-navy-700/60 flex items-center justify-between">
          <div>
            <p className="text-navy-400 text-xs mb-1">أصناف لودد فرايز وسندوتشات</p>
            <p className="text-2xl font-bold font-mono text-amber-300">
              {menuItems.filter((m) => m.categoryAr === 'لودد فرايز' || m.categoryAr === 'سندوتشات').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 border border-navy-700/60 flex items-center justify-between">
          <div>
            <p className="text-navy-400 text-xs mb-1">الصوصات والإضافات</p>
            <p className="text-2xl font-bold font-mono text-emerald-300">
              {menuItems.filter((m) => m.categoryAr === 'صوصات' || m.categoryAr === 'إضافات').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 border border-navy-700/60 flex items-center justify-between">
          <div>
            <p className="text-navy-400 text-xs mb-1">متوسط سعر الصنف</p>
            <p className="text-2xl font-bold font-mono text-white">
              {Math.round(menuItems.reduce((acc, m) => acc + m.price, 0) / (menuItems.length || 1))} <span className="text-xs text-navy-400 font-normal">ج.م</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث عن صنف أو مكون أو باركود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pr-10 text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => {
            const count = cat === 'all' ? menuItems.length : menuItems.filter((m) => m.categoryAr === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-navy-800/80 text-navy-300 hover:bg-navy-700 hover:text-white border border-navy-700/50'
                }`}
              >
                <span>{cat === 'all' ? 'جميع الأصناف' : cat}</span>
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
        <div className="flex items-center gap-1 bg-navy-800/60 rounded-xl p-1 border border-navy-700/60 shadow-inner">
          <button
            onClick={() => setViewMode('grid')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              viewMode === 'grid' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' : 'text-navy-400 hover:text-white'
            }`}
            title="عرض البطاقات (Grid View)"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              viewMode === 'list' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' : 'text-navy-400 hover:text-white'
            }`}
            title="عرض الجدول (List View)"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              viewMode === 'board' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' : 'text-navy-400 hover:text-white'
            }`}
            title="عرض لوحة المنيو الرسمية (Digital Menu Board)"
          >
            <Tv className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      {viewMode === 'board' ? (
        <MenuBoardView
          menuItems={menuItems}
          onEditItem={(item) => {
            setEditingItem(item);
            setShowForm(true);
          }}
          onDeleteItem={(item) => setDeleteItemTarget(item)}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onEdit={() => { setEditingItem(item); setShowForm(true); }}
              onDelete={() => setDeleteItemTarget(item)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card overflow-hidden shadow-2xl border border-navy-700/60">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-navy-700/50 bg-navy-900/40">
                  <th className="text-right text-navy-400 font-semibold px-5 py-3.5">الصنف</th>
                  <th className="text-right text-navy-400 font-semibold px-5 py-3.5">التصنيف</th>
                  <th className="text-right text-navy-400 font-semibold px-5 py-3.5">السعر</th>
                  <th className="text-right text-navy-400 font-semibold px-5 py-3.5">تكلفة المكونات</th>
                  <th className="text-right text-navy-400 font-semibold px-5 py-3.5">Food Cost %</th>
                  <th className="text-right text-navy-400 font-semibold px-5 py-3.5">هامش الربح</th>
                  <th className="text-right text-navy-400 font-semibold px-5 py-3.5">القنوات</th>
                  <th className="text-right text-navy-400 font-semibold px-5 py-3.5">التوفر</th>
                  <th className="text-center text-navy-400 font-semibold px-5 py-3.5">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const foodCost = calculateFoodCost(item.recipe);
                  const margin = calculateProfitMargin(item.price, foodCost);
                  const fcPct = item.price > 0 ? Math.round((foodCost / item.price) * 100) : 0;
                  return (
                    <tr key={item.id} className="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center text-brand-400 shrink-0 font-bold border border-navy-700/60">
                            <UtensilsCrossed className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">{item.nameAr}</p>
                            <p className="text-navy-400 text-[11px] line-clamp-1">{item.descriptionAr || item.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-navy-800 text-navy-200 border border-navy-700/60">
                          {item.categoryAr}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-white text-sm font-bold font-mono">
                          {item.price === 0 ? 'مجاني' : `${item.price} ج`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-warning-400 text-sm font-mono font-bold">
                          {Math.round(foodCost * 10) / 10} ج
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-bold font-mono ${fcPct < 35 ? 'text-success-400' : fcPct < 50 ? 'text-warning-400' : 'text-danger-400'}`}>
                          {fcPct}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-bold font-mono ${margin > 60 ? 'text-success-400' : margin > 40 ? 'text-warning-400' : 'text-danger-400'}`}>
                          {margin}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {item.digitalChannels.includes('website_app') && (
                            <span title="ويب وتطبيق" className="inline-flex">
                              <Globe className="w-3.5 h-3.5 text-blue-400" />
                            </span>
                          )}
                          {item.digitalChannels.includes('dine_in_only') && (
                            <span title="داخل الصالة" className="inline-flex">
                              <Store className="w-3.5 h-3.5 text-success-400" />
                            </span>
                          )}
                          {item.digitalChannels.includes('delivery_only') && (
                            <span title="توصيل" className="inline-flex">
                              <Bike className="w-3.5 h-3.5 text-brand-400" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
                          item.available ? 'bg-success-500/15 text-success-400' : 'bg-danger-500/15 text-danger-400'
                        }`}>
                          <span className={`status-dot ${item.available ? 'bg-success-500' : 'bg-danger-500'}`} />
                          {item.available ? 'متاح' : 'غير متاح'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => { setEditingItem(item); setShowForm(true); }}
                            className="w-8 h-8 rounded-lg bg-navy-700/50 hover:bg-brand-500/20 hover:text-brand-400 flex items-center justify-center text-navy-300 hover:text-white transition-all"
                            title="تعديل الصنف والمكونات"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteItemTarget(item)}
                            className="w-8 h-8 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 flex items-center justify-center transition-all"
                            title="حذف الصنف من المنيو"
                          >
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
        </div>
      )}

      {menuItems.length === 0 ? (
        <div className="py-16 text-center glass-card border border-navy-700/60 rounded-2xl mt-4 max-w-2xl mx-auto space-y-4 p-8">
          <div className="w-16 h-16 rounded-2xl bg-danger-500/10 flex items-center justify-center text-danger-400 mx-auto">
            <Trash2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-1">المنيو فارغ حالياً</h4>
            <p className="text-navy-300 text-xs leading-relaxed">
              تم مسح جميع الأصناف. يمكنك الآن استيراد وتطبيق الأصناف الـ 37 المعتمدة من قائمة ناين فرايز الرسمية (المرفقة بالصورة 4K) بنقرة واحدة، أو البدء بإضافة أصناف جديدة.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <button
              onClick={handleConfirmReset}
              className="btn-primary flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>تحميل منيو ناين فرايز (37 صنف من الصورة)</span>
            </button>
            <button
              onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="btn-ghost flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-navy-700"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف يدوي</span>
            </button>
          </div>
        </div>
      ) : viewMode !== 'board' && filtered.length === 0 ? (
        <div className="py-16 text-center glass-card border border-navy-700/60 rounded-2xl mt-4">
          <UtensilsCrossed className="w-12 h-12 text-navy-600 mx-auto mb-3" />
          <h4 className="text-white font-bold text-base mb-1">لا توجد أصناف مطابقة للبحث</h4>
          <p className="text-navy-400 text-xs mb-4">جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('all'); }}
            className="btn-ghost text-xs font-semibold px-4 py-2"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      ) : null}

      {/* ===================== ORIGINAL 4K MENU BOARD MODAL ===================== */}
      {showMenuBoardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setShowMenuBoardModal(false)}
        >
          <div
            className="glass-card w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col border border-navy-700/80 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-navy-700/70 flex items-center justify-between bg-navy-900/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">لوحة منيو ناين فرايز الرسمية المعتمدة (4K)</h3>
                  <p className="text-navy-400 text-xs">مطابقة تماماً للأصناف والأسعار في النظام الحالي</p>
                </div>
              </div>
              <button
                onClick={() => setShowMenuBoardModal(false)}
                className="w-8 h-8 rounded-lg bg-navy-800 text-navy-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto p-3 flex items-center justify-center bg-black/50">
              <img
                src="/assets/aistudio/4k_menu_Nine_Fries_b7129251.png"
                alt="Nine Fries 4K Official Menu"
                className="max-w-full h-auto rounded-xl shadow-2xl object-contain border border-navy-800"
              />
            </div>
            <div className="p-3 bg-navy-950/80 border-t border-navy-800 text-xs text-navy-300 flex justify-between items-center">
              <span>جميع الأصناف الـ 37 تم استيرادها وتكوين وصفاتها وأسعارها بالكامل</span>
              <button
                onClick={() => setShowMenuBoardModal(false)}
                className="btn-primary text-xs py-1.5 px-4 font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== RESET CONFIRM MODAL ===================== */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="glass-card w-full max-w-md p-6 animate-scale-in border border-navy-700/80 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 flex items-center justify-center text-brand-400 mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-white font-bold text-lg">استعادة منيو ناين فرايز الرسمي (37 صنف)؟</h3>
              <p className="text-navy-300 text-xs leading-relaxed">
                سيتم مسح أي تعديلات سابقة وإعادة ضبط المنيو بالكامل طبقاً لصورة منيو ناين فرايز الرسمية المرفقة (لودد فرايز، فرايز تري، ماك آند تشيز، سندوتشات، وجبات، صوصات، إضافات، ومشروبات).
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

      {/* ===================== DELETE ALL CONFIRM MODAL ===================== */}
      {showDeleteAllConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowDeleteAllConfirm(false)}
        >
          <div
            className="glass-card w-full max-w-md p-6 animate-scale-in border border-danger-500/50 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-danger-500/15 flex items-center justify-center text-danger-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-white font-bold text-lg">مسح كافة أصناف المنيو؟</h3>
              <p className="text-navy-300 text-xs leading-relaxed">
                هل أنت متأكد من مسح جميع الأصناف ({menuItems.length} صنف)؟ سيتم تفريغ المنيو بالكامل من النظام ومن قاعدة البيانات. يمكنك في أي وقت إعادة تحميل أصناف ناين فرايز الـ 37 بضغطة زر.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmDeleteAll}
                className="btn-danger flex-1 py-2.5 text-xs font-bold bg-danger-600 hover:bg-danger-500 text-white rounded-xl shadow-lg shadow-danger-600/30"
              >
                تأكيد مسح كافة الأصناف
              </button>
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="btn-ghost flex-1 py-2.5 text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRM MODAL ===================== */}
      {deleteItemTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setDeleteItemTarget(null)}
        >
          <div
            className="glass-card w-full max-w-md p-6 animate-scale-in border border-danger-500/40 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-danger-500/15 flex items-center justify-center text-danger-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-white font-bold text-lg">حذف صنف من المنيو؟</h3>
              <p className="text-white font-semibold text-sm">{deleteItemTarget.nameAr}</p>
              <p className="text-navy-300 text-xs leading-relaxed">
                هل أنت متأكد من حذف هذا الصنف من المنيو؟ لن يظهر بعد ذلك في نقاط البيع (POS) أو الطلبات الجديدة.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmDelete}
                className="btn-danger flex-1 py-2.5 text-xs font-bold bg-danger-500 hover:bg-danger-600 text-white rounded-xl"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setDeleteItemTarget(null)}
                className="btn-ghost flex-1 py-2.5 text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MENU ITEM FORM MODAL ===================== */}
      {showForm && (
        <MenuItemForm
          item={editingItem}
          inventory={inventory}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

/* ===================== Menu Card (Grid View) ===================== */

function MenuCard({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const foodCost = calculateFoodCost(item.recipe);
  const profit = calculateProfit(item.price, foodCost);
  const margin = calculateProfitMargin(item.price, foodCost);
  const fcPct = item.price > 0 ? Math.round((foodCost / item.price) * 100) : 0;

  return (
    <div className="glass-card overflow-hidden hover:scale-[1.01] transition-transform duration-200 border border-navy-700/60 hover:border-brand-500/40">
      <div className="h-32 bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center relative border-b border-navy-800">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        {!item.available && (
          <div className="absolute top-3 right-3 bg-danger-500/20 text-danger-400 text-xs px-2.5 py-1 rounded-lg border border-danger-500/30">
            غير متاح بالمطبخ
          </div>
        )}
        <div className="absolute top-3 left-3 bg-navy-900/90 backdrop-blur-sm text-navy-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-navy-700/60">
          {item.categoryAr}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          {item.digitalChannels.includes('website_app') && (
            <div className="bg-navy-900/80 backdrop-blur-sm rounded-lg p-1.5" title="ويب وتطبيق">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
            </div>
          )}
          {item.digitalChannels.includes('dine_in_only') && (
            <div className="bg-navy-900/80 backdrop-blur-sm rounded-lg p-1.5" title="داخل الصالة">
              <Store className="w-3.5 h-3.5 text-success-400" />
            </div>
          )}
          {item.digitalChannels.includes('delivery_only') && (
            <div className="bg-navy-900/80 backdrop-blur-sm rounded-lg p-1.5" title="توصيل">
              <Bike className="w-3.5 h-3.5 text-brand-400" />
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-white font-bold text-base">{item.nameAr}</h4>
            <p className="text-navy-400 text-xs mt-0.5">{item.name}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-lg bg-navy-700/50 hover:bg-brand-500/20 hover:text-brand-400 flex items-center justify-center text-navy-300 hover:text-white transition-all"
              title="تعديل الصنف والمكونات"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 flex items-center justify-center transition-all"
              title="حذف الصنف من المنيو"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-navy-300 text-xs mb-4 line-clamp-2 leading-relaxed">{item.descriptionAr}</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-navy-900/50 rounded-xl px-3 py-2 text-center border border-navy-700/40">
            <p className="text-navy-400 text-xs mb-0.5">السعر</p>
            <p className="text-white font-bold text-sm font-mono">{item.price}</p>
          </div>
          <div className="bg-navy-900/50 rounded-xl px-3 py-2 text-center border border-navy-700/40">
            <p className="text-navy-400 text-xs mb-0.5">التكلفة</p>
            <p className="text-warning-400 font-bold text-sm font-mono">{Math.round(foodCost)}</p>
          </div>
          <div className="bg-navy-900/50 rounded-xl px-3 py-2 text-center border border-navy-700/40">
            <p className="text-navy-400 text-xs mb-0.5">الربح</p>
            <p className="text-success-400 font-bold text-sm font-mono">{profit}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-navy-400 text-xs">Food Cost {fcPct}% • هامش {margin}%</span>
            <span className={`text-sm font-bold ${margin > 60 ? 'text-success-400' : margin > 40 ? 'text-warning-400' : 'text-danger-400'}`}>
              {margin}%
            </span>
          </div>
          <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${margin > 60 ? 'bg-success-500' : margin > 40 ? 'bg-warning-500' : 'bg-danger-500'}`}
              style={{ width: `${margin}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-navy-400 bg-navy-900/40 rounded-xl px-3 py-2">
          <ChefHat className="w-3.5 h-3.5" />
          <span>{item.recipe.length} مكون</span>
          <span className="mx-1">•</span>
          {item.modifiers.length > 0 ? (
            <span>{item.modifiers.length} خيار تخصيص</span>
          ) : (
            <span>بدون تخصيص</span>
          )}
          <span className="mx-1">•</span>
          <Clock className="w-3.5 h-3.5" />
          <span>{item.prepTime} د</span>
        </div>
      </div>
    </div>
  );
}

/* ===================== Menu Item Form Modal ===================== */

const digitalChannelConfig: { value: DigitalChannel; labelAr: string; icon: typeof Globe }[] = [
  { value: 'website_app', labelAr: 'الويب سايت والتطبيق', icon: Globe },
  { value: 'dine_in_only', labelAr: 'داخل الصالة فقط', icon: Store },
  { value: 'delivery_only', labelAr: 'التوصيل فقط', icon: Bike },
];

interface MenuItemFormProps {
  item: MenuItem | null;
  inventory: { id: string; nameAr: string; unitAr: string; costPerUnit: number; unit: string }[];
  onSave: (item: MenuItem) => void;
  onClose: () => void;
}

function MenuItemForm({ item, inventory, onSave, onClose }: MenuItemFormProps) {
  const [name, setName] = useState(item?.nameAr ?? '');
  const [nameEn, setNameEn] = useState(item?.name ?? '');
  const [category, setCategory] = useState(item?.categoryAr ?? '');
  const [price, setPrice] = useState(item?.price ?? 0);
  const [description, setDescription] = useState(item?.descriptionAr ?? '');
  const [prepTime, setPrepTime] = useState(item?.prepTime ?? 10);
  const [available, setAvailable] = useState(item?.available ?? true);
  const [barcode, setBarcode] = useState(item?.barcode ?? '');
  const [recipe, setRecipe] = useState<RecipeIngredient[]>(item?.recipe ?? []);
  const [modifiers, setModifiers] = useState<Modifier[]>(item?.modifiers ?? []);
  const [digitalChannels, setDigitalChannels] = useState<DigitalChannel[]>(item?.digitalChannels ?? ['website_app', 'dine_in_only', 'delivery_only']);
  const [activeSection, setActiveSection] = useState<'basic' | 'modifiers' | 'channels' | 'recipe'>('basic');

  const addRecipeIngredient = () => {
    setRecipe([...recipe, { inventoryId: '', name: '', nameAr: '', quantity: 0, unit: '', unitAr: '', cost: 0 }]);
  };

  const updateRecipeIngredient = (index: number, inventoryId: string) => {
    const inv = inventory.find((i) => i.id === inventoryId);
    if (!inv) return;
    const updated = [...recipe];
    updated[index] = {
      ...updated[index],
      inventoryId: inv.id,
      nameAr: inv.nameAr,
      unit: inv.unit,
      unitAr: inv.unitAr,
      cost: Math.round((inv.costPerUnit / (inv.unit === 'kg' || inv.unit === 'liters' ? 1000 : 1)) * updated[index].quantity * 10) / 10,
    };
    setRecipe(updated);
  };

  const updateQuantity = (index: number, qty: number) => {
    const updated = [...recipe];
    const inv = inventory.find((i) => i.id === updated[index].inventoryId);
    if (inv) {
      const perUnit = inv.costPerUnit / (inv.unit === 'kg' || inv.unit === 'liters' ? 1000 : 1);
      updated[index].cost = Math.round(perUnit * qty * 10) / 10;
    }
    updated[index].quantity = qty;
    setRecipe(updated);
  };

  const removeRecipeIngredient = (index: number) => {
    setRecipe(recipe.filter((_, i) => i !== index));
  };

  const addModifier = () => {
    setModifiers([...modifiers, { id: `mod-${Date.now()}`, nameAr: '', type: 'single', required: false, options: [] }]);
  };

  const updateModifier = (index: number, updates: Partial<Modifier>) => {
    const updated = [...modifiers];
    updated[index] = { ...updated[index], ...updates };
    setModifiers(updated);
  };

  const removeModifier = (index: number) => {
    setModifiers(modifiers.filter((_, i) => i !== index));
  };

  const addModifierOption = (modIndex: number) => {
    const updated = [...modifiers];
    const newOpt: ModifierOption = { id: `opt-${Date.now()}`, nameAr: '', price: 0 };
    updated[modIndex].options = [...updated[modIndex].options, newOpt];
    setModifiers(updated);
  };

  const updateModifierOption = (modIndex: number, optIndex: number, updates: Partial<ModifierOption>) => {
    const updated = [...modifiers];
    updated[modIndex].options[optIndex] = { ...updated[modIndex].options[optIndex], ...updates };
    setModifiers(updated);
  };

  const removeModifierOption = (modIndex: number, optIndex: number) => {
    const updated = [...modifiers];
    updated[modIndex].options = updated[modIndex].options.filter((_, i) => i !== optIndex);
    setModifiers(updated);
  };

  const toggleDigitalChannel = (channel: DigitalChannel) => {
    setDigitalChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel],
    );
  };

  const foodCost = calculateFoodCost(recipe);
  const profit = calculateProfit(price, foodCost);
  const margin = calculateProfitMargin(price, foodCost);

  const handleSave = () => {
    onSave({
      id: item?.id ?? `m${Date.now()}`,
      name: nameEn,
      nameAr: name,
      category: category,
      categoryAr: category,
      price,
      cost: foodCost,
      image: '',
      available,
      description: '',
      descriptionAr: description,
      prepTime,
      barcode,
      modifiers,
      digitalChannels,
      recipe,
    });
  };

  const sections = [
    { id: 'basic' as const, labelAr: 'البيانات الأساسية', icon: UtensilsCrossed },
    { id: 'modifiers' as const, labelAr: 'خيارات التخصيص', icon: ChefHat },
    { id: 'channels' as const, labelAr: 'القنوات الرقمية', icon: Globe },
    { id: 'recipe' as const, labelAr: 'الوصفة والمكونات', icon: Package },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-3xl max-h-[92vh] overflow-hidden animate-scale-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-navy-800/95 backdrop-blur-xl px-6 py-4 border-b border-navy-700/50 flex items-center justify-between shrink-0">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-brand-400" />
            {item ? 'تعديل صنف' : 'إضافة صنف جديد'}
          </h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-navy-700/50 bg-navy-900/40 shrink-0 overflow-x-auto no-scrollbar">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeSection === s.id
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                    : 'text-navy-300 hover:text-white border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {s.labelAr}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {activeSection === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-2 block">اسم الصنف (عربي)</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="برجر لحم بلدي" />
                </div>
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-2 block">الاسم (إنجليزي)</label>
                  <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="input-field" placeholder="Balady Beef Burger" />
                </div>
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-2 block">التصنيف</label>
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input-field" placeholder="برجر" />
                </div>
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-2 block">سعر البيع للجمهور</label>
                  <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="input-field" placeholder="85" />
                </div>
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-2 block">وقت التحضير (دقيقة)</label>
                  <input type="number" value={prepTime} onChange={(e) => setPrepTime(Number(e.target.value))} className="input-field" placeholder="12" />
                </div>
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-2 block">الباركود</label>
                  <div className="relative">
                    <Barcode className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} className="input-field pr-10" placeholder="6221034500012" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-2 block">الوصف</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-20 resize-none" placeholder="وصف الصنف..." />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-2 block">حالة التوفر بالمطبخ</label>
                <button
                  onClick={() => setAvailable(!available)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
                    available
                      ? 'bg-success-500/15 text-success-400 border border-success-500/30'
                      : 'bg-danger-500/15 text-danger-400 border border-danger-500/30'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {available ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    {available ? 'متاح للطلب' : 'غير متاح'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeSection === 'modifiers' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-brand-400" />
                  خيارات التخصيص والإضافات
                </h4>
                <button onClick={addModifier} className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  إضافة مجموعة خيارات
                </button>
              </div>

              {modifiers.length === 0 && (
                <div className="text-center py-8 text-navy-400 text-sm bg-navy-900/40 rounded-xl border border-dashed border-navy-700/50">
                  لا توجد خيارات تخصيص. أضف مجموعة مثل "الحجم" أو "إضافات".
                </div>
              )}

              {modifiers.map((mod, modIndex) => (
                <div key={modIndex} className="bg-navy-900/50 rounded-2xl p-4 border border-navy-700/40 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={mod.nameAr}
                      onChange={(e) => updateModifier(modIndex, { nameAr: e.target.value })}
                      className="input-field flex-1"
                      placeholder="اسم المجموعة (مثل: الحجم)"
                    />
                    <select
                      value={mod.type}
                      onChange={(e) => updateModifier(modIndex, { type: e.target.value as 'single' | 'multi' })}
                      className="input-field w-32"
                    >
                      <option value="single">اختيار واحد</option>
                      <option value="multi">اختيارات متعددة</option>
                    </select>
                    <button
                      onClick={() => updateModifier(modIndex, { required: !mod.required })}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                        mod.required ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30' : 'bg-navy-700/50 text-navy-400 border border-navy-700/50'
                      }`}
                    >
                      {mod.required ? 'إجباري' : 'اختياري'}
                    </button>
                    <button onClick={() => removeModifier(modIndex)} className="w-9 h-9 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 flex items-center justify-center text-danger-400 transition-all shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 pr-2 border-r-2 border-navy-700/40">
                    {mod.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.nameAr}
                          onChange={(e) => updateModifierOption(modIndex, optIndex, { nameAr: e.target.value })}
                          className="input-field flex-1 py-2 text-sm"
                          placeholder="اسم الخيار (مثل: دبل)"
                        />
                        <div className="relative">
                          <input
                            type="number"
                            value={opt.price}
                            onChange={(e) => updateModifierOption(modIndex, optIndex, { price: Number(e.target.value) })}
                            className="input-field w-24 py-2 text-sm text-center"
                            placeholder="0"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-xs">ج</span>
                        </div>
                        <button onClick={() => removeModifierOption(modIndex, optIndex)} className="w-8 h-8 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 flex items-center justify-center text-danger-400 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addModifierOption(modIndex)}
                      className="text-brand-400 hover:text-brand-300 text-xs font-medium flex items-center gap-1 pr-2 pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة خيار
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'channels' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-400" />
                القنوات الرقمية
              </h4>
              <p className="text-navy-400 text-sm">اختر القنوات التي سيكون هذا الصنف متاحاً عليها</p>
              <div className="space-y-3">
                {digitalChannelConfig.map((ch) => {
                  const Icon = ch.icon;
                  const enabled = digitalChannels.includes(ch.value);
                  return (
                    <button
                      key={ch.value}
                      onClick={() => toggleDigitalChannel(ch.value)}
                      className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all duration-200 ${
                        enabled
                          ? 'bg-brand-500/10 border-brand-500/30'
                          : 'bg-navy-900/40 border-navy-700/40 hover:border-navy-600'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        enabled ? 'bg-brand-500/20 text-brand-400' : 'bg-navy-700/50 text-navy-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-right">
                        <p className={`font-medium text-sm ${enabled ? 'text-white' : 'text-navy-300'}`}>{ch.labelAr}</p>
                        <p className="text-navy-400 text-xs mt-0.5">
                          {ch.value === 'website_app' && 'متاح للطلب عبر الموقع والتطبيق'}
                          {ch.value === 'dine_in_only' && 'متاح للطلب داخل المطعم فقط'}
                          {ch.value === 'delivery_only' && 'متاح للتوصيل فقط'}
                        </p>
                      </div>
                      {enabled ? (
                        <ToggleRight className="w-8 h-8 text-brand-400 shrink-0" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-navy-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === 'recipe' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-400" />
                  مكونات الوصفة (BOM)
                </h4>
                <button onClick={addRecipeIngredient} className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  إضافة مكون
                </button>
              </div>

              <div className="space-y-2">
                {recipe.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2 bg-navy-900/50 rounded-xl px-3 py-2.5 border border-navy-700/40">
                    <select
                      value={ing.inventoryId}
                      onChange={(e) => updateRecipeIngredient(i, e.target.value)}
                      className="input-field flex-1 py-2 text-sm"
                    >
                      <option value="">اختر مكون...</option>
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>{inv.nameAr} ({inv.unitAr})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={ing.quantity}
                      onChange={(e) => updateQuantity(i, Number(e.target.value))}
                      className="input-field w-20 py-2 text-sm text-center"
                      placeholder="0"
                    />
                    <span className="text-navy-400 text-xs w-12 text-center">{ing.unitAr}</span>
                    <span className="text-warning-400 text-xs font-mono w-16 text-center">{ing.cost} ج</span>
                    <button onClick={() => removeRecipeIngredient(i)} className="w-8 h-8 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 flex items-center justify-center text-danger-400 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {recipe.length === 0 && (
                  <div className="text-center py-6 text-navy-400 text-sm bg-navy-900/40 rounded-xl border border-dashed border-navy-700/50">
                    لا توجد مكونات. اضغط "إضافة مكون" لربط الصنف بالمخزون.
                  </div>
                )}
              </div>

              {recipe.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40 text-center">
                    <div className="flex items-center justify-center gap-1 text-navy-400 text-xs mb-1">
                      <DollarSign className="w-3.5 h-3.5" /> تكلفة الطعام
                    </div>
                    <p className="text-warning-400 font-bold text-lg font-mono">{Math.round(foodCost * 10) / 10}</p>
                  </div>
                  <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40 text-center">
                    <div className="flex items-center justify-center gap-1 text-navy-400 text-xs mb-1">
                      <TrendingUp className="w-3.5 h-3.5" /> صافي الربح
                    </div>
                    <p className="text-success-400 font-bold text-lg font-mono">{profit}</p>
                  </div>
                  <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40 text-center">
                    <div className="flex items-center justify-center gap-1 text-navy-400 text-xs mb-1">
                      <Package className="w-3.5 h-3.5" /> هامش الربح
                    </div>
                    <p className={`font-bold text-lg ${margin > 60 ? 'text-success-400' : margin > 40 ? 'text-warning-400' : 'text-danger-400'}`}>{margin}%</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-navy-800/95 backdrop-blur-xl px-6 py-4 border-t border-navy-700/50 flex gap-3 shrink-0">
          <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            {item ? 'حفظ التعديلات' : 'إضافة الصنف'}
          </button>
          <button onClick={onClose} className="btn-ghost">إلغاء</button>
        </div>
      </div>
    </div>
  );
}
