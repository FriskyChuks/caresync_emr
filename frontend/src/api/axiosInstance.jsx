// src/api/axiosInstance.jsx
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  // Remove default Content-Type header - let it be set dynamically
});

/**
 * Setup interceptors that depend on auth functions from AuthProvider.
 *
 * @param {Function} logout - function to call to perform logout (clear state + redirect)
 * @param {Function} tryRefreshAccessToken - async function that attempts to refresh and returns new access token or null
 */
export const setupAxiosInterceptors = (logout, tryRefreshAccessToken) => {
  // remove any existing interceptors to avoid double-registration
  axiosInstance.interceptors.request.handlers = [];
  axiosInstance.interceptors.response.handlers = [];

  // Request: attach access token if present
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `CARESYNC ${token}`;
      }
      
      // IMPORTANT: Don't set Content-Type for FormData - let browser set it with boundary
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      } else if (!config.headers['Content-Type']) {
        // Only set default for non-FormData requests
        config.headers['Content-Type'] = 'application/json';
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response: try refresh on 401, otherwise logout via provided callback
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If no response or no status, just reject
      if (!error.response) return Promise.reject(error);

      // Only attempt once per request
      if (error.response.status === 401 && !originalRequest?._retry) {
        originalRequest._retry = true;

        try {
          // ask AuthProvider to refresh; it returns new token or null
          const newAccess = await tryRefreshAccessToken();
          if (newAccess) {
            // retry original request with new access token
            originalRequest.headers.Authorization = `CARESYNC ${newAccess}`;
            return axiosInstance(originalRequest);
          } else {
            // refresh failed -> call provided logout (clears state + redirect)
            logout();
            return Promise.reject(error);
          }
        } catch (err) {
          // any error during refresh -> logout
          logout();
          return Promise.reject(err);
        }
      }

      // other errors, forward
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;