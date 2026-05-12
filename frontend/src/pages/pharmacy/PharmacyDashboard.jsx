// PharmacyDashboard.jsx - Compact & Mobile Friendly
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import PharmacyLayout from './PharmacyLayout';

// =============================================================================
// Constants & Configuration
// =============================================================================

const STATS_CONFIG = [
  { key: 'products', label: 'PROD', valueKey: 'total_products', color: 'blue', icon: '💊' },
  { key: 'prescriptions', label: 'Rxs', valueKey: 'total_prescriptions', color: 'emerald', icon: '📋' },
  { key: 'pending', label: 'PEND', valueKey: 'pending_prescriptions', color: 'amber', icon: '⏳' },
  { key: 'lowstock', label: 'LOW', valueKey: 'low_stock_items', color: 'red', icon: '⚠️' },
];

const COLOR_SCHEMES = {
  stat: {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  },
  action: {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    emerald: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700',
    amber: 'from-amber-50 to-amber-100 border-amber-200 text-amber-700',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
  },
  alert: {
    amber: 'from-amber-50 to-yellow-50 border-amber-200 text-amber-700',
    blue: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-700',
  },
};

// =============================================================================
// Main Component
// =============================================================================

const PharmacyDashboard = () => {
  // State
  const [dashboardData, setDashboardData] = useState({
    total_products: 0,
    total_prescriptions: 0,
    pending_prescriptions: 0,
    low_stock_items: 0,
  });
  const [loading, setLoading] = useState(true);

  // Effects
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handlers
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/pharmacyapi/dashboard/overview/');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Derived data
  const stats = STATS_CONFIG.map(stat => ({
    ...stat,
    value: dashboardData[stat.valueKey],
  }));

  // Render loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PharmacyLayout>
      <div className="space-y-2">
        <DashboardHeader onRefresh={fetchDashboardData} />
        <StatsGrid stats={stats} />
        <QuickActionsSection />
        <AlertsSection 
          lowStockCount={dashboardData.low_stock_items}
          pendingCount={dashboardData.pending_prescriptions}
        />
      </div>
    </PharmacyLayout>
  );
};

// =============================================================================
// Subcomponents
// =============================================================================

const LoadingSpinner = () => (
  <PharmacyLayout>
    <div className="min-h-[300px] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-10 h-10 border-3 border-blue-100 rounded-full" />
        <div className="absolute top-0 left-0 w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="mt-3 text-sm text-blue-600 font-medium">Loading dashboard...</p>
    </div>
  </PharmacyLayout>
);

const DashboardHeader = ({ onRefresh }) => (
  <div className="flex items-center justify-between px-2 py-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-lg shadow">
    <div className="flex items-center gap-1.5">
      <div className="p-1 bg-white/20 rounded">
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
          />
        </svg>
      </div>
      <span className="text-xs font-bold text-white">Pharmacy Dashboard</span>
    </div>
    
    <button
      onClick={onRefresh}
      className="p-0.5 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
      title="Refresh data"
      aria-label="Refresh dashboard"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
    </button>
  </div>
);

const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-4 gap-1">
    {stats.map((stat) => (
      <StatCard key={stat.key} {...stat} />
    ))}
  </div>
);

const StatCard = ({ icon, value, label, color }) => (
  <div className={`${COLOR_SCHEMES.stat[color]} rounded-md p-1 text-center`}>
    <div className="text-sm">{icon}</div>
    <div className="text-base font-bold leading-tight">{value}</div>
    <div className="text-[8px] font-semibold uppercase tracking-tighter">{label}</div>
  </div>
);

const QuickActionsSection = () => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-1.5 border-b border-gray-200">
      <h3 className="text-xs font-semibold text-gray-800 flex items-center gap-1">
        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
        Quick Actions
      </h3>
    </div>
    
    <div className="grid grid-cols-2 gap-0.5 p-1">
      <ActionLink to="/pharmacy/products" label="Products" icon="➕" color="blue" />
      <ActionLink to="/pharmacy/prescriptions" label="Prescribe" icon="📝" color="emerald" />
      <ActionLink to="/pharmacy/dispensary" label="Dispense" icon="💊" color="amber" />
      <ActionLink to="/pharmacy/transfers" label="Transfer" icon="🔄" color="purple" />
    </div>
  </div>
);

const ActionLink = ({ to, label, icon, color }) => (
  <Link
    to={to}
    className={`flex items-center gap-1.5 p-1.5 rounded bg-gradient-to-r ${COLOR_SCHEMES.action[color]} border shadow-sm hover:shadow transition-all`}
  >
    <span className="text-sm" aria-hidden="true">{icon}</span>
    <span className="text-xs font-medium">{label}</span>
    <svg 
      className="w-2.5 h-2.5 ml-auto opacity-50" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  </Link>
);

const AlertsSection = ({ lowStockCount, pendingCount }) => (
  <div className="space-y-1">
    {lowStockCount > 0 && (
      <AlertCard
        type="lowstock"
        count={lowStockCount}
        message="items need attention"
        link="/pharmacy/inventory"
        color="amber"
      />
    )}
    
    {pendingCount > 0 && (
      <AlertCard
        type="pending"
        count={pendingCount}
        message="prescriptions awaiting"
        link="/pharmacy/dispensary"
        color="blue"
      />
    )}
  </div>
);

const AlertCard = ({ type, count, message, link, color }) => {
  const icons = {
    lowstock: '⚠️',
    pending: '⏳',
  };

  return (
    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${COLOR_SCHEMES.alert[color]} border`}>
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <span className="text-xs" aria-hidden="true">{icons[type]}</span>
          <div>
            <span className="text-xs font-semibold">{count}</span>
            <span className="text-[10px] ml-0.5">{message}</span>
          </div>
        </div>
        
        <Link
          to={link}
          className="px-1.5 py-0.5 bg-white/80 text-[10px] font-medium rounded shadow-sm hover:bg-white transition-colors"
        >
          View →
        </Link>
      </div>
    </div>
  );
};

export default PharmacyDashboard;