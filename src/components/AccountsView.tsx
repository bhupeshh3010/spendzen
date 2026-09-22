import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Account, AccountType } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Landmark,
  PiggyBank,
  CreditCard,
  Wallet,
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    currency,
    totalNetWorth,
    addAccount,
    updateAccount,
    deleteAccount
  } = useExpense();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const openAddModal = () => {
    setEditingAccount(null);
    setName('');
    setType('checking');
    setBalance('0');
    setInstitution('');
    setColor('#3b82f6');
    setIsModalOpen(true);
  };

  const openEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(acc.balance.toString());
    setInstitution(acc.institution || '');
    setColor(acc.color);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(balance) || 0;
    if (!name.trim()) return;

    const isLiability = type === 'credit_card';

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: name.trim(),
        type,
        balance: bal,
        institution: institution.trim() || undefined,
        color,
        isLiability
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        balance: bal,
        institution: institution.trim() || undefined,
        color,
        icon: type === 'savings' ? 'PiggyBank' : type === 'credit_card' ? 'CreditCard' : type === 'cash' ? 'Wallet' : 'Landmark',
        isLiability
      });
    }

    setIsModalOpen(false);
  };

  const getAccountIcon = (accType: AccountType) => {
    switch (accType) {
      case 'savings': return PiggyBank;
      case 'credit_card': return CreditCard;
      case 'cash': return Wallet;
      default: return Landmark;
    }
  };

  // Total Assets vs Liabilities
  const totalAssets = accounts.filter(a => !a.isLiability).reduce((acc, a) => acc + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.isLiability).reduce((acc, a) => acc + a.balance, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Total Liquid Net Worth */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 shadow-sm border border-indigo-100 dark:border-indigo-900/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Net Worth
          </span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(totalNetWorth, currency)}
          </p>
          <span className="text-[11px] text-slate-500">Assets minus liabilities</span>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-sm border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Liquid Assets
          </span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalAssets, currency)}
          </p>
          <span className="text-[11px] text-slate-500">Checking, Savings & Cash</span>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-sm border border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Outstanding Debt / CC
            </span>
            <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(totalLiabilities, currency)}
            </p>
            <span className="text-[11px] text-slate-500">Credit card balances</span>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <Plus size={15} />
            Add Account
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map(acc => {
          const Icon = getAccountIcon(acc.type);

          return (
            <div
              key={acc.id}
              className="glass-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${acc.color}20`, color: acc.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {acc.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {acc.institution || acc.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(acc)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {acc.isLiability ? 'Current Balance Owed' : 'Available Balance'}
                  </span>
                  <p
                    className={`text-2xl font-extrabold tracking-tight mt-0.5 ${
                      acc.isLiability ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {formatCurrency(acc.balance, currency)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="capitalize">{acc.type.replace('_', ' ')}</span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {acc.isLiability ? 'Liability' : 'Asset'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingAccount ? 'Edit Account' : 'Add Financial Account'}
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Checking, Sapphire Card"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Account Type
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit_card">Credit Card (Debt)</option>
                    <option value="cash">Cash Wallet</option>
                    <option value="investment">Investment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Balance ({currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={balance}
                    onChange={e => setBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Institution / Bank (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chase, Bank of America, Fidelity"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                >
                  {editingAccount ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
