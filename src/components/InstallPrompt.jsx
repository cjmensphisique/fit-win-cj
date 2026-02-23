import React, { useState, useEffect } from 'react';
import { Download, Share, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return; // Already installed, do nothing
    }

    // Handle standard Android/Desktop PWA prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Safari / iOS fallback (Doesn't support beforeinstallprompt)
    const isIOS = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase()) && !window.MSStream;
    if (isIOS && !isStandalone) {
      // Show iOS specific prompt if not dismissed previously
      const hasDismissed = localStorage.getItem('dismissedIOSPrompt');
      if (!hasDismissed) {
        setShowIOSPrompt(true);
        setIsVisible(true);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismissPrompt = () => {
    setIsVisible(false);
    if (showIOSPrompt) {
      localStorage.setItem('dismissedIOSPrompt', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-[#1f1f1f] border border-[#ffc105]/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-2xl p-4 flex gap-4 pr-12 relative overflow-hidden">
        
        {/* Glow element */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#ffc105] opacity-10 blur-2xl rounded-full pointer-events-none" />

        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffc105] to-[#f59e0b] shadow-lg flex items-center justify-center shrink-0">
          <Download className="w-6 h-6 text-black" />
        </div>

        <div className="flex-1">
          <h3 className="text-white font-bold text-sm mb-1">Install CJ Fitness</h3>
          
          {showIOSPrompt ? (
            <p className="text-xs text-[#aaa] leading-relaxed">
              Install this app on your iPhone: tap <Share className="w-3 h-3 inline mb-0.5" /> and then <strong>Add to Home Screen</strong>.
            </p>
          ) : (
            <>
              <p className="text-xs text-[#aaa] leading-relaxed mb-3">
                Install our app for a faster, fullscreen experience and offline access!
              </p>
              <button 
                onClick={handleInstallClick}
                className="bg-[#ffc105] hover:bg-[#eab308] text-black text-xs font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-colors w-full"
              >
                Install App
              </button>
            </>
          )}
        </div>

        <button 
          onClick={dismissPrompt}
          className="absolute top-2 right-2 p-2 text-[#666] hover:text-white transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
