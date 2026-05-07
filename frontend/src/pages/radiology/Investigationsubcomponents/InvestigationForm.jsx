// components/InvestigationForm.js
import React from 'react';

const InvestigationForm = ({
  formData,
  units,
  isEditing = false,
  isSubmitting = false,
  onSubmit,
  onClose,
  onInputChange,
  onViewChange,
  onAddView,
  onRemoveView
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <div className="space-y-3">
          {/* Row 1: Title and Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <span className="text-rose-500">*</span> Investigation Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                placeholder="e.g., Chest X-ray, Abdominal MRI"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <span className="text-rose-500">*</span> Radiology Unit
              </label>
              <div className="relative">
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-blue-500 text-sm">
                  🏥
                </div>
                <select
                  name="radiology_unit"
                  value={formData.radiology_unit}
                  onChange={onInputChange}
                  required
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors appearance-none"
                >
                  <option value="">Select Unit</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.title}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Price and Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Base Price (₦)
              </label>
              <div className="relative">
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-emerald-500 text-sm">
                  💰
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={onInputChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Configuration
              </label>
              <div className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_views"
                    checked={formData.has_views}
                    onChange={onInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500"></div>
                </label>
                <span className="text-sm text-gray-700">Has Multiple Views</span>
              </div>
            </div>
          </div>

          {/* Views Section */}
          {formData.has_views && !isEditing && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-700">
                  Investigation Views
                </label>
                <button
                  type="button"
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                  onClick={onAddView}
                >
                  <span className="mr-1">+</span>
                  Add View
                </button>
              </div>
              
              <div className="space-y-2">
                {formData.views.map((view, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                        placeholder="View title (e.g., AP, Lateral)"
                        value={view.title}
                        onChange={(e) => onViewChange(index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                        placeholder="Price"
                        value={view.price}
                        onChange={(e) => onViewChange(index, 'price', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <button
                      type="button"
                      className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => onRemoveView(index)}
                      disabled={formData.views.length === 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.has_views && isEditing && (
            <div className="mt-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">ℹ️</span>
                <span className="text-xs text-blue-700">
                  To manage views for this investigation, use the "Views" button in the actions column.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Fields with <span className="text-rose-500">*</span> are required
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isSubmitting || !formData.title.trim() || !formData.radiology_unit}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <span className="mr-1">{isEditing ? '✏️' : '➕'}</span>
                  {isEditing ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvestigationForm;