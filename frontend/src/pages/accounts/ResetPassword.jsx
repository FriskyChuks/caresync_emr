import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import PasswordInput from "../accounts/PasswordInput";
import useAuth from "../../hooks/useAuth";
import { 
  User, 
  Key, 
  AlertCircle, 
  CheckCircle,
  Heart,
  Shield,
  RefreshCw,
  Copy
} from "lucide-react";

const ResetPassword = () => {
  const [targetUser, setTargetUser] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { user } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const generatePassword = (len = 12) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*()-_";
    let pw = "";
    for (let i = 0; i < len; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    return pw;
  };

  const handleGenerate = () => {
    setNewPassword(generatePassword(12));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newPassword);
    alert("Password copied to clipboard!");
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!targetUser.trim()) {
      setErrorMsg("Please enter the username or email of the user to reset.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg("Please provide a new password of at least 8 characters or generate one.");
      return;
    }

    const confirmText = `Reset password for "${targetUser.trim()}" to the specified value?`;
    if (!window.confirm(confirmText)) return;

    setLoading(true);
    try {
      const resp = await axiosInstance.post("/admin/reset_user_password/", {
        username: targetUser.trim(),
        new_password: newPassword,
      });

      setSuccessMsg(
        `Password for "${targetUser.trim()}" reset successfully. Share this temporary password with the user.`
      );

      timerRef.current = setTimeout(() => {
        setTargetUser("");
      }, 3000);
    } catch (err) {
      console.error("Admin reset error:", err);
      const apiData = err?.response?.data;
      const message =
        apiData?.detail ||
        apiData?.error ||
        (typeof apiData === "string" && apiData) ||
        "Failed to reset user password. Check permissions and username.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Authorization check
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!user.is_staff && !user.is_superuser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="h-14 w-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized</h2>
            <p className="text-gray-600 mb-6">
              You do not have permission to reset other users' passwords.
            </p>
            <Link
              to="/dashboard"
              className="btn-primary"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-14 w-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center shadow-lg">
              <Key className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Password Reset
          </h1>
          <p className="text-gray-600">
            Reset passwords for healthcare staff
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleReset} noValidate>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Reset User Password</h2>
              <p className="text-gray-600 text-sm">
                For authorized administrators only
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

            {/* Target User */}
            <div className="mb-4">
              <label 
                htmlFor="targetUser" 
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Username or Email
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="targetUser"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                  placeholder="Enter the user's username or email"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* New Password with Generate */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <PasswordInput
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter or generate a password"
                    disabled={loading}
                    helperText=""
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  title="Generate random password"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Generate</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Generate a secure password and share it with the user. They should change it on first login.
              </p>
            </div>

            {/* Generated Password Display */}
            {newPassword && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-amber-800">
                    Temporary Password (Share with user)
                  </label>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="text-amber-600 hover:text-amber-700 flex items-center space-x-1 text-sm"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="p-3 bg-white border border-amber-300 rounded font-mono text-lg text-gray-900 break-all">
                  {newPassword}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <Key className="h-5 w-5" />
                  <span>Reset Password</span>
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <Shield className="h-4 w-4" />
                <span>Admin action logged • Use with caution</span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} CareSync EMR. All rights reserved.</p>
          <p className="mt-1">Authorized administrators only • Action logged</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;