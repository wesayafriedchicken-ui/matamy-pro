import { useMemo } from 'react';
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
  ShieldCheck,
  Shield,
  Percent,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface NavItem {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: typeof LayoutDashboard;
  path: string;
  requiredPermission?: string;
  active?: boolean;
  subItems?: { id: string; labelAr: string; path: string; icon: typeof LayoutDashboard; requiredPermission?: string }[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', labelAr: 'نظرة عامة', labelEn: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', requiredPermission: 'dashboard.view' },
  {
    id: 'live-orders',
    labelAr: 'الطلبات اللحظية',
    labelEn: 'Live Orders',
    icon: ClipboardList,
    path: '/orders',
    requiredPermission: 'orders.view',
    active: true,
    subItems: [
      { id: 'orders-board', labelAr: 'لوحة الطلبات (Kanban)', path: '/orders', icon: ClipboardList, requiredPermission: 'orders.view' },
      { id: 'orders-new', labelAr: 'إنشاء طلب جديد (POS)', path: '/orders/new', icon: Plus, requiredPermission: 'orders.create' },
    ],
  },
  { id: 'kds', labelAr: 'شاشة المطبخ KDS', labelEn: 'Kitchen Display', icon: ChefHat, path: '/kds', requiredPermission: 'kds.view', active: true },
  {
    id: 'dispatch',
    labelAr: 'المناديب والتوزيع',
    labelEn: 'Dispatch & Tracking',
    icon: Bike,
    path: '/dispatch',
    requiredPermission: 'dispatch.view',
    active: true,
    subItems: [
      { id: 'dispatch-assign', labelAr: 'توزيع الطلبات', path: '/dispatch', icon: Package, requiredPermission: 'dispatch.assign' },
      { id: 'dispatch-delivery', labelAr: 'المناديب (Delivery)', path: '/dispatch/delivery', icon: Bike, requiredPermission: 'dispatch.view' },
      { id: 'dispatch-delivery-new', labelAr: 'إضافة مندوب جديد', path: '/dispatch/delivery/new', icon: UserPlus, requiredPermission: 'dispatch.assign' },
      { id: 'dispatch-tracking', labelAr: 'التتبع المباشر', path: '/dispatch/tracking', icon: Navigation, requiredPermission: 'dispatch.view' },
      { id: 'dispatch-custody', labelAr: 'العهد والخزينة', path: '/dispatch/custody', icon: Scale, requiredPermission: 'dispatch.custody' },
      { id: 'dispatch-delivery-zones', labelAr: 'مناطق وزونات التوصيل', path: '/dispatch/delivery-zones', icon: MapPin, requiredPermission: 'dispatch.assign' },
    ],
  },
  { id: 'menu', labelAr: 'المنيو والأصناف', labelEn: 'Menu & Modifiers', icon: UtensilsCrossed, path: '/menu', requiredPermission: 'menu.manage', active: true },
  { id: 'inventory', labelAr: 'المخزون والوصفات', labelEn: 'Inventory & Recipes', icon: Package, path: '/inventory', requiredPermission: 'inventory.view', active: true },
  { id: 'inventory-recipes', labelAr: 'تركيب الوجبات والوصفات', labelEn: 'Recipe BOM', icon: FlaskConical, path: '/inventory/recipes', requiredPermission: 'inventory.manage', active: true },
  {
    id: 'digital-store',
    labelAr: 'إدارة التطبيق والموقع',
    labelEn: 'Digital Store',
    icon: Store,
    path: '/digital-store',
    requiredPermission: 'digital_store.manage',
    active: true,
    subItems: [
      { id: 'store-dashboard', labelAr: 'لوحة المتجر', path: '/digital-store', icon: Store, requiredPermission: 'digital_store.manage' },
      { id: 'store-builder', labelAr: 'البناء المرئي', path: '/digital-store/builder', icon: Layers, requiredPermission: 'digital_store.manage' },
    ],
  },
  {
    id: 'financials',
    labelAr: 'المالية والخزينة',
    labelEn: 'Financials',
    icon: Wallet,
    path: '/financials/cash-drawer',
    requiredPermission: 'financials.view',
    active: true,
    subItems: [
      { id: 'cash-drawer', labelAr: 'الخزينة اليومية', path: '/financials/cash-drawer', icon: Wallet, requiredPermission: 'financials.manage' },
      { id: 'chart-of-accounts', labelAr: 'دليل الحسابات', path: '/financials/chart-of-accounts', icon: BookOpen, requiredPermission: 'financials.view' },
      { id: 'financial-reports', labelAr: 'التقارير والميزانية', path: '/financials/reports', icon: BarChart3, requiredPermission: 'financials.view' },
      { id: 'tax-settings', labelAr: 'إعدادات الضريبة (VAT)', path: '/financials/tax-settings', icon: Percent, requiredPermission: 'financials.manage' },
    ],
  },
  {
    id: 'hr',
    labelAr: 'الورديات والمهام',
    labelEn: 'HR & Shifts',
    icon: Users,
    path: '/shifts/schedule',
    requiredPermission: 'shifts.manage',
    active: true,
    subItems: [
      { id: 'shift-schedule', labelAr: 'الجدولة والحضور', path: '/shifts/schedule', icon: CalendarClock, requiredPermission: 'shifts.manage' },
      { id: 'shift-employees', labelAr: 'سجل الموظفين والرواتب', path: '/shifts/employees', icon: Users, requiredPermission: 'shifts.manage' },
      { id: 'shift-tasks', labelAr: 'المهام وتسليم الشيفت', path: '/shifts/tasks', icon: CheckSquare, requiredPermission: 'shifts.manage' },
      { id: 'shift-payroll', labelAr: 'الرواتب والساعات', path: '/shifts/payroll', icon: Wallet, requiredPermission: 'shifts.manage' },
    ],
  },
  {
    id: 'users-permissions',
    labelAr: 'المستخدمين والصلاحيات',
    labelEn: 'Users & Permissions',
    icon: ShieldCheck,
    path: '/users/roles',
    requiredPermission: 'roles.manage',
    active: true,
    subItems: [
      { id: 'roles-manage', labelAr: 'الأدوار والصلاحيات', path: '/users/roles', icon: Shield, requiredPermission: 'roles.manage' },
      { id: 'users-list', labelAr: 'المستخدمين والحسابات', path: '/users', icon: Users, requiredPermission: 'users.manage' },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { currentUser, roles, hasPermission } = useApp();

  const currentRole = useMemo(() => {
    return roles.find((r) => r.id === currentUser?.roleId);
  }, [roles, currentUser]);

  const isAdmin = currentUser?.roleId === 'role-admin' || currentRole?.permissions.includes('*');

  // Filter navigation items based on current user role permissions
  const visibleNavItems = useMemo(() => {
    return navItems
      .map((item) => {
        // Super Admin sees all sections unconditionally
        if (isAdmin) return item;

        // Check sub-items permissions
        const permittedSubItems = item.subItems
          ? item.subItems.filter(
              (sub) => !sub.requiredPermission || hasPermission(sub.requiredPermission)
            )
          : undefined;

        // Check parent permission
        const isParentPermitted =
          !item.requiredPermission || hasPermission(item.requiredPermission);

        // Keep item if parent is permitted, OR if it has permitted sub-items
        const hasVisibleSubItems = permittedSubItems && permittedSubItems.length > 0;
        if (!isParentPermitted && !hasVisibleSubItems) {
          return null;
        }

        return {
          ...item,
          subItems: permittedSubItems,
        };
      })
      .filter((item): item is NavItem => item !== null);
  }, [isAdmin, hasPermission]);

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
        {visibleNavItems.map((item) => {
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
              {!collapsed && item.subItems && item.subItems.length > 0 && (
                <div className="mt-1 mr-4 space-y-0.5 border-r border-navy-800/60 pr-2">
                  {item.subItems.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <NavLink
                        key={sub.id}
                        to={sub.path}
                        end={
                          sub.path === '/orders' ||
                          sub.path === '/dispatch' ||
                          sub.path === '/dispatch/delivery' ||
                          sub.path === '/digital-store' ||
                          sub.path === '/shifts/schedule' ||
                          sub.path === '/financials/cash-drawer' ||
                          sub.path === '/users/roles' ||
                          sub.path === '/users'
                        }
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

      {/* Active User & Role Status Pill */}
      {currentUser && (
        <div className="px-3 py-2.5 border-t border-navy-800/60 bg-navy-900/40">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-navy-900/80 border border-navy-800">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.nameAr}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-navy-700"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-navy-950" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.nameAr}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-brand-400 font-semibold truncate bg-brand-500/15 px-1.5 py-0.2 rounded border border-brand-500/20">
                    {currentRole?.nameAr.split(' ')[0] || 'عضو'}
                  </span>
                  <span className="text-[10px] text-navy-400 truncate">
                    {isAdmin ? 'كامل الصلاحيات' : `${currentRole?.permissions.length || 0} صلاحية`}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title={`${currentUser.nameAr} - ${currentRole?.nameAr}`}>
              <div className="relative">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.nameAr}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-navy-700"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-navy-950" />
              </div>
            </div>
          )}
        </div>
      )}

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
