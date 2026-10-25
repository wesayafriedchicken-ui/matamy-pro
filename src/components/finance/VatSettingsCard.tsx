import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Percent,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  Receipt,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/helpers';

interface VatSettingsCardProps {
  onSaved?: () => void;
}

export default function VatSettingsCard({ onSaved }: VatSettingsCardProps) {
  const { taxRate, setTaxRate, showToast, showZeroVatInCart, setShowZeroVatInCart } = useApp();
  const [inputRate, setInputRate] = useState<string>(String(taxRate));
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    setInputRate(String(taxRate));
  }, [taxRate]);

  const numericInputRate = Math.max(0, Math.min(100, Number(inputRate) || 0));

  const handleApplyPreset = (val: number) => {
    setInputRate(String(val));
    setTaxRate(val);
    setIsSavedRecently(true);
    showToast(`تم تحديث نسبة ضريبة القيمة المضافة إلى ${val}% وتطبيقها على نقطة البيع (POS)`, 'success');
    setTimeout(() => setIsSavedRecently(false), 2500);
    onSaved?.();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = Math.max(0, Math.min(100, parseFloat(inputRate) || 0));
    setTaxRate(clean);
    setInputRate(String(clean));
    setIsSavedRecently(true);
    showToast(`تم حفظ نسبة الضريبة (${clean}%) بنجاح وتحديث شاشة نقطة البيع (POS)`, 'success');
    setTimeout(() => setIsSavedRecently(false), 2500);
    onSaved?.();
  };

  const presets = [
    { value: 0, label: '0% (معفاة / بدون ضريبة)', desc: 'الافتراضي الحالي' },
    { value: 5, label: '5%', desc: 'نسبة مخفضة' },
    { value: 10, label: '10%', desc: 'نسبة خاصة' },
    { value: 14, label: '14%', desc: 'النسبة العامة بمصر' },
    { value: 15, label: '15%', desc: 'النسبة الخليجية' },
  ];

  // Simulation on 100 EGP
  const sampleSubtotal = 100;
  const sampleTax = Math.round((sampleSubtotal * (numericInputRate / 100)) * 10) / 10;
  const sampleTotal = sampleSubtotal + sampleTax;

  return (
    <div className="glass-card p-5 sm:p-6 border border-brand-500/30 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-navy-700/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-sm">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                إعدادات ضريبة القيمة المضافة (VAT)
              </h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  taxRate === 0
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                }`}
              >
                {taxRate === 0 ? '0% معفاة حالياً' : `${taxRate}% مطبقة`}
              </span>
            </div>
            <p className="text-xs text-navy-400 mt-0.5">
              النسبة التي يتم احتسابها تلقائياً في سلة الطلب والحساب داخل نقطة البيع (POS) والفواتير
            </p>
          </div>
        </div>

        <Link
          to="/orders/new"
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white text-xs font-medium border border-navy-700/60 transition-all flex items-center gap-1.5"
        >
          <span>معاينة في نقطة البيع (POS)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Configuration Section */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Presets and Custom Input */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <label className="text-xs font-semibold text-navy-300 mb-2 block">
              النسب السريعة الشائعة (اختر للتطبيق الفوري):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {presets.map((preset) => {
                const isActive = taxRate === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleApplyPreset(preset.value)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-brand-500/20 border-brand-500 text-white shadow-md shadow-brand-500/10'
                        : 'bg-navy-900/70 border-navy-700/60 text-navy-300 hover:bg-navy-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm">{preset.label}</span>
                      {isActive && <Check className="w-4 h-4 text-brand-400" />}
                    </div>
                    <span className="text-[10px] text-navy-400 mt-1">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Percentage Form */}
          <form onSubmit={handleSave} className="bg-navy-900/70 p-3.5 rounded-2xl border border-navy-700/50 space-y-3">
            <label className="text-xs font-semibold text-navy-300 block">
              أو حدد نسبة ضريبة مخصصة يدوياً (%):
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={inputRate}
                  onChange={(e) => setInputRate(e.target.value)}
                  placeholder="0"
                  className="w-full bg-navy-950 border border-navy-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-navy-500 focus:outline-none focus:border-brand-500 pl-10"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 text-sm font-bold">
                  %
                </span>
              </div>

              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  isSavedRecently
                    ? 'bg-emerald-500 text-white'
                    : 'bg-brand-500 hover:bg-brand-400 text-white shadow-md shadow-brand-500/20'
                }`}
              >
                {isSavedRecently ? (
                  <>
                    <Check className="w-4 h-4" />
                    تم الحفظ!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    حفظ وتطبيق
                  </>
                )}
              </button>

              {taxRate !== 0 && (
                <button
                  type="button"
                  onClick={() => handleApplyPreset(0)}
                  className="px-3 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white text-xs font-medium border border-navy-700/60 transition-all flex items-center gap-1.5"
                  title="إعادة التعيين إلى 0% معفاة"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تصفير (0%)</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-navy-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>
                التعديل يُحفظ مباشرة ويتم تطبيقه على الفور في شاشة نقطة البيع (POS) وسلة الطلب.
              </span>
            </p>
          </form>
        </div>

        {/* Live Calculation Preview Card */}
        <div className="lg:col-span-5 bg-navy-900/90 rounded-2xl p-4 border border-navy-700/70 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-navy-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-brand-400" />
              معاينة الفاتورة وحساب الضريبة
            </span>
            <span className="text-[10px] text-brand-400 font-mono bg-brand-500/10 px-2 py-0.5 rounded">
              طلب افتراضي بقيمة 100 ج.م
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-navy-300">
              <span>المجموع الفرعي (Subtotal)</span>
              <span className="font-mono">{formatCurrency(sampleSubtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-navy-200">
              <span className="flex items-center gap-1">
                <span>ضريبة القيمة المضافة ({numericInputRate}%)</span>
                {numericInputRate === 0 && (
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded font-medium">
                    معفاة
                  </span>
                )}
              </span>
              <span
                className={`font-mono font-bold ${
                  numericInputRate === 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {formatCurrency(sampleTax)}
              </span>
            </div>
            <div className="pt-2 border-t border-navy-800 flex justify-between items-center text-white font-bold">
              <span>الإجمالي المطلوب دفعه (Total)</span>
              <span className="font-mono text-brand-400 text-sm">
                {formatCurrency(sampleTotal)}
              </span>
            </div>
          </div>

          <div className="bg-navy-950/60 p-2.5 rounded-xl border border-navy-800 text-[11px] text-navy-300 space-y-1">
            <div className="flex items-center gap-1.5 text-brand-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>الحالة الحالية في نقطة البيع POS:</span>
            </div>
            <p className="text-navy-400">
              {taxRate === 0
                ? 'الضريبة الحالية 0% (لا توجد أي مبالغ ضريبية مضافة على فواتير العملاء).'
                : `الضريبة الحالية ${taxRate}% (يتم إضافة ${taxRate}% تلقائياً على كل صنف في سلة الطلب).`}
            </p>
          </div>
        </div>
      </div>

      {/* Zero VAT Display Toggle in POS Cart */}
      <div className="mt-5 pt-5 border-t border-navy-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900/60 p-4 rounded-2xl border border-navy-700/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-800 border border-navy-700/80 flex items-center justify-center shrink-0 mt-0.5">
            {showZeroVatInCart ? (
              <Eye className="w-5 h-5 text-emerald-400" />
            ) : (
              <EyeOff className="w-5 h-5 text-navy-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white">
                إظهار / إخفاء بند "ضريبة القيمة المضافة (0%)" في سلة الطلب والحساب (POS)
              </h4>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                  showZeroVatInCart
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-navy-800 text-navy-400 border-navy-700/60'
                }`}
              >
                {showZeroVatInCart ? 'مفعّل: يظهر بند (0%) في السلة' : 'معطل: مخفي من السلة'}
              </span>
            </div>
            <p className="text-xs text-navy-400 mt-1">
              {showZeroVatInCart
                ? 'يظهر سطر "ضريبة القيمة المضافة (0%) 0 ج.م" في سلة الكاشير كإثبات لإعفاء الفاتورة من الضريبة.'
                : 'يتم إخفاء سطر الضريبة بالكامل من سلة الطلب والحساب عندما تكون النسبة 0% لتبسيط عرض الفاتورة.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const nextVal = !showZeroVatInCart;
            setShowZeroVatInCart(nextVal);
            showToast(
              nextVal
                ? 'تم إظهار بند ضريبة القيمة المضافة (0%) في سلة الطلب والحساب'
                : 'تم إخفاء بند ضريبة القيمة المضافة (0%) من سلة الطلب والحساب',
              'info'
            );
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 self-start sm:self-center shrink-0 shadow-sm ${
            showZeroVatInCart
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
              : 'bg-navy-800 hover:bg-navy-700 text-navy-200 border-navy-700/80 hover:text-white'
          }`}
        >
          {showZeroVatInCart ? (
            <>
              <EyeOff className="w-4 h-4 text-emerald-400" />
              <span>إخفاء من السلة</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-brand-400" />
              <span>إظهار في السلة</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
