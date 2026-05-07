// components/radiology/PendingRequestsList.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RequestDetailsModal from './RequestDetailsModal';

const PendingRequestsList = ({ requests, onRefresh }) => {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleEnterResult = (requestId) => {
    navigate(`/radiology/result-entry/${requestId}`);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleBilling = (request) => {
    navigate(`/radiology/billing/${request.patient}`);
  };

  const getUrgencyConfig = (urgency) => {
    const config = {
      routine: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-700', 
        border: 'border-gray-200',
        label: 'Routine',
      },
      urgent: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-700', 
        border: 'border-amber-200',
        label: 'Urgent',
      },
      stat: { 
        bg: 'bg-rose-100', 
        text: 'text-rose-700', 
        border: 'border-rose-200',
        label: 'STAT',
      }
    };
    return config[urgency] || config.routine;
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-700', 
        border: 'border-amber-200',
        label: 'Pending',
        icon: '⏳',
      },
      in_progress: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        border: 'border-blue-200',
        label: 'In Progress',
        icon: '🔄',
      },
      completed: { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200',
        label: 'Completed',
        icon: '✅',
      },
      billed: { 
        bg: 'bg-purple-100', 
        text: 'text-purple-700', 
        border: 'border-purple-200',
        label: 'Billed',
        icon: '💰',
      },
      partly_billed: { 
        bg: 'bg-indigo-100', 
        text: 'text-indigo-700', 
        border: 'border-indigo-200',
        label: 'Partly Billed',
        icon: '💳',
      }
    };
    return config[status] || config.pending;
  };

  const shouldShowEnterResult = (request) => {
    return request.status === 'billed' || request.status === 'partly_billed' || request.status === 'in_progress';
  };

  const shouldShowBilling = (request) => {
    return request.status !== 'billed' && request.status !== 'partly_billed';
  };

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="mt-3 text-sm font-medium text-gray-700">No pending investigation requests</p>
        <p className="text-xs text-gray-500">All requests have been processed</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Clinical Notes</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Urgency</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Progress</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => {
                const urgency = getUrgencyConfig(request.urgency);
                const status = getStatusConfig(request.status);
                const progressPercentage = (request.completed_details_count / request.details_count) * 100;
                
                return (
                  <tr 
                    key={request.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="text-xs font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                        RAD#{request.id}
                      </span>
                    </td>
                    
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center text-white text-xs font-medium shadow-sm">
                          {request.patient_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900">{request.patient_name}</div>
                          <div className="text-[10px] text-gray-500">PID: {request.patient_id}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-3 py-3 max-w-[150px]">
                      <div className="text-xs text-gray-600 truncate" title={request.clinical_notes}>
                        {request.clinical_notes || 
                          <span className="text-gray-400">—</span>}
                      </div>
                    </td>
                    
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium ${urgency.bg} ${urgency.text} border ${urgency.border}`}>
                        {urgency.label}
                      </span>
                    </td>
                    
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${status.bg} ${status.text} border ${status.border}`}>
                        <span>{status.icon}</span>
                        {status.label}
                      </span>
                    </td>
                    
                    <td className="px-3 py-3 min-w-[120px]">
                      <div className="space-y-1">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-500">
                          <span>{request.completed_details_count}/{request.details_count}</span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-[10px]">
                        <div className="font-medium text-gray-700">
                          {new Date(request.date_created).toLocaleDateString()}
                        </div>
                        <div className="text-gray-400">
                          {new Date(request.date_created).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {/* Enter Result Button */}
                        {shouldShowEnterResult(request) && (
                          <button
                            onClick={() => handleEnterResult(request.id)}
                            className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            title="Enter Result"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        )}
                        
                        {/* Billing Button */}
                        {shouldShowBilling(request) && (
                          <Link
                            to={`/radiology/billing/${request.patient_id}`}
                            className="p-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
                            title="Billing"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </Link>
                        )}
                        
                        {/* Details Button */}
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="p-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                          title="View Details"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal
        request={selectedRequest}
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default PendingRequestsList;