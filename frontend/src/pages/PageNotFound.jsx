import { Link } from "react-router-dom"
import { Home, AlertTriangle, Search } from "lucide-react"

const PageNotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="h-20 w-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <AlertTriangle className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8">
          The healthcare resource you're looking for doesn't exist or has been moved.
        </p>

        {/* Search Suggestion */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex items-center">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Try searching instead:
              </p>
              <div className="flex space-x-2">
                <Link to="/patient/search" className="text-xs text-primary-600 hover:text-primary-700">
                  Patients
                </Link>
                <span className="text-gray-300">•</span>
                <Link to="/appointment-list" className="text-xs text-primary-600 hover:text-primary-700">
                  Appointments
                </Link>
                <span className="text-gray-300">•</span>
                <Link to="/lab/dashboard" className="text-xs text-primary-600 hover:text-primary-700">
                  Lab Results
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center w-full py-3 px-6 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Home className="h-5 w-5 mr-2" />
          Return to Dashboard
        </Link>

        {/* Support Link */}
        <div className="mt-6">
          <Link
            to="/help"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Need help? Contact support
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PageNotFound