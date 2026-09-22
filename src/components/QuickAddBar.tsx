import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { PaymentMethod } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Zap, Plus, CreditCard } from 'lucide-react';

export const QuickAddBar: React.FC = () => {
  const { categories, currency, addTransaction } = useExpense();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('cat_food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');

  // Most common expense categories for quick pills
  const quickCategories = categories.filter(c =>
    ['cat_food', 'cat_dining', 'cat_transport', 'cat_maid', 'cat_shopping', 'cat_utilities'].includes(c.id)
  );

  const quickAmounts = [50, 100, 200, 500, 1000];

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) return;

    addTransaction({
      title: title.trim(),
      amount: num,
      type: 'expense',
      categoryId: selectedCatId,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
    });

    setTitle('');
    setAmount('');
  };

  const handleAmountChip = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  // 1-tap fast presets for instant logging
  const fastPresets = [
    { title: 'Chai & Snacks', amount: '20', categoryId: 'cat_food' },
    { title: 'Lunch / Dinner', amount: '120', categoryId: 'cat_dining' },
    { title: 'Auto / Metro', amount: '50', categoryId: 'cat_transport' },
    { title: 'Grocery / Milk', amount: '150', categoryId: 'cat_food' },
    { title: 'Swiggy / Zomato', amount: '350', categoryId: 'cat_dining' },
  ];

  const handleApplyPreset = (preset: { title: string; amount: string; categoryId: string }) => {
    setTitle(preset.title);
    setAmount(preset.amount);
    setSelectedCatId(preset.categoryId);
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-xs border border-indigo-100/70 dark:border-indigo-900/30 relative">
      {/* Header with badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Zap size={15} />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Quick Expense Logger
          </span>
          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
            1-Tap Speed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <CreditCard size={13} className="text-slate-400" />
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="bg-transparent border-none text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 p-0 cursor-pointer"
            >
              <option value="upi">📱 UPI</option>
              <option value="cash">💵 Cash</option>
              <option value="net_banking">🏦 NetBanking</option>
              <option value="credit_card">💳 Credit Card</option>
              <option value="debit_card">🏧 Debit Card</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1-Tap Presets Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800/80 no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Tap to Fill:</span>
        {fastPresets.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplyPreset(p)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/70 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors shrink-0 flex items-center gap-1 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
          >
            <span>{p.title}</span>
            <span className="text-indigo-600 dark:text-indigo-400">{currency.symbol}{p.amount}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleQuickAdd} className="space-y-3">
        {/* Inputs row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Expense title (e.g. Chai, Petrol, Groceries)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative w-full sm:w-36">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              {currency.symbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={!title.trim() || !amount}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus size={15} />
            Quick Log
          </button>
        </div>

        {/* Quick Amount Pills & Category Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">Category:</span>
            {quickCategories.map(cat => {
              const isSelected = selectedCatId === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <CategoryIcon name={cat.icon} size={12} />
                  <span>{cat.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Amount Adders */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">Add:</span>
            {quickAmounts.map(val => (
              <button
                type="button"
                key={val}
                onClick={() => handleAmountChip(val)}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-slate-700/50"
              >
                +{currency.symbol}{val}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
