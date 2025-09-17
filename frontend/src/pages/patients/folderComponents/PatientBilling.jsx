import React, { useState } from "react";

const PatientBilling = () => {
  const [search, setSearch] = useState("");

  const bills = [
    { id: "#INV001", date: "01/08/2024", amount: "₦15,000", status: "Paid" },
    { id: "#INV002", date: "25/08/2024", amount: "₦8,500", status: "Unpaid" },
  ];

  const filtered = bills.filter(
    (b) =>
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.date.includes(search) ||
      b.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center border-0">
        <h5 className="mb-0 fw-bold">Billing</h5>
        <input
          type="text"
          placeholder="Search bills..."
          className="form-control form-control-sm w-25"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="card-body">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, idx) => (
              <tr key={idx}>
                <td>{b.id}</td>
                <td>{b.date}</td>
                <td>{b.amount}</td>
                <td>
                  <span
                    className={`badge ${
                      b.status === "Paid" ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-muted">No bills found.</p>}
      </div>
    </div>
  );
};

export default PatientBilling;
