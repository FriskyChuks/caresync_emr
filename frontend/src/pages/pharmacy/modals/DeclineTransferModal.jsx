import React, { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';

const DeclineTransferModal = ({ show, transfer, onClose, onSuccess }) => {
  const { showMessage } = useMessage();
  const [declineReason, setDeclineReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transfer || !declineReason.trim()) return;

    setLoading(true);
    try {
      await axiosInstance.post(`/pharmacyapi/stock-transfers/${transfer.id}/decline/`, {
        decline_reason: declineReason.trim()
      });

      onSuccess();
      onClose();
      showMessage('Transfer declined successfully!', 'success');
    } catch (error) {
      console.error('Error declining transfer:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error declining transfer. Please try again.';
      showMessage(errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!show || !transfer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white">Decline Transfer</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-red-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {/* Transfer Details */}
          <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded border border-gray-200">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Transfer Details</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-600">Product</div>
                <div className="font-medium">{transfer.product_name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600">Brand Requested</div>
                <div className="font-medium">{transfer.brand_name || 'Any Brand'}</div>
              </div>
              <div>
                <div className="text-gray-600">Quantity</div>
                <div className="font-medium text-blue-700">{transfer.requested_quantity} units</div>
              </div>
              <div colSpan="2">
                <div className="text-gray-600">Transfer</div>
                <div className="font-medium">{transfer.from_store_name} → {transfer.to_store_name}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Reason Input */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Reason for Decline <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full text-sm px-3 py-2 bg-white border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                rows="3"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                required
                disabled={loading}
                placeholder="Please provide a reason for declining this transfer request..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be visible to the requesting store
              </p>
            </div>

            {/* Warning */}
            <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded border border-amber-200">
              <div className="flex items-start gap-2">
                <div className="p-1 bg-amber-100 text-amber-600 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-medium text-amber-800">Warning</div>
                  <div className="text-xs text-amber-700 mt-0.5">
                    This action cannot be undone. The requesting store will be notified.
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !declineReason.trim()}
              className="px-3 py-1.5 text-sm bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-medium rounded transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Declining...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Decline Transfer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeclineTransferModal;