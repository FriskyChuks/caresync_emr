// src/lab/components/TestCard.jsx
import React, { useState } from "react";
import SimpleTestBlock from "./SimpleTestBlock";
import SubTestBlock from "./SubTestBlock";

const TestCard = ({
  detail,
  values = {},
  comment = "",
  editable,
  isPaymentPending,
  saving,
  savingComment,
  onResultChange,
  onSubValueChange,
  onSubFlagChange,
  onCommentChange,
  onSaveComment,
}) => {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const subtests = detail.sub_tests || [];
  const simpleSaved = !!values?.lab_result_has_value;
  const isSubtest = subtests.length > 0;
  const hasExisting = values?.lab_result_exists;
  
  // Determine if results can be entered
  const canEnterResults = editable && !isPaymentPending && (detail.status === 'paid' || detail.status === 'in_progress');
  
  // Get status styling and icon
  const getStatusConfig = () => {
    const statusMap = {
      'pending': {
        bg: 'from-amber-400 to-orange-500',
        text: 'text-amber-800',
        bgLight: 'bg-amber-50',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Pending Payment'
      },
      'billed': {
        bg: 'from-yellow-400 to-orange-500',
        text: 'text-yellow-800',
        bgLight: 'bg-yellow-50',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
        label: 'Awaiting Payment'
      },
      'partly_paid': {
        bg: 'from-orange-400 to-red-500',
        text: 'text-orange-800',
        bgLight: 'bg-orange-50',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Partly Paid'
      },
      'paid': {
        bg: 'from-green-400 to-emerald-500',
        text: 'text-green-800',
        bgLight: 'bg-green-50',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Paid - Ready'
      },
      'in_progress': {
        bg: 'from-blue-400 to-indigo-500',
        text: 'text-blue-800',
        bgLight: 'bg-blue-50',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
        label: 'Results in Progress'
      },
      'completed': {
        bg: 'from-emerald-400 to-teal-500',
        text: 'text-emerald-800',
        bgLight: 'bg-emerald-50',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ),
        label: 'Completed'
      }
    };
    return statusMap[detail.status] || statusMap['pending'];
  };
  
  const statusConfig = getStatusConfig();
  
  return (
    <div className="group">
      <div className={`relative bg-gradient-to-br from-white to-blue-50 rounded-2xl border ${
        hasExisting ? 'border-emerald-200 shadow-md' : 'border-blue-100 shadow-sm hover:shadow-md'
      } overflow-hidden transition-all duration-300 hover:-translate-y-1`}>
        
        {/* Header Ribbon - Changes color based on payment status */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          detail.status === 'completed' ? 'from-emerald-400 to-teal-600' :
          detail.status === 'paid' || detail.status === 'in_progress' ? 'from-green-400 to-emerald-600' :
          detail.status === 'partly_paid' ? 'from-orange-400 to-red-600' :
          detail.status === 'billed' ? 'from-yellow-400 to-orange-600' :
          isSubtest ? 'from-blue-400 to-indigo-600' : 'from-cyan-400 to-blue-600'
        }`}></div>
        
        <div className="p-5">
          {/* Card Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isSubtest 
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100' 
                    : 'bg-gradient-to-r from-cyan-100 to-blue-100'
                }`}>
                  {isSubtest ? (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900">{detail.test.name}</h3>
                    {/* Enhanced Status Badge */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgLight} ${statusConfig.text}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {detail.test.si_unit && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {detail.test.si_unit}
                      </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ₦{detail.test.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {detail.request_note && (
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <span className="font-medium text-gray-700">Note:</span> {detail.request_note}
              </div>
            )}
          </div>

          {/* Payment Required Block */}
          {isPaymentPending && detail.status !== 'partly_paid' && (
            <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">Payment Required</p>
                  <p className="text-xs text-amber-700">Results entry is disabled until payment is completed for this test.</p>
                </div>
                <button 
                  onClick={() => window.location.href = `/billing/patient/${detail.test_request?.patient}/pay`}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Make Payment
                </button>
              </div>
            </div>
          )}

          {/* Partly Paid Info */}
          {detail.status === 'partly_paid' && (
            <div className="mb-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-orange-800">Partial payment received. Complete payment to enter results.</p>
              </div>
            </div>
          )}

          {/* Test Content */}
          <div className="mt-2">
            {subtests.length === 0 ? (
              <SimpleTestBlock
                detail={detail}
                values={values}
                editable={canEnterResults}
                disabled={!canEnterResults}
                onResultChange={onResultChange}
              />
            ) : (
              <SubTestBlock
                detail={detail}
                values={values}
                editable={canEnterResults}
                disabled={!canEnterResults}
                onSubValueChange={onSubValueChange}
                onSubFlagChange={onSubFlagChange}
              />
            )}
          </div>

          {/* MLS Comment Section - Always Visible */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowCommentBox(!showCommentBox)}
              className="group flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <div className="p-1 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="font-medium">
                {showCommentBox ? 'Hide' : 'Add'} MLS Comment
                {comment && !showCommentBox && ' (saved)'}
              </span>
              {comment && !showCommentBox && (
                <span className="text-xs text-green-600">✓</span>
              )}
            </button>
            
            {showCommentBox && (
              <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  MLS Comment (for doctor's reference)
                </label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  rows={3}
                  value={comment}
                  onChange={(e) => onCommentChange(detail.id, e.target.value)}
                  placeholder="E.g., Sample hemolyzed, needs recollection. Equipment calibration in progress. Results delayed due to quality control..."
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => onSaveComment(detail.id)}
                    disabled={savingComment}
                    className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {savingComment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Comment</span>
                      </>
                    )}
                  </button>
                </div>
                {detail.mls_comment && comment !== detail.mls_comment && (
                  <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Previously saved:</span> {detail.mls_comment}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {comment && !showCommentBox && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-xs text-blue-800 flex-1">
                    <span className="font-medium">MLS Comment:</span> {comment}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {saving && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-blue-600 font-medium">Saving results...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCard;