import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { MetricCards } from './MetricCards';
import { PeriodSelector } from './PeriodSelector';
import { QuickAddBar } from './QuickAddBar';
import { FinancialHealthCard } from './FinancialHealthCard';
import { ForecastCard } from './ForecastCard';
import { MoMComparisonCard } from './MoMComparisonCard';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDate, getDaysUntil, formatMonthYear } from '../utils/formatters';
import { ActiveTab } from './Navbar';
import {
  ArrowRight,
  Receipt,
  Tv,
  Plus,
  Wand2,
  Users,
  QrCode,
  TrendingUp,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  PieChart,
  Trash2,
  Clock,
  Camera
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: any) => void;
  onOpenMagicModal?: () => void;
  onOpenSplitModal?: () => void;
  onOpenQrModal?: () => void;
  onOpenReceiptScanner?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenAddModal,
  onEditTransaction,
  onOpenMagicModal,
  onOpenSplitModal,
  onOpenQrModal,
  onOpenReceiptScanner
}) => {
  const {
    filteredTransactions,
    totalExpenses,
    totalIncome,
    netSavings,
    budgets,
    categorySpendingMap,
    categories,
    currency,
    subscriptions,
    monthlySubscriptionCost,
    dateFilter,
    theme,
    deleteTransaction
  } = useExpense();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const isDark = theme === 'dark';
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Recent 5 transactions
  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Active subscriptions sorted by renewal
  const activeSubs = subscriptions
    .filter(s => s.active)
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
    .slice(0, 4);

  // Budget calculations
  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const budgetSpentPercent = totalBudgetLimit > 0
    ? Math.round((totalExpenses / totalBudgetLimit) * 100)
    : 0;
  const budgetRemaining = Math.max(0, totalBudgetLimit - totalExpenses);

  // Category breakdown entries
  const entries = Object.entries(categorySpendingMap).filter(([_, amount]) => amount > 0);
  entries.sort((a, b) => b[1] - a[1]);
  const topCategories = entries.slice(0, 5);

  // Chart data for advanced drawer
  const doughnutData = {
    labels: topCategories.map(([id]) => categoryMap.get(id)?.name || 'Other'),
    datasets: [
      {
        data: topCategories.map(([_, amount]) => amount),
        backgroundColor: topCategories.map(
          ([id]) => categoryMap.get(id)?.color || '#64748b'
        ),
        borderColor: isDark ? '#0f172a' : '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
          boxWidth: 8,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            return ` ${context.label}: ${formatCurrency(val, currency)}`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Clean Period Navigator */}
      <PeriodSelector />

      {/* 2. Hero Balance & Budget Status Card (Clear, simple, essential) */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900/80 dark:to-indigo-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          {/* Main Expense Highlight */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {dateFilter.mode === 'monthly'
                  ? `Spent in ${formatMonthYear(dateFilter.year, dateFilter.month)}`
                  : dateFilter.mode === 'yearly'
                  ? `Spent in ${dateFilter.year}`
                  : 'Total Spent (Selected Range)'}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50">
                Expenses
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(totalExpenses, currency)}
              </h1>
            </div>

            {/* Income & Savings Micro Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/50 dark:border-emerald-800/40">
                <TrendingUp size={13} />
                <span>Income: {formatCurrency(totalIncome, currency)}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200/50 dark:border-indigo-800/40">
                <PiggyBank size={13} />
                <span>
                  Savings: {formatCurrency(Math.max(0, netSavings), currency)}
                </span>
              </div>

              {monthlySubscriptionCost > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200/50 dark:border-purple-800/40">
                  <Tv size={13} />
                  <span>Bills: {formatCurrency(monthlySubscriptionCost, currency)}/mo</span>
                </div>
              )}
            </div>
          </div>

          {/* Budget Overview Progress Pill */}
          <div className="w-full md:w-80 p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                {budgetSpentPercent > 95 ? (
                  <AlertTriangle size={14} className="text-rose-500" />
                ) : (
                  <CheckCircle2 size={14} className="text-emerald-500" />
                )}
                Monthly Budget
              </span>
              <span
                className={
                  budgetSpentPercent > 95
                    ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                    : 'text-indigo-600 dark:text-indigo-400'
                }
              >
                {totalBudgetLimit > 0 ? `${budgetSpentPercent}% used` : 'No Limit Set'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetSpentPercent > 95
                    ? 'bg-rose-500'
                    : budgetSpentPercent > 75
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetSpentPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              {totalBudgetLimit > 0 ? (
                <>
                  <span>Left: {formatCurrency(budgetRemaining, currency)}</span>
                  <span>Limit: {formatCurrency(totalBudgetLimit, currency)}</span>
                </>
              ) : (
                <button
                  onClick={() => setActiveTab('budgets')}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Set budget limits in Budgets tab ➔
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. High-Visibility 1-Tap Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all group"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Plus size={15} className="group-hover:rotate-90 transition-transform duration-200" />
          </div>
          <span>Add Expense</span>
        </button>

        <button
          onClick={onOpenReceiptScanner}
          className="flex items-center justify-center gap-2 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-98 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm shadow-xs transition-all"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Camera size={15} />
          </div>
          <span>Scan Bill</span>
        </button>

        <button
          onClick={onOpenMagicModal}
          className="flex items-center justify-center gap-2 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-98 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm shadow-xs transition-all"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Wand2 size={15} />
          </div>
          <span>Fast Text (M)</span>
        </button>

        <button
          onClick={onOpenSplitModal}
          className="flex items-center justify-center gap-2 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-98 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm shadow-xs transition-all"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users size={15} />
          </div>
          <span>Split Bill (S)</span>
        </button>

        <button
          onClick={onOpenQrModal}
          className="flex items-center justify-center gap-2 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-98 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm shadow-xs transition-all col-span-2 sm:col-span-1"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <QrCode size={15} />
          </div>
          <span>Phone App</span>
        </button>
      </div>

      {/* 4. Streamlined 1-Tap Fast Logger Bar */}
      <QuickAddBar />

      {/* 5. Clean Essentials Grid: Top Spending Categories + Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Spending Categories (Clear horizontal bars, simple to read) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChart size={16} className="text-indigo-600 dark:text-indigo-400" />
                  Top Spending Categories
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Where your money went in this period
                </p>
              </div>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Category Limits <ArrowRight size={13} />
              </button>
            </div>

            {topCategories.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No expense entries logged for this period yet.
              </div>
            ) : (
              <div className="space-y-3.5 my-2">
                {topCategories.map(([id, amount]) => {
                  const cat = categoryMap.get(id) || {
                    name: 'Other',
                    icon: 'Tag',
                    color: '#6366f1'
                  };
                  const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;

                  return (
                    <div key={id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          >
                            <CategoryIcon name={cat.icon} size={13} />
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-400">{pct}%</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(amount, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Horizontal progress bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Showing top {topCategories.length} categories</span>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Full Analytics Report ➔
            </button>
          </div>
        </div>

        {/* Upcoming Renewals & Bills */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tv size={16} className="text-violet-600 dark:text-violet-400" />
                  Upcoming Bills
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Subscriptions & recurring payments
                </p>
              </div>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                All Bills <ArrowRight size={13} />
              </button>
            </div>

            <div className="space-y-2.5 my-2">
              {activeSubs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No active subscriptions or bills
                </div>
              ) : (
                activeSubs.map(sub => {
                  const daysLeft = getDaysUntil(sub.nextBillingDate);
                  const cat = categoryMap.get(sub.categoryId) || {
                    name: 'Subscription',
                    icon: 'Tv',
                    color: '#8b5cf6'
                  };

                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} size={15} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {sub.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(sub.nextBillingDate)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(sub.amount, currency)}
                        </span>
                        <span
                          className={`block text-[10px] font-bold ${
                            daysLeft <= 3
                              ? 'text-rose-500 font-extrabold'
                              : daysLeft <= 7
                              ? 'text-amber-500'
                              : 'text-slate-400'
                          }`}
                        >
                          {daysLeft <= 0
                            ? 'Due today'
                            : daysLeft === 1
                            ? 'Tomorrow'
                            : `in ${daysLeft} days`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className="w-full mt-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 text-violet-700 dark:text-violet-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Clock size={14} />
            Manage Bills & Renewals
          </button>
        </div>
      </div>

      {/* 6. Recent Activity List */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt size={16} className="text-indigo-600 dark:text-indigo-400" />
              Recent Expenses & Incomes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quick summary of your latest transactions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              All Transactions ({filteredTransactions.length}) <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No transactions found for this period. Click "Add Expense" above to get started.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentTransactions.map(tx => {
              const cat = categoryMap.get(tx.categoryId) || {
                name: 'Other',
                icon: 'Tag',
                color: '#64748b'
              };
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between py-3 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div
                    onClick={() => onEditTransaction(tx)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {tx.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{cat.name}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                        {tx.paymentMethod && (
                          <>
                            <span>•</span>
                            <span className="uppercase text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono">
                              {tx.paymentMethod}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-black tracking-tight ${
                        isExpense
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                    </span>

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Transaction"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Collapsible Deep Analytics & Forecasts (Keeps default UI clean while preserving all advanced features) */}
      <div className="border border-slate-200/70 dark:border-slate-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-4 bg-slate-100/60 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Advanced Financial Intelligence & Predictive Forecasts
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <span>{showAdvanced ? 'Hide Intelligence' : 'Show Intelligence'}</span>
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {showAdvanced && (
          <div className="p-5 sm:p-6 space-y-6 bg-white dark:bg-slate-900 border-t border-slate-200/70 dark:border-slate-800 animate-fade-in">
            {/* Health card */}
            <FinancialHealthCard />

            {/* KPI metric cards */}
            <MetricCards />

            {/* Predictive forecast and comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ForecastCard />
              <MoMComparisonCard />
            </div>

            {/* Doughnut distribution */}
            <div className="glass-card rounded-2xl p-5">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <PieChart size={14} className="text-indigo-500" />
                Category Share Doughnut
              </h4>
              <div className="h-56 relative flex items-center justify-center">
                <Doughnut data={doughnutData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
