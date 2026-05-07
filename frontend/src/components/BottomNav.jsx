import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("Today");

  // Function to generate breadcrumbs from path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(path => path);
    
    // Handle dashboard route
    if (paths.length === 0 || (paths.length === 1 && paths[0] === 'dashboard')) {
      return [
        { name: "Dashboard", path: "/dashboard", current: true }
      ];
    }

    const breadcrumbs = [
      { name: "Dashboard", path: "/dashboard", current: false }
    ];

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Skip adding duplicate dashboard
      if (path === 'dashboard' && index === 0) return;
      
      // Format the name properly
      let name = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Special handling for common routes
      if (path === 'patients') name = 'Patients';
      if (path === 'appointments') name = 'Appointments';
      if (path === 'settings') name = 'Settings';
      if (path === 'profile') name = 'Profile';
      
      if (index === paths.length - 1) {
        breadcrumbs.push({ name, path: currentPath, current: true });
      } else {
        breadcrumbs.push({ name, path: currentPath, current: false });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Handle date change
  const handleDateChange = (e) => {
    const value = e.target.value;
    setSelectedDate(value);
    // You can add navigation or state update logic here
    if (value === 'Custom Range') {
      // Handle custom range selection
      console.log('Open date picker');
    }
  };

  return (
    <div className="sticky top-16 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 gap-3">
          
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
            
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                <ChevronRight className="h-3 w-3 text-gray-400 mx-2" />
                {crumb.current ? (
                  <span className="font-medium text-primary-700">
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Date Selector and Stats */}
          <div className="flex items-center space-x-4">
            {/* Date Range Selector */}
            <div className="hidden lg:flex items-center bg-gray-50 rounded-lg px-3 py-2">
              <Calendar className="h-4 w-4 text-primary-600 mr-2" />
              <select
                value={selectedDate}
                onChange={handleDateChange}
                className="bg-transparent text-sm text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Custom Range">Custom Range</option>
              </select>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-gray-500">Patients Today</div>
                <div className="text-sm font-semibold text-gray-900">24</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Appointments</div>
                <div className="text-sm font-semibold text-gray-900">18</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Pending</div>
                <div className="text-sm font-semibold text-amber-600">6</div>
              </div>
            </div>

            {/* Mobile Stats */}
            <div className="flex md:hidden items-center bg-primary-50 rounded-lg px-3 py-1.5">
              <Calendar className="h-3 w-3 text-primary-600 mr-1" />
              <span className="text-xs font-medium text-primary-700">
                {selectedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Quick Actions */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-xs text-gray-500">Patients</div>
              <div className="text-sm font-semibold text-gray-900">24</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Apps</div>
              <div className="text-sm font-semibold text-gray-900">18</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Pending</div>
              <div className="text-sm font-semibold text-amber-600">6</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;