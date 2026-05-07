// components/charts/DrugChart.jsx
import React from 'react';

const DrugChart = ({ drugData = [], patient }) => {
  // Placeholder data structure - you'll replace this with actual prescription data
  const sampleDrugData = [
    { 
      drug: 'Paracetamol', 
      dose: '500mg', 
      frequency: '6 hourly', 
      route: 'Oral',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      status: 'Active'
    },
    { 
      drug: 'Amoxicillin', 
      dose: '250mg', 
      frequency: '8 hourly', 
      route: 'IV',
      startDate: '2024-01-14',
      endDate: '2024-01-21',
      status: 'Active'
    },
  ];

  const data = drugData.length > 0 ? drugData : sampleDrugData;

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="card border-0 bg-light">
          <div className="card-body text-center py-5">
            <i className="ri-capsule-line display-4 text-warning mb-3"></i>
            <h4 className="text-warning">Drug Administration Chart</h4>
            <p className="text-muted mb-3">
              Monitor medication administration schedules and compliance.
            </p>
            <div className="alert alert-warning">
              <i className="ri-information-line me-2"></i>
              Drug chart implementation coming soon. This will integrate with your prescription system.
            </div>
            
            {/* Sample Data Preview */}
            <div className="mt-4">
              <h6 className="fw-semibold mb-3">Sample Medication Schedule</h6>
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Drug</th>
                      <th>Dose</th>
                      <th>Frequency</th>
                      <th>Route</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((med, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">{med.drug}</td>
                        <td>{med.dose}</td>
                        <td>{med.frequency}</td>
                        <td>
                          <span className={`badge ${
                            med.route === 'IV' ? 'bg-danger' : 
                            med.route === 'Oral' ? 'bg-success' : 'bg-secondary'
                          }`}>
                            {med.route}
                          </span>
                        </td>
                        <td>{med.startDate}</td>
                        <td>{med.endDate}</td>
                        <td>
                          <span className={`badge ${
                            med.status === 'Active' ? 'bg-success' : 'bg-secondary'
                          }`}>
                            {med.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugChart;