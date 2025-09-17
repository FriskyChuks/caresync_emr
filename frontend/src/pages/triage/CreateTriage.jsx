// CreateTriage.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";
import ReusableModal from "../../components/common/ReusableModal";
import VitalsForm from "../triage/VitalsForm"
import useAuth from '../../hooks/useAuth';

const CreateTriage = () => {
  const { showMessage } = useMessage();
  const { pid } = useParams();
  const {user} = useAuth()

  const [formData, setFormData] = useState({
    temp: "",
    weight: "",
    height: "",
    bp: "",
    spo2: "",
    pulse: "",
  });

  const [triageRecords, setTriageRecords] = useState([]);
  const [patient, setPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- Fetch Patient Info ---
  const fetchPatient = async () => {
    try {
      setPatientLoading(true);
      const response = await axiosInstance.get(
        `/patientsapi/patient_detail/${pid}/`
      );
      setPatient(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching patient info:", err);
      setError("Failed to fetch patient information.");
    } finally {
      setPatientLoading(false);
    }
  };

  // --- Fetch Triage Records ---
  const fetchTriageRecords = async () => {
    try {
      const response = await axiosInstance.get(`/triageapi/patients/${pid}/`);
      setTriageRecords(response.data);
    } catch (err) {
      console.error("Error fetching triage records:", err);
    }
  };

  useEffect(() => {
    if (pid) {
      fetchPatient();
      fetchTriageRecords();
    }
  }, [pid]);

  // --- Input Handling ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Validation ---
  const validateForm = () => {
    const { temp, weight, height, bp, spo2, pulse } = formData;

    if (![temp, weight, height, bp, spo2, pulse].some((v) => v !== "")) {
      alert("Please enter at least one vital sign before submitting.");
      return false;
    }
    if (bp && !/^\d{2,3}\/\d{2,3}$/.test(bp)) {
      alert("Blood pressure must be in format XXX/XX (e.g., 120/80)");
      return false;
    }
    if (temp && (temp < 30 || temp > 45)) {
      alert("Temperature should be between 30–45°C");
      return false;
    }
    if (spo2 && (spo2 < 0 || spo2 > 100)) {
      alert("SpO₂ should be between 0–100%");
      return false;
    }
    if (pulse && (pulse < 30 || pulse > 200)) {
      alert("Pulse should be between 30–200 bpm");
      return false;
    }
    return true;
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/triageapi/patients/${pid}/`, {
        temp: formData.temp ? parseFloat(formData.temp) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        bp: formData.bp || null,
        spo2: formData.spo2 ? parseFloat(formData.spo2) : null,
        pulse: formData.pulse ? parseFloat(formData.pulse) : null,
        pid:patient.id, created_by:user.id,
      });

      setTriageRecords((prev) => [response.data, ...prev]);
      setFormData({
        temp: "",
        weight: "",
        height: "",
        bp: "",
        spo2: "",
        pulse: "",
      });

      setShowModal(false);
      showMessage("Triage record saved successfully", "success");
    } catch (err) {
      console.error("Error submitting triage data:", err);
      showMessage("Failed to save triage record", "danger");
    } finally {
      setLoading(false);
    }
  };

  // --- Utilities ---
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getVitalStatus = (vital, value) => {
    if (!value) return "";
    const numValue = parseFloat(value);

    switch (vital) {
      case "temp":
        return numValue >= 36.1 && numValue <= 37.2
          ? "text-success"
          : numValue >= 37.3 && numValue <= 38.0
          ? "text-warning"
          : "text-danger";
      case "spo2":
        return numValue >= 95
          ? "text-success"
          : numValue >= 90
          ? "text-warning"
          : "text-danger";
      case "pulse":
        return numValue >= 60 && numValue <= 100
          ? "text-success"
          : numValue >= 50 && numValue <= 120
          ? "text-warning"
          : "text-danger";
      case "bp":
        const [systolic, diastolic] = value.split("/").map(Number);
        if (!systolic || !diastolic) return "";
        if (systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80)
          return "text-success";
        if (
          (systolic >= 121 && systolic <= 139) ||
          (diastolic >= 81 && diastolic <= 89)
        )
          return "text-warning";
        return "text-danger";
      default:
        return "";
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const bmi = weight / (height / 100) ** 2;
    return bmi.toFixed(1);
  };

  // --- Loading & Error States ---
  if (patientLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Fetching patient record...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center my-5">
        <i className="ri-error-warning-line me-2"></i> {error}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold text-dark">
            Patient Triage &nbsp;&nbsp;
            {patient && (
              <Link
                to={`/patient/folder/${patient.id}`}
                title="Open Patient Folder"
              >
                <i className="ri-folder-2-line text-primary"></i>
              </Link>
            )}
          </h4>
          <h6 className="text-muted">
            {patient
              ? `${patient.user_info.first_name} ${patient.user_info.last_name} | PID-${patient.id} 
              ${patient.user_info.gender? '| ' + (patient.user_info.gender.title) : ""}`
              : "Patient information not available"}
          </h6>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <i className="ri-add-line me-2"></i> Record Vitals
        </button>
      </div>

      {/* --- Modal for New Vitals --- */}
      <ReusableModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Record New Vitals"
        size="lg"
      >
        {patient && (
          <div className="mb-3 text-muted small">
            <strong>Patient:</strong> {patient.user_info.first_name}{" "}
            {patient.user_info.last_name} | <strong>PID-{patient.id}</strong>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <VitalsForm
            formData={formData}
            onChange={handleInputChange}
            disabled={loading}
          />
          <div className="text-end mt-3">
            <button
              type="button"
              className="btn btn-light me-2"
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                "Save Vitals"
              )}
            </button>
          </div>
        </form>
      </ReusableModal>

      {/* --- Records --- */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Triage Records</h5>
        </div>
        <div className="card-body pt-0">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Temp</th>
                  <th>Weight</th>
                  <th>Height</th>
                  <th>BP</th>
                  <th>SpO₂</th>
                  <th>Pulse</th>
                  <th>BMI</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {triageRecords.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      No triage records yet. Start by recording patient vitals
                      above.
                    </td>
                  </tr>
                ) : (
                  triageRecords.map((record) => {
                    const bmi = calculateBMI(record.weight, record.height);
                    return (
                      <tr key={record.id}>
                        <td>
                          {formatDate(record.date_recorded)}{" "}
                          {formatTime(record.date_recorded)}
                        </td>
                        <td>
                          {record.temp !== null ? (
                            <span className={getVitalStatus("temp", record.temp)}>
                              {record.temp}°C
                            </span>
                          ) : (
                            "---"
                          )}
                        </td>
                        <td>
                          {record.weight ? `${record.weight} kg` : "---"}
                        </td>
                        <td>
                          {record.height ? `${record.height} cm` : "---"}
                        </td>
                        <td>
                          {record.bp ? (
                            <span className={getVitalStatus("bp", record.bp)}>
                              {record.bp}
                            </span>
                          ) : (
                            "---"
                          )}
                        </td>
                        <td>
                          {record.spo2 !== null ? (
                            <span className={getVitalStatus("spo2", record.spo2)}>
                              {record.spo2}%
                            </span>
                          ) : (
                            "---"
                          )}
                        </td>
                        <td>
                          {record.pulse !== null ? (
                            <span
                              className={getVitalStatus("pulse", record.pulse)}
                            >
                              {record.pulse} bpm
                            </span>
                          ) : (
                            "---"
                          )}
                        </td>
                        <td>{bmi || "---"}</td>
                        <td>{record.recorded_by}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTriage;
