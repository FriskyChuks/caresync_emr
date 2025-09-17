import React from "react";

const PatientEncounterRoute = () => {
  const encounters = [
    { date: "01/08/2024", clinic: "Registration", action: "First registration", type: "registration" },
    { date: "15/08/2024", clinic: "GOPD", action: "Consultation", type: "consultation" },
    { date: "20/08/2024", clinic: "Lab", action: "Blood Test", type: "lab" },
    { date: "28/08/2024", clinic: "Pharmacy", action: "Drugs Dispensed", type: "pharmacy" },
  ];

  const typeStyles = {
    registration: { icon: "ri-user-add-line", badge: "bg-primary" },
    consultation: { icon: "ri-stethoscope-line", badge: "bg-success" },
    lab: { icon: "ri-flask-line", badge: "bg-warning text-dark" },
    pharmacy: { icon: "ri-capsule-line", badge: "bg-info text-dark" },
    default: { icon: "ri-hospital-line", badge: "bg-secondary" },
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white border-0">
        <h5 className="mb-0 fw-bold">🧭 Encounter Route</h5>
      </div>
      <div className="card-body">
        <div className="d-flex flex-wrap align-items-center gap-4">
          {encounters.map((e, idx) => {
            const style = typeStyles[e.type] || typeStyles.default;
            return (
              <div key={idx} className="d-flex align-items-center">
                {/* Node */}
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${style.badge}`}
                  style={{ width: "45px", height: "45px" }}
                >
                  <i className={`${style.icon} text-white fs-5`}></i>
                </div>

                {/* Text */}
                <div className="ms-2">
                  <strong>{e.clinic}</strong>
                  <p className="small text-muted mb-0">{e.date}</p>
                </div>

                {/* Arrow (except last) */}
                {idx < encounters.length - 1 && (
                  <i className="ri-arrow-right-line mx-3 text-muted fs-4"></i>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PatientEncounterRoute;
