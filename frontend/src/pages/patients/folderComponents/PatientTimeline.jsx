import React from "react";

const PatientTimeline = () => {
  const timeline = [
    { date: "01/08/2024", event: "Patient Registered", by: "Admin Staff", type: "registration" },
    { date: "15/08/2024", event: "Visited GOPD", by: "Dr. Elina", type: "consultation" },
    { date: "20/08/2024", event: "Lab Test Ordered", by: "Lab Tech", type: "lab" },
    { date: "28/08/2024", event: "Drugs Dispensed", by: "Pharmacy", type: "pharmacy" },
  ];

  const typeStyles = {
    registration: { icon: "ri-user-add-line", badge: "bg-primary" },
    consultation: { icon: "ri-stethoscope-line", badge: "bg-success" },
    lab: { icon: "ri-flask-line", badge: "bg-warning text-dark" },
    pharmacy: { icon: "ri-capsule-line", badge: "bg-info text-dark" },
    default: { icon: "ri-time-line", badge: "bg-secondary" },
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white border-0">
        <h5 className="mb-0 fw-bold">🕒 Patient Timeline</h5>
      </div>
      <div className="card-body">
        <ul className="timeline list-unstyled m-0">
          {timeline.map((t, idx) => {
            const style = typeStyles[t.type] || typeStyles.default;
            return (
              <li key={idx} className="mb-4 d-flex">
                {/* Icon + Line */}
                <div className="d-flex flex-column align-items-center me-3">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center ${style.badge}`}
                    style={{ width: "36px", height: "36px" }}
                  >
                    <i className={`${style.icon} text-white`}></i>
                  </div>
                  {idx < timeline.length - 1 && (
                    <div
                      style={{
                        borderLeft: "2px dashed #dee2e6",
                        height: "100%",
                        marginTop: "4px",
                      }}
                    ></div>
                  )}
                </div>

                {/* Event Card */}
                <div>
                  <h6 className="fw-bold mb-1">
                    {t.event}{" "}
                    <span className={`badge ${style.badge} ms-2`}>
                      {t.type}
                    </span>
                  </h6>
                  <p className="mb-0 small text-muted">
                    {t.date} • {t.by}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PatientTimeline;
