import React, { useState } from "react";

const PatientPharmacy = () => {
  const [search, setSearch] = useState("");

  const drugs = [
    { name: "Paracetamol", qty: "20 tabs", date: "28/08/2024", status: "Dispensed" },
    { name: "Amoxicillin", qty: "10 caps", date: "08/09/2024", status: "Pending" },
  ];

  const filtered = drugs.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.date.includes(search) ||
      d.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center border-0">
        <h5 className="mb-0 fw-bold">Pharmacy</h5>
        <button 
          className="btn btn-sm btn-primary d-flex align-items-center"
        >
          <i className="ri-add-line me-1"></i> New Pharmacy Request
        </button>
        <input
          type="text"
          placeholder="Search drugs..."
          className="form-control form-control-sm w-25"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="card-body">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Drug</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, idx) => (
              <tr key={idx}>
                <td>{d.date}</td>
                <td>{d.name}</td>
                <td>{d.qty}</td>
                <td>
                  <span
                    className={`badge ${
                      d.status === "Dispensed" ? "bg-success" : "bg-warning"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-muted">No records found.</p>}
      </div>
    </div>
  );
};

export default PatientPharmacy;
