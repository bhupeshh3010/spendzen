import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  AppStateData,
  loadInitialData,
  saveData,
  DEFAULT_ACCOUNTS
} from '../utils/storage';
import {
  Account,
  BillSplit,
  Budget,
  Category,
  CurrencyConfig,
  DateFilter,
  ForecastSummary,
  SavingsGoal,
  Subscription,
  ToastMessage,
  Transaction
} from '../types';
import {
  calculateAnnualCost,
  calculateMonthlyCost,
  CURRENCIES,
  DEFAULT_CATEGORIES,
  filterTransactionsByDate
} from '../utils/formatters';
import { generateSampleData } from '../utils/sampleData';

interface ExpenseContextType {
  transactions: Transaction[];
  subscriptions: Subscription[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  categories: Category[];
  accounts: Account[];
  splits: BillSplit[];
  currency: CurrencyConfig;
  dateFilter: DateFilter;
  theme: 'light' | 'dark';
  toasts: ToastMessage[];

  // Filtered & Computed Analytics
  filteredTransactions: Transaction[];
  filteredExpenses: Transaction[];
  filteredIncome: Transaction[];
  totalExpenses: number;
  totalIncome: number;
  netSavings: number;
  savingsRate: number;
  monthlySubscriptionCost: number;
  yearlySubscriptionCost: number;
  categorySpendingMap: Record<string, number>;

  // MoM & YoY Comparison
  prevPeriodExpenses: Transaction[];
  prevTotalExpenses: number;
  expenseDelta: number;
  expenseDeltaPercent: number;

  // Forecast & Financial Health
  forecast: ForecastSummary;
  totalNetWorth: number;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, sub: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  toggleSubscriptionActive: (id: string) => void;

  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addBillSplit: (split: Omit<BillSplit, 'id'>) => void;
  updateBillSplit: (id: string, split: Partial<BillSplit>) => void;
  deleteBillSplit: (id: string) => void;
  toggleParticipantPaid: (splitId: string, participantName: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  setCurrency: (curr: CurrencyConfig) => void;
  setDateFilter: (filter: DateFilter | ((prev: DateFilter) => DateFilter)) => void;
  toggleTheme: () => void;
  
  loadDemoData: () => void;
  resetAllData: () => void;
  importStateData: (data: Partial<AppStateData>) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppStateData>(() => loadInitialData());
  const [dateFilter, setDateFilter] = useState<DateFilter>(() => {
    const now = new Date();
    return {
      mode: 'monthly',
      year: now.getFullYear(),
      month: now.getMonth()
    };
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('spendwise_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply theme to DOM document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('spendwise_theme', theme);
  }, [theme]);

  // Persist data on change
  useEffect(() => {
    saveData(
      data.transactions,
      data.subscriptions,
      data.budgets,
      data.savingsGoals,
      data.categories,
      data.accounts || DEFAULT_ACCOUNTS,
      data.splits || [],
      data.currency
    );
  }, [data]);

  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Transaction CRUD
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString()
    };

    // If account was specified, adjust account balance
    let updatedAccounts = data.accounts;
    if (tx.accountId) {
      updatedAccounts = data.accounts.map(acc => {
        if (acc.id === tx.accountId) {
          const delta = tx.type === 'expense' ? -tx.amount : tx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      });
    }

    setData(prev => ({
      ...prev,
      accounts: updatedAccounts,
      transactions: [newTx, ...prev.transactions]
    }));
    showToast('Transaction Added', `Added "${newTx.title}" successfully`, 'success');
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => (t.id === id ? { ...t, ...updated } : t))
    }));
    showToast('Updated', 'Transaction updated', 'info');
  };

  const deleteTransaction = (id: string) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
    showToast('Deleted', 'Transaction removed', 'warning');
  };

  // Subscription CRUD
  const addSubscription = (sub: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...sub,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    };

    setData(prev => ({
      ...prev,
      subscriptions: [newSub, ...prev.subscriptions]
    }));
    showToast('Subscription Added', `Added ${newSub.name}`, 'success');
  };

  const updateSubscription = (id: string, updated: Partial<Subscription>) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => (s.id === id ? { ...s, ...updated } : s))
    }));
    showToast('Updated', 'Subscription updated', 'info');
  };

  const deleteSubscription = (id: string) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(s => s.id !== id)
    }));
    showToast('Deleted', 'Subscription deleted', 'warning');
  };

  const toggleSubscriptionActive = (id: string) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => {
        if (s.id === id) {
          const nextActive = !s.active;
          showToast(
            nextActive ? 'Subscription Resumed' : 'Subscription Paused',
            `${s.name} is now ${nextActive ? 'active' : 'paused'}`,
            'info'
          );
          return { ...s, active: nextActive };
        }
        return s;
      })
    }));
  };

  // Budget CRUD
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: `b_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    };
    setData(prev => ({
      ...prev,
      budgets: [...prev.budgets, newBudget]
    }));
    showToast('Budget Created', 'Budget limit set successfully', 'success');
  };

  const updateBudget = (id: string, updated: Partial<Budget>) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.map(b => (b.id === id ? { ...b, ...updated } : b))
    }));
    showToast('Budget Updated', 'Budget saved', 'info');
  };

  const deleteBudget = (id: string) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.filter(b => b.id !== id)
    }));
    showToast('Budget Removed', 'Budget deleted', 'warning');
  };

  // Savings Goals CRUD
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `sg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    };
    setData(prev => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, newGoal]
    }));
    showToast('Goal Created', `Goal "${newGoal.name}" started`, 'success');
  };

  const updateSavingsGoal = (id: string, updated: Partial<SavingsGoal>) => {
    setData(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(g => (g.id === id ? { ...g, ...updated } : g))
    }));
    showToast('Goal Updated', 'Savings goal updated', 'info');
  };

  const deleteSavingsGoal = (id: string) => {
    setData(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter(g => g.id !== id)
    }));
    showToast('Goal Removed', 'Savings goal deleted', 'warning');
  };

  const contributeToGoal = (id: string, amount: number) => {
    setData(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(g => {
        if (g.id === id) {
          const nextAmount = Math.max(0, g.currentAmount + amount);
          return { ...g, currentAmount: nextAmount };
        }
        return g;
      })
    }));
    showToast('Deposit Logged', `Deposited funds to savings goal`, 'success');
  };

  // Accounts CRUD
  const addAccount = (acc: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...acc,
      id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    };
    setData(prev => ({
      ...prev,
      accounts: [...(prev.accounts || []), newAcc]
    }));
    showToast('Account Added', `Added ${newAcc.name}`, 'success');
  };

  const updateAccount = (id: string, updated: Partial<Account>) => {
    setData(prev => ({
      ...prev,
      accounts: (prev.accounts || []).map(a => (a.id === id ? { ...a, ...updated } : a))
    }));
    showToast('Account Updated', 'Wallet saved', 'info');
  };

  const deleteAccount = (id: string) => {
    setData(prev => ({
      ...prev,
      accounts: (prev.accounts || []).filter(a => a.id !== id)
    }));
    showToast('Account Removed', 'Wallet removed', 'warning');
  };

  // Bill Split CRUD
  const addBillSplit = (split: Omit<BillSplit, 'id'>) => {
    const newSplit: BillSplit = {
      ...split,
      id: `split_${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      splits: [newSplit, ...(prev.splits || [])]
    }));
    showToast('Bill Split Created', `Split "${newSplit.title}" logged`, 'success');
  };

  const updateBillSplit = (id: string, updated: Partial<BillSplit>) => {
    setData(prev => ({
      ...prev,
      splits: (prev.splits || []).map(s => (s.id === id ? { ...s, ...updated } : s))
    }));
  };

  const deleteBillSplit = (id: string) => {
    setData(prev => ({
      ...prev,
      splits: (prev.splits || []).filter(s => s.id !== id)
    }));
    showToast('Bill Removed', 'Split removed', 'info');
  };

  const toggleParticipantPaid = (splitId: string, participantName: string) => {
    setData(prev => ({
      ...prev,
      splits: (prev.splits || []).map(s => {
        if (s.id === splitId) {
          const updatedParts = s.participants.map(p =>
            p.name === participantName ? { ...p, hasPaid: !p.hasPaid } : p
          );
          return { ...s, participants: updatedParts };
        }
        return s;
      })
    }));
  };

  // Category CRUD
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...category,
      id: `cat_custom_${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      categories: [...prev.categories, newCat]
    }));
    showToast('Category Added', `Category "${newCat.name}" added`, 'success');
  };

  const setCurrency = (currency: CurrencyConfig) => {
    setData(prev => ({ ...prev, currency }));
    showToast('Currency Changed', `Display currency set to ${currency.code} (${currency.symbol})`, 'info');
  };

  const loadDemoData = () => {
    const sample = generateSampleData();
    setData(prev => ({
      ...prev,
      ...sample,
      accounts: DEFAULT_ACCOUNTS
    }));
    showToast('Demo Data Loaded', 'Sample transactions and subscriptions have been loaded', 'success');
  };

  const resetAllData = () => {
    setData({
      transactions: [],
      subscriptions: [],
      budgets: [],
      savingsGoals: [],
      categories: DEFAULT_CATEGORIES,
      accounts: DEFAULT_ACCOUNTS,
      splits: [],
      currency: CURRENCIES[0]
    });
    showToast('Data Cleared', 'All records have been reset', 'warning');
  };

  const importStateData = (imported: Partial<AppStateData>) => {
    setData(prev => ({
      transactions: imported.transactions || prev.transactions,
      subscriptions: imported.subscriptions || prev.subscriptions,
      budgets: imported.budgets || prev.budgets,
      savingsGoals: imported.savingsGoals || prev.savingsGoals,
      categories: imported.categories || prev.categories,
      accounts: imported.accounts || prev.accounts || DEFAULT_ACCOUNTS,
      splits: imported.splits || prev.splits || [],
      currency: imported.currency || prev.currency
    }));
    showToast('Import Successful', 'Data imported and merged successfully', 'success');
  };

  // Analytics Computation
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByDate(data.transactions, dateFilter);
  }, [data.transactions, dateFilter]);

  const filteredExpenses = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'expense');
  }, [filteredTransactions]);

  const filteredIncome = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'income');
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, t) => acc + t.amount, 0);
  }, [filteredExpenses]);

  const totalIncome = useMemo(() => {
    return filteredIncome.reduce((acc, t) => acc + t.amount, 0);
  }, [filteredIncome]);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.min(100, (netSavings / totalIncome) * 100)) : 0;

  // Previous Period Comparison (MoM or YoY)
  const prevPeriodFilter: DateFilter = useMemo(() => {
    if (dateFilter.mode === 'monthly') {
      if (dateFilter.month === 0) {
        return { mode: 'monthly', year: dateFilter.year - 1, month: 11 };
      }
      return { mode: 'monthly', year: dateFilter.year, month: dateFilter.month - 1 };
    }
    return { mode: 'yearly', year: dateFilter.year - 1, month: dateFilter.month };
  }, [dateFilter]);

  const prevPeriodTransactions = useMemo(() => {
    return filterTransactionsByDate(data.transactions, prevPeriodFilter);
  }, [data.transactions, prevPeriodFilter]);

  const prevPeriodExpenses = useMemo(() => {
    return prevPeriodTransactions.filter(t => t.type === 'expense');
  }, [prevPeriodTransactions]);

  const prevTotalExpenses = useMemo(() => {
    return prevPeriodExpenses.reduce((acc, t) => acc + t.amount, 0);
  }, [prevPeriodExpenses]);

  const expenseDelta = totalExpenses - prevTotalExpenses;
  const expenseDeltaPercent = prevTotalExpenses > 0 ? (expenseDelta / prevTotalExpenses) * 100 : 0;

  // Active Subscriptions Totals
  const monthlySubscriptionCost = useMemo(() => {
    return data.subscriptions
      .filter(s => s.active)
      .reduce((acc, s) => acc + calculateMonthlyCost(s.amount, s.billingCycle), 0);
  }, [data.subscriptions]);

  const yearlySubscriptionCost = useMemo(() => {
    return data.subscriptions
      .filter(s => s.active)
      .reduce((acc, s) => acc + calculateAnnualCost(s.amount, s.billingCycle), 0);
  }, [data.subscriptions]);

  // Category breakdown for current period
  const categorySpendingMap = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(t => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });
    return map;
  }, [filteredExpenses]);

  // Net Worth computation across accounts
  const totalNetWorth = useMemo(() => {
    return (data.accounts || []).reduce((acc, a) => {
      return a.isLiability ? acc - a.balance : acc + a.balance;
    }, 0);
  }, [data.accounts]);

  // Forecast computation
  const forecast: ForecastSummary = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(dateFilter.year, dateFilter.month + 1, 0).getDate();
    const currentDay = Math.min(daysInMonth, now.getDate());
    const daysRemaining = Math.max(0, daysInMonth - currentDay);

    // Discretionary spend so far (excluding fixed bills like Rent, Subscriptions, Utilities)
    const fixedCatIds = new Set(['cat_rent', 'cat_subscriptions', 'cat_utilities']);
    let discretionarySoFar = 0;
    filteredExpenses.forEach(tx => {
      if (!fixedCatIds.has(tx.categoryId)) {
        discretionarySoFar += tx.amount;
      }
    });

    const dailyBurnRate = currentDay > 0 ? discretionarySoFar / currentDay : 0;
    const projectedDiscretionary = dailyBurnRate * daysRemaining;

    // Upcoming scheduled subscriptions in the rest of this month
    let upcomingScheduledBills = 0;
    data.subscriptions.filter(s => s.active).forEach(sub => {
      const nextDate = new Date(sub.nextBillingDate + 'T00:00:00');
      if (
        nextDate.getFullYear() === dateFilter.year &&
        nextDate.getMonth() === dateFilter.month &&
        nextDate.getDate() > currentDay
      ) {
        upcomingScheduledBills += sub.amount;
      }
    });

    const estimatedMonthEndSpend = totalExpenses + projectedDiscretionary + upcomingScheduledBills;
    const projectedNetSavings = totalIncome - estimatedMonthEndSpend;

    return {
      currentSpent: totalExpenses,
      projectedDiscretionary,
      upcomingScheduledBills,
      estimatedMonthEndSpend,
      dailyBurnRate,
      daysRemaining,
      totalDays: daysInMonth,
      projectedNetSavings
    };
  }, [dateFilter, filteredExpenses, totalExpenses, totalIncome, data.subscriptions]);

  return (
    <ExpenseContext.Provider
      value={{
        transactions: data.transactions,
        subscriptions: data.subscriptions,
        budgets: data.budgets,
        savingsGoals: data.savingsGoals,
        categories: data.categories,
        accounts: data.accounts || DEFAULT_ACCOUNTS,
        splits: data.splits || [],
        currency: data.currency,
        dateFilter,
        theme,
        toasts,

        filteredTransactions,
        filteredExpenses,
        filteredIncome,
        totalExpenses,
        totalIncome,
        netSavings,
        savingsRate,
        monthlySubscriptionCost,
        yearlySubscriptionCost,
        categorySpendingMap,

        prevPeriodExpenses,
        prevTotalExpenses,
        expenseDelta,
        expenseDeltaPercent,

        forecast,
        totalNetWorth,

        addTransaction,
        updateTransaction,
        deleteTransaction,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        toggleSubscriptionActive,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        addAccount,
        updateAccount,
        deleteAccount,
        addBillSplit,
        updateBillSplit,
        deleteBillSplit,
        toggleParticipantPaid,
        addCategory,
        setCurrency,
        setDateFilter,
        toggleTheme,
        loadDemoData,
        resetAllData,
        importStateData,
        showToast,
        removeToast
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
