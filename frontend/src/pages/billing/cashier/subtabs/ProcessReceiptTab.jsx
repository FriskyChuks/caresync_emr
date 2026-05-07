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

  const statusButtons = [
    { key: "pending", label: "⏳ Pending", color: "yellow", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "partly_paid", label: "🟡 Partly Paid", color: "amber", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "paid", label: "🟢 Paid", color: "emerald", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "cancelled", label: "❌ Cancelled", color: "red", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
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
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusButtons.map(({ key, label, color, icon }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 ${
              statusFilter === key
                ? `bg-${color}-100 border-${color}-300 text-${color}-800 shadow-sm font-semibold`
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
            {label}
          </button>
        ))}
      </div>

      {/* Selection Alert Bar */}
      {selectedBills.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">
                {selectedBills.length}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {selectedBills.length} bill{selectedBills.length > 1 ? "s" : ""} selected
                </p>
                {selectedTotal > 0 && (
                  <p className="text-sm text-gray-600">
                    Total balance: <span className="font-bold text-emerald-700">₦{selectedTotal.toLocaleString()}</span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-150"
                onClick={() => setSelectedBills([])}
              >
                Clear
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg flex items-center gap-2"
                onClick={openSelectedBillsModal}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Process Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bills Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Select</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectableBillIds.length > 0 && selectableBillIds.every((id) => selectedBills.includes(id))}
                      onChange={toggleSelectAll}
                      disabled={selectableBillIds.length === 0}
                    />
                  </div>
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-3 border-gray-300 border-t-blue-600"></div>
                        <span className="text-gray-600">Loading bills...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12">
                    <div className="text-center">
                      <svg className="h-12 w-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="mt-2 text-gray-500 font-medium">No bills found for this status</p>
                      <p className="text-sm text-gray-400">Try selecting a different status filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bills.map((bill) => {
                  const selectable = bill.balance > 0 && bill.status !== "cancelled";
                  const isSelected = selectedBills.includes(bill.id);
                  
                  return (
                    <tr 
                      key={bill.id} 
                      className={`hover:bg-gray-50 transition-colors duration-150 ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(bill.date_created).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(bill.date_created).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {bill.description}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {bill.source_model}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        ₦{Number(bill.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-emerald-700 font-medium">
                        ₦{Number(bill.amount_paid || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`text-sm font-bold ${
                          bill.balance > 0 ? 'text-amber-700' : 'text-emerald-700'
                        }`}>
                          ₦{Number(bill.balance || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(bill.status)}`}>
                          {bill.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {selectable ? (
                            <>
                              <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={isSelected}
                                onChange={() => toggleBillSelection(bill.id)}
                              />
                              <button
                                className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
                                onClick={() => openSingleBillModal(bill)}
                              >
                                Pay Now
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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