import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { MONTH_NAMES, getIndianFinancialYear } from '../utils/formatters';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, Clock, Filter, Sparkles, Building2 } from 'lucide-react';
import { TimeframeMode } from '../types';

export const PeriodSelector: React.FC = () => {
  const { dateFilter, setDateFilter } = useExpense();

  const now = new Date();
  const currentRealYear = now.getFullYear();
  const currentRealMonth = now.getMonth();

  const handleModeChange = (mode: TimeframeMode) => {
    setDateFilter(prev => ({
      ...prev,
      mode
    }));
  };

  const handlePrev = () => {
    setDateFilter(prev => {
      if (prev.mode === 'monthly') {
        if (prev.month === 0) {
          return { ...prev, year: prev.year - 1, month: 11 };
        }
        return { ...prev, month: prev.month - 1 };
      }
      if (prev.mode === 'yearly') {
        return { ...prev, year: prev.year - 1 };
      }
      return prev;
    });
  };

  const handleNext = () => {
    setDateFilter(prev => {
      if (prev.mode === 'monthly') {
        if (prev.month === 11) {
          return { ...prev, year: prev.year + 1, month: 0 };
        }
        return { ...prev, month: prev.month + 1 };
      }
      if (prev.mode === 'yearly') {
        return { ...prev, year: prev.year + 1 };
      }
      return prev;
    });
  };

  // Instant 1-click presets
  const setThisMonth = () => {
    setDateFilter({
      mode: 'monthly',
      year: currentRealYear,
      month: currentRealMonth
    });
  };

  const setLastMonth = () => {
    if (currentRealMonth === 0) {
      setDateFilter({
        mode: 'monthly',
        year: currentRealYear - 1,
        month: 11
      });
    } else {
      setDateFilter({
        mode: 'monthly',
        year: currentRealYear,
        month: currentRealMonth - 1
      });
    }
  };

  const setThisYear = () => {
    setDateFilter(prev => ({
      ...prev,
      mode: 'yearly',
      year: currentRealYear
    }));
  };

  const currentIndianFY = getIndianFinancialYear();
  const setThisFY = () => {
    setDateFilter(prev => ({
      ...prev,
      mode: 'financial_year',
      financialYear: currentIndianFY
    }));
  };

  const isThisMonth = dateFilter.mode === 'monthly' && dateFilter.year === currentRealYear && dateFilter.month === currentRealMonth;
  const isLastMonth = dateFilter.mode === 'monthly' && (
    (currentRealMonth === 0 && dateFilter.year === currentRealYear - 1 && dateFilter.month === 11) ||
    (dateFilter.year === currentRealYear && dateFilter.month === currentRealMonth - 1)
  );
  const isThisYear = dateFilter.mode === 'yearly' && dateFilter.year === currentRealYear;
  const isThisFY = dateFilter.mode === 'financial_year' && dateFilter.financialYear === currentIndianFY;

  const yearOptions = Array.from({ length: 7 }, (_, i) => currentRealYear - 3 + i);

  return (
    <div className="flex flex-col gap-3 p-3.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      {/* Top Row: Quick Presets + Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Instant 1-Click Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-500" />
            Quick:
          </span>
          <button
            onClick={setThisMonth}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              isThisMonth
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            This Month
          </button>
          <button
            onClick={setLastMonth}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              isLastMonth
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={setThisFY}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              isThisFY
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            FY {currentIndianFY}
          </button>
          <button
            onClick={setThisYear}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              isThisYear
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Year {currentRealYear}
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl shrink-0">
          <button
            onClick={() => handleModeChange('monthly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              dateFilter.mode === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar size={13} />
            Monthly
          </button>

          <button
            onClick={setThisFY}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              dateFilter.mode === 'financial_year'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building2 size={13} />
            Indian FY
          </button>

          <button
            onClick={() => handleModeChange('yearly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              dateFilter.mode === 'yearly'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CalendarDays size={13} />
            Yearly
          </button>

          <button
            onClick={() => handleModeChange('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              dateFilter.mode === 'all'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock size={13} />
            All Time
          </button>

          <button
            onClick={() => handleModeChange('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              dateFilter.mode === 'custom'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Filter size={13} />
            Custom
          </button>
        </div>
      </div>

      {/* Bottom Row: Detailed Date Navigator Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {dateFilter.mode === 'monthly'
            ? `Browsing Month: ${MONTH_NAMES[dateFilter.month]} ${dateFilter.year}`
            : dateFilter.mode === 'financial_year'
            ? `Browsing Indian Financial Year: FY ${dateFilter.financialYear || currentIndianFY} (1 Apr - 31 Mar)`
            : dateFilter.mode === 'yearly'
            ? `Browsing Full Calendar Year: ${dateFilter.year}`
            : dateFilter.mode === 'custom'
            ? 'Browsing Custom Date Range'
            : 'Viewing All History'}
        </span>

        <div className="flex items-center gap-2">
          {dateFilter.mode === 'monthly' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                title="Previous Month"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5">
                <select
                  value={dateFilter.month}
                  onChange={e => setDateFilter(prev => ({ ...prev, month: Number(e.target.value) }))}
                  className="bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  value={dateFilter.year}
                  onChange={e => setDateFilter(prev => ({ ...prev, year: Number(e.target.value) }))}
                  className="bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNext}
                title="Next Month"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {dateFilter.mode === 'yearly' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                title="Previous Year"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <select
                value={dateFilter.year}
                onChange={e => setDateFilter(prev => ({ ...prev, year: Number(e.target.value) }))}
                className="bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold text-slate-800 dark:text-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNext}
                title="Next Year"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {dateFilter.mode === 'financial_year' && (
            <div className="flex items-center gap-2">
              <select
                value={dateFilter.financialYear || currentIndianFY}
                onChange={e => setDateFilter(prev => ({ ...prev, financialYear: e.target.value }))}
                className="bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold text-slate-800 dark:text-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const y = currentRealYear - 2 + i;
                  const fy = `${y}-${String((y + 1) % 100).padStart(2, '0')}`;
                  return (
                    <option key={fy} value={fy}>
                      FY {fy} (1 Apr {y} - 31 Mar {y + 1})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {dateFilter.mode === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFilter.startDate || ''}
                onChange={e => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={dateFilter.endDate || ''}
                onChange={e => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
