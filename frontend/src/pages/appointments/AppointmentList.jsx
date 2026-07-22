import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";
import useAuth from "../../hooks/useAuth";
import ScheduleAppointmentModal from "./ScheduleAppointmentModal";
import UpdateAppointmentModal from "./UpdateAppointmentModal";
import SendPatientModal from "../encounters/SendPatientModal";

const AppointmentList = () => {
  const { user } = useAuth();
  const { showMessage } = useMessage();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filterDate, setFilterDate] = useState("");
  const [filterClinic, setFilterClinic] = useState("");
  const [clinics, setClinics] = useState([]);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatientForTransfer, setSelectedPatientForTransfer] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/appointmentapi/");
      setAppointments(response.data);
      
      // Extract unique clinics for filter
      const uniqueClinics = [...new Set(response.data.map(apt => apt.clinic_name).filter(Boolean))];
      setClinics(uniqueClinics);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      showMessage("Error fetching appointments", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Clear all filters
  const clearFilters = () => {
    setFilterDate("");
    setFilterClinic("");
    setSearchTerm("");
  };

  // Apply filters
  const filteredAppointments = appointments.filter(appointment => {
    // Search filter
    const matchesSearch = !searchTerm || 
      appointment.patient_data?.user_info?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient_data?.patient_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient_data?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter
    const matchesDate = !filterDate || appointment.appointment_date === filterDate;
    
    // Clinic filter
    const matchesClinic = !filterClinic || appointment.clinic_name === filterClinic;
    
    return matchesSearch && matchesDate && matchesClinic;
  });

  // Get filter summary text
  const getFilterSummary = () => {
    const filters = [];
    if (filterDate) filters.push(`Date: ${filterDate}`);
    if (filterClinic) filters.push(`Clinic: ${filterClinic}`);
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    return filters;
  };

  if (loading) {
    return (
      <div className="min-h-[250px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-200 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-t-purple-600 border-r-purple-600 border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-3 text-sm text-gray-700 font-medium">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Compact Header */}
      <div className="mb-4">
        <div className="rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2.5 gap-2">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold">Appointments</h1>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{filteredAppointments.length}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="bg-white/20 px-2 py-0.5 rounded-full">Pending: {filteredAppointments.filter(a => a.status === 'pending').length}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full">Today: {filteredAppointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  className="w-full sm:w-36 pl-7 pr-2 py-1.5 text-xs border border-white/30 bg-white/10 rounded text-white placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-white/50"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-2 top-2 text-white/70">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${showFilters ? 'bg-white text-purple-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
              
              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-1.5 bg-white text-purple-600 px-2.5 py-1.5 rounded text-xs font-medium hover:bg-purple-50 transition-colors shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="px-3 pb-3 pt-2 border-t border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                {/* Date Filter */}
                <div>
                  <label className="block text-xs text-white/80 mb-1">Filter by Date</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-white/30 bg-white/10 rounded text-white focus:outline-none focus:ring-1 focus:ring-white/50"
                  />
                </div>
                
                {/* Clinic Filter */}
                <div>
                  <label className="block text-xs text-white/80 mb-1">Filter by Clinic</label>
                  <select
                    value={filterClinic}
                    onChange={(e) => setFilterClinic(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-white/30 bg-white/10 rounded text-white focus:outline-none focus:ring-1 focus:ring-white/50"
                  >
                    <option value="" className="text-gray-800">All Clinics</option>
                    {clinics.map(clinic => (
                      <option key={clinic} value={clinic} className="text-gray-800">{clinic}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-white/70">
                  {getFilterSummary().length > 0 && (
                    <span>Active: {getFilterSummary().join(' • ')}</span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-xs text-white/80 hover:text-white underline"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Stats Row - Mobile */}
          <div className="sm:hidden flex items-center justify-between px-3 py-1.5 border-t border-white/20 text-xs">
            <span className="text-white/80">Pending: {filteredAppointments.filter(a => a.status === 'pending').length}</span>
            <span className="text-white/80">Today: {filteredAppointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length}</span>
          </div>

          {/* View Toggle */}
          <div className="flex border-t border-white/20">
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 ${viewMode === "list" ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              List
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 ${viewMode === "grid" ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* No Results Message */}
      {filteredAppointments.length === 0 && (filterDate || filterClinic || searchTerm) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm text-amber-800">No appointments match your filters</span>
          </div>
          <button onClick={clearFilters} className="text-sm text-amber-700 font-medium hover:underline">Clear filters</button>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {filteredAppointments.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-base text-gray-700 mb-2">No appointments found</p>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              Schedule your first appointment →
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Compact Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
            {filteredAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onEdit={() => {
                  setSelectedAppointment(appointment);
                  setShowUpdateModal(true);
                }}
                onSendToClinic={() => {
                  setSelectedAppointment(appointment);
                  setSelectedPatientForTransfer({
                    id: appointment.patient,
                    user_info: appointment.patient_data?.user_info,
                    active_visit: appointment.patient_data?.active_visit
                  });
                  setShowSendModal(true);
                }}
              />
            ))}
          </div>
        ) : (
          /* Compact Table View */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinic</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map(appointment => (
                  <AppointmentTableRow 
                    key={appointment.id} 
                    appointment={appointment}
                    onEdit={() => {
                      setSelectedAppointment(appointment);
                      setShowUpdateModal(true);
                    }}
                    onSendToClinic={() => {
                      setSelectedAppointment(appointment);
                      setSelectedPatientForTransfer({
                        id: appointment.patient,
                        user_info: appointment.patient_data?.user_info,
                        active_visit: appointment.patient_data?.active_visit
                      });
                      setShowSendModal(true);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ScheduleAppointmentModal
        show={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onAppointmentScheduled={fetchAppointments}
      />

      <UpdateAppointmentModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        appointment={selectedAppointment}
        onAppointmentUpdated={fetchAppointments}
      />

      <SendPatientModal
        show={showSendModal}
        onClose={() => setShowSendModal(false)}
        patient={selectedPatientForTransfer}
        initialLocationType="clinic"
        onSuccess={() => {
          fetchAppointments();
          showMessage("Patient sent to clinic successfully!", "success");
        }}
      />
    </>
  );
};

// Compact Card Component
const AppointmentCard = ({ appointment, onEdit, onSendToClinic }) => {
  const getStatusColors = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-800",
      in_progress: "bg-blue-100 text-blue-800",
      kept: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-rose-100 text-rose-800",
      overdue: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              {appointment.patient_data?.user_info?.fullname || 'N/A'}
            </h4>
            <p className="text-xs text-gray-500">{appointment?.patient_data?.patient_number}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColors(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{appointment.appointment_date} • {appointment.appointment_time}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="truncate">{appointment.clinic_name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span className="truncate">{appointment.reason || 'Follow Up'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Compact Table Row
const AppointmentTableRow = ({ appointment, onEdit, onSendToClinic }) => {
  const getStatusColors = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-800",
      in_progress: "bg-blue-100 text-blue-800",
      kept: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-rose-100 text-rose-800",
      overdue: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <tr className="hover:bg-purple-50/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {appointment.patient_data?.user_info?.fullname || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">{appointment?.patient_data?.patient_number}</div>
          </div>
        </div>
      </td>
      
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{appointment.appointment_date}</div>
        <div className="text-xs text-gray-500">{appointment.appointment_time}</div>
      </td>
      
      <td className="px-4 py-3">
        <div className="text-sm text-gray-900">{appointment.clinic_name}</div>
      </td>
      
      <td className="px-4 py-3">
        <div className="text-xs text-gray-600 truncate max-w-[120px]">{appointment.patient_data?.email || 'N/A'}</div>
        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {appointment.patient_data?.phone || 'N/A'}
        </div>
      </td>
      
      <td className="px-4 py-3">
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
          {appointment.reason || 'Follow Up'}
        </span>
      </td>
      
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColors(appointment.status)}`}>
          {appointment.status}
        </span>
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AppointmentList;