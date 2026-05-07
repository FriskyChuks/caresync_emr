import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";

const ResultSummaryModal = ({ show, requestId, onClose }) => {
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (show) {
      setAnimateIn(true);
    } else {
      setAnimateIn(false);
    }
  }, [show]);

  useEffect(() => {
    if (!show || !requestId) return;

    setLoading(true);
    axiosInstance
      .get(`/labapi/results-summary/by-request/${requestId}/`)
      .then((res) => {
        setResultData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [show, requestId]);

  if (!show) return null;

  const requestInfo = resultData?.request_info || {};
  const results = resultData?.results || [];
  const simpleTests = results.filter((r) => r.sub_test_results.length === 0);
  const complexTests = results.filter((r) => r.sub_test_results.length > 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          show ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div 
          className="fixed inset-0 bg-gradient-to-br from-blue-900/30 via-indigo-800/20 to-purple-900/30 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Container */}
        <div 
          className={`relative w-full max-w-6xl bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-2xl border border-blue-100 transform transition-all duration-300 ${
            animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Decorative Top Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 rounded-t-2xl"></div>
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Lab Result Summary
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Comprehensive test analysis and results
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
              >
                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-blue-600 font-medium">Loading results summary...</p>
              </div>
            ) : resultData ? (
              <>
                {/* Patient Info Card */}
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Patient Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Patient Name</p>
                      <p className="font-semibold text-gray-900">{requestInfo.patient_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Gender & Age</p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{requestInfo.gender}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-semibold text-gray-900">{requestInfo.age} yrs</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Request ID</p>
                      <p className="font-semibold text-gray-900">{requestInfo.id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        requestInfo.status === 'completed' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : requestInfo.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {requestInfo.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Request Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(requestInfo.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Physician</p>
                      <p className="font-semibold text-gray-900">{requestInfo.requested_by || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Simple Tests Section */}
                {simpleTests.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Simple Tests</h3>
                      <span className="ml-2 px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {simpleTests.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {simpleTests.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-blue-100 p-4 hover:shadow-md transition-shadow duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-900">{item.test_name}</h4>
                            <div className="flex items-center gap-2">
                              {item.is_critical && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  Critical
                                </span>
                              )}
                              {item.needs_retest && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Retest
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                              <span className="text-sm text-gray-600">Result</span>
                              <span className="font-bold text-blue-700">{item.result_value || "--"}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600">Reference Range</span>
                              <span className="font-medium text-gray-700">{item.reference_range || "--"}</span>
                            </div>
                            {item.remark && (
                              <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                                <span className="text-sm font-medium text-amber-800">Remark: </span>
                                <span className="text-sm text-amber-700">{item.remark}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                              <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Validated: {new Date(item.validated_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Complex Tests Section */}
                {complexTests.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Complex Tests</h3>
                      <span className="ml-2 px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                        {complexTests.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {complexTests.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-indigo-100 p-4 hover:shadow-md transition-shadow duration-300">
                          <div className="mb-3">
                            <h4 className="font-bold text-gray-900 mb-2">{item.test_name}</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {item.sub_test_results.length} parameters
                              </span>
                              {item.is_critical && (
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                                  Contains critical values
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                  <th className="py-2 px-3 text-left text-xs font-semibold text-indigo-700">Parameter</th>
                                  <th className="py-2 px-3 text-left text-xs font-semibold text-indigo-700">Result</th>
                                  <th className="py-2 px-3 text-left text-xs font-semibold text-indigo-700">Range</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {item.sub_test_results.map((sub) => (
                                  <tr key={sub.id} className={`${sub.is_critical ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                    <td className="py-2 px-3">
                                      <div className="font-medium text-gray-900 text-sm">{sub.subtest_name}</div>
                                    </td>
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${sub.is_critical ? 'text-red-600' : 'text-blue-600'}`}>
                                          {sub.result_value}
                                        </span>
                                        {sub.is_critical && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                                            !
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-2 px-3">
                                      <span className="text-xs text-gray-600">{sub.reference_range}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {item.remark && (
                            <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                              <span className="text-sm font-medium text-amber-800">Remark: </span>
                              <span className="text-sm text-amber-700">{item.remark}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Validated: {new Date(item.validated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex p-4 bg-red-100 rounded-full mb-3">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600">Unable to load results for this request.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-blue-100 bg-gradient-to-r from-gray-50 to-blue-50 flex justify-between items-center rounded-b-2xl">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>
                Total Tests: {results.length} ({simpleTests.length} simple, {complexTests.length} complex)
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-sm"
              >
                Close
              </button>
              {resultData && (
                <button
                  onClick={() =>
                    window.open(
                      `${axiosInstance.defaults.baseURL}/labapi/pdf_result/${requestId}/print/`,
                      "_blank"
                    )
                  }
                  className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultSummaryModal;