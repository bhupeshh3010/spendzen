import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import {
  Calculator,
  X,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface TaxEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaxEstimatorModal: React.FC<TaxEstimatorModalProps> = ({ isOpen, onClose }) => {
  const { currency } = useExpense();

  // User financial inputs (Annual in INR)
  const [grossSalary, setGrossSalary] = useState<number>(1200000);
  const [deduction80C, setDeduction80C] = useState<number>(150000);
  const [deduction80D, setDeduction80D] = useState<number>(25000);
  const [hraExemption, setHraExemption] = useState<number>(120000);
  const [nps80CCD, setNps80CCD] = useState<number>(50000);
  const [homeLoanInterest, setHomeLoanInterest] = useState<number>(0);

  if (!isOpen) return null;

  // Presets for fast testing
  const presets = [
    { label: '₹7.5 Lakhs (Tax-Free zone)', value: 750000 },
    { label: '₹12 Lakhs (Mid-level)', value: 1200000 },
    { label: '₹18 Lakhs (Senior)', value: 1800000 },
    { label: '₹25 Lakhs (Executive)', value: 2500000 }
  ];

  // Calculate New Regime Tax (FY 2024-25 / FY 2025-26 Budget Slabs)
  const calculateNewRegime = (gross: number) => {
    const stdDeduction = 75000;
    const taxable = Math.max(0, gross - stdDeduction);

    // Section 87A rebate for taxable income up to 7,00,000
    if (taxable <= 700000) {
      return { taxable, baseTax: 0, cess: 0, totalTax: 0, rebate: true };
    }

    let tax = 0;
    // Slabs:
    // 0 - 3L: 0
    // 3L - 7L: 5% (max 20,000)
    // 7L - 10L: 10% (max 30,000)
    // 10L - 12L: 15% (max 30,000)
    // 12L - 15L: 20% (max 60,000)
    // > 15L: 30%
    if (taxable > 300000) {
      tax += Math.min(taxable - 300000, 400000) * 0.05;
    }
    if (taxable > 700000) {
      tax += Math.min(taxable - 700000, 300000) * 0.10;
    }
    if (taxable > 1000000) {
      tax += Math.min(taxable - 1000000, 200000) * 0.15;
    }
    if (taxable > 1200000) {
      tax += Math.min(taxable - 1200000, 300000) * 0.20;
    }
    if (taxable > 1500000) {
      tax += (taxable - 1500000) * 0.30;
    }

    const cess = Math.round(tax * 0.04);
    const totalTax = Math.round(tax + cess);

    return { taxable, baseTax: tax, cess, totalTax, rebate: false };
  };

  // Calculate Old Regime Tax
  const calculateOldRegime = (
    gross: number,
    d80C: number,
    d80D: number,
    hra: number,
    nps: number,
    homeLoan: number
  ) => {
    const stdDeduction = 50000;
    const capped80C = Math.min(150000, d80C);
    const capped80D = Math.min(75000, d80D);
    const cappedNps = Math.min(50000, nps);
    const cappedHomeLoan = Math.min(200000, homeLoan);

    const totalDeductions = stdDeduction + capped80C + capped80D + hra + cappedNps + cappedHomeLoan;
    const taxable = Math.max(0, gross - totalDeductions);

    // Section 87A rebate for taxable income up to 5,00,000
    if (taxable <= 500000) {
      return { taxable, baseTax: 0, cess: 0, totalTax: 0, totalDeductions, rebate: true };
    }

    let tax = 0;
    // Slabs:
    // 0 - 2.5L: 0
    // 2.5L - 5L: 5% (max 12,500)
    // 5L - 10L: 20% (max 1,00,000)
    // > 10L: 30%
    if (taxable > 250000) {
      tax += Math.min(taxable - 250000, 250000) * 0.05;
    }
    if (taxable > 500000) {
      tax += Math.min(taxable - 500000, 500000) * 0.20;
    }
    if (taxable > 1000000) {
      tax += (taxable - 1000000) * 0.30;
    }

    const cess = Math.round(tax * 0.04);
    const totalTax = Math.round(tax + cess);

    return { taxable, baseTax: tax, cess, totalTax, totalDeductions, rebate: false };
  };

  const newResult = calculateNewRegime(grossSalary);
  const oldResult = calculateOldRegime(
    grossSalary,
    deduction80C,
    deduction80D,
    hraExemption,
    nps80CCD,
    homeLoanInterest
  );

  const diff = Math.abs(newResult.totalTax - oldResult.totalTax);
  const isNewBetter = newResult.totalTax <= oldResult.totalTax;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-transparent dark:from-emerald-950/20 dark:via-teal-950/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                Indian Tax Regime & Savings Estimator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                FY 2024–25 & 2025–26: New Regime vs Old Regime Comparison
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Winner Recommendation Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              isNewBetter
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100'
                : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                  isNewBetter ? 'bg-emerald-600' : 'bg-indigo-600'
                }`}
              >
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block opacity-80">
                  Recommended Choice
                </span>
                <p className="text-sm font-black">
                  {isNewBetter
                    ? `New Tax Regime saves you ${formatCurrency(diff, currency)} / year!`
                    : `Old Tax Regime saves you ${formatCurrency(diff, currency)} / year with your deductions!`}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Quick Salary Presets:</span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setGrossSalary(p.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    grossSalary === p.value
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            {/* Gross Salary Input */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-200 block mb-1">
                Annual Gross CTC / Total Income
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {currency.symbol}
                </span>
                <input
                  type="number"
                  step="10000"
                  value={grossSalary}
                  onChange={e => setGrossSalary(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Deductions grid for Old Regime */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                Deductions & Exemptions (Used for Old Regime):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Section 80C (PPF/ELSS/EPF - Max ₹1.5L)</label>
                  <input
                    type="number"
                    value={deduction80C}
                    onChange={e => setDeduction80C(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500">HRA Exemption (House Rent Allowance)</label>
                  <input
                    type="number"
                    value={hraExemption}
                    onChange={e => setHraExemption(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500">Section 80D (Health Insurance - Up to ₹75k)</label>
                  <input
                    type="number"
                    value={deduction80D}
                    onChange={e => setDeduction80D(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500">Section 80CCD(1B) (NPS - Max ₹50k)</label>
                  <input
                    type="number"
                    value={nps80CCD}
                    onChange={e => setNps80CCD(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500">Section 24(b) (Home Loan Interest - Max ₹2 Lakhs)</label>
                  <input
                    type="number"
                    value={homeLoanInterest}
                    onChange={e => setHomeLoanInterest(parseFloat(e.target.value) || 0)}
                    placeholder="Enter interest paid on home loan"
                    className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Regime Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isNewBetter
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">
                  New Tax Regime
                </span>
                {isNewBetter && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-600 text-white">
                    Recommended
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Standard Deduction:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">₹75,000</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxable Income:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(newResult.taxable, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Base Tax:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(newResult.baseTax, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Cess (4%):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(newResult.cess, currency)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">Total Tax:</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(newResult.totalTax, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Old Regime Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                !isNewBetter
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">
                  Old Tax Regime
                </span>
                {!isNewBetter && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-600 text-white">
                    Recommended
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Total Deductions:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(oldResult.totalDeductions, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxable Income:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(oldResult.taxable, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Base Tax:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(oldResult.baseTax, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Cess (4%):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(oldResult.cess, currency)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">Total Tax:</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(oldResult.totalTax, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Based on official Union Budget rates</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
