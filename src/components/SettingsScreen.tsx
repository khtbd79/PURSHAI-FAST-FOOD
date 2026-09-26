import { useState, useRef } from 'react';
import { MenuItem, ShopSettings } from '../types/pos';
import {
  saveMenu,
  saveSettings,
  exportBackup,
  importBackup,
  clearAllSales,
} from '../utils/storage';
import { getFoodImage } from '../utils/foodImages';
import {
  Plus,
  Download,
  Upload,
  AlertTriangle,
  Check,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Trash2,
} from 'lucide-react';

interface SettingsScreenProps {
  menu: MenuItem[];
  settings: ShopSettings;
  onMenuUpdated: () => void;
  onSettingsUpdated: () => void;
  onSalesCleared: () => void;
}

export function SettingsScreen({
  menu,
  settings,
  onMenuUpdated,
  onSettingsUpdated,
  onSalesCleared,
}: SettingsScreenProps) {
  // Navigation within settings tabs
  const [activeSection, setActiveSection] = useState<'menu' | 'shop' | 'data'>('menu');

  // Menu editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editPrice, setEditPrice] = useState<string>('');

  // Add new item state
  const [newName, setNewName] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [addError, setAddError] = useState<string>('');

  // Shop info state
  const [shopNameInput, setShopNameInput] = useState<string>(settings.shopName);
  const [shopSaveSuccess, setShopSaveSuccess] = useState<boolean>(false);

  // Clear sales confirmation
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [clearSuccess, setClearSuccess] = useState<boolean>(false);

  // Backup / Restore feedback
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start editing menu item
  const handleStartEdit = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
  };

  // Save edited menu item
  const handleSaveEdit = (itemId: string) => {
    const trimmed = editName.trim();
    const priceVal = parseFloat(editPrice);
    if (!trimmed || isNaN(priceVal) || priceVal < 0) return;

    const updated = menu.map((m) =>
      m.id === itemId ? { ...m, name: trimmed, price: priceVal } : m
    );
    saveMenu(updated);
    setEditingItemId(null);
    onMenuUpdated();
  };

  // Toggle availability
  const handleToggleAvailable = (itemId: string) => {
    const updated = menu.map((m) =>
      m.id === itemId ? { ...m, available: !m.available } : m
    );
    saveMenu(updated);
    onMenuUpdated();
  };

  // Delete custom food item (Originals cannot be deleted)
  const handleDeleteCustomItem = (itemId: string) => {
    const item = menu.find((m) => m.id === itemId);
    if (item?.isOriginal) return; // Do not allow deleting original items
    const updated = menu.filter((m) => m.id !== itemId);
    saveMenu(updated);
    onMenuUpdated();
  };

  // Add new food item
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setAddError('Food name is required.');
      return;
    }
    const priceVal = parseFloat(newPrice);
    if (isNaN(priceVal) || priceVal < 0) {
      setAddError('Please enter a valid price (৳0 or higher).');
      return;
    }

    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      price: priceVal,
      available: true,
      isOriginal: false,
      stock: 0,
      trackStock: false,
      lowStockThreshold: 5,
    };

    const updated = [...menu, newItem];
    saveMenu(updated);
    setNewName('');
    setNewPrice('');
    setAddError('');
    onMenuUpdated();
  };

  // Save Shop Information
  const handleSaveShopInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = shopNameInput.trim();
    if (!trimmed) return;

    saveSettings({
      ...settings,
      shopName: trimmed,
    });
    onSettingsUpdated();
    setShopSaveSuccess(true);
    setTimeout(() => setShopSaveSuccess(false), 3000);
  };

  // Export Backup
  const handleExportBackup = () => {
    const jsonStr = exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `purshai_pos_backup_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackup(content);
      if (res.success) {
        setImportStatus({ success: true, message: 'Backup restored successfully!' });
        onMenuUpdated();
        onSettingsUpdated();
        onSalesCleared(); // refresh sales
      } else {
        setImportStatus({
          success: false,
          message: res.error || 'Failed to restore backup.',
        });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Clear all sales
  const handleClearSales = () => {
    clearAllSales();
    setShowClearConfirm(false);
    setClearSuccess(true);
    onSalesCleared();
    setTimeout(() => setClearSuccess(false), 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-100 p-3 sm:p-5">
      {/* Header */}
      <div className="pb-3 mb-3 border-b border-neutral-300">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
          SETTINGS
        </h2>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto">
          <button
            onClick={() => setActiveSection('menu')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'menu'
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            1. Food Menu ({menu.length})
          </button>
          <button
            onClick={() => setActiveSection('shop')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'shop'
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            2. Shop Information
          </button>
          <button
            onClick={() => setActiveSection('data')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'data'
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            3. Backup & Data
          </button>
        </div>
      </div>

      {/* SECTION 1: FOOD MENU */}
      {activeSection === 'menu' && (
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Add New Food Item Box */}
          <div className="bg-white rounded-lg border border-neutral-300 shadow-2xs p-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-red-600" />
              <span>ADD NEW FOOD ITEM</span>
            </h3>

            <form onSubmit={handleAddNewItem} className="space-y-3">
              {addError && (
                <div className="p-2 bg-red-50 text-red-700 text-xs font-bold rounded border border-red-200">
                  {addError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="food-name-input" className="block text-xs font-bold text-neutral-700 mb-1">
                    Food Name
                  </label>
                  <input
                    id="food-name-input"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Crispy Roll"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="food-price-input" className="block text-xs font-bold text-neutral-700 mb-1">
                    Price ({settings.currencySymbol})
                  </label>
                  <input
                    id="food-price-input"
                    type="number"
                    min="0"
                    step="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold font-mono focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food Item</span>
              </button>
            </form>
          </div>

          {/* Food Menu Items List */}
          <div className="bg-white rounded-lg border border-neutral-300 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-wide uppercase">MENU ITEMS ({menu.length})</h3>
            </div>

            <div className="divide-y divide-neutral-200">
              {menu.map((item) => {
                const isEditing = editingItemId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      !item.available ? 'bg-neutral-50/80 opacity-75' : 'bg-white'
                    }`}
                  >
                    {isEditing ? (
                      /* Editing Mode */
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 block">Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-sm font-bold border border-neutral-400 rounded focus:border-red-600"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 block">
                            Price ({settings.currencySymbol})
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-sm font-bold font-mono border border-neutral-400 rounded focus:border-red-600"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Normal Display Mode */
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFoodImage(item.id) || getFoodImage(item.name) ? (
                          <img
                            src={getFoodImage(item.id) || getFoodImage(item.name)}
                            alt={item.name}
                            className="w-12 h-12 rounded-md object-cover border border-neutral-200 shrink-0"
                          />
                        ) : null}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-yellow-600">
                              {item.name}
                            </span>
                            {!item.available && (
                              <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                Unavailable
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 font-mono mt-0.5 flex items-center gap-2">
                            <span>Price:</span>
                            <span className="font-bold text-base text-red-600">
                              {settings.currencySymbol}
                              {item.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="px-2.5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-semibold rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Available Toggle */}
                          <button
                            onClick={() => handleToggleAvailable(item.id)}
                            className={`px-2.5 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                              item.available
                                ? 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                            title="Toggle Availability on POS Screen"
                          >
                            {item.available ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-neutral-900" />
                                <span>Available</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-red-600" />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit Name or Price"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Delete only if custom added */}
                          {!item.isOriginal && (
                            <button
                              onClick={() => handleDeleteCustomItem(item.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors cursor-pointer"
                              title="Delete Food Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SHOP INFORMATION */}
      {activeSection === 'shop' && (
        <div className="flex-1 overflow-y-auto space-y-4 max-w-xl pr-1">
          <div className="bg-white rounded-lg border border-neutral-300 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-4">
              SHOP INFORMATION
            </h3>

            {shopSaveSuccess && (
              <div className="mb-4 p-2.5 bg-neutral-900 text-white text-xs font-bold rounded flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Shop information updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveShopInfo} className="space-y-4">
              <div>
                <label htmlFor="shop-name-input" className="block text-xs font-bold text-neutral-700 mb-1">
                  Shop Name
                </label>
                <input
                  id="shop-name-input"
                  type="text"
                  value={shopNameInput}
                  onChange={(e) => setShopNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-bold uppercase focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Currency
                </label>
                <div className="px-3 py-2 bg-neutral-100 border border-neutral-300 rounded text-sm font-bold text-neutral-600">
                  BDT ({settings.currencySymbol})
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded transition-colors cursor-pointer"
              >
                Save Shop Info
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 3: BACKUP, RESTORE & CLEAR SALES */}
      {activeSection === 'data' && (
        <div className="flex-1 overflow-y-auto space-y-5 max-w-2xl pr-1">
          {importStatus && (
            <div
              className={`p-3 rounded text-xs font-bold flex items-center justify-between ${
                importStatus.success
                  ? 'bg-neutral-900 text-white'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              <span>{importStatus.message}</span>
              <button
                onClick={() => setImportStatus(null)}
                className="ml-2 font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {clearSuccess && (
            <div className="p-3 bg-neutral-900 text-white text-xs font-bold rounded flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>All sales records have been cleared. Menu items were preserved.</span>
            </div>
          )}

          {/* Backup Box */}
          <div className="bg-white rounded-lg border border-neutral-300 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Download className="w-4 h-4 text-neutral-700" />
              <span>BACKUP</span>
            </h3>

            <button
              onClick={handleExportBackup}
              className="py-2.5 px-4 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT BACKUP</span>
            </button>
          </div>

          {/* Restore Box */}
          <div className="bg-white rounded-lg border border-neutral-300 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-neutral-700" />
              <span>RESTORE</span>
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-4 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs rounded flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>IMPORT BACKUP</span>
            </button>
          </div>

          {/* Clear Sales Box */}
          <div className="bg-white rounded-lg border-2 border-red-300 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>CLEAR SALES</span>
            </h3>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>CLEAR ALL SALES</span>
            </button>
          </div>
        </div>
      )}

      {/* CLEAR ALL SALES CONFIRMATION MODAL */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-5 border-2 border-red-600">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-neutral-900">Clear All Sales?</h3>
            </div>
            <p className="text-sm text-neutral-700 leading-normal font-medium">
              Are you sure you want to delete all sales?
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold text-xs rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearSales}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-colors cursor-pointer"
              >
                Yes, Clear All Sales
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
