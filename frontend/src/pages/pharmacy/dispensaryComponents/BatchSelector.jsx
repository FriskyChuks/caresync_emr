// dispensaryComponents/BatchSelector.jsx
import React, { useState, useEffect } from 'react';

const BatchSelector = ({
  detailId,
  productId,
  prescribedQuantity,
  selectedBatch,
  quantity,
  availableBatches,
  loading,
  onFetchBatches,
  onBatchSelect,
  onQuantityChange
}) => {
  const [showBatchList, setShowBatchList] = useState(false);
  const [tempBatchId, setTempBatchId] = useState(null);
  const [tempQuantity, setTempQuantity] = useState('');

  useEffect(() => {
    if (!availableBatches && productId) {
      onFetchBatches();
    }
  }, [productId]);

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { status: 'expired', label: 'Expired', color: 'text-red-600', bg: 'bg-red-50' };
    if (daysLeft <= 30) return { status: 'soon', label: `${daysLeft} days left`, color: 'text-amber-600', bg: 'bg-amber-50' };
    return { status: 'valid', label: `${daysLeft} days left`, color: 'text-emerald-600', bg: 'bg-emerald-50' };
  };

  const handleBatchConfirm = () => {
    if (tempBatchId && tempQuantity) {
      const batch = availableBatches.find(b => b.batch_id === parseInt(tempBatchId));
      if (batch) {
        onBatchSelect(tempBatchId, batch.available_quantity, batch.unit_price);
        onQuantityChange(parseInt(tempQuantity));
      }
    }
    setShowBatchList(false);
    setTempBatchId(null);
    setTempQuantity('');
  };

  const handleBatchCancel = () => {
    setShowBatchList(false);
    setTempBatchId(null);
    setTempQuantity('');
  };

  if (selectedBatch) {
    // Show selected batch
    return (
      <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500">Selected Batch</div>
            <div className="text-sm font-medium text-gray-800 truncate">
              {selectedBatch.batch_id}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="text-xs text-gray-500 block">Quantity</label>
              <input
                type="number"
                min="1"
                max={selectedBatch.max_quantity}
                value={quantity || ''}
                onChange={(e) => onQuantityChange(e.target.value)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Unit Price</div>
              <div className="text-sm font-semibold text-emerald-600">
                ₦{selectedBatch.unit_price.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show batch selection button
  return (
    <div className="mt-2">
      {!showBatchList ? (
        <button
          onClick={() => setShowBatchList(true)}
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Select Batch
        </button>
      ) : (
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500 ml-2">Loading batches...</span>
            </div>
          ) : !availableBatches || availableBatches.length === 0 ? (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-xs text-amber-700">No batches available</p>
            </div>
          ) : (
            <>
              <select
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={tempBatchId || ''}
                onChange={(e) => setTempBatchId(e.target.value)}
              >
                <option value="">Select a batch</option>
                {availableBatches.map(batch => {
                  const expiryStatus = getExpiryStatus(batch.expiry_date);
                  return (
                    <option key={batch.batch_id} value={batch.batch_id}>
                      {batch.batch_no} - {batch.available_quantity} units available - Exp: {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'}
                    </option>
                  );
                })}
              </select>
              
              {tempBatchId && (
                <>
                  <input
                    type="number"
                    placeholder={`Quantity (max ${availableBatches.find(b => b.batch_id === parseInt(tempBatchId))?.available_quantity || 0})`}
                    value={tempQuantity}
                    onChange={(e) => setTempQuantity(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    min="1"
                    max={availableBatches.find(b => b.batch_id === parseInt(tempBatchId))?.available_quantity || 0}
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleBatchConfirm}
                      disabled={!tempQuantity || parseInt(tempQuantity) <= 0}
                      className="flex-1 px-2 py-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={handleBatchCancel}
                      className="flex-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchSelector;