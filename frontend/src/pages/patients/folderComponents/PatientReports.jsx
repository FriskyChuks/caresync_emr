import React from "react";

const PatientReports = () => {
  const reports = [
    { id: "RPT001", type: "Lab Test", date: "20/08/2024", status: "Available" },
    { id: "RPT002", type: "X-Ray", date: "25/08/2024", status: "Pending" },
  ];

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white border-0">
        <h5 className="mb-0 fw-bold">Reports</h5>
      </div>
      <div className="card-body">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Report ID</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, idx) => (
              <tr key={idx}>
                <td>{r.id}</td>
                <td>{r.type}</td>
                <td>{r.date}</td>
                <td>
                  <span
                    className={`badge ${
                      r.status === "Available" ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientReports;
