import { Category, DateFilter, RecurringFrequency, Transaction, CurrencyConfig } from '../types';

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)', rate: 0.012 },
  { code: 'EUR', symbol: '€', name: 'Euro (€)', rate: 0.011 },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)', rate: 0.0094 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)', rate: 0.044 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 0.016 },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rate: 0.018 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 0.016 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 1.86 },
];

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories (India-Centric)
  { id: 'cat_rent', name: 'House Rent & Society Maint.', icon: 'Home', color: '#6366f1', type: 'expense' },
  { id: 'cat_food', name: 'Groceries, Milk & Kirana', icon: 'ShoppingCart', color: '#10b981', type: 'expense' },
  { id: 'cat_dining', name: 'Dining & Swiggy / Zomato', icon: 'Utensils', color: '#f59e0b', type: 'expense' },
  { id: 'cat_maid', name: 'Maid, Cook & Domestic Help', icon: 'Users', color: '#ec4899', type: 'expense' },
  { id: 'cat_utilities', name: 'Electricity, Gas & Water Bills', icon: 'Zap', color: '#06b6d4', type: 'expense' },
  { id: 'cat_transport', name: 'Petrol, Cab & Metro', icon: 'Car', color: '#3b82f6', type: 'expense' },
  { id: 'cat_subscriptions', name: 'OTT & Broadband (Hotstar, Jio, Net)', icon: 'Tv', color: '#8b5cf6', type: 'expense' },
  { id: 'cat_shopping', name: 'Shopping & E-Commerce', icon: 'ShoppingBag', color: '#d946ef', type: 'expense' },
  { id: 'cat_health', name: 'Healthcare, Meds & Cult.fit', icon: 'HeartPulse', color: '#ef4444', type: 'expense' },
  { id: 'cat_investments', name: 'Mutual Fund SIP, PPF & Gold', icon: 'PiggyBank', color: '#84cc16', type: 'expense' },
  { id: 'cat_education', name: 'Education, Books & School', icon: 'GraduationCap', color: '#14b8a6', type: 'expense' },
  { id: 'cat_festivals', name: 'Festivals, Gifting & Shagun', icon: 'Gift', color: '#eab308', type: 'expense' },
  { id: 'cat_misc', name: 'Miscellaneous Expenses', icon: 'Tag', color: '#64748b', type: 'expense' },
  
  // Income Categories
  { id: 'cat_salary', name: 'Salary & Monthly Inflow', icon: 'Briefcase', color: '#10b981', type: 'income' },
  { id: 'cat_freelance', name: 'Freelance & Side Gig', icon: 'Laptop', color: '#6366f1', type: 'income' },
  { id: 'cat_dividends', name: 'Dividends & Mutual Fund Profit', icon: 'TrendingUp', color: '#8b5cf6', type: 'income' },
  { id: 'cat_rental_income', name: 'Rental Income', icon: 'Home', color: '#06b6d4', type: 'income' },
  { id: 'cat_cashback', name: 'Cashback, UPI Rewards & Shagun', icon: 'Gift', color: '#f59e0b', type: 'income' },
  { id: 'cat_income_other', name: 'Other Income', icon: 'Wallet', color: '#64748b', type: 'income' },
];

export function formatCurrency(amount: number, currency: CurrencyConfig = CURRENCIES[0]): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Indian number grouping (Lakhs & Crores)
  const locale = currency.code === 'INR' ? 'en-IN' : 'en-US';

  let formatted = absAmount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // If currency code is JPY, no decimals
  if (currency.code === 'JPY') {
    formatted = Math.round(absAmount).toLocaleString(locale);
  }

  const prefix = isNegative ? '-' : '';
  return `${prefix}${currency.symbol}${formatted}`;
}

export function formatIndianCompact(amount: number, currency: CurrencyConfig = CURRENCIES[0]): string {
  if (currency.code !== 'INR') {
    return formatCurrency(amount, currency);
  }
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)} k`;
  }
  return formatCurrency(amount, currency);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function getIndianFinancialYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 2 = Mar, 3 = Apr
  if (month >= 3) {
    return `${year}-${String((year + 1) % 100).padStart(2, '0')}`;
  } else {
    return `${year - 1}-${String(year % 100).padStart(2, '0')}`;
  }
}

export function getFinancialYearRange(fyString: string): { start: string; end: string } {
  const startYear = parseInt(fyString.split('-')[0], 10);
  const endYear = startYear + 1;
  return {
    start: `${startYear}-04-01`,
    end: `${endYear}-03-31`
  };
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function calculateAnnualCost(amount: number, frequency: RecurringFrequency): number {
  switch (frequency) {
    case 'weekly':
      return amount * 52;
    case 'monthly':
      return amount * 12;
    case 'quarterly':
      return amount * 4;
    case 'yearly':
      return amount;
    default:
      return amount * 12;
  }
}

export function calculateMonthlyCost(amount: number, frequency: RecurringFrequency): number {
  switch (frequency) {
    case 'weekly':
      return (amount * 52) / 12;
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
}

export function getNextOccurrence(startDate: string, frequency: RecurringFrequency): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  let target = new Date(startDate + 'T00:00:00');
  if (isNaN(target.getTime())) {
    target = new Date();
  }

  while (target <= now) {
    if (frequency === 'weekly') {
      target.setDate(target.getDate() + 7);
    } else if (frequency === 'monthly') {
      target.setMonth(target.getMonth() + 1);
    } else if (frequency === 'quarterly') {
      target.setMonth(target.getMonth() + 3);
    } else if (frequency === 'yearly') {
      target.setFullYear(target.getFullYear() + 1);
    } else {
      break;
    }
  }

  return target.toISOString().split('T')[0];
}

export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function filterTransactionsByDate(transactions: Transaction[], filter: DateFilter): Transaction[] {
  return transactions.filter(tx => {
    const txDate = new Date(tx.date + 'T00:00:00');
    if (isNaN(txDate.getTime())) return false;

    if (filter.mode === 'monthly') {
      return txDate.getFullYear() === filter.year && txDate.getMonth() === filter.month;
    }

    if (filter.mode === 'yearly') {
      return txDate.getFullYear() === filter.year;
    }

    if (filter.mode === 'financial_year') {
      const fy = filter.financialYear || getIndianFinancialYear();
      const range = getFinancialYearRange(fy);
      const start = new Date(range.start + 'T00:00:00');
      const end = new Date(range.end + 'T23:59:59');
      return txDate >= start && txDate <= end;
    }

    if (filter.mode === 'custom') {
      if (filter.startDate && filter.endDate) {
        const start = new Date(filter.startDate + 'T00:00:00');
        const end = new Date(filter.endDate + 'T23:59:59');
        return txDate >= start && txDate <= end;
      }
    }

    return true; // 'all'
  });
}
