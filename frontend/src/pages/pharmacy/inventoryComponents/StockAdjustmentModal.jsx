// inventoryComponents/StockAdjustmentModal.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';
import useAuth from '../../../hooks/useAuth';

const StockAdjustmentModal = ({ show, onClose, onSuccess, storeId, storeName, adjustmentTypes }) => {
  const { showMessage } = useMessage();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchStock, setBatchStock] = useState(0);
  
  const [formData, setFormData] = useState({
    adjustment_type: '',
    quantity: '',
    unit_cost: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    if (show) {
      fetchProducts();
      resetForm();
    }
  }, [show]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.strength.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    if (selectedProduct) {
      fetchBrands(selectedProduct.id);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedBrand && storeId) {
      fetchBatches(selectedBrand.id, storeId);
    }
  }, [selectedBrand, storeId]);

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/pharmacyapi/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showMessage('Error loading products', 'danger');
    }
  };

  const fetchBrands = async (productId) => {
    try {
      const response = await axiosInstance.get(`/pharmacyapi/brands/?product_id=${productId}`);
      setBrands(response.data);
      setFilteredBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      showMessage('Error loading brands', 'danger');
    }
  };

  const fetchBatches = async (brandId, storeId) => {
    try {
      const response = await axiosInstance.get(`/pharmacyapi/batches/?brand_id=${brandId}&store_id=${storeId}`);
      setBatches(response.data);
      
      // Get stock for each batch
      const batchesWithStock = await Promise.all(
        response.data.map(async (batch) => {
          try {
            const invResponse = await axiosInstance.get(`/pharmacyapi/inventory/?batch_id=${batch.id}&store_id=${storeId}`);
            const stock = invResponse.data[0]?.quantity || 0;
            return { ...batch, stock };
          } catch {
            return { ...batch, stock: 0 };
          }
        })
      );
      setFilteredBatches(batchesWithStock);
    } catch (error) {
      console.error('Error fetching batches:', error);
      showMessage('Error loading batches', 'danger');
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchTerm(`${product.name} ${product.strength}`);
    setSelectedBrand(null);
    setSelectedBatch(null);
    setBatchStock(0);
    setFilteredProducts([]);
  };

  const handleBrandSelect = (brandId) => {
    const brand = brands.find(b => b.id === parseInt(brandId));
    setSelectedBrand(brand);
    setSelectedBatch(null);
    setBatchStock(0);
    setFormData(prev => ({ ...prev, unit_cost: brand?.cost_price || '' }));
  };

  const handleBatchSelect = (batchId) => {
    const batch = filteredBatches.find(b => b.id === parseInt(batchId));
    setSelectedBatch(batch);
    setBatchStock(batch?.stock || 0);
    
    // Auto-set max quantity for outgoing adjustments
    const adjustmentType = adjustmentTypes.find(t => t.id === parseInt(formData.adjustment_type));
    if (adjustmentType?.direction === 'out' && batch?.stock) {
      setFormData(prev => ({ ...prev, quantity: batch.stock.toString() }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-calculate if quantity exceeds available stock for outgoing
    if (name === 'quantity' && selectedBatch) {
      const adjustmentType = adjustmentTypes.find(t => t.id === parseInt(formData.adjustment_type));
      if (adjustmentType?.direction === 'out' && parseInt(value) > batchStock) {
        showMessage(`Quantity cannot exceed available stock (${batchStock} units)`, 'warning');
        setFormData(prev => ({ ...prev, quantity: batchStock.toString() }));
      }
    }
  };

  // COMPLETE handleSubmit function
  const handleSubmit = async () => {
    // Validation checks
    if (!formData.adjustment_type) {
      showMessage('Please select adjustment type', 'warning');
      return;
    }
    
    if (!selectedBatch) {
      showMessage('Please select a batch', 'warning');
      return;
    }
    
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      showMessage('Please enter a valid quantity', 'warning');
      return;
    }
    
    if (!formData.reason || formData.reason.trim() === '') {
      showMessage('Please provide a reason for this adjustment', 'warning');
      return;
    }

    const adjustmentType = adjustmentTypes.find(t => t.id === parseInt(formData.adjustment_type));
    
    // Validate outgoing doesn't exceed available stock
    if (adjustmentType?.direction === 'out' && parseInt(formData.quantity) > batchStock) {
      showMessage(`Cannot remove more than available stock (${batchStock} units)`, 'warning');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare the data for submission
      const submitData = {
        adjustment_type: parseInt(formData.adjustment_type),
        batch: selectedBatch.id,
        store: parseInt(storeId),
        quantity: parseInt(formData.quantity),
        unit_cost: parseFloat(formData.unit_cost) || selectedBatch?.brand?.cost_price || 0,
        reason: formData.reason.trim(),
        notes: formData.notes || ''
      };

      console.log('Submitting adjustment:', submitData);

      const response = await axiosInstance.post('/pharmacyapi/adjustments/', submitData);
      
      console.log('Adjustment response:', response.data);
      
      // Show success message
      const actionText = adjustmentType?.direction === 'out' ? 'removed' : 'added';
      showMessage(`Successfully ${actionText} ${submitData.quantity} units from stock!`, 'success');
      
      // Call success callback and close modal
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form and close
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Error creating adjustment:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 403) {
          showMessage('You do not have permission to adjust stock at this store. Only store managers can perform stock adjustments.', 'danger');
        } else if (errorData.quantity) {
          showMessage(errorData.quantity[0], 'danger');
        } else if (errorData.non_field_errors) {
          showMessage(errorData.non_field_errors[0], 'danger');
        } else if (errorData.message) {
          showMessage(errorData.message, 'danger');
        } else if (errorData.error) {
          showMessage(errorData.error, 'danger');
        } else {
          showMessage('Error creating stock adjustment. Please try again.', 'danger');
        }
      } else if (error.request) {
        // Request was made but no response
        showMessage('Network error. Please check your connection.', 'danger');
      } else {
        // Something else happened
        showMessage('An unexpected error occurred. Please try again.', 'danger');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      adjustment_type: '',
      quantity: '',
      unit_cost: '',
      reason: '',
      notes: ''
    });
    setSelectedProduct(null);
    setSelectedBrand(null);
    setSelectedBatch(null);
    setSearchTerm('');
    setBatchStock(0);
  };

  if (!show) return null;

  const selectedAdjustmentType = adjustmentTypes.find(t => t.id === parseInt(formData.adjustment_type));
  const isOutgoing = selectedAdjustmentType?.direction === 'out';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-4 ${isOutgoing ? 'bg-gradient-to-r from-red-600 to-rose-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600'} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Stock Adjustment</h3>
              <p className="text-xs opacity-90">{storeName}</p>
            </div>
            <button onClick={onClose} className="text-white hover:opacity-80" disabled={loading}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[70vh] space-y-4">
          {/* Adjustment Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Adjustment Type <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              name="adjustment_type"
              value={formData.adjustment_type}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              <option value="">Select type</option>
              {adjustmentTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} {type.direction === 'out' ? '📤 (Remove)' : '📥 (Add)'}
                </option>
              ))}
            </select>
          </div>

          {/* Product Search */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Product <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Search product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {searchTerm && filteredProducts.length > 0 && !loading && (
              <div className="mt-1 border border-gray-200 rounded-lg max-h-32 overflow-y-auto bg-white shadow-lg z-10 relative">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="p-2 text-sm hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleProductSelect(product)}
                  >
                    <span className="font-medium">{product.name}</span>
                    <span className="text-gray-500 ml-1">{product.strength}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brand Selection */}
          {selectedProduct && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedBrand?.id || ''}
                onChange={(e) => handleBrandSelect(e.target.value)}
                disabled={loading}
              >
                <option value="">Select brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name} - ₦{parseFloat(brand.cost_price).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Batch Selection */}
          {selectedBrand && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Batch <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedBatch?.id || ''}
                onChange={(e) => handleBatchSelect(e.target.value)}
                disabled={loading}
              >
                <option value="">Select batch</option>
                {filteredBatches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batch_no} - {batch.stock || 0} units - Exp: {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'}
                  </option>
                ))}
              </select>
              {selectedBatch && (
                <p className="text-xs text-gray-500 mt-1">
                  Available stock: <span className="font-semibold">{batchStock} units</span>
                </p>
              )}
            </div>
          )}

          {/* Quantity & Unit Cost */}
          {selectedBatch && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="1"
                  max={isOutgoing ? batchStock : undefined}
                  disabled={loading}
                />
                {isOutgoing && batchStock > 0 && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Max: {batchStock} units
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Unit Cost (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  name="unit_cost"
                  value={formData.unit_cost}
                  onChange={handleInputChange}
                  placeholder="Auto from brand"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Total Value Preview */}
          {formData.quantity && formData.unit_cost && (
            <div className="p-2 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-bold text-blue-700">
                  ₦{(parseFloat(formData.quantity) * parseFloat(formData.unit_cost)).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              name="reason"
              rows="2"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Explain why this adjustment is needed..."
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              name="notes"
              rows="2"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional information..."
              disabled={loading}
            />
          </div>

          {/* Warning for outgoing adjustments */}
          {isOutgoing && parseInt(formData.quantity) > 0 && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>This will remove {formData.quantity} units from stock</span>
              </div>
            </div>
          )}

          {/* Info for incoming adjustments */}
          {selectedAdjustmentType && !isOutgoing && parseInt(formData.quantity) > 0 && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>This will add {formData.quantity} units to stock</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.adjustment_type || !selectedBatch || !formData.quantity || !formData.reason}
            className={`px-4 py-2 text-sm text-white rounded-lg transition-all flex items-center gap-2 ${
              isOutgoing 
                ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                {isOutgoing ? 'Remove Stock' : 'Add Stock'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;