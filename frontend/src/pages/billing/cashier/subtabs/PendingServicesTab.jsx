// src/pages/billing/cashier/subtabs/PendingServicesTab.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import { useMessage } from "../../../../context/MessageProvider";
import POSReceipt from "../../receipts/POSReceipt";
import A4Receipt from "../../receipts/A4Receipt";

const PendingServicesTab = ({ patient }) => {
  const { showMessage } = useMessage();
  const [requests, setRequests] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptType, setReceiptType] = useState(null);

  useEffect(() => {
    if (patient) fetchRequests();
  }, [patient]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/servicesapi/uncompleted_requests/${patient.id}/`);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      showMessage("Failed to fetch service requests", "danger");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (reqId, detailId) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      const set = new Set(copy[reqId] || []);
      if (set.has(detailId)) set.delete(detailId);
      else set.add(detailId);
      if (set.size) copy[reqId] = Array.from(set);
      else delete copy[reqId];
      return copy;
    });
  };

  const toggleAllForRequest = (reqId, details) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      const available = details.filter((d) => d.status !== "completed").map((d) => d.id);
      const selected = new Set(copy[reqId] || []);
      const allSelected = available.every((id) => selected.has(id));

      copy[reqId] = allSelected ? [] : available;
      if (!copy[reqId].length) delete copy[reqId];
      return copy;
    });
  };

  const toggleAllGlobal = () => {
    setSelectedItems((prev) => {
      const allSelected = Object.keys(prev).length && requests.every((r) => {
        const available = r.details.filter((d) => d.status !== "completed").map((d) => d.id);
        return (
          prev[r.id] &&
          prev[r.id].length === available.length &&
          available.length > 0
        );
      });

      if (allSelected) return {};
      const all = {};
      requests.forEach((r) => {
        const available = r.details.filter((d) => d.status !== "completed").map((d) => d.id);
        if (available.length) all[r.id] = available;
      });
      return all;
    });
  };

  const totalSelected = () => {
    let t = 0;
    requests.forEach((r) => {
      const sel = selectedItems[r.id] || [];
      sel.forEach((did) => {
        const d = r.details.find((dd) => dd.id === did);
        if (d && d.status !== "completed") t += Number(d.total_amount);
      });
    });
    return t;
  };

  const handleBillPay = () => {
    if (!Object.keys(selectedItems).length)
      return showMessage("Select at least one item", "warning");

    const total = totalSelected();
    if (paymentMethod === "wallet" && patient.wallet_balance < total)
      return showMessage(`Insufficient wallet balance. Available: ₦${patient.wallet_balance}`, "danger");

    setShowConfirm(true);
  };

  const confirmBillPay = async () => {
    setShowConfirm(false);
    setSaving(true);
    try {
      const payload = {
        patient: patient.id,
        source: Object.entries(selectedItems).map(([reqId, details]) => ({
          request_id: Number(reqId),
          details,
        })),
        payment_method: paymentMethod,
        notes: `Cashier bill & pay via ${paymentMethod}`,
      };

      const response = await axiosInstance.post("/billsapi/bill_and_pay_pending_services/", payload);
      showMessage("Billed and payment processed", "success");
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setReceiptData({
        ...response.data,
        payment_method: paymentMethod,
        amount_paid: totalSelected(),
        subtotal: totalSelected(),
        discount: 0,
        balance: 0,
        cashier_name: user?.first_name || user?.username || 'System',
        receipt_no: response.data.receipt_no || `RCP-${Date.now()}`,
        date_created: new Date().toISOString(),
        bills: response.data.bills || []
      });
      
      setSelectedItems({});
      fetchRequests();
      setShowReceipt(true);
    } catch (err) {
      console.error(err);
      showMessage("Failed to process billing/payment", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleReceiptTypeSelect = (type) => {
    setReceiptType(type);
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setReceiptData(null);
    setReceiptType(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600 text-sm">Loading pending services...</p>
        </div>
      </div>
    );
  }

  const allAvailable = requests.flatMap((r) =>
    r.details.filter((d) => d.status !== "completed").map((d) => d.id)
  );
  const allSelectedIds = Object.values(selectedItems).flat();
  const allGloballySelected =
    allAvailable.length > 0 &&
    allAvailable.every((id) => allSelectedIds.includes(id));

  if (showReceipt && receiptData && receiptType === 'pos') {
    return (
      <POSReceipt
        payment={receiptData}
        patient={patient}
        bills={receiptData.bills || []}
        onClose={handleReceiptClose}
        onPrint={() => {}}
      />
    );
  }

  if (showReceipt && receiptData && receiptType === 'a4') {
    return (
      <A4Receipt
        payment={receiptData}
        patient={patient}
        bills={receiptData.bills || []}
        onClose={handleReceiptClose}
        onPrint={() => {}}
      />
    );
  }

  if (showReceipt && receiptData && !receiptType) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative max-w-md w-full">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Payment Successful!</h3>
                <p className="text-gray-600 text-sm">Amount Paid: <span className="font-bold text-green-600">₦{receiptData.amount_paid?.toLocaleString()}</span></p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => handleReceiptTypeSelect('pos')}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg text-sm"
                >
                  🧾 Print POS Receipt
                </button>
                
                <button
                  onClick={() => handleReceiptTypeSelect('a4')}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg text-sm"
                >
                  📄 Print A4 Receipt
                </button>
                
                <button
                  onClick={handleReceiptClose}
                  className="w-full py-2.5 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-600 font-medium">Total Selected</p>
            <p className="text-2xl font-bold text-emerald-700">₦{totalSelected().toLocaleString()}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">Pay with:</label>
            <select
              className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">💵 Cash</option>
              <option value="wallet">👛 Wallet</option>
              <option value="pos">💳 POS</option>
              <option value="transfer">🏦 Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Service Cards - Mobile Friendly */}
      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">No pending services found</p>
          </div>
        ) : (
          requests.map((req) => {
            const availableDetails = req.details.filter(d => d.status !== "completed");
            const selectedCount = selectedItems[req.id]?.length || 0;
            
            return (
              <div key={req.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                {/* Request Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2.5 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-800">Request #{req.id}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(req.date_requested).toLocaleDateString()}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        req.status === "completed" ? "bg-green-100 text-green-800" : 
                        req.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    
                    <button
                      className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                      onClick={() => toggleAllForRequest(req.id, req.details)}
                    >
                      {selectedCount === availableDetails.length ? "✗ Unselect" : "✓ Select All"}
                    </button>
                  </div>
                </div>

                {/* Service Items */}
                <div className="divide-y divide-gray-100">
                  {req.details.map((d) => {
                    const isCompleted = d.status === "completed";
                    const isChecked = selectedItems[req.id]?.includes(d.id) || false;
                    
                    return (
                      <div 
                        key={d.id} 
                        className={`p-3 ${isCompleted ? 'bg-gray-50 opacity-60' : 'hover:bg-blue-50/30'} transition-colors cursor-pointer`}
                        onClick={() => !isCompleted && toggleItem(req.id, d.id)}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            disabled={isCompleted}
                            checked={isChecked}
                            onChange={() => toggleItem(req.id, d.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-1">
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-medium text-sm text-gray-900">
                                    {d.service_name}
                                  </span>
                                  {!isCompleted && (
                                    <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                      pending
                                    </span>
                                  )}
                                </div>
                                {d.category_name && (
                                  <p className="text-xs text-gray-500 mt-0.5">{d.category_name}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-emerald-700 text-sm">
                                  ₦{Number(d.total_amount).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {d.quantity} × ₦{Number(d.unit_price).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Footer - Sticky on Mobile */}
      {requests.length > 0 && (
        <div className="sticky bottom-0 pt-2">
          <button
            className={`w-full py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg ${
              Object.keys(selectedItems).length === 0 || saving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200'
            }`}
            onClick={handleBillPay}
            disabled={saving || !Object.keys(selectedItems).length}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                💰 Bill & Pay (₦{totalSelected().toLocaleString()})
              </span>
            )}
          </button>
        </div>
      )}

      {/* Confirmation Modal - Mobile Friendly */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowConfirm(false)}
            ></div>
            
            <div className="relative w-full max-w-sm rounded-xl bg-white shadow-xl">
              <div className="p-5">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                
                <h3 className="text-base font-semibold text-gray-900 text-center mb-1">
                  Confirm Payment
                </h3>
                
                <p className="text-sm text-gray-600 text-center mb-4">
                  Bill & pay <span className="font-bold text-emerald-700">₦{totalSelected().toLocaleString()}</span> via{' '}
                  <span className="font-bold text-blue-600 capitalize">{paymentMethod}</span>
                </p>
                
                {paymentMethod === "wallet" && patient.wallet_balance < totalSelected() && (
                  <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 font-medium">
                      ⚠️ Insufficient balance! Available: ₦{patient.wallet_balance.toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-3 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm"
                    onClick={confirmBillPay}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingServicesTab;