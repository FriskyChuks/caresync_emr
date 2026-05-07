// components/radiology/ResultsList.js
import React, { useState } from 'react';
import ResultPrintModal from '../ResultPrintModal';

const ResultsList = ({ results, onRefresh }) => {
  const [selectedResult, setSelectedResult] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handlePrintResult = (result) => {
    setSelectedResult(result);
    setShowPrintModal(true);
  };

  const getAbnormalityConfig = (isAbnormal) => {
    return isAbnormal ? {
      bg: 'bg-rose-100',
      text: 'text-rose-700',
      border: 'border-rose-200',
      label: 'Abnormal',
      icon: '⚠️'
    } : {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'Normal',
      icon: '✓'
    };
  };

  const getVerificationConfig = (result) => {
    if (result.supervised_by && result.date_verified) {
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Verified',
        icon: '✅',
        by: result.supervised_by
      };
    }
    return {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'Pending Verification',
      icon: '⏳'
    };
  };

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="mt-3 text-sm font-medium text-gray-700">No completed results found</p>
        <p className="text-xs text-gray-500">Results will appear here once verified</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Result ID</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Investigation</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Result</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Abnormality</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Verification</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {results.map((result) => {
                const abnormality = getAbnormalityConfig(result.is_abnormal);
                const verification = getVerificationConfig(result);
                
                return (
                  <tr 
                    key={result.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                        RES#{result.id}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center text-white text-xs font-medium shadow-sm">
                          {result.patient_data?.name?.charAt(0) || 'P'}
                        </div>
                        <span className="text-xs font-medium text-gray-900">
                          {result.patient_data?.name}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-gray-700">{result.investigation_title}</span>
                    </td>
                    
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="text-xs text-gray-600 truncate" title={result.result}>
                        {result.result || 
                          <span className="text-gray-400">—</span>
                        }
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${abnormality.bg} ${abnormality.text} border ${abnormality.border}`}>
                        <span>{abnormality.icon}</span>
                        {abnormality.label}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${verification.bg} ${verification.text} border ${verification.border} w-fit`}>
                          <span>{verification.icon}</span>
                          {verification.label}
                        </span>
                        {verification.by && (
                          <span className="text-[8px] text-gray-500">
                            by {verification.by}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-[10px]">
                        <div className="font-medium text-gray-700">
                          {new Date(result.date_created).toLocaleDateString()}
                        </div>
                        <div className="text-gray-400">
                          {new Date(result.date_created).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {/* Print Button */}
                        <button
                          onClick={() => handlePrintResult(result)}
                          className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                          title="Print Result"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </button>
                        
                        {/* Download Button */}
                        <button
                          className="p-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                          title="Download Result"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Modal */}
      <ResultPrintModal
        result={selectedResult}
        show={showPrintModal}
        onHide={() => setShowPrintModal(false)}
      />
    </>
  );
};

export default ResultsList;