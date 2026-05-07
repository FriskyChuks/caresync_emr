import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';
import InvestigationRequest from '../../radiology/InvestigationRequest';
import InvestigationRequestsHistory from '../../radiology/InvestigationRequestsHistory';

const PatientRadiology = ({ patient }) => {
  const { showMessage } = useMessage();
  const [activeTab, setActiveTab] = useState('request');
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    if (!patient?.id) {
      setLoadingRequests(false);
      return;
    }
    
    setLoadingRequests(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/radiologyapi/patients/${patient.id}/requests/`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching radiology requests:', error);
      setError('Failed to load radiology requests');
      showMessage('❌ Failed to load radiology requests', 'danger');
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [patient?.id, refreshTrigger]);

  const handleRequestCreated = (newRequest) => {
    showMessage(`✅ Radiology request #${newRequest.id} created successfully!`, 'success');
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('history');
  };

  const getPendingRequestsCount = () => {
    return requests.filter(req => 
      req.status === 'pending' || req.status === 'in_progress'
    ).length;
  };

  const getTotalRequestsCount = () => {
    return requests.length;
  };

  if (!patient) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 flex items-center justify-center mb-2">
          <span className="text-xl">👤</span>
        </div>
        <h4 className="text-sm text-gray-900 font-medium mb-1">No Patient Selected</h4>
        <p className="text-gray-500 text-xs">Select a patient to view radiology</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Beautiful Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <span className="text-white text-lg">🩻</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Radiology</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/80 truncate max-w-[120px]">
                  {patient.user_info?.fullname}
                </span>
                <div className="flex items-center gap-1">
                  <span className="px-1 py-0.5 bg-white/20 text-white text-[10px] rounded">
                    {getTotalRequestsCount()} total
                  </span>
                  {getPendingRequestsCount() > 0 && (
                    <span className="px-1 py-0.5 bg-yellow-500/80 text-white text-[10px] rounded">
                      {getPendingRequestsCount()} pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRequests}
              disabled={loadingRequests}
              className="px-2.5 py-1 text-xs bg-white/20 text-white rounded-lg hover:bg-white/30 disabled:opacity-50 flex items-center gap-1"
            >
              {loadingRequests ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
              ) : (
                <span>🔄</span>
              )}
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'request' 
                ? 'border-blue-500 text-blue-600 bg-blue-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span>🆕</span>
              New Request
              {getPendingRequestsCount() > 0 && (
                <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] rounded-full">
                  {getPendingRequestsCount()}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'history' 
                ? 'border-indigo-500 text-indigo-600 bg-indigo-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span>📋</span>
              Request History
              {requests.length > 0 && (
                <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded-full">
                  {requests.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="m-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-xs flex items-center gap-1">
            <span>❌</span>
            {error}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        {activeTab === 'request' && (
          <InvestigationRequest
            patient={patient}
            onRequestCreated={handleRequestCreated}
          />
        )}
        
        {activeTab === 'history' && (
          <InvestigationRequestsHistory
            requests={requests}
            loading={loadingRequests}
            patient={patient}
            onRefresh={fetchRequests}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default PatientRadiology;