import React, { useState } from "react";

const PatientVisits = () => {
  const [search, setSearch] = useState("");

  const visits = [
    { date: "28/08/2024", doctor: "Dr. Elina", reason: "Check-up", status: "Completed" },
    { date: "08/09/2024", doctor: "Dr. Mark", reason: "Follow-up", status: "Scheduled" },
  ];

  const filtered = visits.filter(
    (v) =>
      v.date.includes(search) ||
      v.doctor.toLowerCase().includes(search.toLowerCase()) ||
      v.reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center border-0">
        <h5 className="mb-0 fw-bold">Visits</h5>
        <input
          type="text"
          placeholder="Search visits..."
          className="form-control form-control-sm w-25"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="card-body">
        <table className="table align-middle table-hover">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Doctor</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, idx) => (
              <tr key={idx}>
                <td>{v.date}</td>
                <td>{v.doctor}</td>
                <td>{v.reason}</td>
                <td>
                  <span
                    className={`badge ${
                      v.status === "Completed" ? "bg-success" : "bg-warning"
                    }`}
                  >
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-muted">No visits found.</p>}
      </div>
    </div>
  );
};

export default PatientVisits;
