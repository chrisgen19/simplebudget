'use client';

import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }

    // Check if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      return; // Don't show prompt if already installed
    }

    // Check localStorage for last dismiss time
    const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000; // 2 days

    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed);
      const now = Date.now();

      if (now - dismissedTime < twoDaysInMs) {
        return; // Don't show if dismissed within last 2 days
      }
    }

    // Listen for beforeinstallprompt event (Chrome, Edge)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show manual prompt after a delay
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS && !isStandalone) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-sm mb-1">
              Install Budget Tracker
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              {isIOS
                ? "Tap the share button and select 'Add to Home Screen' to install."
                : "Install our app for a better experience with offline access!"}
            </p>

            <div className="flex gap-2">
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
                >
                  Install Now
                </button>
              )}
              <button
                onClick={handleClose}
                className="text-xs font-medium text-slate-500 py-2 px-4 rounded-lg hover:bg-slate-100 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
