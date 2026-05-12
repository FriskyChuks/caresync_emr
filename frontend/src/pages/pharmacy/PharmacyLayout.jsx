// PharmacyLayout.jsx - With conditional menu items based on user role
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const PharmacyLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Define all possible menu items
  const allMenuItems = [
    { path: '/pharmacy/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['all'] },
    { path: '/pharmacy/products', label: 'Products', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', roles: ['all'] },
    { path: '/pharmacy/brands', label: 'Brands', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', roles: ['all'] },
    { path: '/pharmacy/inventory', label: 'Inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', roles: ['all'] },
    { path: '/pharmacy/prescriptions', label: 'Prescriptions', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['pharmacist', 'admin', 'manager'] },
    { path: '/pharmacy/dispensary', label: 'Dispensary', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', roles: ['pharmacist', 'admin', 'manager'] },
    { path: '/pharmacy/suppliers', label: 'Supply', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['admin', 'manager', 'store_manager'] },
    { path: '/pharmacy/transfers', label: 'Transfers', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', roles: ['all'] },
  ];

  // Determine user role
  const getUserRole = () => {
    if (!user) return 'guest';
    
    // Superuser/Admin can see everything
    if (user.is_superuser || user?.manager) return 'admin';
    
    // Store managers can see management features
    if (user.is_pharmacy_store_manager) return 'store_manager';
    
    // Check user category
    if (user.user_category) {
      const categoryTitle = user.user_category.title?.toLowerCase();
      if (categoryTitle === 'admin' || categoryTitle === 'manager') return 'admin';
      if (categoryTitle === 'pharmacist') return 'pharmacist';
      if (categoryTitle === 'pharmacy manager') return 'store_manager';
    }
    
    // Default role - regular pharmacy staff (can only dispense/prescribe)
    return 'pharmacist';
  };

  const userRole = getUserRole();

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => {
    if (item.roles.includes('all')) return true;
    
    if (userRole === 'admin') return true; // Admins see everything
    
    if (userRole === 'store_manager') {
      // Store managers should NOT see Prescriptions and Dispensary
      return item.path !== '/pharmacy/prescriptions' && 
             item.path !== '/pharmacy/dispensary';
    }
    
    if (userRole === 'pharmacist') {
      // Pharmacists see Prescriptions and Dispensary, but NOT Supply
      if (item.path === '/pharmacy/suppliers') return false;
      return true;
    }
    
    return false;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Ultra Compact Header */}
      <div className="rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-2">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-white font-bold text-sm hidden sm:inline">PHARMACY</span>
            </div>

            {/* Navigation Tabs - With Horizontal Scroll */}
            <div className="flex-1 flex justify-end overflow-x-auto hide-scrollbar">
              <div className="flex items-center gap-1 min-w-max">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-blue-100 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      <span className="hidden md:inline">{item.label}</span>
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-blue-500 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hint for mobile users */}
      <div className="container mx-auto px-2 pt-1 md:hidden">
        <div className="text-[9px] text-gray-400 text-center">
          ← Scroll sideways for more options →
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-1">
        {children}
      </div>

      {/* Custom scrollbar hide */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
          overflow-x: auto;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default PharmacyLayout;