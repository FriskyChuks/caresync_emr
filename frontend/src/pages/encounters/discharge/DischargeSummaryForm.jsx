import { useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useMessage } from "../../../context/MessageProvider";

const DischargeSummaryForm = ({ visitId, onSuccess, onClose }) => {
  const { showMessage } = useMessage();
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summary.trim()) {
      showMessage("Please enter a discharge summary", "error");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/encounterapi/discharge/", {
        visit: visitId,
        summary,
      });
      showMessage("✅ Discharge summary saved successfully", "success");
      onSuccess?.();
      onClose?.();
    } catch {
      showMessage("❌ Failed to save discharge summary", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Discharge Summary</h3>
              <p className="text-emerald-100 text-sm mt-1">
                Complete discharge documentation for patient
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-emerald-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            {/* Summary Input */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Discharge Summary *
              </label>
              <div className="relative">
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Enter comprehensive discharge summary including diagnosis, treatment provided, follow-up instructions, medications, and recommendations..."
                  rows="10"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  required
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {summary.length} characters
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <span className="font-medium">Tips:</span> Include final diagnosis, treatment provided, medications prescribed, follow-up instructions, and recommendations.
              </div>
            </div>

            {/* Quick Templates */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Quick Templates</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSummary(prev => prev + "\n\nFinal Diagnosis: ")}
                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all duration-300"
                >
                  + Diagnosis
                </button>
                <button
                  type="button"
                  onClick={() => setSummary(prev => prev + "\n\nTreatment Provided: ")}
                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 rounded-lg border border-emerald-200 hover:border-emerald-300 hover:shadow-sm transition-all duration-300"
                >
                  + Treatment
                </button>
                <button
                  type="button"
                  onClick={() => setSummary(prev => prev + "\n\nMedications: ")}
                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all duration-300"
                >
                  + Medications
                </button>
                <button
                  type="button"
                  onClick={() => setSummary(prev => prev + "\n\nFollow-up: ")}
                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 rounded-lg border border-purple-200 hover:border-purple-300 hover:shadow-sm transition-all duration-300"
                >
                  + Follow-up
                </button>
              </div>
            </div>

            {/* Character Counter */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Character count: <span className="font-medium">{summary.length}</span>
                </span>
                <span className={`px-2 py-1 rounded-full ${
                  summary.length > 100 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : summary.length > 50
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {summary.length > 100 ? 'Good' : summary.length > 50 ? 'Fair' : 'Too short'}
                </span>
              </div>
              <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    summary.length > 200 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 w-full'
                      : summary.length > 100
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      : summary.length > 50
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500'
                  }`}
                  style={{ width: `${Math.min(100, (summary.length / 200) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !summary.trim()}
                className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Save Summary</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DischargeSummaryForm;