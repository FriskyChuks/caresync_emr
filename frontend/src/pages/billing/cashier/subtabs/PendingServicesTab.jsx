import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import { useMessage } from "../../../../context/MessageProvider";

const PendingServicesTab = ({ patient }) => {
  const { showMessage } = useMessage();
  const [requests, setRequests] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showConfirm, setShowConfirm] = useState(false);

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

      if (allSelected) return {}; // unselect all

      // select all available
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

      await axiosInstance.post("/billsapi/bill_and_pay_pending_services/", payload);
      showMessage("Billed and payment processed", "success");
      setSelectedItems({});
      fetchRequests();
    } catch (err) {
      console.error(err);
      showMessage("Failed to process billing/payment", "danger");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading pending services...</p>
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Total Selected</h3>
            <p className="text-3xl font-bold text-emerald-700">₦{totalSelected().toLocaleString()}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Payment Method:</label>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="wallet">Wallet</option>
              <option value="pos">POS</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <button
                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-150"
                    onClick={toggleAllGlobal}
                  >
                    {allGloballySelected ? "✗ Unselect All" : "✓ Select All"}
                  </button>
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No pending services found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <React.Fragment key={req.id}>
                    {/* Request Header Row */}
                    <tr className="bg-gray-50">
                      <td colSpan="5" className="px-4 py-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="font-semibold text-gray-800">Request #{req.id}</span>
                          <span className="text-sm text-gray-600">
                            {new Date(req.date_requested).toLocaleString()} • 
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              req.status === "completed" ? "bg-green-100 text-green-800" : 
                              req.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {req.status}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150"
                          onClick={() => toggleAllForRequest(req.id, req.details)}
                        >
                          {selectedItems[req.id]?.length ===
                          req.details.filter((d) => d.status !== "completed").length
                            ? "✗ Unselect All"
                            : "✓ Select All"}
                        </button>
                      </td>
                    </tr>

                    {/* Service Details */}
                    {req.details.map((d) => {
                      const isCompleted = d.status === "completed";
                      const isChecked = selectedItems[req.id]?.includes(d.id) || false;
                      
                      return (
                        <tr 
                          key={d.id} 
                          className={`hover:bg-gray-50 ${isCompleted ? 'opacity-60' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {d.service_name}
                              </span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                d.status === "completed" ? "bg-green-100 text-green-800" : 
                                "bg-blue-100 text-blue-800"
                              }`}>
                                {d.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {d.category_name || d.category}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {d.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ₦{Number(d.unit_price).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            ₦{Number(d.total_amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              disabled={isCompleted}
                              checked={isChecked}
                              onChange={() => toggleItem(req.id, d.id)}
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end">
        <button
          className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 shadow-lg ${
            Object.keys(selectedItems).length === 0 || saving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200'
          }`}
          onClick={handleBillPay}
          disabled={saving || !Object.keys(selectedItems).length}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Processing...
            </span>
          ) : (
            "💰 Bill & Pay Selected"
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowConfirm(false)}
            ></div>
            
            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Confirm Payment
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  You're about to bill and pay <span className="font-bold text-emerald-700">₦{totalSelected().toLocaleString()}</span> via{' '}
                  <span className="font-bold text-blue-600">{paymentMethod}</span>.
                </p>
                
                {paymentMethod === "wallet" && patient.wallet_balance < totalSelected() && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Insufficient wallet balance! Available: ₦{patient.wallet_balance.toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-150"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150 shadow-sm"
                    onClick={confirmBillPay}
                  >
                    Confirm Payment
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