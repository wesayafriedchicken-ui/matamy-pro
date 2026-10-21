import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { AppNotification } from '@/types';
import {
  Bell,
  CheckCheck,
  Trash2,
  Package,
  Bike,
  AlertTriangle,
  UtensilsCrossed,
  DollarSign,
  ChevronLeft,
  X,
} from 'lucide-react';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'order' | 'inventory' | 'delivery' | 'kds'>('all');

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Esc key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-brand-400" />;
      case 'delivery':
        return <Bike className="w-4 h-4 text-sky-400" />;
      case 'inventory':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'kds':
        return <UtensilsCrossed className="w-4 h-4 text-emerald-400" />;
      case 'finance':
        return <DollarSign className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-navy-400" />;
    }
  };

  const getTypeLabel = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return 'طلب جديد';
      case 'delivery':
        return 'أسطول التوصيل';
      case 'inventory':
        return 'المخزون';
      case 'kds':
        return 'المطبخ (KDS)';
      case 'finance':
        return 'الخزينة والمالية';
      default:
        return 'إشعار نظام';
    }
  };

  const handleItemClick = (notification: AppNotification) => {
    markNotificationAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-16 left-4 sm:left-14 w-84 sm:w-96 max-w-[calc(100vw-2rem)] bg-navy-900 border border-navy-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in text-right"
    >
      {/* Header */}
      <div className="p-4 border-b border-navy-800/80 bg-navy-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">الإشعارات والتنبيهات</h3>
            <p className="text-[11px] text-navy-400">
              {unreadNotificationsCount > 0
                ? `${unreadNotificationsCount} إشعار غير مقروء`
                : 'كافة الإشعارات مقروءة'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition-colors"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-2 bg-navy-950/30 border-b border-navy-800/60 overflow-x-auto scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'all'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
          }`}
        >
          الكل ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'order'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
          }`}
        >
          طلبات
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'inventory'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
          }`}
        >
          المخزون
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('delivery')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'delivery'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
          }`}
        >
          توصيل
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('kds')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'kds'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-navy-400 hover:text-white hover:bg-navy-800/60'
          }`}
        >
          المطبخ
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-navy-800/60">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-navy-800/60 border border-navy-700/60 text-navy-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-white font-semibold text-xs">لا توجد إشعارات جديدة</p>
            <p className="text-navy-400 text-[11px]">أنت على اطلاع دائم بجميع مستجدات المطعم</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleItemClick(notification)}
              className={`p-3.5 flex items-start gap-3 hover:bg-navy-800/70 transition-colors cursor-pointer group ${
                !notification.read ? 'bg-brand-500/5' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-navy-800 border border-navy-700/60 shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-navy-800 text-navy-300 border border-navy-700/60 shrink-0">
                      {getTypeLabel(notification.type)}
                    </span>
                    <h4 className="font-bold text-white text-xs truncate group-hover:text-brand-300 transition-colors">
                      {notification.titleAr || notification.title}
                    </h4>
                  </div>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" title="غير مقروء" />
                  )}
                </div>

                <p className="text-xs text-navy-300 line-clamp-2 leading-relaxed">
                  {notification.messageAr || notification.message}
                </p>

                <div className="flex items-center justify-between text-[10px] text-navy-400 pt-1">
                  <span>{notification.timestamp}</span>
                  {notification.link && (
                    <span className="inline-flex items-center gap-1 text-brand-400 group-hover:underline">
                      <span>عرض</span>
                      <ChevronLeft className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-3 bg-navy-950/60 border-t border-navy-800/80 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={markAllNotificationsAsRead}
          disabled={unreadNotificationsCount === 0}
          className="flex items-center gap-1.5 text-navy-300 hover:text-brand-400 disabled:opacity-40 disabled:hover:text-navy-300 transition-colors text-xs font-semibold"
        >
          <CheckCheck className="w-4 h-4" />
          <span>تحديد الكل كمقروء</span>
        </button>

        <button
          type="button"
          onClick={clearAllNotifications}
          disabled={notifications.length === 0}
          className="flex items-center gap-1.5 text-navy-400 hover:text-rose-400 disabled:opacity-40 disabled:hover:text-navy-400 transition-colors text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>مسح الكل</span>
        </button>
      </div>
    </div>
  );
}
