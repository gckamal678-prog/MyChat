import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900 border border-slate-700 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between z-50 animate-bounce">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 p-2.5 rounded-xl">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">Install MyChat PWA</h4>
          <p className="text-xs text-slate-400">Add to home screen for fast access & offline mode.</p>
        </div>
      </div>
      <button
        onClick={handleInstallClick}
        className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold px-4 py-2 rounded-xl transition"
      >
        Install
      </button>
    </div>
  );
}
