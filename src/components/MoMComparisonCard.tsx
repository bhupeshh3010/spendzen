import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  TrendingDown,
  TrendingUp,
  Scale,
  Minus
} from 'lucide-react';

export const MoMComparisonCard: React.FC = () => {
  const {
    prevTotalExpenses,
    expenseDelta,
    expenseDeltaPercent,
    categorySpendingMap,
    prevPeriodExpenses,
    categories,
    currency,
    dateFilter
  } = useExpense();

  // Category breakdown for previous period
  const prevCategoryMap: Record<string, number> = {};
  prevPeriodExpenses.forEach(tx => {
    prevCategoryMap[tx.categoryId] = (prevCategoryMap[tx.categoryId] || 0) + tx.amount;
  });

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Find top categories with notable shifts
  const allCategoryIds = Array.from(
    new Set([...Object.keys(categorySpendingMap), ...Object.keys(prevCategoryMap)])
  );

  const categoryShifts = allCategoryIds
    .map(id => {
      const current = categorySpendingMap[id] || 0;
      const prev = prevCategoryMap[id] || 0;
      const diff = current - prev;
      return {
        id,
        current,
        prev,
        diff,
        absDiff: Math.abs(diff)
      };
    })
    .sort((a, b) => b.absDiff - a.absDiff)
    .slice(0, 4);

  const isLowerSpend = expenseDelta < 0;
  const isZero = expenseDelta === 0;

  return (
    <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800/80 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Scale size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {dateFilter.mode === 'yearly' ? 'Year-over-Year (YoY) Variance' : 'Month-over-Month (MoM) Shift'}
            </h3>
            <p className="text-xs text-slate-500">
              Compared with previous period ({formatCurrency(prevTotalExpenses, currency)})
            </p>
          </div>
        </div>

        {/* Delta Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
            isZero
              ? 'bg-slate-100 text-slate-600'
              : isLowerSpend
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
          }`}
        >
          {isZero ? (
            <Minus size={14} />
          ) : isLowerSpend ? (
            <TrendingDown size={14} />
          ) : (
            <TrendingUp size={14} />
          )}
          <span>
            {isZero ? 'Same spend' : `${formatCurrency(Math.abs(expenseDelta), currency)} (${Math.abs(expenseDeltaPercent).toFixed(1)}%) ${isLowerSpend ? 'lower' : 'higher'}`}
          </span>
        </div>
      </div>

      {/* Category Shifts Breakdown */}
      {categoryShifts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {categoryShifts.map(shift => {
            const cat = categoryMap.get(shift.id) || { name: 'Other', icon: 'Tag', color: '#64748b' };
            const catLower = shift.diff < 0;

            return (
              <div
                key={shift.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {cat.name}
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      {formatCurrency(shift.prev, currency)} → {formatCurrency(shift.current, currency)}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-extrabold shrink-0 ${
                    catLower ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {catLower ? '-' : '+'}{formatCurrency(Math.abs(shift.diff), currency)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-4">No previous period transactions recorded</p>
      )}
    </div>
  );
};
