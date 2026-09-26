import { useState, useEffect, useCallback } from 'react';
import { ActiveTab, MenuItem, Sale, ShopSettings, RawIngredient, Recipe } from './types/pos';
import { getMenu, getSales, getSettings, getIngredients, getRecipes } from './utils/storage';
import { getTodayDateString } from './utils/date';
import { Navigation } from './components/Navigation';
import { PosScreen } from './components/PosScreen';
import { SalesScreen } from './components/SalesScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { RecipeScreen } from './components/RecipeScreen';
import { ReportScreen } from './components/ReportScreen';
import { SettingsScreen } from './components/SettingsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [ingredients, setIngredients] = useState<RawIngredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [settings, setSettings] = useState<ShopSettings>({
    shopName: 'PURSHAI FAST FOOD',
    currencySymbol: '৳',
    nextSaleNumber: 1,
  });

  const loadData = useCallback(() => {
    setMenu(getMenu());
    setSales(getSales());
    setSettings(getSettings());
    setIngredients(getIngredients());
    setRecipes(getRecipes());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate today's sales count
  const todayStr = getTodayDateString();
  const todaySalesCount = sales.filter((s) => s.date === todayStr).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-100 text-neutral-900 pb-15 md:pb-0 select-none">
      {/* Top Header & Mobile Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shopName={settings.shopName}
        todaySalesCount={todaySalesCount}
      />

      {/* Main Active Section View */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'pos' && (
          <PosScreen
            menu={menu}
            settings={settings}
            onSaleCompleted={loadData}
          />
        )}

        {activeTab === 'sales' && (
          <SalesScreen
            sales={sales}
            settings={settings}
            onSalesUpdated={loadData}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryScreen
            menu={menu}
            ingredients={ingredients}
            settings={settings}
            onInventoryUpdated={loadData}
          />
        )}

        {activeTab === 'recipe' && (
          <RecipeScreen
            recipes={recipes}
            ingredients={ingredients}
            menu={menu}
            settings={settings}
            onDataUpdated={loadData}
          />
        )}

        {activeTab === 'report' && (
          <ReportScreen
            sales={sales}
            settings={settings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            menu={menu}
            settings={settings}
            onMenuUpdated={loadData}
            onSettingsUpdated={loadData}
            onSalesCleared={loadData}
          />
        )}
      </main>
    </div>
  );
}

