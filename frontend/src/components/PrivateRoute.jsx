// components/PrivateRoute.jsx (your existing working version)
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Shield, Heart } from "lucide-react";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Animated Logo */}
          <div className="relative mx-auto">
            <div className="h-20 w-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Heart className="h-10 w-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <Shield className="h-3 w-3 text-white" />
            </div>
          </div>
          
          {/* Loading Animation */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-3 w-3 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-3 w-3 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-3 w-3 bg-primary-500 rounded-full animate-bounce"></div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Securing Your Session
              </h3>
              <p className="text-gray-600 mt-2">
                Authenticating your credentials and loading protected resources
              </p>
            </div>
          </div>
          
          {/* Security Message */}
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mt-8">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-primary-900">
                  HIPAA Compliant Session
                </p>
                <p className="text-xs text-primary-700 mt-1">
                  Your patient data is protected with end-to-end encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default PrivateRoute;