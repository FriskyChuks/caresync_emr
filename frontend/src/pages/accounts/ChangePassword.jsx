import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import PasswordInput from "./PasswordInput";
import useAuth from "../../hooks/useAuth";

/**
 * ChangePassword.jsx
 * - For logged-in users to change their own password.
 * - Calls POST /auth/users/set_password/ (Djoser standard).
 * - On success: sets a flag and logs the user out so they re-login with new password.
 */

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

    // client-side validations
    if (!currentPwd || !newPwd || !confirmPwd) {
      setErrorMsg("All fields are required.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setErrorMsg("New password and confirmation do not match.");
      return;
    }
    if (newPwd.length < 3) {
      setErrorMsg("New password must be at least 4 characters long.");
      return;
    }

    setLoading(true);
    try {
      // Endpoint used for logged-in user to change their password
      await axiosInstance.post("/auth/users/set_password/", {
        current_password: currentPwd,
        new_password: newPwd,
      });

      // Show message then force logout so the user signs in with new password
      setSuccessMsg(
        "Password updated. You will be logged out and must sign in with your new password."
      );

      // optional: flag so Login page shows a friendly message after redirect
      localStorage.setItem("password_reset_success", "1");

      timerRef.current = setTimeout(() => {
        logout(); // AuthProvider.logout() should clear tokens and redirect to /login
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
    <div className="login-bg">
      <div className="container">
        <div className="auth-wrapper">
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-box">
              <Link to="/" className="auth-logo mb-4">
                <img src="assets/images/logo.svg" alt="App logo" />
              </Link>

              <h4 className="mb-4">Change Password</h4>

              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
              {successMsg && <div className="alert alert-success">{successMsg}</div>}

              <div className="mb-3">
                <label className="form-label" htmlFor="currentPwd">
                  Current password <span className="text-danger">*</span>
                </label>
                <PasswordInput
                  id="currentPwd"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password"
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="newPwd">
                  New password <span className="text-danger">*</span>
                </label>
                <PasswordInput
                  id="newPwd"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                />
                <div className="form-text">Your password must be at least 8 characters long.</div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="confirmPwd">
                  Confirm new password <span className="text-danger">*</span>
                </label>
                <PasswordInput
                  id="confirmPwd"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
              </div>

              <div className="mb-3 d-grid">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Updating..." : "Update password"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
