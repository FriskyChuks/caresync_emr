// PrescriptionHistory.jsx
import React from 'react';

const PrescriptionHistory = ({ prescriptions, loading, onRefresh, patient }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-gradient-to-r from-amber-500 to-yellow-500', text: 'PENDING', icon: '⏳' },
      dispensed: { bg: 'bg-gradient-to-r from-emerald-500 to-teal-600', text: 'DISPENSED', icon: '✅' },
      partially_dispensed: { bg: 'bg-gradient-to-r from-blue-500 to-indigo-500', text: 'PARTIAL', icon: '⚡' },
      cancelled: { bg: 'bg-gradient-to-r from-red-500 to-pink-600', text: 'CANCELLED', icon: '❌' }
    };
    const config = statusConfig[status] || { bg: 'bg-gradient-to-r from-gray-500 to-gray-600', text: status, icon: '📄' };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-full ${config.bg}`}>
        <span>{config.icon}</span>
        <span className="hidden sm:inline">{config.text}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-600 font-medium">Loading prescription history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Prescription History</h3>
              <p className="text-sm text-gray-600">{patient.full_name}</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {prescriptions.length === 0 ? (
          <div className="py-6 text-center">
            <div className="inline-block p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="mt-3 text-gray-600">No prescriptions found for this patient</p>
            <p className="text-sm text-gray-500">Prescriptions will appear here once created</p>
          </div>
        ) : (
          <div className="space-y-2">
            {prescriptions.map(prescription => (
              <div key={prescription.id} className="group bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl p-3 hover:shadow-md transition-all duration-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {/* ID & Date */}
                  <div className="space-y-1">
                    <div className="font-bold text-blue-700">#{prescription.id}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(prescription.date_prescribed).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(prescription.date_prescribed).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Prescribed By */}
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Prescribed By</div>
                    <div className="font-medium text-gray-800">{prescription.prescribed_by_name}</div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Items</div>
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        📋 {prescription.details?.length || 0} items
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Status</div>
                    <div>
                      {getStatusBadge(prescription.status)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Actions</div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {prescription.status === 'pending' && (
                        <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Process Dispensing">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionHistory;