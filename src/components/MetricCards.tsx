import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatMonthYear } from '../utils/formatters';
import {
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Repeat,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const MetricCards: React.FC = () => {
  const {
    totalExpenses,
    totalIncome,
    netSavings,
    savingsRate,
    monthlySubscriptionCost,
    yearlySubscriptionCost,
    currency,
    budgets,
    dateFilter,
    subscriptions
  } = useExpense();

  // Find total budget if set
  const totalBudget = budgets.find(b => b.categoryId === 'total');
  const budgetLimit = totalBudget ? totalBudget.monthlyLimit : 0;
  const isOverBudget = budgetLimit > 0 && totalExpenses > budgetLimit;

  // Active subscriptions count
  const activeSubsCount = subscriptions.filter(s => s.active).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Expenses Card */}
      <div className="glass-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-rose-500/20 transition-colors"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {dateFilter.mode === 'yearly' ? 'Annual Expenses' : 'Total Expenses'}
          </span>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalExpenses, currency)}
          </h3>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            {budgetLimit > 0 ? (
              <span className={`font-medium flex items-center gap-1 ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {isOverBudget ? (
                  <>
                    <AlertCircle size={13} className="text-rose-500" />
                    Over by {formatCurrency(totalExpenses - budgetLimit, currency)}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    {formatCurrency(budgetLimit - totalExpenses, currency)} remaining
                  </>
                )}
              </span>
            ) : (
              <span>Spending in this period</span>
            )}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {dateFilter.mode === 'monthly' ? formatMonthYear(dateFilter.year, dateFilter.month) : dateFilter.mode === 'yearly' ? `Year ${dateFilter.year}` : 'Filtered'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Total Income Card */}
      <div className="glass-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/20 transition-colors"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {dateFilter.mode === 'yearly' ? 'Annual Income' : 'Total Income'}
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalIncome, currency)}
          </h3>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(totalIncome, currency)} earned
            </span>
            <span className="font-medium text-slate-500">Inflow</span>
          </div>
        </div>
      </div>

      {/* 3. Net Savings / Cash Flow Card */}
      <div className="glass-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 ${netSavings >= 0 ? 'bg-indigo-500/10 group-hover:bg-indigo-500/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'} rounded-full blur-2xl -mr-6 -mt-6 transition-colors`}></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Net Cash Flow
          </span>
          <div className={`p-2.5 rounded-xl ${netSavings >= 0 ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50'} border`}>
            <PiggyBank size={20} />
          </div>
        </div>

        <div className="mt-3">
          <h3 className={`text-2xl font-extrabold tracking-tight ${netSavings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(netSavings, currency)}
          </h3>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Savings Rate: <strong className="text-slate-800 dark:text-slate-200">{savingsRate.toFixed(1)}%</strong>
            </span>
            <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${netSavings >= 0 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}`}>
              {netSavings >= 0 ? 'Positive Surplus' : 'Deficit'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Subscriptions & Fixed Commitments */}
      <div className="glass-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-violet-500/20 transition-colors"></div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Subscriptions & Recurring
          </span>
          <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/50">
            <Repeat size={20} />
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(monthlySubscriptionCost, currency)}
            <span className="text-xs font-semibold text-slate-400 ml-1">/mo</span>
          </h3>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-violet-600 dark:text-violet-400">
              {formatCurrency(yearlySubscriptionCost, currency)}/yr
            </span>
            <span className="font-medium bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-md text-[11px]">
              {activeSubsCount} active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
