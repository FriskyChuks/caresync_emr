import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';
import PrescriptionSheet from '../../pharmacy/PrescriptionSheet';
import PrescriptionHistory from '../../pharmacy/PrescriptionHistory';

const PatientPharmacy = ({ patient }) => {
  const { showMessage } = useMessage();
  const [activeSubTab, setActiveSubTab] = useState('new');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const subtabs = [
    { id: 'new', label: 'New Rx', icon: '💊', gradient: 'from-green-500 to-emerald-500' },
    { id: 'history', label: 'History', icon: '📜', gradient: 'from-blue-500 to-indigo-500' }
  ];

  useEffect(() => {
    if (patient?.id) {
      fetchPrescriptions();
    }
  }, [patient]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/pharmacyapi/prescriptions/?patient_id=${patient.id}`);
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      showMessage('Error loading prescription history', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionSuccess = () => {
    fetchPrescriptions();
    setActiveSubTab('history');
    showMessage('Prescription created successfully!', 'success');
  };

  if (!patient) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mb-2">
          <span className="text-xl">👤</span>
        </div>
        <p className="text-gray-500 text-sm">No patient data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Beautiful Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <span className="text-white text-lg">💊</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pharmacy Management</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/80">
                  {patient?.user_info?.first_name} {patient?.user_info?.last_name}
                </span>
                {patient.id && (
                  <span className="px-1.5 py-0.5 bg-white/20 text-white text-[10px] rounded">
                    PID: {patient.id}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Compact Tabs */}
          <div className="flex rounded-lg bg-white/10 backdrop-blur-sm p-0.5">
            {subtabs.map(tab => (
              <button
                key={tab.id}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeSubTab === tab.id 
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-sm` 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveSubTab(tab.id)}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeSubTab === 'new' && (
          <PrescriptionSheet 
            patient={patient}
            onPrescriptionSuccess={handlePrescriptionSuccess}
          />
        )}
        
        {activeSubTab === 'history' && (
          <PrescriptionHistory 
            prescriptions={prescriptions}
            loading={loading}
            onRefresh={fetchPrescriptions}
            patient={patient}
          />
        )}
      </div>
    </div>
  );
};

export default PatientPharmacy;