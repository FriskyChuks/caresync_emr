import React, { useState, useEffect, useMemo } from "react";
import { RiEditBoxLine, RiEyeLine } from 'react-icons/ri';
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";
import { useMessage } from "../../context/MessageProvider";
import ReusableModal from "../../components/common/ReusableModal";



// 1. Success Message Component (Self-dismissing)
const SuccessMessage = ({ message, setMessage }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000); // Message disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);

  if (!message) return null;

  return (
    <div className="alert alert-success alert-dismissible fade show" role="alert">
      {message}
      <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
    </div>
  );
};


export const TestResultViewer = ({ request, allTests, users, onClose, allResults }) => {

    const results = useMemo(() => {
        if (!allResults || !request?.id) {
            return [];
        }
        return allResults.filter(result => result.test_request === request.id);
    }, [allResults, request.id]);

    const patient = users.find(u => u.id === request.patient);
    const patientName = patient ? `${patient.user?.first_name || ""} ${patient.user?.last_name || ""}`.trim() : "Unknown";

    const pickReferenceRange = (ranges = []) => {
      if (!ranges || ranges.length === 0) return null;
      const anyAny = ranges.find(
        r => (r.gender === 'Any' || !r.gender) &&
            (r.category === 'Any' || (!r.age_min && !r.age_max))
      );
      return anyAny || ranges[0];
    };

    const formatRangeLabel = (rr) => rr ? rr.reference_ranges : '—';

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Test Results for: {patientName}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {results.length === 0 && <p>No results found for this request.</p>}
                        
                        {results.length > 0 && results.map(result => {
                            const testDetails = allTests.find(t => t.id === result.test);
                            return (
                                // This display logic from the previous answer is correct
                                <div key={result.id} className="mb-4 p-3 border rounded">
                                    <h4 className="mb-3 border-bottom pb-2">{testDetails?.name}</h4>
                                    
                                    {result.sub_test_results && result.sub_test_results.length > 0 ? (
                                        <ul className="list-group">
                                            {result.sub_test_results.map(subResult => (
                                                <li key={subResult.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{subResult.sub_test_name}:</strong>
                                                        <span className="ms-2 fw-bold">{subResult.result_value}</span>
                                                    </div>
                                                    {subResult.reference_range && (
                                                         <span className="badge bg-secondary">{subResult.reference_range.reference_ranges}</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>Result:</strong>
                                                <span className="ms-2 fw-bold">{result.result_value}</span>
                                            </div>
                                            {result.reference_range && (
                                                <span className="badge bg-secondary">{result.reference_range.reference_ranges}</span>
                                            )}
                                        </div>
                                    )}
                                    {result.remark && <p className="mt-2 mb-0 fst-italic"><strong>Remark:</strong> {result.remark}</p>}
                                </div>
                            );
                        })}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const RequestTable = ({ requests, users, allTests, onActionClick, actionType, startIndex }) => (
  <div className="table-responsive">
    <table id="hideSearchExample" className="table m-0 align-middle">
      <thead className="table-dark">
        <tr>
          <th>S/N</th>
          <th>Patient</th>
          <th>Tests</th>
          <th>Requested By</th>
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
              {(() => {
                const u = users.find(x => x.id === req.patient);
                return u ? `${u.user?.first_name} ${u.user?.last_name}` : req.patient;
              })()}
            </td>
            <td>
              {req.tests?.map(tid => allTests.find(x => x.id === tid)?.name || tid).join(", ") || ""}
            </td>
            <td>
              {(() => {
                const u = users.find(x => x.id === req.requested_by);
                return u ? `${u.user?.first_name} ${u.user?.last_name}` : req.requested_by;
              })()}
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
                  <RiEditBoxLine />
                </button>
              ) : (
                <button className="btn btn-outline-info btn-sm" onClick={() => onActionClick(req)} title="View Results">
                  <RiEyeLine />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav>
            <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>Previous</button>
                </li>
                {pageNumbers.map(number => (
                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(number)}>{number}</button>
                    </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>Next</button>
                </li>
            </ul>
        </nav>
    );
}
const TestResultEntryPage = ({ request, allTests, users, onSubmit, onBack, baseURL }) => {
  const [resultValues, setResultValues] = useState({});
  const [remarkValues, setRemarkValues] = useState({});
  const [extraFields, setExtraFields] = useState({});
  const [validatedBy, setValidatedBy] = useState("");
  const [message, setMessage] = useState("");

  const patient = users.find((u) => u.id === request.patient);
  const patientName = patient
    ? `${patient.user?.first_name || ""} ${patient.user?.last_name || ""}`.trim()
    : "Unknown Patient";

  const requestedBy = users.find((u) => u.id === request.requested_by);
  const requestedByName = requestedBy
    ? `${requestedBy.user?.first_name || ""} ${requestedBy.user?.last_name || ""}`.trim()
    : "Unknown requestedBy";

  const handleResultChange = (id, value) =>
    setResultValues((prev) => ({ ...prev, [id]: value }));

  const handleRemarkChange = (id, value) =>
    setRemarkValues((prev) => ({ ...prev, [id]: value }));

  const handleExtraFieldChange = (id, fieldName, isChecked) => {
    setExtraFields((prev) => ({
      ...prev,
      [id]: { ...prev[id], [fieldName]: isChecked },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatedBy) {
      setMessage("Please select a user for 'Validated By'.");
      return;
    }
    onSubmit(request, resultValues, remarkValues, extraFields, validatedBy);
  };

  return (
    <div className="card row">
      {/* Patient Info */}
      <div className="row gx-4">
        <div className="col-sm-12">
          <div className="card mb-4">
            <div className="card-body d-flex">
              <div className="d-flex align-items-center flex-wrap gap-4">
                <div className="d-flex align-items-center">
                  <div className="icon-box lg bg-primary-subtle rounded-5 me-2">
                    <i className="ri-account-circle-line fs-3 text-primary"></i>
                  </div>
                  <div>
                    <h4 className="mb-1">{patientName}</h4>
                    <p className="m-0">Name</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="icon-box lg bg-primary-subtle rounded-5 me-2">
                    <i className="ri-women-line fs-3 text-primary"></i>
                  </div>
                  <div>
                    <h4 className="mb-1">Male</h4>
                    <p className="m-0">Gender</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="icon-box lg bg-primary-subtle rounded-5 me-2">
                    <i className="ri-arrow-right-up-line fs-3 text-primary"></i>
                  </div>
                  <div>
                    <h4 className="mb-1">26</h4>
                    <p className="m-0">Age</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="icon-box lg bg-primary-subtle rounded-5 me-2">
                    <i className="ri-contrast-drop-2-line fs-3 text-primary"></i>
                  </div>
                  <div>
                    <h4 className="mb-1">B+</h4>
                    <p className="m-0">Blood Type</p>
                  </div>
                </div>
              </div>
              <img
                src="assets/images/patient5.png"
                className="img-7x rounded-circle border border-primary border-2 ms-auto"
                alt="Patient"
              />
            </div>
            <div className="card-footer d-flex flex-wrap gap-3">
              <div className="d-flex align-items-center">
                <div className="icon-box sm bg-primary-subtle rounded-5 me-2">
                  <i className="ri-stethoscope-line fs-5 text-primary"></i>
                </div>
                <div>
                  Consulting Doctor:{" "}
                  <span className="text-primary">{requestedByName}</span>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div className="icon-box sm bg-primary-subtle rounded-5 me-2">
                  <i className="ri-building-2-line fs-5 text-primary"></i>
                </div>
                <div>
                  Recent Visit: <span className="text-primary">10/01/2025</span>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div className="icon-box sm bg-primary-subtle rounded-5 me-2">
                  <i className="ri-calendar-2-line fs-5 text-primary"></i>
                </div>
                <div>
                  Upcoming Visit:{" "}
                  <span className="text-primary">10/09/2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="card-header d-flex justify-content-between align-items-center">
        <button onClick={onBack} className="btn btn-outline-secondary">
          <i className="ri-arrow-left-circle-line display-3"></i>
        </button>
        <div className="text-center">
          <h5 className="mb-0">Enter Lab Results</h5>
        </div>
      </div>

      {/* Form */}
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {request.tests.map((testId) => {
            const testDetails = allTests.find((t) => t.id === testId);
            if (!testDetails)
              return <p key={testId}>Error: Test not found.</p>;

            const isSimpleTest =
              !testDetails.sub_tests || testDetails.sub_tests.length === 0;

            const subTestsToShow = isSimpleTest
              ? []
              : testDetails.sub_tests.filter((subtest) =>
                  request.sub_tests?.includes(subtest.id)
                );

            return (
              <div key={testId} className="mb-3 p-3 border rounded shadow-sm">
                <h4 className="mb-2 border-bottom pb-2">{testDetails.name}</h4>

                {/* Subtests */}
                <div className="row">
                  {subTestsToShow.map((subtest) => (
                    <div key={subtest.id} className="mb-3 col-md-4">
                      <label className="form-label fw-bold">
                        {subtest.parameter_name}
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Result"
                        value={resultValues[subtest.id] || ""}
                        onChange={(e) =>
                          handleResultChange(subtest.id, e.target.value)
                        }
                      />
                      {/* Reference Ranges per line */}
                      {subtest.reference_ranges &&
                        subtest.reference_ranges.length > 0 && (
                          <div className="mt-2 p-2 bg-light border rounded small text-muted">
                            {subtest.reference_ranges.map((r) => (
                              <div key={r.id}>
                                <strong>{r.gender}</strong> {r.age_min}-{r.age_max} yrs →{" "}
                                {r.range_value}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}

                  {/* Simple Test (no subtests) */}
                  {isSimpleTest && (
                    <div className="mb-3 col-md-4">
                      <label className="form-label fw-bold">
                        {testDetails.name}
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Result"
                        value={resultValues[testId] || ""}
                        onChange={(e) =>
                          handleResultChange(testId, e.target.value)
                        }
                      />
                      {/* Reference Ranges per line */}
                      {testDetails.reference_ranges &&
                        testDetails.reference_ranges.length > 0 && (
                          <div className="mt-2 p-2 bg-light border rounded small text-muted">
                            {testDetails.reference_ranges.map((r) => (
                              <div key={r.id}>
                                <strong>{r.gender}</strong> {r.age_min}-{r.age_max} yrs →{" "}
                                {r.range_value}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Remarks */}
                {testDetails.requires_remark && (
                  <div className="mt-2">
                    <label
                      htmlFor={`remark-${testId}`}
                      className="form-label fw-bold"
                    >
                      Remark for {testDetails.name}
                    </label>
                    <textarea
                      id={`remark-${testId}`}
                      className="form-control"
                      rows="2"
                      value={remarkValues[testId] || ""}
                      onChange={(e) =>
                        handleRemarkChange(testId, e.target.value)
                      }
                    ></textarea>
                  </div>
                )}

                {/* Extra Fields */}
                <div className="mt-3 d-flex gap-4">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`critical-${testId}`}
                      onChange={(e) =>
                        handleExtraFieldChange(
                          testId,
                          "is_critical",
                          e.target.checked
                        )
                      }
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`critical-${testId}`}
                    >
                      Is Critical
                    </label>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`retest-${testId}`}
                      onChange={(e) =>
                        handleExtraFieldChange(
                          testId,
                          "needs_retest",
                          e.target.checked
                        )
                      }
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`retest-${testId}`}
                    >
                      Needs Retest
                    </label>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Validated By */}
          <div className="mt-4">
            <label className="form-label fw-bold">Validated By</label>
            <select
              className="form-select"
              value={validatedBy}
              onChange={(e) => setValidatedBy(e.target.value)}
              required
            >
              <option value="" disabled>
                Select user...
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {`${u.user?.first_name || ""} ${u.user?.last_name || ""}`}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {message && <p className="text-danger mt-2">{message}</p>}

          {/* Submit */}
          <div className="d-flex justify-content-end mt-4">
            <button type="submit" className="btn btn-primary btn-lg">
              Submit All Results
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
const LabTestResult = () => {
  const { pid } = useParams();
  const { user } = useAuth();
  const { showMessage } = useMessage();
  const [currentView, setCurrentView] = useState("list"); // 'list' or 'edit'
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' or 'completed'
  

  // Fetch patient
  const fetchPatient = async () => {
    try {
      const res = await axiosInstance.get(`/patientsapi/patient_detail/${pid}/`);
      setPatient(res.data);
    } catch (err) {
      console.error("Error fetching patient", err);
      showMessage("Failed to fetch patient information.", "danger");
    }
  };
  // const [users, setUsers] = useState([]);
  const [submittedRequests, setSubmittedRequests] = useState([]);
  const [allTests, setAllTests] = useState([]);
  const [allResults, setAllResults] = useState([]);

  const [editingRequest, setEditingRequest] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


   // Fetch units and tests
  const fetchData = async () => {
    setLoading(true);
    try {
      const [testsRes, requestsRes, resultsRes] = await Promise.all([
        axiosInstance.get("/labapi/tests/create/"),
        axiosInstance.get("/labapi/test-requests/"),
        axiosInstance.get("/labapi/lab-results/"),
      ]);
      setUnits(unitsRes.data);
      setTests(testsRes.data);
      setAllTests(testsRes.data);
      setSubmittedRequests(requestsRes.data);
      setAllResults(resultsRes.data);
      if (unitsRes.data.length > 0) setSelectedUnit(unitsRes.data[0].id);
    } catch (err) {
      console.error("Error fetching lab data", err);
      showMessage("Failed to fetch lab units or tests.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
    fetchData();
  }, [pid]);

  const { pendingRequests, completedRequests } = useMemo(() => {
    const filtered = submittedRequests
      .filter(req => {
        const patient = users.find(u => u.id === req.patient);
        const patientName = patient ? `${patient.user?.first_name} ${patient.user?.last_name}` : "";
        return patientName.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => new Date(b.request_date) - new Date(a.request_date));

    return {
      pendingRequests: filtered.filter(req => req.status === 'pending'),
      completedRequests: filtered.filter(req => req.status === 'completed'),
    };
  }, [submittedRequests, users, searchTerm]);

  const activeList = activeTab === 'pending' ? pendingRequests : completedRequests;
  const totalPages = Math.ceil(activeList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activeList.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page on tab switch
  };

  const handleEditClick = (request) => {
    setEditingRequest(request);
    setCurrentView("edit");
  };

  const handleViewClick = (request) => {
    setViewingRequest(request);
  };
  
  const handleBackToList = () => {
    setEditingRequest(null);
    setCurrentView("list");
    setSubmitError("");
  };

  const handleUpdateResults = async (request, results, remarks, extraFields, validatedBy) => {
    setSubmitError("");
    setSuccessMessage("");

    // Make sure a user was selected from the dropdown
    if (!validatedBy) {
        setSubmitError("Please select a user from the 'Validated By' dropdown.");
        return;
    }

    try {
        const resultPromises = request.tests.map(async (testId) => {
            const testDetails = allTests.find(t => t.id === testId);
            const isSimple = !testDetails.sub_tests || testDetails.sub_tests.length === 0;
            
            const labResultPayload = {
                test_request: request.id,
                test: testId,
                remark: remarks[testId] || null,
                // validated_by: validatedBy,
                is_critical: extraFields[testId]?.is_critical || false,
                needs_retest: extraFields[testId]?.needs_retest || false,
                result_value: isSimple ? (results[testId] || "---") : "See Sub-tests",
                sub_test_results: []
            };

            if (!isSimple) {
                const requestedSubTests = testDetails.sub_tests.filter(st => request.sub_tests.includes(st.id));
                labResultPayload.sub_test_results = requestedSubTests.map(sub => ({
                    sub_test: sub.id,
                    result_value: results[sub.id] || "",
                }));
            }

            const res = await axiosInstance.post("/labapi/test-requests/", payload);
                showMessage("Lab test request submitted successfully!", "success");
                setSelectedItems({});
                setShowConfirm(false);
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ detail: `Server returned status ${res.status}` }));
                throw new Error(JSON.stringify(errorData));
            }

            return res.json();
        });

        await Promise.all(resultPromises);

        await fetch(`${baseURL}/labapi/test-requests/${request.id}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "completed" })
        });
        
        const updatedRequests = await fetch(`${baseURL}/labapi/test-requests/`).then(r => r.json());
        const updatedResults = await fetch(`${baseURL}/labapi/lab-results/`).then(r => r.json());
        
        setSubmittedRequests(updatedRequests);
        setAllResults(updatedResults); // Update the state with the newly created results
        setSuccessMessage("Test results submitted successfully!");
        handleBackToList();
        setActiveTab('completed');

    } catch (err) {
        console.error("Error during result submission:", err);
        setSubmitError(`Submission Failed: ${err.message}`);
    }
};
  if (currentView === 'edit') {
    return <TestResultEntryPage
        request={editingRequest}
        allTests={allTests}
        users={users}
        onSubmit={handleUpdateResults}
        onBack={handleBackToList}
        baseURL={baseURL}
    />;
  }

  return (
    <div className="container-fluid mt-4">
      
      <div className="card">
        <div className="card-header">
          <div className="custom-tabs-container mb-3">
            <ul className="nav nav-tabs" id="customTab2" role="tablist">
              <li className="nav-item" role="presentation">
                <a 
                    className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`} 
                    onClick={() => handleTabChange('pending')}
                    id="tab-oneA" data-bs-toggle="tab" role="tab"
                    aria-controls="oneA" aria-selected="true"
                >
                      <i className="ri-folder-unknow-line"></i>
                      Pending ({pendingRequests.length})
                </a>
              </li>
              <li>
                <a 
                    className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`} 
                    id="tab-twoA" data-bs-toggle="tab" role="tab"
                    onClick={() => handleTabChange('completed')}
                    aria-controls="twoA" aria-selected="true"
                >
                    <i className="ri-folder-check-line"></i> Completed ({completedRequests.length})
                </a>
              </li>
              
            </ul>
          </div>
          <h5 className="card-title my-3">Lab Test Results</h5>
        </div>
        <div className="card-body">
          <SuccessMessage message={successMessage} setMessage={setSuccessMessage} />
          
          

          <div className="mt-3">
             <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            {loading ? <p>Loading...</p> : (
                currentItems.length > 0 ? (
                    <>
                        <RequestTable
                            requests={currentItems}
                            users={users}
                            allTests={allTests}
                            onActionClick={activeTab === 'pending' ? handleEditClick : handleViewClick}
                            actionType={activeTab === 'pending' ? 'edit' : 'view'}
                            startIndex={indexOfFirstItem}
                        />
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : (
                    <p className="text-muted">No {activeTab} requests found.</p>
                )
            )}
          </div>
        </div>
      </div>
       {viewingRequest && (
        <TestResultViewer
          request={viewingRequest}
          allTests={allTests}
          users={users}
          onClose={() => setViewingRequest(null)}
          allResults={allResults}
        />
      )}
    </div>
  );
};

export default LabTestResult;