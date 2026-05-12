// src/locations/components/PatientFolderButton.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import usePatientAccess from '../hooks/usePatientAccess';

const PatientFolderButton = ({ patientId, className = "", showLabel = false }) => {
  const { canAccess, requiresPayment, paymentMessage, unpaidServices, loading, checkAccess } = usePatientAccess(patientId);
  const [showTooltip, setShowTooltip] = useState(false);

  if (loading) {
    return (
      <div className={`${className} p-1.5 bg-gray-100 rounded-lg animate-pulse`}>
        <div className="w-5 h-5"></div>
      </div>
    );
  }

  const isLocked = !canAccess && requiresPayment;

  if (isLocked) {
    return (
      <div 
        className="relative inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className={`${className} p-1.5 bg-amber-100 text-amber-600 rounded-lg cursor-not-allowed inline-flex items-center justify-center`}>
          <div className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {showLabel && <span className="ml-1 text-xs">Locked</span>}
          </div>
        </div>
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
            <div className="bg-gray-900 text-white text-xs rounded-lg shadow-xl overflow-hidden min-w-[200px] max-w-[280px]">
              <div className="px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600">
                <p className="font-semibold flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Payment Required
                </p>
              </div>
              <div className="px-3 py-2 space-y-1">
                {unpaidServices && unpaidServices.length > 0 ? (
                  <>
                    <p className="text-xs text-gray-300 mb-1">Complete payment to access:</p>
                    {unpaidServices.map((service, idx) => (
                      <p key={idx} className="text-xs text-amber-300 flex items-center gap-1">
                        <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                        {service}
                      </p>
                    ))}
                  </>
                ) : (
                  <p className="text-xs text-gray-300">Payment required to access patient folder</p>
                )}
                <div className="mt-2 pt-1 border-t border-gray-700">
                  <p className="text-[10px] text-gray-400">Go to Pay-Point to make payment</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="border-8 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={`/patient/folder/${patientId}`}
      className={`${className} p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 inline-flex items-center justify-center group`}
      title="Patient Folder"
    >
      <div className="relative">
        <svg className="w-5 h-5 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        {showLabel && <span className="ml-1 text-xs">Folder</span>}
      </div>
    </Link>
  );
};

export default PatientFolderButton;