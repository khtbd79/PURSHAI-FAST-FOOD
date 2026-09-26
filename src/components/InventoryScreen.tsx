import { useState, useMemo } from 'react';
import { MenuItem, RawIngredient, ShopSettings } from '../types/pos';
import {
  updateItemStock,
  adjustIngredientStock,
  updateIngredientStock,
  addIngredient,
  deleteIngredient,
  resetAllIngredientsStockToZero,
} from '../utils/storage';
import { getFoodImage } from '../utils/foodImages';
import {
  Boxes,
  UtensilsCrossed,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Minus,
  PlusCircle,
  Trash2,
  RotateCcw,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface InventoryScreenProps {
  menu: MenuItem[];
  ingredients: RawIngredient[];
  settings: ShopSettings;
  onInventoryUpdated: () => void;
}

export function InventoryScreen({
  menu,
  ingredients,
  settings,
  onInventoryUpdated,
}: InventoryScreenProps) {
  const [activeCategory, setActiveCategory] = useState<'materials' | 'menu'>('materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [materialFilter, setMaterialFilter] = useState<'all' | 'zero' | 'low' | 'instock'>('all');
  const [menuFilter, setMenuFilter] = useState<'all' | 'low' | 'out' | 'tracked'>('all');

  // Restock inputs for raw materials
  const [restockInputs, setRestockInputs] = useState<Record<string, string>>({});
  const [exactStockInputs, setExactStockInputs] = useState<Record<string, string>>({});
  const [showAddMaterialModal, setShowAddMaterialModal] = useState<boolean>(false);
  const [newMatName, setNewMatName] = useState<string>('');
  const [newMatUnit, setNewMatUnit] = useState<'gm' | 'ml' | 'pc'>('gm');
  const [newMatStock, setNewMatStock] = useState<string>('0');
  const [newMatThreshold, setNewMatThreshold] = useState<string>('200');

  // Confirmation to zero all materials stock
  const [showZeroConfirm, setShowZeroConfirm] = useState<boolean>(false);

  // Menu items custom inputs
  const [menuStockInputs, setMenuStockInputs] = useState<Record<string, string>>({});
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [thresholdInput, setThresholdInput] = useState<string>('5');

  // Raw Materials Metrics
  const materialMetrics = useMemo(() => {
    let zeroCount = 0;
    let lowCount = 0;
    let inStockCount = 0;

    ingredients.forEach((ing) => {
      if (ing.currentStock <= 0) {
        zeroCount++;
      } else if (ing.currentStock <= ing.minThreshold) {
        lowCount++;
      } else {
        inStockCount++;
      }
    });

    return {
      total: ingredients.length,
      zero: zeroCount,
      low: lowCount,
      inStock: inStockCount,
    };
  }, [ingredients]);

  // Filtered Raw Materials
  const filteredMaterials = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (materialFilter === 'zero') return ing.currentStock <= 0;
      if (materialFilter === 'low') return ing.currentStock > 0 && ing.currentStock <= ing.minThreshold;
      if (materialFilter === 'instock') return ing.currentStock > ing.minThreshold;

      return true;
    });
  }, [ingredients, searchQuery, materialFilter]);

  // Menu Items Metrics
  const menuMetrics = useMemo(() => {
    let trackedCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    menu.forEach((item) => {
      if (item.trackStock) {
        trackedCount++;
        const currentStock = item.stock ?? 0;
        const threshold = item.lowStockThreshold ?? 5;
        if (currentStock === 0) {
          outOfStockCount++;
        } else if (currentStock <= threshold) {
          lowStockCount++;
        }
      }
    });

    return {
      total: menu.length,
      tracked: trackedCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    };
  }, [menu]);

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menu.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      const currentStock = item.stock ?? 0;
      const threshold = item.lowStockThreshold ?? 5;

      if (menuFilter === 'tracked') return item.trackStock;
      if (menuFilter === 'out') return item.trackStock && currentStock === 0;
      if (menuFilter === 'low') return item.trackStock && currentStock > 0 && currentStock <= threshold;

      return true;
    });
  }, [menu, searchQuery, menuFilter]);

  // Format unit amounts
  const formatAmount = (amount: number, unit: string) => {
    if (unit === 'gm') {
      if (amount >= 1000) {
        const kg = (amount / 1000).toFixed(2).replace(/\.00$/, '');
        return `${amount} gm (${kg} kg)`;
      }
      return `${amount} gm`;
    }
    if (unit === 'ml') {
      if (amount >= 1000) {
        const l = (amount / 1000).toFixed(2).replace(/\.00$/, '');
        return `${amount} ml (${l} L)`;
      }
      return `${amount} ml`;
    }
    return `${amount} ${unit}`;
  };

  // Handlers for Raw Materials
  const handleQuickAddMaterial = (ingId: string, delta: number) => {
    adjustIngredientStock(ingId, delta);
    onInventoryUpdated();
  };

  const handleCustomRestockMaterial = (ingId: string) => {
    const raw = restockInputs[ingId];
    if (!raw) return;
    const val = parseFloat(raw);
    if (isNaN(val) || val <= 0) return;
    adjustIngredientStock(ingId, val);
    setRestockInputs((prev) => {
      const next = { ...prev };
      delete next[ingId];
      return next;
    });
    onInventoryUpdated();
  };

  const handleSetExactMaterialStock = (ingId: string) => {
    const raw = exactStockInputs[ingId];
    if (raw === undefined || raw.trim() === '') return;
    const val = parseFloat(raw);
    if (isNaN(val) || val < 0) return;
    updateIngredientStock(ingId, val);
    setExactStockInputs((prev) => {
      const next = { ...prev };
      delete next[ingId];
      return next;
    });
    onInventoryUpdated();
  };

  const handleCreateRawMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMatName.trim();
    if (!trimmed) return;
    const stockVal = parseFloat(newMatStock) || 0;
    const thresholdVal = parseFloat(newMatThreshold) || 100;

    const newIng: RawIngredient = {
      id: `ing-${Date.now()}`,
      name: trimmed,
      unit: newMatUnit,
      currentStock: stockVal,
      minThreshold: thresholdVal,
    };

    addIngredient(newIng);
    setNewMatName('');
    setNewMatStock('0');
    setNewMatThreshold('200');
    setShowAddMaterialModal(false);
    onInventoryUpdated();
  };

  const handleDeleteMaterial = (ingId: string) => {
    deleteIngredient(ingId);
    onInventoryUpdated();
  };

  const handleZeroAllStock = () => {
    resetAllIngredientsStockToZero();
    setShowZeroConfirm(false);
    onInventoryUpdated();
  };

  // Handlers for Finished Menu Items
  const handleToggleTracking = (item: MenuItem) => {
    const newTrackState = !item.trackStock;
    updateItemStock(item.id, item.stock ?? 0, newTrackState, item.lowStockThreshold ?? 5);
    onInventoryUpdated();
  };

  const handleAdjustMenuStock = (item: MenuItem, delta: number) => {
    const current = item.stock ?? 0;
    const newStock = Math.max(0, current + delta);
    updateItemStock(item.id, newStock);
    onInventoryUpdated();
  };

  const handleSetCustomMenuStock = (item: MenuItem) => {
    const rawVal = menuStockInputs[item.id];
    if (rawVal === undefined || rawVal.trim() === '') return;
    const num = parseInt(rawVal, 10);
    if (isNaN(num) || num < 0) return;

    updateItemStock(item.id, num);
    setMenuStockInputs((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    onInventoryUpdated();
  };

  const handleSaveMenuThreshold = (item: MenuItem) => {
    const num = parseInt(thresholdInput, 10);
    if (isNaN(num) || num < 0) return;
    updateItemStock(item.id, item.stock ?? 0, item.trackStock, num);
    setEditingThresholdId(null);
    onInventoryUpdated();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-100 p-3 sm:p-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-neutral-300 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-red-600" />
            <span>INVENTORY</span>
          </h2>

          {/* Category Switcher: Raw Materials vs POS Food Items */}
          <div className="flex items-center p-1 bg-white rounded-lg border border-neutral-300">
            <button
              onClick={() => {
                setActiveCategory('materials');
                setSearchQuery('');
              }}
              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeCategory === 'materials'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Raw Materials ({ingredients.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveCategory('menu');
                setSearchQuery('');
              }}
              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeCategory === 'menu'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Menu Items ({menu.length})</span>
            </button>
          </div>
        </div>

        {/* Search Input & Action */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeCategory === 'materials' ? 'Search raw materials' : 'Search food items'}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-neutral-300 rounded text-xs font-semibold text-neutral-900 focus:outline-none focus:border-red-600"
            />
          </div>

          {activeCategory === 'materials' && (
            <>
              <button
                onClick={() => setShowAddMaterialModal(true)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Material</span>
              </button>

              <button
                onClick={() => setShowZeroConfirm(true)}
                className="px-2.5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold text-xs rounded flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                title="Reset all stock to 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Set All 0</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* VIEW 1: RAW MATERIALS */}
      {activeCategory === 'materials' ? (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-white rounded-lg p-3 border border-neutral-300 shadow-2xs">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Total Materials
              </span>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 font-mono mt-0.5">
                {materialMetrics.total}
              </div>
            </div>

            <div
              className={`rounded-lg p-3 border shadow-2xs ${
                materialMetrics.zero > 0 ? 'bg-red-50 border-red-300' : 'bg-white border-neutral-300'
              }`}
            >
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block ${
                  materialMetrics.zero > 0 ? 'text-red-700' : 'text-neutral-500'
                }`}
              >
                Zero Stock
              </span>
              <div
                className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${
                  materialMetrics.zero > 0 ? 'text-red-600' : 'text-neutral-900'
                }`}
              >
                {materialMetrics.zero}
              </div>
            </div>

            <div
              className={`rounded-lg p-3 border shadow-2xs ${
                materialMetrics.low > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white border-neutral-300'
              }`}
            >
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block ${
                  materialMetrics.low > 0 ? 'text-amber-800' : 'text-neutral-500'
                }`}
              >
                Low Stock
              </span>
              <div
                className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${
                  materialMetrics.low > 0 ? 'text-amber-700' : 'text-neutral-900'
                }`}
              >
                {materialMetrics.low}
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-neutral-300 shadow-2xs">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                In Stock Available
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-0.5">
                {materialMetrics.inStock}
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: `All Materials (${ingredients.length})` },
              { id: 'zero', label: `Zero Stock (${materialMetrics.zero})` },
              { id: 'low', label: `Low Stock (${materialMetrics.low})` },
              { id: 'instock', label: `In Stock (${materialMetrics.inStock})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMaterialFilter(tab.id as typeof materialFilter)}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer whitespace-nowrap ${
                  materialFilter === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Raw Materials Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="bg-white rounded-lg border border-neutral-300 p-8 text-center text-neutral-500">
              <Boxes className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
              <p className="font-bold text-sm text-neutral-700">No raw materials found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMaterials.map((ing) => {
                const isZero = ing.currentStock <= 0;
                const isLow = !isZero && ing.currentStock <= ing.minThreshold;

                return (
                  <div
                    key={ing.id}
                    className={`bg-white rounded-lg border p-4 shadow-2xs transition-all ${
                      isZero
                        ? 'border-red-300 bg-red-50/20'
                        : isLow
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-neutral-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-base text-neutral-900 truncate">
                          {ing.name}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono mt-0.5">
                          Threshold: {formatAmount(ing.minThreshold, ing.unit)}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono font-black text-lg block ${
                            isZero ? 'text-red-600' : isLow ? 'text-amber-700' : 'text-neutral-900'
                          }`}
                        >
                          {formatAmount(ing.currentStock, ing.unit)}
                        </span>
                        {isZero ? (
                          <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                            Zero Stock
                          </span>
                        ) : isLow ? (
                          <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Low Stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            In Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Restock & Quantity Controls */}
                    <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                      {/* Quick Add Buttons */}
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[11px] font-bold text-neutral-500 uppercase mr-1">
                          Add:
                        </span>
                        {ing.unit === 'pc' ? (
                          <>
                            {[+5, +10, +25, +50].map((amt) => (
                              <button
                                key={amt}
                                onClick={() => handleQuickAddMaterial(ing.id, amt)}
                                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-mono font-bold text-xs rounded transition-colors cursor-pointer"
                              >
                                +{amt}
                              </button>
                            ))}
                          </>
                        ) : (
                          <>
                            {[+250, +500, +1000, +2000, +5000].map((amt) => (
                              <button
                                key={amt}
                                onClick={() => handleQuickAddMaterial(ing.id, amt)}
                                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-mono font-bold text-xs rounded transition-colors cursor-pointer"
                              >
                                +{amt >= 1000 ? `${amt / 1000}k` : `${amt}`}
                              </button>
                            ))}
                          </>
                        )}
                      </div>

                      {/* Custom Add & Set Exact Controls */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            placeholder="+Qty"
                            value={restockInputs[ing.id] ?? ''}
                            onChange={(e) =>
                              setRestockInputs({ ...restockInputs, [ing.id]: e.target.value })
                            }
                            className="w-16 px-1.5 py-1 text-xs border border-neutral-300 rounded font-mono"
                          />
                          <button
                            onClick={() => handleCustomRestockMaterial(ing.id)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded cursor-pointer"
                          >
                            Add
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            placeholder="Set"
                            value={exactStockInputs[ing.id] ?? ''}
                            onChange={(e) =>
                              setExactStockInputs({ ...exactStockInputs, [ing.id]: e.target.value })
                            }
                            className="w-16 px-1.5 py-1 text-xs border border-neutral-300 rounded font-mono"
                          />
                          <button
                            onClick={() => handleSetExactMaterialStock(ing.id)}
                            className="px-2 py-1 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded cursor-pointer"
                          >
                            Set
                          </button>
                        </div>

                        {/* Delete button if custom added */}
                        {ing.id.startsWith('ing-') && parseInt(ing.id.replace('ing-', ''), 10) > 100 && (
                          <button
                            onClick={() => handleDeleteMaterial(ing.id)}
                            className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                            title="Delete Material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: FINISHED MENU ITEMS */
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Menu Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-white rounded-lg p-3 border border-neutral-300 shadow-2xs">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Total Food Items
              </span>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 font-mono mt-0.5">
                {menuMetrics.total}
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-neutral-300 shadow-2xs">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Tracked Items
              </span>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 font-mono mt-0.5">
                {menuMetrics.tracked}
              </div>
            </div>

            <div
              className={`rounded-lg p-3 border shadow-2xs ${
                menuMetrics.lowStock > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white border-neutral-300'
              }`}
            >
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block ${
                  menuMetrics.lowStock > 0 ? 'text-amber-800' : 'text-neutral-500'
                }`}
              >
                Low Stock
              </span>
              <div
                className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${
                  menuMetrics.lowStock > 0 ? 'text-amber-700' : 'text-neutral-900'
                }`}
              >
                {menuMetrics.lowStock}
              </div>
            </div>

            <div
              className={`rounded-lg p-3 border shadow-2xs ${
                menuMetrics.outOfStock > 0 ? 'bg-red-50 border-red-300' : 'bg-white border-neutral-300'
              }`}
            >
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block ${
                  menuMetrics.outOfStock > 0 ? 'text-red-700' : 'text-neutral-500'
                }`}
              >
                Out of Stock
              </span>
              <div
                className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${
                  menuMetrics.outOfStock > 0 ? 'text-red-600' : 'text-neutral-900'
                }`}
              >
                {menuMetrics.outOfStock}
              </div>
            </div>
          </div>

          {/* Menu Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: `All Items (${menu.length})` },
              { id: 'tracked', label: `Tracked (${menuMetrics.tracked})` },
              { id: 'low', label: `Low Stock (${menuMetrics.lowStock})` },
              { id: 'out', label: `Out of Stock (${menuMetrics.outOfStock})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMenuFilter(tab.id as typeof menuFilter)}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer whitespace-nowrap ${
                  menuFilter === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Menu Items List */}
          <div className="space-y-3">
            {filteredMenuItems.length === 0 ? (
              <div className="bg-white rounded-lg border border-neutral-300 p-8 text-center text-neutral-500">
                <UtensilsCrossed className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
                <p className="font-bold text-sm text-neutral-700">No items found</p>
              </div>
            ) : (
              filteredMenuItems.map((item) => {
                const stock = item.stock ?? 0;
                const threshold = item.lowStockThreshold ?? 5;
                const isTracked = !!item.trackStock;
                const isOut = isTracked && stock === 0;
                const isLow = isTracked && stock > 0 && stock <= threshold;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg border p-4 shadow-2xs transition-all ${
                      isOut
                        ? 'border-red-400 bg-red-50/20'
                        : isLow
                        ? 'border-amber-400 bg-amber-50/20'
                        : 'border-neutral-300'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Item Details with Photo */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFoodImage(item.id) || getFoodImage(item.name) ? (
                          <img
                            src={getFoodImage(item.id) || getFoodImage(item.name)}
                            alt={item.name}
                            className="w-13 h-13 rounded-md object-cover border border-neutral-200 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-13 h-13 rounded-md bg-red-50 border border-red-200 flex items-center justify-center shrink-0 text-red-600 font-black text-lg">
                            {item.name.charAt(0)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-base text-red-600">
                              {item.name}
                            </span>
                            <span className="font-mono text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                              {settings.currencySymbol}
                              {item.price}
                            </span>
                            {!item.available && (
                              <span className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">
                                Hidden from POS
                              </span>
                            )}
                          </div>

                        {/* Badges */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {isTracked ? (
                            <>
                              {isOut && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 border border-red-300 px-2 py-0.5 rounded">
                                  <XCircle className="w-3.5 h-3.5" />
                                  OUT OF STOCK (0)
                                </span>
                              )}
                              {isLow && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  LOW STOCK ({stock} left)
                                </span>
                              )}
                              {!isOut && !isLow && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  IN STOCK ({stock})
                                </span>
                              )}

                              <span className="text-xs text-neutral-500">
                                Alert under: {threshold} pcs
                                <button
                                  onClick={() => {
                                    setEditingThresholdId(item.id);
                                    setThresholdInput(String(threshold));
                                  }}
                                  className="ml-1 text-neutral-700 font-bold hover:underline"
                                >
                                  (Edit)
                                </button>
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-neutral-400 font-medium">
                              Stock tracking disabled (Unlimited)
                            </span>
                          )}
                        </div>

                        {/* Inline Threshold Editor */}
                        {editingThresholdId === item.id && (
                          <div className="mt-2 p-2 bg-neutral-50 border border-neutral-300 rounded flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-700">Alert threshold:</span>
                            <input
                              type="number"
                              min="1"
                              value={thresholdInput}
                              onChange={(e) => setThresholdInput(e.target.value)}
                              className="w-16 px-2 py-1 bg-white border border-neutral-300 rounded text-xs font-mono font-bold"
                            />
                            <button
                              onClick={() => handleSaveMenuThreshold(item)}
                              className="px-2.5 py-1 bg-neutral-900 text-white text-xs font-bold rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingThresholdId(null)}
                              className="px-2 py-1 bg-neutral-200 text-neutral-700 text-xs font-semibold rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                      {/* Stock Control Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => handleToggleTracking(item)}
                          className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isTracked
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {isTracked ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-400" />
                              <span>Tracked</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-neutral-400" />
                              <span>Untracked</span>
                            </>
                          )}
                        </button>

                        {isTracked && (
                          <div className="flex items-center gap-2 bg-neutral-50 p-1.5 rounded-lg border border-neutral-200">
                            <button
                              onClick={() => handleAdjustMenuStock(item, -1)}
                              disabled={stock <= 0}
                              className="w-7 h-7 bg-white hover:bg-neutral-100 active:bg-neutral-200 border border-neutral-300 rounded font-bold text-sm flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="w-10 text-center font-mono font-black text-sm text-neutral-900">
                              {stock}
                            </span>

                            <button
                              onClick={() => handleAdjustMenuStock(item, +1)}
                              className="w-7 h-7 bg-white hover:bg-neutral-100 active:bg-neutral-200 border border-neutral-300 rounded font-bold text-sm flex items-center justify-center cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-neutral-200">
                              <input
                                type="number"
                                min="0"
                                placeholder="Set"
                                value={menuStockInputs[item.id] ?? ''}
                                onChange={(e) =>
                                  setMenuStockInputs({ ...menuStockInputs, [item.id]: e.target.value })
                                }
                                className="w-14 px-1.5 py-1 text-xs border border-neutral-300 rounded font-mono font-bold"
                              />
                              <button
                                onClick={() => handleSetCustomMenuStock(item)}
                                className="px-2 py-1 bg-neutral-800 hover:bg-black text-white text-xs font-bold rounded cursor-pointer"
                              >
                                Set
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD RAW MATERIAL */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-5 border border-neutral-300">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h4 className="font-bold text-base text-neutral-900">Add Raw Material</h4>
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRawMaterial} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Material Name
                </label>
                <input
                  type="text"
                  required
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  placeholder="e.g. Cheese, Paprika, Tomato Sauce"
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-sm font-semibold focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Unit</label>
                  <select
                    value={newMatUnit}
                    onChange={(e) => setNewMatUnit(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm font-semibold"
                  >
                    <option value="gm">gm (Grams)</option>
                    <option value="ml">ml (Milliliters)</option>
                    <option value="pc">pc (Pieces)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newMatStock}
                    onChange={(e) => setNewMatStock(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newMatThreshold}
                  onChange={(e) => setNewMatThreshold(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-sm font-mono font-semibold"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="px-4 py-2 bg-neutral-200 text-neutral-800 text-xs font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded cursor-pointer"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM ZERO ALL STOCK MODAL */}
      {showZeroConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl p-5 border-2 border-red-600">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-neutral-900">Set All Raw Materials to 0?</h3>
            </div>
            <p className="text-sm text-neutral-700 font-medium leading-normal">
              This will reset the current stock of all raw materials to 0. Material definitions and recipes will not be deleted.
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => setShowZeroConfirm(false)}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold text-xs rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleZeroAllStock}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded cursor-pointer"
              >
                Yes, Set to 0
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
