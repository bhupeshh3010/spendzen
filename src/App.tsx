import React, { useState, useEffect } from 'react';
import { ExpenseProvider } from './context/ExpenseContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TransactionList } from './components/TransactionList';
import { SubscriptionsView } from './components/SubscriptionsView';
import { BudgetsView } from './components/BudgetsView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { AnalyticsView } from './components/AnalyticsView';
import { CalendarHeatmapView } from './components/CalendarHeatmapView';
import { AccountsView } from './components/AccountsView';
import { TransactionModal } from './components/TransactionModal';
import { ExportImportModal } from './components/ExportImportModal';
import { HelpGuideModal } from './components/HelpGuideModal';
import { MagicInputModal } from './components/MagicInputModal';
import { CsvMapperModal } from './components/CsvMapperModal';
import { SubscriptionSimulatorModal } from './components/SubscriptionSimulatorModal';
import { BillSplitModal } from './components/BillSplitModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { QrCodeModal } from './components/QrCodeModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { TaxEstimatorModal } from './components/TaxEstimatorModal';
import { ToastContainer } from './components/Toast';
import { Transaction } from './types';
import { ShieldCheck, Plus, Sparkles } from 'lucide-react';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCsvMapperOpen, setIsCsvMapperOpen] = useState(false);
  const [isSubSimulatorOpen, setIsSubSimulatorOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  // Global keyboard shortcuts for ultimate user friendliness
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingTransaction(null);
        setIsAddModalOpen(true);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMagicModalOpen(true);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsSplitModalOpen(true);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsReportModalOpen(true);
      } else if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        setIsQrModalOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsHelpModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setIsDataModalOpen(false);
        setIsHelpModalOpen(false);
        setIsMagicModalOpen(false);
        setIsSplitModalOpen(false);
        setIsReportModalOpen(false);
        setIsCsvMapperOpen(false);
        setIsSubSimulatorOpen(false);
        setIsQrModalOpen(false);
        setIsReceiptScannerOpen(false);
        setIsTaxModalOpen(false);
        setEditingTransaction(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200 relative pb-24 md:pb-6">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onOpenMagicModal={() => setIsMagicModalOpen(true)}
        onOpenSplitModal={() => setIsSplitModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenCsvMapperModal={() => setIsCsvMapperOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
        onOpenTaxModal={() => setIsTaxModalOpen(true)}
      />

      {/* Main Container: Mobile Vertical Flow & Desktop Horizontal Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-4 sm:space-y-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onEditTransaction={handleEditTransaction}
            onOpenMagicModal={() => setIsMagicModalOpen(true)}
            onOpenSplitModal={() => setIsSplitModalOpen(true)}
            onOpenQrModal={() => setIsQrModalOpen(true)}
            onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsView onOpenSimulator={() => setIsSubSimulatorOpen(true)} />
        )}

        {activeTab === 'budgets' && (
          <div className="space-y-10">
            <BudgetsView />
            <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              <SavingsGoalsView />
            </div>
          </div>
        )}

        {activeTab === 'calendar' && <CalendarHeatmapView />}

        {activeTab === 'accounts' && <AccountsView />}

        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 mt-12 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">SpendZen</span>
            <span>•</span>
            <span>Master your money in peace</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Sparkles size={13} /> Quick Guide & Tips
            </button>
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              100% Client-side Data Privacy
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Action Button (FAB) for instant desktop expense entry */}
      <button
        onClick={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        title="Quick Record Expense (N)"
        className="hidden md:flex fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-2xl shadow-indigo-500/40 active:scale-90 items-center justify-center transition-all duration-200 group"
      >
        <Plus size={26} className="group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Modals & Toasts */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        editTransaction={editingTransaction}
      />

      <ExportImportModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />

      <HelpGuideModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <MagicInputModal
        isOpen={isMagicModalOpen}
        onClose={() => setIsMagicModalOpen(false)}
      />

      <CsvMapperModal
        isOpen={isCsvMapperOpen}
        onClose={() => setIsCsvMapperOpen(false)}
      />

      <SubscriptionSimulatorModal
        isOpen={isSubSimulatorOpen}
        onClose={() => setIsSubSimulatorOpen(false)}
      />

      <BillSplitModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
      />

      <MonthlyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
      />

      <TaxEstimatorModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ExpenseProvider>
      <MainApp />
    </ExpenseProvider>
  );
}
