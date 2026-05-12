// src/locations/hooks/usePatientAccess.js
import { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const usePatientAccess = (patientId) => {
  const [canAccess, setCanAccess] = useState(true);
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [unpaidServices, setUnpaidServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceRequestId, setServiceRequestId] = useState(null);

  useEffect(() => {
    if (patientId) {
      checkAccess();
    }
  }, [patientId]);

  const checkAccess = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/servicesapi/check-access/${patientId}/`);
      
      setCanAccess(response.data.can_access);
      setRequiresPayment(response.data.requires_payment);
      setPaymentMessage(response.data.message);
      setUnpaidServices(response.data.unpaid_services || []);
      setServiceRequestId(response.data.service_request_id);
      
      // REMOVED: No automatic message popup
      
    } catch (error) {
      console.error('Error checking patient access:', error);
      // On error, allow access to avoid blocking patient care
      setCanAccess(true);
      setRequiresPayment(false);
    } finally {
      setLoading(false);
    }
  };

  const redirectToPayment = () => {
    window.location.href = `/billing/patient/${patientId}`;
  };

  return {
    canAccess,
    requiresPayment,
    paymentMessage,
    unpaidServices,
    loading,
    serviceRequestId,
    checkAccess,
    redirectToPayment
  };
};

export default usePatientAccess;