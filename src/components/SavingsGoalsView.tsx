import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { SavingsGoal } from '../types';
import { formatCurrency, formatDate, getDaysUntil } from '../utils/formatters';
import confetti from 'canvas-confetti';
import {
  Plus,
  PiggyBank,
  Calendar,
  CheckCircle2,
  DollarSign,
  Edit2,
  Trash2,
  X,
  Check
} from 'lucide-react';

export const SavingsGoalsView: React.FC = () => {
  const {
    savingsGoals,
    currency,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeToGoal
  } = useExpense();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#10b981');
  const [notes, setNotes] = useState('');

  // Deposit modal state
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const colors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#3b82f6'];

  const openAddModal = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setColor('#10b981');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setDeadline(goal.deadline || '');
    setColor(goal.color);
    setNotes(goal.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;
    if (!name.trim() || isNaN(target) || target <= 0) return;

    if (editingGoal) {
      updateSavingsGoal(editingGoal.id, {
        name: name.trim(),
        targetAmount: target,
        currentAmount: current,
        deadline: deadline || undefined,
        color,
        notes: notes.trim() || undefined
      });
    } else {
      addSavingsGoal({
        name: name.trim(),
        targetAmount: target,
        currentAmount: current,
        deadline: deadline || undefined,
        color,
        icon: 'PiggyBank',
        notes: notes.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    const targetGoal = savingsGoals.find(g => g.id === depositGoalId);
    contributeToGoal(depositGoalId, amount);

    if (targetGoal && (targetGoal.currentAmount + amount) >= targetGoal.targetAmount) {
      // Fire celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setDepositGoalId(null);
    setDepositAmount('');
  };

  const totalSaved = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 shadow-sm border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Saved in Goals
          </span>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(totalSaved, currency)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across {savingsGoals.length} active target{savingsGoals.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-sm border border-indigo-100 dark:border-indigo-900/40">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Cumulative Target
          </span>
          <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {formatCurrency(totalTarget, currency)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Overall progress: <strong>{overallProgress.toFixed(1)}%</strong>
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Savings Targets
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
              Save for vacations, emergencies, gadgets, or down payments.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all shrink-0"
          >
            <Plus size={16} />
            New Goal
          </button>
        </div>
      </div>

      {/* Goals Cards Grid */}
      {savingsGoals.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <PiggyBank size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No savings goals yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Set aside money for what matters to you. Create a target and log deposits as you save.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={16} />
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsGoals.map(goal => {
            const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const daysLeft = goal.deadline ? getDaysUntil(goal.deadline) : null;

            return (
              <div
                key={goal.id}
                className="glass-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                      >
                        <PiggyBank size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {goal.name}
                        </h4>
                        {goal.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {goal.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(goal)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteSavingsGoal(goal.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {formatCurrency(goal.currentAmount, currency)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 ml-1">
                        / {formatCurrency(goal.targetAmount, currency)}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {percent.toFixed(0)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: goal.color
                      }}
                    />
                  </div>

                  {/* Deadline & Remaining */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 size={14} />
                        Goal Reached!
                      </span>
                    ) : (
                      <span>{formatCurrency(remaining, currency)} remaining</span>
                    )}

                    {goal.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {daysLeft !== null && daysLeft > 0
                          ? `${daysLeft} days left`
                          : formatDate(goal.deadline)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Deposit Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setDepositGoalId(goal.id);
                      setDepositAmount('');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Plus size={14} />
                    Add Deposit Funds
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deposit Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600" />
                Add Funds to Goal
              </h3>
              <button
                onClick={() => setDepositGoalId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Deposit Amount ({currency.symbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
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
                  Goal Name / Purpose
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund, Japan Trip, M4 Studio"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Target Goal ({currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="e.g. 5000"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Current Saved ({currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={currentAmount}
                    onChange={e => setCurrentAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Target Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Color Tag
                </label>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-slate-900 dark:ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Flight booking deadline, high-yield account allocation..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2"
                >
                  <Check size={16} />
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
