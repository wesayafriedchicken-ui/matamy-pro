import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import LiveOrders from '@/pages/LiveOrders';
import KitchenDisplay from '@/pages/KitchenDisplay';
import DispatchAssignment from '@/pages/DispatchAssignment';
import DispatchDelivery from '@/pages/DispatchDelivery';
import DispatchDeliveryNew from '@/pages/DispatchDeliveryNew';
import DispatchTracking from '@/pages/DispatchTracking';
import DispatchCustody from '@/pages/DispatchCustody';
import DispatchDeliveryZones from '@/pages/DispatchDeliveryZones';
import MenuManagement from '@/pages/MenuManagement';
import InventoryStock from '@/pages/InventoryStock';
import InventoryItemDetail from '@/pages/InventoryItemDetail';
import InventoryRecipes from '@/pages/InventoryRecipes';
import DigitalStore from '@/pages/DigitalStore';
import DigitalStoreBuilder from '@/pages/DigitalStoreBuilder';
import CashDrawer from '@/pages/CashDrawer';
import ChartOfAccounts from '@/pages/ChartOfAccounts';
import FinancialReports from '@/pages/FinancialReports';
import TaxSettings from '@/pages/TaxSettings';
import ShiftSchedule from '@/pages/ShiftSchedule';
import ShiftTasks from '@/pages/ShiftTasks';
import ShiftPayroll from '@/pages/ShiftPayroll';
import EmployeesManagement from '@/pages/EmployeesManagement';
import EmployeeDetail from '@/pages/EmployeeDetail';
import OrderDetail from '@/pages/OrderDetail';
import CreateOrder from '@/pages/CreateOrder';
import Login from '@/pages/Login';
import RolesManagement from '@/pages/RolesManagement';
import UsersManagement from '@/pages/UsersManagement';
import RoleCreateOrEdit from '@/pages/RoleCreateOrEdit';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <ProtectedRoute requiredPermission="dashboard.view" pageTitleAr="لوحة التحكم الرئيسية">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute requiredPermission="orders.view" pageTitleAr="الطلبات اللحظية (Kanban)">
                  <LiveOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/new"
              element={
                <ProtectedRoute requiredPermission="orders.create" pageTitleAr="إنشاء طلب جديد (POS)">
                  <CreateOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute requiredPermission="orders.view" pageTitleAr="تفاصيل الطلب">
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kds"
              element={
                <ProtectedRoute requiredPermission="kds.view" pageTitleAr="شاشة المطبخ (KDS)">
                  <KitchenDisplay />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispatch"
              element={
                <ProtectedRoute requiredPermission="dispatch.view" pageTitleAr="توزيع الطلبات والمناديب">
                  <DispatchAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispatch/delivery"
              element={
                <ProtectedRoute requiredPermission="dispatch.view" pageTitleAr="قائمة مناديب التوصيل">
                  <DispatchDelivery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispatch/delivery/new"
              element={
                <ProtectedRoute requiredPermission="dispatch.assign" pageTitleAr="إضافة مندوب توصيل">
                  <DispatchDeliveryNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispatch/delivery/:id"
              element={
                <ProtectedRoute requiredPermission="dispatch.assign" pageTitleAr="تعديل بيانات المندوب">
                  <DispatchDeliveryNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispatch/tracking"
              element={
                <ProtectedRoute requiredPermission="dispatch.view" pageTitleAr="التتبع المباشر للأسطول">
                  <DispatchTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispatch/custody"
              element={
                <ProtectedRoute requiredPermission="dispatch.custody" pageTitleAr="العهد والخزينة اليومية للمناديب">
                  <DispatchCustody />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dispatch/delivery-zones"
              element={
                <ProtectedRoute requiredPermission="dispatch.assign" pageTitleAr="مناطق وزونات التوصيل">
                  <DispatchDeliveryZones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/menu"
              element={
                <ProtectedRoute requiredPermission="menu.manage" pageTitleAr="قائمة الطعام والأسعار">
                  <MenuManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute requiredPermission="inventory.view" pageTitleAr="المخزون وأرصدة الخامات">
                  <InventoryStock />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/:id"
              element={
                <ProtectedRoute requiredPermission="inventory.view" pageTitleAr="تفاصيل صنف المخزون">
                  <InventoryItemDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/recipes"
              element={
                <ProtectedRoute requiredPermission="inventory.manage" pageTitleAr="تركيب الوجبات والوصفات (BOM)">
                  <InventoryRecipes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/digital-store"
              element={
                <ProtectedRoute requiredPermission="digital_store.manage" pageTitleAr="إدارة المتجر الإلكتروني">
                  <DigitalStore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/digital-store/builder"
              element={
                <ProtectedRoute requiredPermission="digital_store.manage" pageTitleAr="البناء المرئي للمتجر">
                  <DigitalStoreBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/financials/cash-drawer"
              element={
                <ProtectedRoute requiredPermission="financials.manage" pageTitleAr="خزينة الكاشير اليومية">
                  <CashDrawer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/financials/chart-of-accounts"
              element={
                <ProtectedRoute requiredPermission="financials.view" pageTitleAr="دليل الحسابات المالي">
                  <ChartOfAccounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/financials/reports"
              element={
                <ProtectedRoute requiredPermission="financials.view" pageTitleAr="التقارير المالية والميزانية">
                  <FinancialReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/financials/tax-settings"
              element={
                <ProtectedRoute requiredPermission="financials.manage" pageTitleAr="إعدادات ضريبة القيمة المضافة (VAT)">
                  <TaxSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shifts/schedule"
              element={
                <ProtectedRoute requiredPermission="shifts.manage" pageTitleAr="جدول الورديات والحضور">
                  <ShiftSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shifts/employees"
              element={
                <ProtectedRoute requiredPermission="shifts.manage" pageTitleAr="سجل الموظفين والرواتب">
                  <EmployeesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shifts/employees/:employeeId"
              element={
                <ProtectedRoute requiredPermission="shifts.manage" pageTitleAr="ملف الموظف وسجل الورديات">
                  <EmployeeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shifts/tasks"
              element={
                <ProtectedRoute requiredPermission="shifts.manage" pageTitleAr="مهام الشيفت والتسليم">
                  <ShiftTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shifts/payroll"
              element={
                <ProtectedRoute requiredPermission="shifts.manage" pageTitleAr="الرواتب وساعات العمل">
                  <ShiftPayroll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredPermission="users.manage" pageTitleAr="إدارة المستخدمين والحسابات">
                  <UsersManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/roles"
              element={
                <ProtectedRoute requiredPermission="roles.manage" pageTitleAr="إدارة الأدوار والصلاحيات">
                  <RolesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/roles/new"
              element={
                <ProtectedRoute requiredPermission="roles.manage" pageTitleAr="إنشاء دور وظيفي جديد ومصفوفة الصلاحيات">
                  <RoleCreateOrEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/roles/:roleId"
              element={
                <ProtectedRoute requiredPermission="roles.manage" pageTitleAr="تفاصيل وتعديل الدور الوظيفي">
                  <RoleCreateOrEdit />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
