import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axiosInstance from "../../../api/axiosInstance";
import { useMessage } from "../../../context/MessageProvider";

const NurseDischargeModal = ({ discharge, onSuccess, onClose }) => {
  const { showMessage } = useMessage();
  const [reasons, setReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingSummary, setFetchingSummary] = useState(true);
  const [dischargeSummary, setDischargeSummary] = useState(null);
  const [error, setError] = useState(null);

  // Fetch discharge summary when modal opens
  useEffect(() => {
    const fetchDischargeSummary = async () => {
      if (!discharge?.visit) return;
      
      setFetchingSummary(true);
      setError(null);
      
      try {
        const response = await axiosInstance.get(`/encounterapi/discharge_details/${discharge.visit}/`);
        setDischargeSummary(response.data);
      } catch (err) {
        console.error("Error fetching discharge summary:", err);
        if (err.response?.status === 404) {
          setError("No discharge summary found for this patient. The doctor may not have completed it yet.");
        } else {
          setError("Failed to load discharge summary. Please try again.");
        }
      } finally {
        setFetchingSummary(false);
      }
    };

    fetchDischargeSummary();
  }, [discharge?.visit]);

  // Fetch discharge reasons
  useEffect(() => {
    axiosInstance
      .get("/encounterapi/dicharge_reasons/")
      .then((res) => setReasons(res.data))
      .catch(() => showMessage("❌ Failed to load discharge reasons", "error"));
  }, [showMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) return;
    
    setLoading(true);
    // console.log('Submitting discharge with reason:', selectedReason);
    
    try {
      // PATCH to update the existing discharge record with reason
      await axiosInstance.patch(`/encounterapi/discharge_details/${discharge.visit}/`, {
        reason_id: selectedReason,
      });
      
      showMessage("✅ Patient discharged successfully", "success");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Error discharging patient:", err);
      showMessage("❌ Failed to discharge patient", "error");
    } finally {
      setLoading(false);
    }
  };

  // console.log("Discharge Summary:", dischargeSummary);

  if (!discharge) return null;

  // Use portal to render at root level
  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9999] transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10000] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-lg font-bold text-white">Patient Discharge</h5>
                    <p className="text-xs text-white/80">Review summary and confirm discharge</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body - Scrollable */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
              <div className="p-6">
                {/* Patient Info */}
                {discharge.patient && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {discharge.patient?.user_info?.first_name?.[0] || "P"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Patient</p>
                        <p className="text-base font-bold text-gray-800">
                          {discharge.patient?.user_info?.first_name} {discharge.patient?.user_info?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">ID: {discharge.patient?.id}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Discharge Summary Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h6 className="text-sm font-bold text-gray-700">Discharge Summary</h6>
                  </div>

                  {fetchingSummary ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="relative">
                        <div className="w-8 h-8 border-3 border-purple-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="ml-3 text-sm text-gray-600">Loading discharge summary...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-amber-800">{error}</p>
                          <p className="text-xs text-amber-600 mt-1">Please contact the doctor to complete the discharge summary.</p>
                        </div>
                      </div>
                    </div>
                  ) : dischargeSummary ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600">Prepared by</span>
                          <span className="text-xs font-medium text-gray-800">
                            {dischargeSummary.summary_by_fullname || 'Doctor'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {dischargeSummary.summary || "No summary content available."}
                        </p>
                      </div>
                      {dischargeSummary.discharged_at && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                          Discharge initiated: {new Date(dischargeSummary.discharged_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-sm text-gray-500">No discharge summary found.</p>
                    </div>
                  )}
                </div>

                {/* Discharge Reason Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discharge Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400/30 focus:border-red-400 bg-white shadow-sm"
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    required
                    disabled={loading || fetchingSummary || !!error}
                  >
                    <option value="">Select discharge reason</option>
                    {reasons.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warning if no summary */}
                {!fetchingSummary && !dischargeSummary && !error && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      No discharge summary found. Please verify with the doctor before proceeding.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
                disabled={loading || !selectedReason || fetchingSummary}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm Discharge
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default NurseDischargeModal;