import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import {
  AlertCircle,
  CheckCircle2,
  Compass
} from 'lucide-react';

export const ForecastCard: React.FC = () => {
  const { forecast, currency, budgets } = useExpense();

  const totalBudget = budgets.find(b => b.categoryId === 'total');
  const budgetLimit = totalBudget ? totalBudget.monthlyLimit : 0;

  const isProjectedOver = budgetLimit > 0 && forecast.estimatedMonthEndSpend > budgetLimit;
  const projectedSurplus = forecast.projectedNetSavings;

  return (
    <div className="glass-card rounded-2xl p-5 shadow-sm border border-indigo-100/80 dark:border-indigo-900/40 relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Compass size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              End-of-Month Cashflow Forecast
            </h3>
            <p className="text-xs text-slate-500">
              Prorated prediction with {forecast.daysRemaining} days remaining
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
          Smart Projection
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Estimated Final Total Spend */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Projected Month-End Spend
          </span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(forecast.estimatedMonthEndSpend, currency)}
          </p>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            Current: {formatCurrency(forecast.currentSpent, currency)}
          </span>
        </div>

        {/* Projected Discretionary Burn */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Remaining Discretionary
          </span>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            +{formatCurrency(forecast.projectedDiscretionary, currency)}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Burn pace: {formatCurrency(forecast.dailyBurnRate, currency)}/day
          </span>
        </div>

        {/* Upcoming Fixed Subscriptions */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Pending Subscriptions
          </span>
          <p className="text-xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">
            +{formatCurrency(forecast.upcomingScheduledBills, currency)}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Scheduled renewals due
          </span>
        </div>
      </div>

      {/* Budget Comparison Banner */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        {budgetLimit > 0 ? (
          <div className="flex items-center gap-2">
            {isProjectedOver ? (
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                <AlertCircle size={15} />
                Projected to exceed budget by {formatCurrency(forecast.estimatedMonthEndSpend - budgetLimit, currency)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 size={15} />
                On track! Estimated {formatCurrency(budgetLimit - forecast.estimatedMonthEndSpend, currency)} buffer under budget
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-500">
            Set an overall monthly budget to see predictive boundary alerts.
          </span>
        )}

        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Projected Month-End Balance:{' '}
          <strong className={projectedSurplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
            {formatCurrency(projectedSurplus, currency)}
          </strong>
        </span>
      </div>
    </div>
  );
};
