import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Order, DeliveryType, OrderItem, OrderChannel, MenuItem } from '@/types';
import {
  ArrowRight,
  Plus,
  Minus,
  Utensils,
  ShoppingBag,
  Bike,
  CreditCard,
  Wallet,
  Banknote,
  Search,
  Check,
  Trash2,
  Clock,
  Sparkles,
  Phone,
  User,
  MapPin,
  FileText,
  SlidersHorizontal,
  X,
  ChevronLeft,
  Compass,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import { defaultDeliveryZones } from '@/data/deliveryZonesData';
import type { OfficialDeliveryZone } from '@/types';

interface CartEntry {
  menuItemId: string;
  quantity: number;
  modifiers: string[];
  notes?: string;
}

export default function CreateOrder() {
  const navigate = useNavigate();
  const { menuItems, addOrder, showToast } = useApp();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('dine_in');
  const [channel, setChannel] = useState<OrderChannel>('pos');
  const [tableNumber, setTableNumber] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Delivery zones from storage or defaults
  const deliveryZones: OfficialDeliveryZone[] = useMemo(() => {
    try {
      const saved = localStorage.getItem('nine_fries_delivery_zones_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((z: OfficialDeliveryZone) => z.isActive !== false);
        }
      }
    } catch {
      // fallback
    }
    return defaultDeliveryZones;
  }, []);

  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-01');

  const selectedZone = useMemo(() => {
    return deliveryZones.find((z) => z.id === selectedZoneId) || deliveryZones[0];
  }, [deliveryZones, selectedZoneId]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
  const [activeModifierItem, setActiveModifierItem] = useState<MenuItem | null>(null);
  const [tempModifiers, setTempModifiers] = useState<string[]>([]);
  const [tempItemNote, setTempItemNote] = useState('');

  // Categories list
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    menuItems.forEach((m) => {
      if (m.category && m.categoryAr) {
        map.set(m.category, m.categoryAr);
      }
    });
    return Array.from(map.entries()).map(([key, labelAr]) => ({ key, labelAr }));
  }, [menuItems]);

  // Filtered menu
  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.available) return false;
      const matchesSearch =
        item.nameAr.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, search, selectedCategory]);

  // Cart items calculated with modifiers
  const cartItems: (OrderItem & { basePrice: number; entryIdx: number })[] = useMemo(() => {
    return cart
      .map((entry, idx) => {
        const menuItem = menuItems.find((m) => m.id === entry.menuItemId);
        if (!menuItem) return null;

        let modPrice = 0;
        for (const modName of entry.modifiers) {
          for (const group of menuItem.modifiers) {
            const opt = group.options.find((o) => o.nameAr === modName);
            if (opt) modPrice += opt.price;
          }
        }

        const unitPrice = menuItem.price + modPrice;

        return {
          id: `oi-${idx}`,
          entryIdx: idx,
          menuItemId: menuItem.id,
          name: menuItem.name,
          nameAr: menuItem.nameAr,
          quantity: entry.quantity,
          price: unitPrice,
          basePrice: menuItem.price,
          modifiers: entry.modifiers,
          notes: entry.notes,
        };
      })
      .filter(Boolean) as (OrderItem & { basePrice: number; entryIdx: number })[];
  }, [cart, menuItems]);

  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.14);
  const deliveryFee = deliveryType === 'delivery' ? (selectedZone ? selectedZone.deliveryFee : 30) : 0;
  const total = subtotal + tax + deliveryFee;

  // Add standard item without modifiers
  const handleQuickAdd = (item: MenuItem) => {
    if (item.modifiers && item.modifiers.length > 0) {
      openModifierModal(item);
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.menuItemId === item.id && c.modifiers.length === 0 && !c.notes,
      );
      if (existingIdx >= 0) {
        return prev.map((c, i) =>
          i === existingIdx ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { menuItemId: item.id, quantity: 1, modifiers: [] }];
    });
    showToast(`تمت إضافة ${item.nameAr} إلى السلة`, 'success');
  };

  const openModifierModal = (item: MenuItem) => {
    setActiveModifierItem(item);
    setTempModifiers([]);
    setTempItemNote('');
  };

  const handleConfirmModifiers = () => {
    if (!activeModifierItem) return;

    setCart((prev) => [
      ...prev,
      {
        menuItemId: activeModifierItem.id,
        quantity: 1,
        modifiers: [...tempModifiers],
        notes: tempItemNote.trim() || undefined,
      },
    ]);

    showToast(`تمت إضافة ${activeModifierItem.nameAr} مع التخصيصات`, 'success');
    setActiveModifierItem(null);
  };

  const handleUpdateCartQty = (idx: number, delta: number) => {
    setCart((prev) => {
      const target = prev[idx];
      if (!target) return prev;
      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== idx);
      }
      return prev.map((item, i) => (i === idx ? { ...item, quantity: newQty } : item));
    });
  };

  const handleRemoveCartItem = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    showToast('تم إفراغ السلة', 'info');
  };

  const handleSubmitOrder = () => {
    if (cartItems.length === 0) {
      showToast('يرجى إضافة أصناف إلى السلة أولاً', 'warning');
      return;
    }

    if (deliveryType === 'delivery') {
      if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
        showToast('يرجى استكمال بيانات العميل ورقم الهاتف وعنوان التوصيل', 'warning');
        return;
      }
    }

    const orderNumber = `#${1050 + Math.floor(Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName.trim() || (deliveryType === 'dine_in' ? `طاولة ${tableNumber}` : 'عميل مباشر'),
      customerPhone: customerPhone.trim() || '—',
      items: cartItems.map(({ basePrice: _base, entryIdx: _idx, ...rest }) => rest),
      total,
      subtotal,
      tax,
      deliveryFee,
      status: 'new',
      deliveryType,
      channel,
      tableNumber: deliveryType === 'dine_in' ? tableNumber : undefined,
      address: deliveryType === 'delivery' ? address : undefined,
      deliveryZoneId: deliveryType === 'delivery' ? selectedZone?.id : undefined,
      deliveryZoneCode: deliveryType === 'delivery' ? selectedZone?.zoneCode : undefined,
      deliveryZoneAr: deliveryType === 'delivery' ? selectedZone?.areaNameAr : undefined,
      deliveryEstimatedTime: deliveryType === 'delivery' ? selectedZone?.deliveryTimeAr : undefined,
      deliveryDistanceKm: deliveryType === 'delivery' ? selectedZone?.distanceKm : undefined,
      notes: orderNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentMethod,
      paid: paymentMethod === 'online' || paymentMethod === 'card',
    };

    addOrder(newOrder);
    navigate('/orders');
  };

  const tables = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '15', 'VIP-1', 'VIP-2'];

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-10 h-10 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700/60 flex items-center justify-center text-navy-300 hover:text-white transition-all duration-200"
            title="العودة لشاشة الطلبات اللحظية"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white">نقطة البيع (POS) - إنشاء طلب جديد</h1>
              <span className="bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs px-2.5 py-1 rounded-full font-semibold">
                طلب فوري
              </span>
            </div>
            <p className="text-navy-400 text-xs sm:text-sm mt-0.5">
              سجل طلب جديد للصالة أو السفري أو التوصيل مع تخصيص الأصناف والإضافات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="px-3.5 py-2 rounded-xl bg-navy-800/80 hover:bg-rose-500/15 hover:text-rose-400 text-navy-300 text-xs font-semibold border border-navy-700/60 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              تفريغ السلة
            </button>
          )}
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-200 hover:text-white text-xs font-medium border border-navy-700/60 transition-all flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            عرض لوحة الطلبات
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Menu Browsing & Filters (8 Columns) */}
        <div className="xl:col-span-7 2xl:col-span-8 space-y-5">
          {/* 1. Order Type Switcher & Table/Delivery Inputs */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-white text-sm font-bold flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-400" />
                حدد نوع الطلب والقناة:
              </span>
              <div className="flex items-center gap-1 bg-navy-900/80 p-1 rounded-xl border border-navy-700/50 text-xs">
                {(['pos', 'phone', 'app', 'website'] as OrderChannel[]).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      channel === ch
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'text-navy-400 hover:text-white'
                    }`}
                  >
                    {ch === 'pos' && 'كاشير POS'}
                    {ch === 'phone' && 'هاتف'}
                    {ch === 'app' && 'تطبيق'}
                    {ch === 'website' && 'موقع'}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Cards */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('dine_in')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                  deliveryType === 'dine_in'
                    ? 'bg-brand-500/15 border-brand-500 text-brand-400 shadow-lg shadow-brand-500/10'
                    : 'bg-navy-900/60 border-navy-700/60 text-navy-400 hover:text-white hover:border-navy-600'
                }`}
              >
                <Utensils className="w-5 h-5 shrink-0" />
                <div className="text-center sm:text-right">
                  <p className="font-bold text-sm">صالة داخلي</p>
                  <p className="text-[11px] opacity-75 hidden sm:block">تناول داخل المطعم</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('takeaway')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                  deliveryType === 'takeaway'
                    ? 'bg-brand-500/15 border-brand-500 text-brand-400 shadow-lg shadow-brand-500/10'
                    : 'bg-navy-900/60 border-navy-700/60 text-navy-400 hover:text-white hover:border-navy-600'
                }`}
              >
                <ShoppingBag className="w-5 h-5 shrink-0" />
                <div className="text-center sm:text-right">
                  <p className="font-bold text-sm">سفري / تيك أوي</p>
                  <p className="text-[11px] opacity-75 hidden sm:block">استلام مباشر</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                  deliveryType === 'delivery'
                    ? 'bg-brand-500/15 border-brand-500 text-brand-400 shadow-lg shadow-brand-500/10'
                    : 'bg-navy-900/60 border-navy-700/60 text-navy-400 hover:text-white hover:border-navy-600'
                }`}
              >
                <Bike className="w-5 h-5 shrink-0" />
                <div className="text-center sm:text-right">
                  <p className="font-bold text-sm">توصيل منزلي</p>
                  <p className="text-[11px] opacity-75 hidden sm:block">مع مندوب التوصيل</p>
                </div>
              </button>
            </div>

            {/* Dynamic Inputs depending on type */}
            {deliveryType === 'dine_in' && (
              <div className="pt-2 border-t border-navy-700/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-navy-300">
                    رقم الطاولة المحدد: <span className="text-brand-400 font-bold">{tableNumber}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-navy-400">أو اكتب يدوياً:</span>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-20 bg-navy-900 border border-navy-700 rounded-lg px-2 py-1 text-xs text-white text-center font-bold"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                  {tables.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTableNumber(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        tableNumber === t
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-navy-900/50 border-navy-700/50 text-navy-300 hover:border-navy-600'
                      }`}
                    >
                      طاولة {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {deliveryType === 'takeaway' && (
              <div className="pt-2 border-t border-navy-700/40 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <User className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="اسم العميل (اختياري)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input-field pr-9 text-xs"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="رقم الهاتف (اختياري)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="input-field pr-9 text-xs"
                  />
                </div>
              </div>
            )}

            {deliveryType === 'delivery' && (
              <div className="pt-2 border-t border-navy-700/40 space-y-3">
                {/* Customer Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="اسم العميل *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="input-field pr-9 text-xs"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="رقم هاتف العميل *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="input-field pr-9 text-xs"
                      required
                    />
                  </div>
                </div>

                {/* ===================== DELIVERY ZONE SELECTOR ===================== */}
                <div className="p-3.5 rounded-2xl bg-navy-900/90 border border-brand-500/30 space-y-3 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span>منطقة / زون التوصيل *</span>
                      <span className="text-[10px] text-brand-300 font-mono px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
                        {deliveryZones.length} منطقة معتمدة
                      </span>
                    </label>

                    {selectedZone && (
                      <span className="text-[11px] text-amber-300 font-medium flex items-center gap-1.5 self-start sm:self-auto">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        وقت التوصيل: {selectedZone.deliveryTimeAr}
                      </span>
                    )}
                  </div>

                  {/* Zone Dropdown */}
                  <div className="relative">
                    <Compass className="w-4 h-4 text-brand-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedZoneId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedZoneId(newId);
                        const zone = deliveryZones.find((z) => z.id === newId);
                        if (zone && (!address || address.trim() === '')) {
                          setAddress(zone.areaNameAr);
                        }
                      }}
                      className="input-field pr-9 text-xs font-medium cursor-pointer bg-navy-950 border-navy-700 text-white focus:border-brand-500"
                    >
                      {deliveryZones.map((z) => (
                        <option key={z.id} value={z.id} className="bg-navy-900 text-white py-1">
                          زون {z.zoneCode}: {z.areaNameAr} — {z.deliveryFee} ج.م ({z.distanceKm} كم)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Popular Zone Quick-Select Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    <span className="text-[10px] text-navy-400 font-semibold shrink-0">اختيار سريع:</span>
                    {deliveryZones.slice(0, 7).map((z) => (
                      <button
                        key={z.id}
                        type="button"
                        onClick={() => {
                          setSelectedZoneId(z.id);
                          if (!address || address.trim() === '') {
                            setAddress(z.areaNameAr);
                          }
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg shrink-0 border transition-all ${
                          selectedZoneId === z.id
                            ? 'bg-brand-500 text-white border-brand-500 shadow-sm font-bold'
                            : 'bg-navy-800/80 border-navy-700 text-navy-300 hover:text-white hover:border-navy-600'
                        }`}
                      >
                        {z.areaNameAr} ({z.deliveryFee} ج)
                      </button>
                    ))}
                  </div>

                  {/* Zone Details / Delivery Fee & Time Indicator Card */}
                  {selectedZone && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border border-brand-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-mono font-bold shrink-0">
                          {selectedZone.zoneCode}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-white text-xs">{selectedZone.areaNameAr}</h5>
                            <span className="text-[10px] text-navy-400 font-mono">
                              ({selectedZone.distanceKm} كم من الفرع)
                            </span>
                          </div>
                          <p className="text-[10px] text-navy-400 mt-0.5">
                            يتم احتساب وقت التوصيل من وقت تأكيد الطلب
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-navy-900/90 px-3.5 py-1.5 rounded-xl border border-navy-700/60 self-end sm:self-auto shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-navy-400 block">رسوم التوصيل</span>
                          <span className="text-sm font-extrabold text-amber-400 font-mono">
                            {selectedZone.deliveryFee} ج.م
                          </span>
                        </div>
                        <div className="w-px h-6 bg-navy-700" />
                        <div className="text-right">
                          <span className="text-[10px] text-navy-400 block">وقت التوصيل</span>
                          <span className="text-xs font-semibold text-navy-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {selectedZone.deliveryTimeAr}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed Address */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-navy-300">
                      عنوان التوصيل بالتفصيل <span className="text-danger-400">*</span>
                    </label>
                    {selectedZone && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!address.includes(selectedZone.areaNameAr)) {
                            setAddress(address ? `${selectedZone.areaNameAr} - ${address}` : selectedZone.areaNameAr);
                          }
                        }}
                        className="text-[10px] text-brand-400 hover:text-brand-300 underline font-medium"
                      >
                        + إدراج اسم المنطقة في العنوان
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-navy-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      placeholder="عنوان التوصيل بالتفصيل (المنطقة، الشارع، المبنى، الشقة، علامة مميزة) *"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-field pr-9 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Menu Search & Category Tabs */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث عن وجبة، ساندوتش، مشروب أو مقبلات..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pr-10 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-xs text-navy-400 shrink-0 self-center">
                متاح <span className="text-white font-bold">{filteredMenu.length}</span> صنف
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-navy-900/60 hover:bg-navy-800 text-navy-300 border border-navy-700/60'
                }`}
              >
                الكل ({menuItems.filter((i) => i.available).length})
              </button>
              {categories.map((cat) => {
                const count = menuItems.filter((i) => i.available && i.category === cat.key).length;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat.key
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                        : 'bg-navy-900/60 hover:bg-navy-800 text-navy-300 border border-navy-700/60'
                    }`}
                  >
                    {cat.labelAr} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenu.map((item) => {
              const inCartQty = cart
                .filter((c) => c.menuItemId === item.id)
                .reduce((sum, c) => sum + c.quantity, 0);

              const hasModifiers = item.modifiers && item.modifiers.length > 0;

              return (
                <div
                  key={item.id}
                  className={`glass-card overflow-hidden flex flex-col justify-between group transition-all duration-200 border ${
                    inCartQty > 0
                      ? 'border-brand-500/50 bg-navy-800/80 shadow-lg shadow-brand-500/5'
                      : 'border-navy-700/50 hover:border-navy-600'
                  }`}
                >
                  {/* Image / Header */}
                  <div className="relative h-32 w-full overflow-hidden bg-navy-900">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.nameAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-navy-600">
                        <Utensils className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80" />

                    {/* Category tag */}
                    <span className="absolute top-2.5 right-2.5 bg-navy-900/90 backdrop-blur-md text-navy-300 border border-navy-700/50 text-[10px] px-2 py-0.5 rounded-md font-medium">
                      {item.categoryAr}
                    </span>

                    {/* Prep time */}
                    <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-[10px] text-navy-300 bg-navy-900/80 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-brand-400" />
                      {item.prepTime} دقيقة
                    </span>

                    {/* In cart badge */}
                    {inCartQty > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-brand-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md shadow-brand-500/40">
                        {inCartQty}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="font-bold text-white text-sm leading-snug">{item.nameAr}</h3>
                      </div>
                      <p className="text-[11px] text-navy-400 line-clamp-2 mb-2 leading-relaxed">
                        {item.descriptionAr || item.description || 'صنف طازج يتم تحضيره عند الطلب'}
                      </p>
                    </div>

                    {/* Price and Add button */}
                    <div className="pt-2 border-t border-navy-700/40 flex items-center justify-between">
                      <div>
                        <span className="text-white font-mono font-bold text-base">
                          {formatCurrency(item.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {hasModifiers ? (
                          <button
                            onClick={() => openModifierModal(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-navy-700 hover:bg-brand-500/20 text-brand-400 hover:text-brand-300 text-xs font-semibold transition-all flex items-center gap-1"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            تخصيص
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickAdd(item)}
                            className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            إضافة
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMenu.length === 0 && (
            <div className="glass-card p-12 text-center text-navy-400 space-y-3">
              <Search className="w-10 h-10 text-navy-600 mx-auto" />
              <p className="text-base font-semibold text-white">لم يتم العثور على أي صنف مطابق</p>
              <p className="text-xs">جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً من القائمة.</p>
            </div>
          )}
        </div>

        {/* Right Column: Order Cart & Checkout Summary (4/5 Columns) */}
        <div className="xl:col-span-5 2xl:col-span-4 sticky top-6">
          <div className="glass-card p-5 space-y-4 border-brand-500/20 shadow-2xl">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-navy-700/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center text-brand-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">سلة الطلب والحساب</h3>
                  <p className="text-navy-400 text-[11px]">
                    {deliveryType === 'dine_in' && `صالة - طاولة ${tableNumber}`}
                    {deliveryType === 'takeaway' && 'سفري / تيك أوي'}
                    {deliveryType === 'delivery' && 'توصيل منزلي'}
                  </p>
                </div>
              </div>
              <span className="bg-navy-900 border border-navy-700 px-2.5 py-1 rounded-full text-xs text-brand-400 font-bold font-mono">
                {cartItems.reduce((s, i) => s + i.quantity, 0)} عنصر
              </span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="py-10 text-center space-y-2 text-navy-400">
                  <ShoppingBag className="w-12 h-12 text-navy-700 mx-auto opacity-60" />
                  <p className="text-sm font-medium text-navy-300">السلة فارغة حتى الآن</p>
                  <p className="text-xs text-navy-400">
                    اضغط على الأصناف في القائمة لإضافتها للطلب.
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-navy-900/70 border border-navy-700/60 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="font-bold text-white text-sm">{item.nameAr}</span>
                        <div className="text-navy-400 text-[11px] font-mono mt-0.5">
                          {formatCurrency(item.price)} × {item.quantity} ={' '}
                          <span className="text-brand-400 font-bold">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-navy-950 p-1 rounded-lg border border-navy-800 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(item.entryIdx, -1)}
                          className="w-6 h-6 rounded bg-navy-800 hover:bg-rose-500/20 text-navy-300 hover:text-rose-400 flex items-center justify-center transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center font-bold text-white font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(item.entryIdx, 1)}
                          className="w-6 h-6 rounded bg-navy-800 hover:bg-emerald-500/20 text-navy-300 hover:text-emerald-400 flex items-center justify-center transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(item.entryIdx)}
                          className="w-6 h-6 rounded bg-navy-800 hover:bg-rose-500/30 text-rose-400 flex items-center justify-center transition-all mr-1"
                          title="حذف الصنف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Modifiers Chips */}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-navy-800/80">
                        {item.modifiers.map((m, idx) => (
                          <span
                            key={idx}
                            className="bg-brand-500/10 border border-brand-500/25 text-brand-300 text-[10px] px-2 py-0.5 rounded-md"
                          >
                            + {m}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Line Item Notes */}
                    {item.notes && (
                      <p className="text-[10px] text-amber-300/90 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                        ملاحظة: {item.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* General Notes */}
            <div className="space-y-1.5 pt-2 border-t border-navy-700/50">
              <label className="text-xs font-semibold text-navy-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-navy-400" />
                ملاحظات عامة على الطلب (للمطبخ أو الكاشير):
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="مثلاً: صوص حار جانبي، التسليم سريع، تجهيز بعد 10 دقائق..."
                className="w-full bg-navy-900 border border-navy-700/60 rounded-xl p-2.5 text-xs text-white placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2 border-t border-navy-700/50">
              <label className="text-xs font-semibold text-navy-300">طريقة الدفع:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-brand-500/15 border-brand-500 text-brand-400 shadow-sm'
                      : 'bg-navy-900 border-navy-700/60 text-navy-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-4 h-4 mb-1" />
                  <span>كاش / نقدي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-brand-500/15 border-brand-500 text-brand-400 shadow-sm'
                      : 'bg-navy-900 border-navy-700/60 text-navy-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span>بطاقة / POS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === 'online'
                      ? 'bg-brand-500/15 border-brand-500 text-brand-400 shadow-sm'
                      : 'bg-navy-900 border-navy-700/60 text-navy-400 hover:text-white'
                  }`}
                >
                  <Wallet className="w-4 h-4 mb-1" />
                  <span>دفع إلكتروني</span>
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="bg-navy-900/80 rounded-2xl p-3.5 border border-navy-700/60 space-y-2 text-xs">
              <div className="flex justify-between text-navy-300">
                <span>المجموع الفرعي ({cartItems.length} صنف)</span>
                <span className="font-mono font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-navy-300">
                <span>ضريبة القيمة المضافة (14%)</span>
                <span className="font-mono">{formatCurrency(tax)}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="space-y-1.5 py-1.5 border-t border-navy-800/80">
                  <div className="flex justify-between items-center text-navy-200">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                      <span>رسوم التوصيل</span>
                      {selectedZone && (
                        <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded font-mono">
                          زون {selectedZone.zoneCode}
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  {selectedZone && (
                    <div className="bg-navy-950/70 p-2 rounded-xl border border-navy-800 space-y-1">
                      <div className="flex justify-between text-[11px] text-navy-300">
                        <span className="text-navy-400">المنطقة:</span>
                        <span className="font-semibold text-white truncate max-w-[150px]">
                          {selectedZone.areaNameAr}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-navy-300">
                        <span className="text-navy-400">المسافة المقدرة:</span>
                        <span className="font-mono text-navy-200">{selectedZone.distanceKm} كم</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-navy-300">
                        <span className="text-navy-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          وقت التوصيل:
                        </span>
                        <span className="text-amber-300 font-medium">
                          {selectedZone.deliveryTimeAr}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="pt-2 border-t border-navy-700/60 flex justify-between items-center text-white">
                <span className="font-bold text-sm">المجموع الإجمالي</span>
                <span className="font-mono font-bold text-lg text-brand-400">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={cartItems.length === 0}
              className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Check className="w-5 h-5" />
              تأكيد الطلب وإرساله للمطبخ
            </button>
          </div>
        </div>
      </div>

      {/* Modifiers Customization Modal */}
      {activeModifierItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-navy-800 flex items-center justify-between bg-navy-850">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">تخصيص: {activeModifierItem.nameAr}</h3>
                  <p className="text-xs text-navy-400 font-mono">
                    السعر الأساسي: {formatCurrency(activeModifierItem.price)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModifierItem(null)}
                className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 flex items-center justify-center text-navy-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {activeModifierItem.modifiers.map((group) => (
                <div key={group.id} className="space-y-2 bg-navy-800/40 p-3 rounded-xl border border-navy-700/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {group.nameAr}
                    </span>
                    <span className="text-[10px] text-navy-400">
                      {group.type === 'single' ? 'اختر خياراً واحداً' : 'يمكن اختيار أكثر من إضافة'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {group.options.map((opt) => {
                      const isSelected = tempModifiers.includes(opt.nameAr);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            if (group.type === 'single') {
                              const groupOptionNames = group.options.map((o) => o.nameAr);
                              setTempModifiers((prev) => [
                                ...prev.filter((m) => !groupOptionNames.includes(m)),
                                opt.nameAr,
                              ]);
                            } else {
                              setTempModifiers((prev) =>
                                isSelected
                                  ? prev.filter((m) => m !== opt.nameAr)
                                  : [...prev, opt.nameAr],
                              );
                            }
                          }}
                          className={`p-2.5 rounded-lg border text-right transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-semibold'
                              : 'bg-navy-900 border-navy-700 text-navy-300 hover:border-navy-600'
                          }`}
                        >
                          <span>{opt.nameAr}</span>
                          {opt.price > 0 ? (
                            <span className="text-[11px] font-mono text-brand-400">+{opt.price} ج</span>
                          ) : (
                            <span className="text-[10px] text-navy-500">مجاناً</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Special Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy-300">
                  ملاحظة خاصة على هذا الصنف:
                </label>
                <input
                  type="text"
                  placeholder="مثال: بدون مايونيز، تسوية جيدة، صوص خارجي..."
                  value={tempItemNote}
                  onChange={(e) => setTempItemNote(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="p-4 border-t border-navy-800 flex items-center justify-between bg-navy-850">
              <div className="text-xs text-navy-300">
                الإضافات المحددة: <span className="text-brand-400 font-bold">{tempModifiers.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModifierItem(null)}
                  className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmModifiers}
                  className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  إضافة للسلة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
