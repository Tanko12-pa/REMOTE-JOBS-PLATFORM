import React, { useState, useEffect } from 'react';
import { Download, Wifi, WifiOff, CheckCircle2, Shield, X, Smartphone, HardDrive } from 'lucide-react';
import { isPWAInstallable, triggerPWAInstall, subscribePWAState } from '../utils/pwaRegister';

export const PWABanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [canInstall, setCanInstall] = useState<boolean>(isPWAInstallable());
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [installSuccessToast, setInstallSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = subscribePWAState(() => {
      setCanInstall(isPWAInstallable());
    });

    // Check standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleInstallClick = async () => {
    const accepted = await triggerPWAInstall();
    if (accepted) {
      setInstallSuccessToast('PWA App Installed Successfully! Access offline anytime from your home screen.');
      setIsInstalled(true);
      setTimeout(() => setInstallSuccessToast(null), 5000);
    }
  };

  if (isDismissed && isOnline) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-[#064E3B] via-emerald-900 to-[#064E3B] border-b border-emerald-500/40 text-white px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Left Status Text */}
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 font-bold ${
              isOnline ? 'bg-amber-400 text-emerald-950' : 'bg-rose-500 text-white animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </div>

          <div>
            <div className="flex items-center gap-2 font-black text-amber-300">
              <span>{isOnline ? 'PWA Service Worker Active & Offline-Ready' : 'You Are Currently Offline'}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                Cache v1 Active
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/90 mt-0.5">
              {isOnline
                ? 'All 150+ platform listings, saved jobs, resumes, and tracking logs are cached for offline access.'
                : 'Offline Mode Enabled — Accessing pre-cached job listings, saved platforms, and offline tools seamlessly.'}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {installSuccessToast && (
            <span className="text-amber-300 font-bold text-[11px] flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              {installSuccessToast}
            </span>
          )}

          {canInstall && !isInstalled && (
            <button
              onClick={handleInstallClick}
              id="pwa-install-app-btn"
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 cursor-pointer"
            >
              <Smartphone className="w-3 h-3 text-emerald-950" />
              Install PWA App
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/20 text-emerald-200 text-[11px] font-bold border border-white/10">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span>Saved Offline Storage</span>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss PWA status message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
