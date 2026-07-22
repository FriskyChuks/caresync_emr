import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import PayBillModal from "../PayBillModal";
import { useMessage } from "../../../../context/MessageProvider";

const ProcessReceiptTab = ({ patient }) => {
  const { showMessage } = useMessage();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBills, setSelectedBills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeBills, setActiveBills] = useState([]);

  useEffect(() => {
    if (patient?.id) fetchBills();
    else {
      setBills([]);
      setSelectedBills([]);
    }
  }, [patient, statusFilter]);

  const fetchBills = async () => {
    setLoading(true);
    setSelectedBills([]);
    try {
      const res = await axiosInstance.get(
        `/billsapi/cashier/bills/?patient=${patient?.id}&status=${statusFilter}`
      );
      setBills(res.data || []);
    } catch (err) {
      console.error("fetchBills error:", err);
      showMessage("Failed to fetch bills", "danger");
    } finally {
      setLoading(false);
    }
  };

  const getSourceDescription = (sourceModel) => {
    const sourceMap = {
      'testrequestdetail': { label: 'Lab', icon: '🔬', color: 'bg-purple-100 text-purple-800' },
      'labrequestdetail': { label: 'Lab', icon: '🧪', color: 'bg-purple-100 text-purple-800' },
      'labrequest': { label: 'Lab', icon: '🔬', color: 'bg-purple-100 text-purple-800' },
      'requestdetail': { label: 'Radiology', icon: '📷', color: 'bg-blue-100 text-blue-800' },
      'radiologyrequest': { label: 'Radiology', icon: '🩻', color: 'bg-blue-100 text-blue-800' },
      'radiologyrequestdetail': { label: 'Radiology', icon: '📷', color: 'bg-blue-100 text-blue-800' },
      'prescriptiondetail': { label: 'Pharmacy', icon: '💊', color: 'bg-emerald-100 text-emerald-800' },
      'prescription': { label: 'Pharmacy', icon: '💊', color: 'bg-emerald-100 text-emerald-800' },
      'servicerequestdetail': { label: 'Medical', icon: '🩺', color: 'bg-amber-100 text-amber-800' },
    };
    
    const defaultSource = { label: 'Other', icon: '📋', color: 'bg-gray-100 text-gray-800' };
    return sourceMap[sourceModel] || defaultSource;
  };

  const statusButtons = [
    { key: "pending", label: "Pending", color: "yellow", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "partly_paid", label: "Partly Paid", color: "amber", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "paid", label: "Paid", color: "emerald", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "cancelled", label: "Cancelled", color: "red", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  const selectableBillIds = bills
    .filter((b) => b && b.balance > 0 && b.status !== "cancelled")
    .map((b) => b.id);

  const toggleBillSelection = (billId) => {
    setSelectedBills((prev) =>
      prev.includes(billId)
        ? prev.filter((id) => id !== billId)
        : [...prev, billId]
    );
  };

  const toggleSelectAll = () => {
    const allSelected =
      selectableBillIds.length > 0 &&
      selectableBillIds.every((id) => selectedBills.includes(id));
    setSelectedBills(allSelected ? [] : selectableBillIds);
  };

  const openSingleBillModal = (bill) => {
    setActiveBills([bill]);
    setShowModal(true);
  };

  const openSelectedBillsModal = () => {
    const selected = bills.filter((b) => selectedBills.includes(b.id));
    if (selected.length === 0)
      return showMessage("Select at least one bill to process", "warning");
    setActiveBills(selected);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setSelectedBills([]);
    setActiveBills([]);
    fetchBills();
  };

  const handleModalClose = () => {
    setShowModal(false);
    setActiveBills([]);
  };

  const selectedTotal = bills
    .filter((b) => selectedBills.includes(b.id))
    .reduce((sum, b) => sum + Number(b.balance || 0), 0);

  const getStatusColor = (status) => {
    switch (status) {
      case "partly_paid": return "bg-amber-50 border-amber-200 text-amber-800";
      case "paid": return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "cancelled": return "bg-red-50 border-red-200 text-red-800";
      default: return "bg-yellow-50 border-yellow-200 text-yellow-800";
    }
  };

  return (
    <div className="space-y-3">
      {/* Status Filter - Horizontal Scroll on Mobile */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex gap-1.5 min-w-max">
          {statusButtons.map(({ key, label, color, icon }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                statusFilter === key
                  ? `bg-${color}-100 border border-${color}-300 text-${color}-800 shadow-sm`
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Selection Alert Bar */}
      {selectedBills.length > 0 && (
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs">
                {selectedBills.length}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {selectedBills.length} bill{selectedBills.length > 1 ? "s" : ""} selected
                </p>
                {selectedTotal > 0 && (
                  <p className="text-xs text-gray-600">
                    Total: <span className="font-bold text-emerald-700">₦{selectedTotal.toLocaleString()}</span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-1.5">
              <button
                className="px-2.5 py-1.5 text-xs border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                onClick={() => setSelectedBills([])}
              >
                Clear
              </button>
              <button
                className="px-2.5 py-1.5 text-xs bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-green-700 flex items-center gap-1"
                onClick={openSelectedBillsModal}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Process
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bills Cards - Mobile Friendly */}
      <div className="space-y-2">
        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              <span className="text-gray-600 text-sm">Loading bills...</span>
            </div>
          </div>
        ) : bills.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <svg className="h-10 w-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-2 text-gray-500 text-sm">No bills found</p>
          </div>
        ) : (
          bills.map((bill) => {
            const selectable = bill.balance > 0 && bill.status !== "cancelled";
            const isSelected = selectedBills.includes(bill.id);
            const sourceInfo = getSourceDescription(bill.source_model);
            
            return (
              <div 
                key={bill.id} 
                className={`rounded-lg border bg-white overflow-hidden transition-all ${
                  isSelected ? 'border-blue-300 bg-blue-50/30 shadow-sm' : 'border-gray-200'
                }`}
              >
                {/* Bill Header */}
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(bill.date_created).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(bill.date_created).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(bill.status)}`}>
                      {bill.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Bill Body */}
                <div className="p-3 space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {bill.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm">{sourceInfo.icon}</span>
                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${sourceInfo.color}`}>
                        {sourceInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Amount Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-semibold text-gray-900">₦{Number(bill.amount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Paid</p>
                      <p className="text-sm font-semibold text-emerald-700">₦{Number(bill.amount_paid || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Balance</p>
                      <p className={`text-sm font-bold ${bill.balance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        ₦{Number(bill.balance || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {selectable ? (
                      <>
                        <button
                          className={`flex-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                          }`}
                          onClick={() => toggleBillSelection(bill.id)}
                        >
                          {isSelected ? (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </button>
                        <button
                          className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-1"
                          onClick={() => openSingleBillModal(bill)}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Pay Now
                        </button>
                      </>
                    ) : (
                      <div className="w-full text-center text-xs text-gray-400 py-1.5">
                        {bill.status === 'cancelled' ? 'Cancelled' : 'Fully Paid'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Select All Footer (when bills exist) */}
      {bills.length > 0 && !loading && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={selectableBillIds.length > 0 && selectableBillIds.every((id) => selectedBills.includes(id))}
                onChange={toggleSelectAll}
                disabled={selectableBillIds.length === 0}
              />
              <span className="text-xs text-gray-600">
                Select All Available
              </span>
            </div>
            {selectedBills.length > 0 && (
              <div className="text-xs font-semibold text-emerald-700">
                ₦{selectedTotal.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showModal && (
        <PayBillModal
          patient={patient}
          bills={activeBills}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default ProcessReceiptTab;