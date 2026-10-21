import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Rider } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import {
  Bike,
  Navigation,
  UtensilsCrossed,
  Package,
  Plus,
  Search,
  Car,
  Phone,
  Star,
  MapPin,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  LayoutGrid,
  LayoutList,
  Edit,
  Trash2,
  Eye,
  X,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

export default function DispatchDelivery() {
  const { riders, deleteRider, updateRiderStatus, showToast } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Selected Riders for Bulk Actions
  const [selectedRiderIds, setSelectedRiderIds] = useState<string[]>([]);

  // Modals State
  const [detailsRider, setDetailsRider] = useState<Rider | null>(null);
  const [deleteConfirmRider, setDeleteConfirmRider] = useState<Rider | null>(null);


  // Filtered Riders
  const filteredRiders = useMemo(() => {
    return riders.filter((rider) => {
      // Search Match
      const matchesSearch =
        !searchTerm.trim() ||
        rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider.nameAr.includes(searchTerm) ||
        rider.phone.includes(searchTerm) ||
        (rider.plateNumber && rider.plateNumber.includes(searchTerm)) ||
        (rider.zoneAr && rider.zoneAr.includes(searchTerm)) ||
        (rider.id && rider.id.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status Match
      const matchesStatus = statusFilter === 'all' || rider.status === statusFilter;

      // Vehicle Match
      const matchesVehicle =
        vehicleFilter === 'all' || (rider.vehicleType || 'motorcycle') === vehicleFilter;

      // Zone Match
      const matchesZone =
        zoneFilter === 'all' || rider.zoneAr === zoneFilter || rider.zone === zoneFilter;

      // Provider Match
      const matchesProvider =
        providerFilter === 'all' || (rider.provider || 'أسطول داخلي') === providerFilter;

      return matchesSearch && matchesStatus && matchesVehicle && matchesZone && matchesProvider;
    });
  }, [riders, searchTerm, statusFilter, vehicleFilter, zoneFilter, providerFilter]);

  // Summary Metrics
  const totalRiders = riders.length;
  const availableRiders = riders.filter((r) => r.status === 'available').length;
  const busyRiders = riders.filter((r) => r.status === 'busy').length;
  const offlineRiders = riders.filter((r) => r.status === 'offline').length;
  const averageRating =
    totalRiders > 0
      ? (riders.reduce((acc, r) => acc + (r.rating || 5.0), 0) / totalRiders).toFixed(1)
      : '5.0';
  const totalCustodyInField = riders.reduce((acc, r) => acc + (r.currentCustody || 0), 0);

  // Available unique zones
  const uniqueZones = useMemo(() => {
    const set = new Set<string>();
    riders.forEach((r) => {
      if (r.zoneAr) set.add(r.zoneAr);
    });
    return Array.from(set);
  }, [riders]);

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRiderIds(filteredRiders.map((r) => r.id));
    } else {
      setSelectedRiderIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRiderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (status: Rider['status']) => {
    if (selectedRiderIds.length === 0) return;
    selectedRiderIds.forEach((id) => {
      updateRiderStatus(id, status);
    });
    showToast(`تم تحديث حالة ${selectedRiderIds.length} مناديب`, 'success');
    setSelectedRiderIds([]);
  };



  const handleDeleteConfirm = () => {
    if (!deleteConfirmRider) return;
    deleteRider(deleteConfirmRider.id);
    setDeleteConfirmRider(null);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Name (AR)',
      'Name (EN)',
      'Phone',
      'Status',
      'Zone',
      'Vehicle',
      'Plate Number',
      'Active Orders',
      'Rating',
      'Custody Limit',
      'Current Custody',
    ];
    const rows = filteredRiders.map((r) => [
      r.id,
      r.nameAr,
      r.name,
      r.phone,
      r.status,
      r.zoneAr,
      r.vehicleType || 'motorcycle',
      r.plateNumber || '',
      r.currentOrders || 0,
      r.rating || 5.0,
      r.custodyLimit || 2500,
      r.currentCustody || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `delivery-fleet-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير سجل المناديب بنجاح', 'success');
  };

  // Helper for vehicle icon
  const getVehicleIcon = (type?: string) => {
    switch (type) {
      case 'car':
        return <Car className="w-4 h-4 text-sky-400" />;
      case 'bicycle':
        return <Bike className="w-4 h-4 text-emerald-400" />;
      case 'scooter':
        return <Bike className="w-4 h-4 text-purple-400" />;
      case 'motorcycle':
      default:
        return <Bike className="w-4 h-4 text-amber-400" />;
    }
  };

  const getVehicleLabel = (type?: string) => {
    switch (type) {
      case 'car':
        return 'سيارة خاصة';
      case 'bicycle':
        return 'دراجة هوائية';
      case 'scooter':
        return 'سكوتر كهربائي';
      case 'motorcycle':
      default:
        return 'دراجة نارية';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <PageHeader
        title="المناديب والتوصيل (Delivery)"
        description="سجل وإدارة أسطول التوصيل وحالات المناديب وتعيين المناطق"
      />

      {/* Sub-route navigation tabs matching Dispatch suite */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-navy-900/80 border border-navy-800 rounded-2xl w-fit flex-wrap">
          <Link
            to="/dispatch"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-navy-400 hover:text-white transition-all"
          >
            <Package className="w-4 h-4" />
            توزيع الطلبات
          </Link>

          {/* Active Tab */}
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/25">
            <Bike className="w-4 h-4" />
            المناديب (Delivery)
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
              {riders.length}
            </span>
          </span>

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

          <Link
            to="/dispatch/delivery-zones"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-navy-400 hover:text-white transition-all"
          >
            <MapPin className="w-4 h-4" />
            مناطق وزونات التوصيل
          </Link>
        </div>

        {/* Primary Action: Create / إضافة مندوب button navigating to /dispatch/delivery/new */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-navy-800/80 hover:bg-navy-700 text-navy-200 border border-navy-700/60 text-xs font-semibold flex items-center gap-2 transition-all hover:text-white"
            title="تصدير بيانات الأسطول CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">تصدير CSV</span>
          </button>

          <Link
            to="/dispatch/delivery/new"
            className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/30 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
            <span className="hidden sm:inline">| إضافة مندوب جديد</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          icon={Bike}
          label="إجمالي أسطول المناديب"
          value={String(totalRiders)}
          color="brand"
        />
        <StatCard
          icon={CheckCircle2}
          label="مناديب متاحين الآن"
          value={String(availableRiders)}
          color="success"
        />
        <StatCard
          icon={Navigation}
          label="قيد التوصيل في مهمة"
          value={String(busyRiders)}
          color="blue"
        />
        <StatCard
          icon={XCircle}
          label="غير متصلين (Offline)"
          value={String(offlineRiders)}
          color="warning"
        />
        <StatCard
          icon={Package}
          label="عهدة نقدية بالميدان"
          value={formatCurrency(totalCustodyInField)}
          color="blue"
        />
        <StatCard
          icon={Star}
          label="متوسط تقييم الأسطول"
          value={`${averageRating} ★`}
          color="warning"
        />
      </div>

      {/* Filter and Search Bar Card */}
      <div className="glass-card p-3 border border-navy-700/60 shadow-lg space-y-3">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-navy-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="البحث باسم المندوب (عربي/إنجليزي)، رقم الهاتف، اللوحة، المنطقة، أو الكود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pr-10 pl-8 text-xs w-full bg-navy-950/70 border-navy-700/80 h-10"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters - All side-by-side in one neat row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 scrollbar-none flex-nowrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field text-xs h-10 py-1.5 px-3 bg-navy-900 border-navy-700/80 shrink-0 min-w-[120px]"
            >
              <option value="all">كل الحالات (All)</option>
              <option value="available">🟢 متاح (Available)</option>
              <option value="busy">🔵 في مهمة (Busy)</option>
              <option value="offline">⚪ غير متصل (Offline)</option>
            </select>

            {/* Vehicle Filter */}
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="input-field text-xs h-10 py-1.5 px-3 bg-navy-900 border-navy-700/80 shrink-0 min-w-[125px]"
            >
              <option value="all">كل المركبات (Vehicle)</option>
              <option value="motorcycle">🏍️ دراجة نارية</option>
              <option value="car">🚗 سيارة خاصة</option>
              <option value="scooter">🛵 سكوتر كهربائي</option>
              <option value="bicycle">🚲 دراجة هوائية</option>
            </select>

            {/* Zone Filter */}
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="input-field text-xs h-10 py-1.5 px-3 bg-navy-900 border-navy-700/80 shrink-0 min-w-[120px]"
            >
              <option value="all">كل المناطق (Zone)</option>
              {uniqueZones.map((z) => (
                <option key={z} value={z}>
                  📍 {z}
                </option>
              ))}
            </select>

            {/* Provider Filter */}
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="input-field text-xs h-10 py-1.5 px-3 bg-navy-900 border-navy-700/80 shrink-0 min-w-[125px]"
            >
              <option value="all">كل جهات التعيين</option>
              <option value="أسطول داخلي">أسطول داخلي</option>
              <option value="شركة شحن خارجية">شركة شحن خارجية</option>
              <option value="عند الطلب (Freelance)">عند الطلب (Freelance)</option>
            </select>

            {/* Reset Filter Button */}
            {(statusFilter !== 'all' || vehicleFilter !== 'all' || zoneFilter !== 'all' || providerFilter !== 'all' || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setVehicleFilter('all');
                  setZoneFilter('all');
                  setProviderFilter('all');
                }}
                className="h-10 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-rose-400 text-xs font-semibold shrink-0 border border-navy-700/80 flex items-center gap-1 transition-all"
                title="إعادة ضبط الفلاتر"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مسح</span>
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-navy-900 border border-navy-700/80 rounded-xl p-0.5 shrink-0 h-10">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`h-full px-2.5 rounded-lg text-xs transition-all flex items-center justify-center ${
                  viewMode === 'table'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-navy-400 hover:text-white'
                }`}
                title="عرض جدول تفصيلي"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`h-full px-2.5 rounded-lg text-xs transition-all flex items-center justify-center ${
                  viewMode === 'grid'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-navy-400 hover:text-white'
                }`}
                title="عرض شبكة بطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar if selection exists */}
        {selectedRiderIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-brand-500/10 border border-brand-500/30 rounded-xl text-xs animate-fade-in flex-wrap gap-2">
            <div className="flex items-center gap-2 text-brand-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-brand-400" />
              <span>تم تحديد {selectedRiderIds.length} مناديب</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkStatusChange('available')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30"
              >
                تحديد كمتاح للطلبات
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange('offline')}
                className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 text-xs font-semibold border border-navy-700"
              >
                تحديد كغير متصل
              </button>
              <button
                type="button"
                onClick={() => setSelectedRiderIds([])}
                className="text-xs text-navy-400 hover:text-white underline px-2"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Delivery Table or Grid */}
      {filteredRiders.length === 0 ? (
        <div className="glass-card p-12 text-center border border-navy-700/60 rounded-2xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-navy-800 text-navy-400 flex items-center justify-center mx-auto border border-navy-700">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">لا توجد نتائج مطابقة لبحثك</h3>
            <p className="text-navy-400 text-xs mt-1 max-w-sm mx-auto">
              جرب تغيير معايير البحث أو الفلترة أو قم بإضافة مندوب جديد للأسطول
            </p>
          </div>
          <Link
            to="/dispatch/delivery/new"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-lg shadow-brand-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Create | إضافة مندوب جديد الآن</span>
          </Link>
        </div>
      ) : viewMode === 'table' ? (
        <div className="glass-card border border-navy-700/60 overflow-hidden rounded-2xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-navy-900/90 border-b border-navy-700/60 text-navy-300 font-semibold select-none">
                <tr>
                  <th className="p-3.5 pr-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredRiders.length > 0 &&
                        selectedRiderIds.length === filteredRiders.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-navy-700 text-brand-500 focus:ring-0 bg-navy-800"
                    />
                  </th>
                  <th className="p-3.5">الكود (ID)</th>
                  <th className="p-3.5">بيانات المندوب (Rider)</th>
                  <th className="p-3.5">المركبة واللوحة (Vehicle)</th>
                  <th className="p-3.5">منطقة التغطية (Zone)</th>
                  <th className="p-3.5">الحالة (Status)</th>
                  <th className="p-3.5 text-center">الطلبات الجارية</th>
                  <th className="p-3.5">التقييم</th>
                  <th className="p-3.5">العهدة المالية</th>
                  <th className="p-3.5 text-center w-28">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filteredRiders.map((rider, index) => {
                  const isSelected = selectedRiderIds.includes(rider.id);

                  return (
                    <tr
                      key={rider.id}
                      className={`hover:bg-navy-800/40 transition-colors ${
                        isSelected ? 'bg-brand-500/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 pr-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(rider.id)}
                          className="rounded border-navy-700 text-brand-500 focus:ring-0 bg-navy-800"
                        />
                      </td>

                      {/* Code / ID */}
                      <td className="p-3.5 font-mono text-navy-400 font-semibold">
                        <span className="px-2 py-1 rounded-lg bg-navy-800/80 border border-navy-700/60 text-[11px] text-navy-200">
                          {rider.enrollId || `#${rider.id.slice(-4).toUpperCase()}`}
                        </span>
                      </td>

                      {/* Rider Profile Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={
                                rider.avatarUrl ||
                                `https://images.unsplash.com/photo-${1534528741775 + index}?w=80&h=80&fit=crop&crop=faces`
                              }
                              alt={rider.nameAr}
                              className="w-10 h-10 rounded-xl object-cover border border-navy-700/80 bg-navy-800"
                            />
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-navy-950 ${
                                rider.status === 'available'
                                  ? 'bg-emerald-500'
                                  : rider.status === 'busy'
                                  ? 'bg-sky-500'
                                  : 'bg-slate-500'
                              }`}
                            />
                          </div>

                          <div className="leading-tight">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs hover:text-brand-400 transition-colors cursor-pointer"
                                onClick={() => setDetailsRider(rider)}>
                                {rider.nameAr}
                              </span>
                              <span className="text-[10px] text-navy-400 font-normal">
                                ({rider.name})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <a
                                href={`tel:${rider.phone}`}
                                className="text-[11px] font-mono text-navy-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                              >
                                <Phone className="w-3 h-3 text-brand-400" />
                                {rider.phone}
                              </a>
                              <span className="text-navy-600">•</span>
                              <span className="text-[10px] text-navy-400">
                                {rider.provider || 'أسطول داخلي'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle & Plate */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-navy-800/80 border border-navy-700/60">
                            {getVehicleIcon(rider.vehicleType)}
                          </div>
                          <div>
                            <p className="font-semibold text-navy-200 text-xs">
                              {rider.plateNumber || 'غير مسجل'}
                            </p>
                            <p className="text-[10px] text-navy-400 mt-0.5">
                              {rider.vehicleModel || getVehicleLabel(rider.vehicleType)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Coverage Zone */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-800/80 border border-navy-700/60 text-navy-200 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span>{rider.zoneAr || rider.zone}</span>
                        </span>
                      </td>

                      {/* Status with quick inline switcher */}
                      <td className="p-3.5">
                        <div className="relative inline-block">
                          <select
                            value={rider.status}
                            onChange={(e) =>
                              updateRiderStatus(rider.id, e.target.value as Rider['status'])
                            }
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border appearance-none pr-6 pl-2 cursor-pointer transition-all ${
                              rider.status === 'available'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                                : rider.status === 'busy'
                                ? 'bg-sky-500/15 border-sky-500/30 text-sky-400 hover:bg-sky-500/25'
                                : 'bg-slate-500/15 border-slate-500/30 text-slate-400 hover:bg-slate-500/25'
                            }`}
                          >
                            <option value="available" className="bg-navy-900 text-white">
                              🟢 متاح للطلب
                            </option>
                            <option value="busy" className="bg-navy-900 text-white">
                              🔵 في مهمة
                            </option>
                            <option value="offline" className="bg-navy-900 text-white">
                              ⚪ غير متصل
                            </option>
                          </select>
                        </div>
                      </td>

                      {/* Active Orders */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                            (rider.currentOrders || 0) > 0
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-navy-800 text-navy-400'
                          }`}
                        >
                          {rider.currentOrders || 0} طلب
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{rider.rating || 5.0}</span>
                        </div>
                      </td>

                      {/* Custody Info */}
                      <td className="p-3.5">
                        <div className="space-y-1 min-w-[100px]">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-white font-bold">
                              {formatCurrency(rider.currentCustody || 0)}
                            </span>
                            <span className="text-navy-400">
                              / {formatCurrency(rider.custodyLimit || 2500)}
                            </span>
                          </div>
                          <div className="w-full bg-navy-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                ((rider.currentCustody || 0) / (rider.custodyLimit || 2500)) > 0.8
                                  ? 'bg-rose-500'
                                  : 'bg-brand-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round(
                                    ((rider.currentCustody || 0) / (rider.custodyLimit || 2500)) *
                                      100
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center relative">
                        <div className="flex items-center justify-center gap-1">
                          {/* Live Track on Google Maps */}
                          <Link
                            to={`/dispatch/tracking?riderId=${rider.id}`}
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white transition-colors"
                            title="تتبع المندوب على الخريطة"
                          >
                            <Navigation className="w-3.5 h-3.5 text-brand-400" />
                          </Link>

                          {/* Quick View Details */}
                          <button
                            type="button"
                            onClick={() => setDetailsRider(rider)}
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white transition-colors"
                            title="عرض بطاقة المندوب"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Page */}
                          <Link
                            to={`/dispatch/delivery/${rider.id}`}
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-sky-400 hover:text-white transition-colors"
                            title="تعديل بيانات المندوب"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmRider(rider)}
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-rose-900/40 text-navy-300 hover:text-rose-400 transition-colors"
                            title="حذف المندوب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Summary & Pagination */}
          <div className="p-4 bg-navy-900/80 border-t border-navy-700/60 flex flex-col sm:flex-row items-center justify-between text-xs text-navy-400 gap-3">
            <div>
              عرض <span className="font-bold text-white font-mono">{filteredRiders.length}</span> من أصل{' '}
              <span className="font-bold text-white font-mono">{riders.length}</span> مناديب
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-navy-500">تم التحديث التلقائي مع Supabase</span>
              <button
                type="button"
                onClick={() => showToast('تم تحديث قائمة المناديب', 'info')}
                className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Grid / Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRiders.map((rider, index) => (
            <div
              key={rider.id}
              className="glass-card p-5 border border-navy-700/60 hover:border-brand-500/40 transition-all rounded-2xl flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Card Header: Avatar, Name, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          rider.avatarUrl ||
                          `https://images.unsplash.com/photo-${1534528741775 + index}?w=100&h=100&fit=crop&crop=faces`
                        }
                        alt={rider.nameAr}
                        className="w-12 h-12 rounded-2xl object-cover border border-navy-700/80 bg-navy-800"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-navy-950 ${
                          rider.status === 'available'
                            ? 'bg-emerald-500'
                            : rider.status === 'busy'
                            ? 'bg-sky-500'
                            : 'bg-slate-500'
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-brand-400 transition-colors">
                        {rider.nameAr}
                      </h4>
                      <p className="text-xs text-navy-400">{rider.name}</p>
                      <a
                        href={`tel:${rider.phone}`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-navy-300 hover:text-brand-300 mt-1"
                      >
                        <Phone className="w-3 h-3 text-brand-400" />
                        {rider.phone}
                      </a>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={rider.status}
                    onChange={(e) =>
                      updateRiderStatus(rider.id, e.target.value as Rider['status'])
                    }
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border appearance-none pr-5 pl-2 cursor-pointer ${
                      rider.status === 'available'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : rider.status === 'busy'
                        ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                        : 'bg-slate-500/15 border-slate-500/30 text-slate-400'
                    }`}
                  >
                    <option value="available" className="bg-navy-900 text-white">
                      متاح
                    </option>
                    <option value="busy" className="bg-navy-900 text-white">
                      في مهمة
                    </option>
                    <option value="offline" className="bg-navy-900 text-white">
                      غير متصل
                    </option>
                  </select>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-navy-800/80 text-xs">
                  <div className="p-2 rounded-xl bg-navy-950/60 border border-navy-800">
                    <span className="text-[10px] text-navy-400 block">منطقة التغطية:</span>
                    <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {rider.zoneAr}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-navy-950/60 border border-navy-800">
                    <span className="text-[10px] text-navy-400 block">المركبة واللوحة:</span>
                    <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                      {getVehicleIcon(rider.vehicleType)}
                      <span className="truncate">{rider.plateNumber || 'بدون لوحة'}</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-navy-950/60 border border-navy-800">
                    <span className="text-[10px] text-navy-400 block">الطلبات المسندة:</span>
                    <span className="font-bold text-amber-300 font-mono mt-0.5 block">
                      {rider.currentOrders || 0} طلبات
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-navy-950/60 border border-navy-800">
                    <span className="text-[10px] text-navy-400 block">التقييم العام:</span>
                    <span className="font-bold text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {rider.rating || 5.0} / 5.0
                    </span>
                  </div>
                </div>

                {/* Custody Progress */}
                <div className="p-2.5 rounded-xl bg-navy-900/60 border border-navy-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-navy-400">العهدة الحالية / الحد:</span>
                    <span className="text-white font-bold">
                      {formatCurrency(rider.currentCustody || 0)} / {formatCurrency(rider.custodyLimit || 2500)}
                    </span>
                  </div>
                  <div className="w-full bg-navy-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((rider.currentCustody || 0) / (rider.custodyLimit || 2500)) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-navy-800/80">
                <Link
                  to={`/dispatch/tracking?riderId=${rider.id}`}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>تتبع الخريطة</span>
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDetailsRider(rider)}
                    className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white"
                    title="التفاصيل"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    to={`/dispatch/delivery/${rider.id}`}
                    className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-sky-400 hover:text-white transition-colors"
                    title="تعديل بيانات المندوب"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmRider(rider)}
                    className="p-1.5 rounded-lg bg-navy-800 hover:bg-rose-900/40 text-navy-300 hover:text-rose-400"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 2: Rider Dossier / Details Modal */}
      {detailsRider && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 border border-navy-700/80 shadow-2xl rounded-2xl animate-scale-up space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-navy-700/60">
              <div className="flex items-center gap-3">
                <img
                  src={
                    detailsRider.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces'
                  }
                  alt={detailsRider.nameAr}
                  className="w-14 h-14 rounded-2xl object-cover border border-navy-700 shadow-md"
                />
                <div>
                  <h3 className="font-bold text-white text-base">{detailsRider.nameAr}</h3>
                  <p className="text-xs text-navy-400 font-mono">{detailsRider.name}</p>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      detailsRider.status === 'available'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : detailsRider.status === 'busy'
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}
                  >
                    {detailsRider.status === 'available'
                      ? 'متاح للطلبات'
                      : detailsRider.status === 'busy'
                      ? 'قيد التوصيل'
                      : 'غير متصل'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailsRider(null)}
                className="text-navy-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-navy-900/60 rounded-xl border border-navy-800 space-y-1">
                <span className="text-navy-400 text-[11px]">رقم الهاتف:</span>
                <p className="font-mono text-white font-bold">{detailsRider.phone}</p>
              </div>

              <div className="p-3 bg-navy-900/60 rounded-xl border border-navy-800 space-y-1">
                <span className="text-navy-400 text-[11px]">منطقة العمل:</span>
                <p className="font-semibold text-white">{detailsRider.zoneAr || detailsRider.zone}</p>
              </div>

              <div className="p-3 bg-navy-900/60 rounded-xl border border-navy-800 space-y-1">
                <span className="text-navy-400 text-[11px]">نوع المركبة واللوحة:</span>
                <p className="font-semibold text-white">
                  {getVehicleLabel(detailsRider.vehicleType)} - {detailsRider.plateNumber || 'غير مسجل'}
                </p>
              </div>

              <div className="p-3 bg-navy-900/60 rounded-xl border border-navy-800 space-y-1">
                <span className="text-navy-400 text-[11px]">الفريق والمشغل:</span>
                <p className="font-semibold text-white">{detailsRider.team || 'فريق الأسطول'}</p>
              </div>

              <div className="p-3 bg-navy-900/60 rounded-xl border border-navy-800 space-y-1">
                <span className="text-navy-400 text-[11px]">التقييم:</span>
                <p className="font-bold text-amber-400 flex items-center gap-1 font-mono">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {detailsRider.rating || 5.0} / 5.0
                </p>
              </div>

              <div className="p-3 bg-navy-900/60 rounded-xl border border-navy-800 space-y-1">
                <span className="text-navy-400 text-[11px]">حد العهدة المالية:</span>
                <p className="font-bold text-white font-mono">
                  {formatCurrency(detailsRider.custodyLimit || 2500)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-navy-800">
              <Link
                to={`/dispatch/tracking?riderId=${detailsRider.id}`}
                className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-2"
                onClick={() => setDetailsRider(null)}
              >
                <Navigation className="w-4 h-4" />
                <span>تتبع المندوب على الخريطة الحية</span>
              </Link>
              <button
                type="button"
                onClick={() => setDetailsRider(null)}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Delete Confirmation Modal */}
      {deleteConfirmRider && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 border border-rose-500/40 shadow-2xl rounded-2xl animate-scale-up space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-white text-base">هل أنت متأكد من حذف المندوب؟</h3>
              <p className="text-navy-300 text-xs">
                سيتم إزالة المندوب <span className="text-white font-bold">{deleteConfirmRider.nameAr}</span> نهائياً من الأسطول وقاعدة البيانات.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-navy-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmRider(null)}
                className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 text-xs font-semibold"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-4 h-4" />
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
