import React, { useState, useRef } from 'react';
import { useExpense } from '../context/ExpenseContext';
import {
  FileSpreadsheet,
  Upload,
  X,
  Check
} from 'lucide-react';

interface CsvMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvMapperModal: React.FC<CsvMapperModalProps> = ({ isOpen, onClose }) => {
  const { categories, addTransaction, showToast } = useExpense();

  const [csvLines, setCsvLines] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');

  // Column Mappings
  const [dateCol, setDateCol] = useState('');
  const [titleCol, setTitleCol] = useState('');
  const [amountCol, setAmountCol] = useState('');
  const [categoryCol, setCategoryCol] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = event => {
      const text = event.target?.result as string;
      const rawLines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (rawLines.length < 2) {
        showToast('Invalid CSV', 'File contains no records', 'error');
        return;
      }

      // Parse lines into tokens
      const parsedRows: string[][] = [];
      for (const line of rawLines) {
        const values: string[] = [];
        let insideQuote = false;
        let current = '';

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            insideQuote = !insideQuote;
          } else if (char === ',' && !insideQuote) {
            values.push(current.trim().replace(/^["']|["']$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim().replace(/^["']|["']$/g, ''));
        parsedRows.push(values);
      }

      const extractedHeaders = parsedRows[0];
      setHeaders(extractedHeaders);
      setCsvLines(parsedRows.slice(1));

      // Intelligent Auto-Guessing
      extractedHeaders.forEach(h => {
        const lower = h.toLowerCase();
        if (lower.includes('date') || lower.includes('time') || lower.includes('posted')) {
          setDateCol(h);
        } else if (lower.includes('desc') || lower.includes('memo') || lower.includes('narration') || lower.includes('payee') || lower.includes('name')) {
          setTitleCol(h);
        } else if (lower.includes('amount') || lower.includes('debit') || lower.includes('spent') || lower.includes('cost')) {
          setAmountCol(h);
        } else if (lower.includes('category') || lower.includes('type')) {
          setCategoryCol(h);
        }
      });
    };

    reader.readAsText(file);
  };

  const applyBankPreset = (bank: 'hdfc' | 'sbi' | 'icici' | 'axis' | 'kotak' | 'upi') => {
    const findHeader = (candidates: string[]) => {
      return headers.find(h => {
        const lh = h.toLowerCase().replace(/[^a-z0-9]/g, '');
        return candidates.some(c => lh.includes(c.toLowerCase().replace(/[^a-z0-9]/g, '')));
      }) || '';
    };

    if (bank === 'hdfc') {
      setDateCol(findHeader(['date', 'valuedate', 'txndate']));
      setTitleCol(findHeader(['narration', 'description', 'particulars']));
      setAmountCol(findHeader(['withdrawalamt', 'withdrawal', 'debit', 'amount']));
    } else if (bank === 'sbi') {
      setDateCol(findHeader(['txndate', 'transactiondate', 'date']));
      setTitleCol(findHeader(['description', 'narration']));
      setAmountCol(findHeader(['debit', 'withdrawal', 'amount']));
    } else if (bank === 'icici') {
      setDateCol(findHeader(['transactiondate', 'valuedate', 'date']));
      setTitleCol(findHeader(['remarks', 'description', 'particulars']));
      setAmountCol(findHeader(['withdrawalamount', 'debit', 'amount']));
    } else if (bank === 'axis') {
      setDateCol(findHeader(['trandate', 'date']));
      setTitleCol(findHeader(['particulars', 'description']));
      setAmountCol(findHeader(['debit', 'withdraw', 'amount']));
    } else if (bank === 'kotak') {
      setDateCol(findHeader(['date', 'txndate']));
      setTitleCol(findHeader(['description', 'narration']));
      setAmountCol(findHeader(['debit', 'amount']));
    } else if (bank === 'upi') {
      setDateCol(findHeader(['date', 'time']));
      setTitleCol(findHeader(['activity', 'details', 'remarks', 'to']));
      setAmountCol(findHeader(['debit', 'paid', 'amount']));
    }
    showToast('Bank Preset Applied', `Mapped columns using ${bank.toUpperCase()} statement structure`, 'info');
  };

  const handleImport = () => {
    if (!titleCol || !amountCol) {
      showToast('Missing Mappings', 'Please map at least Title and Amount columns', 'warning');
      return;
    }

    const titleIdx = headers.indexOf(titleCol);
    const amountIdx = headers.indexOf(amountCol);
    const dateIdx = headers.indexOf(dateCol);
    const catIdx = headers.indexOf(categoryCol);

    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
    let importedCount = 0;

    csvLines.forEach(row => {
      const rawTitle = row[titleIdx] || 'Bank Transaction';
      const rawAmountStr = row[amountIdx] || '0';
      const parsedAmount = Math.abs(parseFloat(rawAmountStr.replace(/[^0-9.-]+/g, '')) || 0);

      if (parsedAmount > 0) {
        let dateVal = new Date().toISOString().split('T')[0];
        if (dateIdx >= 0 && row[dateIdx]) {
          const tryDate = new Date(row[dateIdx]);
          if (!isNaN(tryDate.getTime())) {
            dateVal = tryDate.toISOString().split('T')[0];
          }
        }

        let catId = 'cat_misc';
        if (catIdx >= 0 && row[catIdx]) {
          catId = categoryMap.get(row[catIdx].toLowerCase()) || 'cat_misc';
        }

        addTransaction({
          title: rawTitle,
          amount: parsedAmount,
          type: 'expense',
          categoryId: catId,
          date: dateVal,
          paymentMethod: 'bank_transfer',
          notes: `Imported statement from ${fileName}`
        });
        importedCount++;
      }
    });

    showToast('Statement Imported', `Imported ${importedCount} transactions successfully`, 'success');
    onClose();
  };

  const previewRows = csvLines.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Smart Bank Statement CSV Auto-Mapper
              </h2>
              <p className="text-xs text-slate-500">Works with Chase, Amex, BofA, HDFC, Revolut & more</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* File Upload Area */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />

          {csvLines.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-colors space-y-2 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Upload size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Click or Drop Bank CSV Statement
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Upload exported transactions from your bank or card statement.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-semibold truncate">📄 {fileName} ({csvLines.length} records found)</span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="font-bold underline ml-2 shrink-0"
                >
                  Change File
                </button>
              </div>

              {/* 1-Click Indian Bank Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Quick Indian Bank Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyBankPreset('hdfc')}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900 transition-colors"
                  >
                    🏦 HDFC Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBankPreset('sbi')}
                    className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-900 transition-colors"
                  >
                    🏛️ SBI
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBankPreset('icici')}
                    className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 text-orange-700 dark:text-orange-300 text-xs font-bold border border-orange-200 dark:border-orange-900 transition-colors"
                  >
                    💳 ICICI Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBankPreset('axis')}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900 transition-colors"
                  >
                    🏢 Axis Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBankPreset('kotak')}
                    className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-700 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-900 transition-colors"
                  >
                    ⚡ Kotak Mahindra
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBankPreset('upi')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-900 transition-colors"
                  >
                    📱 UPI / Paytm
                  </button>
                </div>
              </div>

              {/* Column Mapping Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Date Column
                  </label>
                  <select
                    value={dateCol}
                    onChange={e => setDateCol(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="">-- Select Date Header --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Description / Merchant <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={titleCol}
                    onChange={e => setTitleCol(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="">-- Select Title Header --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Amount / Debit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={amountCol}
                    onChange={e => setAmountCol(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="">-- Select Amount Header --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Category (Optional)
                  </label>
                  <select
                    value={categoryCol}
                    onChange={e => setCategoryCol(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="">-- Default: Miscellaneous --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live 3-Row Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Sample Record Preview (First 3 Rows)
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {previewRows.map((row, idx) => {
                    const titleIdx = headers.indexOf(titleCol);
                    const amountIdx = headers.indexOf(amountCol);
                    const dateIdx = headers.indexOf(dateCol);

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-xs border border-slate-200/50 dark:border-slate-800"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {titleIdx >= 0 ? row[titleIdx] : 'Title'}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {dateIdx >= 0 ? row[dateIdx] : 'Date'}
                          </span>
                        </div>
                        <span className="font-extrabold text-rose-600 dark:text-rose-400">
                          {amountIdx >= 0 ? row[amountIdx] : '0.00'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!titleCol || !amountCol}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5"
                >
                  <Check size={16} />
                  Import All {csvLines.length} Entries
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
