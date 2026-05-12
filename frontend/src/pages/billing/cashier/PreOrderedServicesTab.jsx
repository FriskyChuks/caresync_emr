import React, { useState } from "react";
import PatientSearch from "./subtabs/PatientSearch";
import ProcessReceiptTab from "./subtabs/ProcessReceiptTab";
import PendingServicesTab from "./subtabs/PendingServicesTab";

const PreOrderedServicesTab = () => {
  const [patient, setPatient] = useState(null);
  const [subTab, setSubTab] = useState("receipt");

  return (
    <div className="space-y-3">
      {!patient ? (
        <div className="">
          {/* <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
              <span className="text-white text-sm">🔍</span>
            </div>
            <h3 className="text-base font-bold text-gray-800">Patient Search</h3>
          </div> */}
          <PatientSearch onSelect={setPatient} />
        </div>
      ) : (
        <>
          {/* Patient Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 text-sm">👤</span>
                  <h3 className="text-sm font-bold text-gray-800 truncate">
                    {patient.fullname}
                  </h3>
                  <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                    PID:{patient.patient_number}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                  <span>📱 {patient.phone}</span>
                  <span>•</span>
                  <span>{patient.gender}</span>
                  <span>•</span>
                  <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    ₦{patient.wallet_balance.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                className="ml-2 px-2.5 py-1 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                onClick={() => setPatient(null)}
              >
                🔄 Change
              </button>
            </div>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                subTab === "receipt"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setSubTab("receipt")}
            >
              <span className="flex items-center justify-center gap-1">
                <span>💰</span>
                <span>Process Receipt</span>
              </span>
            </button>
            <button
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                subTab === "pending"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setSubTab("pending")}
            >
              <span className="flex items-center justify-center gap-1">
                <span>⏳</span>
                <span>Pending Services</span>
              </span>
            </button>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg border border-gray-200">
            {subTab === "receipt" && <ProcessReceiptTab patient={patient} />}
            {subTab === "pending" && <PendingServicesTab patient={patient} />}
          </div>
        </>
      )}
    </div>
  );
};

export default PreOrderedServicesTab;