import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Calendar as CalendarIcon,
  Flame,
  CheckCircle2
} from 'lucide-react';

export const CalendarHeatmapView: React.FC = () => {
  const { filteredExpenses, dateFilter, currency, categories } = useExpense();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const categoryMap = useMemo(() => {
    return new Map(categories.map(c => [c.id, c]));
  }, [categories]);

  // Days in month
  const daysInMonth = new Date(dateFilter.year, dateFilter.month + 1, 0).getDate();
  const firstDayIndex = new Date(dateFilter.year, dateFilter.month, 1).getDay(); // 0 = Sun, 1 = Mon...

  // Map daily spending
  const dailySpendMap = useMemo(() => {
    const map: Record<number, number> = {};
    filteredExpenses.forEach(tx => {
      const d = new Date(tx.date + 'T00:00:00');
      if (d.getFullYear() === dateFilter.year && d.getMonth() === dateFilter.month) {
        const day = d.getDate();
        map[day] = (map[day] || 0) + tx.amount;
      }
    });
    return map;
  }, [filteredExpenses, dateFilter]);

  // Count no-spend days up to current day
  const noSpendCount = useMemo(() => {
    let count = 0;
    const now = new Date();
    const maxDay = (dateFilter.year === now.getFullYear() && dateFilter.month === now.getMonth())
      ? now.getDate()
      : daysInMonth;

    for (let i = 1; i <= maxDay; i++) {
      if (!dailySpendMap[i] || dailySpendMap[i] === 0) {
        count++;
      }
    }
    return count;
  }, [dailySpendMap, dateFilter, daysInMonth]);

  // Transactions for selected day
  const selectedDayTransactions = useMemo(() => {
    if (!selectedDay) return [];
    const targetDateStr = `${dateFilter.year}-${String(dateFilter.month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    return filteredExpenses.filter(tx => tx.date === targetDateStr);
  }, [selectedDay, filteredExpenses, dateFilter]);

  const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Intensity color
  const getDayColorClass = (amount: number | undefined) => {
    if (!amount || amount === 0) {
      return 'bg-slate-100/70 dark:bg-slate-800/40 text-slate-400 border-dashed border-slate-200 dark:border-slate-800';
    }
    if (amount < 40) {
      return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900';
    }
    if (amount < 120) {
      return 'bg-indigo-300/80 dark:bg-indigo-800/80 text-indigo-900 dark:text-white border-indigo-400 dark:border-indigo-700';
    }
    return 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm border-indigo-700';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with No-Spend Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 shadow-sm border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              No-Spend Days
            </span>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {noSpendCount} Days
            </p>
            <span className="text-[11px] text-slate-500">Zero non-essential spending</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-sm border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Flame size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Discipline Streak
            </span>
            <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {Math.round((noSpendCount / daysInMonth) * 100)}%
            </p>
            <span className="text-[11px] text-slate-500">Zero-spend ratio this month</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Heatmap Intensity
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" title="$0" />
              <span className="w-3 h-3 rounded bg-indigo-100 dark:bg-indigo-950" title="<$40" />
              <span className="w-3 h-3 rounded bg-indigo-400 dark:bg-indigo-800" title="<$120" />
              <span className="w-3 h-3 rounded bg-indigo-600" title="$120+" />
              <span className="text-[10px] text-slate-400 ml-1">Low → High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="glass-card rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon size={16} className="text-indigo-600" />
            Spending Calendar — {MONTH_NAMES[dateFilter.month]} {dateFilter.year}
          </h3>
          <span className="text-xs text-slate-400">Tap any day to view transactions</span>
        </div>

        {/* Week Day Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1">
          {weekDayHeaders.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 rounded-xl bg-transparent" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const spend = dailySpendMap[dayNum];
            const isSelected = selectedDay === dayNum;

            return (
              <button
                type="button"
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                className={`h-16 rounded-xl p-1.5 flex flex-col justify-between text-left border transition-all ${getDayColorClass(
                  spend
                )} ${isSelected ? 'ring-2 ring-indigo-500 scale-102 shadow-md' : 'hover:scale-101'}`}
              >
                <span className="text-xs font-bold leading-none">{dayNum}</span>
                {spend && spend > 0 ? (
                  <span className="text-[10px] font-extrabold truncate">
                    {formatCurrency(spend, currency)}
                  </span>
                ) : (
                  <span className="text-[9px] opacity-60">Free</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Transactions Drawer */}
      {selectedDay && (
        <div className="glass-card rounded-2xl p-5 shadow-sm space-y-3 animate-fade-in border border-indigo-200 dark:border-indigo-900/60">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Transactions on {MONTH_NAMES[dateFilter.month]} {selectedDay}, {dateFilter.year}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Close
            </button>
          </div>

          {selectedDayTransactions.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">🎉 Zero expenses recorded on this day! High-five!</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {selectedDayTransactions.map(tx => {
                const cat = categoryMap.get(tx.categoryId) || { name: 'Other', icon: 'Tag', color: '#64748b' };
                return (
                  <div key={tx.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {tx.title}
                        </p>
                        <span className="text-[10px] text-slate-400">{cat.name}</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                      -{formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
