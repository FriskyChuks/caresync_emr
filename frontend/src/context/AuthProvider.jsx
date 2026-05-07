import React, { createContext, useState, useEffect, useCallback } from "react";
import axiosInstance, { setupAxiosInterceptors } from "../api/axiosInstance";
import axios from "axios";
import { useIdleTimer, DEFAULT_IDLE_TIME, WARN_BEFORE } from "../hooks/useIdleTimer";
import { AlertCircle, LogOut, Shield, Clock, CheckCircle } from "lucide-react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const setTokens = (access, refresh) => {
    if (access) localStorage.setItem("access_token", access);
    if (refresh) localStorage.setItem("refresh_token", refresh);
  };

  const clearAuth = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const logout = useCallback(() => {
    clearAuth();
    window.location.assign("/auth/login");
  }, []);

  const tryRefreshAccessToken = useCallback(async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) return null;

    try {
      const resp = await axios.post(
        `${axiosInstance.defaults.baseURL}/auth/jwt/refresh/`,
        { refresh },
        { headers: { "Content-Type": "application/json" } }
      );
      const newAccess = resp.data?.access;
      if (newAccess) {
        localStorage.setItem("access_token", newAccess);
        return newAccess;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/auth/users/me/");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      return true;
    } catch (err) {
      if (err?.response?.status === 401) {
        const refreshed = await tryRefreshAccessToken();
        if (refreshed) {
          try {
            const res2 = await axiosInstance.get("/auth/users/me/");
            setUser(res2.data);
            localStorage.setItem("user", JSON.stringify(res2.data));
            return true;
          } catch {}
        }
      }
      return false;
    }
  }, [tryRefreshAccessToken]);

  const login = useCallback(
    async ({ username, password }) => {
      setLoading(true);
      try {
        const res = await axiosInstance.post("/auth/jwt/create/", { username, password });
        const { access, refresh, must_change_password } = res.data || {};
        setTokens(access, refresh);

        const ok = await fetchUser();
        if (ok) {
          return {
            success: true,
            user: JSON.parse(localStorage.getItem("user")),
            must_change_password: !!must_change_password,
          };
        }

        clearAuth();
        return { success: false, error: { detail: "Unable to load user profile." } };
      } catch (error) {
        return {
          success: false,
          error: error?.response?.data || { detail: "Login failed" },
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchUser]
  );

  useEffect(() => {
    setupAxiosInterceptors(logout, tryRefreshAccessToken);
  }, [logout, tryRefreshAccessToken]);

  const { isWarning, remaining, resetTimer } = useIdleTimer({
    onIdle: () => logout(),
    idleTime: DEFAULT_IDLE_TIME,
    warnBefore: WARN_BEFORE,
  });

  const handleStaySignedIn = async () => {
    await tryRefreshAccessToken();
    resetTimer();
  };

  useEffect(() => {
    (async () => {
      const access = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");
      if (!access && !refresh) {
        setLoading(false);
        return;
      }
      const ok = await fetchUser();
      if (!ok) clearAuth();
      setLoading(false);
    })();
  }, [fetchUser]);

  // Beautiful Tailwind Warning Modal
  const WarningModal = () => {
    if (!isWarning) return null;
    
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Session Expiring</h3>
                <p className="text-amber-100 text-sm">For your security</p>
              </div>
            </div>
          </div>
          
          {/* Body */}
          <div className="p-6">
            <div className="flex items-start space-x-3 mb-6">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-700">
                  You will be signed out in <span className="font-bold text-amber-600">{remaining}</span> second{remaining === 1 ? "" : "s"} due to inactivity.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This ensures patient data security according to HIPAA guidelines.
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Time remaining</span>
                <span>{remaining}s</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-1000 ease-linear"
                  style={{ width: `${(remaining / WARN_BEFORE) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  await handleStaySignedIn();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Stay Signed In</span>
              </button>
              
              <button
                onClick={logout}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out Now</span>
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-center space-x-2">
            <Shield className="h-4 w-4 text-primary-600" />
            <span className="text-xs text-gray-500">HIPAA compliant session management</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        fetchUser,
        setUser,
      }}
    >
      {children}
      <WarningModal />
    </AuthContext.Provider>
  );
};