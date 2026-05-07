import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useMessage } from "../../../context/MessageProvider";
import useAuth from "../../../hooks/useAuth";
import FluidBalanceChart from "../../../components/charts/FluidBalanceChart";

const PatientFluidBalance = ({ patient, fluidData = [] }) => {
  const [loading, setLoading] = useState(true);
  const [fluidRecords, setFluidRecords] = useState(fluidData);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [summary, setSummary] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const { showMessage } = useMessage();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    patient: patient?.id || null,
    intake_type: "",
    intake_volume: "",
    intake_description: "",
    output_type: "",
    output_volume: "",
    output_description: "",
    notes: "",
    created_by: user?.id || null,
    encounter: patient?.active_visit?.current_location?.id || null,
  });

  useEffect(() => {
    if (patient?.id) {
      fetchFluidBalance();
    }
  }, [patient]);

  const fetchFluidBalance = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/triageapi/patients/${patient.id}/fluid-balance/?current=true`);
      
      if (response.data.success) {
        setFluidRecords(response.data.records);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error("Error fetching fluid balance:", error);
      showMessage("Failed to load fluid balance data", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.intake_volume && !formData.output_volume) {
      showMessage("Please enter either intake or output volume", "warning");
      return;
    }

    // Validate that type is provided when volume is provided
    if (formData.intake_volume && !formData.intake_type) {
      showMessage("Please select intake type when providing intake volume", "warning");
      return;
    }

    if (formData.output_volume && !formData.output_type) {
      showMessage("Please select output type when providing output volume", "warning");
      return;
    }

    setSaving(true);
    try {
      // Prepare data for API
      const payload = {
        patient: patient.id,
        intake_type: formData.intake_type || null,
        intake_volume: formData.intake_volume ? parseInt(formData.intake_volume) : null,
        intake_description: formData.intake_description || null,
        output_type: formData.output_type || null,
        output_volume: formData.output_volume ? parseInt(formData.output_volume) : null,
        output_description: formData.output_description || null,
        notes: formData.notes || null,
      };

      console.log("Submitting payload:", payload);

      await axiosInstance.post(`/triageapi/patients/${patient.id}/fluid-balance/`, payload);

      showMessage("Fluid balance recorded successfully", "success");
      
      // Close modal FIRST
      setShowModal(false);
      
      // Then reset form state
      setTimeout(() => {
        setFormData({
          intake_type: "", 
          intake_volume: "", 
          intake_description: "",
          output_type: "", 
          output_volume: "", 
          output_description: "", 
          notes: ""
        });
      }, 100);
      
      // Refresh data
      fetchFluidBalance();
    } catch (error) {
      console.error("Error saving fluid balance:", error);
      
      // Check for specific validation errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const errorMessages = [];
          
          if (errorData.intake_type) {
            errorMessages.push(`Intake: ${errorData.intake_type[0]}`);
          }
          if (errorData.output_type) {
            errorMessages.push(`Output: ${errorData.output_type[0]}`);
          }
          if (errorData.non_field_errors) {
            errorMessages.push(...errorData.non_field_errors);
          }
          
          if (errorMessages.length > 0) {
            showMessage(errorMessages.join('. '), "danger");
          } else {
            showMessage("Failed to record fluid balance", "danger");
          }
        } else if (typeof errorData === 'string') {
          showMessage(errorData, "danger");
        } else {
          showMessage("Failed to record fluid balance", "danger");
        }
      } else {
        showMessage("Failed to record fluid balance", "danger");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    if (!saving) {
      // Reset form before closing
      setFormData({
        intake_type: "", 
        intake_volume: "", 
        intake_description: "",
        output_type: "", 
        output_volume: "", 
        output_description: "", 
        notes: ""
      });
      setShowModal(false);
    }
  };

  const intakeTypes = [
    { value: 'oral', label: 'Oral', icon: 'cup', color: 'from-blue-500 to-cyan-500' },
    { value: 'iv', label: 'IV Fluids', icon: 'drop', color: 'from-purple-500 to-pink-500' },
    { value: 'ng', label: 'NG Tube', icon: 'tube', color: 'from-green-500 to-emerald-500' },
    { value: 'other', label: 'Other', icon: 'plus', color: 'from-gray-500 to-gray-700' }
  ];

  const outputTypes = [
    { value: 'urine', label: 'Urine', icon: 'drop', color: 'from-amber-500 to-yellow-500' },
    { value: 'vomit', label: 'Vomit', icon: 'sad', color: 'from-red-500 to-orange-500' },
    { value: 'drain', label: 'Drain', icon: 'flow', color: 'from-indigo-500 to-blue-500' },
    { value: 'stool', label: 'Stool', icon: 'body', color: 'from-brown-500 to-amber-700' },
    { value: 'other', label: 'Other', icon: 'plus', color: 'from-gray-500 to-gray-700' }
  ];

  const isInPatient = patient?.active_visit?.current_location?.ward_id;
  const hasRecords = fluidRecords && fluidRecords.length > 0;

  const Icon = ({ name, className = "w-3 h-3" }) => {
    const icons = {
      cup: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>,
      drop: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
      tube: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>,
      sad: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      flow: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      body: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0h-1" /></svg>,
      plus: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
      chart: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
      table: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
      split: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
    };
    return icons[name] || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading fluid balance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm overflow-hidden">
      {/* Header - Colorful & Compact */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
              <Icon name="drop" className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Fluid Balance</h3>
              <p className="text-xs text-white/80">Intake vs Output Monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasRecords && (
              <div className="flex bg-white/20 rounded-lg p-0.5 backdrop-blur-sm">
                <button
                  className={`px-2.5 py-1 text-xs rounded-md transition-all ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-white/80 hover:text-white"}`}
                  onClick={() => setViewMode("table")}
                >
                  <Icon name="table" className="w-3 h-3 inline mr-1" />
                  Table
                </button>
                <button
                  className={`px-2.5 py-1 text-xs rounded-md transition-all ${viewMode === "chart" ? "bg-white text-blue-600 shadow-sm" : "text-white/80 hover:text-white"} ${!isInPatient && "opacity-50 cursor-not-allowed"}`}
                  onClick={() => isInPatient && setViewMode("chart")}
                  title={!isInPatient ? "Charts for in-patients only" : ""}
                >
                  <Icon name="chart" className="w-3 h-3 inline mr-1" />
                  Chart
                </button>
                <button
                  className={`px-2.5 py-1 text-xs rounded-md transition-all ${viewMode === "split" ? "bg-white text-blue-600 shadow-sm" : "text-white/80 hover:text-white"} ${!isInPatient && "opacity-50 cursor-not-allowed"}`}
                  onClick={() => isInPatient && setViewMode("split")}
                  title={!isInPatient ? "Split view for in-patients only" : ""}
                >
                  <Icon name="split" className="w-3 h-3 inline mr-1" />
                  Split
                </button>
              </div>
            )}
            
            <button
              className="px-3 py-1.5 text-xs bg-white text-blue-600 rounded-lg font-semibold hover:shadow-sm transition-all flex items-center gap-1"
              onClick={() => setShowModal(true)}
            >
              <Icon name="plus" className="w-3 h-3" />
              New Record
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards - Vibrant & Compact */}
      {summary && (
        <div className="px-4 py-3 bg-gradient-to-b from-white to-blue-50">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">24h Intake</div>
                  <div className="text-lg font-bold text-emerald-900">{summary.last_24_hours?.total_intake || 0} ml</div>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500">
                  <Icon name="drop" className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-[10px] text-emerald-600 mt-1">{summary.last_24_hours?.record_count || 0} records</div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-rose-700 uppercase tracking-wide">24h Output</div>
                  <div className="text-lg font-bold text-rose-900">{summary.last_24_hours?.total_output || 0} ml</div>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500">
                  <Icon name="flow" className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-[10px] text-rose-600 mt-1">Net: {summary.last_24_hours?.net_balance || 0} ml</div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-cyan-700 uppercase tracking-wide">Total Intake</div>
                  <div className="text-lg font-bold text-cyan-900">{summary.current_period?.total_intake || 0} ml</div>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
                  <Icon name="cup" className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Total Output</div>
                  <div className="text-lg font-bold text-amber-900">{summary.current_period?.total_output || 0} ml</div>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500">
                  <Icon name="body" className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="p-4">
        {!hasRecords ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center mb-4">
              <Icon name="drop" className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-gray-900 font-medium mb-2">No Fluid Balance Records</h4>
            <p className="text-gray-500 text-sm mb-4">Start monitoring fluid intake and output</p>
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm rounded-lg hover:shadow-md transition-all"
              onClick={() => setShowModal(true)}
            >
              Record First Entry
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
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intake</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fluidRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-blue-50/30">
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <div className="font-medium text-gray-900">{new Date(record.recorded_at).toLocaleDateString()}</div>
                          <div className="text-gray-500">{new Date(record.recorded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {record.intake_volume && (
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded border border-emerald-200">
                                {record.intake_volume}ml
                              </span>
                              <span className="text-gray-500 text-xs">{record.intake_type}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {record.output_volume && (
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 rounded border border-rose-200">
                                {record.output_volume}ml
                              </span>
                              <span className="text-gray-500 text-xs">{record.output_type}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`text-sm font-bold ${record.net_balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {record.net_balance}ml
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500 max-w-[150px] truncate">
                          {record.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Chart View */}
            {viewMode === "chart" && isInPatient && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <FluidBalanceChart fluidData={fluidRecords} compact={false} />
              </div>
            )}

            {/* Split View */}
            {viewMode === "split" && isInPatient && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Table Column */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="flex items-center gap-2">
                      <Icon name="table" className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-semibold text-gray-900">Recent Records</h4>
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Time</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Intake</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Output</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Net</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fluidRecords.slice(-8).map((record) => (
                          <tr key={record.id} className="hover:bg-blue-50/30">
                            <td className="px-3 py-2 text-xs">
                              <div className="text-gray-900">{new Date(record.recorded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                              <div className="text-gray-400">{new Date(record.recorded_at).toLocaleDateString()}</div>
                            </td>
                            <td className="px-3 py-2">
                              {record.intake_volume ? (
                                <div className="flex items-center gap-1">
                                  <span className="px-1.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded">
                                    {record.intake_volume}ml
                                  </span>
                                </div>
                              ) : <span className="text-gray-300 text-xs">—</span>}
                            </td>
                            <td className="px-3 py-2">
                              {record.output_volume ? (
                                <div className="flex items-center gap-1">
                                  <span className="px-1.5 py-0.5 text-xs font-medium bg-rose-100 text-rose-800 rounded">
                                    {record.output_volume}ml
                                  </span>
                                </div>
                              ) : <span className="text-gray-300 text-xs">—</span>}
                            </td>
                            <td className="px-3 py-2">
                              <span className={`text-xs font-bold ${record.net_balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {record.net_balance}ml
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Chart Column */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="flex items-center gap-2">
                      <Icon name="chart" className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-semibold text-gray-900">Fluid Trends</h4>
                    </div>
                  </div>
                  <div className="p-4">
                    <FluidBalanceChart fluidData={fluidRecords} compact={true} />
                  </div>
                </div>
              </div>
            )}

            {/* Warning for non-inpatients */}
            {(viewMode === "chart" || viewMode === "split") && !isInPatient && (
              <div className="text-center py-8">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6 max-w-md mx-auto">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 flex items-center justify-center mb-3">
                    <Icon name="sad" className="w-6 h-6 text-amber-600" />
                  </div>
                  <h4 className="text-amber-800 font-medium mb-2">Charts for In-Patients Only</h4>
                  <p className="text-amber-600 text-sm">This patient is not currently in a ward</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-blue-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Icon name="drop" className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Record Fluid Balance</h3>
                    <p className="text-sm text-gray-500">Track intake and output volumes</p>
                  </div>
                </div>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={saving}
                >
                  <Icon name="plus" className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Intake Section */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500">
                        <Icon name="cup" className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-sm font-semibold text-emerald-800">Fluid Intake</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                        <select
                          name="intake_type"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          value={formData.intake_type}
                          onChange={handleInputChange}
                        >
                          <option value="">Select type...</option>
                          {intakeTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Volume (ml)</label>
                        <input
                          type="number"
                          name="intake_volume"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Enter volume"
                          value={formData.intake_volume}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          name="intake_description"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="e.g., Water, Normal Saline"
                          value={formData.intake_description}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Output Section */}
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500">
                        <Icon name="flow" className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-sm font-semibold text-rose-800">Fluid Output</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                        <select
                          name="output_type"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          value={formData.output_type}
                          onChange={handleInputChange}
                        >
                          <option value="">Select type...</option>
                          {outputTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Volume (ml)</label>
                        <input
                          type="number"
                          name="output_volume"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          placeholder="Enter volume"
                          value={formData.output_volume}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          name="output_description"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          placeholder="e.g., Color, consistency"
                          value={formData.output_description}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    name="notes"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Any additional comments..."
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon name="drop" className="w-4 h-4" />
                        Save Record
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

export default PatientFluidBalance;