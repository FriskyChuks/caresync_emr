// InvestigationRequestsHistory.js
import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ResultPrintModal from './ResultPrintModal';

const InvestigationRequestsHistory = ({ requests, loading, patient, onRefresh, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [expandedRequests, setExpandedRequests] = useState([]);

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-gradient-to-r from-emerald-500 to-teal-500',
      'in_progress': 'bg-gradient-to-r from-blue-500 to-indigo-500',
      'pending': 'bg-gradient-to-r from-amber-500 to-orange-500',
      'billed': 'bg-gradient-to-r from-indigo-500 to-purple-500',
      'partly_billed': 'bg-gradient-to-r from-purple-500 to-pink-500',
      'canceled': 'bg-gradient-to-r from-rose-500 to-pink-500',
      'default': 'bg-gradient-to-r from-gray-500 to-gray-600'
    };
    return colors[status] || colors.default;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      'stat': 'bg-gradient-to-r from-rose-500 to-pink-500',
      'urgent': 'bg-gradient-to-r from-amber-500 to-orange-500',
      'routine': 'bg-gradient-to-r from-gray-500 to-gray-600',
      'default': 'bg-gradient-to-r from-gray-500 to-gray-600'
    };
    return colors[urgency] || colors.default;
  };

  const handleViewResult = async (detail) => {
    try {
      const response = await axiosInstance.get(`/radiologyapi/open_investigation_result/${detail.id}/`);
      setSelectedResult(response.data);
      setShowResultModal(true);  
    } catch (err) {
      console.error("Error fetching radiology result", err);
    }
  };

  const toggleRequest = (requestId) => {
    setExpandedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
        request.id.toString().includes(searchTerm) ||
        (request.clinical_notes && request.clinical_notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.created_by_name && request.created_by_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-200">
        <div className="flex items-center space-x-3">
          <span className="text-rose-600">⚠️</span>
          <div>
            <p className="font-medium text-gray-800">Error Loading Requests</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="mt-3 px-3 py-1.5 text-sm bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:shadow-sm transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="billed">Billed</option>
            <option value="partly_billed">Partly Billed</option>
            <option value="canceled">Canceled</option>
          </select>
          
          <button
            onClick={onRefresh}
            className="px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-sm transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-gray-400 text-4xl mb-3">📋</div>
          <h3 className="text-gray-600 font-medium">
            {requests.length === 0 ? 'No Radiology Requests' : 'No Matching Requests'}
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {searchTerm || statusFilter !== 'all' 
              ? 'No requests match your search criteria'
              : 'No radiology requests found for this patient'
            }
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-3 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-sm transition-all duration-300"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRequests.map((request) => {
            const isExpanded = expandedRequests.includes(request.id);
            return (
              <div key={request.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                {/* Request Header */}
                <div 
                  className="p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleRequest(request.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className={`px-2 py-1 text-xs text-white rounded-full ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency?.toUpperCase() || 'ROUTINE'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-800 truncate">
                            RAD#{request.id}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatShortDate(request.date_created)}
                          </span>
                        </div>
                        {request.clinical_notes && (
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {request.clinical_notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs text-white rounded-full ${getStatusColor(request.status)}`}>
                        {request.status?.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                    <div className="text-center p-1 bg-gray-100 rounded">
                      <div className="font-medium text-gray-800">{request.details?.length || 0}</div>
                      <div className="text-gray-600">Items</div>
                    </div>
                    <div className="text-center p-1 bg-gray-100 rounded">
                      <div className="font-medium text-gray-800">
                        ₦{(request.total_amount || 0).toLocaleString()}
                      </div>
                      <div className="text-gray-600">Total</div>
                    </div>
                    <div className="text-center p-1 bg-gray-100 rounded">
                      <div className="font-medium text-gray-800">
                        {request.created_by_name || '—'}
                      </div>
                      <div className="text-gray-600">Doctor</div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-3">
                    {/* Clinical Notes */}
                    {request.clinical_notes && (
                      <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded">
                        <span className="text-xs font-medium text-gray-700">Clinical Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{request.clinical_notes}</p>
                      </div>
                    )}

                    {/* Request Details */}
                    <div className="space-y-2">
                      {request.details?.map((detail, idx) => (
                        <div key={detail.id || idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">#{idx + 1}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {detail.investigation_title || 'Unknown'}
                                </p>
                                {detail.investigation_view_title && (
                                  <p className="text-xs text-gray-600">
                                    View: {detail.investigation_view_title}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-800">
                                ₦{(detail.total_price || 0).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                ₦{(detail.unit_price || 0).toLocaleString()} × {detail.quantity || 1}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <span className={`px-2 py-1 text-xs text-white rounded ${getStatusColor(detail.status)}`}>
                                {detail.status?.replace('_', ' ').toUpperCase()}
                              </span>
                              
                              {detail.status === 'completed' && (
                                <button
                                  onClick={() => handleViewResult(detail)}
                                  className="px-2 py-1 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded hover:shadow-sm transition-all duration-300"
                                >
                                  👁️
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Created: {formatDate(request.date_created)}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Grand Total</p>
                            <p className="text-lg font-bold text-emerald-600">
                              ₦{(request.total_amount || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Summary Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredRequests.length} of {requests.length} requests
                {searchTerm && ` for "${searchTerm}"`}
                {statusFilter !== 'all' && ` with status "${statusFilter}"`}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-lg font-bold text-gray-800">
                  ₦{requests.reduce((sum, req) => sum + parseFloat(req.total_amount || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      <ResultPrintModal
        result={selectedResult}
        show={showResultModal}
        onHide={() => setShowResultModal(false)}
      />
    </div>
  );
};

export default InvestigationRequestsHistory;