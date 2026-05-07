// dispensaryComponents/PatientQueue.jsx
import React from 'react';

const PatientQueue = ({ 
  patients, 
  selectedPatient, 
  loading, 
  statusFilter, 
  searchTerm,
  onSearchChange,
  onStatusFilterChange, 
  onSelectPatient,
  currentStore 
}) => {
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return '🟢';
      case 'billed': return '🟡';
      case 'in_progress': return '🔵';
      case 'pending': return '⚪';
      case 'dispensed': return '✅';
      case 'partly_paid': return '💳';
      default: return '📋';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'paid': return 'Ready';
      case 'billed': return 'Billed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'dispensed': return 'Done';
      case 'partly_paid': return 'Partly Paid';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700';
      case 'billed': return 'bg-amber-100 text-amber-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'dispensed': return 'bg-purple-100 text-purple-700';
      case 'partly_paid': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filters = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'paid', label: 'Ready', icon: '🟢' },
    { value: 'billed', label: 'Billed', icon: '🟡' },
    { value: 'pending', label: 'Pending', icon: '⚪' }
  ];

  // Filter patients by search term
  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (patient.name?.toLowerCase().includes(searchLower) ||
            patient.hospital_number?.toLowerCase().includes(searchLower) ||
            patient.phone?.toLowerCase().includes(searchLower));
  });

  const patientsList = Array.isArray(filteredPatients) ? filteredPatients : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-3 py-2 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Queue ({patientsList.length})
          </h3>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, ID or phone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-2 border-b bg-gray-50">
        {filters.map(filter => (
          <button
            key={filter.value}
            onClick={() => onStatusFilterChange(filter.value)}
            className={`flex-1 py-1 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
              statusFilter === filter.value
                ? 'bg-white text-emerald-600 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <span>{filter.icon}</span>
            <span className="hidden sm:inline">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500 mt-2">Loading...</p>
          </div>
        ) : patientsList.length === 0 ? (
          <div className="py-8 text-center">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-xs text-gray-500">No patients found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {patientsList.map(patient => {
              const isSelected = selectedPatient?.id === patient.id;
              const totalItems = patient.prescriptions?.reduce((total, rx) => total + (rx.details?.length || 0), 0) || 0;
              
              return (
                <div
                    key={patient.id}
                    onClick={() => {
                      console.log('Patient clicked:', patient.id);
                      if (patient.id && onSelectPatient) {
                        onSelectPatient(patient.id);
                      }
                    }}
                    className={`p-2 cursor-pointer transition-all ${
                      selectedPatient?.id === patient.id 
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getStatusIcon(patient.status)}</span>
                        <div className="font-medium text-gray-800 text-sm truncate">
                          {patient.name || 'Unknown'}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 ml-5">
                        HN: {patient.hospital_number}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-xs font-semibold text-gray-700">
                        {totalItems}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-1 ml-5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${getStatusColor(patient.status)}`}>
                      {getStatusLabel(patient.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-3 py-1.5 bg-gray-50">
        <div className="text-[9px] text-gray-400 text-center">
          Last 30 days • Max 50 patients
        </div>
      </div>
    </div>
  );
};

export default PatientQueue;