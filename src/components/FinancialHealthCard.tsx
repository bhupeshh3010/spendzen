import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatMonthYear } from '../utils/formatters';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

export const FinancialHealthCard: React.FC = () => {
  const {
    totalExpenses,
    netSavings,
    savingsRate,
    monthlySubscriptionCost,
    budgets,
    dateFilter,
    currency,
    categorySpendingMap,
    categories
  } = useExpense();

  const totalBudget = budgets.find(b => b.categoryId === 'total');
  const budgetLimit = totalBudget ? totalBudget.monthlyLimit : 0;
  const isOverBudget = budgetLimit > 0 && totalExpenses > budgetLimit;

  // Find top spending category
  const topCatEntry = Object.entries(categorySpendingMap).sort((a, b) => b[1] - a[1])[0];
  const topCat = topCatEntry ? categories.find(c => c.id === topCatEntry[0]) : null;

  // Calculate days in current month or elapsed days
  const now = new Date();
  const daysInMonth = new Date(dateFilter.year, dateFilter.month + 1, 0).getDate();
  const currentDay = Math.min(daysInMonth, now.getDate());
  const dailyAverage = currentDay > 0 ? totalExpenses / currentDay : 0;

  // Generate smart tip
  let tipText = "Keep logging daily expenses to maintain financial visibility!";
  let tipIcon = Lightbulb;
  let tipColor = "text-indigo-600 dark:text-indigo-400";

  if (isOverBudget) {
    tipText = `You have surpassed your ${formatCurrency(budgetLimit, currency)} monthly spending limit. Consider holding off on non-essential purchases for the rest of the month.`;
    tipIcon = AlertTriangle;
    tipColor = "text-rose-500";
  } else if (savingsRate >= 20) {
    tipText = `Great job! You are saving ${savingsRate.toFixed(0)}% of your income this month. Allocate some of this surplus into your savings goals!`;
    tipIcon = CheckCircle2;
    tipColor = "text-emerald-500";
  } else if (topCat) {
    tipText = `${topCat.name} is your biggest expenditure at ${formatCurrency(topCatEntry[1], currency)} (${((topCatEntry[1] / Math.max(1, totalExpenses)) * 100).toFixed(0)}% of expenses). Check for potential cost savings here.`;
    tipIcon = Lightbulb;
    tipColor = "text-amber-500";
  }

  return (
    <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Friendly greeting & summary */}
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Sparkles size={15} />
            <span>Monthly Spending Intelligence</span>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            {dateFilter.mode === 'monthly'
              ? `${formatMonthYear(dateFilter.year, dateFilter.month)} Summary`
              : dateFilter.mode === 'yearly'
              ? `Year ${dateFilter.year} Financial Overview`
              : 'Financial Overview'}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {netSavings >= 0 ? (
              <>
                You're in a <strong className="text-emerald-600 dark:text-emerald-400">positive cash flow surplus</strong> of {formatCurrency(netSavings, currency)}.
              </>
            ) : (
              <>
                Your spending has exceeded your income by <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(Math.abs(netSavings), currency)}</strong>.
              </>
            )}
            {' '}Daily pace is approximately <strong>{formatCurrency(dailyAverage, currency)}/day</strong>.
          </p>

          {/* Smart Tip pill */}
          <div className="pt-2 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <span className={`${tipColor} mt-0.5 shrink-0`}>
              {React.createElement(tipIcon, { size: 16 })}
            </span>
            <span className="text-[11px] leading-normal">{tipText}</span>
          </div>
        </div>

        {/* Right: Quick highlight stats */}
        <div className="grid grid-cols-2 gap-3 shrink-0 sm:w-64">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Savings Rate
            </span>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {savingsRate.toFixed(1)}%
            </p>
            <span className="text-[10px] text-slate-500">of total earnings</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Subscriptions
            </span>
            <p className="text-lg font-extrabold text-violet-600 dark:text-violet-400 mt-0.5">
              {formatCurrency(monthlySubscriptionCost, currency)}
            </p>
            <span className="text-[10px] text-slate-500">monthly recurring</span>
          </div>
        </div>
      </div>
    </div>
  );
};
