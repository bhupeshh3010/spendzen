import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  X,
  Smartphone,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Apple,
  Chrome
} from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose }) => {
  const localWifiUrl = 'http://192.168.1.5:5173/';
  const cloudUrl = 'https://spendzenh.netlify.app';
  const [connectionMode, setConnectionMode] = useState<'wifi' | 'cloud'>('cloud');
  const [appUrl, setAppUrl] = useState(cloudUrl);
  const [qrDataUrl, setQrDataUrl] = useState('/app-qr.png');
  const [hasCopied, setHasCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android'>('android');

  const handleSwitchMode = (mode: 'wifi' | 'cloud') => {
    setConnectionMode(mode);
    setAppUrl(mode === 'wifi' ? localWifiUrl : cloudUrl);
  };

  useEffect(() => {
    // If running in browser and has specific origin, prepare QR code
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        setAppUrl(origin + '/');
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(appUrl, {
      width: 420,
      margin: 2,
      color: {
        dark: '#1e1b4b', // Deep indigo
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch(() => {
        // Fallback to pre-generated asset
        if (isMounted) setQrDataUrl('/app-qr.png');
      });

    return () => {
      isMounted = false;
    };
  }, [appUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-transparent dark:from-indigo-950/20 dark:via-purple-950/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <QrCode size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                Scan to Run & Install App
              </h2>
              <p className="text-xs text-slate-500">Run SpendZen natively on your phone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 text-center">
          {/* Connection Mode Selector */}
          <div className="flex items-center justify-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-xs mx-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => handleSwitchMode('wifi')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                connectionMode === 'wifi'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              📶 Local Wi-Fi
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('cloud')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                connectionMode === 'cloud'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              ☁️ Cloud HTTPS (Online)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('wifi')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                connectionMode === 'wifi'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              📶 Local Wi-Fi
            </button>
          </div>

          {/* QR Code Container */}
          <div className="relative inline-block mx-auto p-3 bg-white rounded-2xl shadow-xl border-4 border-indigo-100 dark:border-slate-800 group">
            <img
              src={qrDataUrl}
              alt="Scan to run SpendZen app"
              className="w-52 h-52 object-contain rounded-xl"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md border-2 border-white">
                <Smartphone size={20} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <a
              href={qrDataUrl}
              download="spendzen-qr.png"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Download size={14} />
              <span>Download Permanent QR Code</span>
            </a>
          </div>

          {/* Connection note */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck size={13} />
              <span>
                {connectionMode === 'wifi'
                  ? 'Fast Direct Local Network (Same Wi-Fi)'
                  : 'Permanent Free Cloud (Global 24/7 HTTPS • No Computer Needed)'}
              </span>
            </div>

            {/* URL Display with Copy Button */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <input
                type="text"
                value={appUrl}
                onChange={e => setAppUrl(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 bg-transparent border-none focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shrink-0"
              >
                {hasCopied ? <Check size={13} /> : <Copy size={13} />}
                <span>{hasCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Platform Installation Guide Tabs */}
          <div className="text-left space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                How to Install as Phone App:
              </span>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setSelectedPlatform('android')}
                  className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
                    selectedPlatform === 'android'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  <Chrome size={12} /> Android
                </button>
                <button
                  onClick={() => setSelectedPlatform('ios')}
                  className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
                    selectedPlatform === 'ios'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  <Apple size={12} /> iOS
                </button>
              </div>
            </div>

            {selectedPlatform === 'android' ? (
              <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                <li>Scan QR code with your phone camera or Google Lens.</li>
                <li>Open link in <strong>Chrome</strong>.</li>
                <li>Tap the <strong>3 dots (⋮)</strong> in the top right.</li>
                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
              </ol>
            ) : (
              <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                <li>Scan QR code with iPhone camera & open link in <strong>Safari</strong>.</li>
                <li>Tap the <strong>Share</strong> button (box with upward arrow <span className="font-bold">⎋</span>).</li>
                <li>Scroll down & tap <strong>"Add to Home Screen"</strong>.</li>
                <li>Tap <strong>Add</strong> in the top right corner.</li>
              </ol>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-500" />
              100% Client-side Offline PWA
            </span>
            <a
              href={appUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Open in Browser <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
