import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Order, MenuItem, InventoryItem, Rider, KdsTicket, Shift, Transaction, AppNotification, Role, AppUser, UserStatus, Employee, ShiftTask, PayrollRecord } from '@/types';
import {
  mockMenuItems,
  mockInventory,
  mockRiders,
} from '@/data/mockData';
import { defaultRoles, defaultUsers } from '@/data/rolesPermissionsData';
import { supabase, checkSupabaseConnection } from '@/lib/supabase';
import {
  dbFetchOrders,
  dbCreateOrder,
  dbUpdateOrder,
  dbDeleteOrder,
  dbUpdateOrderStatus,
  dbAssignRider,
  dbFetchMenuItems,
  dbUpsertMenuItem,
  dbDeleteMenuItem,
  dbFetchInventory,
  dbUpsertInventoryItem,
  dbDeleteInventoryItem,
  dbAdjustStock,
  dbFetchRiders,
  dbCreateRider,
  dbUpdateRider,
  dbDeleteRider,
  dbFetchKdsTickets,
  dbAdvanceKdsTicket,
  dbFetchShifts,
  dbCreateShift,
  dbUpdateShift,
  dbDeleteShift,
  dbFetchEmployees,
  dbUpsertEmployee,
  dbDeleteEmployee,
  dbFetchShiftTasks,
  dbUpsertShiftTask,
  dbDeleteShiftTask,
  dbFetchPayrollRecords,
  dbUpsertPayrollRecord,
  dbFetchTransactions,
  dbCreateTransaction,
  dbDeleteTransaction,
  dbFetchRoles,
  dbUpsertRole,
  dbDeleteRole,
  dbFetchUsers,
  dbUpsertUser,
  dbDeleteUser,
  dbToggleUserStatus,
} from '@/services/databaseService';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export type DbStatus = 'checking' | 'connected' | 'pending_tables' | 'pending_roles_tables' | 'error';

interface AppContextValue {
  orders: Order[];
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  riders: Rider[];
  kdsTickets: KdsTicket[];
  shifts: Shift[];
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  toasts: Toast[];
  dbStatus: DbStatus;
  dbError?: string;
  rolesTableExists: boolean;
  usersTableExists: boolean;
  isDbModalOpen: boolean;
  setIsDbModalOpen: (open: boolean) => void;
  checkConnection: () => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  assignRider: (orderId: string, riderId: string, riderName: string) => void;
  addRider: (rider: Rider) => void;
  updateRider: (rider: Rider) => void;
  deleteRider: (id: string) => void;
  updateRiderStatus: (id: string, status: Rider['status']) => void;
  advanceKdsTicket: (ticketId: string) => void;
  updateMenuItem: (item: MenuItem) => void;
  addMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  deleteAllMenuItems: () => Promise<void>;
  updateInventoryItem: (item: InventoryItem) => void;
  addInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  resetToDefaultMenu: () => Promise<void>;
  resetToDefaultInventory: () => void;
  adjustStock: (itemId: string, delta: number) => void;
  inventoryCategories: InventoryCategoryOption[];
  inventoryUnits: InventoryUnitOption[];
  addInventoryCategory: (labelAr: string, customId?: string) => InventoryCategoryOption;
  addInventoryUnit: (labelAr: string, customId?: string) => InventoryUnitOption;
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  toggleLanguage: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  // Auth & Session
  currentUser: AppUser | null;
  setCurrentUser: (user: AppUser | null) => void;
  login: (usernameOrEmail: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  // Roles Management
  roles: Role[];
  addRole: (role: Role) => Promise<boolean>;
  updateRole: (role: Role) => Promise<boolean>;
  deleteRole: (id: string) => Promise<boolean>;
  getRoleById: (id: string) => Role | undefined;
  // Users Management
  users: AppUser[];
  addUser: (user: AppUser) => Promise<boolean>;
  updateUser: (user: AppUser) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  toggleUserStatus: (id: string, status: UserStatus) => Promise<boolean>;
  hasPermission: (permissionCode: string) => boolean;
  // Tax & VAT Settings
  taxRate: number;
  setTaxRate: (rate: number) => void;
  showZeroVatInCart: boolean;
  setShowZeroVatInCart: (show: boolean) => void;
  // Employees Management (/shifts/employees)
  employees: Employee[];
  addEmployee: (emp: Employee) => Promise<boolean>;
  updateEmployee: (emp: Employee) => Promise<boolean>;
  deleteEmployee: (id: string) => Promise<boolean>;
  getEmployeeById: (id: string) => Employee | undefined;
  // Shifts & Attendance (/shifts/schedule)
  addShift: (shift: Shift) => Promise<boolean>;
  updateShift: (shift: Shift) => Promise<boolean>;
  deleteShift: (id: string) => Promise<boolean>;
  recordAttendance: (shiftId: string, attendance: Partial<Shift>) => Promise<boolean>;
  // Shift Tasks (/shifts/tasks)
  shiftTasks: ShiftTask[];
  addShiftTask: (task: ShiftTask) => Promise<boolean>;
  updateShiftTask: (task: ShiftTask) => Promise<boolean>;
  toggleShiftTask: (id: string) => Promise<boolean>;
  deleteShiftTask: (id: string) => Promise<boolean>;
  // Payroll (/shifts/payroll)
  payrollRecords: PayrollRecord[];
  savePayrollRecord: (record: PayrollRecord) => Promise<boolean>;
  disbursePayroll: (record: PayrollRecord) => Promise<boolean>;
}

export interface InventoryCategoryOption {
  id: string;
  labelAr: string;
}

export interface InventoryUnitOption {
  id: string;
  labelAr: string;
}

export const DEFAULT_INVENTORY_CATEGORIES: InventoryCategoryOption[] = [
  { id: 'spices', labelAr: 'التوابل' },
  { id: 'sauces', labelAr: 'الصوصات' },
  { id: 'bread', labelAr: 'العيش' },
  { id: 'proteins', labelAr: 'البروتينات' },
  { id: 'dairy', labelAr: 'الألبان والجبن' },
  { id: 'vegetables', labelAr: 'الخضار والإضافات' },
  { id: 'raw_materials', labelAr: 'الخامات' },
  { id: 'packaging', labelAr: 'الباكينج ومستلزمات التشغيل' },
];

export const DEFAULT_INVENTORY_UNITS: InventoryUnitOption[] = [
  // وحدات الشراء والتخزين (Purchase / Storage Units)
  { id: 'basket', labelAr: 'باسكت' },
  { id: 'carton', labelAr: 'كرتونة' },
  { id: 'jerrycan', labelAr: 'جيركن' },
  { id: 'bag', labelAr: 'كيس' },
  { id: 'gallon', labelAr: 'جالون' },
  { id: 'pack', labelAr: 'عبوة / باكت' },
  { id: 'box', labelAr: 'صندوق' },
  { id: 'can', labelAr: 'علبة' },
  { id: 'roll', labelAr: 'بكرة' },
  { id: 'sheet', labelAr: 'فرخ / ورقة' },
  // وحدات الاستهلاك والوصفات (Recipe / Base Units)
  { id: 'pcs', labelAr: 'قطعة' },
  { id: 'grams', labelAr: 'جرام' },
  { id: 'ml', labelAr: 'مللي' },
  { id: 'slice', labelAr: 'شريحة' },
  { id: 'kg', labelAr: 'كيلو' },
  { id: 'liters', labelAr: 'لتر' },
];

const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'طلب جديد #1005',
    titleAr: 'طلب جديد #1005',
    message: 'طلب عائلي جديد مستلم عبر تطبيق المطعم بقيمة 435 ج.م',
    messageAr: 'طلب عائلي جديد مستلم عبر تطبيق المطعم بقيمة 435 ج.م',
    type: 'order',
    timestamp: 'منذ دقيقتين',
    read: false,
    link: '/orders/o5',
  },
  {
    id: 'notif-2',
    title: 'تنبيه هبوط المخزون',
    titleAr: 'تنبيه هبوط المخزون',
    message: 'صنف (جبنة موتزاريلا) وصل للحد الأدنى (المتبقي: 12 كجم)',
    messageAr: 'صنف (جبنة موتزاريلا) وصل للحد الأدنى (المتبقي: 12 كجم)',
    type: 'inventory',
    timestamp: 'منذ 10 دقائق',
    read: false,
    link: '/inventory',
  },
  {
    id: 'notif-3',
    title: 'تذكرة مطبخ جاهزة #1002',
    titleAr: 'تذكرة مطبخ جاهزة #1002',
    message: 'المطبخ أتم تحضير وجبة كريسبي تشيكن جاهزة للاستلام',
    messageAr: 'المطبخ أتم تحضير وجبة كريسبي تشيكن جاهزة للاستلام',
    type: 'kds',
    timestamp: 'منذ 18 دقيقة',
    read: false,
    link: '/kds',
  },
  {
    id: 'notif-4',
    title: 'مهمة توصيل جديدة',
    titleAr: 'مهمة توصيل جديدة',
    message: 'المندوب سيد أحمد خرج لتوصيل الطلب إلى منطقة مدينة نصر',
    messageAr: 'المندوب سيد أحمد خرج لتوصيل الطلب إلى منطقة مدينة نصر',
    type: 'delivery',
    timestamp: 'منذ 30 دقيقة',
    read: true,
    link: '/dispatch/tracking',
  },
  {
    id: 'notif-5',
    title: 'إيداع نقدي في الخزينة',
    titleAr: 'إيداع نقدي في الخزينة',
    message: 'تم تسوية عهدة نقدية وإيداع 1,250 ج.م في درج الكاشير',
    messageAr: 'تم تسوية عهدة نقدية وإيداع 1,250 ج.م في درج الكاشير',
    type: 'finance',
    timestamp: 'منذ ساعة',
    read: true,
    link: '/financials/cash-drawer',
  },
];

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('nine_fries_orders_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return []; // Zero fake orders
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [riders, setRiders] = useState<Rider[]>(mockRiders);
  const [kdsTickets, setKdsTickets] = useState<KdsTicket[]>(() => {
    try {
      const saved = localStorage.getItem('nine_fries_kds_tickets_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return []; // Zero fake KDS tickets
  });
  const [shifts, setShifts] = useState<Shift[]>(() => {
    try {
      const saved = localStorage.getItem('nine_fries_shifts_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return []; // Completely zeroed out - no fake shifts
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('app_employees_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return []; // Completely zeroed out - no fake employees
  });

  const [shiftTasks, setShiftTasks] = useState<ShiftTask[]>(() => {
    try {
      const saved = localStorage.getItem('app_shift_tasks_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return []; // Completely zeroed out - no fake tasks
  });

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => {
    try {
      const saved = localStorage.getItem('app_payroll_records_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return []; // Completely zeroed out - no fake payroll
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('nine_fries_transactions_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return []; // Completely zeroed out - no fake transactions
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatus>('checking');
  const [dbError, setDbError] = useState<string | undefined>();
  const [rolesTableExists, setRolesTableExists] = useState(false);
  const [usersTableExists, setUsersTableExists] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // VAT / Sales Tax Rate State (defaults to 0%)
  const [taxRate, setTaxRateState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nine_fries_vat_rate_v1');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return 0; // Default VAT is 0%
  });

  const setTaxRate = useCallback((rate: number) => {
    const cleanRate = Math.max(0, Math.min(100, Math.round(rate * 100) / 100));
    setTaxRateState(cleanRate);
    try {
      localStorage.setItem('nine_fries_vat_rate_v1', String(cleanRate));
    } catch {
      // ignore
    }
  }, []);

  // Show/Hide VAT line in Cart when 0%
  const [showZeroVatInCart, setShowZeroVatInCartState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nine_fries_show_zero_vat_v1');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // fallback
    }
    return false; // Hidden by default when 0%
  });

  const setShowZeroVatInCart = useCallback((show: boolean) => {
    setShowZeroVatInCartState(show);
    try {
      localStorage.setItem('nine_fries_show_zero_vat_v1', String(show));
    } catch {
      // ignore
    }
  }, []);

  // Roles & Permissions State
  const [roles, setRoles] = useState<Role[]>(() => {
    try {
      const saved = localStorage.getItem('app_roles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse roles:', e);
    }
    return defaultRoles;
  });

  // App Users State
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem('app_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse users:', e);
    }
    return defaultUsers;
  });

  // Current Logged-in User Session State
  const [currentUser, setCurrentUserState] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('app_current_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse current user:', e);
    }
    return defaultUsers[0] || null;
  });

  const setCurrentUser = useCallback((user: AppUser | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('app_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('app_current_user');
    }
  }, []);

  // Inventory Custom Categories and Units State
  const [inventoryCategories, setInventoryCategories] = useState<InventoryCategoryOption[]>(() => {
    const saved = localStorage.getItem('app_inventory_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed to parse inventory categories:', e);
      }
    }
    return DEFAULT_INVENTORY_CATEGORIES;
  });

  const [inventoryUnits, setInventoryUnits] = useState<InventoryUnitOption[]>(() => {
    const saved = localStorage.getItem('app_inventory_units');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed to parse inventory units:', e);
      }
    }
    return DEFAULT_INVENTORY_UNITS;
  });

  // Language State
  const [language, setLanguageState] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('app_language') as 'ar' | 'en') || 'ar';
  });

  const setLanguage = useCallback((lang: 'ar' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const toggleLanguage = useCallback(() => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
    showToast(
      nextLang === 'ar' ? 'تم تحويل لغة النظام إلى العربية' : 'Language switched to English',
      'info'
    );
  }, [language, setLanguage, showToast]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Theme State
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark';
  });

  const setTheme = useCallback((t: 'dark' | 'light') => {
    setThemeState(t);
    localStorage.setItem('app_theme', t);
    if (t === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(
      nextTheme === 'light' ? 'تم تفعيل الوضع النهاري (Light Mode)' : 'تم تفعيل الوضع الليلي (Dark Mode)',
      'info'
    );
  }, [theme, setTheme, showToast]);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('app_notifications');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialNotifications;
  });

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem('app_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem('app_notifications', JSON.stringify(updated));
      return updated;
    });
    showToast('تم تحديد جميع الإشعارات كمقروءة', 'info');
  }, [showToast]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.setItem('app_notifications', JSON.stringify([]));
    showToast('تم مسح جميع الإشعارات', 'info');
  }, [showToast]);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'الآن',
      read: false,
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('app_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Global Search Palette State
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check database and load data if tables exist
  const loadDataFromDb = useCallback(async () => {
    try {
      const [
        dbOrders,
        dbMenu,
        dbInv,
        dbRiders,
        dbTickets,
        dbShiftsList,
        dbTxs,
        dbRolesList,
        dbUsersList,
        dbEmployeesList,
        dbShiftTasksList,
        dbPayrollList,
      ] = await Promise.all([
        dbFetchOrders(),
        dbFetchMenuItems(),
        dbFetchInventory(),
        dbFetchRiders(),
        dbFetchKdsTickets(),
        dbFetchShifts(),
        dbFetchTransactions(),
        dbFetchRoles(),
        dbFetchUsers(),
        dbFetchEmployees(),
        dbFetchShiftTasks(),
        dbFetchPayrollRecords(),
      ]);

      if (dbOrders) {
        setOrders(dbOrders);
        localStorage.setItem('nine_fries_orders_v2', JSON.stringify(dbOrders));
      }
      if (dbMenu && dbMenu.length > 0) setMenuItems(dbMenu);
      if (dbInv && dbInv.length > 0) setInventory(dbInv);
      if (dbRiders && dbRiders.length > 0) setRiders(dbRiders);
      if (dbTickets) {
        setKdsTickets(dbTickets);
        localStorage.setItem('nine_fries_kds_tickets_v2', JSON.stringify(dbTickets));
      }
      if (dbShiftsList) {
        setShifts(dbShiftsList);
        localStorage.setItem('nine_fries_shifts_v2', JSON.stringify(dbShiftsList));
      }
      if (dbEmployeesList) {
        setEmployees(dbEmployeesList);
        localStorage.setItem('app_employees_v1', JSON.stringify(dbEmployeesList));
      }
      if (dbShiftTasksList) {
        setShiftTasks(dbShiftTasksList);
        localStorage.setItem('app_shift_tasks_v1', JSON.stringify(dbShiftTasksList));
      }
      if (dbPayrollList) {
        setPayrollRecords(dbPayrollList);
        localStorage.setItem('app_payroll_records_v1', JSON.stringify(dbPayrollList));
      }
      if (dbTxs) {
        setTransactions(dbTxs);
        localStorage.setItem('nine_fries_transactions_v2', JSON.stringify(dbTxs));
      }
      if (dbRolesList && dbRolesList.length > 0) {
        setRoles(dbRolesList);
        localStorage.setItem('app_roles', JSON.stringify(dbRolesList));
      }
      if (dbUsersList && dbUsersList.length > 0) {
        setUsers(dbUsersList);
        localStorage.setItem('app_users', JSON.stringify(dbUsersList));
      }
    } catch (e: unknown) {
      console.warn('Error loading data from Supabase:', e);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    setDbStatus('checking');
    const result = await checkSupabaseConnection();
    setRolesTableExists(result.rolesTableExists);
    setUsersTableExists(result.usersTableExists);

    if (result.connected && result.tablesExist && result.rolesTableExists && result.usersTableExists) {
      setDbStatus('connected');
      setDbError(undefined);
      await loadDataFromDb();
    } else if (result.connected && result.tablesExist && (!result.rolesTableExists || !result.usersTableExists)) {
      setDbStatus('pending_roles_tables');
      setDbError(result.error);
      await loadDataFromDb();
    } else if (result.connected && !result.tablesExist) {
      setDbStatus('pending_tables');
      setDbError(result.error);
    } else {
      setDbStatus('error');
      setDbError(result.error || 'فشل الاتصال بقاعدة البيانات');
    }
  }, [loadDataFromDb]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Realtime subscription when tables are connected
  useEffect(() => {
    if (dbStatus !== 'connected') return;

    const channel = supabase
      .channel('app-realtime-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async () => {
          const freshOrders = await dbFetchOrders();
          if (freshOrders) {
            setOrders(freshOrders);
            localStorage.setItem('nine_fries_orders_v2', JSON.stringify(freshOrders));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kds_tickets' },
        async () => {
          const freshTickets = await dbFetchKdsTickets();
          if (freshTickets) {
            setKdsTickets(freshTickets);
            localStorage.setItem('nine_fries_kds_tickets_v2', JSON.stringify(freshTickets));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        async () => {
          const freshMenu = await dbFetchMenuItems();
          if (freshMenu) setMenuItems(freshMenu);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        async () => {
          const freshInv = await dbFetchInventory();
          if (freshInv) setInventory(freshInv);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        async () => {
          const freshTxs = await dbFetchTransactions();
          if (freshTxs) {
            setTransactions(freshTxs);
            localStorage.setItem('nine_fries_transactions_v2', JSON.stringify(freshTxs));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'roles' },
        async () => {
          const freshRoles = await dbFetchRoles();
          if (freshRoles) {
            setRoles(freshRoles);
            localStorage.setItem('app_roles', JSON.stringify(freshRoles));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_users' },
        async () => {
          const freshUsers = await dbFetchUsers();
          if (freshUsers) {
            setUsers(freshUsers);
            localStorage.setItem('app_users', JSON.stringify(freshUsers));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dbStatus]);

  // Actions with Supabase synchronization
  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      const updated = [order, ...prev];
      try {
        localStorage.setItem('nine_fries_orders_v2', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Automatically create a KDS ticket if order is in kitchen or new
    if (order.status !== 'completed' && order.status !== 'cancelled') {
      const newTicket: KdsTicket = {
        id: `kds-${order.id}-${Date.now()}`,
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          nameAr: item.nameAr || item.name,
          quantity: item.quantity,
          notes: order.notes,
          modifiers: item.modifiers?.map((m) => (typeof m === 'string' ? m : m.nameAr || m.name)),
        })),
        createdAt: order.createdAt || new Date().toISOString(),
        status: 'preparing',
        priority: false,
        station: 'Kitchen',
        stationAr: 'المطبخ والتحضير',
      };
      setKdsTickets((prev) => {
        const updatedTickets = [...prev, newTicket];
        try {
          localStorage.setItem('nine_fries_kds_tickets_v2', JSON.stringify(updatedTickets));
        } catch {
          // ignore
        }
        return updatedTickets;
      });
    }

    showToast(`تم إنشاء الطلب ${order.orderNumber} بنجاح`, 'success');
    dbCreateOrder(order);
  }, [showToast]);

  const updateOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === order.id ? { ...order, updatedAt: new Date().toISOString() } : o));
      try {
        localStorage.setItem('nine_fries_orders_v2', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    showToast(`تم تعديل الطلب ${order.orderNumber} بنجاح`, 'success');
    dbUpdateOrder(order);
  }, [showToast]);

  const deleteOrder = useCallback((orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      try {
        localStorage.setItem('nine_fries_orders_v2', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setKdsTickets((prev) => {
      const updatedTickets = prev.filter((t) => !t.id.includes(orderId) && t.orderNumber !== orderId);
      try {
        localStorage.setItem('nine_fries_kds_tickets_v2', JSON.stringify(updatedTickets));
      } catch {
        // ignore
      }
      return updatedTickets;
    });
    showToast('تم حذف الطلب بنجاح', 'info');
    dbDeleteOrder(orderId);
  }, [showToast]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o,
      );
      try {
        localStorage.setItem('nine_fries_orders_v2', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (status === 'completed' || status === 'cancelled') {
      setKdsTickets((prev) => {
        const updatedTickets = prev.filter((t) => !t.id.includes(orderId) && t.orderNumber !== orderId);
        try {
          localStorage.setItem('nine_fries_kds_tickets_v2', JSON.stringify(updatedTickets));
        } catch {
          // ignore
        }
        return updatedTickets;
      });
    }

    dbUpdateOrderStatus(orderId, status);
  }, []);

  const assignRider = useCallback((orderId: string, riderId: string, riderName: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId ? { ...o, riderId, riderName } : o,
      );
      try {
        localStorage.setItem('nine_fries_orders_v2', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    showToast(`تم تعيين السائق ${riderName} للطلب`, 'info');
    dbAssignRider(orderId, riderId, riderName);
  }, [showToast]);

  const addRider = useCallback((rider: Rider) => {
    setRiders((prev) => [...prev, rider]);
    showToast(`تمت إضافة المندوب ${rider.nameAr} بنجاح`, 'success');
    dbCreateRider(rider);
  }, [showToast]);

  const updateRider = useCallback((rider: Rider) => {
    setRiders((prev) => prev.map((r) => (r.id === rider.id ? rider : r)));
    showToast(`تم تحديث بيانات المندوب ${rider.nameAr}`, 'success');
    dbUpdateRider(rider);
  }, [showToast]);

  const deleteRider = useCallback((id: string) => {
    setRiders((prev) => prev.filter((r) => r.id !== id));
    showToast('تم حذف المندوب من الأسطول', 'info');
    dbDeleteRider(id);
  }, [showToast]);

  const updateRiderStatus = useCallback((id: string, status: Rider['status']) => {
    setRiders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, status };
          dbUpdateRider(updated);
          return updated;
        }
        return r;
      })
    );
    const statusLabels: Record<Rider['status'], string> = {
      available: 'متاح للطلبات',
      busy: 'في مهمة توصيل',
      offline: 'غير متصل',
    };
    showToast(`تم تغيير حالة المندوب إلى ${statusLabels[status]}`, 'info');
  }, [showToast]);

  const advanceKdsTicket = useCallback((ticketId: string) => {
    setKdsTickets((prev) => {
      const updated = prev.filter((t) => t.id !== ticketId);
      try {
        localStorage.setItem('nine_fries_kds_tickets_v2', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    dbAdvanceKdsTicket(ticketId);
  }, []);

  const updateMenuItem = useCallback((item: MenuItem) => {
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));
    showToast(`تم تحديث الصنف ${item.nameAr}`, 'success');
    dbUpsertMenuItem(item);
  }, [showToast]);

  const addMenuItem = useCallback((item: MenuItem) => {
    setMenuItems((prev) => [...prev, item]);
    showToast(`تمت إضافة الصنف ${item.nameAr}`, 'success');
    dbUpsertMenuItem(item);
  }, [showToast]);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    showToast('تم حذف الصنف', 'info');
    dbDeleteMenuItem(id);
  }, [showToast]);

  const updateInventoryItem = useCallback((item: InventoryItem) => {
    setInventory((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    showToast(`تم تحديث المخزون: ${item.nameAr}`, 'success');
    dbUpsertInventoryItem(item);
  }, [showToast]);

  const addInventoryItem = useCallback((item: InventoryItem) => {
    setInventory((prev) => [...prev, item]);
    showToast(`تمت إضافة المادة: ${item.nameAr}`, 'success');
    dbUpsertInventoryItem(item);
  }, [showToast]);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
    showToast('تم حذف المادة من المخزون', 'info');
    dbDeleteInventoryItem(id);
  }, [showToast]);

  const deleteAllMenuItems = useCallback(async () => {
    setMenuItems([]);
    showToast('تم مسح جميع أصناف المنيو بنجاح', 'info');
    try {
      await supabase.from('menu_items').delete().neq('id', '___safe___');
    } catch (e) {
      console.warn('Error deleting all menu items from Supabase:', e);
    }
  }, [showToast]);

  const resetToDefaultMenu = useCallback(async () => {
    setMenuItems(mockMenuItems);
    showToast(`تم مسح المنيو واستعادة منيو ناين فرايز الرسمي (${mockMenuItems.length} صنف) بنجاح`, 'success');
    try {
      await supabase.from('menu_items').delete().neq('id', '___safe___');
      for (const item of mockMenuItems) {
        await dbUpsertMenuItem(item);
      }
    } catch (e) {
      console.warn('Error resetting menu items in Supabase:', e);
    }
  }, [showToast]);

  const resetToDefaultInventory = useCallback(() => {
    setInventory(mockInventory);
    showToast('تمت استعادة قائمة المواد الخام الرسمية (45 مادة) بنجاح', 'success');
    mockInventory.forEach((item) => {
      dbUpsertInventoryItem(item);
    });
  }, [showToast]);

  const adjustStock = useCallback((itemId: string, delta: number) => {
    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const newStock = Math.max(0, Math.round((i.currentStock + delta) * 100) / 100);
          dbAdjustStock(itemId, newStock);
          return { ...i, currentStock: newStock };
        }
        return i;
      }),
    );
  }, []);

  const addInventoryCategory = useCallback(
    (labelAr: string, customId?: string) => {
      const trimmed = labelAr.trim();
      const existing = inventoryCategories.find(
        (c) => c.labelAr.toLowerCase() === trimmed.toLowerCase() || (customId && c.id === customId),
      );
      if (existing) return existing;

      const id = customId && customId.trim() ? customId.trim() : `cat_${Date.now()}`;
      const newCat: InventoryCategoryOption = { id, labelAr: trimmed };
      setInventoryCategories((prev) => {
        const updated = [...prev, newCat];
        localStorage.setItem('app_inventory_categories', JSON.stringify(updated));
        return updated;
      });
      showToast(`تمت إضافة التصنيف الجديد: "${trimmed}" بنجاح`, 'success');
      return newCat;
    },
    [inventoryCategories, showToast],
  );

  const addInventoryUnit = useCallback(
    (labelAr: string, customId?: string) => {
      const trimmed = labelAr.trim();
      const existing = inventoryUnits.find(
        (u) => u.labelAr.toLowerCase() === trimmed.toLowerCase() || (customId && u.id === customId),
      );
      if (existing) return existing;

      const id = customId && customId.trim() ? customId.trim() : `unit_${Date.now()}`;
      const newUnit: InventoryUnitOption = { id, labelAr: trimmed };
      setInventoryUnits((prev) => {
        const updated = [...prev, newUnit];
        localStorage.setItem('app_inventory_units', JSON.stringify(updated));
        return updated;
      });
      showToast(`تمت إضافة وحدة القياس الجديدة: "${trimmed}" بنجاح`, 'success');
      return newUnit;
    },
    [inventoryUnits, showToast],
  );

  // ==========================================
  // Auth & Session Handlers
  // ==========================================
  const login = useCallback(
    async (usernameOrEmail: string, password?: string): Promise<{ success: boolean; error?: string }> => {
      const trimmed = usernameOrEmail.trim().toLowerCase();
      const foundUser = users.find(
        (u) =>
          u.username.toLowerCase() === trimmed ||
          u.email.toLowerCase() === trimmed ||
          u.phone.includes(trimmed),
      );

      if (!foundUser) {
        showToast('اسم المستخدم أو البريد الإلكتروني غير مسجل بالمنظومة', 'warning');
        return { success: false, error: 'اسم المستخدم أو البريد الإلكتروني غير مسجل بالمنظومة' };
      }

      if (foundUser.status === 'suspended') {
        showToast('هذا الحساب موقوف حالياً من قبل الإدارة', 'warning');
        return { success: false, error: 'هذا الحساب موقوف حالياً من قبل الإدارة، يرجى مراجعة المسؤول' };
      }

      if (password && foundUser.password && foundUser.password !== password) {
        showToast('كلمة المرور غير صحيحة', 'warning');
        return { success: false, error: 'كلمة المرور المدخلة غير صحيحة، يرجى إعادة المحاولة' };
      }

      const updatedUser: AppUser = {
        ...foundUser,
        lastLogin: 'الآن',
        updatedAt: new Date().toISOString(),
      };

      setCurrentUser(updatedUser);
      setUsers((prev) => {
        const nextUsers = prev.map((u) => (u.id === foundUser.id ? updatedUser : u));
        localStorage.setItem('app_users', JSON.stringify(nextUsers));
        return nextUsers;
      });

      dbUpsertUser(updatedUser);
      showToast(`مرحباً بعودتك، ${foundUser.nameAr}!`, 'success');
      return { success: true };
    },
    [users, setCurrentUser, showToast],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    showToast('تم تسجيل الخروج بنجاح', 'info');
  }, [setCurrentUser, showToast]);

  // ==========================================
  // Roles Handlers
  // ==========================================
  const addRole = useCallback(
    async (newRole: Role): Promise<boolean> => {
      setRoles((prev) => {
        const updated = [...prev, newRole];
        localStorage.setItem('app_roles', JSON.stringify(updated));
        return updated;
      });
      showToast(`تمت إضافة الدور "${newRole.nameAr}" بنجاح`, 'success');
      return await dbUpsertRole(newRole);
    },
    [showToast],
  );

  const updateRole = useCallback(
    async (updatedRole: Role): Promise<boolean> => {
      setRoles((prev) => {
        const updated = prev.map((r) => (r.id === updatedRole.id ? updatedRole : r));
        localStorage.setItem('app_roles', JSON.stringify(updated));
        return updated;
      });
      showToast(`تم تحديث صلاحيات الدور "${updatedRole.nameAr}"`, 'success');
      return await dbUpsertRole(updatedRole);
    },
    [showToast],
  );

  const deleteRole = useCallback(
    async (id: string): Promise<boolean> => {
      const roleToDelete = roles.find((r) => r.id === id);
      if (!roleToDelete) return false;
      if (roleToDelete.isSystem) {
        showToast('لا يمكن حذف أدوار النظام الأساسية للحفاظ على استقرار الصلاحيات', 'warning');
        return false;
      }
      const assignedUsersCount = users.filter((u) => u.roleId === id).length;
      if (assignedUsersCount > 0) {
        showToast(`لا يمكن حذف هذا الدور لأنه مرتبط حالياً بـ ${assignedUsersCount} مستخدم`, 'warning');
        return false;
      }
      setRoles((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        localStorage.setItem('app_roles', JSON.stringify(updated));
        return updated;
      });
      showToast(`تم حذف الدور "${roleToDelete.nameAr}" بنجاح`, 'info');
      return await dbDeleteRole(id);
    },
    [roles, users, showToast],
  );

  const getRoleById = useCallback(
    (id: string) => {
      return roles.find((r) => r.id === id);
    },
    [roles],
  );

  // ==========================================
  // Users Handlers
  // ==========================================
  const addUser = useCallback(
    async (newUser: AppUser): Promise<boolean> => {
      setUsers((prev) => {
        const updated = [newUser, ...prev];
        localStorage.setItem('app_users', JSON.stringify(updated));
        return updated;
      });
      showToast(`تم إنشاء حساب المستخدم "${newUser.nameAr}" بنجاح`, 'success');
      return await dbUpsertUser(newUser);
    },
    [showToast],
  );

  const updateUser = useCallback(
    async (updatedUser: AppUser): Promise<boolean> => {
      setUsers((prev) => {
        const updated = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
        localStorage.setItem('app_users', JSON.stringify(updated));
        return updated;
      });
      if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
      }
      showToast(`تم تحديث بيانات المستخدم "${updatedUser.nameAr}"`, 'success');
      return await dbUpsertUser(updatedUser);
    },
    [currentUser, setCurrentUser, showToast],
  );

  const deleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      if (currentUser?.id === id) {
        showToast('لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول به', 'warning');
        return false;
      }
      const userToDelete = users.find((u) => u.id === id);
      setUsers((prev) => {
        const updated = prev.filter((u) => u.id !== id);
        localStorage.setItem('app_users', JSON.stringify(updated));
        return updated;
      });
      showToast(`تم حذف المستخدم "${userToDelete?.nameAr || id}"`, 'info');
      return await dbDeleteUser(id);
    },
    [currentUser, users, showToast],
  );

  const toggleUserStatus = useCallback(
    async (id: string, newStatus: UserStatus): Promise<boolean> => {
      const targetUser = users.find((u) => u.id === id);
      if (!targetUser) return false;
      if (currentUser?.id === id && newStatus === 'suspended') {
        showToast('لا يمكنك إيقاف حسابك الحالي المسجل به الدخول الآن', 'warning');
        return false;
      }
      setUsers((prev) => {
        const updated = prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u));
        localStorage.setItem('app_users', JSON.stringify(updated));
        return updated;
      });
      if (currentUser?.id === id) {
        setCurrentUser({ ...currentUser, status: newStatus });
      }
      showToast(
        newStatus === 'active'
          ? `تم تفعيل حساب ${targetUser.nameAr} بنجاح`
          : `تم إيقاف حساب ${targetUser.nameAr} مؤقتاً`,
        newStatus === 'active' ? 'success' : 'warning',
      );
      return await dbToggleUserStatus(id, newStatus);
    },
    [currentUser, users, setCurrentUser, showToast],
  );

  const hasPermission = useCallback(
    (permissionCode: string): boolean => {
      if (!currentUser) return false;
      const userRole = roles.find((r) => r.id === currentUser.roleId);
      if (!userRole) return false;
      if (userRole.id === 'role-admin' || userRole.permissions.includes('*')) return true;
      return userRole.permissions.includes(permissionCode);
    },
    [currentUser, roles],
  );

  // ==========================================
  // Financial Transactions Handlers
  // ==========================================
  const addTransaction = useCallback(
    async (tx: Transaction): Promise<boolean> => {
      setTransactions((prev) => {
        const updated = [tx, ...prev];
        try {
          localStorage.setItem('nine_fries_transactions_v2', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      return await dbCreateTransaction(tx);
    },
    [],
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<boolean> => {
      setTransactions((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        try {
          localStorage.setItem('nine_fries_transactions_v2', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      return await dbDeleteTransaction(id);
    },
    [],
  );

  // ==========================================
  // Employees Handlers (/shifts/employees)
  // ==========================================
  const addEmployee = useCallback(
    async (emp: Employee): Promise<boolean> => {
      setEmployees((prev) => {
        const updated = [emp, ...prev];
        try {
          localStorage.setItem('app_employees_v1', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      showToast(`تمت إضافة الموظف "${emp.nameAr}" بنجاح`, 'success');
      return await dbUpsertEmployee(emp);
    },
    [showToast],
  );

  const updateEmployee = useCallback(
    async (emp: Employee): Promise<boolean> => {
      setEmployees((prev) => {
        const updated = prev.map((e) => (e.id === emp.id ? emp : e));
        try {
          localStorage.setItem('app_employees_v1', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      showToast(`تم تحديث بيانات الموظف "${emp.nameAr}" بنجاح`, 'success');
      return await dbUpsertEmployee(emp);
    },
    [showToast],
  );

  const deleteEmployee = useCallback(
    async (id: string): Promise<boolean> => {
      const emp = employees.find((e) => e.id === id);
      setEmployees((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        try {
          localStorage.setItem('app_employees_v1', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      showToast(`تم حذف الموظف "${emp?.nameAr || id}"`, 'info');
      return await dbDeleteEmployee(id);
    },
    [employees, showToast],
  );

  const getEmployeeById = useCallback(
    (id: string) => {
      return employees.find((e) => e.id === id);
    },
    [employees],
  );

  // ==========================================
  // Shifts Handlers (/shifts/schedule)
  // ==========================================
  const addShift = useCallback(
    async (shift: Shift): Promise<boolean> => {
      setShifts((prev) => {
        const updated = [shift, ...prev];
        try {
          localStorage.setItem('nine_fries_shifts_v2', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      showToast(`تمت جدولة وردية لـ ${shift.employeeNameAr}`, 'success');
      return await dbCreateShift(shift);
    },
    [showToast],
  );

  const updateShift = useCallback(
    async (shift: Shift): Promise<boolean> => {
      setShifts((prev) => {
        const updated = prev.map((s) => (s.id === shift.id ? shift : s));
        try {
          localStorage.setItem('nine_fries_shifts_v2', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      showToast(`تم تحديث بيانات وردية ${shift.employeeNameAr}`, 'success');
      return await dbUpdateShift(shift);
    },
    [showToast],
  );

  const deleteShift = useCallback(
    async (id: string): Promise<boolean> => {
      setShifts((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        try {
          localStorage.setItem('nine_fries_shifts_v2', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      showToast('تم حذف الوردية من الجدول', 'info');
      return await dbDeleteShift(id);
    },
    [showToast],
  );

  const recordAttendance = useCallback(
    async (shiftId: string, attendance: Partial<Shift>): Promise<boolean> => {
      const shift = shifts.find((s) => s.id === shiftId);
      if (!shift) return false;
      const updated: Shift = {
        ...shift,
        ...attendance,
      };
      setShifts((prev) => {
        const list = prev.map((s) => (s.id === shiftId ? updated : s));
        try {
          localStorage.setItem('nine_fries_shifts_v2', JSON.stringify(list));
        } catch {
          // ignore
        }
        return list;
      });
      showToast(`تم تسجيل الحضور/الانصراف لـ ${shift.employeeNameAr}`, 'success');
      return await dbUpdateShift(updated);
    },
    [shifts, showToast],
  );

  // ==========================================
  // Shift Tasks Handlers (/shifts/tasks)
  // ==========================================
  const addShiftTask = useCallback(
    async (task: ShiftTask): Promise<boolean> => {
      setShiftTasks((prev) => {
        const updated = [...prev, task];
        try {
          localStorage.setItem('app_shift_tasks_v1', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      showToast('تمت إضافة مهمة الشيفت بنجاح', 'success');
      return await dbUpsertShiftTask(task);
    },
    [showToast],
  );

  const updateShiftTask = useCallback(
    async (task: ShiftTask): Promise<boolean> => {
      setShiftTasks((prev) => {
        const updated = prev.map((t) => (t.id === task.id ? task : t));
        try {
          localStorage.setItem('app_shift_tasks_v1', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      return await dbUpsertShiftTask(task);
    },
    [],
  );

  const toggleShiftTask = useCallback(
    async (id: string): Promise<boolean> => {
      const task = shiftTasks.find((t) => t.id === id);
      if (!task) return false;
      const updated: ShiftTask = {
        ...task,
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : undefined,
      };
      setShiftTasks((prev) => {
        const list = prev.map((t) => (t.id === id ? updated : t));
        try {
          localStorage.setItem('app_shift_tasks_v1', JSON.stringify(list));
        } catch {
          // ignore
        }
        return list;
      });
      return await dbUpsertShiftTask(updated);
    },
    [shiftTasks],
  );

  const deleteShiftTask = useCallback(
    async (id: string): Promise<boolean> => {
      setShiftTasks((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        try {
          localStorage.setItem('app_shift_tasks_v1', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      showToast('تم مسح المهمة', 'info');
      return await dbDeleteShiftTask(id);
    },
    [showToast],
  );

  // ==========================================
  // Payroll Handlers (/shifts/payroll)
  // ==========================================
  const savePayrollRecord = useCallback(
    async (record: PayrollRecord): Promise<boolean> => {
      setPayrollRecords((prev) => {
        const exists = prev.some((r) => r.id === record.id);
        const updated = exists ? prev.map((r) => (r.id === record.id ? record : r)) : [record, ...prev];
        try {
          localStorage.setItem('app_payroll_records_v1', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      return await dbUpsertPayrollRecord(record);
    },
    [],
  );

  const disbursePayroll = useCallback(
    async (record: PayrollRecord): Promise<boolean> => {
      const updatedRecord: PayrollRecord = {
        ...record,
        paid: true,
        paidAt: new Date().toISOString(),
      };
      await savePayrollRecord(updatedRecord);

      // Record transaction in cash drawer / expenses
      const expenseTx: Transaction = {
        id: `tx-salary-${record.id}-${Date.now()}`,
        type: 'expense',
        category: 'Salaries',
        categoryAr: 'رواتب وأجور',
        amount: record.netSalary,
        description: `Salary disbursement for ${record.employeeNameAr} (${record.period})`,
        descriptionAr: `صرف راتب ${record.employeeNameAr} عن فترة ${record.period}`,
        date: new Date().toISOString(),
        method: record.paymentMethod === 'bank' ? 'card' : 'cash',
      };
      await addTransaction(expenseTx);
      showToast(`تم اعتماد وصرف راتب ${record.employeeNameAr} بمبلغ ${record.netSalary.toLocaleString()} ج.م وتسجيله في المالية`, 'success');
      return true;
    },
    [savePayrollRecord, addTransaction, showToast],
  );

  return (
    <AppContext.Provider
      value={{
        orders,
        menuItems,
        inventory,
        riders,
        kdsTickets,
        shifts,
        addShift,
        updateShift,
        deleteShift,
        recordAttendance,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeeById,
        shiftTasks,
        addShiftTask,
        updateShiftTask,
        toggleShiftTask,
        deleteShiftTask,
        payrollRecords,
        savePayrollRecord,
        disbursePayroll,
        transactions,
        addTransaction,
        deleteTransaction,
        toasts,
        dbStatus,
        dbError,
        rolesTableExists,
        usersTableExists,
        isDbModalOpen,
        setIsDbModalOpen,
        checkConnection,
        addOrder,
        updateOrder,
        deleteOrder,
        updateOrderStatus,
        assignRider,
        addRider,
        updateRider,
        deleteRider,
        updateRiderStatus,
        advanceKdsTicket,
        updateMenuItem,
        addMenuItem,
        deleteMenuItem,
        deleteAllMenuItems,
        resetToDefaultMenu,
        updateInventoryItem,
        addInventoryItem,
        deleteInventoryItem,
        resetToDefaultInventory,
        adjustStock,
        inventoryCategories,
        inventoryUnits,
        addInventoryCategory,
        addInventoryUnit,
        showToast,
        dismissToast,
        language,
        setLanguage,
        toggleLanguage,
        theme,
        setTheme,
        toggleTheme,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        addNotification,
        isSearchOpen,
        setIsSearchOpen,
        currentUser,
        setCurrentUser,
        login,
        logout,
        roles,
        addRole,
        updateRole,
        deleteRole,
        getRoleById,
        users,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        hasPermission,
        taxRate,
        setTaxRate,
        showZeroVatInCart,
        setShowZeroVatInCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
