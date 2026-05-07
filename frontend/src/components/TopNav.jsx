import useAuth from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Menu, 
  Star, 
  Bell, 
  AlertCircle, 
  MessageSquare,
  ChevronDown,
  LogOut,
  Key,
  User,
  Flag,
  Activity
} from "lucide-react";

const TopNav = ({ onMenuToggle }) => {
  const { user, logout, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/patient/search?q=${encodeURIComponent(query)}`);
      setQuery("");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if click is on the user button
        const userButton = document.querySelector('[data-user-button]');
        if (userButton && userButton.contains(event.target)) {
          return; // Don't close if clicking the user button
        }
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  if (loading || !user) return null;

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Mobile Logo and Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <Link to="/dashboard" className="ml-3 flex items-center">
              <img 
                src="/caresync_logo.PNG" 
                alt="CareSync" 
                className="h-10 w-10 rounded-xl"
              />
              <span className="ml-2 text-lg font-bold text-primary-800">CareSync</span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search patient by name, ID, or phone..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2">
            
            {/* Country Selector */}
            <div className="hidden md:block">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Flag className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Mobile Search Button */}
            {/* <button className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <Search className="h-5 w-5" />
            </button> */}

            {/* Bookmarks */}
            <div className="hidden md:block relative">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Star className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-500 rounded-full"></span>
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* User Profile Dropdown - FIXED Z-INDEX */}
            <div className="relative" ref={dropdownRef}>
              <button 
                data-user-button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{user.category}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 hidden lg:block transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown content - HIGHER Z-INDEX */}
              {showUserDropdown && (
                <>
                  {/* Backdrop for mobile - HIGHER Z-INDEX */}
                  <div 
                    className="fixed inset-0 z-40 lg:hidden bg-black/20"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  
                  {/* Dropdown Menu - HIGHEST Z-INDEX */}
                  <div className="fixed lg:absolute right-4 lg:right-0 top-16 lg:top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[60] animate-fade-in">
                    {/* Arrow indicator */}
                    <div className="absolute -top-2 right-8 lg:right-4 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                    
                    <div className="p-4">
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{user.category}</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-3">
                        <Link
                          to="/change-password"
                          className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 mb-2"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Key className="h-4 w-4 mr-3" />
                          Change Password
                        </Link>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full mt-2 flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </form>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;