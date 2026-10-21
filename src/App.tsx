import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import Layout from '@/components/layout/Layout';
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
import ShiftSchedule from '@/pages/ShiftSchedule';
import ShiftTasks from '@/pages/ShiftTasks';
import ShiftPayroll from '@/pages/ShiftPayroll';
import OrderDetail from '@/pages/OrderDetail';
import CreateOrder from '@/pages/CreateOrder';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<LiveOrders />} />
            <Route path="/orders/new" element={<CreateOrder />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/kds" element={<KitchenDisplay />} />
            <Route path="/dispatch" element={<DispatchAssignment />} />
            <Route path="/dispatch/delivery" element={<DispatchDelivery />} />
            <Route path="/dispatch/delivery/new" element={<DispatchDeliveryNew />} />
            <Route path="/dispatch/delivery/:id" element={<DispatchDeliveryNew />} />
            <Route path="/dispatch/tracking" element={<DispatchTracking />} />
            <Route path="/dispatch/custody" element={<DispatchCustody />} />
            <Route path="/dispatch/delivery-zones" element={<DispatchDeliveryZones />} />
            <Route path="/menu" element={<MenuManagement />} />
            <Route path="/inventory" element={<InventoryStock />} />
            <Route path="/inventory/:id" element={<InventoryItemDetail />} />
            <Route path="/inventory/recipes" element={<InventoryRecipes />} />
            <Route path="/digital-store" element={<DigitalStore />} />
            <Route path="/digital-store/builder" element={<DigitalStoreBuilder />} />
            <Route path="/financials/cash-drawer" element={<CashDrawer />} />
            <Route path="/financials/chart-of-accounts" element={<ChartOfAccounts />} />
            <Route path="/financials/reports" element={<FinancialReports />} />
            <Route path="/shifts/schedule" element={<ShiftSchedule />} />
            <Route path="/shifts/tasks" element={<ShiftTasks />} />
            <Route path="/shifts/payroll" element={<ShiftPayroll />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
