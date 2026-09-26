import { Sale } from '../types/pos';

export type ReportFilter = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'custom';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function filterSalesByPeriod(
  sales: Sale[],
  filter: ReportFilter,
  customDate?: string
): Sale[] {
  const now = new Date();
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  switch (filter) {
    case 'today':
      return sales.filter((s) => s.date === todayStr);

    case 'yesterday':
      return sales.filter((s) => s.date === yesterdayStr);

    case 'thisWeek': {
      // Current week starting from Monday
      const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
      const distanceToMonday = (currentDay + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - distanceToMonday);
      monday.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(monday);
      endOfWeek.setDate(monday.getDate() + 7);

      return sales.filter((s) => {
        const t = s.timestamp || new Date(s.date).getTime();
        return t >= monday.getTime() && t < endOfWeek.getTime();
      });
    }

    case 'thisMonth': {
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return sales.filter((s) => s.date && s.date.startsWith(yearMonth));
    }

    case 'custom': {
      if (!customDate) return sales;
      return sales.filter((s) => s.date === customDate);
    }

    default:
      return sales;
  }
}
