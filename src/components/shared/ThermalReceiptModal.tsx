import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order } from '@/types';
import {
  printThermalReceipts,
  buildCustomerReceiptHtml,
  buildKitchenTicketHtml,
  THERMAL_RECEIPT_CSS,
} from '@/utils/thermalPrinter';
import {
  Printer,
  X,
  CheckCircle2,
  UtensilsCrossed,
  Receipt,
  Plus,
  HelpCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  cashierName?: string;
  isAutoPrinted?: boolean;
}

export default function ThermalReceiptModal({
  isOpen,
  onClose,
  order,
  cashierName = 'احمد',
  isAutoPrinted: _isAutoPrinted = false,
}: ThermalReceiptModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'both' | 'customer' | 'kitchen'>('both');
  const [showPrinterGuide, setShowPrinterGuide] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrintBoth = () => {
    printThermalReceipts(order, { cashierName, mode: 'both' });
    setHasPrinted(true);
  };

  const handlePrintCustomer = () => {
    printThermalReceipts(order, { cashierName, mode: 'customer' });
    setHasPrinted(true);
  };

  const handlePrintKitchen = () => {
    printThermalReceipts(order, { cashierName, mode: 'kitchen' });
    setHasPrinted(true);
  };

  const customerHtml = buildCustomerReceiptHtml(order, { cashierName });
  const kitchenHtml = buildKitchenTicketHtml(order, { cashierName });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="bg-navy-900 border border-navy-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-navy-800 bg-navy-950/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Printer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base sm:text-lg">
                  طباعة الإيصالات الحرارية (Xprinter 80mm)
                </h3>
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {hasPrinted ? 'تمت إعادة الإرسال للطابعة بنجاح' : 'أمر الطباعة جاهز'}
                </span>
              </div>
              <p className="text-navy-400 text-xs mt-0.5">
                طابعة الفواتير Xprinter XP-Q833L (عرض الورق 80mm) • الطلب {order.orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrinterGuide(!showPrinterGuide)}
              className="px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white text-xs border border-navy-700/60 transition-all flex items-center gap-1.5"
              title="دليل ضبط إعدادات طابعة Xprinter"
            >
              <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
              <span>إرشادات الطابعة</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 flex items-center justify-center text-navy-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printer Guide Drawer if toggled */}
        {showPrinterGuide && (
          <div className="p-4 bg-brand-500/10 border-b border-brand-500/20 text-xs text-navy-200 space-y-2">
            <div className="font-bold text-brand-300 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-brand-400" />
              إعدادات طابعة Xprinter XP-Q833L (80mm) للطباعة المثالية:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="bg-navy-900/80 p-2.5 rounded-lg border border-navy-700/60">
                <span className="text-brand-400 font-bold block mb-1">1. حجم الورق (Paper Size):</span>
                اختر <strong>80mm Roll</strong> أو <strong>80 x 297 mm</strong> في شاشة الطباعة.
              </div>
              <div className="bg-navy-900/80 p-2.5 rounded-lg border border-navy-700/60">
                <span className="text-brand-400 font-bold block mb-1">2. الهوامش (Margins):</span>
                حدد <strong>بلا (None)</strong> أو <strong>الحد الأدنى (Minimum)</strong> لعدم إهدار الورق.
              </div>
              <div className="bg-navy-900/80 p-2.5 rounded-lg border border-navy-700/60">
                <span className="text-brand-400 font-bold block mb-1">3. الرؤوس والتذييل:</span>
                قم بإلغاء تحديد <strong>Headers & Footers</strong> حتى لا يطبع المتصفح رابط الموقع وتاريخ اليوم.
              </div>
            </div>
          </div>
        )}

        {/* Modal Controls Bar */}
        <div className="px-5 py-3 bg-navy-900/90 border-b border-navy-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-navy-950 p-1 rounded-xl border border-navy-800">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'both'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-navy-300 hover:text-white'
              }`}
            >
              <span>معاينة الإيصالين (2)</span>
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'customer'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-navy-300 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>إيصال العميل</span>
            </button>
            <button
              onClick={() => setActiveTab('kitchen')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'kitchen'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-navy-300 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>بون المطبخ</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintCustomer}
              className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 border border-navy-700/70"
              title="طباعة إيصال العميل فقط"
            >
              <Receipt className="w-3.5 h-3.5 text-blue-400" />
              <span>طباعة العميل فقط</span>
            </button>
            <button
              onClick={handlePrintKitchen}
              className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 border border-navy-700/70"
              title="طباعة بون المطبخ فقط"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
              <span>طباعة المطبخ فقط</span>
            </button>
            <button
              onClick={handlePrintBoth}
              className="btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5 shadow-lg shadow-brand-500/25"
              title="طباعة الإيصالين معاً على طابعة Xprinter 80mm"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الإيصالين الآن</span>
            </button>
          </div>
        </div>

        {/* Paper Previews Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-navy-950/70 flex justify-center items-start">
          <style dangerouslySetInnerHTML={{ __html: THERMAL_RECEIPT_CSS }} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl justify-items-center">
            {/* Customer Receipt Preview */}
            {(activeTab === 'both' || activeTab === 'customer') && (
              <div className="w-full max-w-[320px] flex flex-col items-center">
                <div className="text-xs font-bold text-navy-300 mb-2 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-brand-400" />
                  <span>1. إيصال الحساب والعميل (Customer Receipt)</span>
                </div>
                <div className="w-full bg-white text-black p-4 rounded-lg shadow-2xl border border-gray-300 font-mono text-[11px] leading-tight select-none transform hover:scale-[1.01] transition-transform">
                  <div
                    dangerouslySetInnerHTML={{ __html: customerHtml }}
                    className="thermal-preview-container"
                  />
                  <div className="mt-3 pt-2 border-t border-dashed border-gray-400 text-center text-[10px] text-gray-500">
                    ✂️ خط قطع الورق التلقائي (Auto Cutter)
                  </div>
                </div>
              </div>
            )}

            {/* Kitchen Docket Preview */}
            {(activeTab === 'both' || activeTab === 'kitchen') && (
              <div className="w-full max-w-[320px] flex flex-col items-center">
                <div className="text-xs font-bold text-navy-300 mb-2 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                  <span>2. بون تشغيل المطبخ (Kitchen Ticket - KDS)</span>
                </div>
                <div className="w-full bg-white text-black p-4 rounded-lg shadow-2xl border border-gray-300 font-mono text-[11px] leading-tight select-none transform hover:scale-[1.01] transition-transform">
                  <div
                    dangerouslySetInnerHTML={{ __html: kitchenHtml }}
                    className="thermal-preview-container"
                  />
                  <div className="mt-3 pt-2 border-t border-dashed border-gray-400 text-center text-[10px] text-gray-500">
                    ✂️ نهاية بون المطبخ
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions Footer */}
        <div className="px-5 py-3.5 border-t border-navy-800 bg-navy-950/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-navy-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>جاهز للإرسال إلى طابعة USB Xprinter (XP-Q833L)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                onClose();
                navigate('/orders');
              }}
              className="btn-ghost text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>لوحة الطلبات</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>طلب جديد (POS)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
