// InvestigationRequest.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useMessage } from '../../context/MessageProvider';
import useAuth from '../../hooks/useAuth';

const InvestigationRequest = ({ patient = null, onRequestCreated }) => {
  const { user } = useAuth();
  const { showMessage } = useMessage();
  const [loading, setLoading] = useState(false);
  const [investigations, setInvestigations] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedInvestigations, setSelectedInvestigations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [urgency, setUrgency] = useState('routine');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [investigationsRes, unitsRes] = await Promise.all([
          axiosInstance.get('/radiologyapi/investigations/'),
          axiosInstance.get('/radiologyapi/units/')
        ]);
        setInvestigations(investigationsRes.data);
        setUnits(unitsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        showMessage('❌ Failed to load investigations', 'danger');
      }
    };
    fetchData();
  }, []);

  const filteredInvestigations = investigations.filter(inv => {
    const matchesSearch = inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.radiology_unit_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = selectedUnit === 'all' || inv.radiology_unit == selectedUnit;
    return matchesSearch && matchesUnit;
  });

  const toggleInvestigation = (investigation) => {
    setSelectedInvestigations(prev => {
      const exists = prev.find(item => item.id === investigation.id);
      if (exists) {
        return prev.filter(item => item.id !== investigation.id);
      } else {
        return [...prev, {
          ...investigation,
          selectedViews: [],
          quantity: 1,
          unit_price: investigation.price,
          notes: ''
        }];
      }
    });
  };

  const toggleViewSelection = (investigationId, view) => {
    setSelectedInvestigations(prev =>
      prev.map(item => {
        if (item.id !== investigationId) return item;
        
        const isSelected = item.selectedViews?.find(v => v.id === view.id);
        let newSelectedViews;
        
        if (isSelected) {
          newSelectedViews = item.selectedViews.filter(v => v.id !== view.id);
        } else {
          newSelectedViews = [...(item.selectedViews || []), view];
        }
        
        const newPrice = newSelectedViews.length > 0 
          ? newSelectedViews.reduce((sum, v) => sum + parseFloat(v.price), 0)
          : item.price;
        
        return {
          ...item,
          selectedViews: newSelectedViews,
          unit_price: newPrice
        };
      })
    );
  };

  const updateInvestigationDetail = (id, field, value) => {
    setSelectedInvestigations(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = () => {
    return selectedInvestigations.reduce((total, item) => {
      const price = item.selectedViews && item.selectedViews.length > 0 
        ? item.selectedViews.reduce((sum, view) => sum + parseFloat(view.price), 0)
        : item.unit_price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalItemsCount = () => {
    return selectedInvestigations.reduce((total, item) => {
      const itemCount = item.selectedViews && item.selectedViews.length > 0 
        ? item.selectedViews.length 
        : 1;
      return total + itemCount;
    }, 0);
  };

  const handleSubmit = async () => {
    if (selectedInvestigations.length === 0) {
      showMessage('❌ Please select at least one investigation', 'danger');
      return;
    }

    setLoading(true);
    try {
      const details = [];
      
      selectedInvestigations.forEach(item => {
        if (item.selectedViews && item.selectedViews.length > 0) {
          item.selectedViews.forEach(view => {
            details.push({
              investigation: item.id,
              investigation_view: view.id,
              quantity: item.quantity,
              unit_price: view.price,
              notes: item.notes || ''
            });
          });
        } else {
          details.push({
            investigation: item.id,
            investigation_view: null,
            quantity: item.quantity,
            unit_price: item.unit_price,
            notes: item.notes || ''
          });
        }
      });

      const payload = {
        patient: patient.id,
        clinical_notes: clinicalNotes,
        urgency: urgency,
        details: details
      };

      const response = await axiosInstance.post('/radiologyapi/requests/', payload);
      
      showMessage(`✅ ${details.length} investigation item(s) requested successfully!`, 'success');
      
      setSelectedInvestigations([]);
      setClinicalNotes('');
      setUrgency('routine');
      
      if (onRequestCreated) {
        onRequestCreated(response.data);
      }
      
    } catch (error) {
      console.error('Error creating investigation request:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.details) {
          showMessage(`❌ Validation error: ${JSON.stringify(errorData.details)}`, 'danger');
        } else {
          showMessage('❌ Failed to create investigation request', 'danger');
        }
      } else {
        showMessage('❌ Network error. Please try again.', 'danger');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Investigation Request</h2>
            <p className="text-blue-100 text-sm mt-1">
              Request radiology investigations for {patient?.user_info?.fullname || 'Patient'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
              {selectedInvestigations.length} selected
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel - Clinical Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800">Clinical Details</h3>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Urgency */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['routine', 'urgent', 'stat'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setUrgency(level)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all duration-300 ${
                          urgency === level
                            ? level === 'routine'
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500'
                              : level === 'urgent'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500'
                              : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-500'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clinical Notes */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Clinical Notes
                  </label>
                  <textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Enter clinical history, indications, or special instructions..."
                    rows="4"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                {/* Patient Info */}
                <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Patient:</span>
                      <span className="font-medium text-gray-800">{patient?.user_info?.fullname}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Requested by:</span>
                      <span className="font-medium text-gray-800">{user?.get_full_name || user?.username}</span>
                    </div>
                  </div>
                </div>

                {/* Selected Items Summary */}
                {selectedInvestigations.length > 0 && (
                  <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      Selected Items ({getTotalItemsCount()})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedInvestigations.map(item => (
                        <div key={item.id} className="bg-white/50 rounded-lg p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 truncate">{item.title}</span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                              {item.quantity}
                            </span>
                          </div>
                          {item.selectedViews && item.selectedViews.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Views: {item.selectedViews.map(v => v.title).join(', ')}
                            </div>
                          )}
                          <div className="text-xs text-gray-600 mt-1">
                            ₦{(
                              (item.selectedViews && item.selectedViews.length > 0 
                                ? item.selectedViews.reduce((sum, view) => sum + parseFloat(view.price), 0)
                                : item.unit_price) * item.quantity
                            ).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">Total:</span>
                        <span className="text-lg font-bold text-emerald-600">
                          ₦{calculateTotal().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                {selectedInvestigations.length > 0 && (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      `Request ${getTotalItemsCount()} Item(s)`
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Investigations Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
              {/* Search and Filter Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Select Investigations</h3>
                    <p className="text-xs text-gray-600">
                      {filteredInvestigations.length} available investigations
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Search investigations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                      <option value="all">All Units</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Investigations Grid */}
              <div className="p-4">
                {filteredInvestigations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-3">🔍</div>
                    <p className="text-gray-500">No investigations found</p>
                    <p className="text-sm text-gray-400 mt-1">Try a different search term or unit</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredInvestigations.map(investigation => {
                      const isSelected = selectedInvestigations.find(si => si.id === investigation.id);
                      return (
                        <div
                          key={investigation.id}
                          className={`bg-gradient-to-br from-white to-gray-50 rounded-lg border transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                              : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }`}
                          onClick={() => toggleInvestigation(investigation)}
                        >
                          <div className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-800 text-sm line-clamp-2 flex-1">
                                {investigation.title}
                              </h4>
                              <input
                                type="checkbox"
                                checked={!!isSelected}
                                onChange={() => {}}
                                className="ml-2 mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {investigation.radiology_unit_title}
                              </span>
                              <span className="font-semibold text-emerald-600">
                                ₦{parseFloat(investigation.price).toLocaleString()}
                              </span>
                            </div>

                            {/* Views Selection */}
                            {isSelected && investigation.has_views && investigation.views.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                  Select Views:
                                </label>
                                <div className="space-y-2">
                                  {investigation.views.map(view => {
                                    const isViewSelected = isSelected.selectedViews?.find(v => v.id === view.id);
                                    return (
                                      <label key={view.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={!!isViewSelected}
                                          onChange={() => toggleViewSelection(investigation.id, view)}
                                          className="w-3 h-3 text-blue-600 rounded"
                                        />
                                        <span className="text-xs text-gray-700 flex-1">{view.title}</span>
                                        <span className="text-xs text-emerald-600">
                                          ₦{parseFloat(view.price).toLocaleString()}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Quantity Controls */}
                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-700">Quantity:</span>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = isSelected.quantity || 1;
                                        updateInvestigationDetail(investigation.id, 'quantity', Math.max(1, current - 1));
                                      }}
                                      className="w-6 h-6 flex items-center justify-center text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      value={isSelected.quantity || 1}
                                      onChange={(e) => {
                                        updateInvestigationDetail(investigation.id, 'quantity', parseInt(e.target.value) || 1);
                                      }}
                                      className="w-12 px-2 py-1 text-sm text-center border border-gray-300 rounded-lg focus:border-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = isSelected.quantity || 1;
                                        updateInvestigationDetail(investigation.id, 'quantity', current + 1);
                                      }}
                                      className="w-6 h-6 flex items-center justify-center text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestigationRequest;