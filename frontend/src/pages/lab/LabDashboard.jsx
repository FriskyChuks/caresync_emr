import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import LabPatientSearchAndRequest from "./LabPatientSearchAndRequest";

const LabDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/labapi/test-requests/");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching lab requests:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    let data = [...requests];
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      data = data.filter((r) => {
        const name = r.patient_info?.fullname?.toLowerCase() || "";
        const phone = r.patient_info?.phone?.toLowerCase() || "";
        const pid = (r.patient_info?.id || "").toString().toLowerCase();
        return name.includes(term) || phone.includes(term) || pid.includes(term);
      });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    data = data.filter((req) => {
      const reqDate = new Date(req.request_date);
      return reqDate >= start && reqDate < end;
    });
    if (activeTab === "today") data = data.filter((r) => r.status !== "completed");
    else if (activeTab === "results") data = data.filter((r) => r.status === "completed" || r.status === "in_progress");
    setFiltered(data);
  }, [searchTerm, requests, startDate, endDate, activeTab]);

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: "bg-amber-100 text-amber-800", icon: "⏳" },
      in_progress: { bg: "bg-blue-100 text-blue-800", icon: "🔄" },
      completed: { bg: "bg-emerald-100 text-emerald-800", icon: "✅" },
      billed: { bg: "bg-purple-100 text-purple-800", icon: "💰" },
      partly_billed: { bg: "bg-purple-50 text-purple-700", icon: "⏳" },
    }[status] || { bg: "bg-gray-100 text-gray-700", icon: "📋" };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bg}`}>
        <span>{config.icon}</span>
        <span className="capitalize">{status.replace("_", " ")}</span>
      </span>
    );
  };

  return (
    <div className="space-y-3">
      <LabPatientSearchAndRequest mode="embed" onRequestCreated={fetchRequests} />

      {/* Compact Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Lab Dashboard</h2>
            <div className="flex items-center gap-1 text-xs text-blue-100">
              <span className="bg-white/20 px-1.5 py-0.5 rounded">{filtered.length} requests</span>
              <span>•</span>
              <span>Live</span>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchRequests}
          className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2">
          <div className="text-xs text-gray-600">Total</div>
          <div className="text-lg font-bold text-blue-700">{requests.length}</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
          <div className="text-xs text-gray-600">Pending</div>
          <div className="text-lg font-bold text-amber-700">
            {requests.filter(r => ["pending", "in_progress"].includes(r.status)).length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-2">
          <div className="text-xs text-gray-600">Ready</div>
          <div className="text-lg font-bold text-purple-700">
            {requests.filter(r => ["billed", "partly_billed"].includes(r.status)).length}
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
          <div className="text-xs text-gray-600">Completed</div>
          <div className="text-lg font-bold text-emerald-700">
            {requests.filter(r => r.status === "completed").length}
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Compact Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab("today")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === "today"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Worklist
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                activeTab === "today" ? "bg-white/30" : "bg-blue-100 text-blue-600"
              }`}>
                {requests.filter(r => r.status !== "completed").length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === "results"
                  ? "bg-emerald-500 text-white"
                  : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Results
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                activeTab === "results" ? "bg-white/30" : "bg-emerald-100 text-emerald-600"
              }`}>
                {requests.filter(r => ["completed", "in_progress"].includes(r.status)).length}
              </span>
            </button>
          </div>
        </div>

        {/* Compact Filters */}
        <div className="p-2 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                className="px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <button
                onClick={() => {
                  setStartDate(dayjs().format("YYYY-MM-DD"));
                  setEndDate(dayjs().format("YYYY-MM-DD"));
                  setSearchTerm("");
                }}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded border border-gray-300"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Compact Table */}
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="py-2 px-2 text-left font-semibold text-gray-600">#</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600">Patient</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600">Tests</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600">Status</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-6">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="text-xs text-blue-600">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4">
                    <div className="text-center space-y-1">
                      <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-gray-500">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((req, i) => (
                  <tr key={req.id} className="hover:bg-blue-50/30">
                    <td className="py-1.5 px-2">
                      <div className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 font-semibold rounded">
                        {i + 1}
                      </div>
                    </td>
                    <td className="py-1.5 px-2">
                      <div className="space-y-0.5">
                        <div className="font-medium text-gray-800 truncate max-w-[120px]">
                          {req.patient_info?.user_info?.fullname}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          <span className="bg-gray-100 px-1 py-0.5 rounded">{req.patient_info?.patient_number}</span>
                          <span>•</span>
                          <span>{req.patient_info?.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-1.5 px-2">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {req.details?.slice(0, 2).map((d) => (
                          <span key={d.id} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                            {d.test?.name?.substring(0, 10)}
                            {d.test?.name?.length > 10 ? '...' : ''}
                          </span>
                        ))}
                        {req.details?.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            +{req.details.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-1.5 px-2">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-1.5 px-2">
                      <div className="flex gap-1">
                        {(req.status === "pending" || req.status === "partly_billed") && (
                          <Link
                            to={`/billing/lab-desk-officer/${req.patient_info?.id}`}
                            className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded transition-colors"
                          >
                            Bill
                          </Link>
                        )}
                        {(req.status === "billed" || req.status === "partly_billed") && activeTab === "today" && (
                          <Link
                            to={`/lab/enter-results/${req.id}`}
                            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                          >
                            Enter
                          </Link>
                        )}
                        {activeTab === "results" && (req.status === "completed" || req.status === "in_progress") && (
                          <Link
                            to={`/lab/result-summary/${req.id}`}
                            className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs rounded transition-colors"
                          >
                            View
                          </Link>
                        )}
                        {req.status === "in_progress" && (
                          <Link
                            to={`/lab/enter-results/${req.id}`}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded transition-colors"
                          >
                            Update
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Compact Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-2 py-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>{filtered.length} items</span>
              </div>
              <div className="text-xs text-gray-700 px-2 py-0.5 bg-white border border-gray-200 rounded">
                {activeTab === "today" ? "📋 Worklist" : "📊 Results"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabDashboard;