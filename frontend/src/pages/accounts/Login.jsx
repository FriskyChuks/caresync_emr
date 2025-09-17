import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to previous attempted route (if any) or patient-list
  const from = location.state?.from?.pathname || "/dashboard";

  // Hydrate persisted messages on mount
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

  // Utility to persist error & success in both state + storage
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
          navigate("/change-password", {
            replace: true,
            state: { mustChangePassword: true },
          });
          return;
        }

        // Normal success
        navigate(from, { replace: true });
        return;
      }

      // Friendly error extraction
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
    <div className="login-bg">
      <div className="container">
        <div className="auth-wrapper">
          <form
            onSubmit={handleLogin}
            noValidate
            aria-describedby="login-error login-success"
          >
            <div className="auth-box">
              <Link to="/" className="auth-logo mb-4">
                {/* <img src="assets/images/caresync_logo.png" alt="App logo" /> */}
                <span ><strong>CARESYNC</strong></span>
              </Link>

              <h4 className="mb-4">Login</h4>

              {errorMsg && (
                <div
                  id="login-error"
                  className="alert alert-danger"
                  role="alert"
                >
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div
                  id="login-success"
                  className="alert alert-success"
                  role="status"
                >
                  {successMsg}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label" htmlFor="username">
                  Your Username <span className="text-danger">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  id="username"
                  className="form-control"
                  placeholder="Enter your Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <PasswordInput
                id="login-password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              <div className="d-flex justify-content-end mb-3">
                <a
                  href="forgot-password.html"
                  className="text-decoration-underline"
                >
                  Forgot password?
                </a>
              </div>

              <div className="mb-3 d-grid gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
                <Link to="/register" className="btn btn-secondary">
                  Not registered? Signup
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
