import React, { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const DrugTypeModal = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Drug type name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/pharmacyapi/drugs-types/', { name: formData.name.trim() });
      setFormData({ name: '' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating drug type:', error);
      const errorMessage = error.response?.data?.name?.[0] || 
                          error.response?.data?.message || 
                          'Error creating drug type. It might already exist.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ name: e.target.value });
    setError('');
  };

  const handleClose = () => {
    setFormData({ name: '' });
    setError('');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white">New Drug Type</h3>
          </div>
          <button onClick={handleClose} className="text-white hover:text-indigo-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded">
              <div className="flex items-start gap-2">
                <div className="p-1 bg-red-100 text-red-600 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-red-700">{error}</div>
                </div>
                <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Drug Type Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full text-xs px-2 py-1.5 bg-white border border-indigo-200 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Analgesic, Antibiotic, Antihypertensive"
                required
                autoFocus
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Therapeutic class or category of the drug
              </p>
            </div>

            {/* Examples */}
            <div className="mb-4 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded border border-indigo-200">
              <div className="text-xs text-gray-600 mb-1">Common Types:</div>
              <div className="flex flex-wrap gap-1">
                {['Analgesic', 'Antibiotic', 'Antihypertensive', 'Antidiabetic', 'Anti-inflammatory', 'Antidepressant', 'Anticoagulant', 'Bronchodilator'].map((example) => (
                  <span 
                    key={example}
                    onClick={() => setFormData({ name: example })}
                    className="cursor-pointer px-2 py-0.5 bg-white border border-indigo-200 text-indigo-700 text-xs rounded hover:bg-indigo-50"
                  >
                    {example}
                  </span>
                ))}
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
              disabled={loading || !formData.name.trim()}
              className="px-3 py-1.5 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Create Type
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugTypeModal;