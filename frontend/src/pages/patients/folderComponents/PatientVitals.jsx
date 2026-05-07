import React, { useState, useEffect, useMemo } from "react";
import ReusableModal from "../../../components/common/ReusableModal";
import VitalsForm from "../../triage/VitalsForm";
import VitalSignsChart from "../../../components/charts/VitalSignsChart";
import axiosInstance from "../../../api/axiosInstance";
import { useMessage } from "../../../context/MessageProvider";
import useAuth from "../../../hooks/useAuth";
import { getVitalStatus, calculateBMI, getBMIStatus } from "../../../utils/vitalHelpers";
import { getRelativeTime } from "../../../hooks/useRelativeTime";

const PatientVitals = ({ vitals = [], loading, patient, onVitalsAdded }) => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [formData, setFormData] = useState({
    temp: "",
    weight: "",
    height: "",
    bp: "",
    spo2: "",
    pulse: "",
  });
  const [saving, setSaving] = useState(false);
  const [localVitals, setLocalVitals] = useState(vitals);

  const { showMessage } = useMessage();
  const { user } = useAuth();

  const isInPatient = patient?.active_visit?.current_location?.ward_id;

  useEffect(() => {
    setLocalVitals(vitals);
  }, [vitals]);

  const filteredVitals = useMemo(() => {
    if (!localVitals?.length) return [];
    
    return localVitals.filter((v) => {
      const bpMatch = v.bp ? v.bp.includes(search) : false;
      const pulseMatch = v.pulse ? String(v.pulse).includes(search) : false;
      const spo2Match = v.spo2 ? String(v.spo2).includes(search) : false;
      const dateMatch = v.date_recorded
        ? new Date(v.date_recorded)
            .toLocaleDateString()
            .toLowerCase()
            .includes(search.toLowerCase())
        : false;
      return bpMatch || pulseMatch || spo2Match || dateMatch;
    });
  }, [localVitals, search]);

  const latestVitals = useMemo(() => {
    if (!filteredVitals.length) return null;
    return filteredVitals[0];
  }, [filteredVitals]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axiosInstance.post(
        `/triageapi/patients/${patient.id}/`,
        {
          temp: formData.temp ? parseFloat(formData.temp) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          bp: formData.bp || null,
          spo2: formData.spo2 ? parseFloat(formData.spo2) : null,
          pulse: formData.pulse ? parseFloat(formData.pulse) : null,
          pid: patient.id,
          created_by: user.id,
        }
      );

      setLocalVitals((prev) => [response.data, ...prev]);
      if (typeof onVitalsAdded === "function") onVitalsAdded(response.data);

      setFormData({ temp: "", weight: "", height: "", bp: "", spo2: "", pulse: "" });
      setShowModal(false);
      showMessage("Vitals saved successfully", "success");
    } catch (err) {
      console.error("Error saving vitals:", err);
      showMessage("Failed to save vitals", "danger");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-gray-500">Loading vitals...</p>
        </div>
      </div>
    );
  }

  const hasVitals = localVitals && localVitals.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-red-100 to-pink-100">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
              <p className="text-sm text-gray-500">
                {hasVitals ? `${filteredVitals.length} records found` : 'No vital signs recorded yet'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            {hasVitals && (
              <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                  onClick={() => setViewMode("table")}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Table
                </button>
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center ${viewMode === "chart" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"} ${!isInPatient && "opacity-50 cursor-not-allowed"}`}
                  onClick={() => isInPatient && setViewMode("chart")}
                  title={!isInPatient ? "Charts available for in-patients only" : ""}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Chart
                </button>
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center ${viewMode === "split" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"} ${!isInPatient && "opacity-50 cursor-not-allowed"}`}
                  onClick={() => isInPatient && setViewMode("split")}
                  title={!isInPatient ? "Charts available for in-patients only" : ""}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Split
                </button>
              </div>
            )}
            
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center"
              onClick={() => setShowModal(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Vitals
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        {latestVitals && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-gradient-to-br from-white to-red-50 border border-red-100 rounded-lg p-3">
              <div className="text-xs text-gray-500">Temperature</div>
              <div className={`text-lg font-bold ${getVitalStatus("temp", latestVitals.temp)}`}>
                {latestVitals.temp ? `${latestVitals.temp}°C` : "—"}
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-lg p-3">
              <div className="text-xs text-gray-500">Pulse</div>
              <div className={`text-lg font-bold ${getVitalStatus("pulse", latestVitals.pulse)}`}>
                {latestVitals.pulse ? `${latestVitals.pulse} bpm` : "—"}
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-cyan-50 border border-cyan-100 rounded-lg p-3">
              <div className="text-xs text-gray-500">SpO₂</div>
              <div className={`text-lg font-bold ${getVitalStatus("spo2", latestVitals.spo2)}`}>
                {latestVitals.spo2 ? `${latestVitals.spo2}%` : "—"}
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-lg p-3">
              <div className="text-xs text-gray-500">Blood Pressure</div>
              <div className={`text-lg font-bold ${getVitalStatus("bp", latestVitals.bp)}`}>
                {latestVitals.bp || "—"}
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-lg p-3">
              <div className="text-xs text-gray-500">BMI</div>
              <div className={`text-lg font-bold ${getBMIStatus(latestVitals.weight, latestVitals.height)}`}>
                {calculateBMI(latestVitals.weight, latestVitals.height) || "—"}
              </div>
            </div>
          </div>
        )}

        {/* Search and Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {hasVitals && (
            <div className="relative flex-1 max-w-sm">
              <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search vitals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-6">
        {!hasVitals ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-red-50 to-pink-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Vital Signs Recorded</h3>
            <p className="text-gray-500 mt-1 mb-6">
              Start monitoring this patient's vital signs to track their health status.
            </p>
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center mx-auto"
              onClick={() => setShowModal(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Record First Vitals
            </button>
          </div>
        ) : (
          <>
            {/* Table View */}
            {viewMode === "table" && (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp (°C)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height (cm)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BP</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SpO₂ (%)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pulse</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BMI</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVitals.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="font-medium text-gray-900">
                            {new Date(v.date_recorded).toLocaleDateString("en-GB")}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {getRelativeTime(v.date_recorded)}
                          </div>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${getVitalStatus("temp", v.temp)}`}>
                          {v.temp ?? "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {v.weight ?? "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {v.height ?? "—"}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${getVitalStatus("bp", v.bp)}`}>
                          {v.bp || "—"}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${getVitalStatus("spo2", v.spo2)}`}>
                          {v.spo2 ?? "—"}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${getVitalStatus("pulse", v.pulse)}`}>
                          {v.pulse ?? "—"}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${getBMIStatus(v.weight, v.height)}`}>
                          {calculateBMI(v.weight, v.height) || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {v.created_by?.username || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Chart View */}
            {viewMode === "chart" && isInPatient && (
              <VitalSignsChart 
                vitals={filteredVitals} 
                patient={patient}
                compact={false}
              />
            )}

            {/* Split View */}
            {viewMode === "split" && isInPatient && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Table Column */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <h4 className="text-sm font-semibold text-gray-900">Vital Signs Data</h4>
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Time</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Temp</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">BP</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SpO₂</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Pulse</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredVitals.map((v) => (
                          <tr key={v.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-xs">
                              <div className="font-medium text-gray-900">
                                {new Date(v.date_recorded).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                              <div className="text-gray-500 text-[11px]">
                                {new Date(v.date_recorded).toLocaleDateString("en-GB")}
                              </div>
                            </td>
                            <td className={`px-4 py-2 whitespace-nowrap text-xs ${getVitalStatus("temp", v.temp)}`}>
                              {v.temp ?? "—"}
                            </td>
                            <td className={`px-4 py-2 whitespace-nowrap text-xs ${getVitalStatus("bp", v.bp)}`}>
                              {v.bp || "—"}
                            </td>
                            <td className={`px-4 py-2 whitespace-nowrap text-xs ${getVitalStatus("spo2", v.spo2)}`}>
                              {v.spo2 ?? "—"}
                            </td>
                            <td className={`px-4 py-2 whitespace-nowrap text-xs ${getVitalStatus("pulse", v.pulse)}`}>
                              {v.pulse ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Chart Column */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h4 className="text-sm font-semibold text-gray-900">Trends & Patterns</h4>
                    </div>
                  </div>
                  <div className="p-4">
                    <VitalSignsChart 
                      vitals={filteredVitals} 
                      patient={patient}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Warning for non-inpatients */}
            {(viewMode === "chart" || viewMode === "split") && !isInPatient && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 className="text-yellow-800 font-medium mb-1">Charts Available for In-Patients Only</h4>
                <p className="text-yellow-600 text-sm">
                  Vital signs charts are designed for patients admitted to wards. 
                  This patient is currently not in a ward.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Vitals Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Record New Vital Signs</h3>
                  {patient && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-900">{patient.user_info.first_name} {patient.user_info.last_name}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {patient.hospital_id}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {patient && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Age</div>
                      <div className="text-sm font-medium text-gray-900">{patient.age} years</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Gender</div>
                      <div className="text-sm font-medium text-gray-900">{patient.user_info.gender.title || "—"}</div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveVitals}>
                <VitalsForm
                  formData={formData}
                  onChange={handleInputChange}
                  disabled={saving}
                />
                
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="flex items-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-2"></div>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save Vitals
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientVitals;