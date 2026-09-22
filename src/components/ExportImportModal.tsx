import React, { useState, useRef } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  exportToJSON,
  exportTransactionsToCSV,
  parseCSV
} from '../utils/storage';
import {
  Download,
  Upload,
  Database,
  FileSpreadsheet,
  FileCode,
  RotateCcw,
  Trash2,
  X,
  FileUp
} from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    transactions,
    subscriptions,
    budgets,
    savingsGoals,
    categories,
    currency,
    accounts,
    splits,
    loadDemoData,
    resetAllData,
    importStateData,
    addTransaction,
    showToast
  } = useExpense();

  const [confirmClear, setConfirmClear] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    exportToJSON({
      transactions,
      subscriptions,
      budgets,
      savingsGoals,
      categories,
      currency,
      accounts,
      splits
    });
    showToast('JSON Exported', 'Full data backup downloaded', 'success');
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, categories, currency.symbol);
    showToast('CSV Exported', 'Transactions spreadsheet downloaded', 'success');
  };

  const handleJSONFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.transactions || parsed.subscriptions) {
          importStateData(parsed);
          onClose();
        } else {
          showToast('Invalid File', 'The JSON backup structure is not recognized', 'error');
        }
      } catch (err) {
        showToast('Import Error', 'Failed to read the JSON file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text, categories);
        if (parsed.length > 0) {
          parsed.forEach(t => {
            if (t.title && t.amount) {
              addTransaction(t as any);
            }
          });
          showToast('CSV Imported', `Imported ${parsed.length} transaction entries`, 'success');
          onClose();
        } else {
          showToast('No Data', 'No readable transactions found in CSV', 'warning');
        }
      } catch (err) {
        showToast('CSV Error', 'Failed to parse CSV records', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database size={20} className="text-indigo-600 dark:text-indigo-400" />
            Data Backup & Portability
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section 1: Export */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Download size={14} /> Export Records
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 text-left transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Export to CSV
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Spreadsheet format for Excel, Google Sheets, & Numbers
                  </p>
                </div>
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 text-left transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <FileCode size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Full JSON Backup
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Includes all transactions, subscriptions, budgets, and goals
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Import */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Upload size={14} /> Import & Restore
            </h3>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={jsonFileInputRef}
              accept=".json"
              className="hidden"
              onChange={handleJSONFileChange}
            />
            <input
              type="file"
              ref={csvFileInputRef}
              accept=".csv"
              className="hidden"
              onChange={handleCSVFileChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => csvFileInputRef.current?.click()}
                className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40 text-left transition-all"
              >
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <FileUp size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Import CSV Statement
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload transactions CSV to append entries
                  </p>
                </div>
              </button>

              <button
                onClick={() => jsonFileInputRef.current?.click()}
                className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 text-left transition-all"
              >
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Restore JSON Backup
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Restore all settings, plans, and records
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Reset & Demo Data */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Demo Sandbox & Reset
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  loadDemoData();
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-900 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                Load Demo Dataset
              </button>

              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  Clear All App Data
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      resetAllData();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                  >
                    Confirm Wipe
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
