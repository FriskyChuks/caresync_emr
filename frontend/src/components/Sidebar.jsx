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
  HIM: ['him_manager', 'him_staff','health_information_manager','health_information_staff','records_manager','records_staff','records'],
  PHARMACY_MANAGER: ['pharmacy_manager', 'pharmacy_store_manager'],
  PHARMACY_STAFF: ['pharmacist', 'pharmacy_staff'],
  LAB_MANAGER: ['lab_manager', 'lab_supervisor'],
  LAB_STAFF: ['lab_technician', 'lab_staff', 'MLS','medical_laboratory_technician','medical_laboratory_staff'],
  RADIOLOGIST: ['radiologist', 'radiology_staff'],
  DOCTOR: ['doctor', 'physician'],
  NURSE: ['nurse'],
  RECEPTIONIST: ['receptionist', 'front_desk'],
  CASHIER: ['cashier', 'billing_staff'],
  ACCOUNTANT: ['accountant', 'billing_staff', 'finance_manager'],
  INVENTORY_MANAGER: ['inventory_manager']
};

// Color configurations for different menu sections
const getMenuColors = (label) => {
  const colorMap = {
    "Patient Registration": { bg: "bg-indigo-100", icon: "text-indigo-600", hover: "hover:bg-indigo-50", active: "bg-indigo-100 text-indigo-700" },
    "Clinics": { bg: "bg-teal-100", icon: "text-teal-600", hover: "hover:bg-teal-50", active: "bg-teal-100 text-teal-700" },
    "Wards": { bg: "bg-blue-100", icon: "text-blue-600", hover: "hover:bg-blue-50", active: "bg-blue-100 text-blue-700" },
    "Appointments": { bg: "bg-purple-100", icon: "text-purple-600", hover: "hover:bg-purple-50", active: "bg-purple-100 text-purple-700" },
    "Laboratory": { bg: "bg-cyan-100", icon: "text-cyan-600", hover: "hover:bg-cyan-50", active: "bg-cyan-100 text-cyan-700" },
    "Radiology": { bg: "bg-rose-100", icon: "text-rose-600", hover: "hover:bg-rose-50", active: "bg-rose-100 text-rose-700" },
    "Pharmacy": { bg: "bg-emerald-100", icon: "text-emerald-600", hover: "hover:bg-emerald-50", active: "bg-emerald-100 text-emerald-700" },
    "Billing": { bg: "bg-amber-100", icon: "text-amber-600", hover: "hover:bg-amber-50", active: "bg-amber-100 text-amber-700" },
    "Admin": { bg: "bg-slate-100", icon: "text-slate-600", hover: "hover:bg-slate-50", active: "bg-slate-100 text-slate-700" }
  };
  return colorMap[label] || { bg: "bg-gray-100", icon: "text-gray-600", hover: "hover:bg-gray-50", active: "bg-gray-100 text-gray-700" };
};

// Menu configuration with role-based access
const menuConfig = [
  {
    label: "Patient Registration",
    icon: <UserPlus className="h-5 w-5" />,
    path: "/patient-registration",
    roles: [ROLE_PERMISSIONS.RECEPTIONIST, ROLE_PERMISSIONS.DOCTOR, ROLE_PERMISSIONS.ADMIN, ROLE_PERMISSIONS.HIM]
  },
  {
    label: "Clinics",
    icon: <Building2 className="h-5 w-5" />,
    path: "/clinics",
    roles: [ROLE_PERMISSIONS.ADMIN, ROLE_PERMISSIONS.DOCTOR, ROLE_PERMISSIONS.NURSE, ROLE_PERMISSIONS.RECEPTIONIST, ROLE_PERMISSIONS.HIM]
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
    roles: [ROLE_PERMISSIONS.RECEPTIONIST, ROLE_PERMISSIONS.DOCTOR, ROLE_PERMISSIONS.ADMIN, ROLE_PERMISSIONS.HIM]
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
    roles: [ROLE_PERMISSIONS.ACCOUNTANT, ROLE_PERMISSIONS.ADMIN, ROLE_PERMISSIONS.CASHIER],
    children: [
      { 
        label: "Dashboard", 
        path: "/billing/cashier-dashboard", 
        icon: <Home className="h-4 w-4" />,
        roles: [ROLE_PERMISSIONS.ACCOUNTANT, ROLE_PERMISSIONS.ADMIN, ROLE_PERMISSIONS.CASHIER]
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

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    if (!user) return [];

    const userRole = user.user_category?.title?.toLowerCase() || '';
    const isPharmacyManager = user.is_pharmacy_store_manager;
    const isAdmin = userRole === 'admin' || userRole === 'superuser';

    return menuConfig.filter(item => {
      const hasAccess = item.roles.some(roleArray => 
        roleArray.some(role => 
          role === userRole || 
          (isPharmacyManager && role === 'pharmacy_manager') ||
          (isAdmin && role === 'admin')
        )
      );
      return hasAccess;
    }).map(item => {
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
    }).filter(item => !item.children || item.children.length > 0);
  }, [user]);

  const toggleItem = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  useEffect(() => {
    if (isMobileOpen) {
      onClose();
    }
  }, [location.pathname]);

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
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen ${sidebarWidth} bg-gradient-to-b from-slate-50 to-gray-100
        border-r border-gray-200 shadow-xl z-40 overflow-hidden flex flex-col
        transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header with Gradient */}
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-50 to-indigo-50">
          <Link to="/dashboard" className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-700">
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
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-primary-700 to-indigo-700 bg-clip-text text-transparent">
                  CareSync
                </h1>
                <p className="text-xs font-medium text-gray-500">EMR System</p>
              </div>
            )}
          </Link>
          
          <button
            onClick={onClose}
            className="lg:hidden h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* User Profile with Colorful Gradient */}
        <div className="px-4 py-2.5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center space-x-3'}`}>
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-700 flex items-center justify-center border-2 border-white shadow-md">
                <span className="text-white font-bold text-sm">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white ring-2 ring-green-300"></div>
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0 transition-opacity duration-300">
                <h3 className="font-bold text-gray-800 truncate">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-xs font-medium text-gray-500 truncate">
                  {user.pharmacy_store_name || user.user_category?.title}
                </p>
              </div>
            )}
          </div>
          
          {/* Logout Button - Mobile Only */}
          <button
            onClick={logout}
            className="lg:hidden mt-4 w-full py-2 px-4 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 rounded-lg hover:from-red-100 hover:to-rose-100 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>

        {/* Navigation Menu - Colorful Icons */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems[index];
              const colors = getMenuColors(item.label);

              return (
                <div key={index} className="mb-1">
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleItem(index)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isExpanded 
                            ? `${colors.active} shadow-sm` 
                            : `${colors.hover} text-gray-700`
                        } ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? item.label : ''}
                      >
                        <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isExpanded ? colors.bg : 'bg-gray-100'
                          } ${colors.icon}`}>
                            {item.icon}
                          </div>
                          {!isCollapsed && (
                            <span className="font-semibold text-sm">{item.label}</span>
                          )}
                        </div>
                        {!isCollapsed && (
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'transform rotate-180' : ''
                          }`} />
                        )}
                      </button>
                      
                      {isExpanded && !isCollapsed && (
                        <div className="ml-8 mt-1 space-y-1 border-l-2 border-gray-200 pl-3 py-1">
                          {item.children.map((child, childIndex) => {
                            const isChildActive = location.pathname === child.path;
                            const childColors = getMenuColors(item.label);
                            return (
                              <Link
                                key={childIndex}
                                to={child.path}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                  isChildActive
                                    ? `${childColors.active} font-semibold`
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 font-medium'
                                }`}
                                onClick={onClose}
                              >
                                <div className={`h-5 w-5 flex items-center justify-center ${
                                  isChildActive ? childColors.icon : 'text-gray-400'
                                }`}>
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
                          ? `${colors.active} shadow-sm font-semibold`
                          : `${colors.hover} text-gray-700`
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                      onClick={onClose}
                      title={isCollapsed ? item.label : ''}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? colors.bg : 'bg-gray-100'
                      } ${colors.icon}`}>
                        {item.icon}
                      </div>
                      {!isCollapsed && (
                        <span className="font-semibold text-sm">{item.label}</span>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="App Logo" 
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="h-full w-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                          <span class="text-white text-xs font-bold">CS</span>
                        </div>
                      `;
                    }}
                  />
                </div>
                <div className="text-xs font-medium text-gray-500">v1.0.0</div>
              </div>
              <div className="text-xs font-medium text-gray-500">© {new Date().getFullYear()}</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content padding */}
      <div className={`hidden lg:block ${sidebarWidth} transition-all duration-300`} />
    </>
  );
};

export default Sidebar;