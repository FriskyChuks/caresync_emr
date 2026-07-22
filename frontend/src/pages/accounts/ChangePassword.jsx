import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import PasswordInput from "./PasswordInput";
import useAuth from "../../hooks/useAuth";
import { 
  Key, 
  Lock, 
  AlertCircle, 
  CheckCircle,
  Heart,
  Shield,
  LogOut
} from "lucide-react";

const ChangePassword = () => {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { logout } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentPwd || !newPwd || !confirmPwd) {
      setErrorMsg("All fields are required.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setErrorMsg("New password and confirmation do not match.");
      return;
    }
    if (newPwd.length < 7) {
      setErrorMsg("New password must be at least 7 characters long.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/auth/users/set_password/", {
        current_password: currentPwd,
        new_password: newPwd,
      });

      setSuccessMsg(
        "Password updated successfully. You will be logged out and must sign in with your new password."
      );

      localStorage.setItem("password_reset_success", "1");

      timerRef.current = setTimeout(() => {
        logout();
      }, 1400);
    } catch (err) {
      console.error("Change password error:", err);
      const apiData = err?.response?.data;
      const message =
        apiData?.current_password?.[0] ||
        apiData?.new_password?.[0] ||
        apiData?.detail ||
        "Failed to change password. Please check your current password and try again.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-14 w-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Update Password
          </h1>
          <p className="text-gray-600">
            Change your account password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Change Password</h2>
              <p className="text-gray-600 text-sm">
                Enter your current and new passwords
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

            {/* Current Password */}
            <PasswordInput
              id="currentPwd"
              label="Current Password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="Enter your current password"
              disabled={loading}
              helperText=""
              className="mb-4"
            />

            {/* New Password */}
            <PasswordInput
              id="newPwd"
              label="New Password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Enter your new password"
              disabled={loading}
              helperText="At least 7 characters with letters and numbers"
              className="mb-4"
            />

            {/* Confirm Password */}
            <PasswordInput
              id="confirmPwd"
              label="Confirm New Password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Confirm your new password"
              disabled={loading}
              helperText=""
              className="mb-6"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Key className="h-5 w-5" />
                  <span>Update Password</span>
                </>
              )}
            </button>

            {/* Cancel Link */}
            <div className="mt-4 text-center">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center space-x-1"
              >
                <span>Cancel and return to dashboard</span>
              </Link>
            </div>

            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <Shield className="h-4 w-4" />
                <span>For your security, you'll be logged out after changing password</span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} CareSync EMR. All rights reserved.</p>
          <p className="mt-1">Regular password updates enhance security</p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;