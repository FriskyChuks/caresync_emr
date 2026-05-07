// components/RadiologyUnitsManager.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useMessage } from '../../context/MessageProvider';

const RadiologyUnitsManager = () => {
  const { showMessage } = useMessage();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [formData, setFormData] = useState({ title: '', id: null });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const response = await axiosInstance.get('/radiologyapi/units/');
      setUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
      showMessage('Failed to load radiology units', 'error');
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Unit title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Unit title must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      if (isEditing) {
        const response = await axiosInstance.put(`/radiologyapi/units/${formData.id}/`, {
          title: formData.title.trim()
        });

        setUnits(prev => prev.map(unit => 
          unit.id === formData.id ? response.data : unit
        ));
        
        showMessage(`Radiology unit "${response.data.title}" updated successfully!`, 'success');
      } else {
        const response = await axiosInstance.post('/radiologyapi/units/', {
          title: formData.title.trim()
        });

        setUnits(prev => [response.data, ...prev]);
        
        showMessage(`Radiology unit "${response.data.title}" created successfully!`, 'success');
      }
      
      resetForm();
      
    } catch (error) {
      console.error('Error saving radiology unit:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.title) {
          setErrors({ title: Array.isArray(errorData.title) ? errorData.title.join(' ') : errorData.title });
        } else if (errorData.detail) {
          showMessage(`${errorData.detail}`, 'error');
        } else {
          showMessage('Failed to save radiology unit', 'error');
        }
      } else {
        showMessage('Network error. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUnit = (unit) => {
    setFormData({
      id: unit.id,
      title: unit.title
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', id: null });
    setErrors({});
    setIsEditing(false);
  };

  const handleDeleteUnit = async (unitId, unitTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${unitTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/radiologyapi/units/${unitId}/`);
      
      setUnits(prev => prev.filter(unit => unit.id !== unitId));
      
      showMessage(`Radiology unit "${unitTitle}" deleted successfully!`, 'success');
      
      if (isEditing && formData.id === unitId) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      
      if (error.response?.status === 409) {
        showMessage('Cannot delete unit. It may have associated investigations.', 'error');
      } else if (error.response?.data?.detail) {
        showMessage(`${error.response.data.detail}`, 'error');
      } else {
        showMessage('Failed to delete radiology unit', 'error');
      }
    }
  };

  const filteredUnits = units.filter(unit =>
    unit.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-200 shadow-sm">
          {/* Header */}
          <div className={`p-3 border-b border-gray-200 ${isEditing ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">{isEditing ? '✏️' : '➕'}</span>
                <h3 className="text-sm font-bold text-gray-800">
                  {isEditing ? 'Edit Unit' : 'Add New Unit'}
                </h3>
              </div>
              {isEditing && (
                <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                  EDITING
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {isEditing 
                ? `Editing: ${formData.title}`
                : 'Create a new radiology unit category'
              }
            </p>
          </div>

          {/* Form */}
          <div className="p-3">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Unit Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., CT Scan, MRI, X-Ray"
                  disabled={loading}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                    errors.title 
                      ? 'border-rose-300 bg-rose-50 focus:border-rose-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-rose-600">{errors.title}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter a descriptive name for the radiology unit
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.title.trim()}
                      className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1"></div>
                          Updating...
                        </>
                      ) : (
                        'Update Unit'
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setFormData({ title: '' })}
                      disabled={loading}
                      className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.title.trim()}
                      className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1"></div>
                          Creating...
                        </>
                      ) : (
                        'Create Unit'
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>

            {/* Quick Tips */}
            <div className="mt-4 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-blue-600">💡</span>
                <span className="text-xs font-medium text-gray-700">Quick Tips</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-0.5">
                <li className="flex items-center">
                  <span className="mr-1">•</span>
                  Use clear, descriptive names
                </li>
                <li className="flex items-center">
                  <span className="mr-1">•</span>
                  Examples: MRI, CT Scan, X-Ray, Ultrasound
                </li>
                <li className="flex items-center">
                  <span className="mr-1">•</span>
                  Each unit can contain multiple investigations
                </li>
                {isEditing && (
                  <li className="flex items-center text-amber-600 font-medium">
                    <span className="mr-1">⚠️</span>
                    You are currently editing an existing unit
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Units List Section */}
      <div className="lg:col-span-2">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-200 shadow-sm h-full">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">🏥</span>
                <h3 className="text-sm font-bold text-gray-800">
                  Radiology Units ({units.length})
                </h3>
              </div>
              <div className="relative">
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
                <input
                  type="text"
                  placeholder="Search units..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-0">
            {loadingUnits ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-2 text-sm text-gray-600">Loading units...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-xs font-semibold text-gray-700">
                      <th className="py-2 px-3 text-left">#ID</th>
                      <th className="py-2 px-3 text-left">Unit Title</th>
                      <th className="py-2 px-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUnits.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-8 text-center">
                          {searchTerm ? (
                            <div className="space-y-2">
                              <p className="text-gray-600">No units found matching "{searchTerm}"</p>
                              <button
                                onClick={() => setSearchTerm('')}
                                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                              >
                                Clear Search
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <span className="text-3xl block mb-2">🏥</span>
                              <p className="text-gray-600">No radiology units found</p>
                              <p className="text-xs text-gray-500">
                                Create your first unit using the form on the left
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredUnits.map((unit, index) => (
                        <tr 
                          key={unit.id} 
                          className={`hover:bg-blue-50/30 transition-colors ${
                            isEditing && formData.id === unit.id ? 'bg-gradient-to-r from-amber-50 to-orange-50' : ''
                          }`}
                        >
                          <td className="py-2 px-3">
                            <span className="text-xs text-gray-500">#{index + 1}</span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-800">{unit.title}</span>
                              {isEditing && formData.id === unit.id && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                                  EDITING
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditUnit(unit)}
                                title="Edit unit"
                                disabled={isEditing && formData.id !== unit.id}
                                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                                  isEditing && formData.id !== unit.id
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400'
                                }`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUnit(unit.id, unit.title)}
                                title="Delete unit"
                                disabled={isEditing && formData.id === unit.id}
                                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                                  isEditing && formData.id === unit.id
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400'
                                }`}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          {!loadingUnits && filteredUnits.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-gray-600">
                  Showing {filteredUnits.length} of {units.length} units
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-3 py-1 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadiologyUnitsManager;