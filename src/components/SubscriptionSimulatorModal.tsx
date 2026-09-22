import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { calculateAnnualCost, calculateMonthlyCost, formatCurrency } from '../utils/formatters';
import { exportSubscriptionsToICalendar } from '../utils/storage';
import { CategoryIcon } from './CategoryIcon';
import {
  Calculator,
  X,
  Calendar,
  Download
} from 'lucide-react';

interface SubscriptionSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionSimulatorModal: React.FC<SubscriptionSimulatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { subscriptions, categories, currency } = useExpense();
  const activeSubscriptions = useMemo(() => subscriptions.filter(s => s.active), [subscriptions]);

  const [selectedSubIds, setSelectedSubIds] = useState<string[]>(() =>
    activeSubscriptions.slice(0, 2).map(s => s.id)
  );
  const investmentReturnRate = 8; // 8% default stock index compounding

  const categoryMap = useMemo(() => {
    return new Map(categories.map(c => [c.id, c]));
  }, [categories]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedSubIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectedSubs = activeSubscriptions.filter(s => selectedSubIds.includes(s.id));
  const monthlySaved = selectedSubs.reduce(
    (acc, s) => acc + calculateMonthlyCost(s.amount, s.billingCycle),
    0
  );
  const yearlySaved = selectedSubs.reduce(
    (acc, s) => acc + calculateAnnualCost(s.amount, s.billingCycle),
    0
  );

  // Future value of monthly annuity: FV = P * [ ((1 + r)^n - 1) / r ]
  const rMonthly = investmentReturnRate / 100 / 12;
  const calculateFV = (months: number) => {
    if (monthlySaved === 0) return 0;
    if (rMonthly === 0) return monthlySaved * months;
    return monthlySaved * ((Math.pow(1 + rMonthly, months) - 1) / rMonthly);
  };

  const fv1Year = calculateFV(12);
  const fv3Year = calculateFV(36);
  const fv5Year = calculateFV(60);

  const handleExportICal = () => {
    exportSubscriptionsToICalendar(subscriptions, currency.symbol);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                "What-If I Cancel?" Savings Compounder
              </h2>
              <p className="text-xs text-slate-500">Simulate investment growth if you cut recurring subscriptions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Pick Subscriptions to test cutting */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Subscriptions to Cut (Click to toggle)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {activeSubscriptions.map(sub => {
                const isSelected = selectedSubIds.includes(sub.id);
                const cat = categoryMap.get(sub.categoryId);

                return (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() => toggleSelect(sub.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all ${
                      isSelected
                        ? 'bg-violet-50 dark:bg-violet-950/50 border-violet-500 text-violet-900 dark:text-violet-200 ring-1 ring-violet-500'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat?.color || '#8b5cf6'}20`, color: cat?.color || '#8b5cf6' }}
                      >
                        <CategoryIcon name={cat?.icon || 'Tv'} size={13} />
                      </div>
                      <span className="font-semibold truncate">{sub.name}</span>
                    </div>
                    <span className="font-bold shrink-0 ml-2">
                      {formatCurrency(sub.amount, currency)}/{sub.billingCycle.slice(0, 2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Projection Cards */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-indigo-700 text-white space-y-4 shadow-lg shadow-indigo-500/25">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Immediate Annual Relief
              </span>
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                {selectedSubs.length} Selected
              </span>
            </div>

            <div>
              <p className="text-3xl font-extrabold tracking-tight">
                {formatCurrency(yearlySaved, currency)}
                <span className="text-xs font-semibold text-indigo-200 ml-1">/ year in your pocket</span>
              </p>
              <p className="text-xs text-indigo-100 mt-0.5">
                +{formatCurrency(monthlySaved, currency)} freed every single month
              </p>
            </div>

            {/* Compounding Projections */}
            <div className="pt-3 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-bold text-indigo-200">In 1 Year</span>
                <p className="text-sm font-extrabold mt-0.5">{formatCurrency(fv1Year, currency)}</p>
              </div>

              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-bold text-indigo-200">In 3 Years</span>
                <p className="text-sm font-extrabold mt-0.5">{formatCurrency(fv3Year, currency)}</p>
              </div>

              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs ring-1 ring-white/30">
                <span className="text-[10px] uppercase font-bold text-amber-300">In 5 Years</span>
                <p className="text-sm font-extrabold mt-0.5">{formatCurrency(fv5Year, currency)}</p>
              </div>
            </div>

            <p className="text-[10px] text-indigo-200 text-center">
              *Assuming reinvestment in an S&P500 / Index fund compounding at {investmentReturnRate}% APR
            </p>
          </div>

          {/* Sync / Calendar Export Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar size={14} className="text-violet-600" />
                Never Get Surprised by Renewals
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sync all renewal dates directly with your Google or Apple Calendar.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportICal}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Download size={14} />
              Export .ics Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
