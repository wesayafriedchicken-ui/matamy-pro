import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Store, Smartphone, Globe, Palette, Image as ImageIcon,
  Eye, EyeOff, Trash2, Plus, ArrowUp, ArrowDown, X,
  ShoppingBag, Home, UtensilsCrossed, User, Tag, Percent, Clock,
  MapPin, DollarSign, ToggleLeft, ToggleRight, Monitor, Save,
  Settings, Layers, Star, Bell, Coffee,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

type SectionType = 'hero_banner' | 'categories' | 'best_sellers' | 'deals' | 'branches';
type DeviceMode = 'mobile' | 'web';
type FontChoice = 'Cairo' | 'Tajawal' | 'Almarai';
type RadiusChoice = 'rounded' | 'sharp' | 'pill';
type ThemeMode = 'dark' | 'light';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  linkLabel: string;
  bgColor: string;
  visible: boolean;
}

interface StoreSection {
  id: string;
  type: SectionType;
  titleAr: string;
  visible: boolean;
}

interface DeliveryZone {
  id: string;
  nameAr: string;
  fee: number;
  prepTime: number;
}

const defaultSections: StoreSection[] = [
  { id: 's1', type: 'hero_banner', titleAr: 'البانرات الترويجية', visible: true },
  { id: 's2', type: 'categories', titleAr: 'التصنيفات السريعة', visible: true },
  { id: 's3', type: 'best_sellers', titleAr: 'الأكثر مبيعاً', visible: true },
  { id: 's4', type: 'deals', titleAr: 'عروض اليوم', visible: true },
  { id: 's5', type: 'branches', titleAr: 'الفروع ومواعيد العمل', visible: true },
];

const defaultBanners: Banner[] = [
  { id: 'b1', title: 'خصم 20% على طلبك الأول', subtitle: 'استخدم كود WELCOME20', linkLabel: 'اطلب الآن', bgColor: '#f97316', visible: true },
  { id: 'b2', title: 'توصيل مجاني للمناطق القريبة', subtitle: 'للطلبات فوق 200 ج.م', linkLabel: 'تصفح المنيو', bgColor: '#3b82f6', visible: true },
];

const defaultZones: DeliveryZone[] = [
  { id: 'z1', nameAr: 'المعادي', fee: 30, prepTime: 40 },
  { id: 'z2', nameAr: 'مدينة نصر', fee: 25, prepTime: 35 },
  { id: 'z3', nameAr: 'الزمالك', fee: 35, prepTime: 45 },
];

const sectionTypeMeta: Record<SectionType, { labelAr: string; icon: typeof Home }> = {
  hero_banner: { labelAr: 'بانرات ترويجية', icon: ImageIcon },
  categories: { labelAr: 'تصنيفات سريعة', icon: ShoppingBag },
  best_sellers: { labelAr: 'الأكثر مبيعاً', icon: Star },
  deals: { labelAr: 'عروض اليوم', icon: Tag },
  branches: { labelAr: 'الفروع ومواعيد', icon: MapPin },
};

const fontOptions: { value: FontChoice; labelAr: string }[] = [
  { value: 'Cairo', labelAr: 'Cairo' },
  { value: 'Tajawal', labelAr: 'Tajawal' },
  { value: 'Almarai', labelAr: 'Almarai' },
];

const radiusOptions: { value: RadiusChoice; labelAr: string; class: string }[] = [
  { value: 'rounded', labelAr: 'مستدير', class: 'rounded-2xl' },
  { value: 'sharp', labelAr: 'حاد', class: 'rounded-md' },
  { value: 'pill', labelAr: 'بيضاوي', class: 'rounded-full' },
];

const colorPresets = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#06b6d4'];

export default function DigitalStoreBuilder() {
  const { menuItems, showToast } = useApp();
  const [device, setDevice] = useState<DeviceMode>('mobile');
  const [activeTab, setActiveTab] = useState<'sections' | 'theme' | 'operations'>('sections');
  const [sections, setSections] = useState<StoreSection[]>(defaultSections);
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const [zones, setZones] = useState<DeliveryZone[]>(defaultZones);

  // Theme state
  const [primaryColor, setPrimaryColor] = useState('#f97316');
  const [secondaryColor, setSecondaryColor] = useState('#3b82f6');
  const [bgTint, setBgTint] = useState('#0f172a');
  const [font, setFont] = useState<FontChoice>('Cairo');
  const [radius, setRadius] = useState<RadiusChoice>('rounded');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [storeName, setStoreName] = useState('مطعمي برو');

  // Operations
  const [minOrder, setMinOrder] = useState(50);
  const [storeOnline, setStoreOnline] = useState(true);
  const [maintenanceMsg, setMaintenanceMsg] = useState('نحن في صيانة مؤقتاً، نعود قريباً!');

  // Modals
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  const radiusClass = radiusOptions.find((r) => r.value === radius)?.class ?? 'rounded-2xl';
  const isDark = themeMode === 'dark';
  const previewBg = isDark ? '#0f172a' : '#f8fafc';
  const previewCardBg = isDark ? '#1e293b' : '#ffffff';
  const previewText = isDark ? '#f1f5f9' : '#1e293b';
  const previewSubtext = isDark ? '#94a3b8' : '#64748b';
  const previewBorder = isDark ? '#334155' : '#e2e8f0';

  const moveSection = (id: string, dir: -1 | 1) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const toggleSectionVisible = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  };

  const deleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const addSection = (type: SectionType) => {
    const meta = sectionTypeMeta[type];
    setSections((prev) => [...prev, { id: `s-${Date.now()}`, type, titleAr: meta.labelAr, visible: true }]);
  };

  const updateBanner = (updated: Banner) => {
    setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setEditingBanner(null);
  };

  const updateZone = (updated: DeliveryZone) => {
    setZones((prev) => prev.map((z) => (z.id === updated.id ? updated : z)));
    setEditingZone(null);
  };

  const bestSellers = menuItems.filter((m) => m.available).slice(0, 4);
  const categories = [...new Set(menuItems.map((m) => m.categoryAr))].slice(0, 6);

  return (
    <div className="animate-fade-in">
      <PageHeader title="إدارة التطبيق والموقع" description="بناء واجهة المتجر الإلكتروني والتطبيق" />

      {/* Sub-route nav */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 p-1.5 bg-navy-800/60 rounded-2xl w-fit">
          <Link to="/digital-store" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
            <Store className="w-4 h-4" />
            لوحة المتجر
          </Link>
          <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
            <Layers className="w-4 h-4" />
            البناء المرئي
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => showToast('تم حفظ إعدادات المتجر بنجاح', 'success')} className="btn-primary flex items-center gap-2 text-sm">
            <Save className="w-4 h-4" />
            حفظ ونشر
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[calc(100vh-220px)]">
        {/* LEFT: Live Preview */}
        <div className="glass-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-400" />
              المعاينة المباشرة
            </h3>
            {/* Device switcher */}
            <div className="flex items-center gap-1 p-1 bg-navy-900/60 rounded-xl">
              <button
                onClick={() => setDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  device === 'mobile' ? 'bg-brand-500 text-white' : 'text-navy-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                موبايل
              </button>
              <button
                onClick={() => setDevice('web')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  device === 'web' ? 'bg-brand-500 text-white' : 'text-navy-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                ويب
              </button>
            </div>
          </div>

          {/* Device frame */}
          <div className="flex-1 flex items-start justify-center overflow-y-auto no-scrollbar">
            {device === 'mobile' ? (
              <div className="w-[340px] h-[620px] rounded-[2.5rem] border-4 border-navy-700 bg-navy-950 overflow-hidden flex flex-col shadow-2xl shrink-0">
                {/* Notch */}
                <div className="h-6 bg-navy-900 flex items-center justify-center">
                  <div className="w-20 h-1.5 rounded-full bg-navy-700" />
                </div>
                {/* App content */}
                <div className="flex-1 overflow-y-auto no-scrollbar" style={{ backgroundColor: previewBg, fontFamily: font }}>
                  {!storeOnline && (
                    <div className="flex flex-col items-center justify-center h-full px-6 text-center" style={{ color: previewText }}>
                      <Bell className="w-10 h-10 mb-3 opacity-40" />
                      <p className="font-bold text-sm mb-1">{maintenanceMsg}</p>
                      <p className="text-xs opacity-50">نعتذر عن inconvenience</p>
                    </div>
                  )}
                  {storeOnline && (
                    <>
                      {/* App header */}
                      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
                        <span className="text-white font-bold text-sm">{storeName}</span>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* Search bar */}
                      <div className="px-4 py-2.5" style={{ backgroundColor: previewBg }}>
                        <div className={`px-3 py-2 ${radiusClass} flex items-center gap-2`} style={{ backgroundColor: previewCardBg, border: `1px solid ${previewBorder}` }}>
                          <ShoppingBag className="w-4 h-4" style={{ color: previewSubtext }} />
                          <span className="text-xs" style={{ color: previewSubtext }}>ابحث عن وجبتك المفضلة...</span>
                        </div>
                      </div>

                      {/* Sections in order */}
                      {sections.filter((s) => s.visible).map((section) => (
                        <div key={section.id}>
                          {section.type === 'hero_banner' && (
                            <div className="px-4 py-2 space-y-2.5">
                              {banners.filter((b) => b.visible).map((banner) => (
                                <div key={banner.id} className={`${radiusClass} p-4 relative overflow-hidden`} style={{ backgroundColor: banner.bgColor }}>
                                  <p className="text-white font-bold text-sm leading-tight">{banner.title}</p>
                                  <p className="text-white/80 text-xs mt-1">{banner.subtitle}</p>
                                  <button className={`mt-2.5 px-3 py-1.5 ${radiusClass} bg-white/90 text-xs font-bold`} style={{ color: banner.bgColor }}>
                                    {banner.linkLabel}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {section.type === 'categories' && (
                            <div className="px-4 py-3">
                              <p className="font-bold text-sm mb-2" style={{ color: previewText }}>التصنيفات</p>
                              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                {categories.map((cat) => (
                                  <div key={cat} className={`px-3 py-2 ${radiusClass} shrink-0 flex items-center gap-1.5`} style={{ backgroundColor: primaryColor + '20', border: `1px solid ${primaryColor}40` }}>
                                    <Coffee className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                                    <span className="text-xs font-medium whitespace-nowrap" style={{ color: previewText }}>{cat}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {section.type === 'best_sellers' && (
                            <div className="px-4 py-3">
                              <p className="font-bold text-sm mb-2" style={{ color: previewText }}>الأكثر مبيعاً</p>
                              <div className="grid grid-cols-2 gap-2.5">
                                {bestSellers.map((item) => (
                                  <div key={item.id} className={`${radiusClass} overflow-hidden`} style={{ backgroundColor: previewCardBg, border: `1px solid ${previewBorder}` }}>
                                    <div className="h-20 flex items-center justify-center" style={{ backgroundColor: primaryColor + '15' }}>
                                      <UtensilsCrossed className="w-7 h-7" style={{ color: primaryColor }} />
                                    </div>
                                    <div className="p-2">
                                      <p className="text-xs font-bold truncate" style={{ color: previewText }}>{item.nameAr}</p>
                                      <p className="text-xs font-mono mt-0.5" style={{ color: primaryColor }}>{item.price} ج.م</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {section.type === 'deals' && (
                            <div className="px-4 py-3">
                              <p className="font-bold text-sm mb-2" style={{ color: previewText }}>عروض اليوم</p>
                              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                                {menuItems.filter((m) => m.available).slice(0, 3).map((item) => (
                                  <div key={item.id} className={`${radiusClass} p-3 shrink-0 w-32`} style={{ backgroundColor: secondaryColor + '15', border: `1px solid ${secondaryColor}40` }}>
                                    <div className="flex items-center gap-1 mb-1">
                                      <Percent className="w-3 h-3" style={{ color: secondaryColor }} />
                                      <span className="text-xs font-bold" style={{ color: secondaryColor }}>وفّر 15%</span>
                                    </div>
                                    <p className="text-xs font-bold truncate" style={{ color: previewText }}>{item.nameAr}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-xs font-mono line-through" style={{ color: previewSubtext }}>{item.price}</span>
                                      <span className="text-xs font-mono font-bold" style={{ color: previewText }}>{Math.round(item.price * 0.85)} ج</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {section.type === 'branches' && (
                            <div className="px-4 py-3">
                              <p className="font-bold text-sm mb-2" style={{ color: previewText }}>الفروع ومواعيد العمل</p>
                              <div className="space-y-2">
                                {[
                                  { name: 'فرع المعادي', hours: '10 ص - 12 م' },
                                  { name: 'فرع مدينة نصر', hours: '11 ص - 1 ص' },
                                ].map((br) => (
                                  <div key={br.name} className={`p-3 ${radiusClass} flex items-center gap-2`} style={{ backgroundColor: previewCardBg, border: `1px solid ${previewBorder}` }}>
                                    <MapPin className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold" style={{ color: previewText }}>{br.name}</p>
                                      <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: previewSubtext }}>
                                        <Clock className="w-3 h-3" />
                                        {br.hours}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Bottom spacing */}
                      <div className="h-20" />
                    </>
                  )}
                </div>
                {/* Tab bar */}
                {storeOnline && (
                  <div className="flex items-center justify-around py-2 px-2" style={{ backgroundColor: previewCardBg, borderTop: `1px solid ${previewBorder}` }}>
                    {[
                      { icon: Home, label: 'الرئيسية', active: true },
                      { icon: ShoppingBag, label: 'المنيو', active: false },
                      { icon: ShoppingBag, label: 'السلة', active: false, badge: true },
                      { icon: User, label: 'حسابي', active: false },
                    ].map((tab) => {
                      const TabIcon = tab.icon;
                      return (
                        <div key={tab.label} className="flex flex-col items-center gap-0.5">
                          <div className="relative">
                            <TabIcon className="w-5 h-5" style={{ color: tab.active ? primaryColor : previewSubtext }} />
                            {tab.badge && (
                              <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full text-white text-[8px] flex items-center justify-center font-bold" style={{ backgroundColor: primaryColor }}>2</span>
                            )}
                          </div>
                          <span className="text-[9px]" style={{ color: tab.active ? primaryColor : previewSubtext }}>{tab.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Web preview */
              <div className="w-full max-w-2xl rounded-2xl border-4 border-navy-700 bg-navy-950 overflow-hidden shadow-2xl">
                {/* Browser bar */}
                <div className="h-8 bg-navy-900 flex items-center px-3 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-danger-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success-500" />
                  </div>
                  <div className="flex-1 h-5 rounded-md bg-navy-800 flex items-center px-2">
                    <span className="text-navy-400 text-xs">www.mata3y-pro.com</span>
                  </div>
                </div>
                {/* Web content */}
                <div className="h-[580px] overflow-y-auto no-scrollbar" style={{ backgroundColor: previewBg, fontFamily: font }}>
                  {!storeOnline ? (
                    <div className="flex flex-col items-center justify-center h-full px-6 text-center" style={{ color: previewText }}>
                      <Bell className="w-12 h-12 mb-3 opacity-40" />
                      <p className="font-bold text-base mb-1">{maintenanceMsg}</p>
                    </div>
                  ) : (
                    <>
                      {/* Web nav */}
                      <div className="px-6 py-3 flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
                        <span className="text-white font-bold text-base">{storeName}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-white/90 text-sm">الرئيسية</span>
                          <span className="text-white/90 text-sm">المنيو</span>
                          <span className="text-white/90 text-sm">العروض</span>
                          <span className="text-white/90 text-sm">الفروع</span>
                          <div className={`px-3 py-1.5 ${radiusClass} bg-white/90 text-xs font-bold flex items-center gap-1.5`} style={{ color: primaryColor }}>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            السلة (2)
                          </div>
                        </div>
                      </div>

                      {/* Web sections */}
                      {sections.filter((s) => s.visible).map((section) => (
                        <div key={section.id}>
                          {section.type === 'hero_banner' && (
                            <div className="px-6 py-3 grid grid-cols-2 gap-3">
                              {banners.filter((b) => b.visible).map((banner) => (
                                <div key={banner.id} className={`${radiusClass} p-5`} style={{ backgroundColor: banner.bgColor }}>
                                  <p className="text-white font-bold text-base">{banner.title}</p>
                                  <p className="text-white/80 text-sm mt-1">{banner.subtitle}</p>
                                  <button className={`mt-3 px-4 py-2 ${radiusClass} bg-white/90 text-xs font-bold`} style={{ color: banner.bgColor }}>{banner.linkLabel}</button>
                                </div>
                              ))}
                            </div>
                          )}
                          {section.type === 'categories' && (
                            <div className="px-6 py-3">
                              <p className="font-bold text-base mb-2" style={{ color: previewText }}>التصنيفات</p>
                              <div className="flex gap-2 flex-wrap">
                                {categories.map((cat) => (
                                  <span key={cat} className={`px-4 py-2 ${radiusClass} text-sm font-medium`} style={{ backgroundColor: primaryColor + '20', color: previewText, border: `1px solid ${primaryColor}40` }}>{cat}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {section.type === 'best_sellers' && (
                            <div className="px-6 py-3">
                              <p className="font-bold text-base mb-2" style={{ color: previewText }}>الأكثر مبيعاً</p>
                              <div className="grid grid-cols-4 gap-3">
                                {bestSellers.map((item) => (
                                  <div key={item.id} className={`${radiusClass} overflow-hidden`} style={{ backgroundColor: previewCardBg, border: `1px solid ${previewBorder}` }}>
                                    <div className="h-16 flex items-center justify-center" style={{ backgroundColor: primaryColor + '15' }}>
                                      <UtensilsCrossed className="w-6 h-6" style={{ color: primaryColor }} />
                                    </div>
                                    <div className="p-2">
                                      <p className="text-xs font-bold truncate" style={{ color: previewText }}>{item.nameAr}</p>
                                      <p className="text-xs font-mono mt-0.5" style={{ color: primaryColor }}>{item.price} ج.م</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {section.type === 'deals' && (
                            <div className="px-6 py-3">
                              <p className="font-bold text-base mb-2" style={{ color: previewText }}>عروض اليوم</p>
                              <div className="grid grid-cols-3 gap-3">
                                {menuItems.filter((m) => m.available).slice(0, 3).map((item) => (
                                  <div key={item.id} className={`${radiusClass} p-3`} style={{ backgroundColor: secondaryColor + '15', border: `1px solid ${secondaryColor}40` }}>
                                    <div className="flex items-center gap-1 mb-1">
                                      <Percent className="w-3.5 h-3.5" style={{ color: secondaryColor }} />
                                      <span className="text-xs font-bold" style={{ color: secondaryColor }}>وفّر 15%</span>
                                    </div>
                                    <p className="text-sm font-bold" style={{ color: previewText }}>{item.nameAr}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <span className="text-xs line-through" style={{ color: previewSubtext }}>{item.price}</span>
                                      <span className="text-sm font-mono font-bold" style={{ color: previewText }}>{Math.round(item.price * 0.85)} ج</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {section.type === 'branches' && (
                            <div className="px-6 py-3">
                              <p className="font-bold text-base mb-2" style={{ color: previewText }}>الفروع ومواعيد العمل</p>
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { name: 'فرع المعادي', hours: '10 ص - 12 م', addr: 'شارع 9، المعادي' },
                                  { name: 'فرع مدينة نصر', hours: '11 ص - 1 ص', addr: 'ميدان عباس العقاد' },
                                ].map((br) => (
                                  <div key={br.name} className={`p-3 ${radiusClass} flex items-start gap-2`} style={{ backgroundColor: previewCardBg, border: `1px solid ${previewBorder}` }}>
                                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                                    <div>
                                      <p className="text-sm font-bold" style={{ color: previewText }}>{br.name}</p>
                                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: previewSubtext }}>
                                        <Clock className="w-3 h-3" />{br.hours}
                                      </p>
                                      <p className="text-xs mt-0.5" style={{ color: previewSubtext }}>{br.addr}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="h-8" />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Config Panel */}
        <div className="glass-card p-5 flex flex-col overflow-hidden">
          {/* Tab switcher */}
          <div className="flex items-center gap-1 p-1 bg-navy-900/60 rounded-xl mb-4">
            {([
              { id: 'sections' as const, label: 'الأقسام', icon: Layers },
              { id: 'theme' as const, label: 'الثيم والألوان', icon: Palette },
              { id: 'operations' as const, label: 'العمليات', icon: Settings },
            ]).map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id ? 'bg-brand-500 text-white' : 'text-navy-400 hover:text-white'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* SECTIONS TAB */}
            {activeTab === 'sections' && (
              <div className="space-y-3">
                {sections.map((section, idx) => {
                  const meta = sectionTypeMeta[section.type];
                  const SectionIcon = meta.icon;
                  return (
                    <div
                      key={section.id}
                      className={`rounded-2xl border px-4 py-3 transition-all ${
                        section.visible
                          ? 'bg-navy-900/50 border-navy-700/40'
                          : 'bg-navy-900/30 border-navy-800/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center">
                            <SectionIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{section.titleAr}</p>
                            <p className="text-navy-400 text-xs">{section.visible ? 'ظاهر' : 'مخفي'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveSection(section.id, -1)}
                            disabled={idx === 0}
                            className="w-7 h-7 rounded-lg bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveSection(section.id, 1)}
                            disabled={idx === sections.length - 1}
                            className="w-7 h-7 rounded-lg bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleSectionVisible(section.id)}
                            className="w-7 h-7 rounded-lg bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all"
                          >
                            {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => deleteSection(section.id)}
                            className="w-7 h-7 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 flex items-center justify-center text-danger-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Banner sub-editor */}
                      {section.type === 'hero_banner' && section.visible && (
                        <div className="mt-3 pt-3 border-t border-navy-700/30 space-y-2">
                          {banners.map((banner) => (
                            <div key={banner.id} className="flex items-center gap-2 bg-navy-800/40 rounded-xl px-3 py-2">
                              <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: banner.bgColor }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">{banner.title}</p>
                                <p className="text-navy-400 text-xs truncate">{banner.subtitle}</p>
                              </div>
                              <button
                                onClick={() => setEditingBanner(banner)}
                                className="text-brand-400 text-xs hover:text-brand-300"
                              >
                                تعديل
                              </button>
                              <button
                                onClick={() => setBanners((prev) => prev.map((b) => b.id === banner.id ? { ...b, visible: !b.visible } : b))}
                              >
                                {banner.visible
                                  ? <Eye className="w-3.5 h-3.5 text-navy-400" />
                                  : <EyeOff className="w-3.5 h-3.5 text-navy-500" />}
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => setBanners((prev) => [...prev, { id: `b-${Date.now()}`, title: 'عرض جديد', subtitle: 'وصف العرض', linkLabel: 'اطلب', bgColor: primaryColor, visible: true }])}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-navy-700/60 text-navy-400 hover:text-brand-400 hover:border-brand-500/40 transition-all text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            إضافة بانر
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add section dropdown */}
                <div className="pt-2">
                  <p className="text-navy-400 text-xs mb-2">إضافة قسم جديد:</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(sectionTypeMeta) as SectionType[]).map((type) => {
                      const meta = sectionTypeMeta[type];
                      const Icon = meta.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => addSection(type)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-navy-800/60 border border-navy-700/40 hover:border-brand-500/40 hover:bg-brand-500/10 text-navy-300 hover:text-brand-400 transition-all text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <Icon className="w-3.5 h-3.5" />
                          {meta.labelAr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* THEME TAB */}
            {activeTab === 'theme' && (
              <div className="space-y-5">
                {/* Colors */}
                <div>
                  <p className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-brand-400" />
                    الألوان
                  </p>
                  <div className="space-y-3">
                    <ColorPicker label="اللون الأساسي" value={primaryColor} onChange={setPrimaryColor} presets={colorPresets} />
                    <ColorPicker label="اللون الثانوي" value={secondaryColor} onChange={setSecondaryColor} presets={colorPresets} />
                    <ColorPicker label="درجة الخلفية" value={bgTint} onChange={setBgTint} presets={['#0f172a', '#1e293b', '#f8fafc', '#fef3c7', '#ecfdf5', '#fef2f2']} />
                  </div>
                </div>

                {/* Font */}
                <div>
                  <p className="text-white text-sm font-medium mb-2">الخط</p>
                  <div className="grid grid-cols-3 gap-2">
                    {fontOptions.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setFont(f.value)}
                        className={`px-3 py-2.5 rounded-xl border-2 text-sm transition-all ${
                          font === f.value
                            ? 'border-brand-500/40 bg-brand-500/10 text-brand-400'
                            : 'border-navy-700/40 bg-navy-900/50 text-navy-300 hover:border-navy-600'
                        }`}
                        style={{ fontFamily: f.value }}
                      >
                        {f.labelAr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Radius */}
                <div>
                  <p className="text-white text-sm font-medium mb-2">شكل الأزرار والبطاقات</p>
                  <div className="grid grid-cols-3 gap-2">
                    {radiusOptions.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setRadius(r.value)}
                        className={`px-3 py-2.5 ${r.class} border-2 text-sm transition-all ${
                          radius === r.value
                            ? 'border-brand-500/40 bg-brand-500/10 text-brand-400'
                            : 'border-navy-700/40 bg-navy-900/50 text-navy-300 hover:border-navy-600'
                        }`}
                      >
                        {r.labelAr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme mode */}
                <div>
                  <p className="text-white text-sm font-medium mb-2">وضع العرض الافتراضي للعميل</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setThemeMode('dark')}
                      className={`px-3 py-2.5 rounded-xl border-2 text-sm flex items-center justify-center gap-2 transition-all ${
                        themeMode === 'dark' ? 'border-brand-500/40 bg-brand-500/10 text-brand-400' : 'border-navy-700/40 bg-navy-900/50 text-navy-300'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      داكن
                    </button>
                    <button
                      onClick={() => setThemeMode('light')}
                      className={`px-3 py-2.5 rounded-xl border-2 text-sm flex items-center justify-center gap-2 transition-all ${
                        themeMode === 'light' ? 'border-brand-500/40 bg-brand-500/10 text-brand-400' : 'border-navy-700/40 bg-navy-900/50 text-navy-300'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      فاتح
                    </button>
                  </div>
                </div>

                {/* Branding */}
                <div>
                  <p className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-400" />
                    أصول الهوية
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-brand-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">شعار المتجر</p>
                        <p className="text-navy-400 text-xs">PNG / SVG - أقصى حجم 2MB</p>
                      </div>
                      <button className="btn-ghost text-xs px-3 py-1.5">رفع</button>
                    </div>
                    <div className="flex items-center gap-3 bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">أيقونة التطبيق (Favicon)</p>
                        <p className="text-navy-400 text-xs">512×512 px</p>
                      </div>
                      <button className="btn-ghost text-xs px-3 py-1.5">رفع</button>
                    </div>
                    <div className="flex items-center gap-3 bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
                      <div className="w-10 h-10 rounded-xl bg-success-500/15 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-success-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">شاشة البداية (Splash)</p>
                        <p className="text-navy-400 text-xs">1080×1920 px</p>
                      </div>
                      <button className="btn-ghost text-xs px-3 py-1.5">رفع</button>
                    </div>
                  </div>
                </div>

                {/* Store name */}
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-2 block">اسم المتجر</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* OPERATIONS TAB */}
            {activeTab === 'operations' && (
              <div className="space-y-5">
                {/* Min order */}
                <div className="bg-navy-900/50 rounded-2xl px-4 py-4 border border-navy-700/40">
                  <p className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-brand-400" />
                    الحد الأدنى للطلب
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={minOrder}
                      onChange={(e) => setMinOrder(Number(e.target.value))}
                      className="input-field flex-1 text-center font-bold text-lg"
                    />
                    <span className="text-navy-300 text-sm">ج.م</span>
                  </div>
                  <p className="text-navy-400 text-xs mt-2">لا يمكن للعميل إتمام الطلب أقل من هذا المبلغ</p>
                </div>

                {/* Delivery zones */}
                <div className="bg-navy-900/50 rounded-2xl px-4 py-4 border border-navy-700/40">
                  <p className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-400" />
                    مناطق التوصيل
                  </p>
                  <div className="space-y-2">
                    {zones.map((zone) => (
                      <div key={zone.id} className="flex items-center gap-3 bg-navy-800/40 rounded-xl px-3 py-2.5">
                        <MapPin className="w-4 h-4 text-navy-400" />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{zone.nameAr}</p>
                          <p className="text-navy-400 text-xs">{zone.fee} ج.م - {zone.prepTime} دقيقة</p>
                        </div>
                        <button
                          onClick={() => setEditingZone(zone)}
                          className="text-brand-400 text-xs hover:text-brand-300"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => setZones((prev) => prev.filter((z) => z.id !== zone.id))}
                          className="text-danger-400 hover:text-danger-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setZones((prev) => [...prev, { id: `z-${Date.now()}`, nameAr: 'منطقة جديدة', fee: 20, prepTime: 30 }])}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-navy-700/60 text-navy-400 hover:text-brand-400 hover:border-brand-500/40 transition-all text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة منطقة
                    </button>
                  </div>
                </div>

                {/* Online switch */}
                <div className="bg-navy-900/50 rounded-2xl px-4 py-4 border border-navy-700/40">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        storeOnline ? 'bg-success-500/15 text-success-400' : 'bg-danger-500/15 text-danger-400'
                      }`}>
                        {storeOnline ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{storeOnline ? 'المتجر مفتوح' : 'المتجر متوقف'}</p>
                        <p className="text-navy-400 text-xs">{storeOnline ? 'استقبال الطلبات مفعّل' : 'وضع الصيانة / ضغط الطلبات'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setStoreOnline(!storeOnline);
                        showToast(storeOnline ? 'تم إيقاف استقبال الطلبات' : 'تم تفعيل استقبال الطلبات', storeOnline ? 'warning' : 'success');
                      }}
                      className={`w-12 h-7 rounded-full transition-all relative ${
                        storeOnline ? 'bg-success-500' : 'bg-danger-500'
                      }`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${storeOnline ? 'left-1' : 'left-6'}`} />
                    </button>
                  </div>
                  {!storeOnline && (
                    <div>
                      <label className="text-navy-300 text-xs mb-1.5 block">رسالة مخصصة للعملاء</label>
                      <input
                        type="text"
                        value={maintenanceMsg}
                        onChange={(e) => setMaintenanceMsg(e.target.value)}
                        className="input-field text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner edit modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setEditingBanner(null)}>
          <div className="glass-card w-full max-w-md animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">تعديل البانر</h3>
              <button onClick={() => setEditingBanner(null)} className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">عنوان البانر</label>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">الوصف</label>
                <input
                  type="text"
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">نص الزر</label>
                <input
                  type="text"
                  value={editingBanner.linkLabel}
                  onChange={(e) => setEditingBanner({ ...editingBanner, linkLabel: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-navy-300 text-sm font-medium mb-2 block">لون البانر</label>
                <div className="flex items-center gap-2">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditingBanner({ ...editingBanner, bgColor: c })}
                      className={`w-9 h-9 rounded-xl border-2 transition-all ${
                        editingBanner.bgColor === c ? 'border-white scale-110' : 'border-navy-700'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={editingBanner.bgColor}
                    onChange={(e) => setEditingBanner({ ...editingBanner, bgColor: e.target.value })}
                    className="w-9 h-9 rounded-xl bg-transparent border border-navy-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => updateBanner(editingBanner)}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ
            </button>
          </div>
        </div>
      )}

      {/* Zone edit modal */}
      {editingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setEditingZone(null)}>
          <div className="glass-card w-full max-w-md animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">تعديل منطقة التوصيل</h3>
              <button onClick={() => setEditingZone(null)} className="w-9 h-9 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-navy-300 text-sm font-medium mb-1.5 block">اسم المنطقة</label>
                <input
                  type="text"
                  value={editingZone.nameAr}
                  onChange={(e) => setEditingZone({ ...editingZone, nameAr: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-1.5 block">رسوم التوصيل (ج.م)</label>
                  <input
                    type="number"
                    value={editingZone.fee}
                    onChange={(e) => setEditingZone({ ...editingZone, fee: Number(e.target.value) })}
                    className="input-field text-center"
                  />
                </div>
                <div>
                  <label className="text-navy-300 text-sm font-medium mb-1.5 block">وقت التحضير (دقيقة)</label>
                  <input
                    type="number"
                    value={editingZone.prepTime}
                    onChange={(e) => setEditingZone({ ...editingZone, prepTime: Number(e.target.value) })}
                    className="input-field text-center"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => updateZone(editingZone)}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ColorPicker({ label, value, onChange, presets }: { label: string; value: string; onChange: (v: string) => void; presets: string[] }) {
  return (
    <div>
      <label className="text-navy-300 text-sm font-medium mb-2 block">{label}</label>
      <div className="flex items-center gap-2">
        {presets.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-8 h-8 rounded-xl border-2 transition-all ${
              value.toLowerCase() === c.toLowerCase() ? 'border-white scale-110' : 'border-navy-700'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded-xl bg-transparent border-2 border-navy-700 cursor-pointer"
          />
        </div>
        <span className="text-navy-400 text-xs font-mono mr-1">{value}</span>
      </div>
    </div>
  );
}
