import { useEffect } from 'react';
import { Sale } from '../types/pos';
import { Printer, X } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale;
  shopName: string;
  currencySymbol: string;
  onClose: () => void;
  autoPrint?: boolean;
}

export function ReceiptModal({
  sale,
  shopName,
  currencySymbol,
  onClose,
  autoPrint = false,
}: ReceiptModalProps) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      {/* Modal Container */}
      <div className="relative w-full max-w-sm rounded-lg bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 text-white">
          <span className="font-semibold text-sm tracking-wide">Receipt Preview</span>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-neutral-100 flex justify-center">
          <div
            id="printable-receipt"
            className="w-full max-w-[320px] bg-white p-4 text-black border border-neutral-300 shadow-sm font-mono text-xs leading-relaxed"
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-neutral-400">
              <h1 className="text-base font-bold tracking-wider uppercase mb-1">{shopName}</h1>
              <p className="font-semibold text-neutral-800">{sale.saleId}</p>
              <div className="flex justify-between text-[11px] text-neutral-600 mt-1">
                <span>Date: {sale.date}</span>
                <span>Time: {sale.time}</span>
              </div>
            </div>

            {/* Items Header */}
            <div className="pt-2 pb-1 border-b border-neutral-300 grid grid-cols-12 text-[11px] font-semibold text-neutral-700">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {/* Items List */}
            <div className="py-2 space-y-1.5 border-b border-dashed border-neutral-400">
              {sale.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] items-start">
                  <span className="col-span-6 font-medium text-neutral-900 break-words pr-1">
                    {item.itemName}
                  </span>
                  <span className="col-span-2 text-center text-neutral-700">{item.quantity}</span>
                  <span className="col-span-2 text-right text-neutral-700">
                    {currencySymbol}
                    {item.unitPrice}
                  </span>
                  <span className="col-span-2 text-right font-medium text-neutral-900">
                    {currencySymbol}
                    {item.total}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="py-2 space-y-1 text-xs border-b border-dashed border-neutral-400">
              <div className="flex justify-between">
                <span className="text-neutral-700">Subtotal:</span>
                <span className="font-semibold">
                  {currencySymbol}
                  {sale.subtotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-700">Discount:</span>
                <span className="font-semibold">
                  {currencySymbol}
                  {sale.discount}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-neutral-200">
                <span>Grand Total:</span>
                <span>
                  {currencySymbol}
                  {sale.grandTotal}
                </span>
              </div>
              <div className="flex justify-between text-neutral-700 pt-1">
                <span>Cash Received:</span>
                <span className="font-semibold">
                  {currencySymbol}
                  {sale.cashReceived}
                </span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Change:</span>
                <span className="font-semibold">
                  {currencySymbol}
                  {sale.change}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 text-center">
              <p className="font-semibold text-neutral-800">Thank You</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-white border-t border-neutral-200 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm rounded flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT RECEIPT</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400 text-neutral-800 font-semibold text-sm rounded transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
