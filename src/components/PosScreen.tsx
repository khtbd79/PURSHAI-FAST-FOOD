import { useState } from 'react';
import { MenuItem, Sale, SaleItem, ShopSettings } from '../types/pos';
import { createNewSale, deductStock } from '../utils/storage';
import { getFoodImage } from '../utils/foodImages';
import { ReceiptModal } from './ReceiptModal';
import { Plus, Minus, Trash2, Printer, CheckCircle, ShoppingBag, AlertCircle } from 'lucide-react';

interface PosScreenProps {
  menu: MenuItem[];
  settings: ShopSettings;
  onSaleCompleted: () => void;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

export function PosScreen({ menu, settings, onSaleCompleted }: PosScreenProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountInput, setDiscountInput] = useState<string>('0');
  const [cashReceivedInput, setCashReceivedInput] = useState<string>('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'menu' | 'cart'>('menu');
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  // Filter available items only
  const availableItems = menu.filter((item) => item.available);

  // Show temporary stock warning
  const triggerStockWarning = (msg: string) => {
    setStockWarning(msg);
    setTimeout(() => setStockWarning(null), 3000);
  };

  // Cart operations with inventory stock enforcement
  const handleAddToCart = (item: MenuItem) => {
    if (item.trackStock && (item.stock ?? 0) <= 0) {
      triggerStockWarning(`"${item.name}" is out of stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        if (item.trackStock && existing.quantity + 1 > (item.stock ?? 0)) {
          triggerStockWarning(
            `Only ${item.stock} in stock for "${item.name}". Cannot add more.`
          );
          return prev;
        }
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleIncreaseQty = (itemId: string) => {
    const targetItem = menu.find((m) => m.id === itemId);
    setCart((prev) =>
      prev.map((ci) => {
        if (ci.item.id === itemId) {
          if (
            targetItem?.trackStock &&
            ci.quantity + 1 > (targetItem.stock ?? 0)
          ) {
            triggerStockWarning(
              `Only ${targetItem.stock} in stock for "${targetItem.name}".`
            );
            return ci;
          }
          return { ...ci, quantity: ci.quantity + 1 };
        }
        return ci;
      })
    );
  };

  const handleDecreaseQty = (itemId: string) => {
    setCart((prev) => {
      return prev
        .map((ci) => (ci.item.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci))
        .filter((ci) => ci.quantity > 0);
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountInput('0');
    setCashReceivedInput('');
  };

  // Calculations
  const subtotal = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const discountVal = Math.max(0, parseFloat(discountInput) || 0);
  const grandTotal = Math.max(0, subtotal - discountVal);

  const cashVal = parseFloat(cashReceivedInput);
  const hasEnteredCash = cashReceivedInput.trim() !== '' && !isNaN(cashVal);
  const cashReceived = hasEnteredCash ? cashVal : 0;
  const change = cashReceived - grandTotal;

  // Validation
  const hasItems = cart.length > 0;
  const isInsufficient = hasItems && (!hasEnteredCash || cashReceived < grandTotal);
  const canCompleteSale = hasItems && hasEnteredCash && cashReceived >= grandTotal;

  // Complete Sale
  const handleCompleteSale = () => {
    if (!canCompleteSale) return;

    const saleItems: SaleItem[] = cart.map((ci) => ({
      itemId: ci.item.id,
      itemName: ci.item.name,
      quantity: ci.quantity,
      unitPrice: ci.item.price,
      total: ci.item.price * ci.quantity,
    }));

    // Deduct stock from inventory for items with stock tracking
    deductStock(saleItems);

    const newSale = createNewSale({
      items: saleItems,
      subtotal,
      discount: discountVal,
      grandTotal,
      cashReceived,
      change,
    });

    setCompletedSale(newSale);
    setShowReceiptModal(true);
    setCart([]);
    setDiscountInput('0');
    setCashReceivedInput('');
    onSaleCompleted();
  };

  const totalCartItemCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-neutral-100">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-neutral-300 bg-white shrink-0">
        <button
          onClick={() => setMobileTab('menu')}
          className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
            mobileTab === 'menu'
              ? 'border-red-600 text-red-600 bg-red-50/50'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Food Menu ({availableItems.length})
        </button>
        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            mobileTab === 'cart'
              ? 'border-red-600 text-red-600 bg-red-50/50'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Current Order</span>
          {totalCartItemCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white text-xs rounded-full font-bold">
              {totalCartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* LEFT COLUMN: Food Menu Grid */}
      <div
        className={`flex-1 flex flex-col overflow-hidden bg-neutral-100 p-3 sm:p-4 ${
          mobileTab === 'menu' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-300">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
            FOOD MENU
          </h2>
          <span className="text-xs text-neutral-500 font-medium">
            {availableItems.length} items available
          </span>
        </div>

        {/* Temporary Stock Warning Banner */}
        {stockWarning && (
          <div className="mb-2 p-2.5 bg-red-600 text-white rounded font-bold text-xs flex items-center gap-2 animate-in fade-in shadow-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{stockWarning}</span>
          </div>
        )}

        {availableItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-500 bg-white rounded-lg border border-neutral-200">
            <p className="font-semibold text-neutral-700">No food items available</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
              {availableItems.map((item) => {
                const inCart = cart.find((c) => c.item.id === item.id);
                const isTracked = !!item.trackStock;
                const stock = item.stock ?? 0;
                const isOutOfStock = isTracked && stock <= 0;
                const isLowStock = isTracked && stock > 0 && stock <= (item.lowStockThreshold ?? 5);
                const foodImg = getFoodImage(item.id) || getFoodImage(item.name);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleAddToCart(item)}
                    disabled={isOutOfStock}
                    className={`relative flex flex-col justify-between p-2.5 sm:p-3 rounded-lg border-2 text-left shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 ${
                      isOutOfStock
                        ? 'bg-neutral-100 border-neutral-300 opacity-60 cursor-not-allowed'
                        : 'bg-white border-neutral-300 hover:border-red-500 active:bg-red-50 active:scale-[0.98] focus:ring-red-500'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute -top-2 -right-2 z-10 px-2 py-0.5 bg-red-600 text-white text-xs font-black rounded-full shadow-sm">
                        {inCart.quantity}
                      </span>
                    )}

                    <div className="flex items-center gap-2.5">
                      {foodImg ? (
                        <img
                          src={foodImg}
                          alt={item.name}
                          className="w-13 h-13 sm:w-15 sm:h-15 rounded-md object-cover border border-neutral-200 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-md bg-red-50 border border-red-200 flex items-center justify-center shrink-0 text-red-600 font-black text-lg">
                          {item.name.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <span className="font-extrabold text-sm sm:text-base text-red-600 line-clamp-2 leading-tight block">
                          {item.name}
                        </span>

                        {/* Stock Badge on POS button */}
                        {isTracked && (
                          <div className="mt-1">
                            {isOutOfStock ? (
                              <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                OUT OF STOCK
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  isLowStock
                                    ? 'text-amber-800 bg-amber-100 font-mono'
                                    : 'text-neutral-600 bg-neutral-100 font-mono'
                                }`}
                              >
                                Stock: {stock}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center justify-between">
                      <span className="font-black text-base sm:text-lg text-neutral-900 font-mono">
                        {settings.currencySymbol}
                        {item.price}
                      </span>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase">
                        ADD +
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick mobile bottom bar if in menu tab and has items */}
        {hasItems && mobileTab === 'menu' && (
          <div className="lg:hidden pt-2 shrink-0">
            <button
              onClick={() => setMobileTab('cart')}
              className="w-full py-3 px-4 bg-red-600 text-white font-bold rounded-lg flex items-center justify-between shadow-md active:bg-red-700"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span>
                  {totalCartItemCount} {totalCartItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs opacity-90 block">Grand Total</span>
                <span className="text-base font-extrabold">
                  {settings.currencySymbol}
                  {grandTotal}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Current Order & Payment */}
      <div
        className={`w-full lg:w-[420px] xl:w-[460px] bg-white border-l border-neutral-300 flex flex-col overflow-hidden shrink-0 shadow-lg ${
          mobileTab === 'cart' ? 'flex flex-1' : 'hidden lg:flex'
        }`}
      >
        {/* Order Header */}
        <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-sm sm:text-base tracking-wide uppercase">
              CURRENT ORDER
            </h2>
          </div>
          {hasItems && (
            <button
              onClick={handleClearCart}
              className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Order Items List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-neutral-200 min-h-[140px]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2 opacity-50" />
              <p className="font-bold text-sm text-neutral-600">Order is empty</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {cart.map((ci) => {
                const rowTotal = ci.item.price * ci.quantity;
                const cartFoodImg = getFoodImage(ci.item.id) || getFoodImage(ci.item.name);
                return (
                  <div
                    key={ci.item.id}
                    className="pt-2 first:pt-0 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {cartFoodImg && (
                        <img
                          src={cartFoodImg}
                          alt={ci.item.name}
                          className="w-10 h-10 rounded-md object-cover border border-neutral-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-sm text-red-600 truncate">
                          {ci.item.name}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono mt-0.5">
                          {ci.quantity} × {settings.currencySymbol}
                          {ci.item.price} ={' '}
                          <span className="font-bold text-neutral-800">
                            {settings.currencySymbol}
                            {rowTotal}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDecreaseQty(ci.item.id)}
                        className="w-8 h-8 rounded bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400 text-neutral-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
                        title="Decrease Quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-neutral-900 font-mono">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => handleIncreaseQty(ci.item.id)}
                        className="w-8 h-8 rounded bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400 text-neutral-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
                        title="Increase Quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(ci.item.id)}
                        className="w-8 h-8 ml-1 rounded bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Calculation and Payment Panel */}
        <div className="border-t-2 border-neutral-300 bg-neutral-50 p-3 sm:p-4 space-y-3 shrink-0">
          {/* Subtotal */}
          <div className="flex justify-between items-center text-sm font-semibold text-neutral-700">
            <span>Subtotal:</span>
            <span className="text-base text-neutral-900 font-mono font-bold">
              {settings.currencySymbol}
              {subtotal}
            </span>
          </div>

          {/* Discount input */}
          <div className="flex items-center justify-between gap-3 text-sm">
            <label htmlFor="discount-input" className="font-semibold text-neutral-700 shrink-0">
              Discount:
            </label>
            <div className="flex items-center gap-1 w-32">
              <span className="text-neutral-500 font-bold">{settings.currencySymbol}</span>
              <input
                id="discount-input"
                type="number"
                min="0"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-neutral-300 rounded text-right font-mono font-bold text-sm focus:outline-none focus:border-red-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-center pt-2 border-t border-neutral-300">
            <span className="text-base font-extrabold text-neutral-900 uppercase">
              Grand Total:
            </span>
            <span className="text-xl sm:text-2xl font-black text-red-600 font-mono">
              {settings.currencySymbol}
              {grandTotal}
            </span>
          </div>

          {/* Cash Received input */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="cash-received" className="text-sm font-bold text-neutral-800">
                Cash Received:
              </label>
              <div className="flex items-center gap-1 w-36">
                <span className="text-neutral-500 font-bold">{settings.currencySymbol}</span>
                <input
                  id="cash-received"
                  type="number"
                  min="0"
                  value={cashReceivedInput}
                  onChange={(e) => setCashReceivedInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border-2 border-neutral-400 rounded text-right font-mono font-bold text-base text-neutral-900 focus:outline-none focus:border-red-600"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Quick cash helper buttons */}
            {hasItems && (
              <div className="flex gap-1.5 overflow-x-auto py-1">
                <button
                  type="button"
                  onClick={() => setCashReceivedInput(String(grandTotal))}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400 text-neutral-800 shrink-0"
                >
                  Exact ({settings.currencySymbol}
                  {grandTotal})
                </button>
                {[50, 100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashReceivedInput(String(amt))}
                    className="px-2 py-1 text-xs font-semibold rounded bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400 text-neutral-700 shrink-0"
                  >
                    {settings.currencySymbol}
                    {amt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Change Display */}
          <div className="flex justify-between items-center text-sm font-bold text-neutral-800 py-1 border-t border-neutral-200">
            <span>Change:</span>
            <span
              className={`text-lg font-mono font-extrabold ${
                change < 0 ? 'text-red-600' : 'text-neutral-900'
              }`}
            >
              {settings.currencySymbol}
              {hasEnteredCash ? (change >= 0 ? change : 0) : 0}
            </span>
          </div>

          {/* Insufficient Payment Warning */}
          {isInsufficient && (
            <div className="p-2.5 bg-red-100 border-2 border-red-600 rounded text-center text-red-700 font-extrabold text-sm tracking-wider uppercase animate-pulse">
              INSUFFICIENT PAYMENT
            </div>
          )}

          {/* COMPLETE SALE BUTTON */}
          <button
            onClick={handleCompleteSale}
            disabled={!canCompleteSale}
            className={`w-full py-3.5 sm:py-4 px-4 rounded-lg font-extrabold text-base sm:text-lg tracking-wide uppercase transition-all shadow-md cursor-pointer ${
              canCompleteSale
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white active:scale-[0.99]'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-75'
            }`}
          >
            COMPLETE SALE
          </button>
        </div>
      </div>

      {/* Sale Completed Notification Banner & Print Receipt Trigger */}
      {completedSale && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-neutral-900 text-white rounded-lg shadow-2xl border-2 border-green-500 p-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-green-400 font-bold text-sm uppercase">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              <span>SALE COMPLETED</span>
            </div>
            <span className="font-mono font-bold text-xs bg-neutral-800 px-2 py-0.5 rounded text-neutral-200">
              {completedSale.saleId}
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-300 flex justify-between">
            <span>Total: {settings.currencySymbol}{completedSale.grandTotal}</span>
            <span>Change: {settings.currencySymbol}{completedSale.change}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowReceiptModal(true)}
              className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT RECEIPT</span>
            </button>
            <button
              onClick={() => setCompletedSale(null)}
              className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && completedSale && (
        <ReceiptModal
          sale={completedSale}
          shopName={settings.shopName}
          currencySymbol={settings.currencySymbol}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
}
