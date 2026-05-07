import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";

const DiagnosisList = ({ 
  patientId, 
  encounterRouteId, 
  refreshTrigger, 
  onDiagnosisAdded,
  onDiagnosisUpdated,
  onDiagnosisResolved,
  onDiagnosisConfirmed 
}) => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(null);
  const { showMessage } = useMessage();

  const diagnosisTypes = {
    primary: { label: "Primary", color: "bg-blue-100 text-blue-700" },
    secondary: { label: "Secondary", color: "bg-gray-100 text-gray-700" },
    complication: { label: "Complication", color: "bg-red-100 text-red-700" },
    comorbidity: { label: "Comorbidity", color: "bg-yellow-100 text-yellow-700" },
    provisional: { label: "Provisional", color: "bg-orange-100 text-orange-700" },
    differential: { label: "Differential", color: "bg-purple-100 text-purple-700" },
    rule_out: { label: "Rule Out", color: "bg-gray-100 text-gray-500" }
  };

  const fetchDiagnoses = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/icd11api/diagnoses/?patient_id=${patientId}${encounterRouteId ? `&encounter_route_id=${encounterRouteId}` : ""}&show_all=true`
      );
      setDiagnoses(data.results || data);
    } catch (error) {
      showMessage("Failed to load diagnoses", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnoses();
  }, [patientId, encounterRouteId, refreshTrigger]);

  const updateDiagnosis = async (id, updates) => {
    setUpdating(id);
    try {
      const { data } = await axiosInstance.patch(`/icd11api/diagnoses/${id}/`, updates);
      showMessage("Diagnosis updated", "success");
      await fetchDiagnoses();
      onDiagnosisUpdated?.(data);
      onDiagnosisAdded?.();
      return data;
    } catch (error) {
      showMessage("Update failed", "danger");
      throw error;
    } finally {
      setUpdating(null);
    }
  };

  const handleResolve = async (id) => {
    try {
      const { data } = await axiosInstance.post(`/icd11api/diagnoses/${id}/resolve/`);
      showMessage("Diagnosis resolved", "success");
      await fetchDiagnoses();
      onDiagnosisResolved?.(data);
      onDiagnosisAdded?.();
    } catch (error) {
      showMessage(error.response?.data?.error || "Failed to resolve", "danger");
    }
  };

  const handleConfirm = async (id) => {
    try {
      const { data } = await axiosInstance.post(`/icd11api/diagnoses/${id}/confirm/`);
      showMessage("Diagnosis confirmed", "success");
      await fetchDiagnoses();
      onDiagnosisConfirmed?.(data);
      onDiagnosisAdded?.();
    } catch (error) {
      showMessage(error.response?.data?.error || "Failed to confirm", "danger");
    }
  };

  const handlePromote = async (id) => {
    await updateDiagnosis(id, { diagnosis_type: "primary", is_confirmed: true });
    showMessage("Promoted to Primary", "success");
  };

  const filteredDiagnoses = diagnoses.filter(d => showResolved || d.status === "active");
  const activeCount = diagnoses.filter(d => d.status === "active").length;
  const resolvedCount = diagnoses.filter(d => d.status === "resolved").length;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (filteredDiagnoses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>{showResolved ? "No diagnoses" : "No active diagnoses"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {/* Header with counts - compact */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-1 mb-1">
          <div className="flex gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {activeCount} active
            </span>
            {resolvedCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                {resolvedCount} resolved
              </span>
            )}
          </div>
          {resolvedCount > 0 && (
            <button onClick={() => setShowResolved(!showResolved)} className="text-blue-600 hover:text-blue-700">
              {showResolved ? "Hide resolved" : "Show resolved"}
            </button>
          )}
        </div>

        {/* Diagnosis Cards - Mobile optimized */}
        {filteredDiagnoses.map(diagnosis => (
          <div
            key={diagnosis.id}
            className={`p-3 rounded-lg border ${
              diagnosis.status === "resolved" 
                ? "bg-gray-50 border-gray-200" 
                : "bg-white border-gray-200 hover:shadow-sm"
            } transition-all`}
          >
            <div className="flex items-start gap-2">
              {/* Main content - flex-1 */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="font-mono text-sm font-medium text-blue-600">
                    {diagnosis.category_code}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${diagnosisTypes[diagnosis.diagnosis_type]?.color || "bg-gray-100"}`}>
                    {diagnosisTypes[diagnosis.diagnosis_type]?.label || diagnosis.diagnosis_type}
                  </span>
                  {diagnosis.severity && (
                    <span className="text-xs text-gray-500">• {diagnosis.severity}</span>
                  )}
                  {diagnosis.is_confirmed && (
                    <span className="text-xs text-green-600 flex items-center gap-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirmed
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-800 truncate">{diagnosis.category_title}</p>
                
                {diagnosis.clinical_description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{diagnosis.clinical_description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                  <span>{new Date(diagnosis.diagnosed_date).toLocaleDateString()}</span>
                  <span>by {diagnosis.diagnosed_by_name || "Unknown"}</span>
                  {diagnosis.status === "resolved" && diagnosis.resolved_date && (
                    <span>✓ Resolved {new Date(diagnosis.resolved_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Actions - compact icons */}
              {diagnosis.status === "active" && (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => setShowUpdateModal(diagnosis)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  
                  {diagnosis.diagnosis_type !== "primary" && (
                    <button
                      onClick={() => handlePromote(diagnosis.id)}
                      disabled={updating === diagnosis.id}
                      className="p-1.5 text-gray-400 hover:text-yellow-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Promote to Primary"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  )}
                  
                  {!diagnosis.is_confirmed && diagnosis.diagnosis_type !== "rule_out" && (
                    <button
                      onClick={() => handleConfirm(diagnosis.id)}
                      className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Confirm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleResolve(diagnosis.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Resolve"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Update Modal - Mobile optimized */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Edit Diagnosis</h3>
                <p className="text-xs text-gray-500">{showUpdateModal.category_code}</p>
              </div>
              <button onClick={() => setShowUpdateModal(null)} className="p-1 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <UpdateForm 
              diagnosis={showUpdateModal}
              onSave={async (updates) => {
                await updateDiagnosis(showUpdateModal.id, updates);
                setShowUpdateModal(null);
              }}
              onCancel={() => setShowUpdateModal(null)}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Separate Update Form Component
const UpdateForm = ({ diagnosis, onSave, onCancel }) => {
  const [selectedType, setSelectedType] = useState(diagnosis.diagnosis_type);
  const [severity, setSeverity] = useState(diagnosis.severity || "");
  const [clinicalDescription, setClinicalDescription] = useState(diagnosis.clinical_description || "");
  const [notes, setNotes] = useState(diagnosis.notes || "");
  const [saving, setSaving] = useState(false);

  const severityOptions = ["mild", "moderate", "severe", "critical"];
  const diagnosisTypes = [
    { value: "primary", label: "Primary", desc: "Main diagnosis" },
    { value: "secondary", label: "Secondary", desc: "Additional diagnoses" },
    { value: "complication", label: "Complication", desc: "Arising from primary" },
    { value: "comorbidity", label: "Comorbidity", desc: "Co-existing condition" },
    { value: "provisional", label: "Provisional", desc: "Awaiting confirmation" },
    { value: "differential", label: "Differential", desc: "Alternative diagnosis" },
    { value: "rule_out", label: "Rule Out", desc: "To be excluded" }
  ];

  const handleSubmit = async () => {
    setSaving(true);
    await onSave({ diagnosis_type: selectedType, severity, clinical_description: clinicalDescription, notes });
    setSaving(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Diagnosis Type</label>
        <div className="space-y-2">
          {diagnosisTypes.map(type => (
            <label key={type.value} className={`flex items-start p-2 rounded-lg border cursor-pointer ${selectedType === type.value ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
              <input type="radio" name="type" value={type.value} checked={selectedType === type.value} onChange={(e) => setSelectedType(e.target.value)} className="mt-1 mr-2" />
              <div className="flex-1">
                <div className="text-sm font-medium">{type.label}</div>
                <div className="text-xs text-gray-500">{type.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Severity</label>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Select severity</option>
          {severityOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Clinical Description</label>
        <textarea rows={2} value={clinicalDescription} onChange={(e) => setClinicalDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Brief description..." />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Additional notes..." />
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} disabled={saving} className="flex-1 py-2 text-gray-600 border border-gray-300 rounded-lg text-sm font-medium">Cancel</button>
        <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default DiagnosisList;