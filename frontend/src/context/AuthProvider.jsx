import React, { createContext, useState, useEffect, useCallback } from "react";
import axiosInstance, { setupAxiosInterceptors } from "../api/axiosInstance";
import axios from "axios";
import { useIdleTimer, DEFAULT_IDLE_TIME, WARN_BEFORE } from "../hooks/useIdleTimer";

export const AuthContext = createContext(null);

/**
 * AuthProvider
 * - hydrates user from localStorage on mount to avoid UI flashes
 * - wires axios interceptors once (setupAxiosInterceptors)
 * - centralizes idle detection + warning modal (uses useIdleTimer constants)
 * - exposes login/logout/fetchUser
 */
export const AuthProvider = ({ children }) => {
  // hydrate synchronously from localStorage to avoid null access in UI on refresh
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Set tokens helper
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

  // logout clears and redirects
  const logout = useCallback(() => {
    clearAuth();
    window.location.assign("/");
  }, []);

  // try refresh: uses plain axios to avoid recursive interceptors
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

  // fetch user profile (with refresh fallback)
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

  // login: get tokens then fetch user; return must_change_password if present
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

  // set up axios interceptors once (pass logout & refresh helpers)
  useEffect(() => {
    setupAxiosInterceptors(logout, tryRefreshAccessToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout, tryRefreshAccessToken]);

  // useIdleTimer — central single source of truth (imported constants used by default)
  const { isWarning, remaining, resetTimer } = useIdleTimer({
    onIdle: () => logout(),
    idleTime: DEFAULT_IDLE_TIME,
    warnBefore: WARN_BEFORE,
  });

  // helper when user clicks "Stay signed in"
  const handleStaySignedIn = async () => {
    // attempt refresh; if refresh fails, logout will be triggered by fetch or interceptor
    await tryRefreshAccessToken();
    resetTimer();
  };

  // hydrate/verify on app load
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

  // inline warning modal (minimal styling — replace with your modal if desired)
  const WarningModal = () => {
    if (!isWarning) return null;
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="idle-warning-overlay"
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          background: "rgba(0,0,0,0.35)",
        }}
      >
        <div
          className="card p-3"
          style={{ maxWidth: 560, width: "94%", textAlign: "center", borderRadius: 8 }}
        >
          <h5 className="mb-2">You will be signed out soon</h5>
          <p className="mb-3">
            For your security, you will be signed out in <strong>{remaining}</strong> second
            {remaining === 1 ? "" : "s"} due to inactivity.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              className="btn btn-primary"
              onClick={async () => {
                await handleStaySignedIn();
              }}
            >
              Stay signed in
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                logout();
              }}
            >
              Log out now
            </button>
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
