import React, { useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatMonthYear, SHORT_MONTH_NAMES } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Calendar,
  CreditCard,
  Sparkles
} from 'lucide-react';

// Register ChartJS modules
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
);

export const AnalyticsView: React.FC = () => {
  const {
    transactions,
    filteredExpenses,
    categorySpendingMap,
    categories,
    currency,
    dateFilter,
    theme
  } = useExpense();

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';

  const categoryMap = useMemo(() => {
    return new Map(categories.map(c => [c.id, c]));
  }, [categories]);

  // 1. Doughnut: Spending by Category
  const categoryChartData = useMemo(() => {
    const entries = Object.entries(categorySpendingMap).filter(([_, amount]) => amount > 0);
    entries.sort((a, b) => b[1] - a[1]);

    const labels = entries.map(([id]) => categoryMap.get(id)?.name || 'Other');
    const data = entries.map(([_, amount]) => amount);
    const backgroundColors = entries.map(
      ([id]) => categoryMap.get(id)?.color || '#64748b'
    );

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: isDark ? '#0f172a' : '#ffffff',
          borderWidth: 2,
          hoverOffset: 6
        }
      ]
    };
  }, [categorySpendingMap, categoryMap, isDark]);

  // 2. Bar Chart: 12-Month Inflow vs Outflow (Yearly breakdown)
  const annualTrendsData = useMemo(() => {
    const year = dateFilter.year;
    const monthlyExpenses = new Array(12).fill(0);
    const monthlyIncome = new Array(12).fill(0);

    transactions.forEach(tx => {
      const txDate = new Date(tx.date + 'T00:00:00');
      if (txDate.getFullYear() === year) {
        const month = txDate.getMonth();
        if (tx.type === 'expense') {
          monthlyExpenses[month] += tx.amount;
        } else {
          monthlyIncome[month] += tx.amount;
        }
      }
    });

    return {
      labels: SHORT_MONTH_NAMES,
      datasets: [
        {
          label: 'Income Inflow',
          data: monthlyIncome,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderRadius: 8
        },
        {
          label: 'Total Expenses',
          data: monthlyExpenses,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderRadius: 8
        }
      ]
    };
  }, [transactions, dateFilter.year]);

  // 3. Payment Method breakdown
  const paymentMethodData = useMemo(() => {
    const methodCounts: Record<string, number> = {
      credit_card: 0,
      debit_card: 0,
      bank_transfer: 0,
      upi: 0,
      cash: 0
    };

    filteredExpenses.forEach(tx => {
      const m = tx.paymentMethod || 'credit_card';
      methodCounts[m] = (methodCounts[m] || 0) + tx.amount;
    });

    const labels = ['Credit Card', 'Debit Card', 'Bank Transfer', 'UPI / App', 'Cash'];
    const data = [
      methodCounts.credit_card,
      methodCounts.debit_card,
      methodCounts.bank_transfer,
      methodCounts.upi,
      methodCounts.cash
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ['#6366f1', '#3b82f6', '#06b6d4', '#8b5cf6', '#10b981'],
          borderColor: isDark ? '#0f172a' : '#ffffff',
          borderWidth: 2
        }
      ]
    };
  }, [filteredExpenses, isDark]);

  // Top 5 Largest Transactions in this period
  const topTransactions = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [filteredExpenses]);

  // Fixed vs Discretionary spending
  const fixedCategories = new Set(['cat_rent', 'cat_subscriptions', 'cat_utilities', 'cat_health']);
  let fixedTotal = 0;
  let discretionaryTotal = 0;

  filteredExpenses.forEach(tx => {
    if (fixedCategories.has(tx.categoryId)) {
      fixedTotal += tx.amount;
    } else {
      discretionaryTotal += tx.amount;
    }
  });

  const totalPeriodSpend = fixedTotal + discretionaryTotal;
  const fixedPercent = totalPeriodSpend > 0 ? (fixedTotal / totalPeriodSpend) * 100 : 0;
  const discPercent = totalPeriodSpend > 0 ? (discretionaryTotal / totalPeriodSpend) * 100 : 0;

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
          padding: 14,
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            return ` ${context.label || context.dataset.label}: ${formatCurrency(val, currency)}`;
          }
        }
      }
    }
  };

  const barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            return ` ${context.dataset.label}: ${formatCurrency(val, currency)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          font: { family: 'Plus Jakarta Sans', size: 11 },
          callback: (value: any) => `${currency.symbol}${value}`
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Analytics Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Fixed vs Discretionary */}
        <div className="glass-card rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fixed vs Flexible Spending
            </span>
            <Sparkles size={16} className="text-indigo-500" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-indigo-600 dark:text-indigo-400">
                Fixed (Rent, Bills, Subs): {fixedPercent.toFixed(0)}%
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                Flexible: {discPercent.toFixed(0)}%
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${fixedPercent}%` }}
              />
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${discPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>{formatCurrency(fixedTotal, currency)} fixed</span>
              <span>{formatCurrency(discretionaryTotal, currency)} lifestyle</span>
            </div>
          </div>
        </div>

        {/* Highest Spending Category */}
        <div className="glass-card rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Top Spending Area
          </span>
          {categoryChartData.labels.length > 0 ? (
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                {categoryChartData.labels[0]}
              </h3>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {formatCurrency(categoryChartData.datasets[0].data[0] || 0, currency)}
              </p>
              <span className="text-xs text-slate-500">
                Takes up{' '}
                {(
                  ((categoryChartData.datasets[0].data[0] || 0) /
                    Math.max(1, totalPeriodSpend)) *
                  100
                ).toFixed(0)}
                % of all current expenses
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-2">No expenses logged in this period</p>
          )}
        </div>

        {/* Total Outflow Volume */}
        <div className="glass-card rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Period Total Spend
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalPeriodSpend, currency)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Across {filteredExpenses.length} expense transactions
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              <Calendar size={12} />
              {dateFilter.mode === 'yearly'
                ? `Year ${dateFilter.year}`
                : dateFilter.mode === 'monthly'
                ? formatMonthYear(dateFilter.year, dateFilter.month)
                : 'Selected timeframe'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Doughnut Chart */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart size={16} className="text-indigo-500" />
              Category Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-medium">By percentage</span>
          </div>

          <div className="h-64 relative flex items-center justify-center">
            {categoryChartData.labels.length > 0 ? (
              <Doughnut data={categoryChartData} options={chartOptions} />
            ) : (
              <div className="text-center text-xs text-slate-400">No expense data to display</div>
            )}
          </div>
        </div>

        {/* 12-Month Inflow vs Outflow Bar Chart */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-500" />
              {dateFilter.year} Monthly Inflow vs Expenses
            </h3>
            <span className="text-xs text-slate-400 font-medium">Full Year History</span>
          </div>

          <div className="h-64 relative">
            <Bar data={annualTrendsData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Second Row: Payment Methods & Top 5 Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Methods Chart */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard size={16} className="text-violet-500" />
              Spending by Payment Mode
            </h3>
            <span className="text-xs text-slate-400 font-medium">Card vs Transfer</span>
          </div>

          <div className="h-60 relative flex items-center justify-center">
            {filteredExpenses.length > 0 ? (
              <Doughnut data={paymentMethodData} options={chartOptions} />
            ) : (
              <div className="text-center text-xs text-slate-400">No transaction data</div>
            )}
          </div>
        </div>

        {/* Top 5 Largest Expenses */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-rose-500" />
              Top 5 Single Transactions
            </h3>
            <span className="text-xs text-slate-400 font-medium">Largest outflows</span>
          </div>

          {topTransactions.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">No transactions found</div>
          ) : (
            <div className="space-y-3">
              {topTransactions.map((tx, idx) => {
                const cat = categoryMap.get(tx.categoryId) || {
                  name: 'Category',
                  icon: 'Tag',
                  color: '#6366f1'
                };

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-extrabold text-slate-400 w-4">
                        #{idx + 1}
                      </span>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} size={15} />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {tx.title}
                        </h5>
                        <span className="text-[11px] text-slate-500">{tx.date}</span>
                      </div>
                    </div>

                    <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 shrink-0">
                      -{formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
