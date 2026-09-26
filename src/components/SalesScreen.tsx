import { useState } from 'react';
import { Sale, ShopSettings } from '../types/pos';
import { deleteSale } from '../utils/storage';
import { getFoodImage } from '../utils/foodImages';
import { ReceiptModal } from './ReceiptModal';
import { Eye, Printer, Trash2, X, AlertTriangle } from 'lucide-react';

interface SalesScreenProps {
  sales: Sale[];
  settings: ShopSettings;
  onSalesUpdated: () => void;
}

export function SalesScreen({ sales, settings, onSalesUpdated }: SalesScreenProps) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [printSale, setPrintSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  const handleDeleteConfirm = () => {
    if (!saleToDelete) return;
    deleteSale(saleToDelete.saleId);
    if (selectedSale?.saleId === saleToDelete.saleId) {
      setSelectedSale(null);
    }
    setSaleToDelete(null);
    onSalesUpdated();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-100 p-3 sm:p-5">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-300">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
            SALES HISTORY
          </h2>
        </div>
      </div>

      {sales.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-neutral-300 text-center">
          <p className="font-bold text-base text-neutral-800">No sales recorded</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="space-y-2.5">
            {sales.map((sale) => (
              <div
                key={sale.saleId}
                className="bg-white rounded-lg border border-neutral-300 hover:border-neutral-400 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                {/* Sale Info */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => setSelectedSale(sale)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-base sm:text-lg text-neutral-900">
                      {sale.saleId}
                    </span>
                    <span className="text-xs text-neutral-500">·</span>
                    <span className="text-xs text-neutral-600 font-medium">
                      {sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                    <span>Date: {sale.date}</span>
                    <span>·</span>
                    <span>Time: {sale.time}</span>
                  </div>
                </div>

                {/* Total and Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                  <div className="text-left sm:text-right">
                    <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                      Grand Total
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-red-600 font-mono">
                      {settings.currencySymbol}
                      {sale.grandTotal}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 text-xs font-bold rounded flex items-center gap-1 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>VIEW</span>
                    </button>
                    <button
                      onClick={() => setPrintSale(sale)}
                      className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-900 active:bg-black text-white text-xs font-bold rounded flex items-center gap-1 transition-colors cursor-pointer"
                      title="Print Receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PRINT</span>
                    </button>
                    <button
                      onClick={() => setSaleToDelete(sale)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 rounded transition-colors cursor-pointer"
                      title="Delete Sale"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW SALE DETAILS MODAL */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide">SALE DETAILS</span>
                <span className="text-xs font-mono bg-neutral-800 text-neutral-200 px-2 py-0.5 rounded">
                  {selectedSale.saleId}
                </span>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-neutral-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Date & Time */}
              <div className="flex justify-between text-xs text-neutral-600 pb-2 border-b border-neutral-200">
                <span>Date: <strong className="text-neutral-800">{selectedSale.date}</strong></span>
                <span>Time: <strong className="text-neutral-800">{selectedSale.time}</strong></span>
              </div>

              {/* Items Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Items Purchased
                </h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item, idx) => {
                    const itemImg = getFoodImage(item.itemId) || getFoodImage(item.itemName);
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm py-1.5 border-b border-neutral-100"
                      >
                        <div className="flex items-center gap-2.5">
                          {itemImg && (
                            <img
                              src={itemImg}
                              alt={item.itemName}
                              className="w-9 h-9 rounded object-cover border border-neutral-200 shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-extrabold text-sm text-yellow-600">{item.itemName}</div>
                            <div className="text-xs text-neutral-500 font-mono">
                              {item.quantity} × {settings.currencySymbol}
                              {item.unitPrice}
                            </div>
                          </div>
                        </div>
                        <div className="font-bold font-mono text-neutral-900">
                          {settings.currencySymbol}
                          {item.total}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="pt-2 border-t-2 border-neutral-200 space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-700">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">
                    {settings.currencySymbol}
                    {selectedSale.subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Discount:</span>
                  <span className="font-mono font-semibold">
                    {settings.currencySymbol}
                    {selectedSale.discount}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t border-neutral-200 text-neutral-900">
                  <span>Grand Total:</span>
                  <span className="text-red-600 font-mono text-lg">
                    {settings.currencySymbol}
                    {selectedSale.grandTotal}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-700 pt-1">
                  <span>Cash Received:</span>
                  <span className="font-mono font-semibold">
                    {settings.currencySymbol}
                    {selectedSale.cashReceived}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Change:</span>
                  <span className="font-mono font-semibold">
                    {settings.currencySymbol}
                    {selectedSale.change}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-3 bg-neutral-100 border-t border-neutral-200 flex gap-2">
              <button
                onClick={() => {
                  setPrintSale(selectedSale);
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>PRINT RECEIPT</span>
              </button>
              <button
                onClick={() => {
                  setSaleToDelete(selectedSale);
                }}
                className="py-2.5 px-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>DELETE</span>
              </button>
              <button
                onClick={() => setSelectedSale(null)}
                className="py-2.5 px-3 bg-neutral-300 hover:bg-neutral-400 text-neutral-800 font-semibold text-xs rounded transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-5 border-2 border-red-500">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-neutral-900">Delete Sale Record?</h3>
            </div>
            <p className="text-sm text-neutral-600 leading-normal">
              Are you sure you want to delete <strong className="text-neutral-900">{saleToDelete.saleId}</strong> ({settings.currencySymbol}{saleToDelete.grandTotal})? This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => setSaleToDelete(null)}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold text-xs rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      {printSale && (
        <ReceiptModal
          sale={printSale}
          shopName={settings.shopName}
          currencySymbol={settings.currencySymbol}
          onClose={() => setPrintSale(null)}
          autoPrint={true}
        />
      )}
    </div>
  );
}
