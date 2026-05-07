// inventoryComponents/BatchDetailModal.jsx
import React from 'react';

const BatchDetailModal = ({ show, onClose, batch }) => {
  if (!show || !batch) return null;

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'unknown', label: 'Unknown', color: 'gray' };
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { status: 'expired', label: 'Expired', color: 'red', days: Math.abs(daysLeft) };
    if (daysLeft <= 30) return { status: 'expiring', label: 'Expiring Soon', color: 'amber', days: daysLeft };
    return { status: 'valid', label: 'Valid', color: 'emerald', days: daysLeft };
  };

  const expiryStatus = getExpiryStatus(batch.expiry_date);
  
  const statusColors = {
    red: 'bg-red-100 text-red-700 border-red-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Batch Details</h3>
              <p className="text-blue-100 text-xs">{batch.batch_no}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-blue-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Product Info */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs text-gray-500">Product</div>
                <div className="font-semibold text-gray-800">{batch.brand?.product?.name || batch.product_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Brand</div>
                <div className="font-semibold text-gray-800">{batch.brand?.name || batch.brand_name}</div>
              </div>
            </div>
          </div>

          {/* Batch Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-gray-50 rounded-lg border">
              <div className="text-xs text-gray-500">Batch Number</div>
              <div className="font-mono font-medium text-gray-800">{batch.batch_no}</div>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg border">
              <div className="text-xs text-gray-500">Created</div>
              <div className="text-sm text-gray-800">{new Date(batch.date_created).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-gray-50 rounded-lg border">
              <div className="text-xs text-gray-500">Production Date</div>
              <div className="text-sm text-gray-800">
                {batch.production_date ? new Date(batch.production_date).toLocaleDateString() : 'Not recorded'}
              </div>
            </div>
            <div className={`p-2 rounded-lg border ${statusColors[expiryStatus.color]}`}>
              <div className="text-xs opacity-75">Expiry Date</div>
              <div className="text-sm font-semibold">
                {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'Not set'}
              </div>
              {expiryStatus.days && (
                <div className="text-[10px] mt-0.5">
                  {expiryStatus.status === 'expired' 
                    ? `Expired ${expiryStatus.days} days ago`
                    : `${expiryStatus.days} days remaining`}
                </div>
              )}
            </div>
          </div>

          {/* Stock Info (if available) */}
          {batch.stock !== undefined && (
            <div className={`p-3 rounded-lg border ${
              batch.stock === 0 ? 'bg-red-50 border-red-200' : 
              batch.stock < 10 ? 'bg-amber-50 border-amber-200' : 
              'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Stock</span>
                <span className={`text-2xl font-bold ${
                  batch.stock === 0 ? 'text-red-600' : 
                  batch.stock < 10 ? 'text-amber-600' : 
                  'text-emerald-600'
                }`}>
                  {batch.stock} units
                </span>
              </div>
            </div>
          )}

          {/* Store Info (if available) */}
          {batch.store_name && (
            <div className="p-2 bg-gray-50 rounded-lg border">
              <div className="text-xs text-gray-500">Store Location</div>
              <div className="text-sm text-gray-800">{batch.store_name}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchDetailModal;