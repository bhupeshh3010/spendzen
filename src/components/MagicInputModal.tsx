import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { parseNaturalExpense } from '../utils/nlpParser';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Wand2,
  X,
  Sparkles,
  Check,
  Smartphone
} from 'lucide-react';

interface MagicInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MagicInputModal: React.FC<MagicInputModalProps> = ({ isOpen, onClose }) => {
  const { categories, currency, addTransaction } = useExpense();
  const [activeMode, setActiveMode] = useState<'natural' | 'sms'>('natural');
  const [inputText, setInputText] = useState('');

  const samplePrompts = [
    'Zomato biryani dinner 540 rs upi',
    'Paid 24000 for 2BHK rent via net banking',
    'Blinkit grocery 650 yesterday via gpay',
    'Petrol 1500 on bike today upi',
    'Maid salary 5500 cash on 3rd'
  ];

  const sampleSmsList = [
    'Dear SBI User, A/C XX9876 debited by Rs.450.00 on 21Sep26 at SWIGGY via UPI. Bal Rs.18,450.',
    'Rs. 1,500.00 spent on your HDFC Bank Card XX4321 at SHELL PETROL PUMP on 21-SEP-26. Avail Limit: Rs.92,000.',
    'Sent Rs.850.00 from ICICI Bank A/C to BLINKIT GROCERY via UPI on 21-09-2026. Ref: 429183749.'
  ];

  // Bank SMS parser
  const parseBankSms = (sms: string) => {
    let amount = 0;
    const amountMatch = sms.match(/(?:rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/i) ||
                       sms.match(/(?:debited by|spent|paid)\s*(?:rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)/i);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    let merchant = 'Card / UPI Transaction';
    const atMatch = sms.match(/\b(?:at|to)\s+([A-Za-z0-9\s&'-]{3,25}?)(?=\s+(?:on|via|\.|ref|avail|bal))/i);
    if (atMatch) {
      merchant = atMatch[1].trim();
    }

    let paymentMethod: 'upi' | 'credit_card' | 'debit_card' | 'net_banking' = 'upi';
    if (/card|pos/i.test(sms)) {
      paymentMethod = /credit/i.test(sms) ? 'credit_card' : 'debit_card';
    } else if (/net banking|neft|rtgs|imps/i.test(sms)) {
      paymentMethod = 'net_banking';
    }

    let categoryId = 'cat_shopping';
    const lower = sms.toLowerCase();
    if (/swiggy|zomato|restaurant|cafe|mcdonald|domino|starbucks|biryani/i.test(lower)) {
      categoryId = 'cat_dining';
    } else if (/blinkit|zepto|dmart|grocery|supermarket|bigbasket|instamart|milk/i.test(lower)) {
      categoryId = 'cat_food';
    } else if (/petrol|fuel|shell|hpcl|bpcl|ioc|uber|ola/i.test(lower)) {
      categoryId = 'cat_transport';
    } else if (/hospital|pharmacy|apollo|medplus|doctor/i.test(lower)) {
      categoryId = 'cat_healthcare';
    } else if (/electricity|bescom|tneb|water|gas|wifi|broadband|airtel|jio/i.test(lower)) {
      categoryId = 'cat_utilities';
    }

    return {
      title: merchant,
      amount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      categoryId,
      confidence: 0.95
    };
  };

  const parsed = useMemo(() => {
    if (!inputText.trim()) return null;
    if (activeMode === 'sms') {
      return parseBankSms(inputText);
    }
    return parseNaturalExpense(inputText, categories);
  }, [inputText, activeMode, categories]);

  const categoryMap = useMemo(() => {
    return new Map(categories.map(c => [c.id, c]));
  }, [categories]);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed || parsed.amount <= 0) return;

    addTransaction({
      title: parsed.title,
      amount: parsed.amount,
      type: 'expense',
      categoryId: parsed.categoryId,
      date: parsed.date,
      paymentMethod: parsed.paymentMethod,
      notes: `Logged via Magic AI: "${inputText.trim()}"`
    });

    setInputText('');
    onClose();
  };

  const detectedCat = parsed ? categoryMap.get(parsed.categoryId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-transparent dark:from-indigo-950/20 dark:via-purple-950/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Wand2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                Magic Text & Bank SMS Parser
                <Sparkles size={14} className="text-amber-500" />
              </h2>
              <p className="text-xs text-slate-500">Auto-extract expenses in SpendZen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-4">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveMode('natural');
                setInputText('');
              }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeMode === 'natural'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wand2 size={13} />
              <span>Natural Text (e.g. Chai 20)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('sms');
                setInputText('');
              }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeMode === 'sms'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone size={13} />
              <span>Paste Bank SMS / UPI</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleApply} className="p-6 space-y-4">
          {/* Main Input Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {activeMode === 'sms' ? 'Paste Bank Transaction SMS' : 'What did you spend?'}
            </label>
            <textarea
              rows={3}
              autoFocus
              placeholder={
                activeMode === 'sms'
                  ? 'Paste SMS e.g. "Dear SBI User, A/C 9876 debited by Rs.450.00 at SWIGGY via UPI..."'
                  : 'e.g. Paid ₹1500 for petrol via GPay, or Zomato biryani 540 rs yesterday...'
              }
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all leading-relaxed"
            />
          </div>

          {/* Sample Prompts */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400">
              {activeMode === 'sms' ? 'Try these real bank SMS samples:' : 'Try these examples:'}
            </span>
            <div className="flex flex-col gap-1.5">
              {(activeMode === 'sms' ? sampleSmsList : samplePrompts.slice(0, 3)).map((prompt, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setInputText(prompt)}
                  className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors text-left truncate"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Live Extracted Fields Preview */}
          {parsed && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-indigo-600" />
                  Instant Live Parsing
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {Math.round(parsed.confidence * 100)}% Match
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Title</span>
                  <span className="font-extrabold text-slate-900 dark:text-white truncate block">
                    {parsed.title}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Amount</span>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400 block">
                    {formatCurrency(parsed.amount, currency)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
                  {detectedCat && (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${detectedCat.color}20`, color: detectedCat.color }}
                    >
                      <CategoryIcon name={detectedCat.icon} size={14} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Category</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {detectedCat?.name || 'Other'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Date & Method</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate capitalize">
                    {formatDate(parsed.date)} • {parsed.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!parsed || parsed.amount <= 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check size={16} />
              Confirm & Log Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
