// components/radiology/dashboardsubcomponents/RequestDetailsModal.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';

const RequestDetailsModal = ({ request, show, onHide, onRefresh }) => {
  const { showMessage } = useMessage();
  const [detailedRequest, setDetailedRequest] = useState(null);
  const [loading, setLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  // Fetch detailed request when modal opens
  useEffect(() => {
    if (show && request && !request.details) {
      fetchDetailedRequest();
    } else if (show && request && request.details) {
      setDetailedRequest(request);
    }
  }, [show, request]);

  const fetchDetailedRequest = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/radiologyapi/requests/${request.id}/`);
      setDetailedRequest(response.data);
    } catch (err) {
      console.error('Error fetching detailed request', err);
      showMessage('Failed to load request details', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-700', 
        border: 'border-amber-200',
        label: 'Pending',
        icon: '⏳'
      },
      in_progress: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        border: 'border-blue-200',
        label: 'In Progress',
        icon: '🔄'
      },
      completed: { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200',
        label: 'Completed',
        icon: '✅'
      },
      billed: { 
        bg: 'bg-purple-100', 
        text: 'text-purple-700', 
        border: 'border-purple-200',
        label: 'Billed',
        icon: '💰'
      },
      canceled: { 
        bg: 'bg-rose-100', 
        text: 'text-rose-700', 
        border: 'border-rose-200',
        label: 'Canceled',
        icon: '❌'
      }
    };
    return config[status] || config.pending;
  };

  const getUrgencyConfig = (urgency) => {
    const config = {
      routine: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-700', 
        border: 'border-gray-200',
        label: 'Routine'
      },
      urgent: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-700', 
        border: 'border-amber-200',
        label: 'Urgent'
      },
      stat: { 
        bg: 'bg-rose-100', 
        text: 'text-rose-700', 
        border: 'border-rose-200',
        label: 'STAT'
      }
    };
    return config[urgency] || config.routine;
  };

  const displayRequest = detailedRequest || request;

  if (!show || !displayRequest) return null;

  // Use portal to render modal at the root level
  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9999] transition-opacity"
        onClick={onHide}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10000] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-gray-800">Request Details</h5>
                  <p className="text-xs text-gray-500">RAD#{displayRequest.id}</p>
                </div>
                {displayRequest.status === 'completed' && (
                  <div className="ml-4 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 border border-emerald-300 rounded-full">
                    <span className="text-[10px] font-bold text-emerald-700">✓ COMPLETED</span>
                  </div>
                )}
              </div>
              <button
                onClick={onHide}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-600">Loading request details...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* COMPACT Patient & Request Information - Merged into single row */}
                    <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-3 shadow-sm">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Patient Avatar/Initial */}
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {displayRequest.patient_name?.charAt(0) || 'P'}
                        </div>
                        
                        {/* Patient Info - Compact */}
                        <div className="flex-1 min-w-[180px]">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{displayRequest.patient_name}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-mono border border-gray-200">
                              PID: {displayRequest.patient_id}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(displayRequest.date_created).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-8 bg-gray-200"></div>

                        {/* Request Stats - Ultra Compact */}
                        <div className="flex items-center gap-3">
                          {/* Urgency Badge */}
                          {(() => {
                            const urgency = getUrgencyConfig(displayRequest.urgency);
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500">Urgency:</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold ${urgency.bg} ${urgency.text} border ${urgency.border}`}>
                                  {urgency.label}
                                </span>
                              </div>
                            );
                          })()}

                          {/* Status Badge */}
                          {(() => {
                            const status = getStatusConfig(displayRequest.status);
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500">Status:</span>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold ${status.bg} ${status.text} border ${status.border}`}>
                                  <span>{status.icon}</span>
                                  {status.label}
                                </span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Amount - Compact */}
                        <div className="ml-auto flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-bold text-emerald-700">
                            ₦{parseFloat(displayRequest.total_amount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Clinical Notes - Compact */}
                    {displayRequest.clinical_notes && (
                      <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">Clinical Notes:</span>
                          <span className="text-xs text-gray-600 flex-1">{displayRequest.clinical_notes}</span>
                        </div>
                      </div>
                    )}

                    {/* Investigation Details */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <h6 className="text-xs font-bold text-white">
                              Investigations ({displayRequest.details?.length || 0})
                            </h6>
                          </div>
                        </div>
                      </div>
                      
                      {displayRequest.details && displayRequest.details.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">#</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">Investigation</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">View</th>
                                <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-600 uppercase">Qty</th>
                                <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-600 uppercase">Unit Price</th>
                                <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-600 uppercase">Total</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">Status</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {displayRequest.details.map((detail, index) => {
                                const status = getStatusConfig(detail.status);
                                return (
                                  <tr key={detail.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2 text-xs font-medium text-gray-700">{index + 1}</td>
                                    <td className="px-3 py-2">
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs font-semibold text-gray-900">{detail.investigation_title}</span>
                                        {detail.priority > 1 && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[8px] font-bold border border-blue-200">
                                            P{detail.priority}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-600">
                                      {detail.investigation_view_title || '—'}
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs font-medium text-gray-700">{detail.quantity}</td>
                                    <td className="px-3 py-2 text-right text-xs text-gray-600">
                                      ₦{parseFloat(detail.unit_price || 0).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 text-right text-xs font-bold text-emerald-600">
                                      ₦{parseFloat(detail.total_price || 0).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${status.bg} ${status.text} border ${status.border}`}>
                                        <span>{status.icon}</span>
                                        {status.label}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className="text-[10px] text-gray-600 font-medium">
                                        {detail.notes || '—'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot className="bg-gray-100 border-t border-gray-200">
                              <tr>
                                <td colSpan="5" className="px-3 py-2 text-right text-xs font-bold text-gray-700">
                                  Grand Total:
                                </td>
                                <td className="px-3 py-2 text-right text-sm font-bold text-emerald-600">
                                  ₦{parseFloat(displayRequest.total_amount || 0).toLocaleString()}
                                </td>
                                <td colSpan="2"></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 bg-gray-50">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </div>
                          <p className="text-xs font-medium text-gray-500">No investigation details available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3 flex justify-end gap-2">
              <button
                onClick={onHide}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
              {!displayRequest.details && (
                <button
                  onClick={fetchDetailedRequest}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1 shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Load Details
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default RequestDetailsModal;