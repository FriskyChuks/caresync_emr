import React, { useState, useEffect, useCallback } from "react";
import ReferenceRangeInput from "./ReferenceRangeInput__";
import { useParams } from "react-router-dom";
import { useMessage } from "../../context/MessageProvider";

const TestResultEntry = ({
  request,
  allTests,
  onSubmit,
  onBack,
  user, // logged-in user from useAuth
}) => {
  const [resultValues, setResultValues] = useState({});
  const [remarkValues, setRemarkValues] = useState({});
  const [extraFields, setExtraFields] = useState({});
  const [message, setMessage] = useState("");
  const [selectedRanges, setSelectedRanges] = useState({});
  const { showMessage } = useMessage();
  const { pid } = useParams();

  useEffect(() => {
    if (user?.id) {
      console.log("Validated by user:", user.id);
    }
  }, [user, pid]);

  const handleRangeChange = useCallback((id, value) => {
    setSelectedRanges((prev) => ({ ...prev, [id]: value }));
  }, []);

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
    if (!user?.id) {
      showMessage("No logged-in user found for validation.", "danger");
      return;
    }
    onSubmit(request, resultValues, remarkValues, extraFields, user.id, selectedRanges);
  };

  // ✅ Properly access nested patient and doctor info from serializer
  const patientName = request?.patient?.name || "Unknown Patient";
  const requestedByName =
    request?.requested_by?.full_name ||
    request?.requested_by?.username ||
    "Unknown Doctor";

  return (
    <div className="card row">
      {/* Header */}
      <div className="card-header d-flex justify-content-between align-items-center">
        <button onClick={onBack} className="btn btn-outline-secondary">
          <i className="ri-arrow-left-fill"></i>
        </button>
        <div className="text-center">
          <h5 className="mb-0">Enter Lab Results</h5>
          <small className="text-muted d-block">
            {patientName} — Requested by {requestedByName}
          </small>
        </div>
      </div>

      {/* Form */}
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* ✅ Fixed test mapping */}
          {request.tests.map((testObj) => {
            const testDetails = allTests.find((t) => t.id === testObj.id) || testObj;

            if (!testDetails)
              return <p key={testObj.id}>Error: Test not found.</p>;

            const isSimpleTest =
              !testDetails.sub_tests || testDetails.sub_tests.length === 0;

            // ✅ Fixed subtest filtering logic
            const subTestsToShow = isSimpleTest
              ? []
              : testDetails.sub_tests.filter((subtest) =>
                  request.sub_tests?.some((s) => s.id === subtest.id)
                );

            return (
              <div key={testDetails.id} className="mb-3 p-3 border rounded shadow-sm">
                <h4 className="mb-2 border-bottom pb-2">{testDetails.name}</h4>
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
                      <ReferenceRangeInput
                        testItem={subtest}
                        selectedValue={selectedRanges[subtest.id]}
                        onChange={handleRangeChange}
                      />
                    </div>
                  ))}

                  {isSimpleTest && (
                    <div className="mb-3 col-md-4">
                      <label className="form-label fw-bold">
                        {testDetails.name}
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Result"
                        value={resultValues[testDetails.id] || ""}
                        onChange={(e) =>
                          handleResultChange(testDetails.id, e.target.value)
                        }
                      />
                      <ReferenceRangeInput
                        testItem={testDetails}
                        selectedValue={selectedRanges[testDetails.id]}
                        onChange={handleRangeChange}
                      />
                    </div>
                  )}
                </div>

                {isSimpleTest && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Remarks</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter Remarks (optional)"
                      value={remarkValues[testDetails.id] || ""}
                      onChange={(e) =>
                        handleRemarkChange(testDetails.id, e.target.value)
                      }
                    />
                  </div>
                )}

                <div className="mt-3 d-flex gap-4">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`critical-${testDetails.id}`}
                      checked={extraFields[testDetails.id]?.is_critical || false}
                      onChange={(e) =>
                        handleExtraFieldChange(
                          testDetails.id,
                          "is_critical",
                          e.target.checked
                        )
                      }
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`critical-${testDetails.id}`}
                    >
                      Is Critical
                    </label>
                  </div>

                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`retest-${testDetails.id}`}
                      checked={extraFields[testDetails.id]?.needs_retest || false}
                      onChange={(e) =>
                        handleExtraFieldChange(
                          testDetails.id,
                          "needs_retest",
                          e.target.checked
                        )
                      }
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`retest-${testDetails.id}`}
                    >
                      Needs Retest
                    </label>
                  </div>
                </div>
              </div>
            );
          })}

          {message && <p className="text-danger mt-2">{message}</p>}

          <div className="d-flex justify-content-end mt-4">
            <button type="submit" className="btn btn-outline-primary rounded-5">
              Submit All Results
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestResultEntry;
