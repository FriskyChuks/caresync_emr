import React, { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';

const PharmacyStoreModal = ({ show, onClose, onSuccess }) => {
  const { showMessage } = useMessage();
  const [formData, setFormData] = useState({
    name: '',
    store_type: '',
    location: '',
    is_bulk_store: false
  });
  const [storeTypes, setStoreTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const defaultStoreTypes = [
    { id: 1, name: 'Inpatient Pharmacy' },
    { id: 2, name: 'Outpatient Pharmacy' },
    { id: 3, name: 'Bulk Store' },
    { id: 4, name: 'Emergency Pharmacy' },
    { id: 5, name: 'O&G Pharmacy' },
    { id: 6, name: 'GOPD Pharmacy' }
  ];

  React.useEffect(() => {
    setStoreTypes(defaultStoreTypes);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/pharmacyapi/pharmacy-stores/', formData);
      
      setFormData({
        name: '',
        store_type: '',
        location: '',
        is_bulk_store: false
      });
      onSuccess();
      onClose();
      showMessage('Pharmacy store created successfully!', 'success');
    } catch (error) {
      console.error('Error creating pharmacy store:', error);
      const errorMessage = error.response?.data?.message || 'Error creating store. Please try again.';
      showMessage(errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white">New Pharmacy Store</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-blue-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Store Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full text-xs px-2 py-1.5 bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="e.g., Main Pharmacy, Bulk Store A"
              />
            </div>

            {/* Store Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Store Type <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full text-xs px-2 py-1.5 bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                name="store_type"
                value={formData.store_type}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="" className="text-xs">Select Store Type</option>
                {storeTypes.map(type => (
                  <option key={type.id} value={type.id} className="text-xs">
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full text-xs px-2 py-1.5 bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="e.g., Ground Floor, Building A"
              />
            </div>

            {/* Bulk Store Checkbox */}
            <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border border-blue-200">
              <input
                type="checkbox"
                className="w-3 h-3 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                id="is_bulk_store"
                name="is_bulk_store"
                checked={formData.is_bulk_store}
                onChange={handleInputChange}
                disabled={loading}
              />
              <label className="text-xs text-gray-700 cursor-pointer" htmlFor="is_bulk_store">
                This is a bulk store (main storage facility)
              </label>
            </div>

            {/* Store Type Preview */}
            {formData.store_type && (
              <div className="p-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded border border-emerald-200">
                <div className="text-xs text-gray-600">Store Type</div>
                <div className="text-sm font-medium text-emerald-700">
                  {storeTypes.find(t => t.id == formData.store_type)?.name}
                  {formData.is_bulk_store && ' • Bulk Store'}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.name || !formData.store_type}
              className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Create Store
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyStoreModal;