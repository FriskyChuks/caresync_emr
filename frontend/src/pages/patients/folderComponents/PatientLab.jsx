import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import TestRequestForm from "../../lab/LabTestRequest";
import ResultSummaryModal from "../../lab/modals/ResultSummaryModal";

const PatientLab = ({ patient }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("request");
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (activeTab === "history") fetchLabHistory();
  }, [activeTab]);

  const fetchLabHistory = async () => {
    if (!patient?.id) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/labapi/patient-requests/${patient.id}/`);
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching lab history:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        <button
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center ${
            activeTab === "request"
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("request")}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          New Test Request
        </button>
        
        <button
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center ${
            activeTab === "history"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("history")}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Request History
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {activeTab === "request" && (
          <TestRequestForm
            patient={patient}
            onSuccess={() => setActiveTab("history")}
          />
        )}

        {activeTab === "history" && (
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-3 text-gray-500">Loading lab history...</p>
                </div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No Lab Requests</h3>
                <p className="text-gray-500 mt-1">Start by requesting your first lab test</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="font-medium text-gray-900">{new Date(req.request_date).toLocaleDateString()}</div>
                          <div className="text-gray-500">{new Date(req.request_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {req.created_by}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {req.details?.slice(0, 3).map((d) => (
                              <span key={d.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {d.test?.name}
                              </span>
                            ))}
                            {req.details?.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{req.details.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {req?.status === 'completed' ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Completed
                            </span>
                          ) : req?.status === 'in_progress' ? (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              In Progress
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {req?.status === 'completed' || req?.status === 'in_progress' ? (
                            <button
                              className="px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                              onClick={() => setSelectedRequest(req)}
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Result
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result Modal */}
      {selectedRequest && (
        <ResultSummaryModal
          show={!!selectedRequest}
          requestId={selectedRequest.id}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};

export default PatientLab;