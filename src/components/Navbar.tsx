import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { CURRENCIES } from '../utils/formatters';
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  Repeat,
  Target,
  BarChart3,
  CalendarDays,
  Landmark,
  Moon,
  Sun,
  Database,
  Plus,
  ChevronDown,
  HelpCircle,
  Wand2,
  Users,
  FileText,
  FileSpreadsheet,
  QrCode,
  SlidersHorizontal,
  MoreVertical,
  Camera,
  Calculator
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'transactions' | 'subscriptions' | 'budgets' | 'calendar' | 'accounts' | 'analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenDataModal: () => void;
  onOpenHelpModal: () => void;
  onOpenMagicModal: () => void;
  onOpenSplitModal: () => void;
  onOpenReportModal: () => void;
  onOpenCsvMapperModal: () => void;
  onOpenQrModal: () => void;
  onOpenReceiptScanner: () => void;
  onOpenTaxModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenDataModal,
  onOpenHelpModal,
  onOpenMagicModal,
  onOpenSplitModal,
  onOpenReportModal,
  onOpenCsvMapperModal,
  onOpenQrModal,
  onOpenReceiptScanner,
  onOpenTaxModal
}) => {
  const { currency, setCurrency, theme, toggleTheme } = useExpense();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showMoreViewsDropdown, setShowMoreViewsDropdown] = useState(false);

  // Core primary 4 tabs
  const mainTabs: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'budgets', label: 'Budgets & Goals', icon: Target },
  ];

  // Secondary views
  const secondaryViews: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'analytics', label: 'Deep Analytics', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar Heatmap', icon: CalendarDays },
    { id: 'accounts', label: 'Bank & Wallets', icon: Landmark },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer shrink-0"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20">
                <Wallet size={20} />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  SpendZen
                </span>
                <span className="hidden sm:block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Master your money in peace
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Simplified 4 Core Tabs + More) */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              {mainTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}

              {/* Secondary Views Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreViewsDropdown(!showMoreViewsDropdown)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    secondaryViews.some(v => v.id === activeTab)
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="More Views"
                >
                  <SlidersHorizontal size={13} />
                  <span>More</span>
                  <ChevronDown size={11} />
                </button>

                {showMoreViewsDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowMoreViewsDropdown(false)}
                    />
                    <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 py-1.5">
                      {secondaryViews.map(v => {
                        const Icon = v.icon;
                        const isCurrent = activeTab === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => {
                              setActiveTab(v.id);
                              setShowMoreViewsDropdown(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-left transition-colors ${
                              isCurrent
                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Icon size={14} />
                            <span>{v.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Right Action Controls: Clean & Uncluttered */}
            <div className="flex items-center gap-2">
              {/* Primary Add Expense Action */}
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
                title="Add Expense (Shortcut: N)"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Expense</span>
              </button>

              {/* Mobile QR Code Button */}
              <button
                onClick={onOpenQrModal}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-indigo-950/50 transition-colors text-xs font-bold"
                title="Open / Install on Phone (QR Code)"
              >
                <QrCode size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span className="hidden xl:inline">Phone App</span>
              </button>

              {/* Currency Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  title="Change Currency"
                >
                  <span>{currency.symbol}</span>
                  <ChevronDown size={11} className="text-slate-400" />
                </button>

                {showCurrencyDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowCurrencyDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 py-2 max-h-60 overflow-y-auto">
                      {CURRENCIES.map(c => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCurrency(c);
                            setShowCurrencyDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-left ${
                            currency.code === c.code
                              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>{c.name}</span>
                          <span className="font-bold">{c.symbol}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Dark / Light Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 transition-colors"
                title="Toggle Dark / Light Theme"
              >
                {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
              </button>

              {/* "More Tools" Dropdown Menu (Consolidates 6 secondary buttons) */}
              <div className="relative">
                <button
                  onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-indigo-950/50 transition-colors"
                  title="Tools & Extra Features"
                >
                  <MoreVertical size={16} />
                </button>

                {showToolsDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowToolsDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 py-2 divide-y divide-slate-100 dark:divide-slate-800/80 animate-fade-in">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                        Quick Tools
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            onOpenMagicModal();
                            setShowToolsDropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Wand2 size={15} className="text-indigo-500" />
                            <span>Magic Text Entry</span>
                          </div>
                          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded text-slate-400 font-mono">M</kbd>
                        </button>

                        <button
                          onClick={() => {
                            onOpenSplitModal();
                            setShowToolsDropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Users size={15} className="text-emerald-500" />
                            <span>Split Bill Calculator</span>
                          </div>
                          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded text-slate-400 font-mono">S</kbd>
                        </button>

                        <button
                          onClick={() => {
                            onOpenReportModal();
                            setShowToolsDropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <FileText size={15} className="text-violet-500" />
                            <span>Monthly PDF Statement</span>
                          </div>
                          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded text-slate-400 font-mono">P</kbd>
                        </button>

                        <button
                          onClick={() => {
                            onOpenReceiptScanner();
                            setShowToolsDropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Camera size={15} className="text-amber-500" />
                            <span>Receipt & Bill Scanner</span>
                          </div>
                          <span className="px-1.5 py-0.5 text-[9px] bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold rounded">NEW</span>
                        </button>

                        <button
                          onClick={() => {
                            onOpenTaxModal();
                            setShowToolsDropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Calculator size={15} className="text-indigo-500" />
                            <span>Tax Regime Estimator</span>
                          </div>
                          <span className="px-1.5 py-0.5 text-[9px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold rounded">FY 25</span>
                        </button>

                        <button
                          onClick={() => {
                            onOpenCsvMapperModal();
                            setShowToolsDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors text-left"
                        >
                          <FileSpreadsheet size={15} className="text-teal-500" />
                          <span>Bank Statement CSV Import</span>
                        </button>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            onOpenDataModal();
                            setShowToolsDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                          <Database size={15} className="text-blue-500" />
                          <span>Backup & Export Data</span>
                        </button>

                        <button
                          onClick={() => {
                            onOpenHelpModal();
                            setShowToolsDropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <HelpCircle size={15} className="text-amber-500" />
                            <span>Quick Guide & Shortcuts</span>
                          </div>
                          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded text-slate-400 font-mono">?</kbd>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly for smartphone users) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-around py-2 px-2 shadow-xl safe-area-bottom">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <LayoutDashboard size={18} />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'transactions'
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Receipt size={18} />
          <span className="text-[10px]">History</span>
        </button>

        {/* Center Prominent Add Button on Mobile */}
        <button
          onClick={onOpenAddModal}
          className="w-11 h-11 -mt-5 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/40 flex items-center justify-center active:scale-90 transition-all border-2 border-white dark:border-slate-900"
          title="Add Expense"
        >
          <Plus size={22} />
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'subscriptions'
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Repeat size={18} />
          <span className="text-[10px]">Bills</span>
        </button>

        <button
          onClick={() => setActiveTab('budgets')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'budgets'
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Target size={18} />
          <span className="text-[10px]">Budgets</span>
        </button>
      </div>
    </>
  );
};
