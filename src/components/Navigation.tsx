import { ActiveTab } from '../types/pos';
import { ShoppingCart, Receipt, Boxes, ChefHat, BarChart2, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  shopName: string;
  todaySalesCount: number;
}

export function Navigation({
  activeTab,
  setActiveTab,
  shopName,
  todaySalesCount,
}: NavigationProps) {
  const tabs: { id: ActiveTab; label: string; icon: typeof ShoppingCart }[] = [
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'sales', label: 'SALES', icon: Receipt },
    { id: 'inventory', label: 'INVENTORY', icon: Boxes },
    { id: 'recipe', label: 'RECIPE', icon: ChefHat },
    { id: 'report', label: 'REPORT', icon: BarChart2 },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <>
      {/* Top Header Bar for Desktop & Mobile */}
      <header className="bg-neutral-900 text-white border-b border-neutral-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shrink-0 select-none">
        {/* Brand Zone */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-red-600 rounded-xs" />
          <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-white truncate max-w-[180px] sm:max-w-none">
            {shopName}
          </h1>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-neutral-400 font-mono hidden sm:block">
            Today: <span className="font-bold text-white">{todaySalesCount} sales</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
            OFFLINE POS
          </span>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Visible on mobile screens < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-900 text-white border-t border-neutral-800 grid grid-cols-6 h-15 shadow-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                isActive
                  ? 'text-red-500 font-extrabold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[9px] font-bold tracking-tight truncate max-w-full px-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

