import { MenuItem, Sale, ShopSettings, BackupData, RawIngredient, Recipe } from '../types/pos';

const STORAGE_KEYS = {
  MENU: 'purshai_pos_menu',
  SALES: 'purshai_pos_sales',
  SETTINGS: 'purshai_pos_settings',
  INGREDIENTS: 'purshai_pos_ingredients',
  RECIPES: 'purshai_pos_recipes',
} as const;

export const INITIAL_INGREDIENTS: RawIngredient[] = [
  // Core Bases
  { id: 'ing-1', name: 'Potato', unit: 'gm', currentStock: 0, minThreshold: 500 },
  { id: 'ing-2', name: 'Cooking Oil', unit: 'ml', currentStock: 0, minThreshold: 500 },
  { id: 'ing-3', name: 'Chicken Meat', unit: 'gm', currentStock: 0, minThreshold: 500 },
  { id: 'ing-4', name: 'Flour (Maida)', unit: 'gm', currentStock: 0, minThreshold: 300 },
  { id: 'ing-5', name: 'Cornstarch', unit: 'gm', currentStock: 0, minThreshold: 200 },
  { id: 'ing-6', name: 'Breadcrumbs', unit: 'gm', currentStock: 0, minThreshold: 200 },
  { id: 'ing-7', name: 'Yellow Peas (Dabli)', unit: 'gm', currentStock: 0, minThreshold: 300 },
  { id: 'ing-8', name: 'Puri Shells', unit: 'pc', currentStock: 0, minThreshold: 30 },
  { id: 'ing-9', name: 'Burger Bun', unit: 'pc', currentStock: 0, minThreshold: 10 },
  { id: 'ing-10', name: 'Egg', unit: 'pc', currentStock: 0, minThreshold: 10 },
  { id: 'ing-11', name: 'Butter', unit: 'gm', currentStock: 0, minThreshold: 100 },
  { id: 'ing-12', name: 'Liquid Milk', unit: 'ml', currentStock: 0, minThreshold: 200 },
  { id: 'ing-13', name: 'Pasta Raw', unit: 'gm', currentStock: 0, minThreshold: 300 },
  { id: 'ing-14', name: 'Chowmein Noodles', unit: 'gm', currentStock: 0, minThreshold: 300 },

  // Essential Spices & Seasonings
  { id: 'ing-15', name: 'Salt', unit: 'gm', currentStock: 0, minThreshold: 200 },
  { id: 'ing-16', name: 'Black Pepper', unit: 'gm', currentStock: 0, minThreshold: 50 },
  { id: 'ing-17', name: 'Chili Powder', unit: 'gm', currentStock: 0, minThreshold: 50 },
  { id: 'ing-18', name: 'Garlic', unit: 'gm', currentStock: 0, minThreshold: 100 },
  { id: 'ing-19', name: 'Ginger', unit: 'gm', currentStock: 0, minThreshold: 100 },
  { id: 'ing-20', name: 'Chaat Masala', unit: 'gm', currentStock: 0, minThreshold: 50 },
  { id: 'ing-21', name: 'Black Salt (Bit Salt)', unit: 'gm', currentStock: 0, minThreshold: 50 },
  { id: 'ing-22', name: 'Garam Masala', unit: 'gm', currentStock: 0, minThreshold: 50 },
  { id: 'ing-23', name: 'Cumin & Coriander Powder', unit: 'gm', currentStock: 0, minThreshold: 50 },

  // Essential Sauces
  { id: 'ing-24', name: 'Tomato Ketchup', unit: 'gm', currentStock: 0, minThreshold: 300 },
  { id: 'ing-25', name: 'Chili Sauce', unit: 'gm', currentStock: 0, minThreshold: 200 },
  { id: 'ing-26', name: 'Soy Sauce', unit: 'ml', currentStock: 0, minThreshold: 200 },
  { id: 'ing-27', name: 'Mayonnaise', unit: 'gm', currentStock: 0, minThreshold: 200 },
  { id: 'ing-28', name: 'Tamarind Sauce', unit: 'gm', currentStock: 0, minThreshold: 200 },

  // Fresh Produce Essentials
  { id: 'ing-29', name: 'Green Chili', unit: 'gm', currentStock: 0, minThreshold: 50 },
  { id: 'ing-30', name: 'Onion', unit: 'gm', currentStock: 0, minThreshold: 300 },
  { id: 'ing-31', name: 'Fresh Coriander', unit: 'gm', currentStock: 0, minThreshold: 50 },
  { id: 'ing-32', name: 'Salad & Cabbage', unit: 'gm', currentStock: 0, minThreshold: 200 },
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    menuItemId: 'item-1',
    menuItemName: 'French Fry',
    servingsBase: 1,
    instructions: '',
    ingredients: [
      { ingredientId: 'ing-1', ingredientName: 'Potato', amount: 180, unit: 'gm' },
      { ingredientId: 'ing-2', ingredientName: 'Cooking Oil', amount: 30, unit: 'ml' },
      { ingredientId: 'ing-15', ingredientName: 'Salt', amount: 2.5, unit: 'gm' },
      { ingredientId: 'ing-16', ingredientName: 'Black Pepper', amount: 0.5, unit: 'gm' },
      { ingredientId: 'ing-24', ingredientName: 'Tomato Ketchup', amount: 20, unit: 'gm' },
    ],
  },
  {
    id: 'rec-2',
    menuItemId: 'item-2',
    menuItemName: 'Chicken Nugget',
    servingsBase: 1,
    instructions: '',
    ingredients: [
      { ingredientId: 'ing-3', ingredientName: 'Chicken Meat', amount: 110, unit: 'gm' },
      { ingredientId: 'ing-6', ingredientName: 'Breadcrumbs', amount: 25, unit: 'gm' },
      { ingredientId: 'ing-5', ingredientName: 'Cornstarch', amount: 10, unit: 'gm' },
      { ingredientId: 'ing-18', ingredientName: 'Garlic', amount: 3, unit: 'gm' },
      { ingredientId: 'ing-19', ingredientName: 'Ginger', amount: 2, unit: 'gm' },
      { ingredientId: 'ing-16', ingredientName: 'Black Pepper', amount: 1, unit: 'gm' },
      { ingredientId: 'ing-15', ingredientName: 'Salt', amount: 2, unit: 'gm' },
      { ingredientId: 'ing-2', ingredientName: 'Cooking Oil', amount: 25, unit: 'ml' },
      { ingredientId: 'ing-24', ingredientName: 'Tomato Ketchup', amount: 15, unit: 'gm' },
    ],
  },
  {
    id: 'rec-3',
    menuItemId: 'item-3',
    menuItemName: 'Chotpoti',
    servingsBase: 1,
    instructions: '',
    ingredients: [
      { ingredientId: 'ing-7', ingredientName: 'Yellow Peas (Dabli)', amount: 110, unit: 'gm' },
      { ingredientId: 'ing-1', ingredientName: 'Potato', amount: 50, unit: 'gm' },
      { ingredientId: 'ing-10', ingredientName: 'Egg', amount: 0.5, unit: 'pc' },
      { ingredientId: 'ing-30', ingredientName: 'Onion', amount: 15, unit: 'gm' },
      { ingredientId: 'ing-29', ingredientName: 'Green Chili', amount: 3, unit: 'gm' },
      { ingredientId: 'ing-31', ingredientName: 'Fresh Coriander', amount: 3, unit: 'gm' },
      { ingredientId: 'ing-20', ingredientName: 'Chaat Masala', amount: 4, unit: 'gm' },
      { ingredientId: 'ing-21', ingredientName: 'Black Salt (Bit Salt)', amount: 1, unit: 'gm' },
      { ingredientId: 'ing-28', ingredientName: 'Tamarind Sauce', amount: 35, unit: 'gm' },
      { ingredientId: 'ing-8', ingredientName: 'Puri Shells', amount: 2, unit: 'pc' },
    ],
  },
  {
    id: 'rec-4',
    menuItemId: 'item-4',
    menuItemName: 'Fuchka',
    servingsBase: 1,
    instructions: '',
    ingredients: [
      { ingredientId: 'ing-8', ingredientName: 'Puri Shells', amount: 10, unit: 'pc' },
      { ingredientId: 'ing-1', ingredientName: 'Potato', amount: 80, unit: 'gm' },
      { ingredientId: 'ing-7', ingredientName: 'Yellow Peas (Dabli)', amount: 40, unit: 'gm' },
      { ingredientId: 'ing-30', ingredientName: 'Onion', amount: 15, unit: 'gm' },
      { ingredientId: 'ing-29', ingredientName: 'Green Chili', amount: 4, unit: 'gm' },
      { ingredientId: 'ing-31', ingredientName: 'Fresh Coriander', amount: 4, unit: 'gm' },
      { ingredientId: 'ing-20', ingredientName: 'Chaat Masala', amount: 5, unit: 'gm' },
      { ingredientId: 'ing-21', ingredientName: 'Black Salt (Bit Salt)', amount: 2, unit: 'gm' },
      { ingredientId: 'ing-28', ingredientName: 'Tamarind Sauce', amount: 70, unit: 'gm' },
      { ingredientId: 'ing-10', ingredientName: 'Egg', amount: 0.5, unit: 'pc' },
    ],
  },
  {
    id: 'rec-5',
    menuItemId: 'item-5',
    menuItemName: 'Potato Mash',
    servingsBase: 1,
    instructions: '',
    ingredients: [
      { ingredientId: 'ing-1', ingredientName: 'Potato', amount: 180, unit: 'gm' },
      { ingredientId: 'ing-11', ingredientName: 'Butter', amount: 15, unit: 'gm' },
      { ingredientId: 'ing-12', ingredientName: 'Liquid Milk', amount: 25, unit: 'ml' },
      { ingredientId: 'ing-18', ingredientName: 'Garlic', amount: 2, unit: 'gm' },
      { ingredientId: 'ing-16', ingredientName: 'Black Pepper', amount: 1, unit: 'gm' },
      { ingredientId: 'ing-15', ingredientName: 'Salt', amount: 2, unit: 'gm' },
    ],
  },
  {
    id: 'rec-6',
    menuItemId: 'item-6',
    menuItemName: 'Potato Ring',
    servingsBase: 1,
    instructions: '',
    ingredients: [
      { ingredientId: 'ing-1', ingredientName: 'Potato', amount: 140, unit: 'gm' },
      { ingredientId: 'ing-5', ingredientName: 'Cornstarch', amount: 25, unit: 'gm' },
      { ingredientId: 'ing-4', ingredientName: 'Flour (Maida)', amount: 15, unit: 'gm' },
      { ingredientId: 'ing-18', ingredientName: 'Garlic', amount: 3, unit: 'gm' },
      { ingredientId: 'ing-17', ingredientName: 'Chili Powder', amount: 1.5, unit: 'gm' },
      { ingredientId: 'ing-15', ingredientName: 'Salt', amount: 2.5, unit: 'gm' },
      { ingredientId: 'ing-2', ingredientName: 'Cooking Oil', amount: 25, unit: 'ml' },
      { ingredientId: 'ing-24', ingredientName: 'Tomato Ketchup', amount: 15, unit: 'gm' },
    ],
  },
  {
    id: 'rec-7',
    menuItemId: 'item-7',
    menuItemName: 'Pasta',
    servingsBase: 1,
    instructions: '',
    ingredients: [
      { ingredientId: 'ing-13', ingredientName: 'Pasta Raw', amount: 90, unit: 'gm' },
      { ingredientId: 'ing-3', ingredientName: 'Chicken Meat', amount: 45, unit: 'gm' },
      { ingredientId: 'ing-2', ingredientName: 'Cooking Oil', amount: 15, unit: 'ml' },
      { ingredientId: 'ing-30', ingredientName: 'Onion', amount: 20, unit: 'gm' },
      { ingredientId: 'ing-18', ingredientName: 'Garlic', amount: 4, unit: 'gm' },
      { ingredientId: 'ing-26', ingredientName: 'Soy Sauce', amount: 8, unit: 'ml' },
      { ingredientId: 'ing-24', ingredientName: 'Tomato Ketchup', amount: 20, unit: 'gm' },
      { ingredientId: 'ing-25', ingredientName: 'Chili Sauce', amount: 10, unit: 'gm' },
      { ingredientId: 'ing-16', ingredientName: 'Black Pepper', amount: 1, unit: 'gm' },
      { ingredientId: 'ing-15', ingredientName: 'Salt', amount: 2, unit: 'gm' },
    ],
  },
  {
    id: 'rec-8',
    menuItemId: 'item-8',
    menuItemName: 'Chowmein',
    servingsBase: 1,
    instructions: '',
    ingredients: [
      { ingredientId: 'ing-14', ingredientName: 'Chowmein Noodles', amount: 100, unit: 'gm' },
      { ingredientId: 'ing-3', ingredientName: 'Chicken Meat', amount: 35, unit: 'gm' },
      { ingredientId: 'ing-10', ingredientName: 'Egg', amount: 1, unit: 'pc' },
      { ingredientId: 'ing-32', ingredientName: 'Salad & Cabbage', amount: 40, unit: 'gm' },
      { ingredientId: 'ing-30', ingredientName: 'Onion', amount: 20, unit: 'gm' },
      { ingredientId: 'ing-29', ingredientName: 'Green Chili', amount: 3, unit: 'gm' },
      { ingredientId: 'ing-18', ingredientName: 'Garlic', amount: 3, unit: 'gm' },
      { ingredientId: 'ing-26', ingredientName: 'Soy Sauce', amount: 10, unit: 'ml' },
      { ingredientId: 'ing-24', ingredientName: 'Tomato Ketchup', amount: 15, unit: 'gm' },
      { ingredientId: 'ing-15', ingredientName: 'Salt', amount: 2, unit: 'gm' },
      { ingredientId: 'ing-16', ingredientName: 'Black Pepper', amount: 1, unit: 'gm' },
      { ingredientId: 'ing-2', ingredientName: 'Cooking Oil', amount: 20, unit: 'ml' },
    ],
  },
  {
    id: 'rec-9',
    menuItemId: 'item-9',
    menuItemName: 'Basic Chicken Burger',
    servingsBase: 1,
    instructions: '',
    ingredients: [
      { ingredientId: 'ing-9', ingredientName: 'Burger Bun', amount: 1, unit: 'pc' },
      { ingredientId: 'ing-3', ingredientName: 'Chicken Meat', amount: 80, unit: 'gm' },
      { ingredientId: 'ing-27', ingredientName: 'Mayonnaise', amount: 20, unit: 'gm' },
      { ingredientId: 'ing-24', ingredientName: 'Tomato Ketchup', amount: 15, unit: 'gm' },
      { ingredientId: 'ing-32', ingredientName: 'Salad & Cabbage', amount: 20, unit: 'gm' },
      { ingredientId: 'ing-30', ingredientName: 'Onion', amount: 15, unit: 'gm' },
      { ingredientId: 'ing-18', ingredientName: 'Garlic', amount: 2, unit: 'gm' },
      { ingredientId: 'ing-16', ingredientName: 'Black Pepper', amount: 1, unit: 'gm' },
      { ingredientId: 'ing-15', ingredientName: 'Salt', amount: 1.5, unit: 'gm' },
      { ingredientId: 'ing-2', ingredientName: 'Cooking Oil', amount: 10, unit: 'ml' },
    ],
  },
  {
    id: 'rec-10',
    menuItemId: 'item-10',
    menuItemName: 'Singara',
    servingsBase: 1,
    instructions: '',
    ingredients: [
      { ingredientId: 'ing-4', ingredientName: 'Flour (Maida)', amount: 60, unit: 'gm' },
      { ingredientId: 'ing-1', ingredientName: 'Potato', amount: 90, unit: 'gm' },
      { ingredientId: 'ing-30', ingredientName: 'Onion', amount: 15, unit: 'gm' },
      { ingredientId: 'ing-29', ingredientName: 'Green Chili', amount: 3, unit: 'gm' },
      { ingredientId: 'ing-19', ingredientName: 'Ginger', amount: 2, unit: 'gm' },
      { ingredientId: 'ing-22', ingredientName: 'Garam Masala', amount: 2, unit: 'gm' },
      { ingredientId: 'ing-23', ingredientName: 'Cumin & Coriander Powder', amount: 2, unit: 'gm' },
      { ingredientId: 'ing-15', ingredientName: 'Salt', amount: 2.5, unit: 'gm' },
      { ingredientId: 'ing-2', ingredientName: 'Cooking Oil', amount: 25, unit: 'ml' },
    ],
  },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  { id: 'item-1', name: 'French Fry', price: 0, available: true, isOriginal: true, stock: 0, trackStock: false, lowStockThreshold: 5 },
  { id: 'item-2', name: 'Chicken Nugget', price: 0, available: true, isOriginal: true, stock: 0, trackStock: false, lowStockThreshold: 5 },
  { id: 'item-3', name: 'Chotpoti', price: 0, available: true, isOriginal: true, stock: 0, trackStock: false, lowStockThreshold: 5 },
  { id: 'item-4', name: 'Fuchka', price: 0, available: true, isOriginal: true, stock: 0, trackStock: false, lowStockThreshold: 5 },
  { id: 'item-5', name: 'Potato Mash', price: 0, available: true, isOriginal: true, stock: 0, trackStock: false, lowStockThreshold: 5 },
  { id: 'item-6', name: 'Potato Ring', price: 0, available: true, isOriginal: true, stock: 0, trackStock: false, lowStockThreshold: 5 },
  { id: 'item-7', name: 'Pasta', price: 0, available: true, isOriginal: true, stock: 0, trackStock: false, lowStockThreshold: 5 },
  { id: 'item-8', name: 'Chowmein', price: 0, available: true, isOriginal: true, stock: 0, trackStock: false, lowStockThreshold: 5 },
  { id: 'item-9', name: 'Basic Chicken Burger', price: 0, available: true, isOriginal: true, stock: 0, trackStock: false, lowStockThreshold: 5 },
  { id: 'item-10', name: 'Singara', price: 0, available: true, isOriginal: true, stock: 0, trackStock: false, lowStockThreshold: 5 },
];

export const INITIAL_SETTINGS: ShopSettings = {
  shopName: 'PURSHAI FAST FOOD',
  currencySymbol: '৳',
  nextSaleNumber: 1,
};

export function getMenu(): MenuItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU);
    if (!raw) {
      saveMenu(INITIAL_MENU_ITEMS);
      return INITIAL_MENU_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: MenuItem) => ({
        ...item,
        stock: typeof item.stock === 'number' ? item.stock : 0,
        trackStock: typeof item.trackStock === 'boolean' ? item.trackStock : false,
        lowStockThreshold: typeof item.lowStockThreshold === 'number' ? item.lowStockThreshold : 5,
      }));
    }
    saveMenu(INITIAL_MENU_ITEMS);
    return INITIAL_MENU_ITEMS;
  } catch {
    return INITIAL_MENU_ITEMS;
  }
}

export function deductStock(soldItems: { itemId: string; quantity: number }[]): void {
  const currentMenu = getMenu();
  let modified = false;

  const updatedMenu = currentMenu.map((item) => {
    const sold = soldItems.find((s) => s.itemId === item.id);
    if (sold && item.trackStock) {
      modified = true;
      const currentStock = typeof item.stock === 'number' ? item.stock : 0;
      return {
        ...item,
        stock: Math.max(0, currentStock - sold.quantity),
      };
    }
    return item;
  });

  if (modified) {
    saveMenu(updatedMenu);
  }
}

export function updateItemStock(
  itemId: string,
  stock: number,
  trackStock?: boolean,
  lowStockThreshold?: number
): void {
  const currentMenu = getMenu();
  const updatedMenu = currentMenu.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        stock: Math.max(0, stock),
        ...(trackStock !== undefined ? { trackStock } : {}),
        ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
      };
    }
    return item;
  });
  saveMenu(updatedMenu);
}

export function saveMenu(menu: MenuItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
  } catch (err) {
    console.error('Failed to save menu to localStorage', err);
  }
}

export function getSales(): Sale[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSales(sales: Sale[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  } catch (err) {
    console.error('Failed to save sales to localStorage', err);
  }
}

export function getSettings(): ShopSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...INITIAL_SETTINGS, ...parsed };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: ShopSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

export function formatSaleNumber(num: number): string {
  const padded = String(num).padStart(4, '0');
  return `SALE #${padded}`;
}

export function createNewSale(saleData: {
  items: Sale['items'];
  subtotal: number;
  discount: number;
  grandTotal: number;
  cashReceived: number;
  change: number;
}): Sale {
  const settings = getSettings();
  const saleNum = settings.nextSaleNumber || 1;
  const saleId = formatSaleNumber(saleNum);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const timeStr = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const newSale: Sale = {
    saleId,
    saleNumber: saleNum,
    date: dateStr,
    time: timeStr,
    timestamp: now.getTime(),
    items: saleData.items,
    subtotal: saleData.subtotal,
    discount: saleData.discount,
    grandTotal: saleData.grandTotal,
    cashReceived: saleData.cashReceived,
    change: saleData.change,
  };

  const existingSales = getSales();
  const updatedSales = [newSale, ...existingSales];
  saveSales(updatedSales);

  saveSettings({
    ...settings,
    nextSaleNumber: saleNum + 1,
  });

  return newSale;
}

export function deleteSale(saleId: string): void {
  const existingSales = getSales();
  const filtered = existingSales.filter((s) => s.saleId !== saleId);
  saveSales(filtered);
}

export function clearAllSales(): void {
  saveSales([]);
}

const ZERO_STOCK_FLAG = 'purshai_zero_stock_flag_v1';

export function getIngredients(): RawIngredient[] {
  try {
    const isZeroed = localStorage.getItem(ZERO_STOCK_FLAG);
    if (!isZeroed) {
      const raw = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
      let list = INITIAL_INGREDIENTS;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed.map((item: RawIngredient) => ({
              ...item,
              currentStock: 0,
            }));
          }
        } catch {
          list = INITIAL_INGREDIENTS;
        }
      }
      saveIngredients(list);
      localStorage.setItem(ZERO_STOCK_FLAG, 'true');
      return list;
    }

    const raw = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    if (!raw) {
      saveIngredients(INITIAL_INGREDIENTS);
      return INITIAL_INGREDIENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const hasNonAscii = parsed.some((item: RawIngredient) => /[^\x00-\x7F]/.test(item.name));
      if (hasNonAscii) {
        saveIngredients(INITIAL_INGREDIENTS);
        return INITIAL_INGREDIENTS;
      }
      if (parsed.length < INITIAL_INGREDIENTS.length) {
        const merged = [...parsed];
        for (const initIng of INITIAL_INGREDIENTS) {
          if (!merged.some((m: RawIngredient) => m.id === initIng.id)) {
            merged.push(initIng);
          }
        }
        saveIngredients(merged);
        return merged;
      }
      return parsed;
    }
    saveIngredients(INITIAL_INGREDIENTS);
    return INITIAL_INGREDIENTS;
  } catch {
    return INITIAL_INGREDIENTS;
  }
}

export function saveIngredients(ingredients: RawIngredient[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  } catch (err) {
    console.error('Failed to save ingredients to localStorage', err);
  }
}

export function updateIngredientStock(ingredientId: string, newStock: number): void {
  const current = getIngredients();
  const updated = current.map((item) =>
    item.id === ingredientId ? { ...item, currentStock: Math.max(0, newStock) } : item
  );
  saveIngredients(updated);
}

export function adjustIngredientStock(ingredientId: string, delta: number): void {
  const current = getIngredients();
  const updated = current.map((item) =>
    item.id === ingredientId ? { ...item, currentStock: Math.max(0, item.currentStock + delta) } : item
  );
  saveIngredients(updated);
}

export function addIngredient(ingredient: RawIngredient): void {
  const current = getIngredients();
  saveIngredients([...current, ingredient]);
}

export function deleteIngredient(ingredientId: string): void {
  const current = getIngredients();
  const updated = current.filter((item) => item.id !== ingredientId);
  saveIngredients(updated);
}

export function resetAllIngredientsStockToZero(): void {
  const current = getIngredients();
  const updated = current.map((item) => ({ ...item, currentStock: 0 }));
  saveIngredients(updated);
}

export function getRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECIPES);
    if (!raw) {
      saveRecipes(INITIAL_RECIPES);
      return INITIAL_RECIPES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const hasOldGeneric = parsed.some(
        (r: Recipe) =>
          /[^\x00-\x7F]/.test(r.instructions || '') ||
          r.ingredients.some(
            (ing) =>
              /[^\x00-\x7F]/.test(ing.ingredientName) ||
              ing.ingredientName.includes('Salt & Spices') ||
              ing.ingredientId === 'ing-4'
          )
      );
      if (hasOldGeneric || parsed.length < INITIAL_RECIPES.length) {
        saveRecipes(INITIAL_RECIPES);
        return INITIAL_RECIPES;
      }
      return parsed;
    }
    saveRecipes(INITIAL_RECIPES);
    return INITIAL_RECIPES;
  } catch {
    return INITIAL_RECIPES;
  }
}

export function saveRecipes(recipes: Recipe[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  } catch (err) {
    console.error('Failed to save recipes to localStorage', err);
  }
}

export function saveRecipe(recipe: Recipe): void {
  const recipes = getRecipes();
  const exists = recipes.some((r) => r.id === recipe.id);
  const updated = exists ? recipes.map((r) => (r.id === recipe.id ? recipe : r)) : [...recipes, recipe];
  saveRecipes(updated);
}

export interface PreparationShortage {
  name: string;
  required: number;
  available: number;
  unit: string;
}

export function prepareRecipeBatch(
  recipe: Recipe,
  portions: number,
  addToFinishedStock = true
): {
  success: boolean;
  shortages?: PreparationShortage[];
  deductedItems?: { name: string; amount: number; remaining: number; unit: string }[];
} {
  if (portions <= 0) return { success: false };

  const currentIngredients = getIngredients();
  const shortages: PreparationShortage[] = [];
  const requiredDeductions: { id: string; amount: number }[] = [];

  // Check all ingredients against stock
  for (const item of recipe.ingredients) {
    const stockItem = currentIngredients.find((ing) => ing.id === item.ingredientId);
    const requiredAmount = item.amount * portions;
    const available = stockItem ? stockItem.currentStock : 0;

    if (!stockItem || available < requiredAmount) {
      shortages.push({
        name: item.ingredientName,
        required: requiredAmount,
        available: available,
        unit: item.unit,
      });
    } else {
      requiredDeductions.push({ id: item.ingredientId, amount: requiredAmount });
    }
  }

  // If there are shortages, cancel preparation
  if (shortages.length > 0) {
    return { success: false, shortages };
  }

  // Perform deductions from raw ingredients stock
  const deductedItems: { name: string; amount: number; remaining: number; unit: string }[] = [];
  const updatedIngredients = currentIngredients.map((ing) => {
    const toDeduct = requiredDeductions.find((d) => d.id === ing.id);
    if (toDeduct) {
      const remaining = Math.max(0, ing.currentStock - toDeduct.amount);
      deductedItems.push({
        name: ing.name,
        amount: toDeduct.amount,
        remaining,
        unit: ing.unit,
      });
      return {
        ...ing,
        currentStock: remaining,
      };
    }
    return ing;
  });

  saveIngredients(updatedIngredients);

  // If requested, add to finished food item's stock in MenuItem
  if (addToFinishedStock && recipe.menuItemId) {
    const menu = getMenu();
    const updatedMenu = menu.map((m) => {
      if (m.id === recipe.menuItemId) {
        return {
          ...m,
          stock: (m.stock ?? 0) + portions,
          trackStock: true, // enable stock tracking so POS enforces it
        };
      }
      return m;
    });
    saveMenu(updatedMenu);
  }

  return { success: true, deductedItems };
}

export function exportBackup(): string {
  const backup: BackupData = {
    version: '1.1',
    exportDate: new Date().toISOString(),
    shopSettings: getSettings(),
    menu: getMenu(),
    sales: getSales(),
    ingredients: getIngredients(),
    recipes: getRecipes(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackup(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Invalid backup file format.' };
    }

    if (!Array.isArray(data.menu)) {
      return { success: false, error: 'Backup is missing menu items.' };
    }

    if (!Array.isArray(data.sales)) {
      return { success: false, error: 'Backup is missing sales data.' };
    }

    // Restore menu
    saveMenu(data.menu);
    // Restore sales
    saveSales(data.sales);
    // Restore settings
    if (data.shopSettings && typeof data.shopSettings === 'object') {
      saveSettings({
        ...INITIAL_SETTINGS,
        ...data.shopSettings,
      });
    }

    // Restore ingredients if present
    if (Array.isArray(data.ingredients)) {
      saveIngredients(data.ingredients);
    }

    // Restore recipes if present
    if (Array.isArray(data.recipes)) {
      saveRecipes(data.recipes);
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to parse JSON backup file.' };
  }
}

