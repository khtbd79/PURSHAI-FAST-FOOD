import { useState, useMemo } from 'react';
import { Sale, ShopSettings } from '../types/pos';
import { ReportFilter, filterSalesByPeriod, getTodayDateString } from '../utils/date';
import { Calendar } from 'lucide-react';

interface ReportScreenProps {
  sales: Sale[];
  settings: ShopSettings;
}

export function ReportScreen({ sales, settings }: ReportScreenProps) {
  const [filter, setFilter] = useState<ReportFilter>('today');
  const [customDate, setCustomDate] = useState<string>(getTodayDateString());

  // Filter sales
  const filteredSales = useMemo(() => {
    return filterSalesByPeriod(sales, filter, customDate);
  }, [sales, filter, customDate]);

  // Aggregate metrics
  const totalSales = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  }, [filteredSales]);

  const totalOrders = filteredSales.length;

  const totalItemsSold = useMemo(() => {
    return filteredSales.reduce((sum, s) => {
      const itemsInSale = s.items.reduce((iSum, item) => iSum + item.quantity, 0);
      return sum + itemsInSale;
    }, 0);
  }, [filteredSales]);

  // Aggregate item sales
  const itemSales = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; total: number }>();

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const key = item.itemName;
        const existing = map.get(key);
        if (existing) {
          existing.quantity += item.quantity;
          existing.total += item.total;
        } else {
          map.set(key, {
            name: item.itemName,
            quantity: item.quantity,
            total: item.total,
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);
  }, [filteredSales]);

  const filterOptions: { id: ReportFilter; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'custom', label: 'Custom Date' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-100 p-3 sm:p-5">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-neutral-300">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
            SALES REPORT
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-lg border border-neutral-300">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer whitespace-nowrap ${
                filter === opt.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Input Picker if 'custom' selected */}
      {filter === 'custom' && (
        <div className="mb-4 p-3 bg-white border border-neutral-300 rounded-lg flex items-center gap-3">
          <Calendar className="w-5 h-5 text-neutral-500 shrink-0" />
          <label htmlFor="custom-date" className="text-xs font-bold text-neutral-700">
            Select Date:
          </label>
          <input
            id="custom-date"
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold text-neutral-900 focus:outline-none focus:border-red-600"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Top 3 Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Total Sales */}
          <div className="bg-white rounded-lg p-4 border border-neutral-300 shadow-2xs">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              {filter === 'today' ? "Today's Sales" : 'Total Sales'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-red-600 font-mono mt-1">
              {settings.currencySymbol}
              {totalSales}
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg p-4 border border-neutral-300 shadow-2xs">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              {filter === 'today' ? "Today's Orders" : 'Total Orders'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 font-mono mt-1">
              {totalOrders}
            </div>
          </div>

          {/* Total Items Sold */}
          <div className="bg-white rounded-lg p-4 border border-neutral-300 shadow-2xs">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              {filter === 'today' ? "Today's Items Sold" : 'Total Items Sold'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 font-mono mt-1">
              {totalItemsSold}
            </div>
          </div>
        </div>

        {/* ITEM SALES Breakdown Section */}
        <div className="bg-white rounded-lg border border-neutral-300 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between">
            <h3 className="font-bold text-sm tracking-wide uppercase">ITEM SALES</h3>
            <span className="text-xs text-neutral-300 font-mono">
              {itemSales.length} items sold
            </span>
          </div>

          {itemSales.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <p className="font-semibold text-neutral-700">No items sold</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                    <th className="py-2.5 px-4">Item Name</th>
                    <th className="py-2.5 px-4 text-center">Quantity Sold</th>
                    <th className="py-2.5 px-4 text-right">Total Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {itemSales.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-neutral-900">{item.name}</td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-neutral-800">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">
                        {settings.currencySymbol}
                        {item.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
