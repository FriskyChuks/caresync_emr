import React, { useState } from "react";
import PatientSearch from "./subtabs/PatientSearch";
import ProcessReceiptTab from "./subtabs/ProcessReceiptTab";
import PendingServicesTab from "./subtabs/PendingServicesTab";

const PreOrderedServicesTab = () => {
  const [patient, setPatient] = useState(null);
  const [subTab, setSubTab] = useState("receipt");

  return (
    <div className="space-y-3 sm:space-y-4">
      {!patient ? (
        <div>
          <PatientSearch onSelect={setPatient} />
        </div>
      ) : (
        <>
          {/* Compact Patient Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-2.5 sm:p-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              {/* Left - Patient Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base">👤</span>
                  <h3 className="text-sm font-bold text-gray-800 truncate max-w-[120px] sm:max-w-none">
                    {patient.fullname}
                  </h3>
                  <span className="text-xs font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {patient.patient_number}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 flex-wrap">
                  <div className="flex items-center gap-0.5">
                    <span className="text-sm">📱</span>
                    <span className="text-xs">{patient.phone}</span>
                  </div>
                  <span className="text-gray-300 text-xs">•</span>
                  <div className="flex items-center gap-0.5">
                    <span className="text-sm">⚥</span>
                    <span className="text-xs">{patient.gender}</span>
                  </div>
                  <span className="text-gray-300 text-xs">•</span>
                  <div className="flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    <span className="text-xs">💰</span>
                    <span className="font-semibold text-emerald-700 text-xs">
                      ₦{patient.wallet_balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right - Change Button */}
              <button
                className="flex-shrink-0 px-2 py-1 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 flex items-center gap-1"
                onClick={() => setPatient(null)}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Change</span>
              </button>
            </div>
          </div>

          {/* Sub-Tab Navigation - More prominent */}
          <div className="bg-gray-100 rounded-xl p-1 shadow-inner">
            <div className="flex gap-2">
              <button
                className={`flex-1 px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
                  subTab === "receipt"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400 ring-offset-1"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                }`}
                onClick={() => setSubTab("receipt")}
              >
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="hidden xs:inline">Process Receipt</span>
                  <span className="xs:hidden">Receipt</span>
                </span>
              </button>
              <button
                className={`flex-1 px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
                  subTab === "pending"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-400 ring-offset-1"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                }`}
                onClick={() => setSubTab("pending")}
              >
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Pending Services</span>
                </span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
            <div className="p-3 sm:p-4">
              {subTab === "receipt" && <ProcessReceiptTab patient={patient} />}
              {subTab === "pending" && <PendingServicesTab patient={patient} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PreOrderedServicesTab;