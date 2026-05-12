// components/radiology/ResultEntry.js - Mobile-friendly version with edit fix
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
  const [savingComment, setSavingComment] = useState(false);
  const [comments, setComments] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Result form state
  const [resultForm, setResultForm] = useState({
    result: '',
    comments: '',
    diagnosis: '',
    findings: '',
    is_abnormal: false,
    supervised_by: ''
  });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch request details
  const fetchRequestDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/radiologyapi/requests/${requestId}/`);
      setRequest(response.data);
      
      // Initialize comments from details
      const initialComments = {};
      response.data.details?.forEach(detail => {
        if (detail.radiologist_comment) {
          initialComments[detail.id] = detail.radiologist_comment;
        }
      });
      setComments(initialComments);
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

  // Handle radiologist comment change
  const handleCommentChange = (detailId, comment) => {
    setComments(prev => ({
      ...prev,
      [detailId]: comment
    }));
  };

  // Save radiologist comment
  const saveRadiologistComment = async (detailId) => {
    const comment = comments[detailId] || '';
    setSavingComment(true);
    
    try {
      await axiosInstance.patch(`/radiologyapi/request-details/${detailId}/update-comment/`, {
        radiologist_comment: comment
      });
      
      showMessage('Comment saved successfully', 'success');
      
      // Update local request data
      setRequest(prev => {
        if (!prev) return prev;
        const updatedDetails = prev.details.map(d => 
          d.id === detailId ? { ...d, radiologist_comment: comment } : d
        );
        return { ...prev, details: updatedDetails };
      });
      
    } catch (err) {
      console.error('Error saving comment:', err);
      showMessage('Failed to save comment', 'danger');
    } finally {
      setSavingComment(false);
    }
  };

  // ✅ FIXED: Check if results can be entered - ALLOW for completed (to edit)
  const canEnterResults = (detail) => {
    // Allow entry for paid, in_progress, AND completed (for editing existing results)
    return detail.status === 'paid' || detail.status === 'in_progress' || detail.status === 'completed';
  };

  // Fetch existing result for a detail
  const fetchExistingResult = async (detailId) => {
    setFetchingResult(true);
    try {
      const response = await axiosInstance.get(`/radiologyapi/get-result/${detailId}/`);
      const result = response.data;
      
      setResultForm({
        result: result.result || '',
        comments: result.comments || '',
        diagnosis: result.diagnosis || '',
        findings: result.findings ? JSON.stringify(result.findings, null, 2) : '',
        is_abnormal: result.is_abnormal || false,
        supervised_by: result.supervised_by || ''
      });
    } catch (err) {
      if (err.response?.status === 404) {
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
    // Debug logging
    console.log('Entering result for detail:', detail.id);
    console.log('Detail status:', detail.status);
    console.log('Can enter results:', canEnterResults(detail));
    
    if (!canEnterResults(detail)) {
      showMessage(`Cannot enter results - status is ${detail.status_display || detail.status}. Payment required.`, 'warning');
      return;
    }
    
    setSelectedDetail(detail);
    
    // Check if detail has existing result (status completed or we have a result)
    if (detail.status === 'completed') {
      await fetchExistingResult(detail.id);
    } else {
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

  // Submit result (create or update)
  const handleSubmitResult = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        request_detail: selectedDetail.id,
        result: resultForm.result,
        comments: resultForm.comments || '',
        diagnosis: resultForm.diagnosis || '',
        is_abnormal: resultForm.is_abnormal,
        supervised_by: resultForm.supervised_by || '',
        created_by: user.id
      };

      if (resultForm.findings && resultForm.findings.trim()) {
        try {
          payload.findings = JSON.parse(resultForm.findings);
        } catch (err) {
          showMessage('Invalid JSON format in findings field', 'warning');
          setSubmitting(false);
          return;
        }
      }

      // For completed items, we need to update via PUT instead of POST
      if (selectedDetail.status === 'completed') {
        // First get the existing result ID
        const resultResponse = await axiosInstance.get(`/radiologyapi/get-result/${selectedDetail.id}/`);
        const resultId = resultResponse.data.id;
        await axiosInstance.put(`/radiologyapi/results/${resultId}/`, payload);
        showMessage('Result updated successfully!', 'success');
      } else {
        await axiosInstance.post(`/radiologyapi/submit-result/${selectedDetail.id}/`, payload);
        showMessage('Result submitted successfully!', 'success');
      }

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
      
      if (err.response?.data?.payment_required) {
        showMessage('Payment required to enter results. Please complete payment first.', 'warning');
      } else if (err.response?.data?.error) {
        showMessage(err.response.data.error, 'danger');
      } else {
        showMessage('Failed to submit result', 'danger');
      }
    } finally {
      setSubmitting(false);
    }
  };

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

  // Status config functions
  const getDetailStatusConfig = (detail) => {
    const status = detail.status;
    const canEnter = canEnterResults(detail);
    
    if (status === 'completed') {
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', label: 'Completed', icon: '✅' };
    }
    if (canEnter && status !== 'completed') {
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', label: 'Ready for Results', icon: '📝' };
    }
    if (status === 'paid') {
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'Paid - Ready', icon: '💰' };
    }
    if (status === 'partly_paid') {
      return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', label: 'Partly Paid', icon: '💳' };
    }
    if (status === 'billed') {
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', label: 'Awaiting Payment', icon: '⏳' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', label: 'Pending', icon: '⏳' };
  };

  const getUrgencyConfig = (urgency) => {
    const config = {
      routine: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Routine', icon: '📋' },
      urgent: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Urgent', icon: '⚠️' },
      stat: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'STAT', icon: '🚨' }
    };
    return config[urgency] || config.routine;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-3 text-sm text-purple-600 font-medium">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center max-w-md">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Request Not Found</h3>
          <p className="text-sm text-gray-500 mb-5">The investigation request doesn't exist or has been removed.</p>
          <button className="px-5 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition" onClick={() => navigate('/radiology-dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const urgency = getUrgencyConfig(request.urgency);
  const completedCount = request.details?.filter(d => d.status === 'completed').length || 0;
  const totalCount = request.details?.length || 0;
  const paidCount = request.details?.filter(d => d.status === 'paid' || d.status === 'in_progress' || d.status === 'completed').length || 0;
  const pendingPaymentCount = totalCount - paidCount;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-3 py-3">
        
        {/* Mobile-Optimized Header */}
        <div className="relative mb-3 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 shadow-lg">
          <div className="relative px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-sm font-bold text-white truncate">Results Entry</h1>
                    <span className="flex-shrink-0 px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-semibold text-white">RAD#{request.id}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/90 truncate">
                    <span className="truncate">{request.patient_name || 'Unknown Patient'}</span>
                    <span className="text-white/60 flex-shrink-0">•</span>
                    <span className="flex-shrink-0">ID: {request.patient_id}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1.5 flex-shrink-0">
                <button 
                  className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all"
                  onClick={() => navigate('/radiology-dashboard')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
                <button 
                  className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all"
                  onClick={fetchRequestDetails}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Quick info chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium ${urgency.bg} ${urgency.text}`}>
                {urgency.icon} {urgency.label}
              </span>
              {request.patient_gender && (
                <span className="text-[9px] text-white/80 bg-white/10 px-1.5 py-0.5 rounded">{request.patient_gender}</span>
              )}
              {request.patient_age && (
                <span className="text-[9px] text-white/80 bg-white/10 px-1.5 py-0.5 rounded">{request.patient_age}y</span>
              )}
              <span className="text-[9px] text-white/80 bg-white/10 px-1.5 py-0.5 rounded">{new Date(request.date_created).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Compact Stats Cards */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white rounded-lg p-2.5 shadow-sm border border-purple-100">
            <p className="text-xs text-purple-600 font-medium">Total Tests</p>
            <p className="text-lg font-bold text-gray-800">{totalCount}</p>
          </div>
          <div className="bg-white rounded-lg p-2.5 shadow-sm border border-purple-100">
            <p className="text-xs text-amber-600 font-medium">Pending Payment</p>
            <p className="text-lg font-bold text-amber-600">{pendingPaymentCount}</p>
          </div>
          <div className="bg-white rounded-lg p-2.5 shadow-sm border border-purple-100">
            <p className="text-xs text-green-600 font-medium">Ready/Paid</p>
            <p className="text-lg font-bold text-green-600">{paidCount}</p>
          </div>
          <div className="bg-white rounded-lg p-2.5 shadow-sm border border-purple-100">
            <p className="text-xs text-emerald-600 font-medium">Completed</p>
            <p className="text-lg font-bold text-emerald-600">{completedCount}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg p-2.5 mb-3 shadow-sm border border-purple-100">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-semibold text-gray-700">Progress</span>
            <span className="text-xs font-bold text-purple-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-3">
          <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('investigations')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                activeTab === 'investigations'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Tests ({totalCount})
            </button>
            <button
              onClick={() => selectedDetail && setActiveTab('result')}
              disabled={!selectedDetail}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                activeTab === 'result' && selectedDetail
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              } ${!selectedDetail ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {selectedDetail?.status === 'completed' ? 'Edit' : 'Enter'}
            </button>
          </div>
        </div>

        {/* Investigations List - Mobile card view */}
        {activeTab === 'investigations' && (
          <div className="space-y-2 pb-20">
            {request.details?.map((detail, index) => {
              const status = getDetailStatusConfig(detail);
              const isPaymentBlocked = !canEnterResults(detail) && detail.status !== 'completed';
              
              return (
                <div key={detail.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                        <h4 className="text-sm font-semibold text-gray-800">{detail.investigation_title}</h4>
                      </div>
                      {detail.investigation_view_title && (
                        <p className="text-xs text-gray-500 mt-0.5">{detail.investigation_view_title}</p>
                      )}
                      {detail.notes && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">📝 {detail.notes}</p>
                      )}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    {isPaymentBlocked ? (
                      <div className="relative group">
                        <button className="px-2 py-1 bg-gray-300 text-gray-500 text-[10px] font-semibold rounded-lg cursor-not-allowed flex items-center gap-1" disabled>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Locked
                        </button>
                      </div>
                    ) : (
                      <button
                        className={`px-2 py-1 text-white text-[10px] font-semibold rounded-lg transition flex items-center gap-1 ${
                          detail.status === 'completed' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                        onClick={() => handleEnterResult(detail)}
                      >
                        {detail.status === 'completed' ? (
                          <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>Edit</>
                        ) : (
                          <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>Enter</>
                        )}
                      </button>
                    )}
                    
                    {detail.radiologist_comment && (
                      <button className="p-1 text-gray-400 hover:text-purple-600 transition relative group" title={detail.radiologist_comment}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Result Entry Form - Mobile optimized */}
        {activeTab === 'result' && selectedDetail && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className={`px-3 py-2 bg-gradient-to-r ${selectedDetail.status === 'completed' ? 'from-amber-500 to-orange-500' : 'from-purple-600 to-pink-500'} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {selectedDetail.status === 'completed' ? 'Update Result' : 'Enter Result'}
                  </h3>
                  <p className="text-xs text-white/90 truncate">{selectedDetail.investigation_title}</p>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/20 text-white`}>
                  {selectedDetail.status_display || selectedDetail.status}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitResult} className="p-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Result / Findings <span className="text-red-500">*</span></label>
                <textarea
                  name="result"
                  rows={12}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition font-medium text-gray-800"
                  value={resultForm.result}
                  onChange={handleResultInputChange}
                  required
                  placeholder="Enter detailed investigation results..."
                  disabled={fetchingResult}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Comments</label>
                <textarea
                  name="comments"
                  rows={3}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition font-medium text-gray-800"
                  value={resultForm.comments}
                  onChange={handleResultInputChange}
                  placeholder="Brief comments or clinical impressions..."
                  disabled={fetchingResult}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Diagnosis</label>
                <textarea
                  name="diagnosis"
                  rows={3}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition font-medium text-gray-800"
                  value={resultForm.diagnosis}
                  onChange={handleResultInputChange}
                  placeholder="Diagnostic impression or conclusion..."
                  disabled={fetchingResult}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_abnormal"
                    checked={resultForm.is_abnormal}
                    onChange={handleResultInputChange}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-200"
                    disabled={fetchingResult}
                  />
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Abnormal
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Supervised By</label>
                <input
                  type="text"
                  name="supervised_by"
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition"
                  value={resultForm.supervised_by}
                  onChange={handleResultInputChange}
                  placeholder="Enter supervisor name"
                  disabled={fetchingResult}
                />
              </div>

              {/* Radiologist Comment Section */}
              <div className="border-t border-gray-200 pt-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Radiologist Comment</label>
                <div className="flex gap-2">
                  <textarea
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition resize-none"
                    rows={2}
                    value={comments[selectedDetail.id] || ''}
                    onChange={(e) => handleCommentChange(selectedDetail.id, e.target.value)}
                    placeholder="Add comments about this investigation..."
                  />
                  <button
                    type="button"
                    onClick={() => saveRadiologistComment(selectedDetail.id)}
                    disabled={savingComment}
                    className="px-2 py-1.5 bg-purple-600 text-white text-[10px] font-semibold rounded-lg hover:bg-purple-700 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {savingComment ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save'}
                  </button>
                </div>
                <p className="mt-1 text-[9px] text-gray-400">Internal note for radiologists/technicians</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  className="flex-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-1"
                  onClick={handleCancelResult}
                  disabled={submitting || fetchingResult}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 shadow-sm ${
                    selectedDetail.status === 'completed' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'
                  } ${(!resultForm.result.trim() || submitting || fetchingResult) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!resultForm.result.trim() || submitting || fetchingResult}
                >
                  {submitting ? (
                    <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Processing</>
                  ) : (
                    <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>{selectedDetail.status === 'completed' ? 'Update' : 'Submit'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultEntry;