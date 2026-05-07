import { Link } from "react-router-dom";
import { Heart, Shield, ChevronUp, Info } from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Bar - Always visible */}
        <div className="py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and copyright */}
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 bg-gradient-to-br from-primary-600 to-primary-800 rounded flex items-center justify-center">
                <Heart className="h-3 w-3 text-white" />
              </div>
              <div className="text-xs text-gray-600">
                © {currentYear} CareSync EMR
              </div>
            </div>

            {/* Right side - Links and expand button */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <Link to="/privacy" className="text-xs text-gray-500 hover:text-gray-700">
                  Privacy
                </Link>
                <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-700">
                  Terms
                </Link>
                <Link to="/hipaa" className="text-xs text-gray-500 hover:text-gray-700">
                  HIPAA
                </Link>
              </div>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors"
                aria-label={isExpanded ? "Collapse footer" : "Expand footer"}
              >
                <ChevronUp className={`h-4 w-4 text-gray-500 transition-transform ${
                  isExpanded ? 'transform rotate-180' : ''
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <div className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
            {/* About */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">About CareSync</h4>
              <p className="text-xs text-gray-600 mb-3">
                Modern EMR system for healthcare excellence. HIPAA compliant, secure, and reliable.
              </p>
              <div className="flex items-center space-x-2">
                <Shield className="h-3 w-3 text-green-500" />
                <span className="text-xs text-gray-500">Enterprise Security</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick Access</h4>
              <div className="space-y-1">
                <Link to="/dashboard" className="text-xs text-gray-600 hover:text-primary-600 block">
                  Dashboard
                </Link>
                <Link to="/patient-list" className="text-xs text-gray-600 hover:text-primary-600 block">
                  Patients
                </Link>
                <Link to="/appointment-list" className="text-xs text-gray-600 hover:text-primary-600 block">
                  Appointments
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Support</h4>
              <div className="space-y-1">
                <Link to="/help" className="text-xs text-gray-600 hover:text-primary-600 block">
                  Help Center
                </Link>
                <Link to="/contact" className="text-xs text-gray-600 hover:text-primary-600 block">
                  Contact
                </Link>
                <div className="text-xs text-gray-500 mt-2">
                  <div className="flex items-center space-x-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>System Status: Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Expand Button */}
      <div className="lg:hidden fixed bottom-4 right-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-10 w-10 rounded-full bg-primary-600 shadow-lg flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
        >
          <Info className="h-5 w-5" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;