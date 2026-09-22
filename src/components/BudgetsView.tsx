import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Budget } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Plus,
  Target,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Check,
  PieChart
} from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    categories,
    currency,
    categorySpendingMap,
    totalExpenses,
    addBudget,
    updateBudget,
    deleteBudget
  } = useExpense();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [categoryId, setCategoryId] = useState('total');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const openAddModal = () => {
    setEditingBudget(null);
    setCategoryId('total');
    setMonthlyLimit('');
    setAlertThreshold('80');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Budget) => {
    setEditingBudget(b);
    setCategoryId(b.categoryId);
    setMonthlyLimit(b.monthlyLimit.toString());
    setAlertThreshold(b.alertThreshold.toString());
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    const threshold = parseInt(alertThreshold, 10);
    if (isNaN(limit) || limit <= 0) return;

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        categoryId,
        monthlyLimit: limit,
        alertThreshold: threshold || 80
      });
    } else {
      addBudget({
        categoryId,
        monthlyLimit: limit,
        alertThreshold: threshold || 80
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-2xl p-5 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target size={18} className="text-indigo-600 dark:text-indigo-400" />
            Monthly Spending Budgets & Limits
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Keep your spending on rent, food, dining, and lifestyle under control with instant budget alerts.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all shrink-0"
        >
          <Plus size={16} />
          Set New Budget
        </button>
      </div>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <PieChart size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No budgets configured</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Create monthly spending limits for overall expenses or categories like Groceries, Dining, and Shopping.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={16} />
            Create Budget Limit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(budget => {
            const isTotal = budget.categoryId === 'total';
            const spent = isTotal ? totalExpenses : categorySpendingMap[budget.categoryId] || 0;
            const limit = budget.monthlyLimit;
            const percent = limit > 0 ? (spent / limit) * 100 : 0;
            const remaining = limit - spent;
            const isOver = spent > limit;
            const isWarning = percent >= budget.alertThreshold && !isOver;

            const cat = !isTotal
              ? categoryMap.get(budget.categoryId) || {
                  name: 'Category',
                  icon: 'Tag',
                  color: '#6366f1'
                }
              : {
                  name: 'Overall Total Budget',
                  icon: 'Wallet',
                  color: '#4f46e5'
                };

            let barColor = 'bg-emerald-500';
            if (isOver) {
              barColor = 'bg-rose-500';
            } else if (isWarning) {
              barColor = 'bg-amber-500';
            }

            return (
              <div
                key={budget.id}
                className="glass-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {cat.name}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Monthly limit: {formatCurrency(limit, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(budget)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Edit Budget"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete Budget"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">
                      Spent: <strong className="text-slate-900 dark:text-white">{formatCurrency(spent, currency)}</strong>
                    </span>
                    <span className={`font-bold ${isOver ? 'text-rose-600 dark:text-rose-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {percent.toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>

                {/* Footer status */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  {isOver ? (
                    <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                      <AlertCircle size={14} />
                      Exceeded by {formatCurrency(Math.abs(remaining), currency)}
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                      <AlertTriangle size={14} />
                      {formatCurrency(remaining, currency)} left ({percent.toFixed(0)}% threshold reached)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={14} />
                      {formatCurrency(remaining, currency)} remaining
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400 font-medium">
                    Alert at {budget.alertThreshold}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingBudget ? 'Edit Spending Budget' : 'Set Budget Limit'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Scope / Category
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="total">Overall Total Monthly Spending</option>
                  {categories
                    .filter(c => c.type === 'expense')
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Monthly Limit ({currency.symbol})
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="e.g. 500"
                  value={monthlyLimit}
                  onChange={e => setMonthlyLimit(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Warning Alert Threshold ({alertThreshold}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={alertThreshold}
                  onChange={e => setAlertThreshold(e.target.value)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>50%</span>
                  <span>80% (Recommended)</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2"
                >
                  <Check size={16} />
                  {editingBudget ? 'Save Changes' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
