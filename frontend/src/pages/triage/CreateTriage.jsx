import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";
import ReusableModal from "../../components/common/ReusableModal";
import VitalsForm from "../triage/VitalsForm";
import useAuth from "../../hooks/useAuth";
import { getVitalStatus, calculateBMI, getBMIStatus } from "../../utils/vitalHelpers";

const CreateTriage = () => {
  const { showMessage } = useMessage();
  const { pid } = useParams();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    temp: "",
    weight: "",
    height: "",
    bp: "",
    spo2: "",
    pulse: "",
  });

  const [triageRecords, setTriageRecords] = useState([]);
  const [patient, setPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- Fetch Patient Info ---
  const fetchPatient = async () => {
    try {
      setPatientLoading(true);
      const response = await axiosInstance.get(`/patientsapi/patient_detail/${pid}/`);
      setPatient(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching patient info:", err);
      setError("Failed to fetch patient information.");
    } finally {
      setPatientLoading(false);
    }
  };

  // --- Fetch Triage Records ---
  const fetchTriageRecords = async () => {
    try {
      const response = await axiosInstance.get(`/triageapi/patients/${pid}/`);
      setTriageRecords(response.data);
    } catch (err) {
      console.error("Error fetching triage records:", err);
    }
  };

  useEffect(() => {
    if (pid) {
      fetchPatient();
      fetchTriageRecords();
    }
  }, [pid]);

  // --- Input Handling ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Validation ---
  const validateForm = () => {
    const { temp, weight, height, bp, spo2, pulse } = formData;

    if (![temp, weight, height, bp, spo2, pulse].some((v) => v !== "")) {
      showMessage("Please enter at least one vital sign before submitting.", "warning");
      return false;
    }
    if (bp && !/^\d{2,3}\/\d{2,3}$/.test(bp)) {
      showMessage("Blood pressure must be in format XXX/XX (e.g., 120/80)", "warning");
      return false;
    }
    if (temp && (temp < 30 || temp > 45)) {
      showMessage("Temperature should be between 30–45°C", "warning");
      return false;
    }
    if (spo2 && (spo2 < 0 || spo2 > 100)) {
      showMessage("SpO₂ should be between 0–100%", "warning");
      return false;
    }
    if (pulse && (pulse < 30 || pulse > 200)) {
      showMessage("Pulse should be between 30–200 bpm", "warning");
      return false;
    }
    return true;
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/triageapi/patients/${pid}/`, {
        temp: formData.temp ? parseFloat(formData.temp) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        bp: formData.bp || null,
        spo2: formData.spo2 ? parseFloat(formData.spo2) : null,
        pulse: formData.pulse ? parseFloat(formData.pulse) : null,
        pid: patient.id,
        created_by: user.id,
      });

      setTriageRecords((prev) => [response.data, ...prev]);
      setFormData({
        temp: "",
        weight: "",
        height: "",
        bp: "",
        spo2: "",
        pulse: "",
      });

      setShowModal(false);
      showMessage("Vitals recorded successfully", "success");
    } catch (err) {
      console.error("Error submitting triage data:", err);
      showMessage("Failed to save triage record", "danger");
    } finally {
      setLoading(false);
    }
  };

  // --- Format Date Time ---
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
        <span className="text-xs text-gray-500">{date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    );
  };

  // --- Loading & Error States ---
  if (patientLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="h-10 w-10 rounded-full border-3 border-blue-200"></div>
            <div className="absolute top-0 left-0 h-10 w-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Loading patient data...</p>
            <p className="text-xs text-gray-500">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-red-100">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.166 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Patient Not Found</h3>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          </div>
          <button 
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
            onClick={() => window.history.back()}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header - Compact Design */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Patient Triage</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white">
                  PID-{patient?.id}
                </span>
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white">
                  {patient?.user_info.first_name} {patient?.user_info.last_name}
                </span>
                {patient?.user_info.gender && (
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white">
                    {patient.user_info.gender.title}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              to={`/patient/folder/${patient?.id}`}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Folder
            </Link>
            <button 
              onClick={() => setShowModal(true)} 
              className="px-3 py-1.5 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-all text-xs flex items-center gap-1 shadow-sm"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Vitals
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats - Ultra Compact */}
      {triageRecords.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Last Temp</div>
            <div className={`text-sm font-bold ${getVitalStatus("temp", triageRecords[0]?.temp)}`}>
              {triageRecords[0]?.temp ? `${triageRecords[0].temp}°C` : '—'}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Last BP</div>
            <div className={`text-sm font-bold ${getVitalStatus("bp", triageRecords[0]?.bp)}`}>
              {triageRecords[0]?.bp || '—'}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Last SpO₂</div>
            <div className={`text-sm font-bold ${getVitalStatus("spo2", triageRecords[0]?.spo2)}`}>
              {triageRecords[0]?.spo2 ? `${triageRecords[0].spo2}%` : '—'}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Last Pulse</div>
            <div className={`text-sm font-bold ${getVitalStatus("pulse", triageRecords[0]?.pulse)}`}>
              {triageRecords[0]?.pulse ? `${triageRecords[0].pulse} bpm` : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Records Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">Triage Records</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {triageRecords.length}
              </span>
            </div>
            <button
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={fetchTriageRecords}
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Compact Table */}
        <div className="overflow-x-auto">
          {triageRecords.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-3">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-3">No vital records found</p>
              <button 
                onClick={() => setShowModal(true)} 
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Record First Vital
              </button>
            </div>
          ) : (
            <div className="min-w-full">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Temp</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">BP</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">SpO₂</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Pulse</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">BMI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {triageRecords.map((record) => {
                    const bmi = calculateBMI(record.weight, record.height);
                    
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {formatDateTime(record.date_recorded)}
                        </td>
                        <td className="px-4 py-3">
                          {record.temp !== null ? (
                            <span className={`px-2 py-1 text-xs rounded-full ${getVitalStatus("temp", record.temp)}`}>
                              {record.temp}°C
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {record.bp ? (
                            <span className={`px-2 py-1 text-xs rounded-full ${getVitalStatus("bp", record.bp)}`}>
                              {record.bp}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {record.spo2 !== null ? (
                            <span className={`px-2 py-1 text-xs rounded-full ${getVitalStatus("spo2", record.spo2)}`}>
                              {record.spo2}%
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {record.pulse !== null ? (
                            <span className={`px-2 py-1 text-xs rounded-full ${getVitalStatus("pulse", record.pulse)}`}>
                              {record.pulse}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {bmi ? (
                            <span className={`px-2 py-1 text-xs rounded-full ${getBMIStatus(record.weight, record.height)}`}>
                              {bmi}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for New Vitals */}
      <ReusableModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Record Vitals</h3>
              <p className="text-xs text-gray-500">
                {patient?.user_info.first_name} {patient?.user_info.last_name} • PID-{patient?.id}
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <VitalsForm formData={formData} onChange={handleInputChange} disabled={loading} />
          
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm flex items-center justify-center gap-1"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Vitals
                </>
              )}
            </button>
          </div>
        </div>
      </ReusableModal>
    </div>
  );
};

export default CreateTriage;