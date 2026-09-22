import React, { useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatMonthYear } from '../utils/formatters';
import {
  FileText,
  Printer,
  X
} from 'lucide-react';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({ isOpen, onClose }) => {
  const {
    totalExpenses,
    totalIncome,
    netSavings,
    savingsRate,
    categorySpendingMap,
    categories,
    subscriptions,
    currency,
    dateFilter
  } = useExpense();

  const categoryMap = useMemo(() => {
    return new Map(categories.map(c => [c.id, c]));
  }, [categories]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const sortedCategories = Object.entries(categorySpendingMap)
    .filter(([_, amt]) => amt > 0)
    .sort((a, b) => b[1] - a[1]);

  const activeSubs = subscriptions.filter(s => s.active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto print:max-w-none print:shadow-none print:border-none print:max-h-none print:overflow-visible">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Executive Monthly Financial Statement
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Printer size={14} />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 text-slate-900 dark:text-white print:text-black print:p-6 print:space-y-4">
          {/* Header Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:border-slate-400">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-indigo-600 print:text-black">
                SpendZen
              </h1>
              <p className="text-xs text-slate-500 print:text-slate-600 mt-0.5 uppercase tracking-widest font-semibold">
                Personal Monthly Financial Statement
              </p>
            </div>

            <div className="text-right">
              <span className="text-sm font-extrabold block">
                {dateFilter.mode === 'monthly' ? formatMonthYear(dateFilter.year, dateFilter.month) : `Year ${dateFilter.year}`}
              </span>
              <span className="text-[11px] text-slate-400 print:text-slate-600">
                Generated {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Key Metrics Summary Grid */}
          <div className="grid grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 print:bg-slate-100 border border-slate-200/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Income</span>
              <p className="text-base font-extrabold text-emerald-600 print:text-black mt-0.5">
                {formatCurrency(totalIncome, currency)}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Outflows</span>
              <p className="text-base font-extrabold text-rose-600 print:text-black mt-0.5">
                {formatCurrency(totalExpenses, currency)}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Net Surplus</span>
              <p className={`text-base font-extrabold mt-0.5 ${netSavings >= 0 ? 'text-indigo-600' : 'text-rose-600'} print:text-black`}>
                {formatCurrency(netSavings, currency)}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Savings Rate</span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white print:text-black mt-0.5">
                {savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Spending by Category
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 print:bg-slate-200 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Amount</th>
                    <th className="p-2.5 text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedCategories.map(([id, amt]) => {
                    const cat = categoryMap.get(id);
                    const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
                    return (
                      <tr key={id}>
                        <td className="p-2.5 font-semibold">{cat?.name || 'Other'}</td>
                        <td className="p-2.5 text-right font-extrabold">{formatCurrency(amt, currency)}</td>
                        <td className="p-2.5 text-right text-slate-500">{pct.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Subscriptions Commitment */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recurring Subscriptions & Rent ({activeSubs.length})
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 print:bg-slate-200 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Subscription</th>
                    <th className="p-2.5">Cycle</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeSubs.map(s => (
                    <tr key={s.id}>
                      <td className="p-2.5 font-semibold">{s.name}</td>
                      <td className="p-2.5 capitalize text-slate-500">{s.billingCycle}</td>
                      <td className="p-2.5 text-right font-extrabold">{formatCurrency(s.amount, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 print:text-slate-600">
            Generated privately with SpendZen Personal Expense Tracker. All data verified on device.
          </div>
        </div>
      </div>
    </div>
  );
};
