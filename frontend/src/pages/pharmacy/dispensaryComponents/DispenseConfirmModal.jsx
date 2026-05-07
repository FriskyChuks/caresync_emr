// dispensaryComponents/DispenseConfirmModal.jsx
import React from 'react';

const DispenseConfirmModal = ({ show, onClose, onConfirm, items, loading }) => {
  if (!show) return null;

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-red-600 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Confirm Dispense</h3>
              <p className="text-amber-100 text-xs">Review items before dispensing</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:text-amber-200 transition-colors p-1 rounded-lg hover:bg-white/10"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-blue-600 font-semibold">Items</div>
              <div className="text-xl font-bold text-blue-700">{totalItems}</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-emerald-600 font-semibold">Total Units</div>
              <div className="text-xl font-bold text-emerald-700">{totalQuantity}</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-amber-600 font-semibold">Total Value</div>
              <div className="text-xl font-bold text-amber-700">₦{totalAmount.toLocaleString()}</div>
            </div>
          </div>

          {/* Items List with detailed information */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Items to be Dispensed:</h4>
            {items.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2 border-b">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600">Item #{idx + 1}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.quantity > 0 ? 'Ready' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-[10px] text-gray-500">Brand Name</div>
                      <div className="font-medium text-gray-800">{item.brand_name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">Batch Number</div>
                      <div className="font-mono text-sm font-medium text-blue-700">{item.batch_id || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-[10px] text-gray-500">Quantity</div>
                      <div className="font-bold text-gray-800">{item.quantity} units</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">Unit Price</div>
                      <div className="font-medium text-emerald-600">₦{item.unit_price?.toLocaleString() || 0}</div>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-500">Subtotal</span>
                      <span className="text-sm font-bold text-amber-700">
                        ₦{(item.quantity * item.unit_price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Warning Message */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">⚠️ Important Notice</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>This action will permanently reduce stock levels</li>
                  <li>The selected batches will be depleted</li>
                  <li>This action cannot be undone</li>
                  <li>Please verify all items before confirming</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Confirm Dispense
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispenseConfirmModal;