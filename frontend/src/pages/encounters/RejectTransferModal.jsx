import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";

const RejectTransferModal = ({ show, onClose, transfer, onSuccess }) => {
  const { showMessage } = useMessage();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show || !transfer) return null;

  const handleReject = async () => {
    if (!reason.trim()) {
      showMessage("Please provide a rejection reason.", "warning");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(`/encounterapi/reject_transfer/`, {
        transfer_id: transfer.id,
        reason,
      });

      showMessage("Transfer request rejected", "success");
      onSuccess?.(transfer.id);
      onClose();
    } catch (err) {
      console.error("Reject transfer failed:", err);
      showMessage("Failed to reject transfer.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-red-100">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-700">Reject Transfer</h3>
            </div>
            <button
              onClick={onClose}
              className="text-red-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <div className="mb-4">
            <p className="text-gray-700">
              Are you sure you want to reject transfer for{" "}
              <span className="font-semibold text-gray-900">
                {transfer.patient?.fullname || "Unknown Patient"}
              </span>
              ?
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter rejection reason..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-2"></div>
                Rejecting...
              </span>
            ) : (
              "Reject Transfer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectTransferModal;