import { useState, useMemo } from 'react';
import { Recipe, RawIngredient, MenuItem, ShopSettings, RecipeIngredient } from '../types/pos';
import {
  prepareRecipeBatch,
  adjustIngredientStock,
  addIngredient,
  saveRecipe,
} from '../utils/storage';
import { getFoodImage } from '../utils/foodImages';
import {
  ChefHat,
  Utensils,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  Search,
  Boxes,
  PlusCircle,
  Printer,
  Trash2,
  X,
} from 'lucide-react';

interface RecipeScreenProps {
  recipes: Recipe[];
  ingredients: RawIngredient[];
  menu: MenuItem[];
  settings: ShopSettings;
  onDataUpdated: () => void;
}

export function RecipeScreen({
  recipes,
  ingredients,
  menu,
  settings,
  onDataUpdated,
}: RecipeScreenProps) {
  const [activeTab, setActiveTab] = useState<'recipes' | 'ingredients'>('recipes');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(
    recipes[0]?.id || 'rec-1'
  );
  const [servingsInput, setServingsInput] = useState<string>('1');
  const [addToFinishedStock, setAddToFinishedStock] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedNewIngId, setSelectedNewIngId] = useState<string>('');
  const [newIngPerServingAmount, setNewIngPerServingAmount] = useState<string>('10');

  // Quick Restock in Recipe row
  const [quickRestockIngId, setQuickRestockIngId] = useState<string | null>(null);
  const [quickRestockAmount, setQuickRestockAmount] = useState<string>('500');

  const [prepResult, setPrepResult] = useState<{
    success: boolean;
    recipeName?: string;
    servings?: number;
    deductedItems?: { name: string; amount: number; remaining: number; unit: string }[];
    shortages?: { name: string; required: number; available: number; unit: string }[];
  } | null>(null);

  // Raw Materials Tab State
  const [showAddIngredientModal, setShowAddIngredientModal] = useState<boolean>(false);
  const [newMatName, setNewMatName] = useState<string>('');
  const [newMatUnit, setNewMatUnit] = useState<'gm' | 'ml' | 'pc'>('gm');
  const [newMatStock, setNewMatStock] = useState<string>('0');
  const [newMatThreshold, setNewMatThreshold] = useState<string>('200');
  const [restockInputs, setRestockInputs] = useState<Record<string, string>>({});

  const currentRecipe = useMemo(() => {
    return recipes.find((r) => r.id === selectedRecipeId) || recipes[0];
  }, [recipes, selectedRecipeId]);

  const servings = useMemo(() => {
    const val = parseInt(servingsInput, 10);
    return isNaN(val) || val < 1 ? 1 : val;
  }, [servingsInput]);

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
    if (unit === 'pc') {
      return `${amount} pc`;
    }
    return `${amount} ${unit}`;
  };

  const calculateMaxServings = (recipe: Recipe) => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) return 0;
    let max = Infinity;

    for (const item of recipe.ingredients) {
      const stockItem = ingredients.find((ing) => ing.id === item.ingredientId);
      const available = stockItem ? stockItem.currentStock : 0;
      if (item.amount <= 0) continue;
      const possible = Math.floor(available / item.amount);
      if (possible < max) {
        max = possible;
      }
    }
    return max === Infinity ? 0 : max;
  };

  const recipeIngredientDetails = useMemo(() => {
    if (!currentRecipe) return [];

    return currentRecipe.ingredients.map((item) => {
      const stockItem = ingredients.find((ing) => ing.id === item.ingredientId);
      const available = stockItem ? stockItem.currentStock : 0;
      const requiredAmount = item.amount * servings;
      const remaining = available - requiredAmount;
      const isSufficient = available >= requiredAmount;
      const shortageAmount = isSufficient ? 0 : requiredAmount - available;

      return {
        ...item,
        requiredAmount,
        available,
        remaining,
        isSufficient,
        shortageAmount,
      };
    });
  }, [currentRecipe, ingredients, servings]);

  const canPrepare = useMemo(() => {
    if (recipeIngredientDetails.length === 0) return false;
    return recipeIngredientDetails.every((item) => item.isSufficient);
  }, [recipeIngredientDetails]);

  const handleCookBatch = () => {
    if (!currentRecipe || !canPrepare) return;

    const res = prepareRecipeBatch(currentRecipe, servings, addToFinishedStock);
    if (res.success) {
      setPrepResult({
        success: true,
        recipeName: currentRecipe.menuItemName,
        servings: servings,
        deductedItems: res.deductedItems,
      });
      onDataUpdated();
    } else {
      setPrepResult({
        success: false,
        shortages: res.shortages,
      });
    }
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) =>
      r.menuItemName.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [recipes, searchQuery]);

  const handleInlineRestock = (ingId: string) => {
    const val = parseFloat(quickRestockAmount);
    if (isNaN(val) || val <= 0) return;
    adjustIngredientStock(ingId, val);
    setQuickRestockIngId(null);
    onDataUpdated();
  };

  const handleQuickRestock = (ingId: string, amount: number) => {
    adjustIngredientStock(ingId, amount);
    onDataUpdated();
  };

  const handleCustomRestock = (ingId: string) => {
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
    onDataUpdated();
  };

  const handleCreateIngredient = (e: React.FormEvent) => {
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
    setShowAddIngredientModal(false);
    onDataUpdated();
  };

  const handleSaveRecipeEdit = (recipe: Recipe) => {
    saveRecipe(recipe);
    setEditingRecipe(null);
    onDataUpdated();
  };

  const handleAddIngredientToRecipe = () => {
    if (!editingRecipe || !selectedNewIngId) return;
    const matchedIng = ingredients.find((i) => i.id === selectedNewIngId);
    if (!matchedIng) return;

    // Check if already in recipe
    if (editingRecipe.ingredients.some((i) => i.ingredientId === matchedIng.id)) {
      return;
    }

    const amt = parseFloat(newIngPerServingAmount) || 1;
    const newRecipeIng: RecipeIngredient = {
      ingredientId: matchedIng.id,
      ingredientName: matchedIng.name,
      amount: amt,
      unit: matchedIng.unit,
    };

    setEditingRecipe({
      ...editingRecipe,
      ingredients: [...editingRecipe.ingredients, newRecipeIng],
    });
    setSelectedNewIngId('');
  };

  const handleRemoveIngredientFromRecipe = (idx: number) => {
    if (!editingRecipe) return;
    const updated = [...editingRecipe.ingredients];
    updated.splice(idx, 1);
    setEditingRecipe({
      ...editingRecipe,
      ingredients: updated,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const now = new Date();
  const currentDateStr = now.toLocaleDateString();
  const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-100 p-3 sm:p-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-neutral-300 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-red-600" />
            <span>RECIPES</span>
          </h2>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-neutral-300">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'recipes'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Recipe Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'ingredients'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Raw Materials ({ingredients.length})</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      {activeTab === 'recipes' ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Left Column: Recipe Selection List */}
          <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-white rounded-lg border border-neutral-300 shadow-2xs overflow-hidden shrink-0">
            {/* Search Box */}
            <div className="p-3 border-b border-neutral-200 bg-neutral-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes"
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-neutral-300 rounded text-xs font-semibold text-neutral-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* Recipes List */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-200">
              {filteredRecipes.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 text-xs font-medium">
                  No recipes found
                </div>
              ) : (
                filteredRecipes.map((recipe) => {
                  const isSelected = recipe.id === currentRecipe?.id;
                  const maxPossible = calculateMaxServings(recipe);
                  const foodImg = getFoodImage(recipe.menuItemId) || getFoodImage(recipe.menuItemName);

                  return (
                    <div
                      key={recipe.id}
                      onClick={() => {
                        setSelectedRecipeId(recipe.id);
                        setPrepResult(null);
                      }}
                      className={`p-3 cursor-pointer transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-red-50/80 border-l-4 border-l-red-600'
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      {foodImg ? (
                        <img
                          src={foodImg}
                          alt={recipe.menuItemName}
                          className="w-12 h-12 rounded-md object-cover border border-neutral-200 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-red-50 border border-red-200 flex items-center justify-center shrink-0 text-red-600 font-black text-sm">
                          {recipe.menuItemName.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <div className="font-extrabold text-sm text-red-600 truncate">
                            {recipe.menuItemName}
                          </div>
                          <span className="text-[10px] font-mono font-bold text-neutral-500 shrink-0">
                            {recipe.ingredients.length} items
                          </span>
                        </div>

                        {/* Stock capacity badge */}
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center gap-1 font-bold text-[10px] px-1.5 py-0.5 rounded ${
                              maxPossible > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {maxPossible > 0 ? (
                              <>
                                <PackageCheck className="w-3 h-3 text-emerald-700" />
                                <span>Max {maxPossible}</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                <span>0 Servings</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Recipe Details & Dynamic Serving Calculator */}
          {currentRecipe ? (
            <div className="flex-1 flex flex-col bg-white rounded-lg border border-neutral-300 shadow-2xs overflow-hidden">
              {/* Recipe Top Bar with PRINT RECIPE & EDIT */}
              <div className="px-4 py-3 bg-neutral-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  {getFoodImage(currentRecipe.menuItemId) || getFoodImage(currentRecipe.menuItemName) ? (
                    <img
                      src={getFoodImage(currentRecipe.menuItemId) || getFoodImage(currentRecipe.menuItemName)}
                      alt={currentRecipe.menuItemName}
                      className="w-11 h-11 rounded-lg object-cover border-2 border-white/20 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="p-2 bg-red-600 rounded">
                      <Utensils className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <h3 className="font-black text-base sm:text-lg tracking-wide text-red-500 uppercase">
                    {currentRecipe.menuItemName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Print Recipe Sheet"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PRINT RECIPE</span>
                  </button>

                  <button
                    onClick={() => setEditingRecipe(currentRecipe)}
                    className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-200 text-xs font-bold rounded transition-colors cursor-pointer"
                  >
                    Edit Recipe
                  </button>
                </div>
              </div>

              {/* Scrollable Recipe Calculator Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* DYNAMIC PORTION / SERVING SELECTOR */}
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-300 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Servings
                    </label>
                    <span className="text-xs font-mono font-bold text-neutral-600">
                      Current Stock Capacity:{' '}
                      <strong className={calculateMaxServings(currentRecipe) > 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                        {calculateMaxServings(currentRecipe)}
                      </strong>
                    </span>
                  </div>

                  {/* Quick Select Buttons + Stepper */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-neutral-300">
                      <button
                        onClick={() =>
                          setServingsInput(String(Math.max(1, servings - 1)))
                        }
                        className="w-8 h-8 rounded bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 font-bold flex items-center justify-center transition-colors cursor-pointer"
                        title="Decrease 1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={servingsInput}
                        onChange={(e) => setServingsInput(e.target.value)}
                        className="w-16 text-center font-mono font-black text-base text-neutral-900 focus:outline-none"
                      />
                      <button
                        onClick={() => setServingsInput(String(servings + 1))}
                        className="w-8 h-8 rounded bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 font-bold flex items-center justify-center transition-colors cursor-pointer"
                        title="Increase 1"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {[1, 2, 3, 5, 10, 20, 50].map((num) => (
                        <button
                          key={num}
                          onClick={() => setServingsInput(String(num))}
                          className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-colors cursor-pointer ${
                            servings === num
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* INGREDIENT BREAKDOWN TABLE */}
                <div className="border border-neutral-300 rounded-lg overflow-hidden">
                  <div className="px-3.5 py-2.5 bg-neutral-800 text-white flex items-center justify-between text-xs font-bold">
                    <span>Ingredients ({servings} {servings === 1 ? 'serving' : 'servings'})</span>
                    <span className="text-[11px] font-normal text-neutral-300">
                      Base × {servings}
                    </span>
                  </div>

                  <div className="divide-y divide-neutral-200">
                    {recipeIngredientDetails.map((ing, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm transition-colors ${
                          !ing.isSufficient ? 'bg-red-50/50' : 'bg-white'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-sm sm:text-base">
                              {ing.ingredientName}
                            </span>
                            {!ing.isSufficient && (
                              <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                Shortage
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 font-medium mt-0.5">
                            Per 1 Serving: <strong>{formatAmount(ing.amount, ing.unit)}</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-6 text-right shrink-0">
                          <div>
                            <span className="text-[11px] text-neutral-500 block">Required</span>
                            <span className="font-mono font-bold text-neutral-900 text-sm">
                              {formatAmount(ing.requiredAmount, ing.unit)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] text-neutral-500 block">In Stock</span>
                            <div className="flex items-center justify-end gap-1">
                              <span className={`font-mono font-bold text-sm ${ing.available <= 0 ? 'text-red-600' : 'text-neutral-700'}`}>
                                {formatAmount(ing.available, ing.unit)}
                              </span>
                              <button
                                onClick={() => {
                                  setQuickRestockIngId(ing.ingredientId);
                                  setQuickRestockAmount(ing.unit === 'pc' ? '20' : '1000');
                                }}
                                className="w-5 h-5 bg-neutral-100 hover:bg-red-100 hover:text-red-600 text-neutral-600 rounded flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                                title="Quick Restock"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] text-neutral-500 block">Remaining</span>
                            <span
                              className={`font-mono font-bold text-sm ${
                                ing.remaining >= 0 ? 'text-emerald-700' : 'text-red-600'
                              }`}
                            >
                              {ing.remaining >= 0
                                ? formatAmount(ing.remaining, ing.unit)
                                : `Deficit: ${formatAmount(ing.shortageAmount, ing.unit)}`}
                            </span>
                          </div>
                        </div>

                        {/* Inline quick restock popover */}
                        {quickRestockIngId === ing.ingredientId && (
                          <div className="sm:col-span-4 mt-2 p-2 bg-neutral-100 rounded border border-neutral-300 flex items-center justify-end gap-2">
                            <span className="text-xs font-bold text-neutral-700">Add Stock ({ing.unit}):</span>
                            <input
                              type="number"
                              min="1"
                              value={quickRestockAmount}
                              onChange={(e) => setQuickRestockAmount(e.target.value)}
                              className="w-20 px-2 py-1 bg-white border border-neutral-300 rounded text-xs font-mono font-bold"
                            />
                            <button
                              onClick={() => handleInlineRestock(ing.ingredientId)}
                              className="px-2.5 py-1 bg-red-600 text-white font-bold text-xs rounded hover:bg-red-700 cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setQuickRestockIngId(null)}
                              className="px-2 py-1 bg-neutral-200 text-neutral-700 text-xs font-semibold rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preparation Success / Warning Banner */}
                {prepResult && (
                  <div
                    className={`p-4 rounded-lg border-2 ${
                      prepResult.success
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-red-50 border-red-500 text-red-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
                      {prepResult.success ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>
                            {prepResult.servings} × {prepResult.recipeName} Completed
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span>Insufficient Ingredients</span>
                        </>
                      )}
                    </div>

                    {prepResult.success && prepResult.deductedItems && (
                      <div className="text-xs space-y-1 mt-2 bg-white/70 p-2.5 rounded border border-emerald-200">
                        {prepResult.deductedItems.map((d, i) => (
                          <div key={i} className="flex justify-between font-mono text-[11px]">
                            <span>{d.name}: -{formatAmount(d.amount, d.unit)}</span>
                            <span className="text-neutral-600">Remaining: {formatAmount(d.remaining, d.unit)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Preparation Action Bar */}
              <div className="p-4 bg-neutral-50 border-t border-neutral-300 shrink-0 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 font-semibold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addToFinishedStock}
                      onChange={(e) => setAddToFinishedStock(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded border-neutral-300 focus:ring-red-500"
                    />
                    <span>
                      Add {servings} {servings === 1 ? 'unit' : 'units'} to POS inventory
                    </span>
                  </label>
                  {!canPrepare && (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Deficit detected - Restock required
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCookBatch}
                  disabled={!canPrepare}
                  className={`w-full py-3.5 px-4 rounded-lg font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    canPrepare
                      ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white active:scale-[0.99]'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-70'
                  }`}
                >
                  <Utensils className="w-5 h-5" />
                  <span>
                    COOK & DEDUCT STOCK ({servings} {servings === 1 ? 'SERVING' : 'SERVINGS'})
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-lg border border-neutral-300 flex items-center justify-center p-6 text-neutral-400">
              Select a recipe
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: RAW MATERIALS INVENTORY */
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-neutral-300 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between shrink-0">
            <h3 className="font-bold text-sm tracking-wide uppercase">
              RAW MATERIALS STOCK
            </h3>
            <button
              onClick={() => setShowAddIngredientModal(true)}
              className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Raw Material</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-200 p-2 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ingredients.map((ing) => {
                const isZero = ing.currentStock <= 0;
                const isLow = !isZero && ing.currentStock <= ing.minThreshold;

                return (
                  <div
                    key={ing.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isZero
                        ? 'bg-red-50/25 border-red-300'
                        : isLow
                        ? 'bg-amber-50/30 border-amber-300'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-extrabold text-base text-neutral-900">
                          {ing.name}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono mt-0.5">
                          Threshold: {formatAmount(ing.minThreshold, ing.unit)}
                        </div>
                      </div>

                      <div className="text-right">
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

                    <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase">
                        Add:
                      </span>

                      <div className="flex flex-wrap items-center gap-1">
                        {ing.unit === 'pc' ? (
                          <>
                            {[+5, +10, +25, +50].map((amt) => (
                              <button
                                key={amt}
                                onClick={() => handleQuickRestock(ing.id, amt)}
                                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-mono font-bold text-xs rounded transition-colors cursor-pointer"
                              >
                                +{amt}
                              </button>
                            ))}
                          </>
                        ) : (
                          <>
                            {[+500, +1000, +2000, +5000].map((amt) => (
                              <button
                                key={amt}
                                onClick={() => handleQuickRestock(ing.id, amt)}
                                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-mono font-bold text-xs rounded transition-colors cursor-pointer"
                              >
                                +{amt >= 1000 ? `${amt / 1000}k` : `${amt}`}
                              </button>
                            ))}
                          </>
                        )}

                        <div className="flex items-center gap-1 ml-1">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={restockInputs[ing.id] ?? ''}
                            onChange={(e) =>
                              setRestockInputs({ ...restockInputs, [ing.id]: e.target.value })
                            }
                            className="w-16 px-1.5 py-1 text-xs border border-neutral-300 rounded font-mono"
                          />
                          <button
                            onClick={() => handleCustomRestock(ing.id)}
                            className="px-2 py-1 bg-neutral-900 text-white font-bold text-xs rounded cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRINT RECIPE PREPARATION SHEET */}
      {showPrintModal && currentRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-lg bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 text-white">
              <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                <Printer className="w-4 h-4 text-red-500" />
                <span>Recipe Sheet Preview</span>
              </span>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-100 flex justify-center">
              <div
                id="printable-recipe"
                className="w-full max-w-[340px] bg-white p-4 text-black border border-neutral-300 shadow-sm font-mono text-xs leading-relaxed"
              >
                {/* Header */}
                <div className="text-center pb-2 border-b border-dashed border-neutral-400">
                  <h1 className="text-base font-black tracking-wider uppercase mb-0.5">
                    {settings.shopName}
                  </h1>
                  <h2 className="text-xs font-bold text-neutral-800 tracking-wide uppercase">
                    RECIPE PREPARATION SHEET
                  </h2>
                  <div className="mt-2 py-1 bg-neutral-100 rounded flex items-center justify-center gap-2">
                    {(getFoodImage(currentRecipe.menuItemId) || getFoodImage(currentRecipe.menuItemName)) && (
                      <img
                        src={getFoodImage(currentRecipe.menuItemId) || getFoodImage(currentRecipe.menuItemName)}
                        alt={currentRecipe.menuItemName}
                        className="w-9 h-9 rounded object-cover border border-neutral-300 shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-black text-sm uppercase text-red-600">
                        {currentRecipe.menuItemName}
                      </p>
                      <p className="font-bold text-xs text-neutral-800">
                        BATCH: {servings} {servings === 1 ? 'SERVING' : 'SERVINGS'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-600 mt-2">
                    <span>Date: {currentDateStr}</span>
                    <span>Time: {currentTimeStr}</span>
                  </div>
                </div>

                {/* Ingredients Header */}
                <div className="pt-2 pb-1 border-b border-neutral-300 grid grid-cols-12 text-[11px] font-bold text-neutral-800">
                  <span className="col-span-6">Ingredient</span>
                  <span className="col-span-3 text-right">Required</span>
                  <span className="col-span-3 text-right">In Stock</span>
                </div>

                {/* Ingredients List */}
                <div className="py-2 space-y-1.5 border-b border-dashed border-neutral-400">
                  {recipeIngredientDetails.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 text-[11px] items-start">
                      <span className="col-span-6 font-semibold text-neutral-900 break-words pr-1">
                        {item.ingredientName}
                      </span>
                      <span className="col-span-3 text-right font-bold text-neutral-900">
                        {formatAmount(item.requiredAmount, item.unit)}
                      </span>
                      <span
                        className={`col-span-3 text-right font-semibold ${
                          item.available < item.requiredAmount ? 'text-red-600 font-bold' : 'text-neutral-700'
                        }`}
                      >
                        {formatAmount(item.available, item.unit)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Preparation Summary */}
                <div className="py-2.5 text-xs border-b border-dashed border-neutral-400 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Stock Status:</span>
                    <span className={canPrepare ? 'text-emerald-700' : 'text-red-600'}>
                      {canPrepare ? 'READY TO PREPARE' : 'INSUFFICIENT STOCK'}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600 text-[11px]">
                    <span>Total Ingredients:</span>
                    <span>{recipeIngredientDetails.length} items</span>
                  </div>
                </div>

                {/* Checklist Footer */}
                <div className="pt-3 text-[11px] text-neutral-700 space-y-1">
                  <p className="font-semibold text-center text-neutral-800 mb-1">
                    Quality & Hygiene Checked
                  </p>
                  <p className="text-center font-bold uppercase">{settings.shopName}</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-3 bg-white border-t border-neutral-200 flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wide rounded flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>PRINT</span>
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="py-2.5 px-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold text-xs rounded transition-colors cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD RAW MATERIAL */}
      {showAddIngredientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-5 border border-neutral-300">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h4 className="font-bold text-base text-neutral-900">Add Raw Material</h4>
              <button
                onClick={() => setShowAddIngredientModal(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIngredient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Material Name
                </label>
                <input
                  type="text"
                  required
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  placeholder="Material Name"
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-sm font-semibold"
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
                    <option value="gm">gm</option>
                    <option value="ml">ml</option>
                    <option value="pc">pc</option>
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
                  Low Stock Threshold
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
                  onClick={() => setShowAddIngredientModal(false)}
                  className="px-4 py-2 bg-neutral-200 text-neutral-800 text-xs font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded cursor-pointer"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT RECIPE */}
      {editingRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl p-5 border border-neutral-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4 shrink-0">
              <h4 className="font-bold text-base text-neutral-900">
                Edit Recipe: {editingRecipe.menuItemName} (1 Serving)
              </h4>
              <button
                onClick={() => setEditingRecipe(null)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {/* Existing ingredients list */}
              {editingRecipe.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-neutral-50 border border-neutral-200 rounded flex items-center justify-between gap-3"
                >
                  <div className="font-bold text-sm text-neutral-900 flex-1">
                    {ing.ingredientName}
                  </div>
                  <div className="flex items-center gap-1.5 w-36">
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={ing.amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const updated = [...editingRecipe.ingredients];
                        updated[idx] = { ...updated[idx], amount: val };
                        setEditingRecipe({ ...editingRecipe, ingredients: updated });
                      }}
                      className="w-full px-2 py-1 bg-white border border-neutral-300 rounded text-sm font-mono font-bold text-right"
                    />
                    <span className="text-xs text-neutral-500 font-mono">{ing.unit}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveIngredientFromRecipe(idx)}
                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add another ingredient to recipe */}
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <span className="block text-xs font-bold text-neutral-700 uppercase mb-2">
                  Add Ingredient to Recipe
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedNewIngId}
                    onChange={(e) => setSelectedNewIngId(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-neutral-300 rounded text-xs font-semibold"
                  >
                    <option value="">-- Select Material from Inventory --</option>
                    {ingredients
                      .filter((ing) => !editingRecipe.ingredients.some((ri) => ri.ingredientId === ing.id))
                      .map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.unit})
                        </option>
                      ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      placeholder="Amount"
                      value={newIngPerServingAmount}
                      onChange={(e) => setNewIngPerServingAmount(e.target.value)}
                      className="w-20 px-2 py-1.5 border border-neutral-300 rounded text-xs font-mono font-bold text-right"
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredientToRecipe}
                      disabled={!selectedNewIngId}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setEditingRecipe(null)}
                className="px-4 py-2 bg-neutral-200 text-neutral-800 text-xs font-bold rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveRecipeEdit(editingRecipe)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
