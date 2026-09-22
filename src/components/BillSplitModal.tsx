import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import {
  Users,
  Copy,
  Check,
  X,
  Receipt,
  QrCode,
  MessageSquare
} from 'lucide-react';

interface BillSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillSplitModal: React.FC<BillSplitModalProps> = ({ isOpen, onClose }) => {
  const { currency, addTransaction, addBillSplit, showToast } = useExpense();

  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [participants, setParticipants] = useState<string[]>(['You', 'Roommate / Friend']);
  const [newParticipant, setNewParticipant] = useState('');
  const [upiId, setUpiId] = useState('bhupesh@okhdfcbank');
  const [hasCopied, setHasCopied] = useState(false);
  const [upiQrUrl, setUpiQrUrl] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  const numTotal = parseFloat(totalAmount) || 0;
  const splitCount = Math.max(1, participants.length);
  const equalShare = numTotal > 0 ? numTotal / splitCount : 0;

  const upiLink = upiId.trim()
    ? `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=SpendZen&am=${equalShare.toFixed(2)}&cu=INR&tn=${encodeURIComponent(title || 'Split Bill')}`
    : '';

  useEffect(() => {
    if (upiLink && equalShare > 0) {
      QRCode.toDataURL(upiLink, { width: 300, margin: 2, color: { dark: '#1e1b4b', light: '#ffffff' } })
        .then(url => setUpiQrUrl(url))
        .catch(err => console.error(err));
    } else {
      setUpiQrUrl(null);
    }
  }, [upiLink, equalShare]);

  if (!isOpen) return null;

  const handleAddParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const handleRemoveParticipant = (name: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter(p => p !== name));
    }
  };

  const generateSummaryText = () => {
    const lines = [
      `💸 Bill Split: "${title || 'Shared Expense'}"`,
      `Total Bill: ${formatCurrency(numTotal, currency)}`,
      `Split ${splitCount} ways: ${formatCurrency(equalShare, currency)} each`,
      `Participants: ${participants.join(', ')}`,
      ...(upiId.trim()
        ? [
            ``,
            `📲 Pay your share via UPI (GPay / PhonePe / Paytm):`,
            `UPI ID: ${upiId.trim()}`,
            `Payment Link: ${upiLink}`
          ]
        : []),
      ``,
      `Master your money in peace with SpendZen`
    ];
    return lines.join('\n');
  };

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(generateSummaryText());
    setHasCopied(true);
    showToast('Copied to Clipboard', 'Ready to paste in chat or messages', 'success');
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateSummaryText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleLogYourShare = () => {
    if (equalShare <= 0 || !title.trim()) return;

    addTransaction({
      title: `${title.trim()} (My Share)`,
      amount: equalShare,
      type: 'expense',
      categoryId: 'cat_dining',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'upi',
      notes: `Split bill with ${participants.filter(p => p !== 'You').join(', ')}`
    });

    addBillSplit({
      title: title.trim(),
      totalAmount: numTotal,
      date: new Date().toISOString().split('T')[0],
      paidBy: 'You',
      upiId: upiId.trim() || undefined,
      participants: participants.map(name => ({
        name,
        share: equalShare,
        hasPaid: name === 'You'
      })),
      yourShare: equalShare
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Bill & Roommate Splitter
              </h2>
              <p className="text-xs text-slate-500">Split rent, dining, or trips & copy shareable memos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Bill / Expense Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dinner at Nobu, Apartment Wi-Fi"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Total Bill ({currency.symbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Your UPI Handle for Receiving Split */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Your UPI ID / VPA (For friends to pay you directly)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. yourname@okhdfcbank, 9876543210@paytm"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              />
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">@okhdfcbank</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">@paytm</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">@ybl</span>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Participants ({participants.length})
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add friend's name..."
                value={newParticipant}
                onChange={e => setNewParticipant(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold"
              >
                Add Person
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {participants.map(p => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-900"
                >
                  {p}
                  {p !== 'You' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(p)}
                      className="hover:text-rose-500 ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Calculation Display */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 block">
                Each Person Pays
              </span>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {formatCurrency(equalShare, currency)}
              </p>
              <span className="text-[11px] text-slate-500">
                Split evenly across {splitCount} people
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                title="Share split breakdown on WhatsApp"
              >
                <MessageSquare size={14} />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                disabled={!upiQrUrl}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors shadow-xs ${
                  showQr
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500'
                }`}
                title="Show Instant UPI QR Code"
              >
                <QrCode size={14} />
                <span>UPI QR</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMemo}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
              >
                {hasCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{hasCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Dynamic UPI QR Code Section */}
          {showQr && upiQrUrl && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 shadow-sm text-center space-y-2 animate-fade-in">
              <span className="text-xs font-extrabold text-slate-800 dark:text-white block">
                Scan with Google Pay, PhonePe, or Paytm
              </span>
              <img
                src={upiQrUrl}
                alt="UPI Pay QR"
                className="w-44 h-44 mx-auto object-contain rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-white"
              />
              <p className="text-[11px] font-mono text-slate-500">
                Amount: <strong>{formatCurrency(equalShare, currency)}</strong> • VPA: {upiId}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleLogYourShare}
              disabled={equalShare <= 0 || !title.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <Receipt size={14} />
              Log My Share ({formatCurrency(equalShare, currency)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
