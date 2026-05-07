import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";
import { 
  UserPlus, 
  Mail, 
  User, 
  AlertCircle, 
  CheckCircle,
  Heart,
  Shield
} from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
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
      await axiosInstance.post("/auth/users/", {
        username: name.trim(),
        email: email.trim(),
        password,
      });

      const loginResult = await login({ username: name.trim(), password });

      if (loginResult?.success) {
        navigate("/patient-list", { replace: true });
      } else {
        navigate("/auth/login", { replace: true });
      }
    } catch (err) {
      console.error("Registration error:", err);
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
            Join CareSync
          </h1>
          <p className="text-gray-600">
            Create your healthcare provider account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleRegister} noValidate>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600 text-sm">
                Fill in your details to get started
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-fade-in">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Name */}
            <div className="mb-4">
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Full Name
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email Address
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <PasswordInput
              id="register-password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              disabled={loading}
              helperText="Use at least 8 characters with letters and numbers"
            />

            {/* Terms & Conditions */}
            <div className="mb-6">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <Link
              to="/auth/login"
              className="w-full py-3 border border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Sign In Instead</span>
            </Link>

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
          <p className="mt-1">For healthcare professionals only</p>
        </div>
      </div>
    </div>
  );
};

export default Register;