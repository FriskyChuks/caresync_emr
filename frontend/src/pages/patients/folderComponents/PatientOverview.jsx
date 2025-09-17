// folderComponents/PatientOverview.jsx
import React from "react";
import { Link } from "react-router-dom";

const PatientOverview = ({ patient, vitals, loading }) => {
  if (loading) return <p className="text-muted">Loading patient overview...</p>;
  if (!patient) return <p className="text-danger">Patient not found.</p>;

  console.log("'patient Data:", patient)

  // --- Helper functions ---
  const vitalsBadges = () => {
    if (!vitals || !vitals.length)
      return <span className="text-muted">No vitals recorded</span>;

    const latestVital = vitals[0]; // assuming sorted desc
    const badges = [];

    // BP
    if (latestVital.bp) {
      const [sys, dia] = latestVital.bp.split("/").map(Number);
      const abnormal = sys < 90 || sys > 140 || dia < 60 || dia > 90;
      badges.push(
        <span
          key="bp"
          className={`badge me-2 ${
            abnormal ? "bg-danger text-white" : "bg-light text-dark border"
          }`}
        >
          BP: {latestVital.bp} mmHg
        </span>
      );
    }

    // Temp
    if (latestVital.temp != null) {
      const abnormal = latestVital.temp > 37.5 || latestVital.temp < 36;
      badges.push(
        <span
          key="temp"
          className={`badge me-2 ${
            abnormal ? "bg-danger text-white" : "bg-light text-dark border"
          }`}
        >
          Temp: {latestVital.temp} °C
        </span>
      );
    }

    // Pulse
    if (latestVital.pulse != null) {
      const abnormal = latestVital.pulse < 60 || latestVital.pulse > 100;
      badges.push(
        <span
          key="pulse"
          className={`badge me-2 ${
            abnormal ? "bg-warning text-dark" : "bg-light text-dark border"
          }`}
        >
          Pulse: {latestVital.pulse} bpm
        </span>
      );
    }

    // SpO₂
    if (latestVital.spo2 != null) {
      const abnormal = latestVital.spo2 < 95;
      badges.push(
        <span
          key="spo2"
          className={`badge me-2 ${
            abnormal ? "bg-danger text-white" : "bg-light text-dark border"
          }`}
        >
          SpO₂: {latestVital.spo2} %
        </span>
      );
    }

    // BMI
    if (latestVital.weight && latestVital.height) {
      const bmi = (
        latestVital.weight /
        (latestVital.height / 100) ** 2
      ).toFixed(1);
      const abnormal = bmi < 18.5 || bmi > 24.9;
      badges.push(
        <span
          key="bmi"
          className={`badge ${
            abnormal ? "bg-warning text-dark" : "bg-light text-dark border"
          }`}
        >
          BMI: {bmi}
        </span>
      );
    }

    return badges;
  };
  
  const current_ward_id = patient.active_visit.current_location.ward_id
  const current_ward = patient.active_visit.current_location.ward
  const current_clinic_id = patient.active_visit.current_location.clinic_id
  const current_clinic = patient.active_visit.current_location.clinic

  return (
    <div className="row gx-4">
      <div className="col-sm-12">
        <div className="card shadow-sm border-0 mb-4">
          {/* --- Clinic Location Badge --- */}
          {patient.active_visit?  (
            <div className="card-header bg-light border-0 d-flex">
                <Link
                to={current_clinic? `/clinic-details/${current_clinic_id}` : `/ward-details/${current_ward_id}`}
                className="badge rounded-pill bg-primary text-white px-3 py-2 d-flex align-items-center text-decoration-none"
                >
                <i className="ri-hospital-line me-2"></i>
                {current_clinic ? current_clinic + ' Clinic' : current_ward? current_ward + ' Ward' : "Clinic"} 
                </Link>
            </div>
            ) : 
                <span className="badge rounded-pill bg-info text-white px-3 py-2 d-flex align-items-center">
                    <i className="ri-error-warning-line me-2"></i>
                    No active visit at the moment
                </span>
            }

          <div className="card-body d-flex justify-content-between align-items-start flex-wrap">
            {/* Patient Bio */}
            <div>
              <h4 className="fw-bold mb-1">
                <i className="ri-account-circle-line text-primary me-2"></i>
                {patient.user_info.fullname} | &nbsp;
                <span className="text-muted small mb-1">
                  PID: <span className="fw-semibold">{patient.id}</span>
                </span>
              </h4>
              <div className="d-flex flex-wrap gap-4 small">
                <div>
                  <i className="ri-user-line text-primary me-1"></i>
                  Gender:{" "}
                  <span className="fw-semibold">
                    {patient.user_info.gender?.title || "—"}
                  </span>
                </div>
                <div>
                  <i className="ri-calendar-line text-primary me-1"></i>
                  Age: <span className="fw-semibold">{patient.age || "—"}</span>
                </div>
                <div>
                  <i className="ri-phone-line text-primary me-1"></i>
                  Phone:{" "}
                  <span className="fw-semibold">{patient.phone || "—"}</span>
                </div>
                <div>
                  <i className="ri-contrast-drop-2-line text-primary me-1"></i>
                  Blood:{" "}
                  <span className="fw-semibold">
                    {patient.blood_type || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Patient Photo */}
            <img
              src={patient.photo || "/assets/images/patient2.png"}
              className="rounded-circle border border-primary border-2"
              alt="Patient"
              style={{ width: "50px", height: "50px", objectFit: "cover" }}
            />
          </div>

          <hr className="my-2" />

          {/* Diagnosis + Vitals */}
          <div className="card-body pt-2">
            <div className="row">
              <div className="col-md-6 mb-3">
                <h6 className="fw-bold">
                  <i className="ri-heart-pulse-line text-danger me-2"></i>
                  Latest Diagnosis
                </h6>
                <p className="mb-0">
                  {vitals.length && vitals[0].diagnosis
                    ? vitals[0].diagnosis
                    : "No recent diagnosis"}
                </p>
              </div>

              <div className="col-md-6">
                <h6 className="fw-bold">
                  <i className="ri-health-book-line text-success me-2"></i>
                  Latest Vitals
                </h6>
                <div className="d-flex flex-wrap">{vitalsBadges()}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="card-footer bg-light border-0 small">
            <div className="d-flex flex-wrap gap-4">
              <div>
                <i className="ri-stethoscope-line text-primary me-1"></i>
                Doctor:{" "}
                <span className="fw-semibold text-primary">
                  {patient.doctor || "—"}
                </span>
              </div>
              <div>
                <i className="ri-building-2-line text-primary me-1"></i>
                Last Visit:{" "}
                <span className="fw-semibold text-primary">
                  {patient.last_visit || "—"}
                </span>
              </div>
              <div>
                <i className="ri-calendar-event-line text-primary me-1"></i>
                Next Visit:{" "}
                <span className="fw-semibold text-primary">
                  {patient.next_visit || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientOverview;
