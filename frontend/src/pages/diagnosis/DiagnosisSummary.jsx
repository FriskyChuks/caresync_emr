import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

const DiagnosisSummary = ({ patientId, refreshTrigger }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true); // Changed to true for default collapsed

  const fetchSummary = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/icd11api/patients/${patientId}/diagnoses/summary/`);
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [patientId, refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!summary || summary.total === 0) return null;

  const getTypeColor = (type) => {
    const colors = {
      primary: "bg-blue-100 text-blue-700",
      secondary: "bg-gray-100 text-gray-700",
      complication: "bg-red-100 text-red-700",
      comorbidity: "bg-yellow-100 text-yellow-700",
      provisional: "bg-orange-100 text-orange-700",
      differential: "bg-purple-100 text-purple-700",
      rule_out: "bg-gray-100 text-gray-500"
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  // Get abbreviated type label
  const getTypeLabel = (type) => {
    const labels = {
      primary: "Primary",
      secondary: "Secondary",
      complication: "Comp",
      comorbidity: "Comorb",
      provisional: "Prov",
      differential: "Diff",
      rule_out: "Rule Out"
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header - Always visible, clickable to toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="font-semibold text-gray-700">Diagnoses</span>
          <span className="text-xs text-gray-400 ml-1">({summary.total})</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick stats in header - Always visible even when collapsed */}
          <div className="flex gap-2 text-xs">
            <span className="text-green-600">{summary.active} active</span>
            <span className="text-gray-500">{summary.resolved} resolved</span>
            {summary.confirmed > 0 && (
              <span className="text-blue-600">{summary.confirmed} ✓</span>
            )}
          </div>
          <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCollapsed ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable Content - Only shown when expanded */}
      {!isCollapsed && (
        <div className="border-t border-gray-100 p-3 space-y-3 animate-slide-down">
          {/* Main Stats - Grid for mobile */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-green-600">{summary.active}</div>
              <div className="text-xs text-gray-600">Active Diagnoses</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-xl font-bold text-gray-600">{summary.resolved}</div>
              <div className="text-xs text-gray-600">Resolved Diagnoses</div>
            </div>
          </div>

          {/* Confirmed Badge */}
          {summary.confirmed > 0 && (
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <div className="text-sm font-semibold text-green-700">
                ✓ {summary.confirmed} Confirmed Diagnosis{summary.confirmed !== 1 ? 'es' : ''}
              </div>
            </div>
          )}

          {/* Type Breakdown - Scrollable horizontally on mobile */}
          {summary.by_type && summary.by_type.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1.5">By Type</div>
              <div className="flex flex-wrap gap-1.5">
                {summary.by_type.map((item) => (
                  <span
                    key={item.diagnosis_type}
                    className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(item.diagnosis_type)}`}
                  >
                    {getTypeLabel(item.diagnosis_type)}: {item.count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Diagnoses - Compact */}
          {summary.recent && summary.recent.length > 0 && (
            <div className="pt-1">
              <div className="text-xs font-medium text-gray-500 mb-1.5">Recent Diagnoses</div>
              <div className="space-y-1.5">
                {summary.recent.slice(0, 3).map((diag) => (
                  <div key={diag.id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-600">{diag.category_code}</span>
                      <span className="text-gray-600 truncate max-w-[150px] sm:max-w-[200px]">
                        {diag.category_title}
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {new Date(diag.diagnosed_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
              {summary.recent.length > 3 && (
                <div className="mt-2 text-center">
                  <span className="text-xs text-blue-500">+{summary.recent.length - 3} more</span>
                </div>
              )}
            </div>
          )}

          {/* View All Link */}
          <div className="pt-2 text-center border-t border-gray-100 mt-2">
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View All Diagnoses →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisSummary;