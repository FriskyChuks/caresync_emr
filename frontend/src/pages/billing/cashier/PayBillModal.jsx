import React, { useState } from "react";
import ReusableModal from "../../../components/common/ReusableModal";
import axiosInstance from "../../../api/axiosInstance";
import { useMessage } from "../../../context/MessageProvider";

const PayBillModal = ({ patient, bills = [], onClose, onSuccess }) => {
  const { showMessage } = useMessage();
  const [saving, setSaving] = useState(false);

  const totalBalance = bills.reduce((sum, b) => sum + Number(b.balance || 0), 0);

  const [form, setForm] = useState({
    amount: totalBalance,
    payment_method: "cash",
    notes: "",
  });

  const submit = async () => {
    if (!form.payment_method)
      return showMessage("Select payment method", "warning");
    if (Number(form.amount) <= 0)
      return showMessage("Invalid amount", "warning");

    setSaving(true);

    try {
      if (bills.length === 1) {
        const bill = bills[0];
        const amountToPay = Math.min(bill.balance, form.amount);

        await axiosInstance.post(`/billsapi/bills/${bill.id}/pay/`, {
          ...form,
          amount: amountToPay,
        });

        showMessage("Payment recorded", "success");
      } else {
        if (!patient?.id)
          return showMessage("Cannot identify patient", "danger");

        const billsData = bills.map((b) => ({
          id: b.id,
          amount: Math.min(b.balance, form.amount),
        }));

        await axiosInstance.post("/billsapi/cashier/process-receipt/", {
          patient: patient.id,
          payment_method: form.payment_method,
          notes: form.notes,
          bills: billsData,
        });

        showMessage(
          `Payment recorded for ${bills.length} bills`,
          "success"
        );
      }

      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.error || "Payment failed. Please try again.";
      showMessage(message, "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ReusableModal
      show={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-gray-900">
              Process Payment
            </div>
            <div className="text-sm text-gray-600">
              {bills.length > 1
                ? `${bills.length} bills selected`
                : `Bill #${bills[0]?.id || ""}`}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Bill Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Total Balance</span>
            <span className="text-xl font-bold text-emerald-700">
              ₦{totalBalance.toLocaleString()}
            </span>
          </div>
          
          {bills.length > 1 ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-600 font-medium">Selected Bills:</div>
              <div className="max-h-32 overflow-y-auto pr-2">
                {bills.map((b) => (
                  <div key={b.id} className="flex justify-between items-center py-1.5 border-b border-blue-100 last:border-b-0">
                    <div className="text-sm text-gray-700 truncate max-w-xs">{b.description}</div>
                    <div className="text-sm font-semibold text-gray-900">₦{b.balance.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm font-medium text-gray-900">{bills[0]?.description}</div>
            </div>
          )}
        </div>

        {/* Payment Form */}
        <div className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">₦</span>
              </div>
              <input
                type="number"
                className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                min="0"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setForm({ ...form, amount: totalBalance })}
                >
                  Full Amount
                </button>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["cash", "pos", "transfer", "wallet"].map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`px-3 py-2 rounded-lg border transition-all duration-150 ${
                    form.payment_method === method
                      ? "bg-blue-50 border-blue-300 text-blue-700 font-medium"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setForm({ ...form, payment_method: method })}
                >
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="2"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Add payment notes..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-150"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
            onClick={submit}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : bills.length > 1 ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pay Selected Bills
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Pay Now
              </>
            )}
          </button>
        </div>
      </div>
    </ReusableModal>
  );
};

export default PayBillModal;