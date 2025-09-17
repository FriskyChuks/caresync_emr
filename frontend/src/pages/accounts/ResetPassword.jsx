import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import PasswordInput from "../accounts/PasswordInput";
import useAuth from "../../hooks/useAuth";

/**
 * Admin ResetPassword (admin-only)
 * - Admins/Support staff can reset another user's password to a default (or custom) value.
 * - Example backend endpoint: POST /admin/reset_user_password/
 *    payload: { username: "<username or email>", new_password: "<password>" }
 * - The backend must enforce IsAdminUser permission.
 */

const ResetPasswordAdmin = () => {
  const [targetUser, setTargetUser] = useState(""); // username or email
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

  // simple password generator (readable + secure-ish)
  const generatePassword = (len = 12) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*()-_";
    let pw = "";
    for (let i = 0; i < len; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    return pw;
  };

  const handleGenerate = () => {
    setNewPassword(generatePassword(12));
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

    // Confirm action
    const confirmText = `Reset password for "${targetUser.trim()}" to the specified value?`;
    if (!window.confirm(confirmText)) return;

    setLoading(true);
    try {
      // NOTE: adjust endpoint to match backend. Example: /admin/reset_user_password/
      const resp = await axiosInstance.post("/admin/reset_user_password/", {
        username: targetUser.trim(),
        new_password: newPassword,
      });

      setSuccessMsg(
        `Password for "${targetUser.trim()}" reset successfully. Share this temporary password with the user.`
      );

      // Optionally show the password back to admin (so they can share it)
      // Keep it visible in UI (we show it below). Clear target user after a delay.
      timerRef.current = setTimeout(() => {
        setTargetUser("");
        // keep newPassword visible until admin clears it manually
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

  // If user not staff, show unauthorized UI
  if (!user) {
    return <div className="p-4">Loading user...</div>;
  }
  if (!user.is_staff && !user.is_superuser) {
    return (
      <div className="p-4">
        <h4>Unauthorized</h4>
        <p>You do not have permission to reset other users' passwords.</p>
      </div>
    );
  }

  return (
    <div className="login-bg">
      <div className="container">
        <div className="auth-wrapper">
          <form onSubmit={handleReset} noValidate>
            <div className="auth-box">
              <Link to="/" className="auth-logo mb-4">
                <img src="assets/images/logo.svg" alt="App logo" />
              </Link>

              <h4 className="mb-4">Admin — Reset User Password</h4>

              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
              {successMsg && <div className="alert alert-success">{successMsg}</div>}

              <div className="mb-3">
                <label className="form-label" htmlFor="targetUser">
                  Username or Email <span className="text-danger">*</span>
                </label>
                <input
                  id="targetUser"
                  className="form-control"
                  placeholder="Enter the user's username or email"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="newPassword">
                  New password to assign <span className="text-danger">*</span>
                </label>

                <div className="d-flex gap-2">
                  <div style={{ flex: 1 }}>
                    {/* reuse PasswordInput from accounts */}
                    <PasswordInput
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter or generate a password"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleGenerate}
                    disabled={loading}
                    title="Generate random password"
                  >
                    Generate
                  </button>
                </div>

                <div className="form-text mt-1">
                  If you generate a password, copy it immediately and share with the user. The user should change it on first login.
                </div>
              </div>

              <div className="mb-3 d-grid gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>

              {/* show generated password (visible to admin only) */}
              {newPassword && (
                <div className="mb-3">
                  <label className="form-label">Temporary password (showing to admin)</label>
                  <div className="p-2 bg-light border rounded">
                    <strong>{newPassword}</strong>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordAdmin;
