// PrescriptionHistory.jsx - With detailed view modal
import React, { useState } from 'react';

const PrescriptionHistory = ({ prescriptions, loading, onRefresh, patient }) => {
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-gradient-to-r from-amber-500 to-yellow-500', text: 'PENDING', icon: '⏳' },
      dispensed: { bg: 'bg-gradient-to-r from-emerald-500 to-teal-600', text: 'DISPENSED', icon: '✅' },
      partially_dispensed: { bg: 'bg-gradient-to-r from-blue-500 to-indigo-500', text: 'PARTIAL', icon: '⚡' },
      cancelled: { bg: 'bg-gradient-to-r from-red-500 to-pink-600', text: 'CANCELLED', icon: '❌' },
      billed: { bg: 'bg-gradient-to-r from-purple-500 to-pink-600', text: 'BILLED', icon: '💰' },
      paid: { bg: 'bg-gradient-to-r from-green-500 to-emerald-600', text: 'PAID', icon: '✅' }
    };
    const config = statusConfig[status] || { bg: 'bg-gradient-to-r from-gray-500 to-gray-600', text: status.toUpperCase(), icon: '📄' };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-full ${config.bg}`}>
        <span>{config.icon}</span>
        <span className="hidden sm:inline">{config.text}</span>
      </span>
    );
  };

  const getDetailStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-amber-100 text-amber-700', icon: '⏳', label: 'Pending' },
      billed: { bg: 'bg-purple-100 text-purple-700', icon: '💰', label: 'Billed' },
      paid: { bg: 'bg-green-100 text-green-700', icon: '✅', label: 'Paid' },
      dispensed: { bg: 'bg-emerald-100 text-emerald-700', icon: '🎁', label: 'Dispensed' },
      cancelled: { bg: 'bg-red-100 text-red-700', icon: '❌', label: 'Cancelled' }
    };
    const c = config[status] || { bg: 'bg-gray-100 text-gray-700', icon: '📋', label: status };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${c.bg}`}>
        <span>{c.icon}</span>
        {c.label}
      </span>
    );
  };

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailModal(true);
  };

  const handleProcessDispensing = (prescriptionId) => {
    // Navigate to dispensary with this prescription
    window.location.href = `/pharmacy/dispensary?prescription=${prescriptionId}&patient=${patient?.id}`;
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
    <>
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
                <p className="text-sm text-gray-600">{patient?.full_name || 'Patient'}</p>
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
                        <button 
                          onClick={() => handleViewDetails(prescription)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {prescription.status === 'pending' && (
                          <button 
                            onClick={() => handleProcessDispensing(prescription.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                            title="Process Dispensing"
                          >
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

      {/* Prescription Detail Modal */}
      {showDetailModal && selectedPrescription && (
        <PrescriptionDetailModal
          prescription={selectedPrescription}
          onClose={() => setShowDetailModal(false)}
          onProcessDispensing={handleProcessDispensing}
        />
      )}
    </>
  );
};

// Prescription Detail Modal Component
const PrescriptionDetailModal = ({ prescription, onClose, onProcessDispensing }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Prescription Details</h3>
              <p className="text-blue-100 text-xs">#{prescription.id} • {new Date(prescription.date_prescribed).toLocaleString()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {/* Prescription Info */}
          <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Prescribed By</div>
                <div className="font-medium text-gray-800">{prescription.prescribed_by_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-1">{getDetailStatusBadge(prescription.status)}</div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Prescribed Items ({prescription.details?.length || 0})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {prescription.details?.map((detail, idx) => (
                <div key={detail.id} className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-gray-800">{detail.product_name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <span className="ml-1 font-medium text-gray-700">{detail.quantity_prescribed} units</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Dosage:</span>
                          <span className="ml-1 text-gray-700">{detail.dose || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Frequency:</span>
                          <span className="ml-1 text-gray-700">{detail.frequency || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="ml-1 text-gray-700">{detail.duration || 'N/A'} days</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-2">
                      {getDetailStatusBadge(detail.status)}
                    </div>
                  </div>
                  {detail.remark && (
                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                      <span className="font-medium">Remark:</span> {detail.remark}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          {prescription.notes && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-xs font-medium text-amber-800">Prescription Notes</div>
                  <div className="text-xs text-amber-700 mt-1">{prescription.notes}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Created: {new Date(prescription.date_created).toLocaleString()}
          </div>
          <div className="flex gap-2">
            {prescription.status === 'pending' && (
              <button
                onClick={() => {
                  onClose();
                  onProcessDispensing(prescription.id);
                }}
                className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-lg transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Process Dispensing
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for detail status badge
const getDetailStatusBadge = (status) => {
  const config = {
    pending: { bg: 'bg-amber-100 text-amber-700', icon: '⏳', label: 'Pending' },
    billed: { bg: 'bg-purple-100 text-purple-700', icon: '💰', label: 'Billed' },
    paid: { bg: 'bg-green-100 text-green-700', icon: '✅', label: 'Paid' },
    dispensed: { bg: 'bg-emerald-100 text-emerald-700', icon: '🎁', label: 'Dispensed' },
    cancelled: { bg: 'bg-red-100 text-red-700', icon: '❌', label: 'Cancelled' },
    in_progress: { bg: 'bg-blue-100 text-blue-700', icon: '🔄', label: 'In Progress' },
    partly_paid: { bg: 'bg-yellow-100 text-yellow-700', icon: '💳', label: 'Partly Paid' }
  };
  const c = config[status] || { bg: 'bg-gray-100 text-gray-700', icon: '📋', label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${c.bg}`}>
      <span>{c.icon}</span>
      {c.label}
    </span>
  );
};

export default PrescriptionHistory;