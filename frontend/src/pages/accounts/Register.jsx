import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";

const Register = () => {
  const [name, setName] = useState(""); // used as username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg("Please fill all required fields.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      // Create user — adjust endpoint if your backend differs
      await axiosInstance.post("/auth/users/", {
        username: name.trim(),
        email: email.trim(),
        password,
      });

      // Optionally auto-login after successful registration
      const loginResult = await login({ username: name.trim(), password });

      if (loginResult?.success) {
        navigate("/patient-list", { replace: true });
      } else {
        // If auto-login failed, send user to login page
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Registration error:", err);
      // Try to present friendly message for common shapes
      const apiData = err?.response?.data;
      const message =
        apiData?.detail ||
        apiData?.username?.[0] ||
        apiData?.email?.[0] ||
        apiData?.password?.[0] ||
        (typeof apiData === "string" && apiData) ||
        "Registration failed. Please check your input.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="container">
        <div className="auth-wrapper">
          <form onSubmit={handleRegister} noValidate>
            <div className="auth-box">
              <Link to="/" className="auth-logo mb-4">
                <img src="assets/images/logo.svg" alt="App logo" />
              </Link>

              <h4 className="mb-4">Signup</h4>

              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

              <div className="mb-3">
                <label className="form-label" htmlFor="name">
                  Your name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="email">
                  Your email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <PasswordInput
                id="register-password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              <div className="mb-3 d-grid gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Signing up..." : "Signup"}
                </button>
                <Link to="/login" className="btn btn-secondary">
                  Already have an account? Login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
