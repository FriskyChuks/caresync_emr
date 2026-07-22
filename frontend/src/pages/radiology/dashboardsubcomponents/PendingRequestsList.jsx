// components/radiology/PendingRequestsList.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestDetailsModal from './RequestDetailsModal';

const PendingRequestsList = ({ requests, onRefresh, filters, isFiltered = false }) => {
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

  const handleBilling = (patientId) => {
    navigate(`/radiology/billing/${patientId}`);
  };

  const getUrgencyConfig = (urgency) => {
    const config = {
      routine: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        label: 'Routine',
        icon: '📋'
      },
      urgent: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800', 
        label: 'Urgent',
        icon: '⚠️'
      },
      stat: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        label: 'STAT',
        icon: '🚨'
      }
    };
    return config[urgency] || config.routine;
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800', 
        label: 'Pending Payment',
        icon: '💰',
        action: 'billing'
      },
      billed: { 
        bg: 'bg-purple-100', 
        text: 'text-purple-800', 
        label: 'Awaiting Payment',
        icon: '💳',
        action: 'billing'
      },
      partly_billed: { 
        bg: 'bg-indigo-100', 
        text: 'text-indigo-800', 
        label: 'Partly Billed',
        icon: '📝',
        action: 'billing'
      },
      partly_paid: { 
        bg: 'bg-orange-100', 
        text: 'text-orange-800', 
        label: 'Partly Paid',
        icon: '🏦',
        action: 'enter'
      },
      paid: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        label: 'Paid - Ready',
        icon: '✅',
        action: 'enter'
      },
      in_progress: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        label: 'In Progress',
        icon: '🔄',
        action: 'enter'
      },
      completed: { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-800', 
        label: 'Completed',
        icon: '✓',
        action: 'view'
      }
    };
    return config[status] || config.pending;
  };

  const shouldShowEnterResult = (request) => {
    return ['paid', 'partly_paid', 'in_progress'].includes(request.status);
  };

  const shouldShowBilling = (request) => {
    return ['pending', 'billed', 'partly_billed'].includes(request.status);
  };

  const getPendingPaymentCount = (request) => {
    if (!request.details) return 0;
    return request.details.filter(d => d.status === 'pending' || d.status === 'billed').length;
  };

  const getPaidItemsCount = (request) => {
    if (!request.details) return 0;
    return request.details.filter(d => d.status === 'paid' || d.status === 'in_progress').length;
  };

  // Check if a request is from today
  const isTodayRequest = (dateCreated) => {
    const today = new Date();
    const requestDate = new Date(dateCreated);
    return requestDate.toDateString() === today.toDateString();
  };

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl border border-gray-200">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="mt-3 text-sm font-semibold text-gray-700">
          {!isFiltered ? 'No pending requests for today' : 'No matching requests found'}
        </p>
        <p className="text-xs text-gray-500">
          {!isFiltered 
            ? 'New requests will appear here as they are created' 
            : 'Try adjusting your search filters'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Clinical Notes</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Urgency</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Progress</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {requests.map((request) => {
                const urgency = getUrgencyConfig(request.urgency);
                const status = getStatusConfig(request.status);
                const paidCount = getPaidItemsCount(request);
                const pendingPaymentCount = getPendingPaymentCount(request);
                const totalCount = request.details_count || 0;
                const paymentProgress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
                const canEnterResults = shouldShowEnterResult(request);
                const isToday = isTodayRequest(request.date_created);
                
                return (
                  <tr 
                    key={request.id}
                    className={`hover:bg-gray-50 transition-colors ${isToday && !isFiltered ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                        RAD#{request.id}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {request.patient_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{request.patient_name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">ID: {request.patient_id}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="text-sm text-gray-700 truncate" title={request.clinical_notes}>
                        {request.clinical_notes || <span className="text-gray-400 italic">—</span>}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${urgency.bg} ${urgency.text}`}>
                        {urgency.icon}
                        {urgency.label}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${status.bg} ${status.text}`}>
                          {status.icon}
                          {status.label}
                        </span>
                        {request.status === 'partly_paid' && (
                          <div className="text-xs text-orange-700 font-medium">
                            {paidCount}/{totalCount} paid
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span className="font-medium">Progress</span>
                          <span className="font-bold text-green-700">{Math.round(paymentProgress)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                            style={{ width: `${paymentProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>✅ Paid: {paidCount}</span>
                          <span>⏳ Due: {pendingPaymentCount}</span>
                          <span>📊 Total: {totalCount}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-700">
                          {new Date(request.date_created).toLocaleDateString()}
                          {isToday && !isFiltered && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(request.date_created).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {canEnterResults && (
                          <button
                            onClick={() => handleEnterResult(request.id)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            title={request.status === 'partly_paid' ? "Enter Results for Paid Items Only" : "Enter Results"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        
                        {shouldShowBilling(request) && (
                          <button
                            onClick={() => handleBilling(request.patient_id)}
                            className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                            title="Make Payment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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