// components/radiology/ResultEntry.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';
import { useMessage } from '../../context/MessageProvider';

const ResultEntry = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showMessage } = useMessage();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingResult, setFetchingResult] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('investigations');

  // Result form state
  const [resultForm, setResultForm] = useState({
    result: '',
    comments: '',
    diagnosis: '',
    findings: '',
    is_abnormal: false,
    supervised_by: ''  // Now stores string (name of supervisor)
  });

  // Fetch request details
  const fetchRequestDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/radiologyapi/requests/${requestId}/`);
      setRequest(response.data);
    } catch (err) {
      console.error('Error fetching request details', err);
      showMessage('Failed to load request details', 'danger');
      navigate('/radiology-dashboard');
    } finally {
      setLoading(false);
    }
  }, [requestId, showMessage, navigate]);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId, fetchRequestDetails]);

  // Handle result form input changes
  const handleResultInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setResultForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle findings JSON input
  const handleFindingsChange = (findingsString) => {
    try {
      const findings = findingsString.trim() ? JSON.parse(findingsString) : {};
      setResultForm(prev => ({ ...prev, findings }));
    } catch (err) {
      setResultForm(prev => ({ ...prev, findings: findingsString }));
    }
  };

  // Fetch existing result for a detail
  const fetchExistingResult = async (detailId) => {
    setFetchingResult(true);
    try {
      const response = await axiosInstance.get(`/radiologyapi/open_investigation_result/${detailId}/`);
      const result = response.data;
      
      setResultForm({
        result: result.result || '',
        comments: result.comments || '',
        diagnosis: result.diagnosis || '',
        findings: result.findings ? JSON.stringify(result.findings, null, 2) : '',
        is_abnormal: result.is_abnormal || false,
        supervised_by: result.supervised_by || ''  // Now just a string
      });
    } catch (err) {
      if (err.response?.status === 404) {
        // No result exists, that's fine - we'll create a new one
        setResultForm({
          result: '',
          comments: '',
          diagnosis: '',
          findings: '',
          is_abnormal: false,
          supervised_by: ''
        });
      } else {
        console.error('Error fetching result:', err);
        showMessage('Failed to load existing result', 'danger');
      }
    } finally {
      setFetchingResult(false);
    }
  };

  // Start entering result for a specific detail
  const handleEnterResult = async (detail) => {
    setSelectedDetail(detail);
    
    // Check if detail is completed (result exists)
    if (detail.status === 'completed') {
      // Fetch the existing result
      await fetchExistingResult(detail.id);
    } else {
      // Create mode - reset form
      setResultForm({
        result: '',
        comments: '',
        diagnosis: '',
        findings: '',
        is_abnormal: false,
        supervised_by: ''
      });
    }
    
    setActiveTab('result');
  };

  // Submit result
  const handleSubmitResult = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare the payload - supervised_by is now a string
      const payload = {
        request_detail: selectedDetail.id,
        result: resultForm.result,
        comments: resultForm.comments || '',
        diagnosis: resultForm.diagnosis || '',
        is_abnormal: resultForm.is_abnormal,
        supervised_by: resultForm.supervised_by || '',  // Send empty string if not provided
        created_by: user.id
      };

      // Handle findings if present
      if (resultForm.findings && resultForm.findings.trim()) {
        try {
          payload.findings = JSON.parse(resultForm.findings);
        } catch (err) {
          showMessage('Invalid JSON format in findings field', 'warning');
          setSubmitting(false);
          return;
        }
      }

      console.log('Submitting payload:', payload);

      if (selectedDetail.status === 'completed') {
        // We need to get the result ID first
        try {
          // First try to get the existing result to get its ID
          const resultResponse = await axiosInstance.get(`/radiologyapi/open_investigation_result/${selectedDetail.id}/`);
          const resultId = resultResponse.data.id;
          
          // UPDATE existing result
          await axiosInstance.put(`/radiologyapi/results/${resultId}/`, payload);
          showMessage('Result updated successfully!', 'success');
        } catch (err) {
          if (err.response?.status === 404) {
            // Result doesn't exist anymore, create new one
            await axiosInstance.post('/radiologyapi/results/', payload);
            showMessage('Result submitted successfully!', 'success');
          } else {
            throw err;
          }
        }
      } else {
        // CREATE new result
        await axiosInstance.post('/radiologyapi/results/', payload);
        showMessage('Result submitted successfully!', 'success');
      }

      // Reset and refresh
      setSelectedDetail(null);
      setActiveTab('investigations');
      setResultForm({
        result: '',
        comments: '',
        diagnosis: '',
        findings: '',
        is_abnormal: false,
        supervised_by: ''
      });
      fetchRequestDetails();
    } catch (err) {
      console.error('Error submitting result:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle specific error messages
      if (err.response?.data?.request_detail) {
        showMessage('A result already exists for this investigation', 'warning');
      } else {
        showMessage('Failed to submit result', 'danger');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel result entry
  const handleCancelResult = () => {
    setSelectedDetail(null);
    setActiveTab('investigations');
    setResultForm({
      result: '',
      comments: '',
      diagnosis: '',
      findings: '',
      is_abnormal: false,
      supervised_by: ''
    });
  };

  // Get status badge for detail
  const getDetailStatusConfig = (status) => {
    const config = {
      pending: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800', 
        border: 'border-amber-300',
        label: 'Pending',
        icon: '⏳'
      },
      in_progress: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        border: 'border-blue-300',
        label: 'In Progress',
        icon: '🔄'
      },
      completed: { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-800', 
        border: 'border-emerald-300',
        label: 'Completed',
        icon: '✅'
      }
    };
    
    return config[status] || config.pending;
  };

  const getUrgencyConfig = (urgency) => {
    const config = {
      routine: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        border: 'border-gray-300',
        label: 'Routine'
      },
      urgent: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800', 
        border: 'border-amber-300',
        label: 'Urgent'
      },
      stat: { 
        bg: 'bg-rose-100', 
        text: 'text-rose-800', 
        border: 'border-rose-300',
        label: 'STAT'
      }
    };
    return config[urgency] || config.routine;
  };

  const getRequestStatusConfig = (status) => {
    const config = {
      pending: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800', 
        border: 'border-amber-300',
        label: 'Pending',
        icon: '⏳'
      },
      in_progress: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        border: 'border-blue-300',
        label: 'In Progress',
        icon: '🔄'
      },
      completed: { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-800', 
        border: 'border-emerald-300',
        label: 'Completed',
        icon: '✅'
      }
    };
    return config[status] || config.pending;
  };

  if (loading) {
    return (
      <div className="w-full bg-white border-b border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-base font-medium text-gray-700">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="w-full bg-white border-b border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-100 rounded-xl border border-gray-300 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="mt-4 text-base font-medium text-gray-800">Request not found</p>
          <button 
            className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            onClick={() => navigate('/radiology-dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const urgency = getUrgencyConfig(request.urgency);
  const requestStatus = getRequestStatusConfig(request.status);
  const completedCount = request.details?.filter(d => d.status === 'completed').length || 0;
  const totalCount = request.details?.length || 0;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Header Card - Full Width */}
      <div className="w-full bg-white border-b border-gray-300 shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-base font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Enter Investigation Results
              </h5>
              <div className="flex flex-wrap gap-4 mt-2">
                <span className="inline-flex items-center gap-1.5 text-sm text-white/90">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">RAD#{request.id}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-white/90">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold">{request.patient_name}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-white/90">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  <span className="font-semibold">PID: {request.patient}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-white/90">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold">Dr. {request.created_by_name}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="px-4 py-2 bg-white/20 text-white text-sm font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/40"
                onClick={() => navigate('/radiology-dashboard')}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m4-2h10" />
                  </svg>
                  Dashboard
                </span>
              </button>
              <button 
                className="px-4 py-2 bg-white/20 text-white text-sm font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/40"
                onClick={fetchRequestDetails}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Request Info Bar */}
        <div className="px-6 py-3 bg-gray-100 border-b border-gray-300">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Urgency:</span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold ${urgency.bg} ${urgency.text} border ${urgency.border}`}>
                {urgency.label}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Status:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold ${requestStatus.bg} ${requestStatus.text} border ${requestStatus.border}`}>
                <span>{requestStatus.icon}</span>
                {requestStatus.label}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Date:</span>
              <span className="text-sm font-medium text-gray-800">{new Date(request.date_created).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Time:</span>
              <span className="text-sm font-medium text-gray-800">{new Date(request.date_created).toLocaleTimeString()}</span>
            </div>

            {request.clinical_notes && (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-semibold text-gray-600">Notes:</span>
                <span className="text-sm font-medium text-gray-800 truncate max-w-xs" title={request.clinical_notes}>
                  {request.clinical_notes}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="w-full p-6">
        {/* Tabs */}
        <div className="mb-4 border-b border-gray-300">
          <div className="flex gap-2">
            <button 
              className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
                activeTab === 'investigations' 
                  ? 'bg-white text-blue-700 border-t border-l border-r border-gray-300 -mb-px' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('investigations')}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Investigations
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">
                  {totalCount}
                </span>
              </span>
            </button>
            <button 
              className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
                activeTab === 'result' && selectedDetail
                  ? 'bg-white text-blue-700 border-t border-l border-r border-gray-300 -mb-px' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              } ${!selectedDetail ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => activeTab === 'result' ? handleCancelResult() : null}
              disabled={!selectedDetail}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {selectedDetail?.status === 'completed' ? 'Edit Result' : 'Enter Result'}
                {selectedDetail && (
                  <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-xs font-bold truncate max-w-[120px]">
                    {selectedDetail.investigation_title}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
          {/* Investigations List */}
          {activeTab === 'investigations' && (
            <div className="p-5">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Investigation</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">View</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300 bg-white">
                      {request.details && request.details.map((detail, index) => {
                        const status = getDetailStatusConfig(detail.status);
                        return (
                          <tr key={detail.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div>
                                <span className="text-sm font-semibold text-gray-900">{detail.investigation_title}</span>
                                {detail.notes && (
                                  <p className="text-xs text-gray-600 mt-0.5 font-medium">Note: {detail.notes}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{detail.investigation_view_title || '—'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{detail.quantity}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold ${status.bg} ${status.text} border ${status.border}`}>
                                <span>{status.icon}</span>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                className={`px-3 py-1.5 text-white text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 shadow-sm ${
                                  detail.status === 'completed' 
                                    ? 'bg-amber-600 hover:bg-amber-700' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                                } ${fetchingResult && selectedDetail?.id === detail.id ? 'opacity-50 cursor-wait' : ''}`}
                                onClick={() => handleEnterResult(detail)}
                                disabled={fetchingResult}
                              >
                                {fetchingResult && selectedDetail?.id === detail.id ? (
                                  <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    {detail.status === 'completed' ? (
                                      <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Update
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Enter
                                      </>
                                    )}
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="mt-5 bg-gray-100 rounded-lg border border-gray-300 p-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700">{totalCount}</div>
                    <p className="text-sm font-semibold text-gray-600">Total Investigations</p>
                  </div>
                  <div className="text-center border-x border-gray-300">
                    <div className="text-2xl font-bold text-emerald-700">{completedCount}</div>
                    <p className="text-sm font-semibold text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-700">{totalCount - completedCount}</div>
                    <p className="text-sm font-semibold text-gray-600">Pending</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                    <span className="text-sm font-bold text-gray-800">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result Entry Form */}
          {activeTab === 'result' && selectedDetail && (
            <div className="p-5">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className={`px-5 py-4 bg-gradient-to-r ${
                  selectedDetail.status === 'completed' 
                    ? 'from-amber-700 to-orange-700' 
                    : 'from-blue-700 to-indigo-800'
                }`}>
                  <h5 className="text-base font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {selectedDetail.status === 'completed' ? 'Update Result for:' : 'Enter Result for:'} {selectedDetail.investigation_title}
                  </h5>
                  {selectedDetail.investigation_view_title && (
                    <p className="text-sm text-white/90 mt-1 font-medium">
                      View: {selectedDetail.investigation_view_title}
                    </p>
                  )}
                  {fetchingResult && (
                    <p className="text-xs text-white/80 mt-1 flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading existing result...
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmitResult} className="p-6">
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="result" className="block text-sm font-bold text-gray-700 mb-2">
                        Result <span className="text-rose-600">*</span>
                      </label>
                      <textarea
                        id="result"
                        name="result"
                        rows="6"
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors font-medium text-gray-800"
                        value={resultForm.result}
                        onChange={handleResultInputChange}
                        required
                        placeholder="Enter detailed investigation results, findings, observations, and interpretation..."
                        disabled={fetchingResult}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="comments" className="block text-sm font-bold text-gray-700 mb-2">
                          Comments
                        </label>
                        <textarea
                          id="comments"
                          name="comments"
                          rows="4"
                          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors font-medium text-gray-800"
                          value={resultForm.comments}
                          onChange={handleResultInputChange}
                          placeholder="Brief comments or clinical impressions"
                          disabled={fetchingResult}
                        />
                      </div>
                      <div>
                        <label htmlFor="diagnosis" className="block text-sm font-bold text-gray-700 mb-2">
                          Diagnosis
                        </label>
                        <textarea
                          id="diagnosis"
                          name="diagnosis"
                          rows="4"
                          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors font-medium text-gray-800"
                          value={resultForm.diagnosis}
                          onChange={handleResultInputChange}
                          placeholder="Diagnostic impression or conclusion"
                          disabled={fetchingResult}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="findings" className="block text-sm font-bold text-gray-700 mb-2">
                        Structured Findings (JSON)
                      </label>
                      <textarea
                        id="findings"
                        name="findings"
                        rows="4"
                        className="w-full px-4 py-3 text-sm font-mono border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors text-gray-800"
                        value={resultForm.findings}
                        onChange={(e) => handleFindingsChange(e.target.value)}
                        placeholder='{"measurement": "value", "observation": "description"}'
                        disabled={fetchingResult}
                      />
                      <p className="mt-2 text-xs font-medium text-gray-600">
                        Optional: Enter structured findings in JSON format for standardized reporting
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="flex items-center gap-3 p-4 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                          <input
                            type="checkbox"
                            name="is_abnormal"
                            checked={resultForm.is_abnormal}
                            onChange={handleResultInputChange}
                            className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                            disabled={fetchingResult}
                          />
                          <span className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Mark as Abnormal Findings
                          </span>
                        </label>
                      </div>
                      <div>
                        <label htmlFor="supervised_by" className="block text-sm font-bold text-gray-700 mb-2">
                          Supervised By
                        </label>
                        <input
                          type="text"
                          id="supervised_by"
                          name="supervised_by"
                          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors font-medium text-gray-800"
                          value={resultForm.supervised_by}
                          onChange={handleResultInputChange}
                          placeholder="Enter supervisor name (e.g., Dr. Smith)"
                          disabled={fetchingResult}
                        />
                        <p className="mt-1 text-xs text-gray-500">Enter the name of the supervising radiologist/consultant</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-300 flex items-center justify-between">
                    <button
                      type="button"
                      className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={handleCancelResult}
                      disabled={submitting || fetchingResult}
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Investigations
                      </span>
                    </button>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-600">
                        {selectedDetail.status === 'completed' ? 'Updating existing result' : 'Creating new result'}
                      </span>
                      <button
                        type="submit"
                        className={`px-6 py-2.5 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm ${
                          selectedDetail.status === 'completed'
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={submitting || fetchingResult || !resultForm.result.trim()}
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {selectedDetail.status === 'completed' ? 'Updating...' : 'Submitting...'}
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {selectedDetail.status === 'completed' ? 'Update Result' : 'Submit Result'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultEntry;