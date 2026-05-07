import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import dayjs from "dayjs";
import SendPatientModal from "../../encounters/SendPatientModal";
import AcceptTransferModal from "../../encounters/AcceptTransferModal";
import RejectTransferModal from "../../encounters/RejectTransferModal";
import TransferDetailsModal from "../../encounters/TransferDetailsModal";
import DischargeAction from "../../encounters/discharge/DischargeAction";

const WardDetails = () => {
  const { id } = useParams();
  const [ward, setWard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [incomingTransfers, setIncomingTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectTransfer, setSelectedRejectTransfer] = useState(null);
  const [showTransferDetailsModal, setShowTransferDetailsModal] = useState(false);
  const [transferDetailsData, setTransferDetailsData] = useState(null);
  const [transferDetailsType, setTransferDetailsType] = useState(null);

  const fetchWardDetails = async () => {
    try {
      setUpdating(true);
      const [wardRes, patientsRes, transfersRes] = await Promise.all([
        axiosInstance.get(`/locationsapi/wards/${id}/`),
        axiosInstance.get(`/locationsapi/wards/${id}/patients/`),
        axiosInstance.get(`/encounterapi/wards/${id}/incoming-transfers/`)
      ]);
      
      setWard(wardRes.data);
      setPatients(patientsRes.data || []);
      setIncomingTransfers(transfersRes.data || []);
    } catch (error) {
      console.error("Error fetching ward details:", error);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchWardDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block mb-3">
            <div className="w-12 h-12 border-3 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-3 border-purple-500 border-r-transparent rounded-full animate-spin" style={{ animationDirection: "reverse" }}></div>
          </div>
          <p className="text-sm font-medium text-gray-700">Loading ward dashboard</p>
          <p className="text-xs text-gray-400 mt-1">Fetching patient & transfer data</p>
        </div>
      </div>
    );
  }

  if (!ward) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-gradient-to-br from-red-500 to-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Ward Not Found</h3>
          <p className="text-gray-600 text-sm mb-4">The requested ward does not exist or has been removed.</p>
          <Link
            to="/wards"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Wards
          </Link>
        </div>
      </div>
    );
  }

  const term = searchTerm.trim().toLowerCase();
  const filteredPatients = patients.filter((p) => {
    const firstName = p.user_info?.first_name || "";
    const lastName = p.user_info?.last_name || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const email = p.user_info?.email || "";
    const phone = p.phone || "";
    const pid = p.id || "";

    return fullName.includes(term) ||
           email.toLowerCase().includes(term) ||
           phone.includes(term) ||
           String(pid).includes(term);
  });

  const handleTransferRemoved = (transferId) => {
    setIncomingTransfers((prev) => prev.filter((tr) => tr.id !== transferId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-purple-50/20 to-indigo-50/30">
      {updating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block mb-2">
              <div className="w-10 h-10 border-3 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-blue-600 font-medium">Updating ward data...</p>
          </div>
        </div>
      )}

      {/* Compact Beautiful Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 shadow-xl">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-xl opacity-30 blur-md"></div>
                <div className="relative p-2.5 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h1 className="text-lg font-bold text-white mb-0.5">{ward.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium text-white">
                      {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {incomingTransfers.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gradient-to-r from-amber-500/40 to-yellow-500/40 backdrop-blur-sm rounded-full">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span className="text-xs font-medium text-white">
                        {incomingTransfers.length} transfer{incomingTransfers.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  {ward.capacity && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/40 backdrop-blur-sm rounded-full">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-xs font-medium text-white">{ward.capacity} beds</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Link
              to="/wards"
              className="group relative inline-flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-all duration-200 border border-white/30 hover:border-white/40"
            >
              <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>All Wards</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Incoming Transfers - Colorful Compact Panel */}
      {incomingTransfers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-amber-200 bg-gradient-to-r from-amber-100 to-yellow-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full opacity-30 blur-sm"></div>
                    <div className="relative p-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">Incoming Transfers</h3>
                    <p className="text-amber-700 text-xs">Patients awaiting admission</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold rounded-full">
                  {incomingTransfers.length}
                </span>
              </div>
            </div>

            {/* Compact Transfers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-50/80 to-yellow-50/80">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-amber-800">Patient</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-amber-800 hidden sm:table-cell">From</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-amber-800">Requested</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-amber-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/50">
                  {incomingTransfers.map((tr) => (
                    <tr key={tr.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">
                              {tr.patient.fullname?.charAt(0) || tr.patient.user_info?.fullname?.charAt(0) || "P"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/patient-summary/${tr.patient.id}`}
                              className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate block"
                            >
                              {tr.patient.fullname || tr.patient.user_info?.fullname}
                            </Link>
                            <div className="text-xs text-gray-500">ID: {tr.patient.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        <div className="text-xs text-gray-700 truncate max-w-[100px]">
                          {tr.from_location_name || "—"}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-xs font-medium text-gray-700">
                          {dayjs(tr.date_created).format("DD MMM")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {dayjs(tr.date_created).format("HH:mm")}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1.5">
                          <button
                            className="px-2.5 py-1 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white rounded text-xs font-bold transition-all shadow-sm hover:shadow"
                            onClick={() => {
                              setSelectedTransfer(tr);
                              setShowAcceptModal(true);
                            }}
                          >
                            Accept
                          </button>
                          <button
                            className="px-2.5 py-1 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white rounded text-xs font-bold transition-all shadow-sm hover:shadow"
                            onClick={() => {
                              setSelectedRejectTransfer(tr);
                              setShowRejectModal(true);
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Compact Patients Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
          {/* Header with Search */}
          <div className="px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg opacity-20 blur-sm"></div>
                  <div className="relative p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Current Patients</h2>
                  <p className="text-xs text-gray-600">
                    {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
                    {searchTerm && ` • Filtered by "${searchTerm}"`}
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full sm:w-48 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 bg-white shadow-sm"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Compact Patients Table */}
          <div className="overflow-x-auto">
            {filteredPatients.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-1">No patients found</p>
                {searchTerm && (
                  <p className="text-sm text-gray-500">Try a different search term</p>
                )}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Bed/Room</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Patient Details</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 hidden lg:table-cell">Contact</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPatients.map((p) => {
                    const genderTitle = p.user_info?.gender?.title || null;
                    const hasTransfer = p.active_transfer?.status === "pending";
                    const isRejected = p.transfer_request_status?.status === "rejected";

                    return (
                      <tr key={p.id} className={`hover:bg-blue-50/30 ${hasTransfer ? 'bg-gradient-to-r from-yellow-50/30 to-orange-50/20' : ''}`}>
                        {/* Bed/Room Info */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              p.active_visit?.room 
                                ? 'bg-gradient-to-br from-blue-400 to-indigo-500' 
                                : 'bg-gradient-to-br from-gray-300 to-gray-400'
                            }`}>
                              <span className="text-xs font-bold text-white">
                                {p.active_visit?.room?.[0] || "—"}
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-800">
                                Room {p.active_visit?.room || "—"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Bed {p.active_visit?.bed_number || "—"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Patient Info */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              genderTitle === 'Male' 
                                ? 'bg-gradient-to-br from-blue-400 to-cyan-500'
                                : genderTitle === 'Female'
                                ? 'bg-gradient-to-br from-pink-400 to-rose-500'
                                : 'bg-gradient-to-br from-gray-400 to-gray-500'
                            }`}>
                              <span className="text-xs font-bold text-white">
                                {p.user_info?.first_name?.[0] || "P"}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Link
                                  to={`/patient-summary/${p.id}`}
                                  className="text-sm font-semibold text-gray-800 hover:text-blue-600 truncate"
                                >
                                  {p.user_info?.first_name} {p.user_info?.last_name}
                                </Link>
                                {isRejected && (
                                  <button
                                    onClick={() => {
                                      setTransferDetailsData(p);
                                      setTransferDetailsType("rejected");
                                      setShowTransferDetailsModal(true);
                                    }}
                                    className="px-1.5 py-0.5 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 text-xs font-bold rounded hover:from-red-200 hover:to-pink-200"
                                  >
                                    Rejected
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-600">#{p.id}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-xs font-medium text-gray-700">
                                  {p.age || "—"}y
                                </span>
                                {genderTitle && (
                                  <>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                      genderTitle === 'Male'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-pink-100 text-pink-700'
                                    }`}>
                                      {genderTitle}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info - Hidden on mobile */}
                        <td className="px-3 py-2.5 hidden lg:table-cell">
                          <div className="text-xs text-gray-800 truncate max-w-[140px]">
                            {p.user_info?.email || "—"}
                          </div>
                          <div className="text-xs text-gray-600 truncate max-w-[140px]">
                            {p.phone || "—"}
                          </div>
                        </td>

                        {/* Quick Actions */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/patient/folder/${p.id}`}
                              className="p-1.5 bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 text-emerald-600 rounded-lg transition-all"
                              title="Patient Folder"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                            </Link>

                            {!hasTransfer && genderTitle ? (
                              <button
                                onClick={() => {
                                  setSelectedPatient(p);
                                  setShowModal(true);
                                }}
                                className="p-1.5 bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-600 rounded-lg transition-all"
                                title="Transfer Patient"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </button>
                            ) : hasTransfer ? (
                              <button
                                onClick={() => {
                                  setTransferDetailsData(p);
                                  setTransferDetailsType("pending");
                                  setShowTransferDetailsModal(true);
                                }}
                                className="px-2 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 hover:from-yellow-200 hover:to-amber-200 text-yellow-700 text-xs font-bold rounded"
                              >
                                Pending
                              </button>
                            ) : null}

                            {p.active_visit && (
                              <div className="ml-0.5">
                                <DischargeAction
                                  visit={p.active_visit}
                                  onSuccess={fetchWardDetails}
                                  compact={true}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && selectedPatient && (
        <SendPatientModal
          show={showModal}
          onClose={() => setShowModal(false)}
          patient={selectedPatient}
          locationType="ward"
          onSuccess={fetchWardDetails}
        />
      )}

      {showAcceptModal && selectedTransfer && (
        <AcceptTransferModal
          show={showAcceptModal}
          onClose={() => setShowAcceptModal(false)}
          transfer={selectedTransfer}
          onSuccess={() => {
            handleTransferRemoved(selectedTransfer.id);
            fetchWardDetails();
          }}
        />
      )}

      {showRejectModal && selectedRejectTransfer && (
        <RejectTransferModal
          show={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedRejectTransfer(null);
          }}
          transfer={selectedRejectTransfer}
          onSuccess={() => {
            handleTransferRemoved(selectedRejectTransfer.id);
            fetchWardDetails();
            setShowRejectModal(false);
            setSelectedRejectTransfer(null);
          }}
        />
      )}

      {showTransferDetailsModal && (
        <TransferDetailsModal
          show={showTransferDetailsModal}
          onClose={() => {
            setShowTransferDetailsModal(false);
            setTransferDetailsData(null);
            setTransferDetailsType(null);
          }}
          data={transferDetailsData}
          type={transferDetailsType}
        />
      )}
    </div>
  );
};

export default WardDetails;