import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";
import { useMessage } from "../../context/MessageProvider";
import ReusableModal from "../../components/common/ReusableModal";

const LabTestRequest = () => {
  const { pid } = useParams();
  const { user } = useAuth();
  const { showMessage } = useMessage();

  const [units, setUnits] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

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

  // Fetch units and tests
  const fetchData = async () => {
    setLoading(true);
    try {
      const [unitsRes, testsRes] = await Promise.all([
        axiosInstance.get("/labapi/lab-units/"),
        axiosInstance.get("/labapi/tests/create/"),
      ]);
      setUnits(unitsRes.data);
      setTests(testsRes.data);
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

  // Toggle selection of test or subtest
const toggleSelection = (type, parentId, item) => {
  setSelectedItems((prev) => {
    const updated = { ...prev };

    if (type === "test") {
      const key = `test-${item.id}`;

      if (updated[key]) {
        // Test unchecked → remove test and all its subtests
        delete updated[key];
        if (item.is_complex && item.sub_tests) {
          item.sub_tests.forEach((st) => delete updated[`subtest-${st.id}`]);
        }
      } else {
        // Test checked
        updated[key] = { ...item, type, parentId };

        if (item.is_complex && item.sub_tests) {
          // Select all its subtests
          item.sub_tests.forEach((st) => {
            updated[`subtest-${st.id}`] = { ...st, type: "subtest", parentId: item.id };
          });
        }
      }
    } else if (type === "subtest") {
      const key = `subtest-${item.id}`;

      if (updated[key]) {
        // Subtest unchecked
        delete updated[key];
      } else {
        // Subtest checked
        updated[key] = { ...item, type: "subtest", parentId };
      }

      // Make sure parent test remains checked (for grouping UI)
      const parentKey = `test-${parentId}`;
      if (!updated[parentKey]) {
        const parentTest = tests.find((t) => t.id === parentId);
        if (parentTest) {
          updated[parentKey] = { ...parentTest, type: "test", parentId: null };
        }
      }
    }

    return updated;
  });
};


  // Calculate summary
  const getSummary = () => {
    const summary = {};

    Object.values(selectedItems).forEach((item) => {
      if (item.type === "test" && item.is_complex) {
        if (!summary[item.id]) summary[item.id] = { ...item, subtests: [] };
      } else if (item.type === "subtest") {
        const parent = item.parentId;
        if (!summary[parent]) {
          const parentTest = tests.find((t) => t.id === parent);
          summary[parent] = { ...parentTest, subtests: [] };
        }
        summary[parent].subtests.push(item);
      } else {
        summary[item.id] = { ...item, subtests: [] };
      }
    });

    return Object.values(summary).map((test) => {
      if (test.is_complex && test.sub_tests) {
        const allSelected = test.subtests.length === test.sub_tests.length;
        if (allSelected) {
          // If all subtests selected, display only subtests
          return { ...test, hideMain: true };
        }
      }
      return test;
    });
  };

  // Calculate total price
  const totalPrice = getSummary().reduce((sum, test) => {
    // Only add main test price if not hidden
    const testPrice = !test.hideMain ? Number(test.price) || 0 : 0;
    const subtestsPrice = (test.subtests || []).reduce(
      (s, st) => s + (Number(st.price) || 0),
      0
    );
    return sum + testPrice + subtestsPrice;
  }, 0);

  // Submit handler
const handleSubmit = async () => {
  // Check patient
  if (!patient || !patient.id) {
    showMessage("Patient information is missing.", "danger");
    return;
  }

  // Prepare summary
  const selectedTests = getSummary();
  if (!selectedTests.length) {
    showMessage("Please select at least one test before submitting.", "warning");
    return;
  }

  // Prepare payload
  const payload = {
    patient: Array.isArray(patient) ? patient[0].id : patient.id,
    requested_by: user.id,
    tests: selectedTests.filter((t) => !t.hideMain).map((t) => t.id),
    sub_tests: selectedTests.flatMap((t) => t.subtests.map((st) => st.id)),
  };

  // Log the payload
  console.log(payload);

  try {
    const response = await axiosInstance.post("/labapi/test-requests/", payload);
    showMessage("Lab test request submitted successfully!", "success");
    setSelectedItems({});
    setShowConfirm(false);
  } catch (err) {
    const errors = err.response?.data;

    console.log(errors);

    if (errors) {
      // Convert backend error object to readable string
      const messages = Object.entries(errors)
        .map(([field, msgs]) => {
          if (Array.isArray(msgs)) return `${field}: ${msgs.join(", ")}`;
          return `${field}: ${msgs}`;
        })
        .join(" | ");
      showMessage(`Submission failed: ${messages}`, "danger");
    } else {
      showMessage("Submission failed: Could not connect to server.", "danger");
    }
  }
};

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (!patient) {
    return <div className="alert alert-danger text-center">Patient not found</div>;
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h4 className="fw-bold text-dark">
          Lab Test Request for {patient.user_info?.first_name}{" "}
          {patient.user_info?.last_name} | PID-{patient.id}
        </h4>
      </div>

      <div className="row">
        {/* Left side - Tests */}
        <div className="col-lg-9">
          <div className="card mb-4">
            <div className="d-flex justify-content-center gap-1 flex-wrap p-3">
              {units.length === 0 ? (
                <span className="text-muted">No units found</span>
              ) : (
                units.map((u) => (
                  <button
                    key={u.id}
                    className={`btn btn-sm ${
                      selectedUnit === u.id ? "btn-primary" : "btn-light"
                    }`}
                    onClick={() => setSelectedUnit(u.id)}
                  >
                    {u.name}
                  </button>
                ))
              )}
            </div>

            <div className="card-body">
              {tests.filter((t) => t.lab_unit === selectedUnit).length === 0 ? (
                <p className="text-muted text-center">No tests available in this unit</p>
              ) : (
                <div className="row">
                  {tests
                    .filter((t) => t.lab_unit === selectedUnit)
                    .map((test) => (
                      <div key={test.id} className="col-xl-4 col-sm-6 col-12 mb-3">
                        <div className="card h-100 p-2">
                          <div className="d-flex flex-column">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={!!selectedItems[`test-${test.id}`]}
                                onChange={() =>
                                  toggleSelection("test", null, test)
                                }
                              />
                              <label className="form-check-label fw-semibold">
                                {test.name} — ₦{Number(test.price).toFixed(2)}
                              </label>
                              {test.is_complex && (
                                <span className="badge bg-info ms-2">Complex</span>
                              )}
                            </div>

                            {/* Subtests */}
                            {test.is_complex &&
                              selectedItems[`test-${test.id}`] &&
                              test.sub_tests.length > 0 && (
                                <div className="mt-2 ms-3">
                                  {test.sub_tests.map((st) => (
                                    <div key={st.id} className="form-check small">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={!!selectedItems[`subtest-${st.id}`]}
                                        onChange={() =>
                                          toggleSelection("subtest", test.id, st)
                                        }
                                      />
                                      <label className="form-check-label">
                                        {st.parameter_name} — ₦{Number(st.price).toFixed(2)}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Summary */}
        <div className="col-lg-3">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Summary</h5>
            </div>
            <div className="card-body">
              {Object.keys(selectedItems).length === 0 ? (
                <p className="text-muted">No tests selected</p>
              ) : (
                <ul className="list-unstyled small">
                  {getSummary().map((test) => (
                    <li key={test.id} className="mb-2">
                      {!test.hideMain && (
                        <strong>
                          {test.name} — ₦{Number(test.price).toFixed(2)}
                        </strong>
                      )}
                      {test.subtests.length > 0 && (
                        <ul className="ms-3">
                          {test.subtests.map((st) => (
                            <li key={st.id}>
                              {st.parameter_name} — ₦{Number(st.price).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card-footer">
              <div className="d-flex justify-content-between align-items-center">
                <strong>Total: ₦{Number(totalPrice).toFixed(2)}</strong>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={Object.keys(selectedItems).length === 0}
                  onClick={() => setShowConfirm(true)}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ReusableModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Submission"
      >
        <p>Are you sure you want to submit this lab test request?</p>
        <div className="text-end">
          <button
            className="btn btn-light me-2"
            onClick={() => setShowConfirm(false)}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Yes, Submit
          </button>
        </div>
      </ReusableModal>
    </div>
  );
};

export default LabTestRequest;
