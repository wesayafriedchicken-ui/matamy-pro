import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ToastContainer from '@/components/shared/ToastContainer';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'نظرة عامة', subtitle: 'ملخص أداء المطعم اليوم' },
  '/orders': { title: 'الطلبات اللحظية', subtitle: 'متابعة الطلبات في الوقت الفعلي' },
  '/orders/new': { title: 'إنشاء طلب جديد (POS)', subtitle: 'نقطة البيع وتسجيل الطلبات المباشرة' },
  '/kds': { title: 'شاشة المطبخ', subtitle: 'نظام عرض الطلبات للمطبخ' },
  '/dispatch': { title: 'المناديب والتوزيع', subtitle: 'توزيع الطلبات على المناديب' },
  '/dispatch/delivery': { title: 'المناديب والتوصيل (Delivery)', subtitle: 'سجل وإدارة أسطول المناديب وتعيين المناطق' },
  '/dispatch/delivery/new': { title: 'إضافة مندوب جديد (Create Rider)', subtitle: 'تسجيل وتكوين بيانات المندوب والمركبة والعهد' },
  '/dispatch/tracking': { title: 'التتبع المباشر', subtitle: 'تتبع المناديب على الخريطة' },
  '/dispatch/custody': { title: 'العهد والخزينة', subtitle: 'تسوية العهد النقدية للمناديب' },
  '/menu': { title: 'المنيو والأصناف', subtitle: 'إدارة الأصناف والأسعار والتخصيصات' },
  '/inventory': { title: 'المخزون والوصفات', subtitle: 'إدارة المواد الخام والمخزون والجرد' },
  '/inventory/recipes': { title: 'تركيب الوجبات والوصفات', subtitle: 'ربط الأصناف بالمخزون وحساب التكلفة' },
  '/digital-store': { title: 'إدارة التطبيق والموقع', subtitle: 'إعدادات المتجر الإلكتروني' },
  '/digital-store/builder': { title: 'البناء المرئي للمتجر', subtitle: 'تصميم واجهة التطبيق والموقع بمعاينة مباشرة' },
  '/financials/cash-drawer': { title: 'الخزينة اليومية', subtitle: 'الخزينة والحركة النقدية اليومية' },
  '/financials/chart-of-accounts': { title: 'دليل الحسابات', subtitle: 'الشجرة المحاسبية للمطعم' },
  '/financials/reports': { title: 'التقارير والميزانية', subtitle: 'قائمة الدخل والميزانية العمومية' },
  '/shifts/schedule': { title: 'الورديات والمهام', subtitle: 'جدولة الورديات وتتبع الحضور' },
  '/shifts/tasks': { title: 'المهام وتسليم الشيفت', subtitle: 'قوائم الافتتاح والإغلاق وتسليم الشيفت' },
  '/shifts/payroll': { title: 'الرواتب والساعات', subtitle: 'كشف الرواتب وساعات العمل والاستقطاعات' },
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isOrderDetail =
    location.pathname.startsWith('/orders/') && location.pathname !== '/orders/new';
  const isRiderEdit =
    location.pathname.startsWith('/dispatch/delivery/') && location.pathname !== '/dispatch/delivery/new';
  const meta = isOrderDetail
    ? { title: 'تفاصيل الطلب', subtitle: 'متابعة وتتبع الطلب' }
    : isRiderEdit
    ? { title: 'تعديل بيانات المندوب', subtitle: 'تحديث بيانات وملف المندوب' }
    : pageMeta[location.pathname] ?? { title: 'لوحة التحكم', subtitle: '' };

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
