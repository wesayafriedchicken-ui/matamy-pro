import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  DollarSign,
  Hash,
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Printer,
  Sparkles,
  Info,
  Maximize2,
  X,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  Package,
  Bike,
  Navigation,
  UtensilsCrossed,
  CheckCircle2,
  Car,
  Download,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { formatCurrency } from '@/utils/helpers';
import {
  defaultDeliveryZones,
  OFFICIAL_DELIVERY_NOTES,
} from '@/data/deliveryZonesData';
import type { OfficialDeliveryZone } from '@/types';
import { useApp } from '@/context/AppContext';

const STORAGE_KEY = 'nine_fries_delivery_zones_v1';

export default function DispatchDeliveryZones() {
  const { showToast } = useApp();
  const [zones, setZones] = useState<OfficialDeliveryZone[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return defaultDeliveryZones;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
    } catch (e) {
      console.error('Failed to save delivery zones:', e);
    }
  }, [zones]);

  // View mode
  const [viewMode, setViewMode] = useState<'split' | 'table' | 'cards'>('split');
  const [themeStyle, setThemeStyle] = useState<'dark' | 'document'>('dark');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeeFilter, setSelectedFeeFilter] = useState<string>('all');
  const [selectedDistanceFilter, setSelectedDistanceFilter] = useState<string>('all');

  // Modals
  const [previewImageOpen, setPreviewImageOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<OfficialDeliveryZone | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [zoneForm, setZoneForm] = useState<Partial<OfficialDeliveryZone>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [calculatorZoneId, setCalculatorZoneId] = useState<string>('zone-01');

  // Statistics
  const stats = useMemo(() => {
    const total = zones.length;
    const active = zones.filter((z) => z.isActive).length;
    const fees = zones.map((z) => z.deliveryFee);
    const avgFee = fees.length ? Math.round(fees.reduce((a, b) => a + b, 0) / fees.length) : 0;
    const minFee = fees.length ? Math.min(...fees) : 0;
    const maxFee = fees.length ? Math.max(...fees) : 0;
    const maxDistance = zones.reduce((max, z) => Math.max(max, z.distanceMaxKm), 0);
    return { total, active, avgFee, minFee, maxFee, maxDistance };
  }, [zones]);

  // Unique fees for filtering
  const availableFees = useMemo(() => {
    const set = new Set(zones.map((z) => z.deliveryFee));
    return Array.from(set).sort((a, b) => a - b);
  }, [zones]);

  // Filtered zones
  const filteredZones = useMemo(() => {
    return zones.filter((zone) => {
      const matchSearch =
        !searchQuery ||
        zone.areaNameAr.includes(searchQuery) ||
        (zone.areaNameEn && zone.areaNameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        zone.zoneCode.includes(searchQuery) ||
        String(zone.zoneNumber).includes(searchQuery);

      const matchFee =
        selectedFeeFilter === 'all' || zone.deliveryFee === Number(selectedFeeFilter);

      let matchDistance = true;
      if (selectedDistanceFilter === 'near') {
        matchDistance = zone.distanceMaxKm <= 4;
      } else if (selectedDistanceFilter === 'mid') {
        matchDistance = zone.distanceMinKm >= 4 && zone.distanceMaxKm <= 10;
      } else if (selectedDistanceFilter === 'far') {
        matchDistance = zone.distanceMaxKm > 10;
      }

      return matchSearch && matchFee && matchDistance;
    });
  }, [zones, searchQuery, selectedFeeFilter, selectedDistanceFilter]);

  // Splitting into 2 columns for "split" view (like the document: 01-11 and 12-22)
  const { table1Zones, table2Zones } = useMemo(() => {
    const sorted = [...filteredZones].sort((a, b) => a.zoneNumber - b.zoneNumber);
    // When no search is active, strictly separate 1-11 and 12-22
    if (!searchQuery && selectedFeeFilter === 'all' && selectedDistanceFilter === 'all') {
      return {
        table1Zones: sorted.filter((z) => z.zoneNumber <= 11),
        table2Zones: sorted.filter((z) => z.zoneNumber > 11),
      };
    }
    // If filtered, balance equally
    const mid = Math.ceil(sorted.length / 2);
    return {
      table1Zones: sorted.slice(0, mid),
      table2Zones: sorted.slice(mid),
    };
  }, [filteredZones, searchQuery, selectedFeeFilter, selectedDistanceFilter]);

  // Save / Update zone handler
  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneForm.areaNameAr || !zoneForm.deliveryFee || !zoneForm.distanceKm) {
      showToast('يرجى ملء جميع الحقول المطلوبة', 'warning');
      return;
    }

    if (isAddMode) {
      const nextNumber = zones.length > 0 ? Math.max(...zones.map((z) => z.zoneNumber)) + 1 : 1;
      const code = nextNumber < 10 ? `0${nextNumber}` : `${nextNumber}`;
      const newZone: OfficialDeliveryZone = {
        id: `zone-${Date.now()}`,
        zoneCode: zoneForm.zoneCode || code,
        zoneNumber: zoneForm.zoneNumber || nextNumber,
        areaNameAr: zoneForm.areaNameAr,
        areaNameEn: zoneForm.areaNameEn || `Zone ${code}`,
        deliveryFee: Number(zoneForm.deliveryFee),
        deliveryTimeAr: zoneForm.deliveryTimeAr || 'غير محدد',
        distanceKm: zoneForm.distanceKm,
        distanceMinKm: Number(zoneForm.distanceMinKm || 0),
        distanceMaxKm: Number(zoneForm.distanceMaxKm || 5),
        isActive: true,
        notes: zoneForm.notes,
      };
      setZones((prev) => [...prev, newZone]);
      showToast(`تمت إضافة الزون (${newZone.areaNameAr}) بنجاح`, 'success');
    } else if (editingZone) {
      setZones((prev) =>
        prev.map((z) =>
          z.id === editingZone.id
            ? ({
                ...z,
                areaNameAr: zoneForm.areaNameAr || z.areaNameAr,
                areaNameEn: zoneForm.areaNameEn || z.areaNameEn,
                deliveryFee: Number(zoneForm.deliveryFee ?? z.deliveryFee),
                deliveryTimeAr: zoneForm.deliveryTimeAr || z.deliveryTimeAr,
                distanceKm: zoneForm.distanceKm || z.distanceKm,
                distanceMinKm: Number(zoneForm.distanceMinKm ?? z.distanceMinKm),
                distanceMaxKm: Number(zoneForm.distanceMaxKm ?? z.distanceMaxKm),
                isActive: zoneForm.isActive !== undefined ? zoneForm.isActive : z.isActive,
                notes: zoneForm.notes,
              } as OfficialDeliveryZone)
            : z
        )
      );
      showToast(`تم تحديث بيانات الزون (${editingZone.areaNameAr}) بنجاح`, 'success');
    }

    setEditingZone(null);
    setIsAddMode(false);
    setZoneForm({});
  };

  // Delete zone
  const handleDeleteZone = (zone: OfficialDeliveryZone) => {
    if (confirm(`هل أنت متأكد من حذف الزون "${zone.areaNameAr}"؟`)) {
      setZones((prev) => prev.filter((z) => z.id !== zone.id));
      showToast(`تم حذف الزون (${zone.areaNameAr})`, 'info');
    }
  };

  // Reset to default original image data
  const handleResetToDefault = () => {
    setZones(defaultDeliveryZones);
    localStorage.removeItem(STORAGE_KEY);
    setShowResetConfirm(false);
    showToast('تمت استعادة جدول زونات ناين فرايز المعتمد (22 منطقة) بنجاح', 'success');
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  // Calculator target
  const currentCalcZone = useMemo(() => {
    return zones.find((z) => z.id === calculatorZoneId) || zones[0];
  }, [zones, calculatorZoneId]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <PageHeader
        title="مناطق وزونات التوصيل (Delivery Zones)"
        description="تسعير الدليفري المعتمد، المسافات بالكيلومتر، وتغطية الفروع حسب الزون"
      />

      {/* Sub-route navigation tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-navy-900/80 border border-navy-800 rounded-2xl w-fit flex-wrap shadow-lg">
        <Link
          to="/dispatch"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-navy-400 hover:text-white transition-all"
        >
          <Package className="w-4 h-4" />
          توزيع الطلبات
        </Link>
        <Link
          to="/dispatch/delivery"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-navy-400 hover:text-white transition-all"
        >
          <Bike className="w-4 h-4" />
          المناديب (Delivery)
        </Link>
        <Link
          to="/dispatch/tracking"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-navy-400 hover:text-white transition-all"
        >
          <Navigation className="w-4 h-4" />
          التتبع المباشر
        </Link>
        <Link
          to="/dispatch/custody"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-navy-400 hover:text-white transition-all"
        >
          <UtensilsCrossed className="w-4 h-4" />
          العهد والخزينة
        </Link>
        <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/25">
          <MapPin className="w-4 h-4" />
          مناطق وزونات التوصيل
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
            {zones.length}
          </span>
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={MapPin}
          label="إجمالي الزونات المعتمدة"
          value={`${stats.total} منطقة`}
          color="brand"
        />
        <StatCard
          icon={DollarSign}
          label="متوسط سعر الدليفري"
          value={formatCurrency(stats.avgFee)}
          color="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="نطاق الأسعار"
          value={`${stats.minFee} - ${stats.maxFee} ج.م`}
          color="success"
        />
        <StatCard
          icon={Car}
          label="أقصى نطاق تغطية"
          value={`${stats.maxDistance} كم`}
          color="warning"
        />
      </div>

      {/* Operational Notes Box (ملاحظات هامة) - Exactly as in user requirements */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 backdrop-blur-md shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-amber-400 font-extrabold tracking-wide">ملاحظات هامة</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  تعليمات تشغيل الدليفري
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setPreviewImageOpen(true)}
                className="text-xs text-amber-300 hover:text-amber-200 underline flex items-center gap-1 font-semibold transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                معاينة وثيقة الزونات الأصلية (Original Image)
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs text-navy-200">
              {OFFICIAL_DELIVERY_NOTES.map((note, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-navy-900/50 p-2.5 rounded-xl border border-navy-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Toolbar & Controls */}
      <div className="glass-card p-4 rounded-2xl border border-navy-700/60 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالمنطقة، الشارع، أو رقم الزون..."
              className="w-full bg-navy-900/90 border border-navy-700 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-navy-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Delivery Fee Filter */}
          <div className="flex items-center gap-1.5 bg-navy-900/90 border border-navy-700 rounded-xl px-2.5 py-1.5 text-xs text-navy-300">
            <DollarSign className="w-3.5 h-3.5 text-brand-400" />
            <select
              value={selectedFeeFilter}
              onChange={(e) => setSelectedFeeFilter(e.target.value)}
              aria-label="تصفية بسعر التوصيل"
              className="bg-transparent border-none text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-navy-900">كافة الأسعار ({availableFees.length})</option>
              {availableFees.map((fee) => (
                <option key={fee} value={fee} className="bg-navy-900">
                  {fee} جنيه
                </option>
              ))}
            </select>
          </div>

          {/* Distance Filter */}
          <div className="flex items-center gap-1.5 bg-navy-900/90 border border-navy-700 rounded-xl px-2.5 py-1.5 text-xs text-navy-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedDistanceFilter}
              onChange={(e) => setSelectedDistanceFilter(e.target.value)}
              aria-label="تصفية بمسافة التوصيل"
              className="bg-transparent border-none text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-navy-900">كافة المسافات</option>
              <option value="near" className="bg-navy-900">قريب (حتى 4 كم)</option>
              <option value="mid" className="bg-navy-900">متوسط (4 - 10 كم)</option>
              <option value="far" className="bg-navy-900">بعيد (أكثر من 10 كم)</option>
            </select>
          </div>
        </div>

        {/* View Switchers & Actions */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-wrap">
          {/* Theme Style: Original Document Look vs Dark Mode */}
          <button
            type="button"
            onClick={() => setThemeStyle((prev) => (prev === 'dark' ? 'document' : 'dark'))}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              themeStyle === 'document'
                ? 'bg-amber-400/20 text-amber-200 border-amber-400/40'
                : 'bg-navy-800 text-navy-300 border-navy-700 hover:text-white'
            }`}
            title="تبديل مظهر العرض بين ستايل الوثيقة الرسمية والوضع الداكن"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {themeStyle === 'document' ? 'ستايل الوثيقة (كريمي & ذهبي)' : 'ستايل النظام (داكن)'}
          </button>

          {/* View Mode Toggle: Split (2-Column) vs Full Table vs Cards */}
          <div className="flex items-center bg-navy-900 border border-navy-700/80 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'split'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-navy-400 hover:text-white'
              }`}
              title="عرض عمودين طبق الأصل من الوثيقة (01-11 و 12-22)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>عمودين (الأصلية)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-navy-400 hover:text-white'
              }`}
              title="جدول موحد قابل للتمرير والترتيب"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>جدول موحد</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-navy-400 hover:text-white'
              }`}
              title="عرض شبكة البطاقات"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطاقات</span>
            </button>
          </div>

          {/* Add Zone */}
          <button
            type="button"
            onClick={() => {
              setIsAddMode(true);
              setEditingZone(null);
              const nextNum = zones.length + 1;
              const code = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
              setZoneForm({
                zoneCode: code,
                zoneNumber: nextNum,
                deliveryFee: 35,
                deliveryTimeAr: 'غير محدد',
                distanceKm: '3 - 6',
                distanceMinKm: 3,
                distanceMaxKm: 6,
                isActive: true,
              });
            }}
            className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة زون
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white border border-navy-700 transition-colors"
            title="استعادة بيانات وثيقة ناين فرايز الأصلية"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white border border-navy-700 transition-colors"
            title="طباعة كشف الزونات"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUICK CALCULATOR / ZONE ESTIMATOR STRIP */}
      <div className="glass-card p-4 rounded-2xl border border-navy-700/60 bg-gradient-to-r from-navy-900/90 via-navy-850 to-navy-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                حاسبة سعر الدليفري اللحظية للكاشير والدسباتش
              </h4>
              <p className="text-[11px] text-navy-400">
                اختر الزون المطلوب لمعرفة سعر التوصيل والمسافة المقدرة فورياً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={calculatorZoneId}
              onChange={(e) => setCalculatorZoneId(e.target.value)}
              aria-label="اختر الزون المطلوب"
              className="bg-navy-900 border border-navy-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 flex-1 sm:w-64"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  زون {z.zoneCode} - {z.areaNameAr} ({z.deliveryFee} ج.م)
                </option>
              ))}
            </select>

            {currentCalcZone && (
              <div className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/30 px-3.5 py-1.5 rounded-xl shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-brand-300 block">سعر التوصيل</span>
                  <span className="text-base font-extrabold text-white">
                    {currentCalcZone.deliveryFee} <span className="text-xs font-normal text-brand-300">ج.م</span>
                  </span>
                </div>
                <div className="w-px h-6 bg-brand-500/20" />
                <div className="text-right">
                  <span className="text-[10px] text-navy-400 block">المسافة</span>
                  <span className="text-xs font-bold text-navy-200">
                    {currentCalcZone.distanceKm} كم
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SPLIT VIEW: TWO-COLUMN LAYOUT (IDENTICAL TO UPLOADED IMAGE FORMAT)     */}
      {/* ========================================================================= */}
      {viewMode === 'split' && (
        <div
          className={`grid grid-cols-1 xl:grid-cols-2 gap-6 ${
            themeStyle === 'document' ? 'font-sans' : ''
          }`}
        >
          {/* Table 1: Zones 01 to 11 (Right side in Arabic visual order) */}
          <ZoneTableBlock
            title="المناطق الأساسية والمحيطة (زون 01 - 11)"
            zonesList={table1Zones}
            themeStyle={themeStyle}
            onEdit={(z) => {
              setEditingZone(z);
              setIsAddMode(false);
              setZoneForm(z);
            }}
            onDelete={handleDeleteZone}
          />

          {/* Table 2: Zones 12 to 22 (Left side in visual order) */}
          <ZoneTableBlock
            title="الهضبة الوسطى والمناطق الممتدة (زون 12 - 22)"
            zonesList={table2Zones}
            themeStyle={themeStyle}
            onEdit={(z) => {
              setEditingZone(z);
              setIsAddMode(false);
              setZoneForm(z);
            }}
            onDelete={handleDeleteZone}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. UNIFIED FULL TABLE VIEW                                               */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="glass-card overflow-hidden rounded-2xl border border-navy-700/60 shadow-xl">
          <div className="px-5 py-4 border-b border-navy-700/50 flex items-center justify-between">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-brand-400" />
              كشف زونات التوصيل الموحد ({filteredZones.length} منطقة)
            </h3>
            <span className="text-xs text-navy-400">
              المسافات والأسعار مرتبة وفقاً لأرقام الزونات
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-navy-900/90 text-navy-300 border-b border-navy-700/70 font-semibold">
                  <th className="py-3.5 px-4 text-center w-20"># الزون (رقم)</th>
                  <th className="py-3.5 px-4">المنطقة</th>
                  <th className="py-3.5 px-4 text-center">سعر الدليفري (جنيه)</th>
                  <th className="py-3.5 px-4 text-center">وقت التوصيل</th>
                  <th className="py-3.5 px-4 text-center">المسافة من الفرع (كم)</th>
                  <th className="py-3.5 px-4 text-center">الحالة</th>
                  <th className="py-3.5 px-4 text-center w-28">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/40">
                {filteredZones.map((z, idx) => (
                  <tr
                    key={z.id}
                    className={`hover:bg-navy-800/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-navy-900/20' : 'bg-transparent'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400 text-sm">
                      {z.zoneCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                        <span>{z.areaNameAr}</span>
                      </div>
                      {z.areaNameEn && (
                        <span className="text-[10px] text-navy-400 font-mono block mr-5">
                          {z.areaNameEn}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-white bg-brand-500/15 border border-brand-500/30 px-3 py-1 rounded-xl text-xs">
                        <DollarSign className="w-3 h-3 text-brand-400" />
                        {z.deliveryFee} ج.م
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-navy-300">
                      <span className="inline-flex items-center gap-1.5 text-navy-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400/80" />
                        {z.deliveryTimeAr}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-navy-200">
                      <span className="inline-flex items-center gap-1 bg-navy-800 px-2.5 py-1 rounded-lg border border-navy-700">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {z.distanceKm} كم
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          z.isActive
                            ? 'bg-success-500/15 text-success-400 border border-success-500/30'
                            : 'bg-navy-700 text-navy-400'
                        }`}
                      >
                        {z.isActive ? 'مفعل' : 'معطل'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingZone(z);
                            setIsAddMode(false);
                            setZoneForm(z);
                          }}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteZone(z)}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-danger-500/20 text-navy-400 hover:text-danger-400 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CARDS VIEW                                                             */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredZones.map((z) => (
            <div
              key={z.id}
              className="glass-card p-4 rounded-2xl border border-navy-700/60 hover:border-brand-500/40 transition-all hover:shadow-xl group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-400 text-sm">
                  {z.zoneCode}
                </span>
                <span className="text-base font-extrabold text-white bg-brand-500/15 border border-brand-500/30 px-3 py-1 rounded-xl">
                  {z.deliveryFee} <span className="text-xs font-normal text-brand-300">ج.م</span>
                </span>
              </div>

              <h4 className="text-white font-bold text-sm mb-1 line-clamp-1">{z.areaNameAr}</h4>
              <p className="text-[11px] text-navy-400 mb-3">{z.areaNameEn || 'Zone Details'}</p>

              <div className="space-y-1.5 text-xs text-navy-300 pt-2 border-t border-navy-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-navy-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    المسافة:
                  </span>
                  <span className="font-semibold text-white">{z.distanceKm} كم</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-navy-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    وقت التوصيل:
                  </span>
                  <span className="text-navy-300">{z.deliveryTimeAr}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-navy-700/40 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingZone(z);
                    setIsAddMode(false);
                    setZoneForm(z);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteZone(z)}
                  className="p-1 rounded-lg bg-navy-800 hover:bg-danger-500/20 text-navy-400 hover:text-danger-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX MODAL: ORIGINAL 4K IMAGE PREVIEW                                 */}
      {/* ========================================================================= */}
      {previewImageOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewImageOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-navy-700 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-400" />
                <h3 className="text-white font-bold text-sm">
                  الوثيقة المعتمدة الأصلية لمناطق وزونات التوصيل (ناين فرايز)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/assets/aistudio/image_fa0515d2.png"
                  download="nine-fries-delivery-zones.png"
                  className="px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-navy-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  تحميل الصورة
                </a>
                <button
                  onClick={() => setPreviewImageOpen(false)}
                  className="p-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-xl bg-black/40 p-2 flex items-center justify-center">
              <img
                src="/assets/aistudio/image_fa0515d2.png"
                alt="Nine Fries Delivery Zones"
                className="max-w-full h-auto rounded-lg shadow-2xl object-contain"
              />
            </div>

            <p className="text-[11px] text-navy-400 text-center">
              تم تضمين كافة البيانات والمسافات والأسعار الـ 22 بدقة متناهية مطابقة للوثيقة المرفقة أعلاه.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / ADD ZONE MODAL                                                     */}
      {/* ========================================================================= */}
      {(editingZone || isAddMode) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => {
            setEditingZone(null);
            setIsAddMode(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-navy-900 border border-navy-700 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-navy-700/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                  {isAddMode ? <Plus className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                </div>
                <h3 className="text-white font-bold text-base">
                  {isAddMode ? 'إضافة زون توصيل جديد' : `تعديل الزون: ${editingZone?.areaNameAr}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingZone(null);
                  setIsAddMode(false);
                }}
                className="p-1 rounded-lg text-navy-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy-300 font-semibold mb-1">
                    رقم الزون (#) <span className="text-danger-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={zoneForm.zoneCode || ''}
                    onChange={(e) => setZoneForm({ ...zoneForm, zoneCode: e.target.value })}
                    placeholder="مثال: 01 أو 23"
                    required
                    className="w-full bg-navy-800 border border-navy-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-navy-300 font-semibold mb-1">
                    سعر الدليفري (جنيه) <span className="text-danger-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={zoneForm.deliveryFee || ''}
                    onChange={(e) => setZoneForm({ ...zoneForm, deliveryFee: Number(e.target.value) })}
                    placeholder="مثال: 35"
                    required
                    min={0}
                    className="w-full bg-navy-800 border border-navy-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-navy-300 font-semibold mb-1">
                  اسم المنطقة بالعربية <span className="text-danger-400">*</span>
                </label>
                <input
                  type="text"
                  value={zoneForm.areaNameAr || ''}
                  onChange={(e) => setZoneForm({ ...zoneForm, areaNameAr: e.target.value })}
                  placeholder="مثال: شارع 9 - محيط الفرع"
                  required
                  className="w-full bg-navy-800 border border-navy-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy-300 font-semibold mb-1">
                    المسافة من الفرع (كم) <span className="text-danger-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={zoneForm.distanceKm || ''}
                    onChange={(e) => setZoneForm({ ...zoneForm, distanceKm: e.target.value })}
                    placeholder="مثال: 2 - 4"
                    required
                    className="w-full bg-navy-800 border border-navy-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-navy-300 font-semibold mb-1">وقت التوصيل</label>
                  <input
                    type="text"
                    value={zoneForm.deliveryTimeAr || 'غير محدد'}
                    onChange={(e) => setZoneForm({ ...zoneForm, deliveryTimeAr: e.target.value })}
                    placeholder="مثال: غير محدد أو 30-45 دقيقة"
                    className="w-full bg-navy-800 border border-navy-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-navy-300 font-semibold mb-1">
                  الاسم بالإنجليزية (اختياري)
                </label>
                <input
                  type="text"
                  value={zoneForm.areaNameEn || ''}
                  onChange={(e) => setZoneForm({ ...zoneForm, areaNameEn: e.target.value })}
                  placeholder="Street 9 - Branch Vicinity"
                  className="w-full bg-navy-800 border border-navy-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={zoneForm.isActive !== false}
                    onChange={(e) => setZoneForm({ ...zoneForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-500 bg-navy-800 border-navy-700 focus:ring-0"
                  />
                  <span className="text-white font-medium">تفعيل الزون في النظام وحساب الدليفري</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-navy-700">
                <button
                  type="button"
                  onClick={() => {
                    setEditingZone(null);
                    setIsAddMode(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5 font-bold shadow-lg"
                >
                  {isAddMode ? 'إضافة الزون' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESET TO DEFAULT CONFIRM MODAL                                            */}
      {/* ========================================================================= */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="w-full max-w-md bg-navy-900 border border-navy-700 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">
                استعادة جدول زونات ناين فرايز المعتمد؟
              </h3>
              <p className="text-xs text-navy-300 leading-relaxed">
                سيتم إعادة تعيين كافة أسعار ومناطق التوصيل الـ 22 طبقاً لوثيقة الفرع الرسمية المرفقة تماماً وإلغاء أي تعديلات يدوية أجريت محلياً.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 text-xs font-semibold"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="btn-primary text-xs py-2 px-5 font-bold shadow-lg"
              >
                نعم، استعادة الجدول الأصلي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: ZONE TABLE BLOCK (Matches the table columns in image_fa0515d2.png)
// Columns Right-to-Left:
// 1. # الزون (رقم)
// 2. المنطقة
// 3. سعر الدليفري (جنيه)
// 4. وقت التوصيل
// 5. المسافة من الفرع (كم)
// =========================================================================
interface ZoneTableBlockProps {
  title: string;
  zonesList: OfficialDeliveryZone[];
  themeStyle: 'dark' | 'document';
  onEdit: (zone: OfficialDeliveryZone) => void;
  onDelete: (zone: OfficialDeliveryZone) => void;
}

function ZoneTableBlock({
  title,
  zonesList,
  themeStyle,
  onEdit,
  onDelete,
}: ZoneTableBlockProps) {
  const isDoc = themeStyle === 'document';

  return (
    <div
      className={`rounded-2xl overflow-hidden border shadow-xl transition-all ${
        isDoc
          ? 'bg-[#FDFBF7] border-[#D8C7A5] text-[#222]'
          : 'glass-card border-navy-700/60 text-white'
      }`}
    >
      {/* Header bar */}
      <div
        className={`px-4 py-3 flex items-center justify-between border-b ${
          isDoc
            ? 'bg-[#1E1B18] text-[#E6C687] border-[#383127]'
            : 'bg-navy-900/90 text-navy-200 border-navy-700/60'
        }`}
      >
        <span className="font-bold text-xs flex items-center gap-2 tracking-wide">
          <MapPin className="w-3.5 h-3.5 text-brand-400" />
          {title}
        </span>
        <span
          className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
            isDoc ? 'bg-[#332C24] text-[#E6C687]' : 'bg-navy-800 text-navy-300'
          }`}
        >
          {zonesList.length} زون
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr
              className={`border-b ${
                isDoc
                  ? 'bg-[#1E1B18] text-[#E5D5BA] border-[#3B342A]'
                  : 'bg-navy-900/95 text-navy-300 border-navy-700/70'
              }`}
            >
              {/* # الزون (رقم) */}
              <th className="py-3 px-3 text-center w-16">
                <div className="flex flex-col items-center justify-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold">الزون</span>
                  <span className="text-[9px] text-amber-400/90 font-normal">(رقم)</span>
                </div>
              </th>

              {/* المنطقة */}
              <th className="py-3 px-3">
                <div className="flex flex-col items-start gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold">المنطقة</span>
                </div>
              </th>

              {/* سعر الدليفري (جنيه) */}
              <th className="py-3 px-3 text-center w-24">
                <div className="flex flex-col items-center justify-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold whitespace-nowrap">سعر الدليفري</span>
                  <span className="text-[9px] text-amber-400/90 font-normal">(جنيه)</span>
                </div>
              </th>

              {/* وقت التوصيل */}
              <th className="py-3 px-3 text-center w-24">
                <div className="flex flex-col items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold whitespace-nowrap">وقت التوصيل</span>
                </div>
              </th>

              {/* المسافة من الفرع (كم) */}
              <th className="py-3 px-3 text-center w-28">
                <div className="flex flex-col items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold whitespace-nowrap">المسافة من الفرع</span>
                  <span className="text-[9px] text-amber-400/90 font-normal">(كم)</span>
                </div>
              </th>

              {/* Actions */}
              <th className="py-3 px-2 text-center w-14">
                <span className="text-[10px] text-navy-400 font-normal">إجراء</span>
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDoc ? 'divide-[#E8DEC8]' : 'divide-navy-700/35'
            }`}
          >
            {zonesList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-navy-400">
                  لا توجد مناطق مطابقة للبحث أو التصفية
                </td>
              </tr>
            ) : (
              zonesList.map((z, idx) => {
                const zebraBg = isDoc
                  ? idx % 2 === 0
                    ? 'bg-[#FAF6ED]'
                    : 'bg-[#F2ECE0]'
                  : idx % 2 === 0
                  ? 'bg-navy-900/40'
                  : 'bg-navy-800/20';

                return (
                  <tr
                    key={z.id}
                    className={`transition-colors group ${zebraBg} ${
                      isDoc ? 'hover:bg-[#EAE0CD]' : 'hover:bg-navy-700/40'
                    }`}
                  >
                    {/* Zone number column (styled like dark pill or solid badge as in image) */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block font-mono font-extrabold text-xs px-2 py-1 rounded-lg ${
                          isDoc
                            ? 'bg-[#2B2621] text-[#E6C687] shadow-inner'
                            : 'bg-navy-900/90 border border-amber-500/30 text-amber-400 font-bold'
                        }`}
                      >
                        {z.zoneCode}
                      </span>
                    </td>

                    {/* Area name */}
                    <td className="py-2.5 px-3 font-semibold text-xs leading-relaxed">
                      <span className={isDoc ? 'text-[#1F1C18]' : 'text-white'}>
                        {z.areaNameAr}
                      </span>
                    </td>

                    {/* Delivery fee (bold centered number) */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`font-black text-sm ${
                          isDoc ? 'text-[#1F1C18]' : 'text-amber-300'
                        }`}
                      >
                        {z.deliveryFee}
                      </span>
                    </td>

                    {/* Delivery time (with circular clock icon and 'غير محدد') */}
                    <td className="py-2.5 px-3 text-center">
                      <div
                        className={`inline-flex items-center justify-center gap-1.5 text-[11px] ${
                          isDoc ? 'text-[#5A5245]' : 'text-navy-300'
                        }`}
                      >
                        <Clock
                          className={`w-3.5 h-3.5 ${
                            isDoc ? 'text-[#8C7A58]' : 'text-amber-400/80'
                          }`}
                        />
                        <span className="whitespace-nowrap">{z.deliveryTimeAr}</span>
                      </div>
                    </td>

                    {/* Distance from branch (km) */}
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-xs">
                      <span className={isDoc ? 'text-[#2D2821]' : 'text-navy-200'}>
                        {z.distanceKm}
                      </span>
                    </td>

                    {/* Quick Edit */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onEdit(z)}
                          className={`p-1 rounded-md transition-colors ${
                            isDoc
                              ? 'hover:bg-[#DBCFB9] text-[#4A4235]'
                              : 'hover:bg-navy-700 text-navy-400 hover:text-white'
                          }`}
                          title="تعديل هذا الزون"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(z)}
                          className={`p-1 rounded-md transition-colors ${
                            isDoc
                              ? 'hover:bg-red-100 text-red-600'
                              : 'hover:bg-danger-500/20 text-navy-400 hover:text-danger-400'
                          }`}
                          title="حذف هذا الزون"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
