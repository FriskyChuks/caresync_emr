// components/radiology/RequestDetailsModal.jsx
import React from 'react';

const RequestDetailsModal = ({ request, show, onHide, onRefresh }) => {
  if (!show || !request) return null;

  const getStatusBadge = (status) => {
    const config = {
      pending: 'bg-amber-100 text-amber-700',
      billed: 'bg-purple-100 text-purple-700',
      partly_billed: 'bg-indigo-100 text-indigo-700',
      partly_paid: 'bg-orange-100 text-orange-700',
      paid: 'bg-green-100 text-green-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-emerald-100 text-emerald-700'
    };
    return config[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending Payment',
      billed: 'Awaiting Payment',
      partly_billed: 'Partly Billed',
      partly_paid: 'Partly Paid',
      paid: 'Paid - Ready',
      in_progress: 'In Progress',
      completed: 'Completed'
    };
    return labels[status] || status;
  };

  const canEnterResultsForDetail = (detail) => {
    return detail.status === 'paid' || detail.status === 'in_progress';
  };

  const getPaidCount = () => {
    if (!request.details) return 0;
    return request.details.filter(d => canEnterResultsForDetail(d)).length;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onHide}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Radiology Request Details
              </h3>
              <button onClick={onHide} className="text-white/80 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-white/80 mt-1">RAD#{request.id}</p>
          </div>

          <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500">Patient Name</label>
                <p className="text-sm font-medium text-gray-900">{request.patient_name}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500">Patient ID</label>
                <p className="text-sm font-medium text-gray-900">{request.patient_id}</p>
              </div>
            </div>

            {/* Request Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500">Urgency</label>
                <p className="text-sm font-medium text-gray-900 capitalize">{request.urgency}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500">Status</label>
                <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${getStatusBadge(request.status)}`}>
                  {getStatusLabel(request.status)}
                </span>
              </div>
            </div>

            {/* Payment Progress Summary */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-gray-600">Payment & Result Progress</label>
                <span className="text-xs font-medium text-green-600">{getPaidCount()}/{request.details_count} Paid</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(getPaidCount() / request.details_count) * 100}%` }}
                />
              </div>
              {request.status === 'partly_paid' && (
                <p className="text-xs text-orange-600 mt-2">
                  ⚡ Partially paid - You can enter results for paid items only
                </p>
              )}
            </div>

            {/* Clinical Notes */}
            {request.clinical_notes && (
              <div>
                <label className="block text-xs font-semibold text-gray-500">Clinical Notes</label>
                <p className="text-sm text-gray-700 mt-1">{request.clinical_notes}</p>
              </div>
            )}

            {/* Investigations List */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Investigations</label>
              <div className="space-y-2">
                {request.details?.map((detail, idx) => (
                  <div key={detail.id} className={`rounded-lg p-3 border ${
                    canEnterResultsForDetail(detail) 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{detail.investigation_title}</p>
                          {canEnterResultsForDetail(detail) ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-green-100 text-green-700">
                              ✅ Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-100 text-amber-700">
                              ⏳ Pending Payment
                            </span>
                          )}
                        </div>
                        {detail.investigation_view_title && (
                          <p className="text-xs text-gray-500 mt-0.5">View: {detail.investigation_view_title}</p>
                        )}
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${getStatusBadge(detail.status)}`}>
                        {getStatusLabel(detail.status)}
                      </span>
                    </div>
                    {detail.notes && (
                      <p className="text-xs text-gray-500 mt-1">Note: {detail.notes}</p>
                    )}
                    {detail.radiologist_comment && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        <span className="font-medium">📝 Radiologist:</span> {detail.radiologist_comment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end gap-2">
            <button
              onClick={onHide}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            {(request.status === 'paid' || request.status === 'partly_paid' || request.status === 'in_progress') && (
              <button
                onClick={() => {
                  onHide();
                  window.location.href = `/radiology/result-entry/${request.id}`;
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {request.status === 'partly_paid' 
                  ? 'Enter Results for Paid Items' 
                  : request.status === 'in_progress' 
                  ? 'Continue Results' 
                  : 'Enter Results'}
              </button>
            )}
            {(request.status === 'pending' || request.status === 'billed' || request.status === 'partly_billed') && (
              <button
                onClick={() => {
                  onHide();
                  window.location.href = `/billing/patient/${request.patient_id}`;
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
              >
                Make Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;