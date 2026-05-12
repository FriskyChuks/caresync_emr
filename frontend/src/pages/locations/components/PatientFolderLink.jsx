// src/locations/components/PatientFolderLink.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import usePatientAccess from '../hooks/usePatientAccess';
import PaymentRequiredModal from './PaymentRequiredModal';

const PatientFolderLink = ({ patientId, className, children, compact = false }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { canAccess, requiresPayment, paymentMessage, unpaidServices, loading, checkAccess } = usePatientAccess(patientId);

  const handleClick = (e) => {
    if (!canAccess && requiresPayment) {
      e.preventDefault();
      setShowPaymentModal(true);
    }
  };

  if (loading) {
    return (
      <span className={`inline-flex items-center justify-center ${className || 'p-1.5 bg-gray-100 rounded-lg animate-pulse'}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
      </span>
    );
  }

  return (
    <>
      <Link
        to={`/patient/folder/${patientId}`}
        onClick={handleClick}
        className={className}
        title={!canAccess && requiresPayment ? "Payment required to access folder" : "Patient Folder"}
      >
        {children || (
          <span className={`inline-flex items-center gap-1.5 ${!canAccess && requiresPayment ? 'opacity-60' : ''}`}>
            <svg className={`w-5 h-5 ${!canAccess && requiresPayment ? 'text-amber-500' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {!compact && (
              <span className={!canAccess && requiresPayment ? 'text-amber-600' : 'text-emerald-600'}>
                {!canAccess && requiresPayment ? 'Folder Locked' : 'Patient Folder'}
              </span>
            )}
            {!canAccess && requiresPayment && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                🔒
              </span>
            )}
          </span>
        )}
      </Link>

      <PaymentRequiredModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentMessage={paymentMessage}
        unpaidServices={unpaidServices}
        patientId={patientId}
        onPaymentComplete={() => {
          setShowPaymentModal(false);
          checkAccess();
        }}
      />
    </>
  );
};

export default PatientFolderLink;