import React from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Tv,
  Target,
  ShieldCheck,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                How to Use SpendZen
              </h2>
              <p className="text-xs text-slate-500">Quick Guide & Shortcuts</p>
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
          {/* Guide Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Track Expenses */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <Zap size={16} />
                <span>1. Instant & Detailed Logging</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Use the <strong>Fast Entry bar</strong> at the top of the dashboard for quick coffee & grocery purchases, or press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">N</kbd> to open the full transaction modal.
              </p>
            </div>

            {/* 2. Monthly vs Yearly */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <Calendar size={16} />
                <span>2. Switch Timeframes</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Use the <strong>Monthly</strong> or <strong>Yearly</strong> toggle to view either your current month's burn rate or an entire year's spending trends at a glance.
              </p>
            </div>

            {/* 3. Subscriptions */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-xs">
                <Tv size={16} />
                <span>3. Subscriptions & Rent Hub</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Add recurring bills like Netflix, Gym, and Rent. SpendZen automatically calculates your true <strong>Annualized Cost</strong> and alerts you when renewal dates are near!
              </p>
            </div>

            {/* 4. Budgets & Goals */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                <Target size={16} />
                <span>4. Budgets with Visual Alerts</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Set spending limits for dining, groceries, or total monthly outflow. You'll see green progress bars that turn amber when reaching 80% and red when exceeded.
              </p>
            </div>
          </div>

          {/* Keyboard Shortcuts Section */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2.5">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-indigo-600 dark:text-indigo-400" />
              Helpful Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 shadow-xs">
                <span>Add Transaction</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] font-bold">N</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 shadow-xs">
                <span>Close Modals</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] font-bold">Esc</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 shadow-xs">
                <span>Help Guide</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] font-bold">?</kbd>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-xs text-slate-500">
            <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Your Data is 100% Private</span>
              <p className="mt-0.5">
                All transactions, budgets, and subscriptions stay saved directly in your browser (`localStorage`). You can backup to JSON or CSV anytime via the Database icon in the top header.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
            >
              Got it, let's track!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
