// PrescriptionSheet.jsx - Complete Fixed Version
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useMessage } from '../../context/MessageProvider';
import useAuth from '../../hooks/useAuth';

const PrescriptionSheet = ({ patient, onPrescriptionSuccess }) => {
  const { user } = useAuth();
  const { showMessage } = useMessage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const location = patient?.active_visit?.current_location;
  const patientLocation = location?.clinic || location?.ward || "None";
  const encounter = location?.clinic_id || location?.ward_id || null;

  const [prescriptionData, setPrescriptionData] = useState({
    patient: patient?.id || '',
    encounter,
    prescribed_by: user?.id || '',
    notes: '',
    details: []
  });

  const [currentItem, setCurrentItem] = useState({
    product: '', product_name: '', product_strength: '', drugstype_name: '',
    dose: '', frequency: '', duration: 1, quantity_prescribed: 1, remark: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const AUTO_CALCULATE_DRUG_TYPES = ['tablet', 'tablets', 'capsule', 'capsules', 'cap', 'tab'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { fetchProducts(); }, []);
  
  // Fix: Only search when searchTerm changes and not after selection
  useEffect(() => {
    if (searchTerm.trim() && !currentItem.product) {
      handleSearch();
    } else if (!searchTerm.trim()) {
      setFilteredProducts([]);
      setShowDropdown(false);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/pharmacyapi/products/');
      setProducts(res.data);
    } catch (error) {
      showMessage('Error loading products', 'error');
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim() || currentItem.product) {
      setFilteredProducts([]);
      setShowDropdown(false);
      return;
    }
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.strength.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8);
    setFilteredProducts(filtered);
    setShowDropdown(filtered.length > 0);
  };

  const shouldAutoCalculate = (drugType) => {
    if (!drugType) return false;
    return AUTO_CALCULATE_DRUG_TYPES.some(type => drugType.toLowerCase().includes(type));
  };

  const calculateQuantity = useCallback(() => {
    if (!currentItem.dose || !currentItem.frequency || !currentItem.duration) return;

    const frequencyMap = {
      'OD': 1, 'Once daily': 1, 'NOCTE': 1, 'STAT': 1, 'PRN': 1,
      'BD': 2, 'Twice daily': 2,
      'TDS': 3, 'Three times daily': 3,
      'QDS': 4, 'Four times daily': 4,
      'Q4H': 6, 'Q6H': 4, 'Q8H': 3, 'Q12H': 2
    };

    let timesPerDay = 1;
    for (const [key, value] of Object.entries(frequencyMap)) {
      if (currentItem.frequency.includes(key)) { timesPerDay = value; break; }
    }

    let unitsPerDose = 1;
    const doseMatch = currentItem.dose.match(/(\d+(\.\d+)?)/);
    if (doseMatch) unitsPerDose = parseFloat(doseMatch[0]);

    const duration = parseInt(currentItem.duration) || 1;
    const calculatedQuantity = Math.ceil(unitsPerDose * timesPerDay * duration);

    if (calculatedQuantity > 0 && calculatedQuantity !== parseInt(currentItem.quantity_prescribed)) {
      setCurrentItem(prev => ({ ...prev, quantity_prescribed: calculatedQuantity }));
    }
  }, [currentItem.dose, currentItem.frequency, currentItem.duration]);

  useEffect(() => {
    if (currentItem.product && currentItem.dose && currentItem.frequency) {
      calculateQuantity();
    }
  }, [currentItem.dose, currentItem.frequency, currentItem.duration, calculateQuantity]);

  const isItemAlreadyAdded = (productId) => {
    return prescriptionData.details.some(item => item.product === parseInt(productId));
  };

  const validateCurrentItem = () => {
    const errors = {};
    if (!currentItem.product) errors.product = 'Required';
    if (!currentItem.dose?.trim()) errors.dose = 'Required';
    if (!currentItem.frequency?.trim()) errors.frequency = 'Required';
    if (!currentItem.duration || currentItem.duration <= 0) errors.duration = 'Invalid';
    if (!currentItem.quantity_prescribed || currentItem.quantity_prescribed <= 0) errors.quantity = 'Invalid';
    
    if (currentItem.product && isItemAlreadyAdded(currentItem.product)) {
      errors.duplicate = 'Already added';
      showMessage('Medication already in list', 'warning');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProductSelect = (product) => {
    if (isItemAlreadyAdded(product.id)) {
      showMessage(`${product.name} already added`, 'warning');
      setSearchTerm('');
      setShowDropdown(false);
      return;
    }

    setCurrentItem(prev => ({
      ...prev,
      product: product.id,
      product_name: product.name,
      product_strength: product.strength,
      drugstype_name: product.drugstype_name || ''
    }));
    setSearchTerm(`${product.name} ${product.strength}`);
    setShowDropdown(false);
    setFilteredProducts([]); // Clear filtered products after selection
    setFormErrors(prev => ({ ...prev, product: undefined, duplicate: undefined }));
  };

  const handleAddItem = () => {
    if (!validateCurrentItem()) return;
    if (isItemAlreadyAdded(currentItem.product)) {
      showMessage('Medication already added', 'warning');
      return;
    }

    const newItem = {
      product: parseInt(currentItem.product),
      dose: currentItem.dose.trim(),
      frequency: currentItem.frequency.trim(),
      duration: parseInt(currentItem.duration),
      quantity_prescribed: parseInt(currentItem.quantity_prescribed),
      remark: currentItem.remark?.trim() || ''
    };

    setPrescriptionData(prev => ({ ...prev, details: [...prev.details, newItem] }));
    setCurrentItem({
      product: '', product_name: '', product_strength: '', drugstype_name: '',
      dose: '', frequency: '', duration: 1, quantity_prescribed: 1, remark: ''
    });
    setSearchTerm('');
    setFilteredProducts([]);
    setShowDropdown(false);
    setFormErrors({});
    // showMessage('Medication added', 'success');
  };

  const handleRemoveItem = (index) => {
    setPrescriptionData(prev => ({ ...prev, details: prev.details.filter((_, i) => i !== index) }));
    showMessage('Removed', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prescriptionData.patient) return showMessage('Patient missing', 'error');
    if (!prescriptionData.prescribed_by) return showMessage('Prescriber missing', 'error');
    if (prescriptionData.details.length === 0) return showMessage('Add at least one medication', 'warning');
    
    setLoading(true);
    const submitData = {
      patient: parseInt(prescriptionData.patient),
      encounter: prescriptionData.encounter ? parseInt(prescriptionData.encounter) : null,
      prescribed_by: parseInt(prescriptionData.prescribed_by),
      notes: prescriptionData.notes.trim(),
      details: prescriptionData.details
    };
    
    try {
      await axiosInstance.post('/pharmacyapi/prescriptions/', submitData);
      setPrescriptionData({ patient: patient?.id || '', encounter, prescribed_by: user?.id || '', notes: '', details: [] });
      showMessage('Prescription created!', 'success');
      if (onPrescriptionSuccess) onPrescriptionSuccess();
    } catch (error) {
      showMessage('Error creating prescription', 'error');
    } finally {
      setLoading(false);
    }
  };

  const COMMON_FREQUENCIES = ['OD - Once daily', 'BD - Twice daily', 'TDS - Three times daily', 'QDS - Four times daily', 'NOCTE - At night', 'PRN - As needed'];
  const COMMON_DOSES = ['1 tablet', '2 tablets', '1 capsule', '2 capsules', '5ml', '10ml', '15ml', '1 sachet'];
  const isAutoCalculated = shouldAutoCalculate(currentItem.drugstype_name);
  const getProductName = (id) => products.find(p => p.id === id)?.name || 'Loading...';

  return (
    <div className="space-y-3">
      {/* Patient & Prescriber Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white shadow">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-medium">{patient?.user_info?.fullname?.split(' ')[0] || 'Patient'}</span>
            <span className="text-[10px] text-blue-100 ml-1">PID: {patient?.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-blue-100">
          <span className="hidden sm:inline">📍</span>
          <span className="truncate max-w-[120px]">{patientLocation}</span>
          <span className="mx-1">•</span>
          <span>Rx: {user?.first_name}</span>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible">
        <div className="p-3 space-y-3">
          {/* Search Input */}
          <div className="relative" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className={`w-full pl-9 pr-3 py-2 text-sm bg-white border ${formErrors.product || formErrors.duplicate ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
              placeholder="Search medication by name, strength, or type..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length >= 2 && !currentItem.product) {
                  setShowDropdown(true);
                }
              }}
              onFocus={() => {
                if (searchTerm.length >= 2 && filteredProducts.length > 0 && !currentItem.product) {
                  setShowDropdown(true);
                }
              }}
              disabled={loading}
            />
            
            {/* Search Results Dropdown */}
            {showDropdown && !currentItem.product && filteredProducts.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
                style={{ position: 'absolute', top: '100%', left: 0, right: 0 }}
              >
                <div className="max-h-64 overflow-y-auto">
                  <div className="sticky top-0 bg-gray-50 px-3 py-1.5 border-b">
                    <span className="text-[10px] font-medium text-gray-500">Search Results ({filteredProducts.length})</span>
                  </div>
                  {filteredProducts.map((p) => {
                    const alreadyAdded = isItemAlreadyAdded(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`px-3 py-2 border-b last:border-0 transition-colors ${
                          alreadyAdded 
                            ? 'bg-gray-50 opacity-60 cursor-not-allowed' 
                            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer'
                        }`}
                        onClick={() => !alreadyAdded && handleProductSelect(p)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-medium text-gray-800 truncate">{p.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">{p.strength}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{p.drugstype_name || 'Medication'}</span>
                              {alreadyAdded && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded ml-auto">
                                  Already added ✓
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Results - Only show when searching and no current item selected */}
            {showDropdown && !currentItem.product && searchTerm.length >= 2 && filteredProducts.length === 0 && !loading && (
              <div 
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center"
                style={{ position: 'absolute', top: '100%', left: 0, right: 0 }}
              >
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-500 font-medium">No medications found</p>
                  <p className="text-[10px] text-gray-400">Try searching with a different name</p>
                </div>
              </div>
            )}

            {formErrors.product && (
              <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formErrors.product}
              </div>
            )}
          </div>

          {/* Selected Medication Badge */}
          {currentItem.product && (
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-100 rounded">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-800">{currentItem.product_name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] px-1.5 py-0.5 bg-white/70 text-gray-600 rounded">
                      {currentItem.product_strength}
                    </span>
                    {currentItem.drugstype_name && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-200 text-emerald-700 rounded">
                        {currentItem.drugstype_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentItem({
                    product: '', product_name: '', product_strength: '', drugstype_name: '',
                    dose: '', frequency: '', duration: 1, quantity_prescribed: 1, remark: ''
                  });
                  setSearchTerm('');
                  setFilteredProducts([]);
                  setShowDropdown(false);
                  setFormErrors({});
                }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Prescription Form - All on one line on desktop */}
          {currentItem.product && (
            <div className="pt-1">
              {/* Desktop: 5 columns, Mobile: 2 columns then 3 columns */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                {/* Dose - col 1 */}
                <div>
                  <label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Dose</label>
                  <select
                    className={`w-full px-2 py-1.5 text-sm bg-white border ${formErrors.dose ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                    value={currentItem.dose}
                    onChange={(e) => {
                      setCurrentItem(p => ({ ...p, dose: e.target.value }));
                      setFormErrors(prev => ({ ...prev, dose: undefined }));
                    }}
                  >
                    <option value="">Select</option>
                    {COMMON_DOSES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Frequency - col 2 */}
                <div>
                  <label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Frequency</label>
                  <select
                    className={`w-full px-2 py-1.5 text-sm bg-white border ${formErrors.frequency ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                    value={currentItem.frequency}
                    onChange={(e) => {
                      setCurrentItem(p => ({ ...p, frequency: e.target.value }));
                      setFormErrors(prev => ({ ...prev, frequency: undefined }));
                    }}
                  >
                    <option value="">Select</option>
                    {COMMON_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Duration - col 3 */}
                <div>
                  <label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Days</label>
                  <input
                    type="number"
                    className={`w-full px-2 py-1.5 text-sm bg-white border ${formErrors.duration ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-1 focus:ring-blue-500 outline-none`}
                    min="1"
                    value={currentItem.duration}
                    onChange={(e) => {
                      setCurrentItem(p => ({ ...p, duration: e.target.value }));
                      setFormErrors(prev => ({ ...prev, duration: undefined }));
                    }}
                  />
                </div>

                {/* Quantity - col 4 */}
                <div>
                  <label className="text-[10px] font-medium text-gray-600 mb-0.5 block">
                    Qty {isAutoCalculated && <span className="text-emerald-600">(auto)</span>}
                  </label>
                  <input
                    type="number"
                    className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none ${
                      isAutoCalculated ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'
                    }`}
                    min="1"
                    value={currentItem.quantity_prescribed}
                    onChange={(e) => {
                      setCurrentItem(p => ({ ...p, quantity_prescribed: e.target.value }));
                      setFormErrors(prev => ({ ...prev, quantity: undefined }));
                    }}
                  />
                </div>

                {/* Add Button - col 5 */}
                <div className="flex items-end">
                  <button
                    onClick={handleAddItem}
                    disabled={!currentItem.dose || !currentItem.frequency}
                    className="w-full px-3 py-1.5 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>

              {/* Error messages row */}
              {(formErrors.dose || formErrors.frequency || formErrors.duration || formErrors.quantity) && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {formErrors.dose && <span className="text-red-500 text-[9px]">• Dose required</span>}
                  {formErrors.frequency && <span className="text-red-500 text-[9px]">• Frequency required</span>}
                  {formErrors.duration && <span className="text-red-500 text-[9px]">• Valid days required</span>}
                  {formErrors.quantity && <span className="text-red-500 text-[9px]">• Valid quantity required</span>}
                </div>
              )}

              {/* Auto-calc hint */}
              {isAutoCalculated && currentItem.dose && currentItem.frequency && (
                <div className="text-[9px] text-emerald-600 text-center py-0.5 mt-1">
                  💡 Auto-calculated: {currentItem.dose} × frequency × {currentItem.duration} days = {currentItem.quantity_prescribed}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Items List */}
      {prescriptionData.details.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-3 py-1.5 border-b flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded">{prescriptionData.details.length}</div>
              <span className="text-xs font-medium text-gray-700">Items</span>
            </div>
            <span className="text-[9px] text-gray-400">{prescriptionData.details.length} total</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[200px] overflow-y-auto">
            {prescriptionData.details.map((item, idx) => (
              <div key={idx} className="px-3 py-2 hover:bg-gray-50 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-800 truncate">{getProductName(item.product)}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">{item.dose}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">{item.frequency}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">{item.duration}d</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-semibold">Qty:{item.quantity_prescribed}</span>
                  </div>
                </div>
                <button onClick={() => handleRemoveItem(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded flex-shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes & Submit */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 space-y-2">
        <textarea 
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none resize-none" 
          rows="1" 
          placeholder="Notes (optional)..." 
          value={prescriptionData.notes} 
          onChange={(e) => setPrescriptionData(p => ({ ...p, notes: e.target.value }))} 
          disabled={loading} 
        />
        
        <div className="flex items-center justify-between gap-2">
          <div className={`px-2 py-1 text-[10px] font-medium rounded ${prescriptionData.details.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {prescriptionData.details.length} item(s)
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={loading || prescriptionData.details.length === 0} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded shadow hover:shadow-md transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
            {loading ? 'Creating...' : 'Create Prescription'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionSheet;