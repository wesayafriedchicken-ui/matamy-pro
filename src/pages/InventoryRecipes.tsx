import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  ChefHat, Package, DollarSign, TrendingUp, ClipboardList,
} from 'lucide-react';
import {
  calculateFoodCost, calculateProfitMargin, calculateProfit, getStockStatus,
} from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';

export default function InventoryRecipes() {
  const { menuItems, inventory } = useApp();
  const [selectedItemId, setSelectedItemId] = useState<string>(menuItems[0]?.id ?? '');

  const selectedItem = menuItems.find((m) => m.id === selectedItemId) ?? menuItems[0];
  if (!selectedItem) return null;

  const foodCost = calculateFoodCost(selectedItem.recipe);
  const profit = calculateProfit(selectedItem.price, foodCost);
  const margin = calculateProfitMargin(selectedItem.price, foodCost);
  const foodCostPct = Math.round((foodCost / selectedItem.price) * 100);

  return (
    <div className="animate-fade-in">
      <PageHeader title="المخزون والوصفات" description="تركيب الوجبات والوصفات - Bill of Materials" />

      {/* Route-based navigation (replaces tab switcher) */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit">
        <Link to="/inventory" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all">
          <Package className="w-4 h-4" />
          المواد الخام بالمخزن
        </Link>
        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <ChefHat className="w-4 h-4" />
          تركيب الوجبات والوصفات
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items List */}
        <div className="glass-card p-4 lg:max-h-[calc(100vh-280px)] overflow-y-auto">
          <h3 className="text-white font-bold text-sm mb-3 px-2 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-brand-400" />
            قائمة الأصناف
          </h3>
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const itemCost = calculateFoodCost(item.recipe);
              const itemMargin = calculateProfitMargin(item.price, itemCost);
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`w-full text-right flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    selectedItemId === item.id
                      ? 'bg-brand-500/15 border border-brand-500/30'
                      : 'hover:bg-navy-800/40 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedItemId === item.id ? 'bg-brand-500/20 text-brand-400' : 'bg-navy-700/50 text-navy-400'
                  }`}>
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${selectedItemId === item.id ? 'text-white' : 'text-navy-200'}`}>
                      {item.nameAr}
                    </p>
                    <p className="text-navy-400 text-xs">{item.categoryAr} • {item.recipe.length} مكون</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-white text-sm font-bold font-mono">{item.price} ج</p>
                    <p className={`text-xs ${itemMargin > 60 ? 'text-success-400' : itemMargin > 40 ? 'text-warning-400' : 'text-danger-400'}`}>
                      {itemMargin}%
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recipe Detail */}
        <div className="lg:col-span-2 space-y-5">
          {/* Dish Header */}
          <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center">
                  <ChefHat className="w-7 h-7 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">{selectedItem.nameAr}</h3>
                  <p className="text-navy-400 text-sm">{selectedItem.categoryAr} • {selectedItem.name}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-navy-400 text-xs">سعر البيع</p>
                <p className="text-white font-bold text-2xl font-mono">{selectedItem.price} <span className="text-sm text-navy-400">ج</span></p>
              </div>
            </div>

            {/* Food Cost Calculator */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40 text-center">
                <div className="flex items-center justify-center gap-1 text-navy-400 text-xs mb-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  تكلفة المكونات
                </div>
                <p className="text-warning-400 font-bold text-lg font-mono">{Math.round(foodCost * 10) / 10} ج</p>
              </div>
              <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40 text-center">
                <div className="flex items-center justify-center gap-1 text-navy-400 text-xs mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  صافي الربح
                </div>
                <p className="text-success-400 font-bold text-lg font-mono">{profit} ج</p>
              </div>
              <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40 text-center">
                <div className="flex items-center justify-center gap-1 text-navy-400 text-xs mb-1">
                  <Package className="w-3.5 h-3.5" />
                  هامش الربح
                </div>
                <p className={`font-bold text-lg ${margin > 60 ? 'text-success-400' : margin > 40 ? 'text-warning-400' : 'text-danger-400'}`}>
                  {margin}%
                </p>
              </div>
              <div className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40 text-center">
                <div className="flex items-center justify-center gap-1 text-navy-400 text-xs mb-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  Food Cost %
                </div>
                <p className={`font-bold text-lg ${foodCostPct < 35 ? 'text-success-400' : foodCostPct < 50 ? 'text-warning-400' : 'text-danger-400'}`}>
                  {foodCostPct}%
                </p>
              </div>
            </div>

            {/* Margin Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-navy-400 text-xs">هامش الربح</span>
                <span className={`text-sm font-bold ${margin > 60 ? 'text-success-400' : margin > 40 ? 'text-warning-400' : 'text-danger-400'}`}>
                  {margin}%
                </span>
              </div>
              <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    margin > 60 ? 'bg-success-500' : margin > 40 ? 'bg-warning-500' : 'bg-danger-500'
                  }`}
                  style={{ width: `${margin}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ingredient Breakdown */}
          <div className="glass-card p-6">
            <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-brand-400" />
              مكونات الوصفة (Bill of Materials)
            </h4>
            <div className="space-y-2">
              {selectedItem.recipe.map((ing, i) => {
                const invItem = inventory.find((inv) => inv.id === ing.inventoryId);
                const stockStatus = invItem ? getStockStatus(invItem.currentStock, invItem.minReorderLevel) : 'ok';
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/40"
                  >
                    <div className="w-9 h-9 rounded-xl bg-navy-700/50 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-navy-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{ing.nameAr}</p>
                      <p className="text-navy-400 text-xs">{invItem?.sku ?? '—'}</p>
                    </div>
                    <div className="text-center shrink-0">
                      <p className="text-white text-sm font-bold font-mono">{ing.quantity} {ing.unitAr}</p>
                    </div>
                    <div className="text-left shrink-0 w-20">
                      <p className="text-warning-400 text-sm font-bold font-mono">{ing.cost} ج</p>
                      <p className="text-navy-400 text-xs">
                        {stockStatus === 'out' ? 'نفذ' : stockStatus === 'critical' ? 'حرج' : stockStatus === 'low' ? 'منخفض' : 'متوفر'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedItem.recipe.length === 0 && (
              <div className="text-center py-8 text-navy-400 text-sm">
                لا توجد مكونات مرتبطة بهذا الصنف.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
