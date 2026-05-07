import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";
import ENTClerkingForm from "./EntClerkingForm";
import ENTClerkingSummary from "./EntClerkingSummary";

// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axiosInstance from "../../api/axiosInstance";
// import { useMessage } from "../../context/MessageProvider";
// import ENTClerkingForm from "./EntClerkingForm";
// import ENTClerkingSummary from "./EntClerkingSummary";

const EntClerking = ({ patient, refreshTrigger = 0, maxHeight = "400px" }) => {
  const { pid } = useParams();
  const { showMessage } = useMessage();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("form");

  // Edit state (replaces edit modal)
  const [editRecord, setEditRecord] = useState(null);

  // Expanded record in history tab
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  const [expandedRecordData, setExpandedRecordData] = useState({});
  const [loadingRecordId, setLoadingRecordId] = useState(null);

  useEffect(() => {
    if (!pid) return;
    fetchRecords();
  }, [pid, refreshTrigger]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/entapi/ent-clerking/?patient_id=${pid}`);
      const data = res.data;
      setRecords(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error("ENT fetch error:", err);
      showMessage("Unable to load ENT records", "danger");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleSubmitAll = async (payload) => {
    setSubmitting(true);
    try {
      await axiosInstance.post(`/entapi/ent-clerking/?patient_id=${pid}`, payload);
      showMessage("ENT clerking saved successfully", "success");
      await fetchRecords();
      setActiveTab("history");
    } catch (err) {
      console.error("ENT submit error:", err);
      showMessage(
        err?.response?.data?.detail ?? "Failed to save ENT clerking",
        "danger"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit / Update ──────────────────────────────────────────────────────────
  const handleUpdate = async (payload) => {
    if (!editRecord?.id) return;
    setSubmitting(true);
    try {
      await axiosInstance.patch(
        `/entapi/ent-clerking-update/${editRecord.id}/`,
        payload
      );
      showMessage("ENT clerking updated successfully", "success");

      const updatedId = editRecord.id;

      // Bust the stale cached detail so the summary shows fresh data instantly
      setExpandedRecordData((prev) => {
        const next = { ...prev };
        delete next[updatedId];
        return next;
      });

      // Eagerly re-fetch the fresh full detail and cache it
      try {
        const res = await axiosInstance.get(`/entapi/ent-clerking-details/${updatedId}/`);
        setExpandedRecordData((prev) => ({ ...prev, [updatedId]: res.data }));
      } catch (_) {
        // Non-critical — summary will re-fetch on next expand
      }

      setEditRecord(null);
      setExpandedRecordId(updatedId); // keep expanded so doctor sees the update immediately
      setActiveTab("history");
      await fetchRecords();
    } catch (err) {
      console.error("ENT update error:", err);
      showMessage(
        err?.response?.data?.detail ?? "Failed to update ENT clerking",
        "danger"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle expand a record in history ─────────────────────────────────────
  const handleToggleRecord = async (record) => {
    if (expandedRecordId === record.id) {
      setExpandedRecordId(null);
      return;
    }
    setExpandedRecordId(record.id);
    if (expandedRecordData[record.id]) return; // already loaded
    try {
      setLoadingRecordId(record.id);
      const res = await axiosInstance.get(`/entapi/ent-clerking-details/${record.id}/`);
      setExpandedRecordData((prev) => ({ ...prev, [record.id]: res.data }));
    } catch (err) {
      console.error("Failed to load full record:", err);
      showMessage("Failed to load full ENT record", "danger");
    } finally {
      setLoadingRecordId(null);
    }
  };

  const handleEditClick = (e, record) => {
    e.stopPropagation();
    setEditRecord(record);
    setActiveTab("form");
  };

  const handleCancelEdit = () => {
    if (!submitting) {
      setEditRecord(null);
      setActiveTab("history");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <span className="text-white text-lg">👂</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ENT Clerking</h3>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                  {records.length} record{records.length !== 1 ? "s" : ""}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                <span className="text-white/80 text-xs">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => { setActiveTab("form"); setEditRecord(null); }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "form"
              ? "bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {editRecord ? "Edit Clerking" : "New Clerking"}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "history"
              ? "bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History
          {records.length > 0 && (
            <span className={`px-1.5 py-0.5 text-xs rounded-full font-semibold ${
              activeTab === "history" ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
            }`}>
              {records.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Tab Content ── */}
      <div className="overflow-auto" style={{ maxHeight }}>

        {/* Form Tab */}
        {activeTab === "form" && (
          <div className="p-4">
            <ENTClerkingForm
              patientId={pid}
              submitting={submitting}
              initialData={editRecord}
              isEditMode={!!editRecord}
              onSubmit={editRecord ? handleUpdate : handleSubmitAll}
              onCancel={editRecord ? handleCancelEdit : undefined}
            />
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="p-3">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
                  <p className="mt-2 text-gray-500 text-sm">Loading ENT records...</p>
                </div>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👂</span>
                </div>
                <h4 className="text-gray-900 font-medium mb-1">No ENT records yet</h4>
                <p className="text-gray-500 text-sm mb-4">Switch to the New Clerking tab to create the first record.</p>
                <button
                  onClick={() => setActiveTab("form")}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all mx-auto flex items-center gap-2"
                >
                  + Take First Note
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {records.map((record, idx) => {
                  const isExpanded = expandedRecordId === record.id;
                  const isLoadingThis = loadingRecordId === record.id;
                  const fullData = expandedRecordData[record.id];

                  return (
                    <div
                      key={record.id}
                      className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                        isExpanded
                          ? "border-blue-300 shadow-md bg-white"
                          : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm"
                      }`}
                    >
                      {/* Record Header Row – always visible */}
                      <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer"
                        onClick={() => handleToggleRecord(record)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Index badge */}
                          <span className={`shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                            isExpanded ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            {records.length - idx}
                          </span>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {record.presenting_complaint || "No presenting complaint"}
                            </p>
                            <p className="text-xs text-gray-400">{formatDateTime(record.date_created)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {/* Edit button */}
                          <button
                            onClick={(e) => handleEditClick(e, record)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a1.875 1.875 0 112.651 2.651L8.25 17.401 4 18l.599-4.25L16.862 3.487z" />
                            </svg>
                            Edit
                          </button>

                          {/* Expand chevron */}
                          <span className={`transition-transform duration-200 text-gray-400 ${isExpanded ? "rotate-180" : ""}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      {/* Expanded Summary */}
                      {isExpanded && (
                        <div className="border-t border-blue-100 bg-slate-50/60 px-4 py-4">
                          {isLoadingThis ? (
                            <div className="flex items-center justify-center py-6">
                              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-r-transparent" />
                              <span className="ml-2 text-sm text-gray-400">Loading details...</span>
                            </div>
                          ) : fullData ? (
                            <ENTClerkingSummary
                              record={fullData}
                              onClose={() => setExpandedRecordId(null)}
                              inlineMode
                            />
                          ) : (
                            <p className="text-sm text-gray-400 text-center py-4">Could not load details.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntClerking;

// const EntClerking = ({ patient, refreshTrigger = 0, maxHeight = "400px" }) => {
//   const { pid } = useParams();
//   const { showMessage } = useMessage();

//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   // Tab state
//   const [activeTab, setActiveTab] = useState("form");

//   // Edit state (replaces edit modal)
//   const [editRecord, setEditRecord] = useState(null);

//   // Expanded record in history tab
//   const [expandedRecordId, setExpandedRecordId] = useState(null);
//   const [expandedRecordData, setExpandedRecordData] = useState({});
//   const [loadingRecordId, setLoadingRecordId] = useState(null);

//   useEffect(() => {
//     if (!pid) return;
//     fetchRecords();
//   }, [pid, refreshTrigger]);

//   const fetchRecords = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosInstance.get(`/entapi/ent-clerking/?patient_id=${pid}`);
//       const data = res.data;
//       setRecords(Array.isArray(data) ? data : data.results ?? []);
//     } catch (err) {
//       console.error("ENT fetch error:", err);
//       showMessage("Unable to load ENT records", "danger");
//       setRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDateTime = (dateString) =>
//     new Date(dateString).toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//   // ── Create ─────────────────────────────────────────────────────────────────
//   const handleSubmitAll = async (payload) => {
//     setSubmitting(true);
//     try {
//       await axiosInstance.post(`/entapi/ent-clerking/?patient_id=${pid}`, payload);
//       showMessage("ENT clerking saved successfully", "success");
//       await fetchRecords();
//       setActiveTab("history");
//     } catch (err) {
//       console.error("ENT submit error:", err);
//       showMessage(
//         err?.response?.data?.detail ?? "Failed to save ENT clerking",
//         "danger"
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Edit / Update ──────────────────────────────────────────────────────────
//   const handleUpdate = async (payload) => {
//     if (!editRecord?.id) return;
//     setSubmitting(true);
//     try {
//       await axiosInstance.patch(
//         `/entapi/ent-clerking-update/${editRecord.id}/`,
//         payload
//       );
//       showMessage("ENT clerking updated successfully", "success");
//       setEditRecord(null);
//       setActiveTab("history");
//       await fetchRecords();
//     } catch (err) {
//       console.error("ENT update error:", err);
//       showMessage(
//         err?.response?.data?.detail ?? "Failed to update ENT clerking",
//         "danger"
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Toggle expand a record in history ─────────────────────────────────────
//   const handleToggleRecord = async (record) => {
//     if (expandedRecordId === record.id) {
//       setExpandedRecordId(null);
//       return;
//     }
//     setExpandedRecordId(record.id);
//     if (expandedRecordData[record.id]) return; // already loaded
//     try {
//       setLoadingRecordId(record.id);
//       const res = await axiosInstance.get(`/entapi/ent-clerking-details/${record.id}/`);
//       setExpandedRecordData((prev) => ({ ...prev, [record.id]: res.data }));
//     } catch (err) {
//       console.error("Failed to load full record:", err);
//       showMessage("Failed to load full ENT record", "danger");
//     } finally {
//       setLoadingRecordId(null);
//     }
//   };

//   const handleEditClick = (e, record) => {
//     e.stopPropagation();
//     setEditRecord(record);
//     setActiveTab("form");
//   };

//   const handleCancelEdit = () => {
//     if (!submitting) {
//       setEditRecord(null);
//       setActiveTab("history");
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

//       {/* ── Header ── */}
//       <div className="px-4 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
//               <span className="text-white text-lg">👂</span>
//             </div>
//             <div>
//               <h3 className="text-base font-bold text-white">ENT Clerking</h3>
//               <div className="flex items-center gap-2">
//                 {/* <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
//                   {records.length} record{records.length !== 1 ? "s" : ""}
//                 </span> */}
//                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
//                 <span className="text-white/80 text-xs">Active</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Tabs ── */}
//       <div className="flex border-b border-gray-200 bg-gray-50">
//         <button
//           onClick={() => { setActiveTab("form"); setEditRecord(null); }}
//           className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
//             activeTab === "form"
//               ? "bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm"
//               : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
//           }`}
//         >
//           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//           </svg>
//           {editRecord ? "Edit Clerking" : "New Clerking"}
//         </button>
//         <button
//           onClick={() => setActiveTab("history")}
//           className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
//             activeTab === "history"
//               ? "bg-white text-blue-600 border-b-2 border-blue-500 shadow-sm"
//               : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
//           }`}
//         >
//           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           History
//           {records.length > 0 && (
//             <span className={`px-1.5 py-0.5 text-xs rounded-full font-semibold ${
//               activeTab === "history" ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
//             }`}>
//               {records.length}
//             </span>
//           )}
//         </button>
//       </div>

//       {/* ── Tab Content ── */}
//       <div className="overflow-auto" style={{ maxHeight }}>

//         {/* Form Tab */}
//         {activeTab === "form" && (
//           <div className="p-4">
//             <ENTClerkingForm
//               patientId={pid}
//               submitting={submitting}
//               initialData={editRecord}
//               isEditMode={!!editRecord}
//               onSubmit={editRecord ? handleUpdate : handleSubmitAll}
//               onCancel={editRecord ? handleCancelEdit : undefined}
//             />
//           </div>
//         )}

//         {/* History Tab */}
//         {activeTab === "history" && (
//           <div className="p-3">
//             {loading ? (
//               <div className="flex items-center justify-center py-10">
//                 <div className="text-center">
//                   <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
//                   <p className="mt-2 text-gray-500 text-sm">Loading ENT records...</p>
//                 </div>
//               </div>
//             ) : records.length === 0 ? (
//               <div className="text-center py-10">
//                 <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
//                   <span className="text-2xl">👂</span>
//                 </div>
//                 <h4 className="text-gray-900 font-medium mb-1">No ENT records yet</h4>
//                 <p className="text-gray-500 text-sm mb-4">Switch to the New Clerking tab to create the first record.</p>
//                 <button
//                   onClick={() => setActiveTab("form")}
//                   className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all mx-auto flex items-center gap-2"
//                 >
//                   + Take First Note
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {records.map((record, idx) => {
//                   const isExpanded = expandedRecordId === record.id;
//                   const isLoadingThis = loadingRecordId === record.id;
//                   const fullData = expandedRecordData[record.id];

//                   return (
//                     <div
//                       key={record.id}
//                       className={`border rounded-xl transition-all duration-200 overflow-hidden ${
//                         isExpanded
//                           ? "border-blue-300 shadow-md bg-white"
//                           : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm"
//                       }`}
//                     >
//                       {/* Record Header Row – always visible */}
//                       <div
//                         className="flex items-center justify-between px-4 py-3 cursor-pointer"
//                         onClick={() => handleToggleRecord(record)}
//                       >
//                         <div className="flex items-center gap-3 min-w-0">
//                           {/* Index badge */}
//                           <span className={`shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
//                             isExpanded ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
//                           }`}>
//                           </span>

//                           <div className="min-w-0">
//                             <p className="text-sm font-semibold text-gray-900 truncate">
//                               {record.presenting_complaint || "No presenting complaint"}
//                             </p>
//                             <p className="text-xs text-gray-400">{formatDateTime(record.date_created)}</p>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2 shrink-0 ml-2">
//                           {/* Edit button */}
//                           <button
//                             onClick={(e) => handleEditClick(e, record)}
//                             className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
//                               <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a1.875 1.875 0 112.651 2.651L8.25 17.401 4 18l.599-4.25L16.862 3.487z" />
//                             </svg>
//                             Edit
//                           </button>

//                           {/* Expand chevron */}
//                           <span className={`transition-transform duration-200 text-gray-400 ${isExpanded ? "rotate-180" : ""}`}>
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                             </svg>
//                           </span>
//                         </div>
//                       </div>

//                       {/* Expanded Summary */}
//                       {isExpanded && (
//                         <div className="border-t border-blue-100 bg-slate-50/60 px-4 py-4">
//                           {isLoadingThis ? (
//                             <div className="flex items-center justify-center py-6">
//                               <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-r-transparent" />
//                               <span className="ml-2 text-sm text-gray-400">Loading details...</span>
//                             </div>
//                           ) : fullData ? (
//                             <ENTClerkingSummary
//                               record={fullData}
//                               onClose={() => setExpandedRecordId(null)}
//                               inlineMode
//                             />
//                           ) : (
//                             <p className="text-sm text-gray-400 text-center py-4">Could not load details.</p>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EntClerking;


