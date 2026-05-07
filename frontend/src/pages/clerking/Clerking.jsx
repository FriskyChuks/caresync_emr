import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import ReusableModal from "../../components/common/ReusableModal";
import ClerkingForm from "./ClerkingForm";
import PatientNotes from "../patients/folderComponents/PatientNotes";
import useAuth from "../../hooks/useAuth";
import { useMessage } from "../../context/MessageProvider";

const Clerking = () => {
  const { pid } = useParams();
  const { user } = useAuth();
  const { showMessage } = useMessage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [refreshNotes, setRefreshNotes] = useState(0);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes] = await Promise.all([
          axiosInstance.get(`/patientsapi/patient_detail/${pid}/`),
        ]);
        setPatient(patientRes.data);
      } catch (err) {
        console.error("Error fetching patient folder data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (pid) fetchData();
  }, [pid]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-blue-600 font-medium animate-pulse">Loading patient data...</p>
      </div>
    );
  }

  const handleInputChange = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const noteData = {
        patient: parseInt(pid),
        note_type: parseInt(formData.note_type),
        header: formData.header.trim(),
        body: formData.body.trim(),
        created_by: user.id,
      };

      await axiosInstance.post('/clerkingapi/note/', noteData);
      setShowModal(false);
      showMessage("Note saved successfully", "success");
      setFormData({});
      setRefreshNotes(prev => prev + 1);
    } catch (error) {
      console.error('Full error object:', error);
      showMessage("Note not submitted", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    if (!saving) {
      setShowModal(false);
      setFormData({});
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
        {/* <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Take Notes
          </button>
        </div> */}
        
        {patient && (
          <div className="mt-4">
            <PatientNotes
              patientId={pid}
              refreshTrigger={refreshNotes}
              showFilters={true}
              maxHeight="600px"
            />
          </div>
        )}
      </div>

      <ReusableModal
        show={showModal}
        onClose={handleModalClose}
        title={patient && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">{patient.user_info.first_name} {patient.user_info.last_name}</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">PID: {patient.id}</span>
            </div>
          </div>
        )}
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          <ClerkingForm
            formData={formData}
            onChange={handleInputChange}
            disabled={saving}
          />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-blue-100">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={saving}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="group relative flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Notes
                </>
              )}
            </button>
          </div>
        </form>
      </ReusableModal>
    </>
  );
};

export default Clerking;