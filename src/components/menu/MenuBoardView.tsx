import { useState } from 'react';
import type { MenuItem } from '@/types';
import {
  Maximize2,
  Minimize2,
  Printer,
  Sparkles,
  Flame,
  UtensilsCrossed,
  Edit3,
  Trash2,
  CheckCircle2,
  Tag,
} from 'lucide-react';

interface MenuBoardViewProps {
  menuItems: MenuItem[];
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (item: MenuItem) => void;
}

export default function MenuBoardView({
  menuItems,
  onEditItem,
  onDeleteItem,
}: MenuBoardViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

  // Group items dynamically by category
  const loadedFries = menuItems.filter(
    (m) => m.category === 'loaded_fries' || m.categoryAr === 'لودد فرايز'
  );
  const friesTrays = menuItems.filter(
    (m) => m.category === 'fries' || m.categoryAr === 'فرايز'
  );
  const macAndCheese = menuItems.filter(
    (m) => m.category === 'mac_and_cheese' || m.categoryAr === 'ماك آند تشيز'
  );
  const sandwiches = menuItems.filter(
    (m) => m.category === 'sandwiches' || m.categoryAr === 'سندوتشات'
  );
  const meals = menuItems.filter(
    (m) => m.category === 'meals' || m.categoryAr === 'وجبات'
  );
  const sauces = menuItems.filter(
    (m) => m.category === 'sauces' || m.categoryAr === 'صوصات'
  );
  const addOns = menuItems.filter(
    (m) => m.category === 'add_ons' || m.categoryAr === 'إضافات'
  );
  const drinks = menuItems.filter(
    (m) => m.category === 'drinks' || m.categoryAr === 'مشروبات'
  );

  const handlePrint = () => {
    window.print();
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 overflow-y-auto bg-navy-950 p-4 md:p-6 lg:p-8 animate-fade-in'
          : 'relative my-2'
      }`}
    >
      {/* ================= Master Board Header ================= */}
      <div className="flex items-center justify-between gap-4 mb-4 bg-navy-900/90 backdrop-blur-xl border border-navy-700/70 p-3.5 rounded-2xl shadow-xl flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-navy-950 font-black shadow-lg shadow-amber-500/25">
            <span className="text-lg">9F</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-extrabold text-base md:text-lg tracking-wide">
                لوحة منيو ناين فرايز الرقمية (Digital Menu Board)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                مطابق للصورة الرسمية 4K
              </span>
            </div>
            <p className="text-navy-400 text-xs">
              عرض تفاعلي شامل لجميع الأصناف الـ 37 مع الأسعار والمكونات بتنسيق مريح واحترافي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn-ghost flex items-center gap-1.5 text-xs text-navy-300 hover:text-white px-3 py-1.5 rounded-xl border border-navy-700"
            title="طباعة لوحة المنيو"
          >
            <Printer className="w-3.5 h-3.5 text-navy-400" />
            <span className="hidden sm:inline">طباعة</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="btn-primary flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md"
            title={isFullscreen ? 'تصغير الشاشة' : 'عرض بملء الشاشة للمطعم'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>إنهاء وضع العرض</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>وضع شاشة المطعم (TV)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================= Master Board Canvas ================= */}
      <div className="bg-[#0b101e] border-2 border-navy-700/80 rounded-3xl p-4 lg:p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 4-Column Layout matching the image exactly */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 relative z-10">

          {/* ================= COLUMN 1 (Col-span-3): LOADED FRIES & MAC & CHEESE ================= */}
          <div className="xl:col-span-3 flex flex-col gap-5">
            {/* --- LOADED FRIES --- */}
            <div className="bg-navy-900/80 rounded-2xl border border-amber-500/30 overflow-hidden shadow-lg flex flex-col">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 flex items-center justify-between text-navy-950 font-black">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-navy-950 fill-navy-950" />
                  <span className="tracking-wider text-sm font-black uppercase">LOADED FRIES</span>
                </div>
                <span className="text-[11px] font-bold bg-navy-950/20 px-2 py-0.5 rounded-md">
                  لودد فرايز
                </span>
              </div>

              <div className="p-3 space-y-3">
                {loadedFries.length > 0 ? (
                  loadedFries.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveItem(item)}
                      className="group p-3 rounded-xl bg-navy-800/60 hover:bg-navy-800/90 border border-navy-700/50 hover:border-amber-500/50 transition-all duration-200 cursor-pointer relative"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <h4 className="text-white font-bold text-sm group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                            {item.nameAr}
                          </h4>
                          <span className="text-[11px] font-mono text-navy-400 block tracking-tight uppercase">
                            {item.name}
                          </span>
                        </div>
                        <div className="bg-gradient-to-l from-amber-500/20 to-amber-500/10 text-amber-400 font-bold font-mono text-sm px-2.5 py-1 rounded-lg border border-amber-500/30 shrink-0">
                          {item.price} <span className="text-[10px] font-normal">EGP</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-navy-300/90 leading-relaxed border-t border-navy-700/40 pt-1.5">
                        {item.descriptionAr || 'بطاطس كرينكل _ شيدر _ تكساس'}
                      </p>

                      {/* Quick Edit floating buttons on hover */}
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditItem(item);
                          }}
                          className="w-6 h-6 rounded bg-navy-900/90 hover:bg-brand-500 text-white flex items-center justify-center text-xs"
                          title="تعديل الصنف"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item);
                          }}
                          className="w-6 h-6 rounded bg-navy-900/90 hover:bg-danger-500 text-white flex items-center justify-center text-xs"
                          title="حذف الصنف"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-navy-400 text-center py-4">لا توجد أصناف لودد فرايز</p>
                )}
              </div>
            </div>

            {/* --- MAC & CHEESE --- */}
            <div className="bg-navy-900/80 rounded-2xl border border-rose-500/30 overflow-hidden shadow-lg flex flex-col">
              <div className="bg-gradient-to-r from-rose-700 to-red-800 px-4 py-2.5 flex items-center justify-between text-white font-black">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="tracking-wider text-sm font-black uppercase">MAC & CHEESE</span>
                </div>
                <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-md">
                  ماك آند تشيز
                </span>
              </div>

              <div className="p-3 space-y-3">
                {macAndCheese.length > 0 ? (
                  macAndCheese.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveItem(item)}
                      className="group p-3 rounded-xl bg-navy-800/60 hover:bg-navy-800/90 border border-navy-700/50 hover:border-rose-500/50 transition-all duration-200 cursor-pointer relative"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <h4 className="text-white font-bold text-sm group-hover:text-rose-300 transition-colors">
                            {item.nameAr}
                          </h4>
                          <span className="text-[11px] font-mono text-navy-400 block tracking-tight uppercase">
                            {item.name}
                          </span>
                        </div>
                        <div className="bg-rose-500/20 text-rose-300 font-bold font-mono text-sm px-2.5 py-1 rounded-lg border border-rose-500/30 shrink-0">
                          {item.price} <span className="text-[10px] font-normal">EGP</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-navy-300/90 leading-relaxed border-t border-navy-700/40 pt-1.5">
                        {item.descriptionAr || 'مكرونة _ شيدر _ تكساس صوص _ بطاطس'}
                      </p>

                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditItem(item);
                          }}
                          className="w-6 h-6 rounded bg-navy-900/90 hover:bg-brand-500 text-white flex items-center justify-center text-xs"
                          title="تعديل الصنف"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item);
                          }}
                          className="w-6 h-6 rounded bg-navy-900/90 hover:bg-danger-500 text-white flex items-center justify-center text-xs"
                          title="حذف الصنف"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-navy-400 text-center py-4">لا توجد أصناف ماك آند تشيز</p>
                )}
              </div>
            </div>
          </div>

          {/* ================= COLUMN 2 (Col-span-2): FRIES TRAYS ================= */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            <div className="bg-navy-900/80 rounded-2xl border border-amber-500/40 overflow-hidden shadow-lg h-full flex flex-col">
              <div className="bg-gradient-to-r from-red-800 to-rose-900 px-4 py-2.5 flex items-center justify-between text-white font-black">
                <span className="tracking-wider text-sm font-black uppercase">FRIES</span>
                <span className="text-[11px] font-bold bg-amber-500 text-navy-950 px-2 py-0.5 rounded-md">
                  تراي بطاطس
                </span>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-around gap-3">
                {friesTrays.length > 0 ? (
                  friesTrays.map((item, idx) => {
                    const trayLabels = ['كبير (Large)', 'وسط (Medium)', 'عادي (Regular)'];
                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveItem(item)}
                        className="group p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-navy-800/80 to-navy-900 border border-amber-500/20 hover:border-amber-400 text-center transition-all cursor-pointer relative shadow-md"
                      >
                        {/* Realistic Card Tray representation */}
                        <div className="w-14 h-10 mx-auto mb-2 rounded-lg bg-amber-400/20 border-2 border-dashed border-amber-400/50 flex items-center justify-center text-amber-300 font-black text-xs">
                          TRAY
                        </div>
                        <h4 className="text-white font-bold text-sm mb-0.5 group-hover:text-amber-300">
                          {item.nameAr}
                        </h4>
                        <span className="text-[10px] text-navy-400 block mb-2 font-mono">
                          {trayLabels[idx] || item.name}
                        </span>

                        <div className="inline-flex items-center gap-1 bg-amber-500 text-navy-950 font-black font-mono text-base px-3 py-1 rounded-xl shadow-md shadow-amber-500/20">
                          <span>{item.price}</span>
                          <span className="text-[10px] font-bold uppercase">EGP</span>
                        </div>

                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditItem(item);
                            }}
                            className="w-6 h-6 rounded bg-navy-900/90 hover:bg-brand-500 text-white flex items-center justify-center text-xs"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-navy-400 text-center py-4">لا توجد تراي بطاطس</p>
                )}
              </div>
            </div>
          </div>

          {/* ================= COLUMN 3 (Col-span-4): SANDWICHES (The Heart of Menu) ================= */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className="bg-navy-900/90 rounded-2xl border border-navy-700/80 overflow-hidden shadow-xl flex flex-col h-full">
              <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border-b border-navy-700/70 px-4 py-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                  <span className="tracking-widest text-base font-black uppercase text-amber-300">
                    SANDWICHES
                  </span>
                </div>
                <span className="text-xs font-bold text-navy-300 bg-navy-950/70 px-2.5 py-1 rounded-lg border border-navy-700">
                  {sandwiches.length} سندوتشات وراب
                </span>
              </div>

              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto max-h-[820px] scrollbar-thin">
                {sandwiches.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="group p-2.5 rounded-xl bg-navy-800/50 hover:bg-navy-800 border border-navy-700/60 hover:border-amber-400/60 transition-all duration-200 cursor-pointer flex flex-col justify-between relative shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h4 className="text-white font-bold text-xs group-hover:text-amber-300 transition-colors leading-tight">
                          {item.nameAr}
                        </h4>
                        <div className="bg-amber-500/15 text-amber-300 font-mono font-bold text-xs px-2 py-0.5 rounded-md border border-amber-500/30 shrink-0">
                          {item.price} <span className="text-[9px]">ج</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-navy-400 font-mono block mb-1 uppercase tracking-tighter truncate">
                        {item.name}
                      </span>
                    </div>

                    <p className="text-[10px] text-navy-300/80 leading-snug border-t border-navy-700/30 pt-1.5 mt-1 line-clamp-2">
                      {item.descriptionAr}
                    </p>

                    <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditItem(item);
                        }}
                        className="w-5 h-5 rounded bg-navy-900/90 hover:bg-brand-500 text-white flex items-center justify-center text-[10px]"
                        title="تعديل الصنف"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= COLUMN 4 (Col-span-3): SAUCES, MEALS, ADD-ONS & DRINKS ================= */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            {/* --- PICK A SAUCE --- */}
            <div className="bg-navy-900/80 rounded-2xl border border-red-500/30 overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-red-700 to-rose-800 px-4 py-2 flex items-center justify-between text-white font-black">
                <span className="tracking-wider text-xs font-black uppercase">PICK A SAUCE</span>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">
                  الصوصات
                </span>
              </div>

              <div className="p-3 grid grid-cols-2 gap-2 text-xs">
                {sauces.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="group p-2 rounded-lg bg-navy-800/60 hover:bg-navy-800 border border-navy-700/50 flex items-center justify-between gap-1 cursor-pointer transition-all"
                  >
                    <div className="truncate">
                      <span className="text-white font-bold text-xs block group-hover:text-amber-300 truncate">
                        {item.nameAr}
                      </span>
                      <span className="text-[9px] text-navy-400 block font-mono truncate">
                        {item.name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        item.price === 0
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.price === 0 ? 'مجاني' : `+${item.price} ج`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* --- MEALS --- */}
            <div className="bg-navy-900/80 rounded-2xl border border-amber-500/30 overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 flex items-center justify-between text-navy-950 font-black">
                <span className="tracking-wider text-xs font-black uppercase">MEALS</span>
                <span className="text-[10px] font-bold bg-navy-950/20 px-2 py-0.5 rounded">
                  وجبات الدجاج
                </span>
              </div>

              <div className="p-3 space-y-2.5">
                {meals.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="group p-2.5 rounded-xl bg-navy-800/60 hover:bg-navy-800 border border-navy-700/50 hover:border-amber-400 transition-all cursor-pointer relative"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-white font-bold text-xs group-hover:text-amber-300">
                        {item.nameAr}
                      </h4>
                      <span className="bg-amber-500 text-navy-950 font-black font-mono text-xs px-2 py-0.5 rounded-md">
                        {item.price} EGP
                      </span>
                    </div>
                    <p className="text-[10px] text-navy-300 leading-tight">
                      {item.descriptionAr}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* --- ADD-ONS --- */}
            <div className="bg-navy-900/80 rounded-2xl border border-red-500/20 overflow-hidden shadow-md">
              <div className="bg-gradient-to-r from-red-800 to-rose-900 px-3 py-1.5 flex items-center justify-between text-white font-black text-xs">
                <span className="uppercase">ADD-ONS</span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">إضافات</span>
              </div>
              <div className="p-2.5 grid grid-cols-3 gap-2 text-center text-xs">
                {addOns.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="p-1.5 rounded-lg bg-navy-800/50 border border-navy-700/50 hover:border-amber-400 cursor-pointer transition-colors"
                  >
                    <p className="text-white font-bold text-[11px] truncate">{item.nameAr}</p>
                    <p className="text-amber-400 font-mono text-[10px] font-bold mt-0.5">
                      {item.price} EGP
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* --- DRINKS --- */}
            <div className="bg-navy-900/80 rounded-2xl border border-blue-500/30 overflow-hidden shadow-md">
              <div className="bg-gradient-to-r from-blue-700 to-cyan-800 px-3 py-1.5 flex items-center justify-between text-white font-black text-xs">
                <span className="uppercase tracking-wider">DRINKS</span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">مشروبات</span>
              </div>
              <div className="p-2.5 grid grid-cols-2 gap-2 text-xs">
                {drinks.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="p-1.5 rounded-lg bg-navy-800/50 border border-navy-700/50 hover:border-cyan-400 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="truncate">
                      <p className="text-white font-semibold text-[11px] truncate">{item.nameAr}</p>
                      <p className="text-[9px] text-navy-400 font-mono truncate">{item.name}</p>
                    </div>
                    <span className="text-cyan-300 font-mono text-[10px] font-bold shrink-0">
                      {item.price} ج
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ================= Bottom Footer Bar ================= */}
        <div className="mt-5 pt-3 border-t border-navy-700/60 flex flex-wrap items-center justify-between text-xs text-navy-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>عرض حي من قاعدة البيانات المباشرة (37 صنفاً رسمياً لناين فرايز)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>الأسعار شاملة ضريبة القيمة المضافة</span>
            <span className="font-mono text-amber-400 font-bold">NINE FRIES • CAIRO</span>
          </div>
        </div>
      </div>

      {/* ================= Item Detail Quick Modal ================= */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="glass-card w-full max-w-md p-6 animate-scale-in border border-navy-700/80 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-navy-700/60 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {activeItem.categoryAr}
                </span>
                <h3 className="text-white font-bold text-lg mt-1">{activeItem.nameAr}</h3>
                <p className="text-navy-400 text-xs font-mono">{activeItem.name}</p>
              </div>
              <div className="text-left">
                <span className="text-2xl font-black font-mono text-amber-400">
                  {activeItem.price}
                </span>
                <span className="text-xs text-navy-400 block">جنيه مصري</span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-navy-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                المكونات والوصف
              </h5>
              <p className="text-xs text-navy-200 bg-navy-900/60 p-3 rounded-xl border border-navy-700/50 leading-relaxed">
                {activeItem.descriptionAr || 'لا يوجد وصف مسجل'}
              </p>
            </div>

            {activeItem.recipe && activeItem.recipe.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-navy-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  المكونات المربوطة بالمخزون ({activeItem.recipe.length})
                </h5>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                  {activeItem.recipe.map((r, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-navy-900/40 border border-navy-800 text-[11px] flex justify-between"
                    >
                      <span className="text-navy-200">{r.nameAr}</span>
                      <span className="font-mono text-amber-300">
                        {r.quantity} {r.unitAr}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-navy-700/50">
              <button
                onClick={() => {
                  const item = activeItem;
                  setActiveItem(null);
                  onEditItem(item);
                }}
                className="btn-primary flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل الصنف</span>
              </button>
              <button
                onClick={() => setActiveItem(null)}
                className="btn-ghost px-4 py-2 text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
