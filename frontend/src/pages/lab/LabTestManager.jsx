// LabTestManager.jsx
import React, { useState } from "react";
import CreateLabTest from "./CreateLabTest";
import ViewTests from "./viewCreatedTest";

const LabTestManager = () => {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-1 sm:p-2">
      {/* Main Container - Ultra Compact */}
      <div className="max-w-7xl mx-auto">
        {/* Super Compact Card */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
          {/* Header - Minimal */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white/20 rounded">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h1 className="text-sm font-bold text-white">Lab Test Manager</h1>
              </div>
              <span className="text-xs px-2 py-0.5 bg-white/20 text-white rounded">v1.0</span>
            </div>
          </div>

          {/* Compact Tabs - Minimal Padding */}
          <div className="flex border-b border-blue-100">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                activeTab === "create"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                activeTab === "view"
                  ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500"
                  : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/50"
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
          </div>

          {/* Content Area - Zero Extra Padding */}
          <div className="p-1 sm:p-2">
            {activeTab === "create" && <CreateLabTest />}
            {activeTab === "view" && <ViewTests />}
          </div>

          {/* Micro Footer */}
          <div className="px-2 py-1 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${activeTab === "create" ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                <span>{activeTab === "create" ? "Creating Tests" : "Viewing Tests"}</span>
              </div>
              <span className="font-medium">{activeTab === "create" ? "Create Mode" : "View Mode"}</span>
            </div>
          </div>
        </div>

        {/* Ultra Compact Stats Row */}
        <div className="mt-2 grid grid-cols-4 gap-1">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-1.5 rounded border border-blue-200">
            <div className="text-[10px] text-blue-600 font-medium">Total</div>
            <div className="text-sm font-bold text-blue-700">∞</div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-1.5 rounded border border-indigo-200">
            <div className="text-[10px] text-indigo-600 font-medium">Active</div>
            <div className="text-sm font-bold text-indigo-700">✓</div>
          </div>
          <div className="bg-gradient-to-r from-violet-50 to-violet-100 p-1.5 rounded border border-violet-200">
            <div className="text-[10px] text-violet-600 font-medium">Ready</div>
            <div className="text-sm font-bold text-violet-700">✓</div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-1.5 rounded border border-emerald-200">
            <div className="text-[10px] text-emerald-600 font-medium">Status</div>
            <div className="text-sm font-bold text-emerald-700">ON</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabTestManager;