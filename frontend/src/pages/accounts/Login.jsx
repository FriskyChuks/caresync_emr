import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import useAuth from "../../hooks/useAuth";
import { 
  LogIn, 
  User, 
  Key, 
  AlertCircle, 
  CheckCircle,
  Heart,
  Shield
} from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    const storedError = localStorage.getItem("login_error");
    const storedSuccess = localStorage.getItem("login_success");
    const resetFlag = localStorage.getItem("password_reset_success");

    if (storedError) {
      setErrorMsg(storedError);
      localStorage.removeItem("login_error");
    }
    if (storedSuccess) {
      setSuccessMsg(storedSuccess);
      localStorage.removeItem("login_success");
    }
    if (resetFlag) {
      setSuccessMsg("Password updated. Please login with your new password.");
      localStorage.removeItem("password_reset_success");
    }
  }, []);

  const showError = (msg) => {
    setErrorMsg(msg);
    localStorage.setItem("login_error", msg);
  };
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    localStorage.setItem("login_success", msg);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    localStorage.removeItem("login_error");
    localStorage.removeItem("login_success");

    if (!username.trim() || !password) {
      showError("Please enter both username and password.");
      return;
    }

    try {
      const result = await login({ username: username.trim(), password });

      if (!result) {
        showError("Login failed. No response from auth.");
        return;
      }

      if (result?.success) {
        const mustChange =
          result?.must_change_password === true ||
          result?.user?.must_change_password === true ||
          result?.data?.must_change_password === true;

        if (mustChange) {
          navigate("/auth/change-password", {
            replace: true,
            state: { mustChangePassword: true },
          });
          return;
        }

        navigate(from, { replace: true });
        return;
      }

      const detail =
        result?.error?.detail ||
        result?.error?.message ||
        (Array.isArray(result?.error) && result.error.join(", ")) ||
        (typeof result?.error === "string" && result.error) ||
        "Login failed. Please check your credentials.";

      showError(detail);
    } catch (err) {
      console.error("Login error:", err);
      showError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-14 w-14 from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center shadow-lg">
              <img 
                src="/caresync_logo.PNG" 
                alt="CareSync" 
                className="h-10 w-10 rounded-xl"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CareSync
          </h1>
          <p className="text-gray-600">
            Secure login to your healthcare dashboard
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleLogin} noValidate>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600 text-sm">
                Enter your credentials to access the system
              </p>
            </div>

            {/* Messages */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-fade-in">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{errorMsg}</p>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3 animate-fade-in">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">{successMsg}</p>
                </div>
              </div>
            )}

            {/* Username */}
            <div className="mb-4">
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Username
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  autoFocus
                  type="text"
                  id="username"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <PasswordInput
              id="login-password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              helperText=""
            />

            {/* Forgot Password */}
            <div className="mb-6 flex justify-end">
              <Link
                to="/auth/reset-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Divider */}
            {/* <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div> */}

            {/* Register Link */}
            {/* <Link
              to="/auth/register"
              className="w-full py-3 border border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Create New Account</span>
            </Link> */}

            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <Shield className="h-4 w-4" />
                <span>HIPAA compliant • End-to-end encryption</span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} CareSync EMR. All rights reserved.</p>
          <p className="mt-1">Version 1.0.0 • Secure Healthcare Platform</p>
        </div>
      </div>
    </div>
  );
};

export default Login;