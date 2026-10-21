import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Order, MenuItem, InventoryItem, Rider, KdsTicket, Shift, Transaction, AppNotification } from '@/types';
import {
  mockOrders,
  mockMenuItems,
  mockInventory,
  mockRiders,
  mockKdsTickets,
  mockShifts,
  mockTransactions,
} from '@/data/mockData';
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
  dbFetchTransactions,
} from '@/services/databaseService';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export type DbStatus = 'checking' | 'connected' | 'pending_tables' | 'error';

interface AppContextValue {
  orders: Order[];
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  riders: Rider[];
  kdsTickets: KdsTicket[];
  shifts: Shift[];
  transactions: Transaction[];
  toasts: Toast[];
  dbStatus: DbStatus;
  dbError?: string;
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
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [riders, setRiders] = useState<Rider[]>(mockRiders);
  const [kdsTickets, setKdsTickets] = useState<KdsTicket[]>(mockKdsTickets);
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatus>('checking');
  const [dbError, setDbError] = useState<string | undefined>();
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

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
      const [dbOrders, dbMenu, dbInv, dbRiders, dbTickets, dbShiftsList, dbTxs] = await Promise.all([
        dbFetchOrders(),
        dbFetchMenuItems(),
        dbFetchInventory(),
        dbFetchRiders(),
        dbFetchKdsTickets(),
        dbFetchShifts(),
        dbFetchTransactions(),
      ]);

      if (dbOrders && dbOrders.length > 0) setOrders(dbOrders);
      if (dbMenu && dbMenu.length > 0) setMenuItems(dbMenu);
      if (dbInv && dbInv.length > 0) setInventory(dbInv);
      if (dbRiders && dbRiders.length > 0) setRiders(dbRiders);
      if (dbTickets && dbTickets.length > 0) setKdsTickets(dbTickets);
      if (dbShiftsList && dbShiftsList.length > 0) setShifts(dbShiftsList);
      if (dbTxs && dbTxs.length > 0) setTransactions(dbTxs);
    } catch (e: unknown) {
      console.warn('Error loading data from Supabase:', e);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    setDbStatus('checking');
    const result = await checkSupabaseConnection();
    if (result.connected && result.tablesExist) {
      setDbStatus('connected');
      setDbError(undefined);
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
          if (freshOrders) setOrders(freshOrders);
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dbStatus]);

  // Actions with Supabase synchronization
  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
    showToast(`تم إنشاء الطلب ${order.orderNumber} بنجاح`, 'success');
    dbCreateOrder(order);
  }, [showToast]);

  const updateOrder = useCallback((order: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...order, updatedAt: new Date().toISOString() } : o)),
    );
    showToast(`تم تعديل الطلب ${order.orderNumber} بنجاح`, 'success');
    dbUpdateOrder(order);
  }, [showToast]);

  const deleteOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast('تم حذف الطلب بنجاح', 'info');
    dbDeleteOrder(orderId);
  }, [showToast]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o,
      ),
    );
    dbUpdateOrderStatus(orderId, status);
  }, []);

  const assignRider = useCallback((orderId: string, riderId: string, riderName: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, riderId, riderName } : o,
      ),
    );
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
    setKdsTickets((prev) => prev.filter((t) => t.id !== ticketId));
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

  return (
    <AppContext.Provider
      value={{
        orders,
        menuItems,
        inventory,
        riders,
        kdsTickets,
        shifts,
        transactions,
        toasts,
        dbStatus,
        dbError,
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
