// components/radiology/ResultPrintModal.js
import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';

const ResultPrintModal = ({ result, show, onHide }) => {
  const printRef = useRef();
  const [facilityInfo, setFacilityInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch facility information
  useEffect(() => {
    const fetchFacilityInfo = async () => {
      if (show) {
        setLoading(true);
        try {
          const response = await axiosInstance.get('/accountapi/facility-info/');
          setFacilityInfo(response.data);
        } catch (err) {
          console.error('Error fetching facility information', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFacilityInfo();
  }, [show]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '_blank', 'width=900,height=600');
    
    const printStyles = `
      <style>
        @media print {
          @page { 
            margin: 0.75in; 
            size: A4;
          }
          
          body { 
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1a1e24;
            background: #ffffff;
          }
          
          /* Header Styles */
          .print-header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 1rem;
            margin-bottom: 1.5rem;
          }
          
          .facility-name {
            font-size: 24pt;
            font-weight: 800;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.25rem;
            letter-spacing: -0.5px;
          }
          
          .facility-subname {
            font-size: 14pt;
            color: #4b5563;
            font-weight: 500;
            margin-bottom: 0.75rem;
          }
          
          .facility-contact {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1.5rem;
            color: #6b7280;
            font-size: 9pt;
          }
          
          .department-header {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-top: 2px solid #e2e8f0;
            border-bottom: 2px solid #e2e8f0;
            padding: 0.75rem;
            margin: 1rem 0;
          }
          
          .department-title {
            font-size: 18pt;
            font-weight: 700;
            color: #dc2626;
            letter-spacing: 1px;
          }
          
          .report-title {
            font-size: 16pt;
            font-weight: 600;
            color: #1f2937;
          }
          
          /* Info Card */
          .info-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          }
          
          .patient-name {
            font-size: 14pt;
            font-weight: 700;
            color: #2563eb;
          }
          
          .patient-detail {
            color: #4b5563;
            font-size: 10pt;
          }
          
          .badge-id {
            background: #e2e8f0;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: 600;
            color: #1e293b;
          }
          
          /* Section Styles */
          .section-title {
            font-size: 13pt;
            font-weight: 700;
            color: #1e293b;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .section-title i {
            color: #2563eb;
          }
          
          /* Result Content */
          .result-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          }
          
          .result-header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 0.75rem 1rem;
            font-weight: 600;
            font-size: 10pt;
            letter-spacing: 0.5px;
          }
          
          .result-body {
            padding: 1.5rem;
            background: #ffffff;
            white-space: pre-line;
            line-height: 1.7;
            font-size: 11pt;
            color: #1f2937;
          }
          
          /* Status Badges */
          .abnormal-badge {
            background: #fee2e2;
            color: #b91c1c;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-weight: 700;
            font-size: 9pt;
            border: 1px solid #fecaca;
          }
          
          .normal-badge {
            background: #dcfce7;
            color: #166534;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-weight: 700;
            font-size: 9pt;
            border: 1px solid #bbf7d0;
          }
          
          .verified-badge {
            background: #dbeafe;
            color: #1e40af;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-weight: 700;
            font-size: 9pt;
            border: 1px solid #bfdbfe;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
          }
          
          .unverified-badge {
            background: #fef3c7;
            color: #92400e;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-weight: 700;
            font-size: 9pt;
            border: 1px solid #fde68a;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
          }
          
          /* Tables */
          .info-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 0.5rem;
          }
          
          .info-table td {
            padding: 0.25rem 0;
          }
          
          .info-table td:first-child {
            font-weight: 600;
            color: #4b5563;
            width: 120px;
          }
          
          .info-table td:last-child {
            color: #1f2937;
            font-weight: 500;
          }
          
          /* Footer */
          .print-footer {
            border-top: 2px solid #e2e8f0;
            margin-top: 2rem;
            padding-top: 1rem;
            text-align: center;
            color: #6b7280;
            font-size: 9pt;
          }
          
          .footer-note {
            background: #f8fafc;
            padding: 0.5rem;
            border-radius: 8px;
            font-weight: 500;
            color: #475569;
          }
        }
        
        /* Screen Styles */
        .modal-preview {
          background: #f8fafc;
        }
        
        .status-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1;
        }
        
        .status-chip.verified {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .status-chip.unverified {
          background: #fef3c7;
          color: #92400e;
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Radiology Report - ${result?.investigation_title}</title>
          <link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          ${printStyles}
        </head>
        <body>
          <div class="container-fluid px-4">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (!show || !result) return null;

  // Use portal to render modal at the root level
  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9999] transition-opacity"
        onClick={onHide}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10000] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <i className="ri-printer-line text-white text-sm"></i>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-gray-800">Print Radiology Report</h5>
                  <p className="text-xs text-gray-500">{result.investigation_title}</p>
                </div>
                {result.supervised_by && result.date_verified && (
                  <div className="ml-4 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 border border-emerald-300 rounded-full">
                    <i className="ri-shield-check-line text-emerald-600 text-xs"></i>
                    <span className="text-[10px] font-bold text-emerald-700">VERIFIED</span>
                  </div>
                )}
              </div>
              <button
                onClick={onHide}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-gray-500"></i>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-600">Loading facility information...</p>
                  </div>
                ) : (
                  <div ref={printRef} className="space-y-6">
                    {/* Facility Header */}
                    <div className="text-center border-b-2 border-blue-600 pb-5">
                      {facilityInfo && (
                        <div className="space-y-3">
                          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                            {facilityInfo.facility_name}
                          </h1>
                          {facilityInfo.sub_name && (
                            <h4 className="text-lg font-semibold text-gray-600">
                              {facilityInfo.sub_name}
                            </h4>
                          )}
                          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <i className="ri-map-pin-line text-blue-500"></i>
                              {facilityInfo.address}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-phone-line text-blue-500"></i>
                              {facilityInfo.phone1}
                              {facilityInfo.phone2 && ` / ${facilityInfo.phone2}`}
                            </span>
                            {facilityInfo.email && (
                              <span className="flex items-center gap-1">
                                <i className="ri-mail-line text-blue-500"></i>
                                {facilityInfo.email}
                              </span>
                            )}
                            {facilityInfo.website && (
                              <span className="flex items-center gap-1">
                                <i className="ri-global-line text-blue-500"></i>
                                {facilityInfo.website}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 border-t border-b border-red-200 py-3">
                        <h2 className="text-xl font-bold text-red-600 tracking-wide">RADIOLOGY DEPARTMENT</h2>
                        <h3 className="text-lg font-semibold text-gray-700">INVESTIGATION REPORT</h3>
                      </div>
                    </div>

                    {/* Patient & Report Info Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex flex-wrap items-start gap-4">
                        {/* Patient Info */}
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <i className="ri-user-line text-white text-sm"></i>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Patient Information</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-800">{result.patient_data?.name}</span>
                                <span className="text-xs text-gray-500">|</span>
                                <span className="text-xs text-gray-600">{result.patient_data?.age} yrs</span>
                                <span className="text-xs text-gray-500">|</span>
                                <span className="text-xs text-gray-600">{result.patient_data?.gender}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3 pl-10">
                            <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-mono text-gray-700 border border-gray-200">
                              RAD#{result.request_detail?.request?.id}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-mono text-gray-700 border border-gray-200">
                              RES#{result.id}
                            </span>
                          </div>
                        </div>

                        {/* Investigation Info */}
                        <div className="flex-1 min-w-[200px] border-l border-gray-200 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <i className="ri-microscope-line text-white text-sm"></i>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Investigation</span>
                              <div className="text-sm font-bold text-gray-800">{result.investigation_title}</div>
                            </div>
                          </div>
                          <div className="pl-10">
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">By:</span> {result.created_by_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(result.date_created).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Clinical Notes if exists */}
                        {result.request_detail?.request?.clinical_notes && (
                          <div className="flex-1 min-w-[200px] border-l border-gray-200 pl-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <i className="ri-file-text-line text-white text-sm"></i>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-500">Clinical Notes</span>
                                <div className="text-xs text-gray-700 max-w-xs truncate" title={result.request_detail.request.clinical_notes}>
                                  {result.request_detail.request.clinical_notes}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Result Content */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3">
                        <h5 className="text-sm font-bold text-white flex items-center gap-2">
                          <i className="ri-file-copy-line"></i>
                          Investigation Findings
                        </h5>
                      </div>
                      <div className="p-5 bg-white">
                        <div className="prose prose-sm max-w-none">
                          {result.result ? (
                            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                              {result.result}
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">No result findings recorded.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Comments & Diagnosis */}
                      {(result.comments || result.diagnosis) && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2">
                            <h5 className="text-xs font-bold text-white flex items-center gap-2">
                              <i className="ri-chat-1-line"></i>
                              Additional Notes
                            </h5>
                          </div>
                          <div className="p-4 bg-white space-y-3">
                            {result.comments && (
                              <div>
                                <span className="text-xs font-bold text-gray-500 block mb-1">Comments:</span>
                                <p className="text-sm text-gray-700">{result.comments}</p>
                              </div>
                            )}
                            {result.diagnosis && (
                              <div>
                                <span className="text-xs font-bold text-gray-500 block mb-1">Diagnosis:</span>
                                <p className="text-sm text-gray-700">{result.diagnosis}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Report Status */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2">
                          <h5 className="text-xs font-bold text-white flex items-center gap-2">
                            <i className="ri-information-line"></i>
                            Report Status
                          </h5>
                        </div>
                        <div className="p-4 bg-white">
                          <div className="space-y-3">
                            {/* Abnormality Status */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500">Findings:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                result.is_abnormal 
                                  ? 'bg-red-100 text-red-700 border border-red-200' 
                                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}>
                                {result.is_abnormal ? 'ABNORMAL' : 'NORMAL'}
                              </span>
                            </div>

                            {/* Verification Status */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500">Verification:</span>
                              {result.supervised_by && result.date_verified ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                                  <i className="ri-shield-check-line"></i>
                                  VERIFIED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                                  <i className="ri-time-line"></i>
                                  AWAITING VERIFICATION
                                </span>
                              )}
                            </div>

                            {/* Verification Details */}
                            {result.supervised_by && result.date_verified && (
                              <>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                  <span className="text-xs font-medium text-gray-500">Verified By:</span>
                                  <span className="text-xs font-semibold text-gray-800">{result.supervised_by}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-500">Verified On:</span>
                                  <span className="text-xs text-gray-600">
                                    {new Date(result.date_verified).toLocaleString()}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t-2 border-gray-200 pt-4 text-center space-y-2">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600">
                          This is a computer-generated report. No signature is required.
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Report generated on {new Date().toLocaleString()} | 
                        For inquiries contact: {facilityInfo?.phone1 || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
              <button 
                onClick={onHide}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <i className="ri-close-line"></i>
                Close
              </button>
              
              {user?.user_category?.title?.toLowerCase() === 'admin' && (
                <>
                  <button 
                    onClick={handlePrint}
                    className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <i className="ri-printer-line"></i>
                    Print Report
                  </button>
                  
                  <button className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <i className="ri-download-line"></i>
                    Download PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body // Render at the root level
  );
};

export default ResultPrintModal;