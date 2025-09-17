import React from "react";

const QuickServicePoints = () => {
  const services = [
    { icon: "ri-flask-line", label: "Lab", link: "#" },
    { icon: "ri-capsule-line", label: "Pharmacy", link: "#" },
    { icon: "ri-hospital-line", label: "Radiology", link: "#" },
    { icon: "ri-stethoscope-line", label: "Consultation", link: "#" },
  ];

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body d-flex gap-4 flex-wrap">
        {services.map((s, idx) => (
          <a
            key={idx}
            href={s.link}
            className="btn btn-light shadow-sm d-flex align-items-center px-3 py-2 rounded-3"
          >
            <i className={`${s.icon} text-primary me-2 fs-5`}></i>
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default QuickServicePoints;
