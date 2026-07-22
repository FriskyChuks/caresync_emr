import React, { useState } from "react";
import PreOrderedServicesTab from "./PreOrderedServicesTab";
import WalkInPaymentsTab from "./WalkInPaymentsTab";

const CashierDashboard = () => {
  const [activeTab, setActiveTab] = useState("preordered");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-2 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header - More compact on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              💳 Cashier Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">Manage patient payments and services</p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full self-start sm:self-auto">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tab Navigation - More prominent and visible */}
        <div className="bg-white rounded-xl border border-gray-200 p-1.5 shadow-sm">
          <div className="flex gap-2">
            <button
              className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === "preordered"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400 ring-offset-1"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
              onClick={() => setActiveTab("preordered")}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden xs:inline">Pre-Ordered</span>
                <span className="xs:hidden">Orders</span>
              </div>
            </button>
            <button
              className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === "walkin"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400 ring-offset-1"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
              onClick={() => setActiveTab("walkin")}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Walk-In</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area - Responsive padding */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-3 sm:p-4 md:p-6">
            {activeTab === "preordered" && <PreOrderedServicesTab />}
            {activeTab === "walkin" && <WalkInPaymentsTab />}
          </div>
        </div>

        {/* Stats Footer - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-full bg-white">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-600">Active Session</div>
                <div className="font-bold text-gray-900 text-sm sm:text-base">Cashier Mode</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-full bg-white">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-600">Ready to Process</div>
                <div className="font-bold text-gray-900 text-sm sm:text-base">All Payments</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-full bg-white">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-600">Secure Mode</div>
                <div className="font-bold text-gray-900 text-sm sm:text-base">Secured</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;