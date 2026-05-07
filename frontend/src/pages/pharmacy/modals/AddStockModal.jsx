import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';

const AddStockModal = ({ show, onClose, brand, onStockUpdate }) => {
  const { showMessage } = useMessage();
  const [stores, setStores] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    batch: '',
    supplier: '',
    store: '',
    quantity_supplied: '',
    supply_price: '',
    created_by: ''
  });

  useEffect(() => {
    if (show && brand) {
      fetchDropdownData();
      fetchBatches();
    }
  }, [show, brand]);

  const fetchDropdownData = async () => {
    try {
      const [storesResponse, suppliersResponse] = await Promise.all([
        axiosInstance.get('/pharmacyapi/pharmacy-stores/'),
        axiosInstance.get('/pharmacyapi/suppliers/')
      ]);
      setStores(storesResponse.data);
      setSuppliers(suppliersResponse.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      showMessage('Error loading form data', 'danger');
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await axiosInstance.get(`/pharmacyapi/batches/?brand_id=${brand.id}`);
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        quantity_supplied: parseInt(formData.quantity_supplied),
        supply_price: parseFloat(formData.supply_price),
        created_by: formData.created_by
      };

      await axiosInstance.post('/pharmacyapi/supplies/', submitData);
      
      resetForm();
      onStockUpdate();
      onClose();
      showMessage('Stock added successfully!', 'success');
    } catch (error) {
      console.error('Error adding stock:', error);
      const errorMessage = error.response?.data?.message || 'Error adding stock. Please try again.';
      showMessage(errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      batch: '',
      supplier: '',
      store: '',
      quantity_supplied: '',
      supply_price: '',
      created_by: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show || !brand) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white">Add Stock • {brand.name}</h3>
          </div>
          <button onClick={handleClose} className="text-white hover:text-blue-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {/* Brand Info */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border border-blue-200">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-blue-700">{brand.name}</span>
              <span className="text-blue-500">•</span>
              <span className="text-gray-600">{brand.product_name}</span>
              <span className="text-blue-500">•</span>
              <span className="font-medium text-gray-700">Stock: {brand.stock_level || 0} units</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Batch *</label>
                <select
                  className="w-full text-xs px-2 py-1.5 bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  name="batch"
                  value={formData.batch}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="" className="text-xs">Select Batch</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id} className="text-xs">
                      {batch.batch_no} 
                      {batch.expiry_date && ` (Exp: ${new Date(batch.expiry_date).toLocaleDateString('en-GB')})`}
                    </option>
                  ))}
                </select>
                {batches.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No batches available</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Supplier *</label>
                <select
                  className="w-full text-xs px-2 py-1.5 bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="" className="text-xs">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id} className="text-xs">
                      {supplier.company_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store *</label>
                <select
                  className="w-full text-xs px-2 py-1.5 bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  name="store"
                  value={formData.store}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="" className="text-xs">Select Store</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id} className="text-xs">
                      {store.name} {store.is_bulk_store && '(Bulk)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  className="w-full text-xs px-2 py-1.5 bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  name="quantity_supplied"
                  value={formData.quantity_supplied}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  min="1"
                  placeholder="Units"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Price (₦) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <span className="text-xs text-gray-500">₦</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full text-xs pl-6 pr-2 py-1.5 bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    name="supply_price"
                    value={formData.supply_price}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current: ₦{parseFloat(brand.cost_price).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Total Value</label>
                <div className="px-2 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded">
                  <span className="text-sm font-bold text-emerald-700">
                    ₦{formData.quantity_supplied && formData.supply_price 
                      ? (parseFloat(formData.quantity_supplied) * parseFloat(formData.supply_price)).toLocaleString()
                      : '0.00'}
                  </span>
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
              onClick={handleClose}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.batch || !formData.supplier || !formData.store || !formData.quantity_supplied || !formData.supply_price}
              className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Stock
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStockModal;