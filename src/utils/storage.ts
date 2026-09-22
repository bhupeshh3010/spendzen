import {
  Account,
  BillSplit,
  Budget,
  Category,
  CurrencyConfig,
  SavingsGoal,
  Subscription,
  Transaction
} from '../types';
import { CURRENCIES, DEFAULT_CATEGORIES } from './formatters';

const STORAGE_KEYS = {
  TRANSACTIONS: 'spendwise_transactions',
  SUBSCRIPTIONS: 'spendwise_subscriptions',
  BUDGETS: 'spendwise_budgets',
  SAVINGS_GOALS: 'spendwise_savings_goals',
  CATEGORIES: 'spendwise_categories',
  ACCOUNTS: 'spendwise_accounts',
  SPLITS: 'spendwise_splits',
  CURRENCY: 'spendwise_currency',
  THEME: 'spendwise_theme',
  HAS_INITIALIZED: 'spendwise_initialized',
};

export interface AppStateData {
  transactions: Transaction[];
  subscriptions: Subscription[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  categories: Category[];
  accounts: Account[];
  splits: BillSplit[];
  currency: CurrencyConfig;
}

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc_salary',
    name: 'HDFC Salary Account',
    type: 'checking',
    balance: 54500,
    institution: 'HDFC Bank',
    color: '#1e3a8a',
    icon: 'Landmark',
    isLiability: false,
    upiId: 'bhupesh@okhdfcbank'
  },
  {
    id: 'acc_savings',
    name: 'SBI Savings & Emergency FD',
    type: 'savings',
    balance: 140000,
    institution: 'State Bank of India',
    color: '#0284c7',
    icon: 'PiggyBank',
    isLiability: false,
    upiId: 'bhupesh@oksbi'
  },
  {
    id: 'acc_credit',
    name: 'Amazon Pay ICICI Credit Card',
    type: 'credit_card',
    balance: 8450,
    institution: 'ICICI Bank',
    color: '#ea580c',
    icon: 'CreditCard',
    isLiability: true
  },
  {
    id: 'acc_upi',
    name: 'GPay / PhonePe UPI Wallet',
    type: 'checking',
    balance: 3200,
    institution: 'UPI Wallets',
    color: '#6366f1',
    icon: 'Wallet',
    isLiability: false,
    upiId: 'bhupesh@ybl'
  },
  {
    id: 'acc_cash',
    name: 'Cash in Hand / Pocket',
    type: 'cash',
    balance: 2400,
    color: '#10b981',
    icon: 'Wallet',
    isLiability: false
  }
];

export function loadInitialData(): AppStateData {
  try {
    const hasInit = localStorage.getItem(STORAGE_KEYS.HAS_INITIALIZED);
    const cleanSlateDone = localStorage.getItem('spendwise_clean_slate_v2');

    if (!hasInit || !cleanSlateDone) {
      // Initialize with completely clean, blank user data
      saveData(
        [],
        [],
        [],
        [],
        DEFAULT_CATEGORIES,
        DEFAULT_ACCOUNTS,
        [],
        CURRENCIES[0]
      );
      localStorage.setItem(STORAGE_KEYS.HAS_INITIALIZED, 'true');
      localStorage.setItem('spendwise_clean_slate_v2', 'true');
      return {
        transactions: [],
        subscriptions: [],
        budgets: [],
        savingsGoals: [],
        categories: DEFAULT_CATEGORIES,
        accounts: DEFAULT_ACCOUNTS,
        splits: [],
        currency: CURRENCIES[0]
      };
    }

    let transactions: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    let subscriptions: Subscription[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS) || '[]');
    let budgets: Budget[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS) || '[]');
    let savingsGoals: SavingsGoal[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS) || '[]');
    let categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || JSON.stringify(DEFAULT_CATEGORIES));
    let accounts: Account[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || JSON.stringify(DEFAULT_ACCOUNTS));
    const splits: BillSplit[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SPLITS) || '[]');

    // Ensure all preloaded demo transactions are cleaned out
    transactions = transactions.filter(t => !t.id.startsWith('tx_salary_') && !t.id.startsWith('tx_sample_'));
    subscriptions = subscriptions.filter(s => !s.id.startsWith('sub_sample_'));

    // Seamlessly ensure Indian categories and accounts are preserved
    if (!categories.some(c => c.id === 'cat_maid')) {
      categories = DEFAULT_CATEGORIES;
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }

    if (!accounts.some(a => a.id === 'acc_salary')) {
      accounts = DEFAULT_ACCOUNTS;
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
    }

    const storedCur = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    let currency: CurrencyConfig = CURRENCIES[0];
    if (storedCur) {
      try {
        const parsed = JSON.parse(storedCur);
        if (parsed.code === 'USD' && parsed.rate === 1) {
          currency = CURRENCIES[0];
          localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(CURRENCIES[0]));
        } else {
          currency = parsed;
        }
      } catch {
        currency = CURRENCIES[0];
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(CURRENCIES[0]));
    }

    return {
      transactions,
      subscriptions,
      budgets,
      savingsGoals,
      categories,
      accounts,
      splits,
      currency
    };
  } catch (err) {
    console.error('Failed to load data from localStorage', err);
    return {
      transactions: [],
      subscriptions: [],
      budgets: [],
      savingsGoals: [],
      categories: DEFAULT_CATEGORIES,
      accounts: DEFAULT_ACCOUNTS,
      splits: [],
      currency: CURRENCIES[0]
    };
  }
}

export function saveData(
  transactions: Transaction[],
  subscriptions: Subscription[],
  budgets: Budget[],
  savingsGoals: SavingsGoal[],
  categories: Category[],
  accounts: Account[],
  splits: BillSplit[],
  currency: CurrencyConfig
) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(savingsGoals));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    localStorage.setItem(STORAGE_KEYS.SPLITS, JSON.stringify(splits));
    localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
  } catch (err) {
    console.error('Failed to save data to localStorage', err);
  }
}

export function exportToJSON(data: AppStateData) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const nowStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `SpendZen_Backup_${nowStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportTransactionsToCSV(transactions: Transaction[], categories: Category[], _currencySymbol?: string) {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  
  const headers = ['ID', 'Date', 'Type', 'Title', 'Category', 'Amount', 'Payment Method', 'Is Recurring', 'Frequency', 'Notes', 'Tags'];
  
  const rows = transactions.map(t => {
    const categoryName = categoryMap.get(t.categoryId) || 'Uncategorized';
    const tags = t.tags ? t.tags.join(';') : '';
    const cleanNotes = (t.notes || '').replace(/"/g, '""');
    const cleanTitle = t.title.replace(/"/g, '""');

    return [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type}"`,
      `"${cleanTitle}"`,
      `"${categoryName}"`,
      t.amount,
      `"${t.paymentMethod}"`,
      t.isRecurring ? 'Yes' : 'No',
      `"${t.recurringFrequency || ''}"`,
      `"${cleanNotes}"`,
      `"${tags}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', csvContent);
  const nowStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `SpendZen_Transactions_${nowStr}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Generate an iCalendar (.ics) file for subscription renewals
export function exportSubscriptionsToICalendar(subscriptions: Subscription[], currencySymbol: string) {
  const activeSubs = subscriptions.filter(s => s.active);
  if (activeSubs.length === 0) return;

  const now = new Date();
  const formatICalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const events = activeSubs.map(sub => {
    const dt = new Date(sub.nextBillingDate + 'T09:00:00');
    const endDt = new Date(dt.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    // Convert frequency to RRULE
    let rrule = 'FREQ=MONTHLY';
    if (sub.billingCycle === 'yearly') rrule = 'FREQ=YEARLY';
    else if (sub.billingCycle === 'weekly') rrule = 'FREQ=WEEKLY';
    else if (sub.billingCycle === 'quarterly') rrule = 'FREQ=MONTHLY;INTERVAL=3';

    return [
      'BEGIN:VEVENT',
      `UID:${sub.id}@spendzen.local`,
      `DTSTAMP:${formatICalDate(now)}`,
      `DTSTART:${formatICalDate(dt)}`,
      `DTEND:${formatICalDate(endDt)}`,
      `SUMMARY:${sub.name} Renewal (${currencySymbol}${sub.amount})`,
      `DESCRIPTION:Recurring subscription payment for ${sub.name}. Billing cycle: ${sub.billingCycle}.`,
      `RRULE:${rrule}`,
      'END:VEVENT'
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SpendZen//Subscription Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events.join('\r\n'),
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `SpendZen_Subscriptions_Renewals.ics`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}

export function parseCSV(csvText: string, categories: Category[]): Partial<Transaction>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const categoryByName = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
  const results: Partial<Transaction>[] = [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let insideQuote = false;
    let currentVal = '';

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim().replace(/^["']|["']$/g, ''));

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });

    const title = row['title'] || row['description'] || row['narration'] || row['memo'] || row['name'] || 'Imported Transaction';
    
    // Look for amount or debit/credit
    let rawAmount = 0;
    let type: 'expense' | 'income' = 'expense';

    if (row['amount']) {
      rawAmount = parseFloat(row['amount'].replace(/[^0-9.-]+/g, '')) || 0;
      if (row['type']?.toLowerCase() === 'income' || rawAmount > 0 && row['type'] === 'income') {
        type = 'income';
      }
    } else if (row['debit'] && parseFloat(row['debit']) > 0) {
      rawAmount = parseFloat(row['debit'].replace(/[^0-9.-]+/g, '')) || 0;
      type = 'expense';
    } else if (row['credit'] && parseFloat(row['credit']) > 0) {
      rawAmount = parseFloat(row['credit'].replace(/[^0-9.-]+/g, '')) || 0;
      type = 'income';
    }

    const amount = Math.abs(rawAmount);
    const rawCategory = (row['category'] || '').toLowerCase();
    const categoryId = categoryByName.get(rawCategory) || 'cat_misc';
    const date = row['date'] || new Date().toISOString().split('T')[0];

    results.push({
      id: `tx_imported_${Date.now()}_${i}`,
      title,
      amount,
      type,
      categoryId,
      date,
      paymentMethod: (row['payment method'] as any) || 'credit_card',
      notes: row['notes'] || '',
      createdAt: new Date().toISOString()
    });
  }

  return results;
}
