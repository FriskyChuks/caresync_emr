// src/utils/pwa.js
// Complete PWA utilities for CareSync EMR

// Flag to track if update notification has been shown
let updateNotificationShown = false;
let deferredInstallPrompt = null;

export const pwa = {
  // Check if app is installed
  isInstalled: () => window.matchMedia('(display-mode: standalone)').matches || 
                  window.navigator.standalone || 
                  document.referrer.includes('android-app://'),

  // Check if online
  isOnline: () => navigator.onLine,

  // Register service worker
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker: Not supported');
      return null;
    }

    // Wait for page to fully load before registering
    if (document.readyState === 'loading') {
      await new Promise(resolve => window.addEventListener('load', resolve));
    }

    try {
      console.log('Service Worker: Attempting to register from /service-worker.js');
      
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('Service Worker: Registered successfully with scope:', registration.scope);
      
      // Reset notification flag on new registration
      updateNotificationShown = false;
      
      // Check if there's a waiting service worker (update ready)
      if (registration.waiting) {
        console.log('Service Worker: Update waiting');
        if (!updateNotificationShown) {
          updateNotificationShown = true;
          this.notifyUpdateReady();
        }
      }
      
      // Listen for new service workers
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('Service Worker: Update found, installing...');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available - show notification only once
              if (!updateNotificationShown) {
                updateNotificationShown = true;
                console.log('Service Worker: Update installed, showing notification');
                this.notifyUpdateReady();
              }
            } else {
              console.log('Service Worker: First time install');
            }
          }
        });
      });
      
      // Listen for controller changes (when service worker takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker: Controller changed, reloading page');
        // Optional: Auto-reload after service worker takes over
        // window.location.reload();
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker: Registration failed:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name
      });
      return null;
    }
  },

  // Notify user of update (shows only once)
  notifyUpdateReady() {
    // Check if notification already exists in DOM
    if (document.querySelector('.pwa-update-notification')) {
      return;
    }
    
    // Dispatch custom event for React components to listen to
    window.dispatchEvent(new CustomEvent('pwaUpdateAvailable'));
    
    // Create and show toast notification
    const updateToast = document.createElement('div');
    updateToast.className = 'pwa-update-notification fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-3 cursor-pointer animate-slide-up';
    updateToast.style.zIndex = '9999';
    updateToast.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      <span class="text-sm font-medium">New version available! Click to update.</span>
    `;
    
    updateToast.onclick = () => {
      // Force update by skipping waiting and reloading
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      }
      window.location.reload();
    };
    
    document.body.appendChild(updateToast);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (updateToast.parentNode) {
        updateToast.remove();
      }
    }, 10000);
  },

  // Unregister all service workers (useful for development)
  async unregisterServiceWorkers() {
    if (!('serviceWorker' in navigator)) return;
    
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('Service Worker: Unregistered');
    }
  },

  // Check for updates
  async checkForUpdates() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('Service Worker: Update check completed');
      }
    }
  },

  // Setup install prompt
  async setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      console.log('Install prompt available');
      window.dispatchEvent(new CustomEvent('installPromptAvailable', { detail: deferredInstallPrompt }));
    });
    
    return () => deferredInstallPrompt;
  },

  // Show install prompt
  async showInstallPrompt(deferredPrompt) {
    if (!deferredPrompt) return false;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted install prompt');
      deferredInstallPrompt = null;
      return true;
    } else {
      console.log('User dismissed install prompt');
      return false;
    }
  },

  // Setup offline support
  setupOfflineSupport() {
    const updateOnlineStatus = () => {
      const isOnline = this.isOnline();
      document.documentElement.setAttribute('data-connection', isOnline ? 'online' : 'offline');
      this.showOfflineIndicator(!isOnline);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  },

  // Show offline indicator
  showOfflineIndicator(show) {
    let indicator = document.getElementById('offline-indicator');
    
    if (show && !indicator) {
      indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.className = 'fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50 animate-slide-down';
      indicator.style.zIndex = '9999';
      indicator.innerHTML = `
        <div class="flex items-center justify-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728"></path>
          </svg>
          <span class="font-medium">You are offline. Some features may be limited.</span>
        </div>
      `;
      document.body.appendChild(indicator);
    } else if (!show && indicator) {
      indicator.remove();
    }
  },

  // Setup background sync
  async setupBackgroundSync() {
    if (!('serviceWorker' in navigator) || !('sync' in navigator.serviceWorker)) {
      console.log('Background sync not supported');
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-patient-data');
      console.log('Background sync registered successfully');
    } catch (err) {
      console.error('Background sync registration failed:', err);
    }
  },

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      console.log('Notification permission already granted');
      return true;
    }
    
    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted');
          return true;
        } else {
          console.log('Notification permission denied');
          return false;
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    
    return false;
  },

  // Send notification
  async sendNotification(title, options = {}) {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          icon: '/caresync_logo.PNG',
          badge: '/badge-72x72.png',
          vibrate: [100, 50, 100],
          ...options
        });
        return true;
      } catch (error) {
        console.error('Error sending notification:', error);
        return false;
      }
    }
    
    return false;
  }
};

// Auto-initialize PWA features (only once)
let initialized = false;

export const initPWA = async () => {
  if (initialized) return;
  initialized = true;
  
  // Wait for page load
  if (document.readyState === 'loading') {
    await new Promise(resolve => window.addEventListener('load', resolve));
  }
  
  // Small delay to ensure DOM is ready
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Register service worker
  await pwa.registerServiceWorker();
  
  // Setup offline support
  pwa.setupOfflineSupport();
  
  // Setup install prompt
  pwa.setupInstallPrompt();
  
  // Setup background sync (only if online)
  if (pwa.isOnline()) {
    await pwa.setupBackgroundSync();
  }
  
  // Only request notification permission after user interaction
  let notificationRequested = false;
  const handleUserInteraction = async () => {
    if (!notificationRequested && Notification.permission === 'default') {
      notificationRequested = true;
      await pwa.requestNotificationPermission();
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    }
  };
  
  window.addEventListener('click', handleUserInteraction);
  window.addEventListener('touchstart', handleUserInteraction);
  
  // Set up periodic update checks (every 4 hours)
  const updateInterval = setInterval(() => {
    if (pwa.isOnline()) {
      pwa.checkForUpdates();
    }
  }, 4 * 60 * 60 * 1000);
  
  // Clean up interval on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(updateInterval);
  });
};

// Export individual methods for convenience
export const {
  isInstalled,
  isOnline,
  unregisterServiceWorkers,
  checkForUpdates,
  setupInstallPrompt,
  showInstallPrompt,
  setupOfflineSupport,
  setupBackgroundSync,
  requestNotificationPermission,
  sendNotification
} = pwa;