import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';

const HonorTransferModal = ({ show, transfer, onClose, onSuccess }) => {
  const { showMessage } = useMessage();
  const [loading, setLoading] = useState(false);
  const [fetchingBatches, setFetchingBatches] = useState(false);
  const [brandsData, setBrandsData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [totalSelectedQuantity, setTotalSelectedQuantity] = useState(0);

  useEffect(() => {
    if (transfer && show) {
      fetchAvailableBatches();
      resetForm();
    }
  }, [transfer, show]);

  const resetForm = () => {
    setSelectedItems([]);
    setNotes('');
    setTotalSelectedQuantity(0);
  };

  const fetchAvailableBatches = async () => {
    if (!transfer) return;
    
    setFetchingBatches(true);
    try {
      const response = await axiosInstance.get(`/pharmacyapi/stock-transfers/${transfer.id}/available-batches/`);
      console.log('Available batches:', response.data);
      setBrandsData(response.data);
    } catch (error) {
      console.error('Error fetching available batches:', error);
      showMessage('Error loading available batches', 'warning');
      setBrandsData([]);
    } finally {
      setFetchingBatches(false);
    }
  };

  const handleAddBatch = (batch, brandName) => {
    // Check if batch is already selected
    const existingItem = selectedItems.find(item => item.batch_id === batch.batch_id);
    if (existingItem) {
      showMessage('This batch is already selected', 'warning');
      return;
    }

    // Add new batch selection
    setSelectedItems([...selectedItems, {
      batch_id: batch.batch_id,
      batch_no: batch.batch_no,
      brand_name: brandName,
      expiry_date: batch.expiry_date,
      max_quantity: batch.available_quantity,
      quantity: 0
    }]);
  };

  const handleRemoveBatch = (batchId) => {
    const item = selectedItems.find(i => i.batch_id === batchId);
    if (item) {
      setTotalSelectedQuantity(prev => prev - item.quantity);
    }
    setSelectedItems(selectedItems.filter(item => item.batch_id !== batchId));
  };

  const handleQuantityChange = (batchId, quantity) => {
    const quantityNum = parseInt(quantity) || 0;
    const item = selectedItems.find(i => i.batch_id === batchId);
    
    if (item) {
      const oldQuantity = item.quantity;
      const newTotal = totalSelectedQuantity - oldQuantity + quantityNum;
      
      // Check if total exceeds requested quantity
      if (newTotal > transfer.requested_quantity) {
        showMessage(`Total quantity cannot exceed ${transfer.requested_quantity} units`, 'warning');
        return;
      }
      
      // Update item quantity
      setSelectedItems(selectedItems.map(item => 
        item.batch_id === batchId 
          ? { ...item, quantity: quantityNum }
          : item
      ));
      
      setTotalSelectedQuantity(newTotal);
    }
  };

  const handleSubmit = async () => {
    if (totalSelectedQuantity === 0) {
      showMessage('Please select at least one batch to send', 'warning');
      return;
    }

    setLoading(true);
    
    // Track success and failures
    let successCount = 0;
    let errorCount = 0;
    
    try {
      // Send all selected batches
      for (const item of selectedItems) {
        if (item.quantity > 0) {
          try {
            await axiosInstance.post(`/pharmacyapi/stock-transfers/${transfer.id}/honor/`, {
              honored_quantity: item.quantity,
              batch_id: item.batch_id,
              notes: notes
            });
            successCount++;
          } catch (err) {
            errorCount++;
            console.error(`Failed to honor batch ${item.batch_no}:`, err);
          }
        }
      }

      // Show appropriate message
      if (successCount > 0 && errorCount === 0) {
        if (totalSelectedQuantity === transfer.requested_quantity) {
          showMessage(`Transfer fully honored! ${totalSelectedQuantity} units sent successfully.`, 'success');
        } else {
          showMessage(`Transfer partially honored! ${totalSelectedQuantity} of ${transfer.requested_quantity} units sent.`, 'info');
        }
      } else if (successCount > 0 && errorCount > 0) {
        showMessage(`Partially completed: ${successCount} batches honored, ${errorCount} failed.`, 'warning');
      } else {
        showMessage('Failed to honor transfer. Please try again.', 'danger');
      }

      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error honoring transfer:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error honoring transfer. Please try again.';
      showMessage(errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!show || !transfer) return null;

  const remainingNeeded = transfer.requested_quantity - totalSelectedQuantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Honor Transfer</h3>
              <p className="text-emerald-100 text-sm">Select batches to send from your store</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-emerald-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {/* Transfer Summary */}
          <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Product</div>
                <div className="font-semibold text-gray-800">{transfer.product_name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Requesting Store</div>
                <div className="font-semibold text-gray-800">{transfer.to_store_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Quantity Requested</div>
                <div className="font-bold text-blue-700">{transfer.requested_quantity} units</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Remaining to Send</div>
                <div className={`font-bold ${remainingNeeded > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {remainingNeeded > 0 ? remainingNeeded : 0} units
                </div>
              </div>
            </div>
          </div>

          {/* Available Stock Section */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Available Stock in Your Store</h4>
            
            {fetchingBatches ? (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-500 mt-2">Loading available batches...</p>
              </div>
            ) : brandsData.length === 0 ? (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <svg className="w-10 h-10 text-amber-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-amber-700">No available stock for this product</p>
                <p className="text-xs text-amber-600 mt-1">Please receive stock first</p>
              </div>
            ) : (
              <div className="space-y-4">
                {brandsData.map(brand => (
                  <div key={brand.brand_id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h5 className="font-semibold text-gray-800">{brand.brand_name}</h5>
                    </div>
                    <div className="divide-y">
                      {brand.batches.map(batch => {
                        const isSelected = selectedItems.some(i => i.batch_id === batch.batch_id);
                        return (
                          <div key={batch.batch_id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-medium text-gray-700">{batch.batch_no}</span>
                                {batch.is_expiring_soon && (
                                  <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded whitespace-nowrap">⚠️ Expiring Soon</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Expires: {new Date(batch.expiry_date).toLocaleDateString()} | Available: {batch.available_quantity} units
                              </div>
                            </div>
                            {!isSelected ? (
                              <button
                                onClick={() => handleAddBatch(batch, brand.brand_name)}
                                className="px-3 py-1 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors whitespace-nowrap ml-2"
                              >
                                + Add
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRemoveBatch(batch.batch_id)}
                                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors whitespace-nowrap ml-2"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Batches Section */}
          {selectedItems.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Selected Batches to Send</h4>
              <div className="space-y-2">
                {selectedItems.map(item => (
                  <div key={item.batch_id} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800">{item.brand_name}</div>
                        <div className="text-xs text-gray-600">{item.batch_no}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Qty:</label>
                        <input
                          type="number"
                          min="0"
                          max={item.max_quantity}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.batch_id, e.target.value)}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <span className="text-xs text-gray-500">/ {item.max_quantity}</span>
                        <button
                          onClick={() => handleRemoveBatch(item.batch_id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Selected:</span>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${totalSelectedQuantity === transfer.requested_quantity ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {totalSelectedQuantity} / {transfer.requested_quantity} units
                      </span>
                      {totalSelectedQuantity < transfer.requested_quantity && (
                        <div className="text-xs text-amber-600 mt-1">
                          ⚠️ Sending {transfer.requested_quantity - totalSelectedQuantity} units less than requested
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this transfer..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedItems.length === 0 || totalSelectedQuantity === 0}
            className="px-5 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
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
                Send {totalSelectedQuantity} Unit{totalSelectedQuantity !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HonorTransferModal;