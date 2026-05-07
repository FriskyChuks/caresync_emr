import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";
import { debounce } from "lodash";
import useAuth from "../../hooks/useAuth";

const ScheduleAppointmentModal = ({ show, onClose, onAppointmentScheduled }) => {
  const { showMessage } = useMessage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    patient: "",
    clinic: "",
    appointment_date: "",
    appointment_time: "",
    reason: "Follow Up",
    created_by: user?.id
  });

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
  ];

  const searchPatients = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setPatients([]);
        setSearchLoading(false);
        return;
      }

      try {
        setSearchLoading(true);
        const response = await axiosInstance.get("/patientsapi/patient_search/", {
          params: { q: query }
        });
        setPatients(response.data);
      } catch (error) {
        console.error("Error searching patients:", error);
        showMessage("Error searching patients", "danger");
        setPatients([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (show) {
      fetchClinics();
      setFormData({
        patient: "",
        clinic: "",
        appointment_date: "",
        appointment_time: "",
        reason: "Follow Up"
      });
      setSelectedPatient(null);
      setSearchTerm("");
      setPatients([]);
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowPatientDropdown(true);
    
    if (value.trim()) {
      setSearchLoading(true);
      searchPatients(value);
    } else {
      setPatients([]);
      setSearchLoading(false);
    }

    if (selectedPatient && !value.includes(selectedPatient.first_name) && !value.includes(selectedPatient.last_name)) {
      setSelectedPatient(null);
      setFormData(prev => ({ ...prev, patient: "" }));
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patient: patient.patient_data.id }));
    setSearchTerm(`${patient.first_name} ${patient.last_name}`.trim());
    setShowPatientDropdown(false);
    setPatients([]);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      created_by: user?.id
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
    
    if (!selectedPatient) {
      showMessage("Please select a patient", "warning");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/appointmentapi/", formData);
      showMessage("Appointment scheduled successfully!", "success");
      onAppointmentScheduled();
      onClose();
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      showMessage("Failed to schedule appointment", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.patient-search-container')) {
        setShowPatientDropdown(false);
      }
      if (!event.target.closest('.time-picker-container')) {
        setShowTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Schedule New Appointment</h3>
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
            {/* Patient Search */}
            <div className="patient-search-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Patient *
              </label>
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by name, phone, email, or patient ID..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowPatientDropdown(true)}
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-r-transparent"></div>
                    </div>
                  )}
                </div>
                
                {/* Search Results Dropdown */}
                {showPatientDropdown && searchTerm && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {searchLoading ? (
                      <div className="p-4 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-r-transparent mr-2"></div>
                        <span className="text-gray-500">Searching patients...</span>
                      </div>
                    ) : patients.length > 0 ? (
                      patients.map(patient => (
                        <div
                          key={patient.patient_data.id}
                          className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {patient.first_name} {patient.last_name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1 space-y-1">
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {patient.patient_data?.phone || 'No phone'}
                                </div>
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                  </svg>
                                  {patient.email}
                                </div>
                                {patient.patient_data?.id && (
                                  <div className="text-xs text-gray-400">
                                    Patient ID: {patient.patient_data.id}
                                  </div>
                                )}
                              </div>
                            </div>
                            {patient.patient_data?.wallet && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ${patient.patient_data.wallet_balance || 0}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        {searchTerm ? 'No patients found. Try a different search term.' : 'Start typing to search for patients...'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Selected Patient Info */}
              {selectedPatient && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </h4>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {selectedPatient.patient_data?.phone || 'No phone'}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            {selectedPatient.email}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div>
                            <span className="font-medium">Patient ID:</span> {selectedPatient?.patient_data?.id || 'N/A'}
                          </div>
                          {selectedPatient.patient_data?.wallet && (
                            <div>
                              <span className="font-medium">Wallet Balance:</span>
                              <span className="ml-1 text-green-600 font-medium">
                                ${selectedPatient.patient_data.wallet_balance || 0}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clinic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic *
                </label>
                <select
                  name="clinic"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  Appointment Date *
                </label>
                <input
                  type="date"
                  name="appointment_date"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Time Picker */}
              <div className="time-picker-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Time *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
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
                                  ? 'bg-blue-600 text-white'
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              disabled={loading || !selectedPatient}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-2"></div>
                  Scheduling...
                </span>
              ) : (
                'Schedule Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleAppointmentModal;