// ResultView.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";

const ResultView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  const user_category = user?.user_category.title.toLowerCase() || "staff";

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/labapi/results-summary/by-request/${id}/`)
      .then((res) => {
        setResultData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const requestInfo = resultData?.request_info || {};
  const results = resultData?.results || [];

  const simpleTests = results.filter((r) => r.sub_test_results.length === 0);
  const complexTests = results.filter((r) => r.sub_test_results.length > 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-blue-600 font-medium">Loading lab results...</p>
        <p className="text-sm text-gray-500">Request ID: #{id}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Lab Result Summary</h1>
              <p className="text-blue-100">Comprehensive laboratory test results report</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
              Request #{requestInfo.id}
            </span>
          </div>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            Patient Information
          </h3>
          <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-medium rounded-lg">
            {requestInfo.status}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Patient Name</div>
            <div className="font-semibold text-gray-800">{requestInfo.patient_name}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Demographics</div>
            <div className="font-medium text-gray-700">
              {requestInfo.gender} • {requestInfo?.age || 'N/A'}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Request Date</div>
            <div className="font-medium text-gray-700">
              {new Date(requestInfo.created_at).toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Physician</div>
            <div className="font-medium text-gray-700">
              {requestInfo.requested_by || "Not specified"}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Request ID</div>
            <div className="font-mono font-bold text-blue-700">#{requestInfo.id}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Result Status</div>
            <div className="font-medium">
              <span className="px-2 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-medium rounded">
                Complete
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results Sections */}
      <div className="space-y-6">
        {/* Simple Tests */}
        {simpleTests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Simple Tests ({simpleTests.length})
                </h3>
                <span className="text-sm text-gray-600">Single parameter tests</span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simpleTests.map((item) => (
                  <div key={item.id} className="group bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-800 group-hover:text-blue-700">
                        {item.test_name}
                      </h4>
                      <div className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-medium rounded">
                        Simple
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Result Value</span>
                        <span className="font-bold text-lg text-blue-700">
                          {item.result_value || "--"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Reference Range</span>
                        <span className="text-sm text-gray-700 font-medium">
                          {item.reference_range || "--"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Remark</span>
                        <span className="text-sm text-gray-700">
                          {item.remark || "No remarks"}
                        </span>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="p-1 bg-emerald-100 text-emerald-600 rounded">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Validated: {new Date(item.validated_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Complex Tests */}
        {complexTests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  Complex Tests ({complexTests.length})
                </h3>
                <span className="text-sm text-gray-600">Multiple parameter tests</span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {complexTests.map((item) => (
                  <div key={item.id} className="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-800 text-lg">
                        {item.test_name}
                      </h4>
                      <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 text-sm font-medium rounded-full">
                        Complex Panel
                      </div>
                    </div>

                    {/* Sub Tests Table */}
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sub Test</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Result</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference Range</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {item.sub_test_results.map((sub) => (
                            <tr key={sub.id} className={sub.is_critical ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}>
                              <td className="py-3 px-4 text-sm font-medium text-gray-800">
                                {sub.subtest_name}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${sub.is_critical ? 'text-red-700' : 'text-blue-700'}`}>
                                    {sub.result_value}
                                  </span>
                                  {sub.is_critical && (
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full">
                                      CRITICAL
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {sub.reference_range}
                              </td>
                              <td className="py-3 px-4">
                                <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  sub.is_critical 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {sub.is_critical ? 'Abnormal' : 'Normal'}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Remark Section */}
                    {item.remark && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-amber-100 text-amber-600 rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-amber-800">Remark</div>
                            <div className="text-sm text-amber-700">{item.remark}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Validation Info */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="p-1 bg-emerald-100 text-emerald-600 rounded">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Validated: {new Date(item.validated_at).toLocaleString()}</span>
                        </div>
                        <div className="text-gray-500 text-xs">
                          Panel ID: {item.id}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Button */}
      {user_category !== "admin" && resultData && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-gray-800">Print Report</h4>
              <p className="text-sm text-gray-600">Generate a printable PDF version of these results</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(
                  `${axiosInstance.defaults.baseURL}/labapi/pdf_result/${id}/print/`,
                  "_blank"
                )}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print PDF Report
              </button>
              
              <button
                onClick={() => window.print()}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-lg border border-gray-300 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Print Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultView;