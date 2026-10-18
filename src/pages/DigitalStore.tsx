import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store, Globe, Smartphone, ToggleLeft, ToggleRight, Palette,
  Image as ImageIcon, Star, Eye, ShoppingCart, Percent, Tag,
  Layers, ChevronLeft, Settings,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

export default function DigitalStore() {
  const [appEnabled, setAppEnabled] = useState(true);
  const [websiteEnabled, setWebsiteEnabled] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="animate-fade-in">
      <PageHeader title="إدارة التطبيق والموقع" description="إعدادات المتجر الإلكتروني والتطبيق" />

      {/* Sub-route nav */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit">
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <Store className="w-4 h-4" />
          لوحة المتجر
        </span>
        <Link to="/digital-store/builder" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Layers className="w-4 h-4" />
          البناء المرئي
        </Link>
      </div>

      {/* Builder CTA banner */}
      <Link to="/digital-store/builder" className="block mb-6">
        <div className="glass-card p-5 hover:border-brand-500/40 transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center">
                <Layers className="w-7 h-7 text-brand-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">البناء المرئي للمتجر</h3>
                <p className="text-navy-400 text-sm">صمم واجهة تطبيقك وموقعك بمعاينة مباشرة - أضف أقساماً، غير الألوان، ونسق العرض</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-brand-400 group-hover:gap-3 transition-all">
              <span className="text-sm font-medium">افتح البناء</span>
              <ChevronLeft className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Status */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-brand-500/15 flex items-center justify-center">
              <Store className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">حالة المتجر</h3>
              <p className="text-navy-400 text-sm">قنوات البيع</p>
            </div>
          </div>
          <div className="space-y-4">
            <ToggleRow icon={Smartphone} label="تطبيق الموبايل" desc="متاح للطلب عبر التطبيق" enabled={appEnabled} onToggle={() => setAppEnabled(!appEnabled)} />
            <ToggleRow icon={Globe} label="الموقع الإلكتروني" desc="متاح للطلب عبر الموقع" enabled={websiteEnabled} onToggle={() => setWebsiteEnabled(!websiteEnabled)} />
            <ToggleRow icon={ShoppingCart} label="قبول تلقائي للطلبات" desc="قبول الطلبات بدون مراجعة" enabled={autoAccept} onToggle={() => setAutoAccept(!autoAccept)} />
            <ToggleRow icon={Star} label="إشعارات الطلبات" desc="تنبيهات فورية للطلبات الجديدة" enabled={notifications} onToggle={() => setNotifications(!notifications)} />
          </div>
        </div>

        {/* Appearance quick settings */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/15 flex items-center justify-center">
              <Palette className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">المظهر السريع</h3>
              <p className="text-navy-400 text-sm">تخصيص واجهة المتجر</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-navy-300 text-sm font-medium mb-2 block">شعار المتجر</label>
              <div className="h-24 rounded-2xl bg-navy-900/50 border-2 border-dashed border-navy-700/60 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-500/50 transition-all">
                <ImageIcon className="w-6 h-6 text-navy-500" />
                <span className="text-navy-400 text-xs">اضغط لرفع الشعار</span>
              </div>
            </div>
            <div>
              <label className="text-navy-300 text-sm font-medium mb-2 block">اللون الأساسي</label>
              <div className="flex items-center gap-2">
                {['#f97316', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#06b6d4'].map((color) => (
                  <button key={color} className="w-9 h-9 rounded-xl border-2 border-navy-700 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <Link to="/digital-store/builder" className="btn-ghost w-full flex items-center justify-center gap-2 text-sm mt-2">
              <Settings className="w-4 h-4" />
              تخصيص كامل في البناء المرئي
            </Link>
          </div>
        </div>

        {/* Promotions */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-success-500/15 flex items-center justify-center">
              <Tag className="w-6 h-6 text-success-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">العروض الترويجية</h3>
              <p className="text-navy-400 text-sm">كوبونات وخصومات</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm font-medium">خصم 20%</span>
                <span className="bg-success-500/15 text-success-400 text-xs px-2 py-0.5 rounded-md">نشط</span>
              </div>
              <p className="text-navy-400 text-xs">كود: SAVE20 - صالح حتى 30 سبتمبر</p>
            </div>
            <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm font-medium">توصيل مجاني</span>
                <span className="bg-success-500/15 text-success-400 text-xs px-2 py-0.5 rounded-md">نشط</span>
              </div>
              <p className="text-navy-400 text-xs">كود: FREEDEL - للطلبات فوق 200 ج</p>
            </div>
            <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm font-medium">وجبة العائلة -15%</span>
                <span className="bg-navy-700/50 text-navy-400 text-xs px-2 py-0.5 rounded-md">منتهي</span>
              </div>
              <p className="text-navy-400 text-xs">كود: FAMILY15 - انتهى في 10 سبتمبر</p>
            </div>
            <button className="w-full btn-ghost flex items-center justify-center gap-2 mt-2">
              <Percent className="w-4 h-4" />
              إضافة عرض جديد
            </button>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-navy-400 text-sm">زيارات الموقع</p>
              <p className="text-white font-bold text-2xl">3,240</p>
            </div>
          </div>
          <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '72%' }} />
          </div>
          <p className="text-navy-400 text-xs mt-2">72% من هدف الشهر</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="text-navy-400 text-sm">طلبات أونلاين</p>
              <p className="text-white font-bold text-2xl">847</p>
            </div>
          </div>
          <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full" style={{ width: '85%' }} />
          </div>
          <p className="text-navy-400 text-xs mt-2">85% من هدف الشهر</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-success-500/15 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-success-400" />
            </div>
            <div>
              <p className="text-navy-400 text-sm">تحميلات التطبيق</p>
              <p className="text-white font-bold text-2xl">1,560</p>
            </div>
          </div>
          <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
            <div className="h-full bg-success-500 rounded-full" style={{ width: '62%' }} />
          </div>
          <p className="text-navy-400 text-xs mt-2">62% من هدف الشهر</p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, desc, enabled, onToggle }: {
  icon: typeof Store; label: string; desc: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-success-500/15 text-success-400' : 'bg-navy-700/50 text-navy-400'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-white text-sm font-medium">{label}</p>
          <p className="text-navy-400 text-xs">{desc}</p>
        </div>
      </div>
      <button onClick={onToggle} className="shrink-0">
        {enabled ? <ToggleRight className="w-10 h-10 text-success-400" /> : <ToggleLeft className="w-10 h-10 text-navy-500" />}
      </button>
    </div>
  );
}
