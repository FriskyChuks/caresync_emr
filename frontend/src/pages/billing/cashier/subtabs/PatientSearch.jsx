import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import { useMessage } from "../../../../context/MessageProvider";

const PatientSearch = ({ onSelect }) => {
  const { showMessage } = useMessage();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchPatients(q), 300);
    return () => clearTimeout(debounce.current);
  }, [q]);

  const fetchPatients = async (term) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/patientsapi/patient_search/?q=${encodeURIComponent(term)}`
      );
      setResults(res.data || []);
    } catch (err) {
      showMessage("Search failed", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (u) => {
    const patient = u.patient_data || {};
    const fullname = `${u.first_name || ""} ${u.last_name || ""} ${u.other_name || ""}`.trim();

    onSelect({
      id: patient.id,
      patient_number: patient.patient_number,
      fullname,
      phone: patient.phone || "—",
      wallet_balance: Number(patient.wallet_balance ?? 0),
      gender: patient?.user_info?.gender?.title || "—",
    });
  };

  return (
    <div className="space-y-1.5">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-2.5 top-2.5 text-gray-400 text-sm">🔍</div>
        <input
          type="search"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search with: Name, PID, phone..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white">
        {loading && (
          <div className="flex items-center justify-center p-3">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-gray-500">Searching...</span>
          </div>
        )}

        {!loading && results.length === 0 && q && (
          <div className="p-3 text-center text-gray-500 text-sm">
            No matches for "<span className="font-medium">{q}</span>"
          </div>
        )}

        {results.map((u) => {
          const patient = u.patient_data || {};
          const fullname = `${u.first_name || ""} ${u.last_name || ""} ${u.other_name || ""}`.trim();
          const wallet = Number(patient.wallet_balance ?? 0);

          return (
            <div
              key={u.id}
              className="p-2 border-b border-gray-100 hover:bg-blue-50 cursor-pointer group"
              onClick={() => handleSelect(u)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="font-medium text-gray-800 text-sm truncate">
                      {fullname || "Unnamed"}
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      PID:{patient.patient_number}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                    <span>📱 {patient.phone || "—"}</span>
                    <span>•</span>
                    <span>👤 {patient?.user_info?.gender?.title || "—"}</span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      wallet > 0 
                        ? 'text-emerald-700 bg-emerald-50' 
                        : 'text-gray-600 bg-gray-100'
                    }`}>
                      ₦{wallet.toLocaleString()}
                    </div>
                    
                    <button className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded hover:shadow-sm transition-all duration-300">
                      Select →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatientSearch;