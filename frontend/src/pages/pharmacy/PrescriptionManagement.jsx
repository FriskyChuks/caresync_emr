// PrescriptionManagement.jsx - Fixed Search Results Height
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useMessage } from '../../context/MessageProvider';
import PharmacyLayout from './PharmacyLayout';
import PrescriptionSheet from './PrescriptionSheet';

const PrescriptionManagement = () => {
  const { showMessage } = useMessage();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const timeoutRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => searchPatients(), 300);
    } else {
      setPatients([]);
      setShowResults(false);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPatients = async () => {
    if (!searchTerm.trim()) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/patientsapi/patient_search/?q=${encodeURIComponent(searchTerm)}`);
      setPatients(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching patients:', error);
      showMessage('Error searching patients', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient.patient_data);
    setSearchTerm(`${patient.first_name} ${patient.last_name} (PID: ${patient.patient_data.id})`);
    setPatients([]);
    setShowResults(false);
  };

  const clearSelection = () => {
    setSelectedPatient(null);
    setSearchTerm('');
    setPatients([]);
    setShowResults(false);
  };

  return (
    <PharmacyLayout>
      <div className="space-y-3">
        {/* Compact Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white shadow">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Prescriptions</h1>
              <p className="text-[10px] text-blue-100">Create & manage</p>
            </div>
          </div>
          {!selectedPatient && (
            <Link
              to="/pharmacy/dispensary"
              className="flex items-center gap-1 px-2 py-1 bg-white/20 text-white text-xs rounded-md hover:bg-white/30 transition"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="hidden sm:inline">Dispensary</span>
            </Link>
          )}
        </div>

        {/* Patient Search - Compact with Proper Dropdown */}
        {!selectedPatient && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-3 py-2 border-b">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-gray-700">Find Patient</h3>
              </div>
            </div>
            
            <div className="p-3">
              <div className="relative" ref={searchRef}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value.length >= 3) setShowResults(true);
                    }}
                    onFocus={() => searchTerm.length >= 3 && setShowResults(true)}
                  />
                  {loading && (
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                      <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Search Results Dropdown - FIXED: position relative with higher z-index */}
                {showResults && patients.length > 0 && (
                  <div 
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden"
                    style={{ position: 'absolute', top: '100%', left: 0, right: 0 }}
                  >
                    <div className="max-h-80 overflow-y-auto">
                      {patients.map(patient => (
                        <div
                          key={patient.id}
                          onClick={() => handlePatientSelect(patient)}
                          className="flex items-center gap-2 p-2.5 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-0"
                        >
                          <div className="p-1.5 bg-blue-100 rounded flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {patient.first_name} {patient.last_name}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded whitespace-nowrap">
                                ID: {patient.id}
                              </span>
                              {patient?.user_info?.gender?.title && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded whitespace-nowrap">
                                  {patient.user_info.gender.title}
                                </span>
                              )}
                            </div>
                          </div>
                          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showResults && searchTerm && patients.length === 0 && !loading && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl p-4 text-center">
                    <p className="text-xs text-gray-500">No patients found</p>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Enter at least 3 characters to search</p>
            </div>
          </div>
        )}

        {/* Prescription Sheet */}
        {selectedPatient && (
          <>
            {/* Compact Patient Header */}
            <div className="bg-white rounded-lg border border-emerald-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 border-b border-emerald-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Rx for {selectedPatient.user_info?.fullname || `${selectedPatient.user_info?.first_name} ${selectedPatient.user_info?.last_name}`}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] px-1.5 py-0.5 bg-white border border-emerald-200 text-emerald-600 rounded">PID: {selectedPatient.id}</span>
                        {selectedPatient.user_info?.gender && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">{selectedPatient.user_info.gender.title}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={clearSelection}
                    className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-50 transition"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Change
                  </button>
                </div>
              </div>
            </div>

            {/* Prescription Form */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <PrescriptionSheet 
                patient={selectedPatient}
                onPrescriptionSuccess={() => {
                  showMessage('Prescription created!', 'success');
                  clearSelection();
                }}
              />
            </div>
          </>
        )}
      </div>
    </PharmacyLayout>
  );
};

export default PrescriptionManagement;