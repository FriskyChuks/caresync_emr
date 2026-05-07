import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";

const UpdateAppointmentModal = ({ show, onClose, appointment, onAppointmentUpdated }) => {
  const { showMessage } = useMessage();
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    clinic: "",
    appointment_date: "",
    appointment_time: "",
    reason: "Follow Up"
  });

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
  ];

  useEffect(() => {
    if (appointment) {
      setFormData({
        clinic: appointment.clinic,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        reason: appointment.reason || "Follow Up"
      });
    }
  }, [appointment]);

  useEffect(() => {
    if (show) {
      fetchClinics();
    }
  }, [show]);

  const fetchClinics = async () => {
    try {
      const response = await axiosInstance.get("/locationsapi/clinics/");
      setClinics(response.data);
    } catch (error) {
      console.error("Error fetching clinics:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTimeSelect = (time) => {
    setFormData(prev => ({
      ...prev,
      appointment_time: time
    }));
    setShowTimePicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.patch(`/appointmentapi/update/${appointment.id}/`, formData);
      showMessage("Appointment updated successfully!", "success");
      onAppointmentUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating appointment:", error);
      showMessage("Failed to update appointment", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.time-picker-container')) {
        setShowTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!show || !appointment) return null;

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      kept: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      overdue: "bg-gray-100 text-gray-800"
    };
    return classes[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Reschedule Appointment</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-4rem)]">
          <div className="p-6 space-y-6">
            {/* Current Appointment Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {appointment.patient_data?.name}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Current Date:</span>
                      <span className="ml-2">{appointment.appointment_date}</span>
                      <span className="mx-2">•</span>
                      <span className="font-medium">Time:</span>
                      <span className="ml-2">{appointment.appointment_time}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium">Clinic:</span>
                      <span className="ml-2">{appointment.clinic_name}</span>
                      <span className="mx-2">•</span>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Reason:</span>
                      <span className="ml-2">{appointment.reason || "Follow Up"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clinic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic
                </label>
                <select
                  name="clinic"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={formData.clinic}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Clinic</option>
                  {clinics.map(clinic => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="appointment_date"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Time Picker */}
              <div className="time-picker-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer"
                    placeholder="Select time"
                    value={formData.appointment_time}
                    readOnly
                    onClick={() => setShowTimePicker(!showTimePicker)}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  {/* Time Picker Dropdown */}
                  {showTimePicker && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <h6 className="text-sm font-medium text-gray-900">Select Time</h6>
                      </div>
                      <div className="p-3">
                        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                          {timeSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                                formData.appointment_time === time
                                  ? 'bg-yellow-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              onClick={() => handleTimeSelect(time)}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  name="reason"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={formData.reason}
                  onChange={handleChange}
                >
                  <option value="Follow Up">Follow Up</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Treatment">Treatment</option>
                  <option value="Checkup">Checkup</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Custom Reason */}
            {formData.reason === "Other" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Reason
                </label>
                <textarea
                  name="reason"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Please specify the reason for appointment..."
                  rows="3"
                  value={formData.reason}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-2"></div>
                  Updating...
                </span>
              ) : (
                'Update Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAppointmentModal;