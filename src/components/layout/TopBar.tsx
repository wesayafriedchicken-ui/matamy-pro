import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Globe,
  X,
  Package,
  Bike,
  BookOpen,
  Layers,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import NotificationsDropdown from './NotificationsDropdown';
import GlobalSearchModal from './GlobalSearchModal';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const navigate = useNavigate();
  const {
    language,
    toggleLanguage,
    theme,
    toggleTheme,
    unreadNotificationsCount,
    orders,
    menuItems,
    inventory,
    riders,
    isSearchOpen,
    setIsSearchOpen,
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [topBarQuery, setTopBarQuery] = useState('');
  const [isQuickDropdownOpen, setIsQuickDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  // Close quick dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsQuickDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick live results for TopBar input (top 6 matches across system)
  const quickResults = useRef<Array<{ id: string; title: string; subtitle: string; category: string; link: string; icon: typeof Package }>>([]);
  
  if (topBarQuery.trim()) {
    const q = topBarQuery.trim().toLowerCase();
    const list: Array<{ id: string; title: string; subtitle: string; category: string; link: string; icon: typeof Package }> = [];

    // Orders
    orders.forEach((o) => {
      if (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      ) {
        list.push({
          id: `o-${o.id}`,
          title: `طلب #${o.orderNumber} - ${o.customerName}`,
          subtitle: `${o.total} ج.م | ${o.status}`,
          category: 'طلب',
          link: `/orders/${o.id}`,
          icon: Package,
        });
      }
    });

    // Menu
    menuItems.forEach((m) => {
      if (m.name.toLowerCase().includes(q) || m.nameAr.includes(q) || m.category.toLowerCase().includes(q)) {
        list.push({
          id: `m-${m.id}`,
          title: `${m.nameAr} (${m.name})`,
          subtitle: `${m.category} | ${m.price} ج.م`,
          category: 'منيو',
          link: '/menu',
          icon: BookOpen,
        });
      }
    });

    // Riders
    riders.forEach((r) => {
      if (r.name.toLowerCase().includes(q) || r.nameAr.includes(q) || r.phone.includes(q) || (r.plateNumber && r.plateNumber.includes(q))) {
        list.push({
          id: `r-${r.id}`,
          title: `${r.nameAr} (${r.phone})`,
          subtitle: `${r.zoneAr || r.zone} | ${r.vehicleType || 'دراجة نارية'}`,
          category: 'مندوب',
          link: `/dispatch/delivery/${r.id}`,
          icon: Bike,
        });
      }
    });

    // Inventory
    inventory.forEach((i) => {
      if (i.name.toLowerCase().includes(q) || i.nameAr.includes(q) || i.sku.toLowerCase().includes(q)) {
        list.push({
          id: `i-${i.id}`,
          title: `${i.nameAr} (${i.sku})`,
          subtitle: `الرصيد: ${i.currentStock} ${i.unit}`,
          category: 'مخزون',
          link: '/inventory',
          icon: Layers,
        });
      }
    });

    quickResults.current = list.slice(0, 6);
  } else {
    quickResults.current = [];
  }

  const handleQuickSelect = (link: string) => {
    navigate(link);
    setIsQuickDropdownOpen(false);
    setTopBarQuery('');
  };

  return (
    <>
      <header className="h-20 bg-navy-900/80 backdrop-blur-xl border-b border-navy-800/60 flex items-center justify-between px-6 shrink-0 relative z-30">
        <div>
          <h2 className="text-white font-bold text-xl">{title}</h2>
          {subtitle && <p className="text-navy-400 text-sm mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Universal Search Bar */}
          <div ref={searchContainerRef} className="relative hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-navy-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="بحث في كل النظام... (Ctrl+K)"
                value={topBarQuery}
                onChange={(e) => {
                  setTopBarQuery(e.target.value);
                  setIsQuickDropdownOpen(true);
                }}
                onFocus={() => {
                  if (topBarQuery.trim()) setIsQuickDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsSearchOpen(true);
                    setIsQuickDropdownOpen(false);
                  }
                }}
                className="w-64 lg:w-72 bg-navy-800/60 border border-navy-700/60 rounded-xl pr-10 pl-16 py-2.5 text-xs text-navy-100 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
              />

              {topBarQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setTopBarQuery('');
                    setIsQuickDropdownOpen(false);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-navy-900 border border-navy-700 text-[10px] font-mono text-navy-400 hover:text-white transition-colors"
                  title="فتح البحث المتقدم"
                >
                  Ctrl+K
                </button>
              )}
            </div>

            {/* Quick Live Results Dropdown */}
            {isQuickDropdownOpen && topBarQuery.trim() && (
              <div className="absolute top-12 right-0 w-80 lg:w-96 bg-navy-900 border border-navy-700/80 rounded-2xl shadow-2xl p-2 z-50 text-right animate-scale-in">
                <div className="p-2 border-b border-navy-800/80 flex items-center justify-between text-xs text-navy-400">
                  <span>نتائج سريعة للبحث</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(true);
                      setIsQuickDropdownOpen(false);
                    }}
                    className="text-brand-400 hover:underline font-semibold text-[11px]"
                  >
                    عرض كل النتائج ({quickResults.current.length}+)
                  </button>
                </div>

                {quickResults.current.length === 0 ? (
                  <div className="p-4 text-center text-xs text-navy-400">
                    لا توجد نتائج سريعة. اضغط Enter للبحث الشامل.
                  </div>
                ) : (
                  <div className="divide-y divide-navy-800/60 mt-1 max-h-72 overflow-y-auto">
                    {quickResults.current.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleQuickSelect(item.link)}
                          className="p-2.5 rounded-xl hover:bg-navy-800 flex items-center justify-between gap-2.5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-navy-800 border border-navy-700 text-brand-400 shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white text-xs truncate">
                                {item.title}
                              </p>
                              <p className="text-[10px] text-navy-400 truncate">{item.subtitle}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-navy-800 text-navy-300 border border-navy-700 shrink-0">
                            {item.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden w-10 h-10 rounded-xl bg-navy-800/60 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all duration-200"
            title="بحث شامل في النظام"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="relative w-10 h-10 rounded-xl bg-navy-800/60 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all duration-200 group"
            title={language === 'ar' ? 'التحويل للغة الإنجليزية (English)' : 'التحويل للغة العربية (Arabic)'}
          >
            <Globe className="w-4 h-4 group-hover:text-brand-400 transition-colors" />
            <span className="absolute -bottom-1 -right-1 text-[9px] font-bold px-1 rounded-md bg-brand-500 text-white font-mono shadow-sm">
              {language.toUpperCase()}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-navy-800/60 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all duration-200 group"
            title={theme === 'dark' ? 'تفعيل الوضع النهاري (Light Mode)' : 'تفعيل الوضع الليلي (Dark Mode)'}
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 group-hover:text-amber-400 transition-colors" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 transition-colors" />
            )}
          </button>

          {/* Notifications Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isNotificationsOpen
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'bg-navy-800/60 hover:bg-navy-700 text-navy-300 hover:text-white'
              }`}
              title="الإشعارات والتنبيهات التشغيلية"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 bg-brand-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg shadow-brand-500/40 ring-2 ring-navy-900 animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <NotificationsDropdown
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pr-3 border-r border-navy-800/60 mr-1">
            <div className="text-left hidden sm:block">
              <p className="text-white text-xs font-semibold">عمر يوسف</p>
              <p className="text-navy-400 text-[11px]">مدير الفرع</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-brand-500/20">
              ع
            </div>
          </div>
        </div>
      </header>

      {/* Universal Search Modal (Command Palette) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={topBarQuery}
      />
    </>
  );
}
