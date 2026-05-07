import React from 'react';

const RequestTable = ({ requests, users, allTests, onActionClick, actionType, startIndex }) => (
  <div className="table-responsive">
    <table id="hideSearchExample" className="table m-0 align-middle">
      <thead className="table-dark">
        <tr>
          <th>S/N</th>
          <th>Tests</th>
          <th>Status</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((req, index) => (
          <tr key={req.id}>
            <td>{startIndex + index + 1}</td>
            <td>
              {req.tests?.map(tid => allTests.find(x => x.id === tid)?.name || tid).join(", ") || ""}
            </td>
            <td>
              <span className={`badge ${req.status === 'completed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                {req.status}
              </span>
            </td>
            <td>{new Date(req.request_date).toLocaleDateString()}</td>
            <td>
              {actionType === 'edit' ? (
                <button className="btn btn-outline-primary btn-sm" onClick={() => onActionClick(req)} title="Enter Results">
                  <i className="ri-ball-pen-line"></i>
                </button>
              ) : (
                <button className="btn btn-outline-info btn-sm" onClick={() => onActionClick(req)} title="View Results">
                  <i className="ri-eye-line"></i>
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RequestTable;