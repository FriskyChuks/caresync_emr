// EnterLabResults.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TestCard from "./components/TestCard";
import useLabResults from "./components/useLabResults";
import { useMessage } from "../../context/MessageProvider";

const EnterLabResults = () => {
  const { request_id } = useParams();
  const { showMessage } = useMessage();

  const {
    request,
    formState,
    comments,
    loading,
    saving,
    hasAnyExisting,
    fetchRequest,
    handleResultChange,
    handleSubValueChange,
    handleSubFlagChange,
    handleCommentChange,
    saveComment,
    submitBulk,
    canEdit,
    savingComment,
  } = useLabResults(request_id);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (request_id) fetchRequest();
  }, [request_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-blue-600">Loading request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-100 text-amber-600 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">Request not found</p>
            <p className="text-xs text-amber-700">Could not retrieve test details</p>
          </div>
        </div>
      </div>
    );
  }

  const saveButtonLabel = hasAnyExisting ? "Update Results" : "Save Results";
  
  // Count tests by status for payment info
  const pendingPayment = request.details?.filter(d => d.status === 'pending' || d.status === 'billed').length || 0;
  const readyForResults = request.details?.filter(d => d.status === 'paid' || d.status === 'in_progress').length || 0;
  const completed = request.details?.filter(d => d.status === 'completed').length || 0;

  const handleSaveAll = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitBulk();
      if (result?.payment_blocked?.length > 0) {
        showMessage(`Some results not saved: ${result.payment_blocked.map(b => b.test_name).join(', ')}`, "warning");
      }
    } catch (err) {
      // errors already handled in submitBulk
    } finally {
      setIsSubmitting(false);
    }
  };

  const editableTests = request.details?.filter(detail => canEdit(detail) && (detail.status === 'paid' || detail.status === 'in_progress')).length || 0;
  const totalCompletion = ((completed + readyForResults) / request.details?.length * 100) || 0;

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Left - Patient Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Enter Results</h2>
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded shadow-sm">#{request.id}</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                <div className="flex items-center gap-1 bg-white border border-blue-200 px-2 py-0.5 rounded-lg">
                  <div className="p-0.5 bg-blue-50 rounded">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800 truncate max-w-[120px]">{request.patient_info?.user_info?.fullname}</span>
                </div>
                
                <div className="px-1.5 py-0.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-medium rounded border border-indigo-200">
                  ID: {request.patient_info?.id}
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="flex items-center gap-3 text-xs">
              {pendingPayment > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded border border-red-200">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span>💰 Pending: {pendingPayment}</span>
                </div>
              )}
              {readyForResults > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>✏️ Ready: {readyForResults}</span>
                </div>
              )}
              {completed > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-200">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>✅ Done: {completed}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
            <button
              onClick={() => fetchRequest()}
              disabled={loading}
              className="group flex items-center gap-1 px-2.5 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs rounded-lg hover:bg-blue-50 hover:shadow-sm transition-all disabled:opacity-50"
            >
              <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSubmitting || saving || editableTests === 0}
              className="group flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {isSubmitting || saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Saving…</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="hidden sm:inline">{saveButtonLabel}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {request.details.map((detail) => {
          const values = formState[detail.id] || {
            value: "",
            notes: "",
            critical: false,
            retest: false,
            sub_results: {},
            lab_result_exists: false,
            lab_result_has_value: false,
          };

          const comment = comments[detail.id] || detail.mls_comment || "";
          const editable = canEdit(detail) && (detail.status === 'paid' || detail.status === 'in_progress');
          const isPaymentPending = detail.status === 'pending' || detail.status === 'billed';

          return (
            <TestCard
              key={detail.id}
              detail={detail}
              values={values}
              comment={comment}
              editable={editable}
              isPaymentPending={isPaymentPending}
              saving={isSubmitting || saving}
              savingComment={savingComment === detail.id}
              onResultChange={(id, field, value) => handleResultChange(id, field, value)}
              onSubValueChange={(id, subId, field, value) => handleSubValueChange(id, subId, field, value)}
              onSubFlagChange={(id, subId, field, value) => handleSubFlagChange(id, subId, field, value)}
              onCommentChange={(id, comment) => handleCommentChange(id, comment)}
              onSaveComment={(id) => saveComment(id)}
              onSave={() => fetchRequest()}
            />
          );
        })}
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-3 bg-gradient-to-r from-white to-blue-50 border border-blue-200 rounded-xl shadow-lg p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-600">Ready to save</div>
                <div className="text-sm font-bold text-blue-700">{editableTests} editable tests</div>
              </div>
            </div>
            
            {pendingPayment > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{pendingPayment} test(s) require payment</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleSaveAll}
            disabled={isSubmitting || saving || editableTests === 0}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            {isSubmitting || saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving…</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{saveButtonLabel}</span>
              </>
            )}
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(totalCompletion)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${totalCompletion}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterLabResults;