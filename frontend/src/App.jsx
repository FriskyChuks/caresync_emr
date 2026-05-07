import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import LoadingOverlay from "./components/LoadingOverlay";
import { MessageProvider } from "./context/MessageProvider";
import { AuthProvider } from "./context/AuthProvider";
import Login from "./pages/accounts/Login";
import Register from "./pages/accounts/Register";
import ChangePassword from "./pages/accounts/ChangePassword";
import ResetPassword from "./pages/accounts/ResetPassword";
import AppRoute from "./routes/AppRoute";
import PageNotFound from "./pages/PageNotFound";
import LandingPage from "./pages/landing/LandingPage";
import AppLayout from "./layouts/AppLayout";
import PWAInstaller from "./components/PWAInstaller";
import { initPWA, pwa } from "./utils/pwa";
import React from "react";

// Error Boundary for Bootstrap components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-elevated p-8 max-w-md border border-gray-200/50">
            <div className="text-center">
              <div className="h-20 w-20 bg-gradient-to-br from-danger-100 to-danger-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Component Error</h2>
              <p className="text-gray-600 mb-6">
                There was an error loading this component. Please try refreshing the page.
              </p>
              <div className="bg-gray-50/50 rounded-xl p-4 text-left mb-6 border border-gray-200/30">
                <code className="text-sm text-danger-600 font-mono">
                  {this.state.error?.toString()}
                </code>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  useEffect(() => {
    // Initialize PWA features after mount
    const initializePWA = async () => {
      await initPWA();
      
      // Set up periodic update checks (every 4 hours instead of 1)
      const updateInterval = setInterval(() => {
        if (pwa.isOnline()) {
          pwa.checkForUpdates();
        }
      }, 4 * 60 * 60 * 1000);
      
      return () => clearInterval(updateInterval);
    };

    initializePWA();

    // Add PWA detection class to body
    if (pwa.isInstalled()) {
      document.body.classList.add('pwa-installed');
    }
    
    // Add online/offline classes
    const updateConnectionStatus = () => {
      if (pwa.isOnline()) {
        document.documentElement.classList.remove('offline');
        document.documentElement.classList.add('online');
      } else {
        document.documentElement.classList.remove('online');
        document.documentElement.classList.add('offline');
      }
    };

    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    updateConnectionStatus();

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, []);

  return (
    <ErrorBoundary>
      <MessageProvider>
        <AuthProvider>
          <BrowserRouter>
            <LoadingOverlay />
            <PWAInstaller />
            
            <Routes>
              {/* LANDING PAGE */}
              <Route path="/" element={<LandingPage />} />

              {/* PUBLIC AUTH ROUTES */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/change-password" element={<ChangePassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />

              {/* PROTECTED MAIN APP */}
              <Route path="/*" element={
                <ErrorBoundary>
                  <AppLayout />
                </ErrorBoundary>
              }>
                <Route path="*" element={<AppRoute />} />
              </Route>

              {/* NOT FOUND */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </MessageProvider>
    </ErrorBoundary>
  );
}

export default App;