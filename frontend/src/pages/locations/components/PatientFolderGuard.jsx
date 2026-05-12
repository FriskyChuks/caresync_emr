// src/locations/components/PatientFolderGuard.jsx
import React from 'react';
import usePatientAccess from '../hooks/usePatientAccess';

const PatientFolderGuard = ({ patientId, children, onPaymentRequired }) => {
  const { 
    canAccess, 
    requiresPayment, 
    paymentMessage, 
    unpaidServices, 
    loading, 
    redirectToPayment,
    checkAccess 
  } = usePatientAccess(patientId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-3 text-sm text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!canAccess && requiresPayment) {
    // Build tooltip content for the lock screen
    const serviceList = unpaidServices.map((s, i) => (
      <li key={i} className="flex items-center gap-2 text-sm text-amber-700">
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
        {s}
      </li>
    ));

    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-amber-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">Folder Locked</h2>
          <p className="text-gray-600 mb-4">Payment is required to access this patient's folder</p>
          
          {unpaidServices.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 mb-5 text-left border border-amber-200">
              <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Outstanding Fees:
              </p>
              <ul className="space-y-1.5">
                {serviceList}
              </ul>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={redirectToPayment}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Make Payment
              </span>
            </button>
            <button
              onClick={() => {
                checkAccess();
                if (onPaymentRequired) onPaymentRequired();
              }}
              className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </span>
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Click "Make Payment" to complete payment and unlock the folder
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default PatientFolderGuard;