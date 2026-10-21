import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { InventoryItem, InventoryLog, InventoryLogDiff } from '@/types';
import {
  ArrowRight,
  Package,
  Save,
  Sliders,
  Plus,
  Minus,
  Trash2,
  Clock,
  User,
  DollarSign,
  AlertTriangle,
  Truck,
  Boxes,
  FileText,
  History,
  Tag,
  Building,
  X,
  PlusCircle,
  Sparkles,
  ChefHat,
} from 'lucide-react';
import { formatCurrency, getStockBadge } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

const CATEGORY_STYLES: Record<string, { badge: string; border: string; bg: string }> = {
  spices: { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  sauces: { badge: 'bg-red-500/15 text-red-300 border-red-500/30', border: 'border-red-500/30', bg: 'bg-red-500/10' },
  bread: { badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
  proteins: { badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30', border: 'border-rose-500/30', bg: 'bg-rose-500/10' },
  dairy: { badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30', border: 'border-sky-500/30', bg: 'bg-sky-500/10' },
  vegetables: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  raw_materials: { badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  packaging: { badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
};

function getCategoryBadgeStyle(catKey?: string): { badge: string; border: string; bg: string } {
  if (!catKey) return { badge: 'bg-navy-800 text-navy-300 border-navy-700', border: 'border-navy-700', bg: 'bg-navy-800/40' };
  if (CATEGORY_STYLES[catKey]) return CATEGORY_STYLES[catKey];
  const palettes = [
    { badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30', border: 'border-teal-500/30', bg: 'bg-teal-500/10' },
    { badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30', border: 'border-violet-500/30', bg: 'bg-violet-500/10' },
    { badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
    { badge: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30', border: 'border-fuchsia-500/30', bg: 'bg-fuchsia-500/10' },
    { badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
  ];
  let hash = 0;
  for (let i = 0; i < catKey.length; i++) {
    hash = (hash << 5) - hash + catKey.charCodeAt(i);
  }
  return palettes[Math.abs(hash) % palettes.length];
}

const PRESET_ACTORS = [
  { name: 'أحمد الشناوي', role: 'مدير التشغيل والفرع' },
  { name: 'كريم فهمي', role: 'أمين المخزن ومسؤول الجرد' },
  { name: 'سارة سامح', role: 'مسؤول المشتريات والتوريدات' },
  { name: 'سيد محمود', role: 'رئيس قسم المطبخ (Head Chef)' },
];

function formatArabicDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function generateInitialLogs(item: InventoryItem): InventoryLog[] {
  const now = Date.now();
  const d1 = new Date(now - 86400000 * 3).toISOString();
  const d2 = new Date(now - 86400000 * 1.5).toISOString();
  const d3 = new Date(now - 3600000 * 5).toISOString();

  return [
    {
      id: `log-seed-3-${item.id}`,
      inventoryId: item.id,
      timestamp: d3,
      actorName: 'كريم فهمي',
      actorRole: 'أمين المخزن',
      actionType: 'adjust',
      title: 'جرد دوري وتسجيل الرصيد الفعلي',
      details: `تمت مراجعة الكمية الفعلية بالمخزن والتأكد من مطابقة الرصيد البالغ ${item.currentStock} ${item.unitAr}.`,
    },
    {
      id: `log-seed-2-${item.id}`,
      inventoryId: item.id,
      timestamp: d2,
      actorName: 'سارة سامح',
      actorRole: 'مسؤول المشتريات',
      actionType: 'restock',
      title: `استلام توريد معتمد من ${item.supplier || 'المورد'}`,
      details: `استلام شحنة واردة بحالة ممتازة وبسعر التكلفة المعتمد ${item.costPerUnit > 0 ? `${item.costPerUnit} ج.م` : 'غير محدد'}.`,
    },
    {
      id: `log-seed-1-${item.id}`,
      inventoryId: item.id,
      timestamp: d1,
      actorName: 'أحمد الشناوي',
      actorRole: 'مدير التشغيل',
      actionType: 'create',
      title: 'تسجيل المادة في قائمة الأسعار المعتمدة',
      details: `تم تسجيل كود الصنف ${item.sku} (${item.nameAr}) ضمن تصنيف ${item.categoryAr} بالوحدة ${item.unitAr}.`,
    },
  ];
}

export default function InventoryItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    inventory,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    showToast,
    inventoryCategories,
    inventoryUnits,
    addInventoryCategory,
    addInventoryUnit,
  } = useApp();

  const originalItem = useMemo(() => {
    return inventory.find((i) => i.id === id);
  }, [inventory, id]);

  const [form, setForm] = useState<InventoryItem | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | 'adjust' | 'update' | 'restock' | 'note'>('all');
  const [currentActor, setCurrentActor] = useState(PRESET_ACTORS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('جرد فعلي ومطابقة المخزون');
  const [showNewLogModal, setShowNewLogModal] = useState(false);
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogDetails, setNewLogDetails] = useState('');
  const [newLogActionType, setNewLogActionType] = useState<InventoryLog['actionType']>('note');

  // Dynamic Add Category / Unit Modal States
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryCustomId, setNewCategoryCustomId] = useState('');
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCustomId, setNewUnitCustomId] = useState('');
  const [unitModalTarget, setUnitModalTarget] = useState<'purchase' | 'recipe'>('purchase');

  const handleCreateCategory = (labelToUse?: string) => {
    const trimmed = (labelToUse || newCategoryName).trim();
    if (!trimmed) return;
    const cat = addInventoryCategory(trimmed, newCategoryCustomId);
    setForm((prev) => (prev ? { ...prev, category: cat.id, categoryAr: cat.labelAr } : null));
    setShowAddCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryCustomId('');
  };

  const handleCreateUnit = (labelToUse?: string) => {
    const trimmed = (labelToUse || newUnitName).trim();
    if (!trimmed) return;
    const unit = addInventoryUnit(trimmed, newUnitCustomId);
    setForm((prev) => {
      if (!prev) return null;
      if (unitModalTarget === 'recipe') {
        const factor = prev.conversionFactor || 1;
        const purchaseCost = prev.costPerPurchaseUnit ?? prev.costPerUnit;
        return {
          ...prev,
          recipeUnit: unit.id,
          recipeUnitAr: unit.labelAr,
          costPerRecipeUnit: Math.round((purchaseCost / factor) * 1000) / 1000,
        };
      } else {
        return {
          ...prev,
          purchaseUnit: unit.id,
          purchaseUnitAr: unit.labelAr,
          unit: unit.id,
          unitAr: unit.labelAr,
        };
      }
    });
    setShowAddUnitModal(false);
    setNewUnitName('');
    setNewUnitCustomId('');
  };

  // Load / initialize form state when originalItem is available
  useEffect(() => {
    if (originalItem) {
      const purchaseUnit = originalItem.purchaseUnit || originalItem.unit || 'basket';
      const purchaseUnitAr = originalItem.purchaseUnitAr || originalItem.unitAr || 'باسكت';
      const costPerPurchaseUnit = originalItem.costPerPurchaseUnit ?? originalItem.costPerUnit ?? 0;

      // Smart default inference for recipeUnit & conversionFactor if not explicitly configured
      let recipeUnit = originalItem.recipeUnit;
      let recipeUnitAr = originalItem.recipeUnitAr;
      let conversionFactor = originalItem.conversionFactor;

      if (!conversionFactor || !recipeUnit) {
        if (originalItem.nameAr?.includes('100 قطعه') || originalItem.unitAr?.includes('100 قطعه')) {
          recipeUnit = 'pcs';
          recipeUnitAr = 'قطعة';
          conversionFactor = 100;
        } else if (originalItem.nameAr?.includes('24 قطعه') || originalItem.unitAr?.includes('24 قطعه')) {
          recipeUnit = 'pcs';
          recipeUnitAr = 'قطعة';
          conversionFactor = 24;
        } else if (originalItem.nameAr?.includes('25 قطعه') || originalItem.unitAr?.includes('25 قطعه')) {
          recipeUnit = 'pcs';
          recipeUnitAr = 'قطعة';
          conversionFactor = 25;
        } else if (originalItem.nameAr?.includes('10 قطع') || originalItem.unitAr?.includes('10 قطع')) {
          recipeUnit = 'pcs';
          recipeUnitAr = 'قطعة';
          conversionFactor = 10;
        } else if (originalItem.nameAr?.includes('10 كجم') || originalItem.unitAr?.includes('10 كجم')) {
          recipeUnit = 'grams';
          recipeUnitAr = 'جرام';
          conversionFactor = 10000;
        } else if (originalItem.nameAr?.includes('4 كجم') || originalItem.unitAr?.includes('4 كجم')) {
          recipeUnit = 'grams';
          recipeUnitAr = 'جرام';
          conversionFactor = 4000;
        } else if (originalItem.nameAr?.includes('3.4 كجم') || originalItem.unitAr?.includes('3.4 كجم')) {
          recipeUnit = 'grams';
          recipeUnitAr = 'جرام';
          conversionFactor = 3400;
        } else if (originalItem.nameAr?.includes('3 كجم') || originalItem.unitAr?.includes('3 كجم')) {
          recipeUnit = 'grams';
          recipeUnitAr = 'جرام';
          conversionFactor = 3000;
        } else if (originalItem.nameAr?.includes('900 جم') || originalItem.unitAr?.includes('900 جم')) {
          recipeUnit = 'grams';
          recipeUnitAr = 'جرام';
          conversionFactor = 900;
        } else if (originalItem.nameAr?.includes('20 لتر') || originalItem.unitAr?.includes('20 لتر')) {
          recipeUnit = 'ml';
          recipeUnitAr = 'مللي';
          conversionFactor = 20000;
        } else if (originalItem.unit === 'kg' || originalItem.unitAr?.includes('كيلو')) {
          recipeUnit = 'grams';
          recipeUnitAr = 'جرام';
          conversionFactor = 1000;
        } else if (originalItem.unit === 'gallon' || originalItem.unitAr?.includes('جالون')) {
          recipeUnit = 'grams';
          recipeUnitAr = 'جرام';
          conversionFactor = 3000;
        } else if (originalItem.unit === 'jerrycan' || originalItem.unitAr?.includes('جيركن')) {
          recipeUnit = 'ml';
          recipeUnitAr = 'مللي';
          conversionFactor = 20000;
        } else {
          recipeUnit = 'pcs';
          recipeUnitAr = 'قطعة';
          conversionFactor = 1;
        }
      }

      const costPerRecipeUnit = originalItem.costPerRecipeUnit ?? (conversionFactor > 0 ? costPerPurchaseUnit / conversionFactor : costPerPurchaseUnit);

      setForm({
        ...originalItem,
        purchaseUnit,
        purchaseUnitAr,
        costPerPurchaseUnit,
        conversionFactor,
        recipeUnit,
        recipeUnitAr,
        costPerRecipeUnit: Math.round(costPerRecipeUnit * 1000) / 1000,
      });
    }
  }, [originalItem]);

  // Load audit logs from localStorage or generate realistic seed logs
  useEffect(() => {
    if (!id || !originalItem) return;
    const storageKey = `inventory_logs_${id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
        return;
      } catch (e) {
        console.warn('Failed to parse logs:', e);
      }
    }
    const seeds = generateInitialLogs(originalItem);
    setLogs(seeds);
    localStorage.setItem(storageKey, JSON.stringify(seeds));
  }, [id, originalItem]);

  const saveLogsToStorage = (updatedLogs: InventoryLog[]) => {
    if (!id) return;
    setLogs(updatedLogs);
    localStorage.setItem(`inventory_logs_${id}`, JSON.stringify(updatedLogs));
  };

  const addLogEntry = (
    title: string,
    details: string,
    actionType: InventoryLog['actionType'],
    diff?: InventoryLogDiff[],
  ) => {
    if (!id) return;
    const newEntry: InventoryLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      inventoryId: id,
      timestamp: new Date().toISOString(),
      actorName: currentActor.name,
      actorRole: currentActor.role,
      actionType,
      title,
      details,
      diff,
    };
    const updated = [newEntry, ...logs];
    saveLogsToStorage(updated);
  };

  if (!originalItem || !form) {
    return (
      <div className="py-20 text-center animate-fade-in space-y-4">
        <Package className="w-16 h-16 text-navy-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">المادة الخام غير موجودة</h2>
        <p className="text-navy-400 text-sm">
          لم يتم العثور على الصنف المطلوب أو قد تم حذفه من قائمة المخزون.
        </p>
        <Link to="/inventory" className="btn-primary inline-flex items-center gap-2 text-xs">
          <ArrowRight className="w-4 h-4" />
          العودة إلى قائمة المخزون
        </Link>
      </div>
    );
  }

  const badge = getStockBadge(form.currentStock, form.minReorderLevel);
  const stockPct = Math.min((form.currentStock / form.maxStock) * 100, 100);
  const reorderPct = (form.minReorderLevel / form.maxStock) * 100;
  const totalValue = form.currentStock * (form.costPerPurchaseUnit ?? form.costPerUnit);

  const purchaseCost = form.costPerPurchaseUnit ?? form.costPerUnit ?? 0;
  const factor = form.conversionFactor || 1;
  const calculatedCostPerRecipeUnit = factor > 0 ? Math.round((purchaseCost / factor) * 1000) / 1000 : 0;
  const totalRecipeUnitsInStock = Math.round(form.currentStock * factor * 100) / 100;

  // Handle saving form changes
  const handleSave = () => {
    setIsSaving(true);
    const diffs: InventoryLogDiff[] = [];

    const purchaseCost = form.costPerPurchaseUnit ?? form.costPerUnit ?? 0;
    const factor = form.conversionFactor || 1;
    const recipeCost = Math.round((purchaseCost / factor) * 1000) / 1000;

    if (purchaseCost !== (originalItem.costPerPurchaseUnit ?? originalItem.costPerUnit)) {
      diffs.push({
        field: 'costPerPurchaseUnit',
        fieldAr: 'تكلفة وحدة الشراء',
        oldVal: `${originalItem.costPerPurchaseUnit ?? originalItem.costPerUnit} ج.م`,
        newVal: `${purchaseCost} ج.م`,
      });
    }

    if (form.purchaseUnit && form.purchaseUnit !== (originalItem.purchaseUnit || originalItem.unit)) {
      diffs.push({
        field: 'purchaseUnit',
        fieldAr: 'وحدة الشراء (المخزن)',
        oldVal: originalItem.purchaseUnitAr || originalItem.unitAr,
        newVal: form.purchaseUnitAr || form.unitAr,
      });
    }

    if (form.recipeUnit && form.recipeUnit !== originalItem.recipeUnit) {
      diffs.push({
        field: 'recipeUnit',
        fieldAr: 'وحدة الاستهلاك (الوصفة)',
        oldVal: originalItem.recipeUnitAr || 'غير محدد',
        newVal: form.recipeUnitAr || form.recipeUnit,
      });
    }

    if (factor !== (originalItem.conversionFactor || 1)) {
      diffs.push({
        field: 'conversionFactor',
        fieldAr: 'معامل التحويل',
        oldVal: `${originalItem.conversionFactor || 1}`,
        newVal: `${factor}`,
      });
    }

    if (recipeCost !== (originalItem.costPerRecipeUnit ?? 0)) {
      diffs.push({
        field: 'costPerRecipeUnit',
        fieldAr: 'تكلفة وحدة الاستهلاك',
        oldVal: `${originalItem.costPerRecipeUnit ?? 'غير محدد'} ج`,
        newVal: `${recipeCost} ج`,
      });
    }

    if (form.currentStock !== originalItem.currentStock) {
      diffs.push({
        field: 'currentStock',
        fieldAr: 'الكمية الحالية',
        oldVal: `${originalItem.currentStock} ${originalItem.purchaseUnitAr || originalItem.unitAr}`,
        newVal: `${form.currentStock} ${form.purchaseUnitAr || form.unitAr}`,
      });
    }

    if (form.minReorderLevel !== originalItem.minReorderLevel) {
      diffs.push({
        field: 'minReorderLevel',
        fieldAr: 'حد الطلب الأدنى',
        oldVal: originalItem.minReorderLevel,
        newVal: form.minReorderLevel,
      });
    }

    if (form.maxStock !== originalItem.maxStock) {
      diffs.push({
        field: 'maxStock',
        fieldAr: 'الحد الأقصى',
        oldVal: originalItem.maxStock,
        newVal: form.maxStock,
      });
    }

    if (form.nameAr !== originalItem.nameAr) {
      diffs.push({
        field: 'nameAr',
        fieldAr: 'اسم المادة الخام',
        oldVal: originalItem.nameAr,
        newVal: form.nameAr,
      });
    }

    if (form.supplier !== originalItem.supplier) {
      diffs.push({
        field: 'supplier',
        fieldAr: 'المورد',
        oldVal: originalItem.supplier || 'غير محدد',
        newVal: form.supplier || 'غير محدد',
      });
    }

    if (form.category !== originalItem.category) {
      diffs.push({
        field: 'category',
        fieldAr: 'التصنيف',
        oldVal: originalItem.categoryAr,
        newVal: form.categoryAr,
      });
    }

    const updatedItem: InventoryItem = {
      ...form,
      purchaseUnit: form.purchaseUnit || form.unit,
      purchaseUnitAr: form.purchaseUnitAr || form.unitAr,
      costPerPurchaseUnit: purchaseCost,
      conversionFactor: factor,
      costPerRecipeUnit: recipeCost,
      unit: form.purchaseUnit || form.unit,
      unitAr: form.purchaseUnitAr || form.unitAr,
      costPerUnit: purchaseCost,
      lastRestocked: new Date().toISOString(),
    };

    updateInventoryItem(updatedItem);

    if (diffs.length > 0) {
      const summaryText = diffs.map((d) => `${d.fieldAr}: (${d.oldVal} ⬅️ ${d.newVal})`).join(' ، ');
      addLogEntry(
        diffs.some((d) => d.field === 'costPerPurchaseUnit' || d.field === 'costPerUnit')
          ? 'تعديل أسعار الشراء والاستهلاك'
          : 'تحديث بيانات وحدات المخزون والتوريد',
        `تم إجراء التعديلات التالية بواسطة ${currentActor.name}: ${summaryText}`,
        diffs.some((d) => d.field === 'costPerPurchaseUnit') ? 'price_change' : 'update',
        diffs,
      );
    }

    setTimeout(() => {
      setIsSaving(false);
      showToast(`تم حفظ تعديلات ${form.nameAr} وتسجيل الحركة في السجل بنجاح`, 'success');
    }, 300);
  };

  // Handle stock adjustment
  const handleConfirmAdjust = () => {
    const delta = Number(adjustAmount);
    if (isNaN(delta) || delta === 0) return;

    const oldStock = form.currentStock;
    const newStock = Math.max(0, Math.round((oldStock + delta) * 100) / 100);

    adjustStock(form.id, delta);
    setForm((prev) => (prev ? { ...prev, currentStock: newStock } : null));

    const diff: InventoryLogDiff[] = [
      {
        field: 'currentStock',
        fieldAr: 'الكمية بالمخزن',
        oldVal: `${oldStock} ${form.unitAr}`,
        newVal: `${newStock} ${form.unitAr}`,
      },
    ];

    addLogEntry(
      delta > 0 ? `إضافة توريد/استلام مخزني (+${delta})` : `تسوية / خصم مخزني (${delta})`,
      `السبب: ${adjustReason}. الرصيد تغير من ${oldStock} إلى ${newStock} ${form.unitAr}.`,
      delta > 0 ? 'restock' : 'adjust',
      diff,
    );

    setShowAdjustModal(false);
    setAdjustAmount('');
    showToast(`تمت تسوية رصيد المخزون بنجاح (+${delta} ${form.unitAr})`, 'success');
  };

  // Handle manual log submission
  const handleCreateManualLog = () => {
    if (!newLogTitle.trim()) return;
    addLogEntry(newLogTitle.trim(), newLogDetails.trim() || 'تم تسجيل القيد بنجاح', newLogActionType);
    setShowNewLogModal(false);
    setNewLogTitle('');
    setNewLogDetails('');
    showToast('تمت إضافة قيد الحركة إلى سجل النشاط بنجاح', 'success');
  };

  // Handle item deletion
  const handleDelete = () => {
    deleteInventoryItem(form.id);
    setShowDeleteModal(false);
    navigate('/inventory');
  };

  // Filter logs
  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'all') return true;
    if (logFilter === 'adjust') return l.actionType === 'adjust';
    if (logFilter === 'update') return l.actionType === 'update' || l.actionType === 'price_change';
    if (logFilter === 'restock') return l.actionType === 'restock';
    if (logFilter === 'note') return l.actionType === 'note';
    return true;
  });

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumbs & Navigation Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-navy-400">
          <Link to="/inventory" className="text-navy-300 hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowRight className="w-4 h-4 text-brand-400" />
            <span>المخزون والوصفات</span>
          </Link>
          <span>/</span>
          <Link to="/inventory" className="text-navy-300 hover:text-white transition-colors">
            المواد الخام بالمخزن
          </Link>
          <span>/</span>
          <span className="text-white font-medium">{form.nameAr}</span>
        </div>

        {/* Actor Selector (Who is making changes) */}
        <div className="flex items-center gap-2 bg-navy-900/80 border border-navy-700/60 px-3 py-1.5 rounded-xl text-xs">
          <User className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          <span className="text-navy-300 font-medium">المستخدم القائم بالعمل:</span>
          <select
            value={currentActor.name}
            onChange={(e) => {
              const found = PRESET_ACTORS.find((a) => a.name === e.target.value);
              if (found) setCurrentActor(found);
            }}
            className="bg-transparent text-white font-bold border-none outline-none cursor-pointer pr-1"
          >
            {PRESET_ACTORS.map((a) => (
              <option key={a.name} value={a.name} className="bg-navy-900 text-white">
                {a.name} ({a.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Page Header */}
      <PageHeader
        title={`تعديل مادة خام: ${form.nameAr}`}
        description={`كود الصنف: ${form.sku} • التصنيف: ${form.categoryAr} • المورد: ${form.supplier || 'غير محدد'}`}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowAdjustModal(true)}
              className="btn-ghost flex items-center gap-2 border border-navy-700/80 hover:border-brand-500/40 text-navy-200 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl"
            >
              <Sliders className="w-4 h-4 text-brand-400" />
              تسوية جرد سريعة
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-ghost text-danger-400 hover:bg-danger-500/10 border border-danger-500/20 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              حذف المادة
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2 text-xs font-bold px-5 py-2 rounded-xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Boxes}
          label="الرصيد الفعلي الحالي"
          value={`${form.currentStock} ${form.purchaseUnitAr || form.unitAr}`}
          sublabel={`يعادل ${totalRecipeUnitsInStock.toLocaleString('ar-EG')} ${form.recipeUnitAr || 'قطعة'}`}
          color={badge.label === 'متوفر' ? 'success' : badge.label === 'منخفض' ? 'warning' : 'danger'}
        />
        <StatCard
          icon={DollarSign}
          label="تكلفة وحدة الشراء المعتمدة"
          value={(form.costPerPurchaseUnit ?? form.costPerUnit) === 0 ? 'غير محدد' : `${form.costPerPurchaseUnit ?? form.costPerUnit} ج.م`}
          sublabel={`تكلفة ${form.recipeUnitAr || 'الوحدة'}: ${calculatedCostPerRecipeUnit} ج.م`}
          color="blue"
        />
        <StatCard
          icon={Package}
          label="قيمة الرصيد الإجمالية"
          value={formatCurrency(Math.round(totalValue))}
          sublabel={`${form.currentStock} ${form.purchaseUnitAr || form.unitAr} × ${form.costPerPurchaseUnit ?? form.costPerUnit} ج`}
          color="success"
        />
        <StatCard
          icon={AlertTriangle}
          label="حد إعادة الطلب الأدنى"
          value={`${form.minReorderLevel} ${form.purchaseUnitAr || form.unitAr}`}
          sublabel={`حالة المخزون: ${badge.label}`}
          color={badge.label === 'متوفر' ? 'blue' : 'warning'}
        />
      </div>

      {/* Main Form & Fast Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Form Fields */}
        <div className="lg:col-span-2 glass-card p-6 space-y-6 border border-navy-700/60 shadow-xl">
          <div className="flex items-center justify-between border-b border-navy-700/50 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">بيانات المادة الخام والتسعير</h3>
                <p className="text-navy-400 text-xs">تعديل مواصفات الصنف والوحدة والمورد وحدود التنبيه</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold border ${
                getCategoryBadgeStyle(form.category).badge
              }`}
            >
              {form.categoryAr}
            </span>
          </div>

          {/* 1. Basic Metadata Grid (SKU, Name, Category, Supplier) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-navy-300 text-xs font-semibold mb-2 block">
                كود الصنف (SKU)
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="input-field text-xs font-mono font-bold"
                placeholder="BRD-004"
              />
            </div>

            <div>
              <label className="text-navy-300 text-xs font-semibold mb-2 block">
                اسم المادة الخام والعبوة
              </label>
              <input
                type="text"
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                className="input-field text-xs font-semibold"
                placeholder="عيش الوجبات – باسكت 100 قطعه"
              />
            </div>

            {/* Category Field with dynamic + Add option */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-navy-300 text-xs font-semibold">
                  التصنيف
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors bg-brand-500/10 hover:bg-brand-500/20 px-2 py-0.5 rounded-lg border border-brand-500/20 active:scale-95"
                  title="إضافة تصنيف جديد"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ تصنيف جديد</span>
                </button>
              </div>
              <select
                value={form.category}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setShowAddCategoryModal(true);
                    return;
                  }
                  const opt = inventoryCategories.find((o) => o.id === e.target.value);
                  setForm({
                    ...form,
                    category: e.target.value,
                    categoryAr: opt?.labelAr ?? '',
                  });
                }}
                className="input-field text-xs font-semibold"
              >
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

            {/* Supplier */}
            <div>
              <label className="text-navy-300 text-xs font-semibold mb-2 block">
                المورد المعتمد
              </label>
              <input
                type="text"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="input-field text-xs"
                placeholder="ريتش باك"
              />
            </div>
          </div>

          {/* ===================== الصف الأول: وحدة الشراء / المخزن ===================== */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-800/80 via-navy-850 to-navy-900/90 border border-blue-500/35 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-navy-700/60 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-xs flex items-center gap-2">
                    <span>وحدة الشراء والتخزين بالمخزن (Purchase / Storage Unit)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      الصف الأول: الشراء / المخزن
                    </span>
                  </h4>
                  <p className="text-[11px] text-navy-400">
                    الوحدة الرسمية لأوامر التوريد وفواتير المشتريات والجرد مثل: (باسكت، كرتونة، جيركن، كيس، جالون)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* وحدة الشراء */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-navy-300 text-xs font-semibold">
                    وحدة الشراء (المخزن)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUnitModalTarget('purchase');
                      setShowAddUnitModal(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded-lg border border-blue-500/20"
                    title="إضافة وحدة توريد جديدة"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ وحدة جديدة</span>
                  </button>
                </div>
                <select
                  value={form.purchaseUnit || form.unit}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setUnitModalTarget('purchase');
                      setShowAddUnitModal(true);
                      return;
                    }
                    const opt = inventoryUnits.find((o) => o.id === e.target.value);
                    setForm({
                      ...form,
                      purchaseUnit: e.target.value,
                      purchaseUnitAr: opt?.labelAr ?? e.target.value,
                      unit: e.target.value,
                      unitAr: opt?.labelAr ?? e.target.value,
                    });
                  }}
                  className="input-field text-xs font-semibold border-blue-500/30 focus:border-blue-400"
                >
                  {inventoryUnits.map((o) => (
                    <option key={o.id} value={o.id} className="bg-navy-900 text-white">
                      {o.labelAr}
                    </option>
                  ))}
                  <option value="__add_new__" className="bg-navy-900 text-blue-400 font-bold">
                    + إضافة وحدة شراء جديدة...
                  </option>
                </select>
              </div>

              {/* تكلفة وحدة الشراء */}
              <div>
                <label className="text-navy-300 text-xs font-semibold mb-1.5 block">
                  تكلفة وحدة الشراء (سعر التوريد)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.costPerPurchaseUnit ?? form.costPerUnit}
                    onChange={(e) => {
                      const cost = Number(e.target.value);
                      const factor = form.conversionFactor || 1;
                      setForm({
                        ...form,
                        costPerPurchaseUnit: cost,
                        costPerUnit: cost,
                        costPerRecipeUnit: Math.round((cost / factor) * 1000) / 1000,
                      });
                    }}
                    className="input-field text-xs font-mono font-bold"
                    placeholder="0"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-navy-400 font-bold">
                    ج.م
                  </span>
                </div>
              </div>

              {/* الرصيد الحالي بالمخزن */}
              <div>
                <label className="text-navy-300 text-xs font-semibold mb-1.5 block">
                  الرصيد الفعلي بالمخزن
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.currentStock}
                    onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })}
                    className="input-field text-xs font-mono font-bold text-blue-300"
                    placeholder="0"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-navy-400 font-semibold">
                    {form.purchaseUnitAr || form.unitAr}
                  </span>
                </div>
              </div>

              {/* حد الطلب الأدنى */}
              <div>
                <label className="text-navy-300 text-xs font-semibold mb-1.5 block">
                  حد الطلب الأدنى (تنبيه النقص)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.minReorderLevel}
                    onChange={(e) => setForm({ ...form, minReorderLevel: Number(e.target.value) })}
                    className="input-field text-xs font-mono font-bold"
                    placeholder="0"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-navy-400">
                    {form.purchaseUnitAr || form.unitAr}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-navy-300 pt-1 border-t border-navy-700/40 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-[11px] text-navy-400">
                <span>الحد الأقصى للاستيعاب بالمخزن:</span>
                <input
                  type="number"
                  value={form.maxStock}
                  onChange={(e) => setForm({ ...form, maxStock: Number(e.target.value) })}
                  className="w-16 px-2 py-0.5 rounded-lg bg-navy-900 border border-navy-700 text-white font-mono text-xs text-center"
                />
                <span>{form.purchaseUnitAr || form.unitAr}</span>
              </div>
              <span className="text-[11px] text-blue-300 font-mono font-semibold">
                قيمة المخزون الإجمالية: {formatCurrency(form.currentStock * (form.costPerPurchaseUnit ?? form.costPerUnit))}
              </span>
            </div>
          </div>

          {/* ===================== الصف الثاني: وحدة الاستهلاك / الوصفة ===================== */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-800/80 via-navy-850 to-navy-900/90 border border-amber-500/40 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-navy-700/60 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-xs flex items-center gap-2">
                    <span>وحدة الاستهلاك والوصفات (Recipe / Base Unit)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      الصف الثاني: الاستهلاك / الوصفة
                    </span>
                  </h4>
                  <p className="text-[11px] text-navy-400">
                    تستخدم داخل المطبخ لتركيب الوجبات وحساب تكلفة الطعام (Food Cost) وخصم الاستهلاك مثل: (قطعة، جرام، مللي، شريحة)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* وحدة الاستهلاك */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-navy-300 text-xs font-semibold">
                    وحدة الاستهلاك (الوصفة)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUnitModalTarget('recipe');
                      setShowAddUnitModal(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/20"
                    title="إضافة وحدة استهلاك جديدة"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ وحدة جديدة</span>
                  </button>
                </div>
                <select
                  value={form.recipeUnit || 'pcs'}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setUnitModalTarget('recipe');
                      setShowAddUnitModal(true);
                      return;
                    }
                    const opt = inventoryUnits.find((o) => o.id === e.target.value);
                    setForm({
                      ...form,
                      recipeUnit: e.target.value,
                      recipeUnitAr: opt?.labelAr ?? e.target.value,
                    });
                  }}
                  className="input-field text-xs font-semibold border-amber-500/30 focus:border-amber-400"
                >
                  {inventoryUnits.map((o) => (
                    <option key={o.id} value={o.id} className="bg-navy-900 text-white">
                      {o.labelAr}
                    </option>
                  ))}
                  <option value="__add_new__" className="bg-navy-900 text-amber-400 font-bold">
                    + إضافة وحدة استهلاك جديدة...
                  </option>
                </select>
              </div>

              {/* معامل التحويل */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-navy-300 text-xs font-semibold">
                    معامل التحويل (Conversion Factor)
                  </label>
                  <span className="text-[10px] text-navy-400">
                    كم {form.recipeUnitAr || 'قطعة'} بالـ {form.purchaseUnitAr || form.unitAr}؟
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    value={form.conversionFactor || 1}
                    onChange={(e) => {
                      const factor = Math.max(0.001, Number(e.target.value));
                      const purchaseCost = form.costPerPurchaseUnit ?? form.costPerUnit;
                      setForm({
                        ...form,
                        conversionFactor: factor,
                        costPerRecipeUnit: Math.round((purchaseCost / factor) * 1000) / 1000,
                      });
                    }}
                    className="input-field text-xs font-mono font-bold text-amber-300"
                    placeholder="مثال: 100"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-navy-400 font-semibold">
                    {form.recipeUnitAr || 'قطعة'}
                  </span>
                </div>
              </div>

              {/* تكلفة وحدة الاستهلاك (محسوبة تلقائياً) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-navy-300 text-xs font-semibold">
                    تكلفة وحدة الاستهلاك
                  </label>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    تحسب تلقائياً
                  </span>
                </div>
                <div className="input-field text-xs font-mono font-bold bg-navy-900/90 border-emerald-500/40 text-emerald-300 flex items-center justify-between">
                  <span>{calculatedCostPerRecipeUnit} ج.م</span>
                  <span className="text-[10px] text-navy-400 font-normal">
                    لكل {form.recipeUnitAr || 'قطعة'}
                  </span>
                </div>
              </div>

              {/* إجمالي رصيد الاستهلاك المتاح */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-navy-300 text-xs font-semibold">
                    الرصيد المتاح للاستهلاك بالوصفات
                  </label>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/30">
                    جاهز للمطبخ
                  </span>
                </div>
                <div className="input-field text-xs font-mono font-bold bg-navy-900/90 border-cyan-500/40 text-cyan-300 flex items-center justify-between">
                  <span>{totalRecipeUnitsInStock.toLocaleString('ar-EG')}</span>
                  <span className="text-[10px] text-navy-400 font-normal">
                    {form.recipeUnitAr || 'قطعة'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live conversion equation banner */}
            <div className="p-3 rounded-xl bg-navy-900/80 border border-navy-700/60 flex items-center justify-between text-xs text-navy-300 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>
                  معادلة التحويل: <strong>1 {form.purchaseUnitAr || form.unitAr}</strong> = <strong>{form.conversionFactor || 1} {form.recipeUnitAr || 'قطعة'}</strong>
                </span>
              </div>
              <div className="font-mono text-xs text-amber-300 bg-navy-950 px-3 py-1 rounded-lg border border-navy-800 flex items-center gap-2">
                <span>{form.costPerPurchaseUnit ?? form.costPerUnit} ج.م</span>
                <span className="text-navy-400">÷</span>
                <span>{form.conversionFactor || 1}</span>
                <span className="text-navy-400">=</span>
                <span className="text-emerald-400 font-bold">{calculatedCostPerRecipeUnit} ج.م</span>
                <span className="text-[10px] text-navy-400">/ {form.recipeUnitAr || 'قطعة'}</span>
              </div>
            </div>
          </div>

          {/* Action buttons inside form */}
          <div className="pt-4 border-t border-navy-700/50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn-ghost text-danger-400 hover:bg-danger-500/10 text-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              حذف المادة الخام
            </button>

            <div className="flex items-center gap-2">
              <Link to="/inventory" className="btn-ghost text-xs px-4 py-2">
                إلغاء والعودة
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary text-xs font-bold px-6 py-2.5 flex items-center gap-2 shadow-lg shadow-brand-500/25 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Stock Gauge & Fast Adjustment Widget */}
        <div className="space-y-5">
          {/* Stock Level Card */}
          <div className="glass-card p-5 border border-navy-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-bold text-xs flex items-center gap-2">
                <Boxes className="w-4 h-4 text-brand-400" />
                مؤشر امتلاء المخزون
              </h4>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${badge.bg} ${badge.color}`}>
                <span className={`status-dot ${badge.dot}`} />
                {badge.label}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-navy-300">الرصيد: {form.currentStock} {form.unitAr}</span>
                <span className="text-navy-400 font-mono">الحد الأقصى: {form.maxStock}</span>
              </div>
              <div className="h-2.5 bg-navy-800 rounded-full overflow-hidden relative">
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
                    className="absolute top-0 bottom-0 w-1 bg-amber-400/80 z-10"
                    style={{ right: `${100 - reorderPct}%` }}
                    title={`حد إعادة الطلب: ${form.minReorderLevel}`}
                  />
                )}
              </div>
              <p className="text-[11px] text-navy-400 flex items-center justify-between">
                <span>حد إعادة الطلب: {form.minReorderLevel} {form.unitAr}</span>
                <span className="font-mono">{Math.round(stockPct)}%</span>
              </p>
            </div>
          </div>

          {/* Quick Adjustment Mini Card */}
          <div className="glass-card p-5 border border-navy-700/60 space-y-3.5 bg-gradient-to-br from-navy-800/40 to-navy-900/60">
            <h4 className="text-white font-bold text-xs flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-400" />
              تسوية جردية فورية
            </h4>
            <p className="text-navy-400 text-xs">
              تسجيل إضافة وارد أو خصم تالف مع التوثيق التلقائي في الـ Logs.
            </p>
            <button
              onClick={() => setShowAdjustModal(true)}
              className="w-full btn-ghost border border-brand-500/30 hover:bg-brand-500/10 text-brand-400 hover:text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              تسجيل حركة مخزنية سريعة
            </button>
          </div>

          {/* Quick Info */}
          <div className="glass-card p-4 border border-navy-700/60 space-y-2.5 text-xs text-navy-300">
            <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
              <span className="flex items-center gap-1.5 text-navy-400">
                <Building className="w-3.5 h-3.5 text-navy-400" />
                المورد
              </span>
              <span className="text-white font-semibold">{form.supplier || 'غير محدد'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-navy-800/60">
              <span className="flex items-center gap-1.5 text-navy-400">
                <Tag className="w-3.5 h-3.5 text-navy-400" />
                كود الصنف
              </span>
              <span className="text-white font-mono font-bold">{form.sku}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-1.5 text-navy-400">
                <Clock className="w-3.5 h-3.5 text-navy-400" />
                آخر تحديث
              </span>
              <span className="text-navy-200">{formatArabicDate(form.lastRestocked)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== LOGS & AUDIT TRAIL SECTION ===================== */}
      <div className="glass-card p-6 border border-navy-700/60 shadow-2xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-navy-700/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg">سجل الحركات والتعديلات (Activity Logs)</h3>
                <span className="bg-brand-500/20 text-brand-300 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {logs.length} قيد
                </span>
              </div>
              <p className="text-navy-400 text-xs">
                توثيق زمني دقيق لكل حركة أو تعديل بالوقت، التاريخ، اسم الفاعل، وتفاصيل العملية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewLogModal(true)}
              className="btn-primary text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              إضافة قيد / ملاحظة حركة
            </button>
          </div>
        </div>

        {/* Log Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin text-xs">
          {[
            { id: 'all', label: 'كافة الحركات' },
            { id: 'adjust', label: 'تسويات المخزون' },
            { id: 'update', label: 'تعديلات الأسعار والبيانات' },
            { id: 'restock', label: 'أوامر التوريد' },
            { id: 'note', label: 'الملاحظات والقيود' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setLogFilter(f.id as typeof logFilter)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                logFilter === f.id
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-navy-800/70 text-navy-300 hover:bg-navy-700 hover:text-white border border-navy-700/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Logs Timeline List */}
        <div className="space-y-3">
          {filteredLogs.map((log, index) => {
            const isLatest = index === 0;
            return (
              <div
                key={log.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isLatest
                    ? 'bg-navy-800/60 border-brand-500/40 shadow-lg shadow-brand-500/5'
                    : 'bg-navy-900/40 border-navy-700/40 hover:bg-navy-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        log.actionType === 'price_change'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : log.actionType === 'adjust'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : log.actionType === 'restock'
                          ? 'bg-success-500/20 text-success-300 border border-success-500/30'
                          : log.actionType === 'create'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-navy-700/60 text-navy-300 border border-navy-600/50'
                      }`}
                    >
                      {log.actionType === 'price_change' ? (
                        <DollarSign className="w-4 h-4" />
                      ) : log.actionType === 'adjust' ? (
                        <Sliders className="w-4 h-4" />
                      ) : log.actionType === 'restock' ? (
                        <Truck className="w-4 h-4" />
                      ) : log.actionType === 'create' ? (
                        <Sparkles className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white text-sm font-bold">{log.title}</h4>
                        {isLatest && (
                          <span className="bg-brand-500/20 text-brand-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            أحدث حركة
                          </span>
                        )}
                      </div>
                      <p className="text-navy-300 text-xs leading-relaxed">{log.details}</p>

                      {/* Diff View if values changed */}
                      {log.diff && log.diff.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {log.diff.map((d, di) => (
                            <div
                              key={di}
                              className="inline-flex items-center gap-1.5 text-[11px] bg-navy-950/70 border border-navy-700/60 px-2.5 py-1 rounded-lg"
                            >
                              <span className="text-navy-400 font-semibold">{d.fieldAr}:</span>
                              <span className="text-danger-400 line-through font-mono">{d.oldVal}</span>
                              <span className="text-navy-500">⬅️</span>
                              <span className="text-success-400 font-bold font-mono">{d.newVal}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Log Meta: Actor & Timestamp */}
                  <div className="text-left shrink-0 space-y-1 bg-navy-950/40 p-2.5 rounded-xl border border-navy-800/60">
                    <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                      <User className="w-3.5 h-3.5 text-brand-400" />
                      <span>{log.actorName}</span>
                    </div>
                    <div className="text-[11px] text-navy-400">{log.actorRole}</div>
                    <div className="flex items-center gap-1 text-[10px] text-navy-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{formatArabicDate(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="py-8 text-center text-navy-400 text-xs">
              لا توجد قيود تطابق الفلتر المحدد.
            </div>
          )}
        </div>
      </div>

      {/* ===================== ADJUST MODAL ===================== */}
      {showAdjustModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAdjustModal(false)}
        >
          <div
            className="glass-card w-full max-w-md animate-scale-in border border-navy-700/80 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-navy-700/50 flex items-center justify-between">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-400" />
                تسوية مخزنية سريعة
              </h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 pt-0 space-y-4">
              <div className="p-3 bg-navy-900/60 rounded-xl border border-navy-700/40 text-xs flex items-center justify-between">
                <span className="text-navy-300">الرصيد المسجل حالياً:</span>
                <span className="text-white font-bold font-mono">
                  {form.currentStock} {form.unitAr}
                </span>
              </div>

              <div>
                <label className="text-navy-300 text-xs font-semibold mb-2 block">
                  مقدار التغيير (+ إضافة وارد / - خصم أو تالف)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdjustAmount((prev) => String((Number(prev) || 0) - 1))}
                    className="w-10 h-10 rounded-xl bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 flex items-center justify-center font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="0"
                    className="input-field text-center text-lg font-bold font-mono"
                    autoFocus
                  />
                  <button
                    onClick={() => setAdjustAmount((prev) => String((Number(prev) || 0) + 1))}
                    className="w-10 h-10 rounded-xl bg-success-500/10 hover:bg-success-500/20 text-success-400 flex items-center justify-center font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-navy-300 text-xs font-semibold mb-2 block">
                  سبب التسوية المخزنية
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="input-field text-xs font-medium"
                >
                  <option value="جرد فعلي ومطابقة المخزون">جرد فعلي ومطابقة المخزون</option>
                  <option value="استلام شحنة توريد جديدة">استلام شحنة توريد جديدة</option>
                  <option value="هالك أو تالف أثناء التخزين">هالك أو تالف أثناء التخزين</option>
                  <option value="استهلاك إنتاج ومطبخ">استهلاك إنتاج ومطبخ</option>
                  <option value="مرتجع من فرع آخر">مرتجع من فرع آخر</option>
                </select>
              </div>

              {adjustAmount && !isNaN(Number(adjustAmount)) && (
                <div className="p-3 bg-navy-950/80 rounded-xl border border-navy-700/50 flex items-center justify-between text-xs">
                  <span className="text-navy-300">الرصيد بعد التسوية:</span>
                  <span className="text-brand-300 font-bold font-mono text-sm">
                    {Math.max(0, form.currentStock + Number(adjustAmount))} {form.unitAr}
                  </span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-navy-700/50 flex gap-3">
              <button
                onClick={handleConfirmAdjust}
                disabled={!adjustAmount || isNaN(Number(adjustAmount)) || Number(adjustAmount) === 0}
                className="btn-primary flex-1 py-2 text-xs font-bold"
              >
                تأكيد وتوثيق التسوية
              </button>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="btn-ghost flex-1 py-2 text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== NEW MANUAL LOG MODAL ===================== */}
      {showNewLogModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowNewLogModal(false)}
        >
          <div
            className="glass-card w-full max-w-md animate-scale-in border border-navy-700/80 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-navy-700/50 flex items-center justify-between">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-400" />
                إضافة قيد / ملاحظة حركة جديدة
              </h3>
              <button
                onClick={() => setShowNewLogModal(false)}
                className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 pt-0 space-y-3.5">
              <div>
                <label className="text-navy-300 text-xs font-semibold mb-1.5 block">
                  عنوان القيد أو الحركة
                </label>
                <input
                  type="text"
                  value={newLogTitle}
                  onChange={(e) => setNewLogTitle(e.target.value)}
                  placeholder="مثال: فحص جودة استلام الدفعة أو ملاحظة جرد مسائي"
                  className="input-field text-xs font-semibold"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-navy-300 text-xs font-semibold mb-1.5 block">
                  نوع الحركة
                </label>
                <select
                  value={newLogActionType}
                  onChange={(e) => setNewLogActionType(e.target.value as InventoryLog['actionType'])}
                  className="input-field text-xs"
                >
                  <option value="note">ملاحظة / قيد يدوي</option>
                  <option value="adjust">تسوية رصيد جرد</option>
                  <option value="restock">إذن استلام توريد</option>
                  <option value="price_change">مراجعة واعتماد سعر</option>
                  <option value="update">تعديل مواصفات</option>
                </select>
              </div>

              <div>
                <label className="text-navy-300 text-xs font-semibold mb-1.5 block">
                  التفاصيل والبيانات
                </label>
                <textarea
                  rows={3}
                  value={newLogDetails}
                  onChange={(e) => setNewLogDetails(e.target.value)}
                  placeholder="اكتب تفاصيل ما حدث بدقة وما تم فحصه أو تنفيذه..."
                  className="input-field text-xs leading-relaxed"
                />
              </div>

              <div className="p-2.5 bg-navy-950/60 rounded-xl border border-navy-800 text-[11px] text-navy-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-brand-400" />
                <span>
                  سيتم التوثيق باسم: <strong className="text-white">{currentActor.name}</strong> ({currentActor.role})
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-navy-700/50 flex gap-3">
              <button
                onClick={handleCreateManualLog}
                disabled={!newLogTitle.trim()}
                className="btn-primary flex-1 py-2 text-xs font-bold"
              >
                حفظ وتسجيل القيد
              </button>
              <button
                onClick={() => setShowNewLogModal(false)}
                className="btn-ghost flex-1 py-2 text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ADD CATEGORY MODAL ===================== */}
      {showAddCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAddCategoryModal(false)}
        >
          <div
            className="glass-card w-full max-w-md animate-scale-in border border-navy-700/80 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-navy-700/50 flex items-center justify-between">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-400" />
                إضافة تصنيف مخزني جديد
              </h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="text-navy-300 text-xs font-semibold mb-1.5 block">
                  اسم التصنيف بالعربية <span className="text-danger-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="مثال: مجمدات ومشروبات، حلويات، متبلات..."
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

              <div>
                <label className="text-navy-300 text-xs font-semibold mb-1.5 block">
                  كود / معرّف التصنيف (اختياري بالإنجليزية)
                </label>
                <input
                  type="text"
                  value={newCategoryCustomId}
                  onChange={(e) => setNewCategoryCustomId(e.target.value)}
                  placeholder="مثال: frozen_items أو beverages"
                  className="input-field text-xs font-mono"
                />
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1.5">
                <span className="text-navy-400 text-[11px] block">اقتراحات سريعة لتصنيفات شائعة:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['مجمدات ومشروبات', 'مخبوزات وحلويات', 'مستلزمات نظافة', 'مأكولات بحرية', 'بهارات خاصة', 'زيوت ومسليات'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleCreateCategory(sug)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-navy-800/80 hover:bg-brand-500/20 text-navy-200 hover:text-brand-300 border border-navy-700/60 hover:border-brand-500/40 transition-all"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-navy-700/50 flex gap-3">
              <button
                type="button"
                onClick={() => handleCreateCategory()}
                disabled={!newCategoryName.trim()}
                className="btn-primary flex-1 py-2 text-xs font-bold"
              >
                إضافة وتعيين التصنيف
              </button>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="btn-ghost flex-1 py-2 text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ADD UNIT MODAL ===================== */}
      {showAddUnitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAddUnitModal(false)}
        >
          <div
            className="glass-card w-full max-w-md animate-scale-in border border-navy-700/80 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-navy-700/50 flex items-center justify-between">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Boxes className="w-5 h-5 text-brand-400" />
                إضافة وحدة قياس جديدة
              </h3>
              <button
                onClick={() => setShowAddUnitModal(false)}
                className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="text-navy-300 text-xs font-semibold mb-1.5 block">
                  اسم وحدة القياس بالعربية <span className="text-danger-400">*</span>
                </label>
                <input
                  type="text"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="مثال: باكت، شيكارة، دستة، برميل، ربطة..."
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

              <div>
                <label className="text-navy-300 text-xs font-semibold mb-1.5 block">
                  رمز الوحدة (اختياري بالإنجليزية)
                </label>
                <input
                  type="text"
                  value={newUnitCustomId}
                  onChange={(e) => setNewUnitCustomId(e.target.value)}
                  placeholder="مثال: pack أو bundle أو doz"
                  className="input-field text-xs font-mono"
                />
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1.5">
                <span className="text-navy-400 text-[11px] block">وحدات قياس شائعة وسريعة:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['باكت', 'شيكارة', 'دستة', 'برميل', 'ربطة', 'عبوة عائلية', 'أنبوبة', 'صندوق', 'طبق'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleCreateUnit(sug)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-navy-800/80 hover:bg-brand-500/20 text-navy-200 hover:text-brand-300 border border-navy-700/60 hover:border-brand-500/40 transition-all"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-navy-700/50 flex gap-3">
              <button
                type="button"
                onClick={() => handleCreateUnit()}
                disabled={!newUnitName.trim()}
                className="btn-primary flex-1 py-2 text-xs font-bold"
              >
                إضافة وتعيين الوحدة
              </button>
              <button
                type="button"
                onClick={() => setShowAddUnitModal(false)}
                className="btn-ghost flex-1 py-2 text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRM MODAL ===================== */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="glass-card w-full max-w-md p-6 animate-scale-in border border-danger-500/30 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-danger-500/10 flex items-center justify-center text-danger-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-white font-bold text-lg">حذف المادة الخام؟</h3>
              <p className="text-navy-300 text-xs leading-relaxed">
                هل أنت متأكد من رغبتك في حذف <strong className="text-white">{form.nameAr}</strong> ({form.sku}) نهائياً من قائمة المخزون؟
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDelete}
                className="bg-danger-500 hover:bg-danger-600 text-white flex-1 py-2.5 text-xs font-bold rounded-xl transition-all"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-ghost flex-1 py-2.5 text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
