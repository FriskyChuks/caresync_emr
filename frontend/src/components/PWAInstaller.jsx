import React, { useState, useEffect } from 'react';
import { Download, Wifi, WifiOff, X } from 'lucide-react';
import { pwa } from '../utils/pwa';

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check installation status
    setIsInstalled(pwa.isInstalled());
    
    // Check online status
    setIsOnline(pwa.isOnline());
    
    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for install prompt from pwa.js
    const handleInstallPrompt = (e) => {
      setDeferredPrompt(e.detail);
      setShowInstallPrompt(true);
    };
    
    // Listen for update available
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };
    
    window.addEventListener('installPromptAvailable', handleInstallPrompt);
    window.addEventListener('pwaUpdateAvailable', handleUpdateAvailable);
    
    // Check if already installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    });
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('installPromptAvailable', handleInstallPrompt);
      window.removeEventListener('pwaUpdateAvailable', handleUpdateAvailable);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    const installed = await pwa.showInstallPrompt(deferredPrompt);
    
    if (installed) {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleCancel = () => {
    setShowInstallPrompt(false);
  };

  const handleUpdate = () => {
    window.location.reload();
  };

  const handleDismissUpdate = () => {
    setUpdateAvailable(false);
  };

  if (isInstalled && !updateAvailable) return null;

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm z-50 animate-slide-up">
          <div className="flex items-start space-x-3">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Install CareSync</h3>
              <p className="text-sm text-gray-600 mt-1">
                Install CareSync EMR on your device for faster access and offline functionality.
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Install App
                </button>
                <button
                  onClick={handleCancel}
                  className="py-2 px-4 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Available Notification */}
      {updateAvailable && !showInstallPrompt && (
        <div className="fixed bottom-4 right-4 bg-primary-600 text-white rounded-lg shadow-xl p-4 max-w-sm z-50 animate-slide-up">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Update Available</h3>
                <p className="text-sm text-white/90 mt-1">
                  A new version of CareSync is ready. Update to get the latest features.
                </p>
                <button
                  onClick={handleUpdate}
                  className="mt-3 bg-white text-primary-600 py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Update Now
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissUpdate}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 px-4 z-50 flex items-center justify-center space-x-2 animate-slide-down">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You are offline. Working in limited mode.</span>
        </div>
      )}

      {/* Online Status (subtle indicator) */}
      {isOnline && !isInstalled && !updateAvailable && (
        <div className="fixed top-16 right-4 bg-green-500 text-white text-xs py-1 px-2 rounded-lg shadow-lg z-40 flex items-center space-x-1 opacity-75">
          <Wifi className="h-3 w-3" />
          <span>Online</span>
        </div>
      )}
    </>
  );
};

export default PWAInstaller;