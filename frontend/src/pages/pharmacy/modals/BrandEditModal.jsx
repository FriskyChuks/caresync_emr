// BrandEditModal.jsx - Pure Brand Editing (No Batch Fields)
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';

const BrandEditModal = ({ show, onClose, brand, onBrandUpdate }) => {
  const { showMessage } = useMessage();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        barcode: brand.barcode || '',
        cost_price: brand.cost_price || '',
        selling_price: brand.selling_price || '',
        unit_of_sale: brand.unit_of_sale || 1,
        reorder_level: brand.reorder_level || 10
      });
    }
  }, [brand]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brand) return;

    // Validation
    if (parseFloat(formData.selling_price) < parseFloat(formData.cost_price)) {
      showMessage('Selling price cannot be less than cost price', 'warning');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name,
        barcode: formData.barcode || null,
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        unit_of_sale: parseInt(formData.unit_of_sale),
        reorder_level: parseInt(formData.reorder_level)
      };

      await axiosInstance.patch(`/pharmacyapi/brands/${brand.id}/`, submitData);
      
      if (onBrandUpdate) onBrandUpdate();
      onClose();
      showMessage('Brand updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating brand:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.name?.[0] ||
                          'Error updating brand. Please try again.';
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

  const calculateProfitMargin = () => {
    if (!formData.cost_price || !formData.selling_price) return 0;
    const cost = parseFloat(formData.cost_price);
    const selling = parseFloat(formData.selling_price);
    if (cost === 0) return 0;
    return ((selling - cost) / cost * 100).toFixed(1);
  };

  const profitMargin = calculateProfitMargin();

  if (!show || !brand) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Edit Brand</h3>
              <p className="text-blue-100 text-xs">Update brand information</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-blue-200 transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {/* Brand Info Card */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Product:</span>
                <span className="font-medium text-gray-800 ml-2">{brand.product_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Stock:</span>
                <span className={`font-medium ml-2 ${
                  brand.stock_level === 0 ? 'text-red-600' :
                  brand.is_low_stock ? 'text-amber-600' :
                  'text-emerald-600'
                }`}>
                  {brand.stock_level || 0} units
                </span>
              </div>
              <div>
                <span className="text-gray-600">Batches:</span>
                <span className="font-medium text-gray-800 ml-2">{brand.batches_count || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-800 ml-2">
                  {new Date(brand.date_created).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="e.g., Emzor Paracetamol"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Optional barcode"
              />
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price (₦) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₦</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (₦) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₦</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Profit Margin Display */}
            {formData.cost_price && formData.selling_price && (
              <div className={`p-3 rounded-lg ${
                profitMargin >= 30 ? 'bg-emerald-50 border border-emerald-200' :
                profitMargin >= 10 ? 'bg-blue-50 border border-blue-200' :
                'bg-amber-50 border border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profit Margin:</span>
                  <span className={`text-lg font-bold ${
                    profitMargin >= 30 ? 'text-emerald-700' :
                    profitMargin >= 10 ? 'text-blue-700' :
                    'text-amber-700'
                  }`}>
                    {profitMargin}%
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">Profit per unit:</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    ₦{(parseFloat(formData.selling_price) - parseFloat(formData.cost_price)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Stock Settings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit of Sale
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  name="unit_of_sale"
                  value={formData.unit_of_sale}
                  onChange={handleInputChange}
                  disabled={loading}
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Units per sale (e.g., strip of 10)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reorder Level
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  name="reorder_level"
                  value={formData.reorder_level}
                  onChange={handleInputChange}
                  disabled={loading}
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when stock below this level</p>
              </div>
            </div>

            {/* Information Note */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Batches are created only during supply receipt</li>
                    <li>Stock levels are managed through Supply and Stock Adjustments</li>
                    <li>To view batch details, go to Inventory → Batches</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.cost_price || !formData.selling_price}
            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Update Brand
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandEditModal;