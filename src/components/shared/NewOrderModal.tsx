import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import type { Order, DeliveryType, OrderItem, OrderChannel, OfficialDeliveryZone } from '@/types';
import {
  X, Plus, Minus, Utensils, ShoppingBag, Bike, CreditCard,
  Wallet, Banknote, Search, Check, MapPin, Clock,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import { defaultDeliveryZones } from '@/data/deliveryZonesData';

interface NewOrderModalProps {
  onClose: () => void;
  onCreated: (order: Order) => void;
}

export default function NewOrderModal({ onClose, onCreated }: NewOrderModalProps) {
  const { menuItems, taxRate, showZeroVatInCart } = useApp();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('dine_in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<{ menuItemId: string; quantity: number; modifiers: string[] }[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
  const [channel] = useState<OrderChannel>('pos');

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

  const filteredMenu = menuItems.filter(
    (m) => m.available && (m.nameAr.includes(search) || m.name.toLowerCase().includes(search.toLowerCase())),
  );

  const cartItems: (OrderItem & { basePrice: number })[] = useMemo(() => {
    return cart.map((c, idx) => {
      const menuItem = menuItems.find((m) => m.id === c.menuItemId);
      if (!menuItem) return null;
      let modPrice = 0;
      for (const modName of c.modifiers) {
        for (const group of menuItem.modifiers) {
          const opt = group.options.find((o) => o.nameAr === modName);
          if (opt) modPrice += opt.price;
        }
      }
      const unitPrice = menuItem.price + modPrice;
      return {
        id: `oi-${Date.now()}-${idx}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        nameAr: menuItem.nameAr,
        quantity: c.quantity,
        price: unitPrice,
        basePrice: menuItem.price,
        modifiers: c.modifiers,
      };
    }).filter(Boolean) as (OrderItem & { basePrice: number })[];
  }, [cart, menuItems]);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * (taxRate / 100));
  const deliveryFee = deliveryType === 'delivery' ? (selectedZone ? selectedZone.deliveryFee : 30) : 0;
  const total = subtotal + tax + deliveryFee;

  const addToCart = (menuItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === menuItemId && c.modifiers.length === 0);
      if (existing) {
        return prev.map((c) =>
          c === existing ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { menuItemId, quantity: 1, modifiers: [] }];
    });
  };

  const updateQty = (menuItemId: string, modifiers: string[], delta: number) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.menuItemId === menuItemId && JSON.stringify(c.modifiers) === JSON.stringify(modifiers));
      if (idx === -1) {
        if (delta > 0) return [...prev, { menuItemId, quantity: 1, modifiers }];
        return prev;
      }
      const newQty = prev[idx].quantity + delta;
      if (newQty <= 0) return prev.filter((_, i) => i !== idx);
      return prev.map((c, i) => (i === idx ? { ...c, quantity: newQty } : c));
    });
  };

  const toggleModifier = (menuItemId: string, modName: string, groupType: 'single' | 'multi', groupName: string) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.menuItemId === menuItemId);
      if (idx === -1) return prev;
      const item = prev[idx];
      let newMods: string[];
      if (groupType === 'single') {
        const otherGroups = menuItems.find((m) => m.id === menuItemId)?.modifiers.filter((g) => g.nameAr !== groupName).flatMap((g) => g.options.map((o) => o.nameAr)) ?? [];
        const kept = item.modifiers.filter((m) => otherGroups.includes(m));
        if (item.modifiers.includes(modName)) {
          newMods = kept;
        } else {
          newMods = [...kept, modName];
        }
      } else {
        if (item.modifiers.includes(modName)) {
          newMods = item.modifiers.filter((m) => m !== modName);
        } else {
          newMods = [...item.modifiers, modName];
        }
      }
      return prev.map((c, i) => (i === idx ? { ...c, modifiers: newMods } : c));
    });
  };

  const handleSubmit = () => {
    if (cartItems.length === 0) return;
    if (deliveryType === 'delivery' && (!customerName || !customerPhone || !address)) return;

    const orderNumber = `#${1050 + Math.floor(Math.random() * 900)}`;
    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName || 'عميل غير محدد',
      customerPhone: customerPhone || '—',
      items: cartItems.map(({ basePrice: _basePrice, ...rest }) => rest),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentMethod,
      paid: paymentMethod === 'online' || paymentMethod === 'card',
    };

    onCreated(order);
    onClose();
  };

  const deliveryTypes: { value: DeliveryType; labelAr: string; icon: typeof Utensils }[] = [
    { value: 'dine_in', labelAr: 'صالة', icon: Utensils },
    { value: 'takeaway', labelAr: 'تيك أوي', icon: ShoppingBag },
    { value: 'delivery', labelAr: 'توصيل', icon: Bike },
  ];

  const paymentMethods: { value: 'cash' | 'card' | 'online'; labelAr: string; icon: typeof Wallet }[] = [
    { value: 'cash', labelAr: 'كاش', icon: Banknote },
    { value: 'card', labelAr: 'بطاقة', icon: CreditCard },
    { value: 'online', labelAr: 'عند الاستلام', icon: Wallet },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-card w-full max-w-4xl max-h-[92vh] overflow-hidden animate-scale-in flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-navy-800/95 backdrop-blur-xl px-6 py-4 border-b border-navy-700/50 flex items-center justify-between shrink-0">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-400" />
            إنشاء طلب جديد
          </h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-navy-700/50 hover:bg-navy-700 flex items-center justify-center text-navy-300 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* Left: Menu Selection */}
            <div className="lg:col-span-3 p-6 border-l border-navy-700/40">
              {/* Delivery Type */}
              <div className="mb-4">
                <label className="text-navy-300 text-sm font-medium mb-2 block">نوع الطلب</label>
                <div className="grid grid-cols-3 gap-2">
                  {deliveryTypes.map((dt) => {
                    const Icon = dt.icon;
                    return (
                      <button
                        key={dt.value}
                        onClick={() => setDeliveryType(dt.value)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                          deliveryType === dt.value
                            ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                            : 'bg-navy-900/50 border-navy-700/40 text-navy-400 hover:border-navy-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{dt.labelAr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info for delivery */}
              {deliveryType === 'delivery' && (
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="اسم العميل *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input-field text-xs" />
                    <input type="text" placeholder="رقم الهاتف *" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="input-field text-xs" />
                  </div>

                  {/* Zone Selector */}
                  <div className="p-3 bg-navy-900/80 border border-brand-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-400" />
                        منطقة / زون التوصيل *
                      </span>
                      {selectedZone && (
                        <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {selectedZone.deliveryTimeAr}
                        </span>
                      )}
                    </div>

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
                      className="input-field text-xs bg-navy-950 text-white cursor-pointer"
                    >
                      {deliveryZones.map((z) => (
                        <option key={z.id} value={z.id} className="bg-navy-900">
                          زون {z.zoneCode}: {z.areaNameAr} — {z.deliveryFee} ج.م ({z.distanceKm} كم)
                        </option>
                      ))}
                    </select>

                    {selectedZone && (
                      <div className="flex items-center justify-between bg-navy-950/70 p-2 rounded-lg text-xs">
                        <span className="text-navy-300">
                          المسافة: <strong className="text-white font-mono">{selectedZone.distanceKm} كم</strong>
                        </span>
                        <span className="text-amber-400 font-bold font-mono">
                          رسوم التوصيل: {selectedZone.deliveryFee} ج.م
                        </span>
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="عنوان التوصيل بالتفصيل (الشارع، المبنى، الشقة) *"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field text-xs w-full"
                  />
                </div>
              )}

              {/* Table number for dine-in */}
              {deliveryType === 'dine_in' && (
                <div className="mb-4">
                  <input type="text" placeholder="رقم الطاولة" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="input-field w-40" />
                </div>
              )}

              {/* Search */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-navy-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="بحث عن صنف..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pr-10" />
              </div>

              {/* Menu Items */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredMenu.map((item) => {
                  const cartEntry = cart.find((c) => c.menuItemId === item.id);
                  const inCart = cartEntry !== undefined;
                  const isExpanded = expandedItemId === item.id;
                  return (
                    <div key={item.id} className={`rounded-xl border transition-all ${inCart ? 'bg-brand-500/10 border-brand-500/30' : 'bg-navy-900/50 border-navy-700/40'}`}>
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-xl bg-navy-700/50 flex items-center justify-center shrink-0">
                          <Utensils className="w-5 h-5 text-navy-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{item.nameAr}</p>
                          <p className="text-navy-400 text-xs">{item.categoryAr} • {item.price} ج</p>
                        </div>
                        {item.modifiers.length > 0 && (
                          <button
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            className="text-xs text-brand-400 hover:text-brand-300 font-medium px-2 py-1 rounded-lg hover:bg-brand-500/10 transition-all"
                          >
                            خيارات
                          </button>
                        )}
                        {inCart ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => updateQty(item.id, cartEntry!.modifiers, -1)} className="w-8 h-8 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 flex items-center justify-center text-danger-400 transition-all">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white font-bold text-sm w-6 text-center">{cartEntry!.quantity}</span>
                            <button onClick={() => updateQty(item.id, cartEntry!.modifiers, 1)} className="w-8 h-8 rounded-lg bg-success-500/10 hover:bg-success-500/20 flex items-center justify-center text-success-400 transition-all">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(item.id)} className="w-8 h-8 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 flex items-center justify-center text-brand-400 transition-all shrink-0">
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Modifiers */}
                      {isExpanded && cartEntry && item.modifiers.length > 0 && (
                        <div className="px-4 pb-3 space-y-2 border-t border-navy-700/30 pt-3">
                          {item.modifiers.map((group) => (
                            <div key={group.id}>
                              <p className="text-navy-300 text-xs font-medium mb-1.5">
                                {group.nameAr} {group.required && <span className="text-danger-400">*</span>}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {group.options.map((opt) => {
                                  const selected = cartEntry.modifiers.includes(opt.nameAr);
                                  return (
                                    <button
                                      key={opt.id}
                                      onClick={() => toggleModifier(item.id, opt.nameAr, group.type, group.nameAr)}
                                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                                        selected
                                          ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                                          : 'bg-navy-800/50 border-navy-700/40 text-navy-300 hover:border-navy-600'
                                      }`}
                                    >
                                      {opt.nameAr}
                                      {opt.price > 0 && <span className="text-navy-400 mr-1">+{opt.price}ج</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Cart & Summary */}
            <div className="lg:col-span-2 p-6 flex flex-col">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-400" />
                السلة ({cartItems.length})
              </h4>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] mb-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-navy-400 text-sm">
                    <ShoppingBag className="w-10 h-10 text-navy-600 mx-auto mb-2" />
                    السلة فارغة
                  </div>
                ) : (
                  cartItems.map((item, i) => (
                    <div key={i} className="bg-navy-900/50 rounded-xl px-3 py-2.5 border border-navy-700/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">{item.quantity}× {item.nameAr}</span>
                        <span className="text-navy-200 text-xs font-mono">{item.price * item.quantity} ج</span>
                      </div>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.modifiers.map((m, mi) => (
                            <span key={mi} className="text-xs text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">{m}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="text-navy-300 text-sm font-medium mb-2 block">طريقة الدفع</label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((pm) => {
                    const Icon = pm.icon;
                    return (
                      <button
                        key={pm.value}
                        onClick={() => setPaymentMethod(pm.value)}
                        className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 transition-all ${
                          paymentMethod === pm.value
                            ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                            : 'bg-navy-900/50 border-navy-700/40 text-navy-400 hover:border-navy-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{pm.labelAr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-navy-900/50 rounded-2xl px-4 py-3 border border-navy-700/40 space-y-2 mb-4">
                <div className="flex justify-between text-navy-300 text-sm">
                  <span>المجموع الفرعي</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                {(taxRate > 0 || showZeroVatInCart) && (
                  <div className="flex justify-between text-navy-300 text-sm">
                    <span>الضريبة ({taxRate}%)</span>
                    <span className="font-mono">{formatCurrency(tax)}</span>
                  </div>
                )}
                {deliveryType === 'delivery' && (
                  <div className="space-y-1 pt-1 border-t border-navy-800">
                    <div className="flex justify-between text-navy-300 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-400" />
                        رسوم التوصيل {selectedZone ? `(زون ${selectedZone.zoneCode})` : ''}
                      </span>
                      <span className="font-mono text-amber-400 font-bold">{formatCurrency(deliveryFee)}</span>
                    </div>
                    {selectedZone && (
                      <div className="flex justify-between text-[11px] text-navy-400">
                        <span>{selectedZone.areaNameAr} ({selectedZone.distanceKm} كم)</span>
                        <span className="text-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {selectedZone.deliveryTimeAr}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="border-t border-navy-700/40 pt-2 flex justify-between text-white font-bold">
                  <span>الإجمالي</span>
                  <span className="font-mono text-lg">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={cartItems.length === 0 || (deliveryType === 'delivery' && (!customerName || !address))}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                تأكيد الطلب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
