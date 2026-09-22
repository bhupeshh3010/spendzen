import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { PaymentMethod, Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Copy,
  Repeat,
  Plus,
  CreditCard,
  Layers,
  X,
  RotateCcw
} from 'lucide-react';

interface TransactionListProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onOpenAddModal,
  onEditTransaction
}) => {
  const {
    filteredTransactions,
    categories,
    currency,
    deleteTransaction,
    addTransaction
  } = useExpense();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categoryMap = useMemo(() => {
    return new Map(categories.map(c => [c.id, c]));
  }, [categories]);

  // Count items per category in current period
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTransactions.forEach(tx => {
      counts[tx.categoryId] = (counts[tx.categoryId] || 0) + 1;
    });
    return counts;
  }, [filteredTransactions]);

  // Filter and sort transactions
  const displayedTransactions = useMemo(() => {
    return filteredTransactions
      .filter(tx => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = tx.title.toLowerCase().includes(q);
          const matchesNotes = tx.notes?.toLowerCase().includes(q);
          const matchesTags = tx.tags?.some(t => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesNotes && !matchesTags) return false;
        }

        // Category
        if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
          return false;
        }

        // Type
        if (selectedType !== 'all' && tx.type !== selectedType) {
          return false;
        }

        // Payment method
        if (selectedPayment !== 'all' && tx.paymentMethod !== selectedPayment) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [filteredTransactions, searchQuery, selectedCategory, selectedType, selectedPayment, sortBy]);

  // Total sum of currently filtered entries
  const filteredSum = useMemo(() => {
    return displayedTransactions.reduce((acc, tx) => {
      return tx.type === 'expense' ? acc - tx.amount : acc + tx.amount;
    }, 0);
  }, [displayedTransactions]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedType !== 'all' || selectedPayment !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedPayment('all');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(displayedTransactions.length / itemsPerPage);
  const paginatedTransactions = displayedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDuplicate = (tx: Transaction) => {
    const { id, createdAt, ...rest } = tx;
    addTransaction({
      ...rest,
      title: `${tx.title} (Copy)`,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const formatPaymentLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'credit_card': return 'Credit Card';
      case 'debit_card': return 'Debit Card';
      case 'bank_transfer': return 'Bank Transfer';
      case 'upi': return 'UPI / App';
      case 'cash': return 'Cash';
      default: return 'Other';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Category Quick-Filter Pills Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        <button
          onClick={() => {
            setSelectedCategory('all');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <span>All Categories</span>
          <span className="text-[10px] opacity-75 font-semibold">({filteredTransactions.length})</span>
        </button>

        {categories
          .filter(c => (categoryCounts[c.id] || 0) > 0)
          .map(cat => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(isSelected ? 'all' : cat.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <CategoryIcon name={cat.icon} size={14} />
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
      </div>

      {/* 2. Header & Controls Bar */}
      <div className="glass-card rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses (e.g. rent, groceries, netflix, #tags)..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-9 py-2 bg-slate-100 dark:bg-slate-800/80 border-none rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all shrink-0"
          >
            <Plus size={16} />
            Add Transaction
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl px-2.5 py-1.5">
            <Layers size={14} className="text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 p-0 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl px-2.5 py-1.5">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 p-0 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl px-2.5 py-1.5">
            <CreditCard size={14} className="text-slate-400 shrink-0" />
            <select
              value={selectedPayment}
              onChange={e => {
                setSelectedPayment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 p-0 cursor-pointer"
            >
              <option value="all">All Payment Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI / Wallet</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl px-2.5 py-1.5">
            <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 p-0 cursor-pointer"
            >
              <option value="date_desc">Newest Date</option>
              <option value="date_asc">Oldest Date</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <span className="text-slate-500 font-medium">
              Found <strong className="text-slate-900 dark:text-white">{displayedTransactions.length}</strong> matching transactions
              {' '}(Net: <strong className={filteredSum >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{formatCurrency(filteredSum, currency)}</strong>)
            </span>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              <RotateCcw size={12} />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Transaction List Entries */}
      {displayedTransactions.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Filter size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No transactions found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No entries matched your current timeframe or filters. Try adjusting your search query or reset your filters.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Plus size={16} />
              Add Transaction
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          {paginatedTransactions.map(tx => {
            const cat = categoryMap.get(tx.categoryId) || {
              name: 'Other',
              icon: 'Tag',
              color: '#64748b'
            };
            const isExpense = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {tx.title}
                      </h4>
                      {tx.isRecurring && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[10px] font-bold">
                          <Repeat size={10} />
                          {tx.recurringFrequency || 'recurring'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {cat.name}
                      </span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="capitalize">{formatPaymentLabel(tx.paymentMethod)}</span>
                    </div>

                    {tx.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-1">
                        "{tx.notes}"
                      </p>
                    )}

                    {tx.tags && tx.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {tx.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-4 shrink-0 pl-3">
                  <div className="text-right">
                    <span
                      className={`text-base font-extrabold tracking-tight ${
                        isExpense
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}{formatCurrency(tx.amount, currency)}
                    </span>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      {tx.type}
                    </span>
                  </div>

                  {/* Hover Action Menu */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditTransaction(tx)}
                      title="Edit Transaction"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(tx)}
                      title="Duplicate Transaction"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      title="Delete Transaction"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-500 font-semibold">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, displayedTransactions.length)} of{' '}
            {displayedTransactions.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Prev
            </button>
            <span className="px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
