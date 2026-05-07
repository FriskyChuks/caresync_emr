import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  UserPlus,
  Building2,
  Bed,
  Calendar,
  FlaskConical,
  Camera,
  Pill,
  CreditCard,
  ChevronDown,
  Home,
  Stethoscope,
  FileText,
  Package,
  Truck,
  Users,
  Bell,
  Activity,
  X,
  LogOut,
  Menu,
  UserCog,
  Shield
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

// Define role-based menu visibility
const ROLE_PERMISSIONS = {
  ADMIN: ['admin', 'superuser', 'administrator'],
  PHARMACY_MANAGER: ['pharmacy_manager', 'pharmacy_store_manager'],
  PHARMACY_STAFF: ['pharmacist', 'pharmacy_staff'],
  LAB_MANAGER: ['lab_manager', 'lab_supervisor'],
  LAB_STAFF: ['lab_technician', 'lab_staff'],
  RADIOLOGIST: ['radiologist', 'radiology_staff'],
  DOCTOR: ['doctor', 'physician'],
  NURSE: ['nurse'],
  RECEPTIONIST: ['receptionist', 'front_desk'],
  ACCOUNTANT: ['accountant', 'billing_staff'],
  INVENTORY_MANAGER: ['inventory_manager']
};

// Menu configuration with role-based access
const menuConfig = [
  {
    label: "Patient Registration",
    icon: <UserPlus className="h-5 w-5" />,
    path: "/patient-registration",
    roles: [ROLE_PERMISSIONS.RECEPTIONIST, ROLE_PERMISSIONS.DOCTOR, ROLE_PERMISSIONS.ADMIN]
  },
  {
    label: "Clinics",
    icon: <Building2 className="h-5 w-5" />,
    path: "/clinics",
    roles: [ROLE_PERMISSIONS.ADMIN, ROLE_PERMISSIONS.DOCTOR, ROLE_PERMISSIONS.RECEPTIONIST]
  },
  {
    label: "Wards",
    icon: <Bed className="h-5 w-5" />,
    path: "/wards",
    roles: [ROLE_PERMISSIONS.ADMIN, ROLE_PERMISSIONS.NURSE, ROLE_PERMISSIONS.DOCTOR]
  },
  {
    label: "Appointments",
    icon: <Calendar className="h-5 w-5" />,
    path: "/appointment-list",
    roles: [ROLE_PERMISSIONS.RECEPTIONIST, ROLE_PERMISSIONS.DOCTOR, ROLE_PERMISSIONS.ADMIN]
  },
  {
    label: "Laboratory",
    icon: <FlaskConical className="h-5 w-5" />,
    roles: [ROLE_PERMISSIONS.LAB_MANAGER, ROLE_PERMISSIONS.LAB_STAFF, ROLE_PERMISSIONS.ADMIN],
    children: [
      { 
        label: "Lab Dashboard", 
        path: "/lab/dashboard", 
        icon: <Home className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.LAB_MANAGER, ROLE_PERMISSIONS.LAB_STAFF, ROLE_PERMISSIONS.ADMIN]
      },
      { 
        label: "Lab Test Manager", 
        path: "/lab-test-manager", 
        icon: <FlaskConical className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.LAB_MANAGER, ROLE_PERMISSIONS.ADMIN]
      },
    ],
  },
  {
    label: "Radiology",
    icon: <Camera className="h-5 w-5" />,
    roles: [ROLE_PERMISSIONS.RADIOLOGIST, ROLE_PERMISSIONS.ADMIN],
    children: [
      { 
        label: "Dashboard", 
        path: "/radiology-dashboard", 
        icon: <Home className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.RADIOLOGIST, ROLE_PERMISSIONS.ADMIN]
      },
      { 
        label: "Create Unit", 
        path: "/create-radiology-unit", 
        icon: <Camera className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.ADMIN]
      },
      { 
        label: "Create Investigation", 
        path: "/create-radiology-investigation", 
        icon: <FileText className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.RADIOLOGIST, ROLE_PERMISSIONS.ADMIN]
      },
    ],
  },
  {
    label: "Pharmacy",
    icon: <Pill className="h-5 w-5" />,
    roles: [ROLE_PERMISSIONS.PHARMACY_MANAGER, ROLE_PERMISSIONS.PHARMACY_STAFF, ROLE_PERMISSIONS.ADMIN],
    children: [
      { 
        label: "Dashboard", 
        path: "/pharmacy/dashboard", 
        icon: <Home className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.PHARMACY_MANAGER, ROLE_PERMISSIONS.PHARMACY_STAFF, ROLE_PERMISSIONS.ADMIN]
      },
      { 
        label: "Products", 
        path: "/pharmacy/products", 
        icon: <Package className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.PHARMACY_MANAGER, ROLE_PERMISSIONS.PHARMACY_STAFF, ROLE_PERMISSIONS.ADMIN]
      },
      { 
        label: "Brands", 
        path: "/pharmacy/brands", 
        icon: <Stethoscope className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.PHARMACY_MANAGER, ROLE_PERMISSIONS.ADMIN]
      },
      { 
        label: "Inventory", 
        path: "/pharmacy/inventory", 
        icon: <FileText className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.PHARMACY_MANAGER, ROLE_PERMISSIONS.PHARMACY_STAFF, ROLE_PERMISSIONS.ADMIN]
      },
      { 
        label: "Prescriptions", 
        path: "/pharmacy/prescriptions", 
        icon: <FileText className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.PHARMACY_MANAGER, ROLE_PERMISSIONS.PHARMACY_STAFF, ROLE_PERMISSIONS.ADMIN]
      },
      { 
        label: "Dispensary", 
        path: "/pharmacy/dispensary", 
        icon: <Pill className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.PHARMACY_MANAGER, ROLE_PERMISSIONS.PHARMACY_STAFF, ROLE_PERMISSIONS.ADMIN]
      },
      { 
        label: "Suppliers", 
        path: "/pharmacy/suppliers", 
        icon: <Truck className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.PHARMACY_MANAGER, ROLE_PERMISSIONS.ADMIN]
      },
      { 
        label: "Stock Transfers", 
        path: "/pharmacy/transfers", 
        icon: <Truck className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.PHARMACY_MANAGER, ROLE_PERMISSIONS.ADMIN]
      },
    ],
  },
  {
    label: "Billing",
    icon: <CreditCard className="h-5 w-5" />,
    roles: [ROLE_PERMISSIONS.ACCOUNTANT, ROLE_PERMISSIONS.ADMIN],
    children: [
      { 
        label: "Dashboard", 
        path: "/billing/cashier-dashboard", 
        icon: <Home className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.ACCOUNTANT, ROLE_PERMISSIONS.ADMIN]
      },
    ],
  },
  {
    label: "Admin",
    icon: <Shield className="h-5 w-5" />,
    roles: [ROLE_PERMISSIONS.ADMIN],
    children: [
      { 
        label: "User Management", 
        path: "/user-management", 
        icon: <Users className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.ADMIN]
      },
      { 
        label: "System Settings", 
        path: "/admin/settings", 
        icon: <UserCog className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.ADMIN]
      },
    ],
  },
];

const Sidebar = ({ isMobileOpen, onClose, isCollapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  // console.log('user:', user)

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    if (!user) return [];

    const userRole = user.user_category?.title?.toLowerCase() || '';
    const isPharmacyManager = user.is_pharmacy_store_manager;
    const isAdmin = userRole === 'admin' || userRole === 'superuser';

    return menuConfig.filter(item => {
      // Check if user has access to this menu item
      const hasAccess = item.roles.some(roleArray => 
        roleArray.some(role => 
          role === userRole || 
          (isPharmacyManager && role === 'pharmacy_manager') ||
          (isAdmin && role === 'admin')
        )
      );

      return hasAccess;
    }).map(item => {
      // Filter children if they exist
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => {
            const hasChildAccess = child.roles.some(roleArray =>
              roleArray.some(role =>
                role === userRole ||
                (isPharmacyManager && role === 'pharmacy_manager') ||
                (isAdmin && role === 'admin')
              )
            );
            return hasChildAccess;
          })
        };
      }
      return item;
    }).filter(item => !item.children || item.children.length > 0); // Remove empty parent items
  }, [user]);

  const toggleItem = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobileOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  if (!user) return null;

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container - Fixed positioning */}
      <aside className={`
        fixed top-0 left-0 h-screen ${sidebarWidth} bg-gradient-to-b from-white to-gray-50 
        border-r border-gray-200 shadow-sm z-40 overflow-hidden flex flex-col
        transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header with Logo */}
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <Link to="/dashboard" className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
              <img 
                src="/caresync_logo.PNG" 
                alt="App Logo" 
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="h-full w-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                      <span class="text-white font-bold text-sm">CS</span>
                    </div>
                  `;
                }}
              />
            </div>
            
            {!isCollapsed && (
              <div className="transition-opacity duration-300">
                <h1 className="text-xl font-bold text-primary-800">CareSync</h1>
                <p className="text-xs text-gray-500">EMR System</p>
              </div>
            )}
          </Link>
          
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-4 py-2.5 border-b border-gray-200">
          <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center space-x-3'}`}>
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center border-2 border-white shadow">
                <span className="text-white font-semibold text-sm">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0 transition-opacity duration-300">
                <h3 className="font-semibold text-gray-900 truncate">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {user.pharmacy_store_name || user.user_category?.title}
                </p>
              </div>
            )}
          </div>
          
          {/* Logout Button - Mobile Only */}
          <button
            onClick={logout}
            className="lg:hidden mt-4 w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems[index];

              return (
                <div key={index} className="mb-1">
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleItem(index)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isExpanded 
                            ? 'bg-primary-50 text-primary-700' 
                            : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? item.label : ''}
                      >
                        <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isExpanded ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.icon}
                          </div>
                          {!isCollapsed && (
                            <span className="font-medium text-sm">{item.label}</span>
                          )}
                        </div>
                        {!isCollapsed && (
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                            isExpanded ? 'transform rotate-180' : ''
                          }`} />
                        )}
                      </button>
                      
                      {isExpanded && !isCollapsed && (
                        <div className="ml-8 mt-1 space-y-1 border-l-2 border-gray-200 pl-3 py-1">
                          {item.children.map((child, childIndex) => {
                            const isChildActive = location.pathname === child.path;
                            return (
                              <Link
                                key={childIndex}
                                to={child.path}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                  isChildActive
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                                onClick={onClose}
                              >
                                <div className="h-5 w-5 flex items-center justify-center">
                                  {child.icon}
                                </div>
                                <span>{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium shadow-sm'
                          : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                      onClick={onClose}
                      title={isCollapsed ? item.label : ''}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.icon}
                      </div>
                      {!isCollapsed && (
                        <span className="font-medium text-sm">{item.label}</span>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer with Logo */}
        {!isCollapsed && (
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="App Logo" 
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="h-full w-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center rounded">
                          <span class="text-white text-xs font-bold">CS</span>
                        </div>
                      `;
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500">v1.0.0</div>
              </div>
              <div className="text-xs text-gray-500">© {new Date().getFullYear()}</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content padding - Only apply on desktop */}
      <div className={`hidden lg:block ${sidebarWidth} transition-all duration-300`} />
    </>
  );
};

export default Sidebar;