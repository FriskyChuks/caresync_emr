import React, { useRef } from "react";

const LabResultModal = ({ show, onClose, request, allowEdit = false }) => {
  const printRef = useRef();

  if (!show || !request) return null;

  const handlePrint = () => {
    window.print();
  };

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
          ref={printRef}
          className={`relative w-full max-w-4xl bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-2xl border border-blue-100 transform transition-all duration-300 ${
            show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Decorative Top Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 rounded-t-2xl"></div>
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Laboratory Results
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-semibold text-blue-700">
                      {request.patient_name || "Unknown Patient"}
                    </span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-500">
                      Request ID: {request.id}
                    </span>
                  </div>
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
          <div className="px-6 py-5">
            {/* Request Info */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Requested By</p>
                    <p className="font-medium text-gray-900">{request.created_by}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Request Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(request.request_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-hidden rounded-xl border border-blue-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700 border-b border-blue-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Test
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700 border-b border-blue-200">
                        Result
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700 border-b border-blue-200">
                        Reference Range
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-blue-700 border-b border-blue-200">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {request.details?.map((d) => (
                      <tr key={d.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{d.test?.name}</div>
                          {d.test?.si_unit && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Unit: {d.test.si_unit}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className={`font-semibold ${d.result_value ? 'text-blue-700' : 'text-gray-400'}`}>
                            {d.result_value || "—"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600">
                            {d.test?.reference_range || "—"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600">
                            {d.remarks || "—"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-blue-100 bg-gradient-to-r from-gray-50 to-blue-50 flex justify-between items-center rounded-b-2xl">
            <div className="text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Ready for printing</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-sm"
              >
                Close
              </button>
              {allowEdit && (
                <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg">
                  Edit Results
                </button>
              )}
              <button
                onClick={handlePrint}
                className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Results
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx="true">{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed {
            position: absolute !important;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }
          .fixed > *:first-child,
          .fixed > *:first-child * {
            visibility: hidden;
          }
          .relative {
            visibility: visible;
            width: 100%;
            max-width: none !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            margin: 0 !important;
          }
          button, [class*="hover:"], .print-hide {
            display: none !important;
          }
          table {
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #333 !important;
            padding: 8px !important;
          }
          thead {
            background: #f8fafc !important;
          }
        }
      `}</style>
    </>
  );
};

export default LabResultModal;