import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  Bike,
  UtensilsCrossed,
  Package,
  Store,
  Wallet,
  Users,
  ChevronLeft,
  FlaskConical,
  Navigation,
  Scale,
  Layers,
  CalendarClock,
  CheckSquare,
  BookOpen,
  BarChart3,
  Plus,
  UserPlus,
  MapPin,
} from 'lucide-react';

interface NavItem {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: typeof LayoutDashboard;
  path: string;
  active?: boolean;
  subItems?: { id: string; labelAr: string; path: string; icon: typeof LayoutDashboard }[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', labelAr: 'نظرة عامة', labelEn: 'Dashboard', icon: LayoutDashboard, path: '/' },
  {
    id: 'live-orders',
    labelAr: 'الطلبات اللحظية',
    labelEn: 'Live Orders',
    icon: ClipboardList,
    path: '/orders',
    active: true,
    subItems: [
      { id: 'orders-board', labelAr: 'لوحة الطلبات (Kanban)', path: '/orders', icon: ClipboardList },
      { id: 'orders-new', labelAr: 'إنشاء طلب جديد (POS)', path: '/orders/new', icon: Plus },
    ],
  },
  { id: 'kds', labelAr: 'شاشة المطبخ KDS', labelEn: 'Kitchen Display', icon: ChefHat, path: '/kds', active: true },
  {
    id: 'dispatch',
    labelAr: 'المناديب والتوزيع',
    labelEn: 'Dispatch & Tracking',
    icon: Bike,
    path: '/dispatch',
    active: true,
    subItems: [
      { id: 'dispatch-assign', labelAr: 'توزيع الطلبات', path: '/dispatch', icon: Package },
      { id: 'dispatch-delivery', labelAr: 'المناديب (Delivery)', path: '/dispatch/delivery', icon: Bike },
      { id: 'dispatch-delivery-new', labelAr: 'إضافة مندوب جديد', path: '/dispatch/delivery/new', icon: UserPlus },
      { id: 'dispatch-tracking', labelAr: 'التتبع المباشر', path: '/dispatch/tracking', icon: Navigation },
      { id: 'dispatch-custody', labelAr: 'العهد والخزينة', path: '/dispatch/custody', icon: Scale },
      { id: 'dispatch-delivery-zones', labelAr: 'مناطق وزونات التوصيل', path: '/dispatch/delivery-zones', icon: MapPin },
    ],
  },
  { id: 'menu', labelAr: 'المنيو والأصناف', labelEn: 'Menu & Modifiers', icon: UtensilsCrossed, path: '/menu', active: true },
  { id: 'inventory', labelAr: 'المخزون والوصفات', labelEn: 'Inventory & Recipes', icon: Package, path: '/inventory', active: true },
  { id: 'inventory-recipes', labelAr: 'تركيب الوجبات والوصفات', labelEn: 'Recipe BOM', icon: FlaskConical, path: '/inventory/recipes', active: true },
  {
    id: 'digital-store',
    labelAr: 'إدارة التطبيق والموقع',
    labelEn: 'Digital Store',
    icon: Store,
    path: '/digital-store',
    active: true,
    subItems: [
      { id: 'store-dashboard', labelAr: 'لوحة المتجر', path: '/digital-store', icon: Store },
      { id: 'store-builder', labelAr: 'البناء المرئي', path: '/digital-store/builder', icon: Layers },
    ],
  },
  {
    id: 'financials',
    labelAr: 'المالية والخزينة',
    labelEn: 'Financials',
    icon: Wallet,
    path: '/financials/cash-drawer',
    active: true,
    subItems: [
      { id: 'cash-drawer', labelAr: 'الخزينة اليومية', path: '/financials/cash-drawer', icon: Wallet },
      { id: 'chart-of-accounts', labelAr: 'دليل الحسابات', path: '/financials/chart-of-accounts', icon: BookOpen },
      { id: 'financial-reports', labelAr: 'التقارير والميزانية', path: '/financials/reports', icon: BarChart3 },
    ],
  },
  {
    id: 'hr',
    labelAr: 'الورديات والمهام',
    labelEn: 'HR & Shifts',
    icon: Users,
    path: '/shifts/schedule',
    active: true,
    subItems: [
      { id: 'shift-schedule', labelAr: 'الجدولة والحضور', path: '/shifts/schedule', icon: CalendarClock },
      { id: 'shift-tasks', labelAr: 'المهام وتسليم الشيفت', path: '/shifts/tasks', icon: CheckSquare },
      { id: 'shift-payroll', labelAr: 'الرواتب والساعات', path: '/shifts/payroll', icon: Wallet },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-72'
      } bg-navy-950 border-l border-navy-800/60 flex flex-col transition-all duration-300 ease-in-out shrink-0`}
    >
      {/* Logo / Brand */}
      <div className="h-20 flex items-center gap-3 px-5 border-b border-navy-800/60">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
          <UtensilsCrossed className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1 className="text-white font-bold text-lg leading-tight">مطعمي برو</h1>
            <p className="text-navy-400 text-xs">Restaurant Operations</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id}>
              <NavLink
                to={item.path}
                end={item.subItems ? true : undefined}
                className={({ isActive }) =>
                  `nav-item ${isActive && !item.subItems ? 'nav-item-active' : ''} ${
                  collapsed ? 'justify-center' : ''
                }`
                }
                title={collapsed ? item.labelAr : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    <span className="font-medium text-sm truncate">{item.labelAr}</span>
                    {item.active && !collapsed && (
                      <span className="w-1.5 h-1.5 rounded-full bg-success-500 shrink-0" />
                    )}
                  </div>
                )}
              </NavLink>

              {/* Sub-items */}
              {!collapsed && item.subItems && (
                <div className="mt-1 mr-4 space-y-0.5 border-r border-navy-800/60 pr-2">
                  {item.subItems.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <NavLink
                        key={sub.id}
                        to={sub.path}
                        end={sub.path === '/orders' || sub.path === '/dispatch' || sub.path === '/dispatch/delivery' || sub.path === '/digital-store' || sub.path === '/shifts/schedule' || sub.path === '/financials/cash-drawer'}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive
                              ? 'bg-brand-500/15 text-brand-400 font-medium'
                              : 'text-navy-400 hover:text-navy-200 hover:bg-navy-800/40'
                          }`
                        }
                      >
                        <SubIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{sub.labelAr}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-navy-800/60">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-navy-400 hover:bg-navy-800 hover:text-white transition-all duration-200"
        >
          <ChevronLeft
            className={`w-5 h-5 transition-transform duration-300 ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
          {!collapsed && <span className="text-sm font-medium">طي القائمة</span>}
        </button>
      </div>
    </aside>
  );
}
