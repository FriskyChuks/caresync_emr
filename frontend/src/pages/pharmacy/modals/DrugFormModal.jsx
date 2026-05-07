import React, { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const DrugFormModal = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Drug form name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/pharmacyapi/drugs-forms/', { name: formData.name.trim() });
      setFormData({ name: '' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating drug form:', error);
      const errorMessage = error.response?.data?.name?.[0] || 
                          error.response?.data?.message || 
                          'Error creating drug form. It might already exist.';
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white">New Drug Form</h3>
          </div>
          <button onClick={handleClose} className="text-white hover:text-blue-200">
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
                Drug Form Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full text-xs px-2 py-1.5 bg-white border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Tablet, Capsule, Syrup"
                required
                autoFocus
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the physical form of the drug
              </p>
            </div>

            {/* Examples */}
            <div className="mb-4 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border border-blue-200">
              <div className="text-xs text-gray-600 mb-1">Examples:</div>
              <div className="flex flex-wrap gap-1">
                {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Powder', 'Solution', 'Suspension'].map((example) => (
                  <span 
                    key={example}
                    onClick={() => setFormData({ name: example })}
                    className="cursor-pointer px-2 py-0.5 bg-white border border-blue-200 text-blue-700 text-xs rounded hover:bg-blue-50"
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
                  Create Form
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugFormModal;