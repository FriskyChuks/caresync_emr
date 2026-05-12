// DispensaryManagement.jsx - Updated with RadiologyBillingPage colors
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useMessage } from '../../context/MessageProvider';
import useAuth from '../../hooks/useAuth';
import PharmacyLayout from './PharmacyLayout';
import PatientQueue from './dispensaryComponents/PatientQueue';
import DispensaryDetail from './dispensaryComponents/DispensaryDetail';

const DispensaryManagement = () => {
  const { showMessage } = useMessage();
  const { user } = useAuth();
  
  // State
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // Reset showDetail when switching from mobile to desktop
      if (window.innerWidth >= 1024) {
        setShowDetail(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Status order for queue sorting
  const statusOrder = { 'paid': 0, 'billed': 1, 'in_progress': 2, 'pending': 3 };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchPatientQueue();
    }
  }, [selectedStore, statusFilter]);

  const fetchStores = async () => {
    try {
      const response = await axiosInstance.get('/pharmacyapi/pharmacy-stores/');
      let storesData = response.data.filter(store => !store.is_bulk_store);
      
      const isAdmin = user?.is_superuser || 
                      user?.is_staff || 
                      (user?.user_category && ['admin', 'manager'].includes(user.user_category.title?.toLowerCase()));
      
      if (!isAdmin && user?.is_pharmacy_store_manager && user?.pharmacy_store_id) {
        storesData = storesData.filter(store => store.id === user.pharmacy_store_id);
      }
      
      setStores(storesData);
      if (storesData.length > 0 && !selectedStore) {
        setSelectedStore(storesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      showMessage('Error loading stores', 'danger');
    }
  };

  const fetchPatientQueue = async () => {
    try {
      setLoading(true);
      let url = `/pharmacyapi/patient-prescriptions/`;
      const params = new URLSearchParams();
      
      if (selectedStore) {
        params.append('store_id', selectedStore);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axiosInstance.get(url);
      
      let patientList = [];
      if (Array.isArray(response.data)) {
        patientList = response.data.filter(patient => patient && patient.id);
      } else if (typeof response.data === 'object' && response.data !== null) {
        patientList = Object.values(response.data).filter(patient => patient && patient.id);
      }
      
      // Limit to last 30 days prescriptions
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      patientList = patientList.filter(patient => {
        return patient.prescriptions?.some(rx => new Date(rx.date_prescribed) >= thirtyDaysAgo);
      });
      
      // Sort by status priority
      patientList.sort((a, b) => (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4));
      
      setPatients(patientList.slice(0, 50));
    } catch (error) {
      console.error('Error fetching patient queue:', error);
      showMessage('Error loading patient queue', 'danger');
    } finally {
      setLoading(false);
    }
  };

const handleSelectPatient = async (patientId) => {
  try {
    setLoading(true);
    
    // Find the patient in the queue (this only has filtered data, but we only need basic info)
    const patient = patients.find(p => p.id === parseInt(patientId));
    if (patient) {
      setSelectedPatient(patient);
    }
    
    // IMPORTANT: Always fetch ALL prescriptions for this patient, regardless of queue filter
    // This endpoint returns ALL prescriptions for the patient
    const response = await axiosInstance.get(`/pharmacyapi/patient-prescriptions/${patientId}/?store_id=${selectedStore}`);
    
    console.log('All prescriptions for patient (from API):', response.data);
    
    let prescriptionsData = [];
    if (Array.isArray(response.data)) {
      prescriptionsData = response.data;
    } else if (typeof response.data === 'object' && response.data !== null) {
      prescriptionsData = Object.values(response.data);
    }
    
    console.log('Processed prescriptions:', prescriptionsData);
    
    // Sort prescriptions
    const sortedPrescriptions = prescriptionsData.sort((a, b) => {
      if (a.status === 'paid' && b.status !== 'paid') return -1;
      if (a.status !== 'paid' && b.status === 'paid') return 1;
      return new Date(b.date_prescribed) - new Date(a.date_prescribed);
    });
    
    // Auto-select first paid or billed prescription, or the first one
    let activePrescription = sortedPrescriptions.find(p => p.status === 'paid' || p.status === 'billed');
    
    if (!activePrescription && sortedPrescriptions.length > 0) {
      activePrescription = sortedPrescriptions[0];
    }
    
    setSelectedPrescription(activePrescription || null);
    
    // On mobile, show detail view after selecting a patient
    if (isMobile) {
      setShowDetail(true);
    }
    
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    showMessage('Error loading prescriptions', 'danger');
  } finally {
    setLoading(false);
  }
};

  const handleBackToQueue = () => {
    setShowDetail(false);
    setSelectedPatient(null);
    setSelectedPrescription(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatientQueue();
    if (selectedPatient) {
      await handleSelectPatient(selectedPatient.id);
    }
    setRefreshing(false);
  };

  const refreshPatientData = async (patientId) => {
    await handleSelectPatient(patientId);
    await fetchPatientQueue();
  };

  const handlePrescriptionSelect = (prescription) => {
    setSelectedPrescription(prescription);
  };

  const currentStore = stores.find(s => s.id == selectedStore);

  // Determine what to show
  const showQueueOnly = isMobile && showDetail === false;
  const showDetailOnly = isMobile && showDetail === true;
  const showBothColumns = !isMobile;

  return (
    <PharmacyLayout>
      <div className="pb-16">
        {/* Header - Updated to purple/pink gradient */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white shadow-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold">Dispensary</h1>
              <p className="text-xs text-purple-100 hidden sm:block">Process prescriptions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="px-2 py-1 text-xs bg-white/20 text-white border border-white/30 rounded-lg focus:ring-1 focus:ring-white outline-none"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name.substring(0, 15)}</option>
              ))}
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Store Info - Updated colors */}
        {currentStore && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 text-xs text-purple-700 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{currentStore.name}</span>
          </div>
        )}

        {/* Desktop: Show both columns */}
        {showBothColumns && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-1">
              <PatientQueue
                patients={patients}
                selectedPatient={selectedPatient}
                loading={loading}
                statusFilter={statusFilter}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
                onSelectPatient={handleSelectPatient}
                currentStore={currentStore}
              />
            </div>
            <div className="lg:col-span-3">
              <DispensaryDetail
                selectedPatient={selectedPatient}
                selectedPrescription={selectedPrescription}
                storeId={selectedStore}
                storeName={currentStore?.name}
                loading={loading}
                onBack={handleBackToQueue}
                onPrescriptionSelect={handlePrescriptionSelect}
                onRefreshPatient={refreshPatientData}
              />
            </div>
          </div>
        )}

        {/* Mobile: Show Queue only */}
        {showQueueOnly && (
          <PatientQueue
            patients={patients}
            selectedPatient={selectedPatient}
            loading={loading}
            statusFilter={statusFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onSelectPatient={handleSelectPatient}
            currentStore={currentStore}
          />
        )}

        {/* Mobile: Show Detail only */}
        {showDetailOnly && (
          <DispensaryDetail
            selectedPatient={selectedPatient}
            selectedPrescription={selectedPrescription}
            storeId={selectedStore}
            storeName={currentStore?.name}
            loading={loading}
            onBack={handleBackToQueue}
            onPrescriptionSelect={handlePrescriptionSelect}
            onRefreshPatient={refreshPatientData}
          />
        )}
      </div>
    </PharmacyLayout>
  );
};

export default DispensaryManagement;