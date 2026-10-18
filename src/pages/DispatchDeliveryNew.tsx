import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Rider } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import {
  Bike,
  Navigation,
  UtensilsCrossed,
  Package,
  User,
  Shield,
  Clock,
  Key,
  UploadCloud,
  Eye,
  EyeOff,
  Check,
  ChevronLeft,
  ArrowRight,
  Layers,
  Phone,
  DollarSign,
  Sparkles,
  Users,
} from 'lucide-react';

type StepId =
  | 'rider-info'
  | 'vehicle-details'
  | 'bundle-details'
  | 'custody-limit'
  | 'shift-details'
  | 'change-password';

interface StepItem {
  id: StepId;
  labelEn: string;
  labelAr: string;
  icon: typeof User;
}

const steps: StepItem[] = [
  { id: 'rider-info', labelEn: 'Rider information', labelAr: 'بيانات المندوب', icon: User },
  { id: 'vehicle-details', labelEn: 'Vehicle Details', labelAr: 'تفاصيل المركبة', icon: Bike },
  { id: 'bundle-details', labelEn: 'Bundle Details', labelAr: 'حزم وعمولات التوصيل', icon: Layers },
  { id: 'custody-limit', labelEn: 'Custody Limit', labelAr: 'حد العهدة المالية', icon: DollarSign },
  { id: 'shift-details', labelEn: 'Shift Details', labelAr: 'تفاصيل الشيفت ومواعيد العمل', icon: Clock },
  { id: 'change-password', labelEn: 'Change Password', labelAr: 'كلمة المرور والأمان', icon: Key },
];

const coverageZoneMap: Record<string, { en: string; ar: string }> = {
  'nasr-city': { en: 'Nasr City', ar: 'مدينة نصر' },
  heliopolis: { en: 'Heliopolis', ar: 'مصر الجديدة' },
  maadi: { en: 'Maadi', ar: 'المعادي' },
  'new-cairo': { en: 'New Cairo', ar: 'التجمع الخامس' },
  dokki: { en: 'Dokki & Mohandessin', ar: 'الدقي والمهندسين' },
  zayed: { en: 'Sheikh Zayed', ar: 'الشيخ زايد' },
  downtown: { en: 'Downtown', ar: 'وسط البلد' },
};

export default function DispatchDeliveryNew() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id && id !== 'new');

  const { riders, addRider, updateRider, showToast } = useApp();

  const existingRider = useMemo(() => {
    if (!isEditMode || !id) return null;
    return riders.find((r) => r.id === id);
  }, [riders, id, isEditMode]);

  const [activeStep, setActiveStep] = useState<StepId>('rider-info');

  // Form State: Rider Information
  const [isOnDemand, setIsOnDemand] = useState(false);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [team, setTeam] = useState('team-nasr-city');
  const [provider, setProvider] = useState('internal-fleet');
  const [nationality, setNationality] = useState('egyptian');
  const [vehicleType, setVehicleType] = useState<'motorcycle' | 'car' | 'bicycle' | 'scooter'>('motorcycle');
  const [mobileNumber, setMobileNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [nationalIdExpiry, setNationalIdExpiry] = useState('');
  const [enrollId, setEnrollId] = useState('');
  const [hiringDate, setHiringDate] = useState('2026-10-18');
  const [password, setPassword] = useState('Rider@' + Math.floor(1000 + Math.random() * 9000));
  const [showPassword, setShowPassword] = useState(false);
  const [coverageZone, setCoverageZone] = useState('nasr-city');

  // Document Uploads State
  const [frontIdFileName, setFrontIdFileName] = useState<string | null>(null);
  const [backIdFileName, setBackIdFileName] = useState<string | null>(null);

  // Vehicle Details State
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [manufactureYear, setManufactureYear] = useState('2024');
  const [vehicleColor, setVehicleColor] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');

  // Bundle & Custody Details State
  const [commissionType, setCommissionType] = useState<'per-order' | 'fixed-salary' | 'hybrid'>('per-order');
  const [orderCommission, setOrderCommission] = useState('20');
  const [custodyLimit, setCustodyLimit] = useState('2500');
  const [settlementCycle, setSettlementCycle] = useState('daily');

  // Shift Details State
  const [shiftTime, setShiftTime] = useState('evening');
  const [workingDays, setWorkingDays] = useState('6');



  // Pre-fill state when editing an existing rider
  useEffect(() => {
    if (isEditMode && existingRider) {
      setName(existingRider.name || '');
      setNameAr(existingRider.nameAr || '');
      setMobileNumber(existingRider.phone || '');
      if (existingRider.vehicleType) {
        setVehicleType(existingRider.vehicleType);
      }
      setPlateNumber(existingRider.plateNumber || '');
      setVehicleModel(existingRider.vehicleModel || '');
      setCustodyLimit(String(existingRider.custodyLimit || 2500));
      setEnrollId(existingRider.enrollId || existingRider.id || '');
      setNationalId(existingRider.nationalId || '');
      if (existingRider.hiringDate) {
        setHiringDate(existingRider.hiringDate);
      }

      // Match zone
      const matchedZone = Object.keys(coverageZoneMap).find(
        (key) =>
          coverageZoneMap[key].ar === existingRider.zoneAr ||
          coverageZoneMap[key].en.toLowerCase() === (existingRider.zone || '').toLowerCase()
      );
      if (matchedZone) {
        setCoverageZone(matchedZone);
      }

      // Match team
      if (existingRider.team?.includes('مصر الجديدة')) {
        setTeam('team-heliopolis');
      } else if (existingRider.team?.includes('المعادي')) {
        setTeam('team-maadi');
      } else if (existingRider.team?.includes('الشيخ زايد')) {
        setTeam('team-zayed');
      } else {
        setTeam('team-nasr-city');
      }

      // Match provider
      if (
        existingRider.provider?.includes('خارجية') ||
        existingRider.provider?.includes('شحن')
      ) {
        setProvider('logistics-partner');
        setIsOnDemand(false);
      } else if (
        existingRider.provider?.includes('طلب') ||
        existingRider.provider?.includes('Freelance')
      ) {
        setProvider('freelance-on-demand');
        setIsOnDemand(true);
      } else {
        setProvider('internal-fleet');
        setIsOnDemand(false);
      }
    }
  }, [isEditMode, existingRider]);

  const generateAutoPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let autoPass = 'Rider@';
    for (let i = 0; i < 4; i++) {
      autoPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(autoPass);
    showToast('تم توليد كلمة مرور جديدة بنجاح', 'info');
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex((s) => s.id === activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    const currentIndex = steps.findIndex((s) => s.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
    }
  };

  const handleSaveRider = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim() && !nameAr.trim()) {
      showToast('يرجى إدخال اسم المندوب', 'warning');
      setActiveStep('rider-info');
      return;
    }

    if (!mobileNumber.trim()) {
      showToast('يرجى إدخال رقم الهاتف', 'warning');
      setActiveStep('rider-info');
      return;
    }

    const zoneDetails = coverageZoneMap[coverageZone] || { en: 'Nasr City', ar: 'مدينة نصر' };

    if (isEditMode && existingRider) {
      const updatedRider: Rider = {
        ...existingRider,
        name: name.trim() || nameAr.trim(),
        nameAr: nameAr.trim() || name.trim(),
        phone: mobileNumber.trim(),
        zone: zoneDetails.en,
        zoneAr: zoneDetails.ar,
        vehicleType,
        plateNumber:
          plateNumber.trim() || (vehicleType === 'bicycle' ? 'دراجة هوائية' : 'غير محدد'),
        vehicleModel: vehicleModel.trim() || undefined,
        custodyLimit: Number(custodyLimit) || 2500,
        team:
          team === 'team-nasr-city'
            ? 'فريق مدينة نصر'
            : team === 'team-heliopolis'
            ? 'فريق مصر الجديدة'
            : team === 'team-maadi'
            ? 'فريق المعادي'
            : 'كابتن أسطول القاهرة',
        provider:
          provider === 'internal-fleet'
            ? 'أسطول داخلي'
            : provider === 'logistics-partner'
            ? 'شركة شحن خارجية'
            : 'عند الطلب (Freelance)',
        hiringDate: hiringDate || existingRider.hiringDate,
        nationalId: nationalId.trim() || undefined,
        enrollId: enrollId.trim() || existingRider.id,
      };

      updateRider(updatedRider);
      showToast(`تم حفظ وتحديث بيانات المندوب ${updatedRider.nameAr} بنجاح!`, 'success');
      navigate('/dispatch/delivery');
      return;
    }

    const newRider: Rider = {
      id: enrollId.trim() ? enrollId.trim().toLowerCase() : `r-${Date.now()}`,
      name: name.trim() || nameAr.trim(),
      nameAr: nameAr.trim() || name.trim(),
      phone: mobileNumber.trim(),
      status: 'available',
      currentOrders: 0,
      rating: 5.0,
      zone: zoneDetails.en,
      zoneAr: zoneDetails.ar,
      vehicleType,
      plateNumber: plateNumber.trim() || (vehicleType === 'bicycle' ? 'دراجة هوائية' : 'غير محدد'),
      vehicleModel: vehicleModel.trim() || undefined,
      custodyLimit: Number(custodyLimit) || 2500,
      currentCustody: 0,
      team:
        team === 'team-nasr-city'
          ? 'فريق مدينة نصر'
          : team === 'team-heliopolis'
          ? 'فريق مصر الجديدة'
          : team === 'team-maadi'
          ? 'فريق المعادي'
          : 'كابتن أسطول القاهرة',
      provider:
        provider === 'internal-fleet'
          ? 'أسطول داخلي'
          : provider === 'logistics-partner'
          ? 'شركة شحن خارجية'
          : 'عند الطلب (Freelance)',
      hiringDate: hiringDate || new Date().toISOString().split('T')[0],
      nationalId: nationalId.trim() || undefined,
      enrollId: enrollId.trim() || undefined,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
    };

    addRider(newRider);
    showToast(`تم تسجيل المندوب ${newRider.nameAr} في الأسطول بنجاح!`, 'success');
    navigate('/dispatch/delivery');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <PageHeader
        title={
          isEditMode
            ? `تعديل بيانات المندوب: ${existingRider?.nameAr || existingRider?.name || id}`
            : 'إضافة مندوب جديد (Create Rider)'
        }
        description={
          isEditMode
            ? 'تحديث بيانات المركبة، الحزم، وحد العهدة والشيفت والملف التعريفي للمندوب'
            : 'تسجيل وتكوين مندوب التوصيل في الأسطول وضبط بيانات المركبة والعهد'
        }
      />

      {/* Sub-route navigation tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-navy-900/80 border border-navy-800 rounded-2xl w-fit flex-wrap">
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

        {/* Current Active Sub-path */}
        <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/25">
          <User className="w-4 h-4" />
          {isEditMode ? 'تعديل بيانات المندوب' : 'إضافة مندوب جديد'}
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
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sidebar / Profile Card & Step Navigation */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Back button */}
          <Link
            to="/dispatch/delivery"
            className="inline-flex items-center gap-2 text-xs font-semibold text-navy-400 hover:text-white transition-colors px-1 group"
          >
            <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>العودة لقائمة أسطول المناديب (Back to Delivery)</span>
          </Link>

          {/* Profile Card */}
          <div className="glass-card p-5 text-center flex flex-col items-center border border-navy-700/60 shadow-xl">
            {/* Courier 3D Avatar */}
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-600 via-amber-500 to-brand-400 p-0.5 shadow-xl shadow-brand-500/20">
                <div className="w-full h-full rounded-2xl bg-navy-900 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces"
                    alt="Rider"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-navy-900 flex items-center justify-center text-white text-[10px]" title="نشط ومتاح">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="font-bold text-white text-base">
              {nameAr || name || 'الملف التعريفي للمندوب'}
            </h3>
            <p className="text-navy-400 text-xs font-mono mt-0.5">
              {mobileNumber || 'Rider Profile'}
            </p>
            <span className="mt-2 text-[10px] bg-brand-500/15 border border-brand-500/30 text-brand-400 px-2.5 py-0.5 rounded-full font-semibold">
              {isOnDemand ? 'مندوب عند الطلب (On Demand)' : 'مندوب أسطول رسمي (Full Time)'}
            </span>
          </div>

          {/* Navigation Steps */}
          <div className="glass-card p-2 border border-navy-700/60 space-y-1">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                      : 'text-navy-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="text-right leading-tight">
                      <p>{step.labelEn}</p>
                      <p className="text-[10px] opacity-80">{step.labelAr}</p>
                    </div>
                  </div>
                  <ChevronLeft className={`w-4 h-4 ${isActive ? 'text-white' : 'text-navy-500'}`} />
                </button>
              );
            })}
          </div>

          {/* Quick Stats / Registered Count */}
          <div className="p-4 bg-navy-900/60 border border-navy-800 rounded-2xl text-xs text-navy-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" />
              <span>إجمالي أسطول المناديب:</span>
            </div>
            <span className="font-bold text-white font-mono text-sm">{riders.length} مندوب</span>
          </div>
        </div>

        {/* Right Column: Form Workspace */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Action Top Bar */}
          <div className="glass-card p-5 border border-navy-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Create Rider</span>
                <span className="text-navy-400 font-normal">|</span>
                <span className="text-brand-400">إنشاء وتكوين مندوب جديد</span>
              </h2>
              <p className="text-xs text-navy-400 mt-0.5">
                Create Rider with customized rider configuration | تكوين حساب وبيانات المندوب ومستنداته
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={handlePrev}
                disabled={activeStep === 'rider-info'}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                السابق (Prev)
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={activeStep === 'change-password'}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next (التالي)
              </button>
              <button
                type="button"
                onClick={handleSaveRider}
                className="btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-500/25"
              >
                <Check className="w-4 h-4" />
                Save (حفظ المندوب)
              </button>
            </div>
          </div>

          {/* STEP 1: Rider Information */}
          {activeStep === 'rider-info' && (
            <div className="space-y-6">
              {/* Section 1: Basic Info */}
              <div className="glass-card p-6 border border-navy-700/60 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-navy-700/40">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-400" />
                    <span>Rider Information</span>
                    <span className="text-navy-400 font-normal">|</span>
                    <span className="text-navy-200">البيانات الشخصية</span>
                  </h3>

                  {/* On Demand Toggle */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <span className="text-xs font-medium text-navy-300">
                      On Demand Rider (مندوب عند الطلب)
                    </span>
                    <div
                      onClick={() => setIsOnDemand(!isOnDemand)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        isOnDemand ? 'bg-brand-500' : 'bg-navy-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          isOnDemand ? '-translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-navy-300 font-medium">
                      Name <span className="text-rose-400">*</span> (الاسم بالإنجليزية)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field text-xs"
                      required
                    />
                  </div>

                  {/* Name Arabic */}
                  <div className="space-y-1.5">
                    <label className="text-navy-300 font-medium">
                      Name (Arabic) <span className="text-rose-400">*</span> (الاسم بالعربي)
                    </label>
                    <input
                      type="text"
                      placeholder="أدخل اسم المندوب"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      className="input-field text-xs"
                      required
                    />
                  </div>

                  {/* Team */}
                  <div className="space-y-1.5">
                    <label className="text-navy-300 font-medium">
                      Team <span className="text-rose-400">*</span> (الفريق / كابتن المنطقة)
                    </label>
                    <select
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                      className="input-field text-xs"
                    >
                      <option value="team-nasr-city">فريق مدينة نصر (Nasr City Team)</option>
                      <option value="team-heliopolis">فريق مصر الجديدة (Heliopolis Team)</option>
                      <option value="team-maadi">فريق المعادي (Maadi Team)</option>
                      <option value="team-cairo-fleet">كابتن أسطول القاهرة الكبرى</option>
                    </select>
                  </div>

                  {/* Provider */}
                  <div className="space-y-1.5">
                    <label className="text-navy-300 font-medium">
                      Provider <span className="text-rose-400">*</span> (جهة التعيين / المشغل)
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="input-field text-xs"
                    >
                      <option value="internal-fleet">أسطول المطعم الداخلي (Internal Fleet)</option>
                      <option value="logistics-partner">شركة شحن خارجية (Logistics Partner)</option>
                      <option value="freelance">تعاقد حر مستقل (Freelance Courier)</option>
                    </select>
                  </div>

                  {/* Nationality */}
                  <div className="space-y-1.5">
                    <label className="text-navy-300 font-medium">
                      Nationality <span className="text-rose-400">*</span> (الجنسية)
                    </label>
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="input-field text-xs"
                    >
                      <option value="egyptian">مصري (Egyptian)</option>
                      <option value="saudi">سعودي (Saudi)</option>
                      <option value="syrian">سوري (Syrian)</option>
                      <option value="jordanian">أردني (Jordanian)</option>
                      <option value="sudanese">سوداني (Sudanese)</option>
                      <option value="other">أخرى (Other)</option>
                    </select>
                  </div>

                  {/* Vehicle Type */}
                  <div className="space-y-1.5">
                    <label className="text-navy-300 font-medium">
                      Vehicle Type <span className="text-rose-400">*</span> (نوع المركبة)
                    </label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value as 'motorcycle' | 'car' | 'bicycle' | 'scooter')}
                      className="input-field text-xs"
                    >
                      <option value="motorcycle">دراجة نارية / موتوسيكل (Motorcycle)</option>
                      <option value="car">سيارة خاصة (Car)</option>
                      <option value="bicycle">دراجة هوائية / عجلة (Bicycle)</option>
                      <option value="scooter">سكوتر كهربائي (Scooter)</option>
                    </select>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-navy-300 font-medium">
                      Mobile Number <span className="text-rose-400">*</span> (رقم الهاتف)
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="010XXXXXXXX"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="input-field pr-9 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* National ID / SSN */}
                  <div className="space-y-1.5">
                    <label className="text-navy-300 font-medium">
                      National ID / SSN <span className="text-rose-400">*</span> (الرقم القومي)
                    </label>
                    <input
                      type="text"
                      placeholder="14 رقماً قومياً"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="input-field text-xs font-mono"
                    />
                  </div>

                  {/* National ID Expiration Date */}
                  <div className="space-y-1.5">
                    <label className="text-navy-300 font-medium">
                      National ID Expiration Date (انتهاء الهوية)
                    </label>
                    <input
                      type="date"
                      value={nationalIdExpiry}
                      onChange={(e) => setNationalIdExpiry(e.target.value)}
                      className="input-field text-xs"
                    />
                  </div>

                  {/* Enroll ID */}
                  <div className="space-y-1.5">
                    <label className="text-navy-300 font-medium">
                      Enroll ID (كود البصمة / الموظف)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RID-104"
                      value={enrollId}
                      onChange={(e) => setEnrollId(e.target.value)}
                      className="input-field text-xs font-mono"
                    />
                  </div>

                  {/* Hiring Date */}
                  <div className="space-y-1.5">
                    <label className="text-navy-300 font-medium">
                      Hiring Date (تاريخ التعيين)
                    </label>
                    <input
                      type="date"
                      value={hiringDate}
                      onChange={(e) => setHiringDate(e.target.value)}
                      className="input-field text-xs"
                    />
                  </div>

                  {/* Password with Auto Generate Button */}
                  <div className="space-y-1.5 lg:col-span-2">
                    <label className="text-navy-300 font-medium">
                      Password <span className="text-rose-400">*</span> (كلمة المرور لتطبيق المندوب)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter Password"
                          className="input-field pl-9 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={generateAutoPassword}
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Auto Generate
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Coverage Zone */}
              <div className="glass-card p-6 border border-navy-700/60 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-brand-400" />
                  <span>Select Coverage Zone</span>
                  <span className="text-navy-400 font-normal">|</span>
                  <span className="text-navy-200">تحديد منطقة التغطية</span>
                </h3>

                <div className="max-w-md space-y-1.5 text-xs">
                  <label className="text-navy-300 font-medium">
                    Coverage Zone <span className="text-rose-400">*</span> (منطقة التغطية الرئيسية)
                  </label>
                  <select
                    value={coverageZone}
                    onChange={(e) => setCoverageZone(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="nasr-city">مدينة نصر (Nasr City)</option>
                    <option value="heliopolis">مصر الجديدة (Heliopolis)</option>
                    <option value="maadi">المعادي (Maadi)</option>
                    <option value="new-cairo">التجمع الخامس (New Cairo)</option>
                    <option value="dokki">الدقي والمهندسين (Dokki & Mohandessin)</option>
                    <option value="zayed">الشيخ زايد وأكتوبر (Sheikh Zayed)</option>
                    <option value="downtown">وسط البلد (Downtown)</option>
                  </select>
                </div>
              </div>

              {/* Section 3: National ID Upload Dropzones */}
              <div className="glass-card p-6 border border-navy-700/60 space-y-4">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brand-400" />
                    <span>National ID Documents</span>
                    <span className="text-navy-400 font-normal">|</span>
                    <span className="text-navy-200">مستندات وصور بطاقة الرقم القومي</span>
                  </h3>
                  <p className="text-xs text-navy-400 mt-1">
                    Only support .jpg, .png Images, Max file size (1.5 MB) | الصيغ المدعومة JPG و PNG بحد أقصى 1.5 ميجابايت
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Front Side */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-navy-300">
                      Front Side (الوجه الأمامي)
                    </span>
                    <label className="border-2 border-dashed border-navy-700 hover:border-brand-500/60 bg-navy-950/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-white">
                        {frontIdFileName ? frontIdFileName : 'Browse files to start uploading'}
                      </p>
                      <p className="text-[11px] text-navy-400 mt-0.5">
                        {frontIdFileName ? 'تم اختيار الملف بنجاح' : 'تصفح الملفات لبدء الرفع'}
                      </p>
                      <span className="mt-3 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-brand-400 text-xs font-semibold border border-navy-700">
                        Browse files
                      </span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFrontIdFileName(file.name);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Back Side */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-navy-300">
                      Back Side (الوجه الخلفي)
                    </span>
                    <label className="border-2 border-dashed border-navy-700 hover:border-brand-500/60 bg-navy-950/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-white">
                        {backIdFileName ? backIdFileName : 'Browse files to start uploading'}
                      </p>
                      <p className="text-[11px] text-navy-400 mt-0.5">
                        {backIdFileName ? 'تم اختيار الملف بنجاح' : 'تصفح الملفات لبدء الرفع'}
                      </p>
                      <span className="mt-3 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-brand-400 text-xs font-semibold border border-navy-700">
                        Browse files
                      </span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setBackIdFileName(file.name);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Vehicle Details */}
          {activeStep === 'vehicle-details' && (
            <div className="glass-card p-6 border border-navy-700/60 space-y-5 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 pb-3 border-b border-navy-700/40">
                <Bike className="w-4 h-4 text-brand-400" />
                <span>Vehicle Details</span>
                <span className="text-navy-400 font-normal">|</span>
                <span className="text-navy-200">بيانات المركبة والترخيص</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-navy-300 font-medium">Plate Number (رقم اللوحة المعدنية)</label>
                  <input
                    type="text"
                    placeholder="مثال: أ ب ج 1234"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="input-field text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-navy-300 font-medium">Model & Brand (الموديل والماركة)</label>
                  <input
                    type="text"
                    placeholder="مثال: Bajaj Boxer 150 أو Honda"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-navy-300 font-medium">Manufacture Year (سنة الصنع)</label>
                  <input
                    type="number"
                    value={manufactureYear}
                    onChange={(e) => setManufactureYear(e.target.value)}
                    className="input-field text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-navy-300 font-medium">Vehicle Color (لون المركبة)</label>
                  <input
                    type="text"
                    placeholder="أسود / أحمر / أزرق"
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-navy-300 font-medium">Driving License Number (رقم رخصة القيادة)</label>
                  <input
                    type="text"
                    placeholder="رقم رخصة القيادة سارية"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value)}
                    className="input-field text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Bundle Details */}
          {activeStep === 'bundle-details' && (
            <div className="glass-card p-6 border border-navy-700/60 space-y-5 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 pb-3 border-b border-navy-700/40">
                <Layers className="w-4 h-4 text-brand-400" />
                <span>Bundle & Commission Details</span>
                <span className="text-navy-400 font-normal">|</span>
                <span className="text-navy-200">حزم وعمولات التوصيل</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-navy-300 font-medium">Commission Model (نظام الحساب)</label>
                  <select
                    value={commissionType}
                    onChange={(e) => setCommissionType(e.target.value as 'per-order' | 'fixed-salary' | 'hybrid')}
                    className="input-field text-xs"
                  >
                    <option value="per-order">عمولة لكل طلب مسلّم (Per Order)</option>
                    <option value="fixed-salary">راتب شهري ثابت (Fixed Salary)</option>
                    <option value="hybrid">نظام مركب (راتب أساسي + عمولة)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-navy-300 font-medium">Order Commission Fee (العمولة لكل طلب - ج.م)</label>
                  <input
                    type="number"
                    value={orderCommission}
                    onChange={(e) => setOrderCommission(e.target.value)}
                    className="input-field text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Custody Limit */}
          {activeStep === 'custody-limit' && (
            <div className="glass-card p-6 border border-navy-700/60 space-y-5 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 pb-3 border-b border-navy-700/40">
                <DollarSign className="w-4 h-4 text-brand-400" />
                <span>Custody & Cash Limits</span>
                <span className="text-navy-400 font-normal">|</span>
                <span className="text-navy-200">حدود العهدة المالية وتوريد الكاش</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-navy-300 font-medium">Maximum Cash In Hand Limit (أقصى حد للعهدة - ج.م)</label>
                  <input
                    type="number"
                    value={custodyLimit}
                    onChange={(e) => setCustodyLimit(e.target.value)}
                    className="input-field text-xs font-mono"
                  />
                  <p className="text-[11px] text-navy-400">
                    عند وصول المندوب لهذا الحد يتم إيقاف إسناد طلبات كاش جديدة حتى التوريد للخزينة.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-navy-300 font-medium">Settlement Frequency (دورية التوريد)</label>
                  <select
                    value={settlementCycle}
                    onChange={(e) => setSettlementCycle(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="daily">نهاية كل وردية يومياً (Daily End of Shift)</option>
                    <option value="weekly">أسبوعي (Weekly)</option>
                    <option value="on-limit">عند الوصول للحد الأقصى مباشرة</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Shift Details */}
          {activeStep === 'shift-details' && (
            <div className="glass-card p-6 border border-navy-700/60 space-y-5 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 pb-3 border-b border-navy-700/40">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>Shift & Schedule Details</span>
                <span className="text-navy-400 font-normal">|</span>
                <span className="text-navy-200">مواعيد الشيفت والورديات</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-navy-300 font-medium">Work Shift (وردية العمل المخصصة)</label>
                  <select
                    value={shiftTime}
                    onChange={(e) => setShiftTime(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="morning">وردية صباحية (08:00 ص - 04:00 م)</option>
                    <option value="evening">وردية مسائية (04:00 م - 12:00 ص)</option>
                    <option value="night">وردية ليلية (12:00 ص - 08:00 ص)</option>
                    <option value="full">دوام مرن حر (Flexible Shift)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-navy-300 font-medium">Weekly Working Days (أيام العمل في الأسبوع)</label>
                  <select
                    value={workingDays}
                    onChange={(e) => setWorkingDays(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="6">6 أيام عمل + يوم راحة</option>
                    <option value="5">5 أيام عمل + يومين راحة</option>
                    <option value="7">7 أيام (دوام كامل)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Change Password */}
          {activeStep === 'change-password' && (
            <div className="glass-card p-6 border border-navy-700/60 space-y-5 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 pb-3 border-b border-navy-700/40">
                <Key className="w-4 h-4 text-brand-400" />
                <span>Security & Password</span>
                <span className="text-navy-400 font-normal">|</span>
                <span className="text-navy-200">أمان الحساب وكلمة المرور</span>
              </h3>

              <div className="max-w-md space-y-4">
                <div className="space-y-1.5">
                  <label className="text-navy-300 font-medium">كلمة المرور الحالية لتطبيق المندوب:</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field text-xs font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={generateAutoPassword}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-brand-400 border border-brand-500/30 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  توليد كلمة مرور عشوائية جديدة
                </button>
              </div>
            </div>
          )}

          {/* Save Button Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={() => navigate('/dispatch/delivery')}
              className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white text-xs font-semibold transition-all"
            >
              إلغاء والعودة للقائمة
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveRider}
                className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/30 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                {isEditMode ? 'حفظ التعديلات (Save Changes)' : 'حفظ بيانات المندوب (Save Rider)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
