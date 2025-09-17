// folderComponents/PatientServices.jsx
import React, { useState } from "react";

const PatientServices = () => {
  const [search, setSearch] = useState("");

  // Example services data
  const services = [
    { date: "01/08/2024", type: "Lab", name: "Blood Test", status: "Completed" },
    { date: "03/08/2024", type: "Radiology", name: "Chest X-Ray", status: "Completed" },
    { date: "05/08/2024", type: "Procedure", name: "Wound Dressing", status: "Ongoing" },
    { date: "08/08/2024", type: "Lab", name: "Urinalysis", status: "Pending" },
  ];

  const filtered = services.filter(
    (s) =>
      s.date.includes(search) ||
      s.type.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  const getBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-success";
      case "Pending":
        return "bg-warning text-dark";
      case "Ongoing":
        return "bg-info text-dark";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center border-0">
        <h5 className="mb-0 fw-bold">🏥 Medical Services</h5>
        <button 
          className="btn btn-sm btn-primary d-flex align-items-center"
        >
          <i className="ri-add-line me-1"></i> New Medical Service
        </button>
        <input
          type="text"
          placeholder="Search services..."
          className="form-control form-control-sm w-25"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table align-middle table-hover">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Service</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr key={idx}>
                  <td>{s.date}</td>
                  <td>
                    <span className="badge bg-primary">{s.type}</span>
                  </td>
                  <td>{s.name}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(s.status)}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-muted text-center py-3">No services found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientServices;
