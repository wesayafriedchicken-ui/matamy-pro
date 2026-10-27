import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Search,
  X,
  Package,
  Bike,
  UtensilsCrossed,
  Layers,
  DollarSign,
  Clock,
  LayoutDashboard,
  Navigation,
  Globe,
  Sliders,
  ChevronLeft,
  FileSpreadsheet,
  Users,
  Store,
  BookOpen,
  Sparkles,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

interface SearchResultItem {
  id: string;
  category: 'page' | 'order' | 'menu' | 'rider' | 'inventory' | 'shift';
  categoryLabelAr: string;
  title: string;
  subtitle: string;
  badge?: string;
  link: string;
  icon: typeof Package;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  initialQuery = '',
}: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { orders, menuItems, inventory, riders, shifts } = useApp();

  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Sync initial query
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Global Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // System Pages Index
  const systemPages: SearchResultItem[] = useMemo(
    () => [
      {
        id: 'page-dashboard',
        category: 'page',
        categoryLabelAr: 'شاشة رئيسية',
        title: 'لوحة التحكم والمؤشرات الرئيسية (Dashboard)',
        subtitle: 'ملخص أداء المطعم، المبيعات اليومية، والطلبات الجارية',
        badge: 'رئيسي',
        link: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'page-orders-live',
        category: 'page',
        categoryLabelAr: 'الطلبات',
        title: 'الطلبات اللحظية (Live Orders)',
        subtitle: 'متابعة الطلبات المباشرة وقنوات البيع وتحديث الحالات',
        badge: 'تشغيل',
        link: '/orders',
        icon: Package,
      },
      {
        id: 'page-pos-new',
        category: 'page',
        categoryLabelAr: 'نقطة بيع',
        title: 'إنشاء طلب جديد (POS / New Order)',
        subtitle: 'تسجيل طلب جديد كاشير أو تيك أواي أو دليفري واختيار الأصناف',
        badge: 'كاشير',
        link: '/orders/new',
        icon: Store,
      },
      {
        id: 'page-kds',
        category: 'page',
        categoryLabelAr: 'المطبخ',
        title: 'شاشة المطبخ الذكية (Kitchen Display System - KDS)',
        subtitle: 'شاشة إعداد الوجبات للطهاة وإدارة التذاكر وترتيب الطهي',
        badge: 'طهي',
        link: '/kds',
        icon: UtensilsCrossed,
      },
      {
        id: 'page-dispatch-assign',
        category: 'page',
        categoryLabelAr: 'توزيع الطلبات',
        title: 'توزيع وإسناد الطلبات (Dispatch Assignment)',
        subtitle: 'تعيين الطلبات الجاهزة للمناديب المتاحين ومطابقة المناطق',
        badge: 'توزيع',
        link: '/dispatch',
        icon: Package,
      },
      {
        id: 'page-dispatch-delivery',
        category: 'page',
        categoryLabelAr: 'المناديب',
        title: 'سجل وأسطول المناديب والتوصيل (Delivery Fleet)',
        subtitle: 'إدارة المناديب، الحالات، مناطق التغطية، والمركبات',
        badge: 'أسطول',
        link: '/dispatch/delivery',
        icon: Bike,
      },
      {
        id: 'page-dispatch-delivery-new',
        category: 'page',
        categoryLabelAr: 'إضافة مندوب',
        title: 'إضافة مندوب جديد للأسطول (Create Rider)',
        subtitle: 'تسجيل وتكوين مندوب جديد وضبط بيانات المركبة والعهد والشيفت',
        badge: 'جديد',
        link: '/dispatch/delivery/new',
        icon: Bike,
      },
      {
        id: 'page-dispatch-tracking',
        category: 'page',
        categoryLabelAr: 'تتبع المناديب',
        title: 'التتبع الحي والمباشر على خريطة Google Maps',
        subtitle: 'متابعة مواقع المناديب وخط السير في الوقت الفعلي',
        badge: 'خريطة',
        link: '/dispatch/tracking',
        icon: Navigation,
      },
      {
        id: 'page-dispatch-custody',
        category: 'page',
        categoryLabelAr: 'العهد المالية',
        title: 'تسوية العهد النقدية للمناديب (Custody)',
        subtitle: 'مطابقة وتسوية المبالغ المحصلة من العملاء والتحصيل النقدي',
        badge: 'مالية',
        link: '/dispatch/custody',
        icon: DollarSign,
      },
      {
        id: 'page-dispatch-delivery-zones',
        category: 'page',
        categoryLabelAr: 'زونات التوصيل',
        title: 'مناطق وزونات التوصيل والأسعار (Delivery Zones)',
        subtitle: 'جدول أسعار التوصيل المعتمد، المسافات، وأوقات التوصيل لـ 22 زون',
        badge: 'زونات',
        link: '/dispatch/delivery-zones',
        icon: MapPin,
      },
      {
        id: 'page-menu',
        category: 'page',
        categoryLabelAr: 'المنيو',
        title: 'إدارة المنيو والأصناف والأسعار (Menu Management)',
        subtitle: 'إضافة الأصناف، تعديل الأسعار، المجموعات، والإضافات',
        badge: 'قائمة',
        link: '/menu',
        icon: BookOpen,
      },
      {
        id: 'page-inventory',
        category: 'page',
        categoryLabelAr: 'المخزون',
        title: 'المخزون والمواد الخام والجرد (Inventory Stock)',
        subtitle: 'تتبع الكميات المتوفرة، حد الطلب الأدنى، وحركات الوارد والمنصرف',
        badge: 'مستودع',
        link: '/inventory',
        icon: Layers,
      },
      {
        id: 'page-inventory-recipes',
        category: 'page',
        categoryLabelAr: 'الوصفات',
        title: 'تركيب الوجبات والوصفات (Recipes & BOM)',
        subtitle: 'ربط وجبات المنيو بالمواد الخام وحساب تكلفة الوجبة الغذائية',
        badge: 'تكلفة',
        link: '/inventory/recipes',
        icon: UtensilsCrossed,
      },
      {
        id: 'page-digital-store',
        category: 'page',
        categoryLabelAr: 'المتجر الإلكتروني',
        title: 'إدارة التطبيق والمتجر الإلكتروني (Digital Store)',
        subtitle: 'بيانات المتجر، العروض الترويجية، ومواعيد العمل',
        badge: 'أونلاين',
        link: '/digital-store',
        icon: Globe,
      },
      {
        id: 'page-digital-store-builder',
        category: 'page',
        categoryLabelAr: 'البناء المرئي',
        title: 'البناء المرئي للمتجر الإلكتروني (Store Visual Builder)',
        subtitle: 'تخصيص بنرات وواجهة تطبيق وموقع المطعم بالمعاينة المباشرة',
        badge: 'تصميم',
        link: '/digital-store/builder',
        icon: Sliders,
      },
      {
        id: 'page-financials-cash-drawer',
        category: 'page',
        categoryLabelAr: 'الخزينة اليومية',
        title: 'الخزينة ودرج النقدية اليومي (Cash Drawer)',
        subtitle: 'رصيد الافتتاح، المقبوضات والمصروفات النقدية، وإغلاق الشيفت',
        badge: 'نقدية',
        link: '/financials/cash-drawer',
        icon: DollarSign,
      },
      {
        id: 'page-financials-coa',
        category: 'page',
        categoryLabelAr: 'دليل الحسابات',
        title: 'دليل وشجرة الحسابات المحاسبية (Chart of Accounts)',
        subtitle: 'الأصول، الخصوم، الإيرادات، والمصروفات التشغيلية',
        badge: 'محاسبة',
        link: '/financials/chart-of-accounts',
        icon: FileSpreadsheet,
      },
      {
        id: 'page-financials-reports',
        category: 'page',
        categoryLabelAr: 'التقارير المالية',
        title: 'التقارير المالية والميزانية وقائمة الدخل (P&L)',
        subtitle: 'صافي الأرباح، الإيرادات، التكاليف التشغيلية، ومؤشرات الأداء',
        badge: 'تقارير',
        link: '/financials/reports',
        icon: FileSpreadsheet,
      },
      {
        id: 'page-shifts-schedule',
        category: 'page',
        categoryLabelAr: 'الورديات',
        title: 'جدولة الورديات والشيفتات (Shift Schedule)',
        subtitle: 'توزيع الموظفين على الورديات الصباحية والمسائية والحضور',
        badge: 'موظفين',
        link: '/shifts/schedule',
        icon: Clock,
      },
      {
        id: 'page-shifts-tasks',
        category: 'page',
        categoryLabelAr: 'المهام',
        title: 'المهام التشغيلية وتسليم الشيفت (Opening & Closing)',
        subtitle: 'قوائم التحقق اليومية للافتتاح والإغلاق ونظافة المحطة',
        badge: 'مهام',
        link: '/shifts/tasks',
        icon: Clock,
      },
      {
        id: 'page-shifts-payroll',
        category: 'page',
        categoryLabelAr: 'الرواتب',
        title: 'كشف الرواتب وساعات العمل (Payroll & Hours)',
        subtitle: 'حساب ساعات العمل الإضافية، الاستقطاعات، ومسيرات الرواتب',
        badge: 'رواتب',
        link: '/shifts/payroll',
        icon: Users,
      },
      {
        id: 'page-users-roles',
        category: 'page',
        categoryLabelAr: 'الصلاحيات',
        title: 'الأدوار ومصفوفة الصلاحيات (Roles & Permissions)',
        subtitle: 'تحديد صلاحيات الكاشير، الشيف، المشرفين، والمديرين',
        badge: 'صلاحيات',
        link: '/users/roles',
        icon: ShieldCheck,
      },
      {
        id: 'page-users-list',
        category: 'page',
        categoryLabelAr: 'المستخدمين',
        title: 'إدارة المستخدمين والحسابات (Users Management)',
        subtitle: 'إضافة، تفعيل، أو إيقاف حسابات مستخدمي النظام',
        badge: 'حسابات',
        link: '/users',
        icon: Users,
      },
    ],
    []
  );

  // Search results compilation across the entire system
  const allResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const results: SearchResultItem[] = [];

    // 1. Pages Search
    systemPages.forEach((page) => {
      if (
        !q ||
        page.title.toLowerCase().includes(q) ||
        page.subtitle.toLowerCase().includes(q) ||
        page.badge?.toLowerCase().includes(q) ||
        page.categoryLabelAr.includes(q)
      ) {
        results.push(page);
      }
    });

    // 2. Orders Search
    orders.forEach((order) => {
      const orderNumMatch = order.orderNumber.toLowerCase().includes(q) || order.id.toLowerCase().includes(q);
      const customerMatch = order.customerName.toLowerCase().includes(q) || order.customerPhone.includes(q);
      const addressMatch = order.address && order.address.toLowerCase().includes(q);
      const itemsMatch = order.items.some(
        (it) => it.name.toLowerCase().includes(q) || it.nameAr.includes(q)
      );

      if (!q || orderNumMatch || customerMatch || addressMatch || itemsMatch) {
        results.push({
          id: `order-${order.id}`,
          category: 'order',
          categoryLabelAr: 'طلب',
          title: `طلب #${order.orderNumber} - ${order.customerName}`,
          subtitle: `${order.items.map((i) => `${i.nameAr} (${i.quantity})`).join(', ')} | ${order.total} ج.م | ${order.address || 'استلام مطعم'}`,
          badge:
            order.status === 'new'
              ? 'طلب جديد'
              : order.status === 'in_kitchen'
              ? 'في المطبخ'
              : order.status === 'ready'
              ? 'جاهز'
              : order.status === 'out_for_delivery'
              ? 'مع المندوب'
              : 'مكتمل',
          link: `/orders/${order.id}`,
          icon: Package,
        });
      }
    });

    // 3. Menu Items Search
    menuItems.forEach((item) => {
      const nameMatch = item.name.toLowerCase().includes(q) || item.nameAr.includes(q);
      const categoryMatch = item.category.toLowerCase().includes(q);
      const descMatch = item.description && item.description.toLowerCase().includes(q);

      if (!q || nameMatch || categoryMatch || descMatch) {
        results.push({
          id: `menu-${item.id}`,
          category: 'menu',
          categoryLabelAr: 'صنف منيو',
          title: `${item.nameAr} (${item.name})`,
          subtitle: `القسم: ${item.category} | السعر: ${item.price} ج.م ${item.description ? `| ${item.description}` : ''}`,
          badge: `${item.price} ج.م`,
          link: '/menu',
          icon: BookOpen,
        });
      }
    });

    // 4. Riders Search
    riders.forEach((rider) => {
      const nameMatch = rider.name.toLowerCase().includes(q) || rider.nameAr.includes(q);
      const phoneMatch = rider.phone.includes(q);
      const zoneMatch = (rider.zoneAr && rider.zoneAr.includes(q)) || (rider.zone && rider.zone.toLowerCase().includes(q));
      const plateMatch = rider.plateNumber && rider.plateNumber.includes(q);

      if (!q || nameMatch || phoneMatch || zoneMatch || plateMatch) {
        results.push({
          id: `rider-${rider.id}`,
          category: 'rider',
          categoryLabelAr: 'مندوب توصيل',
          title: `${rider.nameAr} (${rider.name})`,
          subtitle: `الهاتف: ${rider.phone} | المنطقة: ${rider.zoneAr || rider.zone} | اللوحة: ${rider.plateNumber || 'غير مسجل'} | ${rider.vehicleType || 'دراجة نارية'}`,
          badge:
            rider.status === 'available'
              ? '🟢 متاح'
              : rider.status === 'busy'
              ? '🔵 في مهمة'
              : '⚪ غير متصل',
          link: `/dispatch/delivery/${rider.id}`,
          icon: Bike,
        });
      }
    });

    // 5. Inventory Items Search
    inventory.forEach((inv) => {
      const nameMatch = inv.name.toLowerCase().includes(q) || inv.nameAr.includes(q);
      const skuMatch = inv.sku.toLowerCase().includes(q);
      const categoryMatch = inv.category.toLowerCase().includes(q);

      if (!q || nameMatch || skuMatch || categoryMatch) {
        results.push({
          id: `inv-${inv.id}`,
          category: 'inventory',
          categoryLabelAr: 'مادة خام / مخزون',
          title: `${inv.nameAr} (${inv.name})`,
          subtitle: `كود SKU: ${inv.sku} | القسم: ${inv.category} | الرصيد الحالي: ${inv.currentStock} ${inv.unit} (الحد الأدنى: ${inv.minReorderLevel} ${inv.unit})`,
          badge: `${inv.currentStock} ${inv.unit}`,
          link: '/inventory',
          icon: Layers,
        });
      }
    });

    // 6. Shifts Search
    shifts.forEach((shift) => {
      const empMatch = shift.employeeName.toLowerCase().includes(q) || shift.employeeNameAr.includes(q);
      const roleMatch = shift.role.toLowerCase().includes(q) || shift.roleAr.includes(q);

      if (!q || empMatch || roleMatch) {
        results.push({
          id: `shift-${shift.id}`,
          category: 'shift',
          categoryLabelAr: 'وردية وموظف',
          title: `${shift.employeeNameAr} - ${shift.roleAr}`,
          subtitle: `المواعيد: ${shift.startTime} - ${shift.endTime} | التاريخ: ${shift.date} | الحالة: ${shift.status}`,
          badge: shift.roleAr,
          link: '/shifts/schedule',
          icon: Clock,
        });
      }
    });

    return results;
  }, [query, systemPages, orders, menuItems, inventory, riders, shifts]);

  // Filtered by Category tab
  const filteredResults = useMemo(() => {
    if (activeCategory === 'all') return allResults;
    return allResults.filter((r) => r.category === activeCategory);
  }, [allResults, activeCategory]);

  const handleSelectResult = (item: SearchResultItem) => {
    navigate(item.link);
    onClose();
  };

  const handleKeyDownInList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelectResult(filteredResults[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-md flex items-start justify-center p-4 pt-12 sm:pt-20 text-right animate-fade-in">
      <div
        className="glass-card w-full max-w-3xl border border-navy-700/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-4 border-b border-navy-700/80 bg-navy-900/90 flex items-center gap-3">
          <Search className="w-5 h-5 text-brand-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="ابحث في كامل النظام: برقم الطلب، اسم العميل، الأصناف، المناديب، المخزون، أو الصفحات..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInList}
            className="w-full bg-transparent border-none text-white placeholder-navy-400 text-sm focus:outline-none focus:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-navy-400 hover:text-white"
              title="مسح"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono font-semibold text-navy-300 bg-navy-800 border border-navy-700 rounded-lg">
            ESC
          </kbd>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 p-2 bg-navy-950/40 border-b border-navy-800/80 overflow-x-auto scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
            }`}
          >
            الكل ({allResults.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('page');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'page'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
            }`}
          >
            صفحات النظام
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('order');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'order'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
            }`}
          >
            الطلبات ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('menu');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'menu'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
            }`}
          >
            المنيو ({menuItems.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('rider');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'rider'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
            }`}
          >
            المناديب والتوصيل ({riders.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('inventory');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'inventory'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
            }`}
          >
            المخزون ({inventory.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('shift');
              setSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'shift'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
            }`}
          >
            الورديات ({shifts.length})
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-navy-800/60 p-2 space-y-1">
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-navy-800 text-navy-400 flex items-center justify-center mx-auto border border-navy-700">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-white font-bold text-sm">لا توجد نتائج مطابقة لبحثك</p>
              <p className="text-navy-400 text-xs max-w-sm mx-auto">
                جرب البحث بكلمة مختلفة مثل: برجر، سيد أحمد، #1001، موزاريلا، المطبخ، الخزينة
              </p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-500/15 border border-brand-500/30 text-white'
                      : 'hover:bg-navy-800/60 text-navy-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 border ${
                        isSelected
                          ? 'bg-brand-500 text-white border-brand-400 shadow-md shadow-brand-500/30'
                          : 'bg-navy-800 border-navy-700 text-navy-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-navy-800 text-navy-300 border border-navy-700/80 shrink-0">
                          {item.categoryLabelAr}
                        </span>
                        <h4 className="font-bold text-white text-xs truncate">
                          {item.title}
                        </h4>
                        {item.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-navy-400 truncate max-w-md">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-navy-400 shrink-0 text-xs">
                    <span className="hidden sm:inline text-[11px] text-navy-500">انتقال</span>
                    <ChevronLeft className="w-4 h-4 text-navy-400 group-hover:text-white" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-navy-950/70 border-t border-navy-800/80 flex items-center justify-between text-[11px] text-navy-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-navy-800 border border-navy-700 text-white font-mono text-[10px]">
                ↑↓
              </kbd>
              <span>للتنقل</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-navy-800 border border-navy-700 text-white font-mono text-[10px]">
                Enter
              </kbd>
              <span>للاختيار</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-navy-800 border border-navy-700 text-white font-mono text-[10px]">
                ESC
              </kbd>
              <span>للإغلاق</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-brand-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>بحث شامل في جميع أقسام النظام</span>
          </div>
        </div>
      </div>
    </div>
  );
}
