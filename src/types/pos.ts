export interface MenuItem {
  id: string;
  name: string;
  price: number;
  available: boolean;
  isOriginal?: boolean;
  stock?: number;
  trackStock?: boolean;
  lowStockThreshold?: number;
}

export interface SaleItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  saleId: string; // e.g. "SALE #0001"
  saleNumber: number;
  date: string; // e.g. "2026-09-25"
  time: string; // e.g. "11:15 PM"
  timestamp: number; // Date.now()
  items: SaleItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  cashReceived: number;
  change: number;
}

export interface RawIngredient {
  id: string;
  name: string;
  unit: 'gm' | 'kg' | 'ml' | 'liter' | 'pc';
  currentStock: number; // in base units: gm, ml, or pc
  minThreshold: number;
  costPerUnit?: number; // cost in ৳
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  amount: number; // amount required for 1 serving
  unit: 'gm' | 'kg' | 'ml' | 'liter' | 'pc';
}

export interface Recipe {
  id: string;
  menuItemId: string;
  menuItemName: string;
  servingsBase: number; // default 1
  ingredients: RecipeIngredient[];
  instructions?: string;
}

export interface ShopSettings {
  shopName: string;
  currencySymbol: string;
  nextSaleNumber: number;
}

export interface BackupData {
  version: string;
  exportDate: string;
  shopSettings: ShopSettings;
  menu: MenuItem[];
  sales: Sale[];
  ingredients?: RawIngredient[];
  recipes?: Recipe[];
}

export type ActiveTab = 'pos' | 'sales' | 'inventory' | 'recipe' | 'report' | 'settings';
