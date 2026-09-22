import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { PaymentMethod, RecurringFrequency, Subscription } from '../types';
import {
  calculateAnnualCost,
  calculateMonthlyCost,
  formatCurrency,
  formatDate,
  getDaysUntil,
  getNextOccurrence
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Plus,
  Tv,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Edit2,
  Trash2,
  X,
  Check,
  Clock,
  Calculator
} from 'lucide-react';

interface SubscriptionsViewProps {
  onOpenSimulator?: () => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({ onOpenSimulator }) => {
  const {
    subscriptions,
    categories,
    currency,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionActive,
    addTransaction
  } = useExpense();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('cat_subscriptions');
  const [billingCycle, setBillingCycle] = useState<RecurringFrequency>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  const activeSubscriptions = subscriptions.filter(s => s.active);
  const monthlyTotal = activeSubscriptions.reduce(
    (acc, s) => acc + calculateMonthlyCost(s.amount, s.billingCycle),
    0
  );
  const yearlyTotal = activeSubscriptions.reduce(
    (acc, s) => acc + calculateAnnualCost(s.amount, s.billingCycle),
    0
  );

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const openAddModal = () => {
    setEditingSub(null);
    setName('');
    setAmount('');
    setCategoryId('cat_subscriptions');
    setBillingCycle('monthly');
    setStartDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('credit_card');
    setWebsite('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subscription) => {
    setEditingSub(sub);
    setName(sub.name);
    setAmount(sub.amount.toString());
    setCategoryId(sub.categoryId);
    setBillingCycle(sub.billingCycle);
    setStartDate(sub.startDate);
    setPaymentMethod(sub.paymentMethod);
    setWebsite(sub.website || '');
    setNotes(sub.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!name.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const nextBilling = getNextOccurrence(startDate, billingCycle);

    if (editingSub) {
      updateSubscription(editingSub.id, {
        name: name.trim(),
        amount: numAmount,
        categoryId,
        billingCycle,
        startDate,
        nextBillingDate: nextBilling,
        paymentMethod,
        website: website.trim() || undefined,
        notes: notes.trim() || undefined
      });
    } else {
      addSubscription({
        name: name.trim(),
        amount: numAmount,
        categoryId,
        billingCycle,
        startDate,
        nextBillingDate: nextBilling,
        paymentMethod,
        active: true,
        autoLogTransaction: true,
        website: website.trim() || undefined,
        notes: notes.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  const handleLogNow = (sub: Subscription) => {
    addTransaction({
      title: `${sub.name} (Recurring Payment)`,
      amount: sub.amount,
      type: 'expense',
      categoryId: sub.categoryId,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: sub.paymentMethod,
      isRecurring: true,
      recurringFrequency: sub.billingCycle,
      subscriptionId: sub.id,
      notes: sub.notes
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 shadow-sm border border-violet-100 dark:border-violet-900/40">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monthly Subscriptions
          </span>
          <h3 className="text-2xl font-extrabold text-violet-600 dark:text-violet-400 mt-2">
            {formatCurrency(monthlyTotal, currency)}
            <span className="text-xs font-semibold text-slate-400 ml-1">/ month</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total recurring commitment per month
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-sm border border-indigo-100 dark:border-indigo-900/40">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Annual Projection
          </span>
          <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {formatCurrency(yearlyTotal, currency)}
            <span className="text-xs font-semibold text-slate-400 ml-1">/ year</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across {activeSubscriptions.length} active service{activeSubscriptions.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Manage Services
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
              Track renewals, pause unused plans, or log payment.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onOpenSimulator && (
              <button
                type="button"
                onClick={onOpenSimulator}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all border border-amber-500/20 active:scale-95"
                title="What-If I Cancel? Savings compounder & calendar sync"
              >
                <Calculator size={15} />
                <span className="hidden sm:inline">Savings Simulator</span>
              </button>
            )}
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-violet-500/20 transition-all"
            >
              <Plus size={16} />
              Add Plan
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Subscription Cards */}
      {subscriptions.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
            <Tv size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No subscriptions yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Add recurring memberships like Netflix, Spotify, gym, rent, internet or cloud storage to monitor your recurring costs.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={16} />
            Add First Subscription
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map(sub => {
            const cat = categoryMap.get(sub.categoryId) || {
              name: 'Subscriptions',
              icon: 'Tv',
              color: '#8b5cf6'
            };
            const daysLeft = getDaysUntil(sub.nextBillingDate);
            const annualCost = calculateAnnualCost(sub.amount, sub.billingCycle);

            return (
              <div
                key={sub.id}
                className={`glass-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between ${
                  !sub.active ? 'opacity-60 bg-slate-100/50 dark:bg-slate-900/30' : ''
                }`}
              >
                <div>
                  {/* Top Bar: Icon + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {sub.name}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {cat.name}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSubscriptionActive(sub.id)}
                      title={sub.active ? 'Pause Subscription' : 'Resume Subscription'}
                      className={`p-1.5 rounded-xl text-xs font-bold transition-colors ${
                        sub.active
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100'
                          : 'text-slate-400 bg-slate-200 dark:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {sub.active ? <PlayCircle size={18} /> : <PauseCircle size={18} />}
                    </button>
                  </div>

                  {/* Price & Billing Cycle */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {formatCurrency(sub.amount, currency)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 ml-1 capitalize">
                        / {sub.billingCycle}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                      {formatCurrency(annualCost, currency)}/yr
                    </span>
                  </div>

                  {/* Next Billing Date Badge */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock size={14} />
                      <span>Next: {formatDate(sub.nextBillingDate)}</span>
                    </div>

                    {sub.active && (
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                          daysLeft <= 3
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
                            : daysLeft <= 7
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {daysLeft <= 0
                          ? 'Due today'
                          : daysLeft === 1
                          ? 'Tomorrow'
                          : `in ${daysLeft} days`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleLogNow(sub)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 size={13} />
                    Log to Expenses
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteSubscription(sub.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingSub ? 'Edit Subscription' : 'Add Recurring Subscription'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Subscription / Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Spotify, Rent, Gym, iCloud"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Amount ({currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Billing Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={e => setBillingCycle(e.target.value as RecurringFrequency)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                >
                  {categories
                    .filter(c => c.type === 'expense')
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Billing Start / Next
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI / App</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Website / Service URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://netflix.com"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm flex items-center gap-2"
                >
                  <Check size={16} />
                  {editingSub ? 'Save Changes' : 'Add Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
