import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';

const BatchManagementModal = ({ show, onClose, brand, onBatchUpdate }) => {
  const { showMessage } = useMessage();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [formData, setFormData] = useState({
    batch_no: '',
    production_date: '',
    expiry_date: '',
    created_by: ''
  });

  useEffect(() => {
    if (show && brand) {
      fetchBatches();
    }
  }, [show, brand]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/pharmacyapi/batches/?brand_id=${brand.id}`);
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
      showMessage('Error loading batches', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/pharmacyapi/batches/', {
        ...formData,
        brand: brand.id
      });
      
      setShowBatchForm(false);
      setFormData({
        batch_no: '',
        production_date: '',
        expiry_date: '',
        created_by: ''
      });
      fetchBatches();
      showMessage('Batch created successfully!', 'success');
    } catch (error) {
      console.error('Error creating batch:', error);
      const errorMessage = error.response?.data?.message || 'Error creating batch. Please try again.';
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

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return 'unknown';
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring_soon';
    return 'valid';
  };

  if (!show || !brand) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white">Batch Manager • {brand.name}</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-blue-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">
              Batches: {batches.length}
            </div>
            <button
              onClick={() => setShowBatchForm(!showBatchForm)}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded transition-all flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {showBatchForm ? 'Cancel' : 'Add Batch'}
            </button>
          </div>

          {/* Batch Form */}
          {showBatchForm && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border border-blue-200">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Create New Batch</h4>
              <form onSubmit={handleBatchSubmit} className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Batch No *</label>
                    <input
                      type="text"
                      className="w-full text-xs px-2 py-1.5 bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      name="batch_no"
                      value={formData.batch_no}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      placeholder="BATCH001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Prod Date</label>
                    <input
                      type="date"
                      className="w-full text-xs px-2 py-1.5 bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      name="production_date"
                      value={formData.production_date}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      className="w-full text-xs px-2 py-1.5 bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded transition-all flex items-center gap-1"
                  >
                    {loading ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Save Batch
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBatchForm(false)}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Batches Table */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-600 mt-2">Loading batches...</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-sm text-gray-500">No batches found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="py-2 px-2 text-left font-medium text-gray-700">Batch #</th>
                    <th className="py-2 px-2 text-left font-medium text-gray-700">Production</th>
                    <th className="py-2 px-2 text-left font-medium text-gray-700">Expiry</th>
                    <th className="py-2 px-2 text-left font-medium text-gray-700">Status</th>
                    <th className="py-2 px-2 text-left font-medium text-gray-700">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(batch => {
                    const expiryStatus = getExpiryStatus(batch.expiry_date);
                    const today = new Date();
                    const expiry = new Date(batch.expiry_date);
                    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <tr key={batch.id} className="border-t border-gray-100 hover:bg-blue-50">
                        <td className="py-2 px-2">
                          <span className="font-medium text-blue-700">{batch.batch_no}</span>
                        </td>
                        <td className="py-2 px-2">
                          {batch.production_date ? new Date(batch.production_date).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="py-2 px-2">
                          {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            expiryStatus === 'expired' ? 'bg-red-100 text-red-700' :
                            expiryStatus === 'expiring_soon' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {expiryStatus === 'expired' ? 'Expired' :
                             expiryStatus === 'expiring_soon' ? 'Expiring' : 'Valid'}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          {batch.expiry_date ? (
                            <span className={
                              daysUntilExpiry < 0 ? 'text-red-600 font-medium' : 
                              daysUntilExpiry <= 30 ? 'text-amber-600 font-medium' : 
                              'text-emerald-600 font-medium'
                            }>
                              {daysUntilExpiry < 0 ? `+${Math.abs(daysUntilExpiry)}` : daysUntilExpiry}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchManagementModal;