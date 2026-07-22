// src/pages/billing/cashier/PayBillModal.jsx
import React, { useState } from "react";
import ReusableModal from "../../../components/common/ReusableModal";
import axiosInstance from "../../../api/axiosInstance";
import { useMessage } from "../../../context/MessageProvider";
import POSReceipt from "../receipts/POSReceipt";
import A4Receipt from "../receipts/A4Receipt";

const PayBillModal = ({ patient, bills = [], onClose, onSuccess }) => {
  const { showMessage } = useMessage();
  const [saving, setSaving] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptType, setReceiptType] = useState(null); // 'pos' or 'a4'

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
      let response;
      if (bills.length === 1) {
        const bill = bills[0];
        const amountToPay = Math.min(bill.balance, form.amount);

        response = await axiosInstance.post(`/billsapi/bills/${bill.id}/pay/`, {
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

        response = await axiosInstance.post("/billsapi/cashier/process-receipt/", {
          patient: patient.id,
          payment_method: form.payment_method,
          notes: form.notes,
          bills: billsData,
        });

        showMessage(`Payment recorded for ${bills.length} bills`, "success");
      }

      // Get cashier name from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Calculate amounts
      const amountPaid = Number(form.amount);
      const subtotal = totalBalance;
      const balance = totalBalance - amountPaid;
      
      // Prepare receipt data
      const receiptInfo = {
        ...response.data,
        payment_method: form.payment_method,
        notes: form.notes,
        amount_paid: amountPaid,
        subtotal: subtotal,
        discount: 0,
        balance: balance > 0 ? balance : 0,
        cashier_name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || 'System',
        receipt_no: response.data?.receipt_no || `RCP-${Date.now()}`,
        date_created: new Date().toISOString(),
        bills: bills.map(bill => ({
          id: bill.id,
          description: bill.description,
          amount: bill.amount,
          balance: bill.balance,
          source_model: bill.source_model,
          amount_paid: Math.min(bill.balance, amountPaid)
        }))
      };
      
      setReceiptData(receiptInfo);
      
      // Show receipt selection modal - DO NOT call onSuccess yet
      setShowReceipt(true);
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.error || "Payment failed. Please try again.";
      showMessage(message, "danger");
    } finally {
      setSaving(false);
    }
  };

  // console.log('receiptData', receiptData);

  const handleReceiptTypeSelect = (type) => {
    setReceiptType(type);
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setReceiptData(null);
    setReceiptType(null);
    // Now call onSuccess to refresh the parent component
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  // If receipt type is selected, show the appropriate receipt
  if (showReceipt && receiptData && receiptType === 'pos') {
    return (
      <POSReceipt
        payment={receiptData}
        patient={patient}
        bills={receiptData.bills || bills}
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
        bills={receiptData.bills || bills}
        onClose={handleReceiptClose}
        onPrint={() => {}}
      />
    );
  }

  // If receipt is showing but no type selected yet, show receipt selection modal
  if (showReceipt && receiptData && !receiptType) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative max-w-md w-full">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                <p className="text-gray-600">Amount Paid: <span className="font-bold text-green-600">₦{receiptData.amount_paid?.toLocaleString()}</span></p>
                {receiptData.balance > 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    Remaining Balance: ₦{receiptData.balance.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleReceiptTypeSelect('pos')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:from-gray-900 hover:to-black transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print POS Receipt (Thermal Printer)
                </button>
                
                <button
                  onClick={() => handleReceiptTypeSelect('a4')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Print A4 Receipt (Detailed)
                </button>
                
                <button
                  onClick={handleReceiptClose}
                  className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
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