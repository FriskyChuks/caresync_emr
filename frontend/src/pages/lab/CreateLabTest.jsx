import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import VitalsForm from "../triage/VitalsForm"
import { useMessage } from "../../context/MessageProvider";
import useAuth from '../../hooks/useAuth';
import { Link, useParams } from "react-router-dom";

const ViewTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labUnits, setLabUnits] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTest, setSelectedTest] = useState(null);

  const itemsPerPage = 10; // Number of rows per page

  // Fetch all tests from the API when the component mounts
  useEffect(() => {
      axiosInstance.get(`/labapi/lab-units/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setLabUnits(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching tests:", err);
      });

    axiosInstance.get(`/labapi/tests/create/`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        // Sort descending by id
        const sorted = data.sort((a, b) => b.id - a.id);
        setTests(sorted);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching tests:", err);
      });
  }, [baseURL]);

  const getLabUnitName = (id) => {
    const unit = labUnits.find((u) => u.id === id);
    return unit ? unit.name : "---";
  };

  // Filtered tests by search
  const filteredTests = tests.filter((test) => {
    const testNameMatch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
    const subTestMatch = test.sub_tests?.some((st) =>
      st.parameter_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return testNameMatch || subTestMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTests = filteredTests.slice(startIndex, startIndex + itemsPerPage);

  // View button opens modal
  const handleViewTest = (test) => {
    setSelectedTest(test);
    const modal = new window.bootstrap.Modal(document.getElementById("viewModal"));
    modal.show();
  };
  

  const formatPrice = (price) => {
    const num = parseFloat(price || 0);
    return num.toLocaleString("en-NG"); //₦
  };
  
  // Function to calculate price (parent or subtest total)
  const calculatePrice = (test) => {
    if (parseFloat(test.price) > 0) {
      return parseFloat(test.price).toFixed(2);
    }
    if (test.sub_tests?.length > 0) {
      const total = test.sub_tests.reduce((sum, st) => sum + (parseFloat(st.price) || 0), 0);
      return total.toFixed(2);
    }
    return "0.00";
  };

  if (loading) return <p className="text-center mt-4">Loading tests...</p>;
  if (error) return <p className="text-center mt-4 text-danger">Error: {error}</p>;

  return (
    <>
    {/* <div className="card shadow"> */}
      {/* <div className="card-body"> */}
        <h3 className="text-center mb-4">All Lab Tests</h3>

        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by test or subtest..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table id="hideSearchExample" className="table m-0 align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Test</th>
                <th>Unit</th>
                <th>Subtest</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentTests.length > 0 ? (
                currentTests.map((test, idx) => (
                  <tr key={test.id}>
                    <td>{startIndex + idx + 1}</td>
                    <td>{test.name}</td>
                     <td>{getLabUnitName(test.lab_unit)}</td>
                    <td>
                      {test.sub_tests?.length > 0
                        ? test.sub_tests.map((st) => st.parameter_name).join(", ")
                        : "---"}
                    </td>
                    <td>₦{formatPrice(calculatePrice(test))}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => handleViewTest(test)}
                      >
                        <RiEyeLine />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No tests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>
                Previous
              </button>
            </li>
            {[...Array(totalPages)].map((_, idx) => (
              <li
                key={idx}
                className={`page-item ${currentPage === idx + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(idx + 1)}>
                  {idx + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>
                Next
              </button>
            </li>
          </ul>
        </nav>

        {/* Modal */}
        <div className="modal fade" id="viewModal" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Test Details</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                {selectedTest ? (
                  <div>
                    <h5>{selectedTest.name}</h5>
                    <p><strong>Unit:</strong> {selectedTest.lab_unit_name || "---"}</p>
                    <p><strong>Price:</strong> ₦{formatPrice(calculatePrice(selectedTest))}</p>

                    <h6 className="mt-3">Subtests:</h6>
                    {selectedTest.sub_tests?.length > 0 ? (
                      <ul className="list-group mb-3">
                        {selectedTest.sub_tests.map((st, idx) => (
                          <li key={idx} className="list-group-item d-flex justify-content-between">
                            <span>{st.parameter_name}</span>
                            <span className="fw-bold">
                              ₦{formatPrice((parseFloat(st.price) || 0).toFixed(2))}
                            </span>
                          </li>
                        ))}
                        {/* Total Row */}
                        {selectedTest.sub_tests.length > 0 && (
                            <li className="list-group-item d-flex justify-content-between bg-light fw-bold">
                                <span>Total</span>
                                <span>
                                    ₦{formatPrice(selectedTest.sub_tests
                                        .reduce((sum, st) => sum + (parseFloat(st.price) || 0), 0)
                                        .toFixed(2))}
                                </span>
                            </li>
                        )}
                      </ul>
                    ) : (
                      <p>--- No Subtests ---</p>
                    )}
                  </div>
                ) : (
                  <p>No test selected</p>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      {/* </div> */}
    {/* </div> */}
    </>
  );
};



// Your original component for creating a test
const CreateLabTest = () => {
    const [labUnits, setLabUnits] = useState([]);
    const { showMessage } = useMessage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { pid } = useParams();
    const {user} = useAuth()
    const [test, setTest] = useState({
      name: "",
      isComplex: false,
      siUnit: "",
      labUnit: "",
      price: 0,
      isActive: true,
      remark: "",
      requiresRemark: false,
      requiresReferenceRange: true,
    });
    const [subTests, setSubTests] = useState([]);
    const [referenceRanges, setReferenceRanges] = useState([
      { gender: "Any", ageMin: "", ageMax: "", category: "Any", rangeValue: "" },
    ]);
    // const [message, setMessage] = useState("");
  
    useEffect(() => {
        // Fetch Lab Units data from the backend API
        axiosInstance.get('/labapi/lab-units/')   
            .then(response => {
                setLabUnits(response.data)
                // setLoading(false)
            })
            .catch(error => {
                console.error("There was an error fetching the Lab Units!", error)
                // setLoading(false)
            })  
    }, [])
  
    const handleTestChange = (e) => {
      const { name, value, type, checked } = e.target;
      let newValue;
  
      if (type === "checkbox") {
        newValue = checked;
      } else if (type === "number") {
        newValue = parseFloat(value) || 0; // Default to 0 if parsing fails
      } else {
        newValue = value;
      }
  
      setTest((prevTest) => ({
        ...prevTest,
        [name]: newValue,
      }));
    };
  
    // Adds a new sub-test to the state
    const handleAddSubTest = () => {
      setSubTests((prev) => [
        ...prev,
        {
          parameterName: "",
          siUnit: "",
          price: 0, // Add price field for sub-test
          referenceRanges: [ // Each sub-test now has its own reference ranges
            { gender: "Any", ageMin: "", ageMax: "", category: "Any", rangeValue: "" }
          ],
        },
      ]);
    };
  
    // Handles changes within a specific sub-test
    const handleSubTestChange = (index, e) => {
      const { name, value, type } = e.target;
      const updatedSubTests = [...subTests];
      let newValue = value;
      if (type === 'number') {
          newValue = parseFloat(value) || 0;
      }
      updatedSubTests[index] = { ...updatedSubTests[index], [name]: newValue };
      setSubTests(updatedSubTests);
    };
  
    // Removes a sub-test from the list
    const handleRemoveSubTest = (index) => {
      setSubTests((prev) => prev.filter((_, i) => i !== index));
    };
    
    // Adds a new reference range row for a specific sub-test
    const handleAddSubTestReferenceRange = (subtestIndex) => {
      const updatedSubTests = [...subTests];
      updatedSubTests[subtestIndex].referenceRanges.push({
        gender: "Any", ageMin: "", ageMax: "", category: "Any", rangeValue: ""
      });
      setSubTests(updatedSubTests);
    };
    
    // Handles changes in a reference range for a specific sub-test
    const handleSubTestReferenceRangeChange = (subtestIndex, rangeIndex, e) => {
      const { name, value } = e.target;
      const updatedSubTests = [...subTests];
      updatedSubTests[subtestIndex].referenceRanges[rangeIndex] = {
        ...updatedSubTests[subtestIndex].referenceRanges[rangeIndex],
        [name]: value
      };
      setSubTests(updatedSubTests);
    };
  
    // Removes a reference range from a specific sub-test
    const handleRemoveSubTestReferenceRange = (subtestIndex, rangeIndex) => {
      const updatedSubTests = [...subTests];
      updatedSubTests[subtestIndex].referenceRanges = updatedSubTests[subtestIndex].referenceRanges.filter((_, i) => i !== rangeIndex);
      setSubTests(updatedSubTests);
    };
  
  
    // Adds a new reference range for a non-complex test
    const handleAddReferenceRange = () => {
      setReferenceRanges((prev) => [
        ...prev,
        { gender: "Any", ageMin: "", ageMax: "", category: "Any", rangeValue: "" },
      ]);
    };
  
    // Handles changes in the main reference ranges
    const handleReferenceRangeChange = (index, e) => {
      const { name, value } = e.target;
      const updated = [...referenceRanges];
      updated[index] = { ...updated[index], [name]: value };
      setReferenceRanges(updated);
    };
  
    // Removes a reference range for a non-complex test
    const handleRemoveReferenceRange = (index) => {
      setReferenceRanges((prev) => prev.filter((_, i) => i !== index));
    };
  
    // Resets the form to its initial state
    const resetForm = () => {
      setTest({
        name: "",
        isComplex: false,
        siUnit: "",
        labUnit: "",
        price: 0,
        isActive: true,
        remark: "",
        requiresRemark: false,
        requiresReferenceRange: true,
      });
      setSubTests([]);
      setReferenceRanges([
        { gender: "Any", ageMin: "", ageMax: "", category: "Any", rangeValue: "" },
      ]);
    };
  
    // Handles form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      
  
      // Format sub-tests for submission
      const formattedSubTests = subTests.map((sub) => ({
        parameter_name: sub.parameterName,
        si_unit: sub.siUnit,
        price: sub.price, 
        reference_ranges: sub.referenceRanges.map(range => ({
          gender: range.gender,
          age_min: range.ageMin,
          age_max: range.ageMax,
          category: range.category,
          range_value: range.rangeValue,
        })),
      }));
  
      const formattedReferenceRanges = (test.isComplex || !test.requiresReferenceRange) ? [] : referenceRanges.map((range) => ({
      gender: range.gender,
      age_min: range.ageMin,
      age_max: range.ageMax,
      category: range.category,
      range_value: range.rangeValue,
  }));
  
      const submissionData = {
        name: test.name,
        is_complex: test.isComplex,
        si_unit: test.siUnit,
        lab_unit: test.labUnit,
        price: parseFloat(test.price),
        is_active: test.isActive,
        remark: test.remark,
        requires_remark: test.requiresRemark,
        requires_reference_range: test.requiresReferenceRange,
        sub_tests: formattedSubTests,
        reference_ranges: formattedReferenceRanges,
      };
      
      console.log("Data to be sent:", submissionData);
      setLoading(true);
      
      try {
        const res = await axiosInstance.post(`/labapi/tests/create/`, {
          name: test.name,
          is_complex: test.isComplex,
          si_unit: test.siUnit,
          lab_unit: test.labUnit,
          price: parseFloat(test.price),
          is_active: test.isActive,
          remark: test.remark,
          requires_remark: test.requiresRemark,
          requires_reference_range: test.requiresReferenceRange,
          sub_tests: formattedSubTests,
          reference_ranges: formattedReferenceRanges,
        });
        resetForm();
  
      showMessage("Test created successfully!", "success");
    } catch (err) {
      console.error("Error submitting test data:", err);
      showMessage("Error creating test.", "danger");
    } finally {
      setLoading(false);
    }
    };
    
  
    return (
      <>
        <h3 className="text-center mb-4">Create New Test</h3>
        <form onSubmit={handleSubmit}>
          {/* Main Test Fields */}
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label className="form-label">Test Name</label>
              <input type="text" name="name" className="form-control" value={test.name} onChange={handleTestChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">SI Unit</label>
              <input type="text" name="siUnit" className="form-control" value={test.siUnit} onChange={handleTestChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Lab Unit</label>
              <select name="labUnit" className="form-select" value={test.labUnit} onChange={handleTestChange} required>
                <option value="">-- Select Lab Unit --</option>
                {labUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
            {!test.isComplex &&(
              <div className="col-md-3">
                <label className="form-label">Price ₦</label>
                <input type="number" name="price" step="0.01" className="form-control" value={test.price} onChange={handleTestChange} />
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="row g-3 mb-3 form-check form-switch d-flex">
            {[
              { label: "Complex Test", name: "isComplex" },
              { label: "Requires Range", name: "requiresReferenceRange" },
              { label: "Requires Remark", name: "requiresRemark" },
              { label: "Is Active", name: "isActive" },
            ].map((cb) => (
              <div key={cb.name} className="col-md-2 form-check">
                <input type="checkbox" className="form-check-input" name={cb.name} id={cb.name} checked={test[cb.name]} onChange={handleTestChange} />
                <label className="form-check-label" htmlFor={cb.name}>{cb.label}</label>
              </div>
            ))}
          </div>

          {/* Sub-Tests section (only for complex tests) */}
          {test.isComplex && (
            <div className="mb-4 p-3 border rounded bg-light">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Sub-Tests</h5>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddSubTest}>Add Sub-Test</button>
              </div>
              {subTests.map((sub, idx) => (
                <div key={idx} className="p-3 mb-3 border rounded">
                  <div className="row g-3 align-items-end mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Parameter Name</label>
                      <input type="text" name="parameterName" className="form-control" value={sub.parameterName} onChange={(e) => handleSubTestChange(idx, e)} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">SI Unit</label>
                      <input type="text" name="siUnit" className="form-control" value={sub.siUnit} onChange={(e) => handleSubTestChange(idx, e)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Price ₦</label>
                      <input type="number" name="price" step="0.01" className="form-control" value={sub.price} onChange={(e) => handleSubTestChange(idx, e)} />
                    </div>
                    <div className="col-auto">
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveSubTest(idx)}>Remove Sub-Test</button>
                    </div>
                  </div>
                  
                  {/* Reference Ranges for each Sub-Test */}
                  <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6>Reference Ranges for {sub.parameterName || 'Sub-Test'}</h6>
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handleAddSubTestReferenceRange(idx)}>Add Range</button>
                      </div>
                      {sub.referenceRanges.map((range, rangeIdx) => (
                          <div key={rangeIdx} className="row g-2 align-items-end mb-2">
                              <div className="col">
                                  <label className="form-label-sm">Gender</label>
                                  <select name="gender" className="form-select form-select-sm" value={range.gender} onChange={(e) => handleSubTestReferenceRangeChange(idx, rangeIdx, e)}>
                                      <option>Male</option><option>Female</option><option>Any</option>
                                  </select>
                              </div>
                              <div className="col"><label className="form-label-sm">Age Min</label><input type="text" name="ageMin" className="form-control form-control-sm" value={range.ageMin} onChange={(e) => handleSubTestReferenceRangeChange(idx, rangeIdx, e)}/></div>
                              <div className="col"><label className="form-label-sm">Age Max</label><input type="text" name="ageMax" className="form-control form-control-sm" value={range.ageMax} onChange={(e) => handleSubTestReferenceRangeChange(idx, rangeIdx, e)}/></div>
                              <div className="col">
                                  <label className="form-label-sm">Category</label>
                                  <select name="category" className="form-select form-select-sm" value={range.category} onChange={(e) => handleSubTestReferenceRangeChange(idx, rangeIdx, e)}>
                                      <option>Adult</option><option>Child</option><option>Any</option>
                                  </select>
                              </div>
                              <div className="col"><label className="form-label-sm">Range Value</label><input type="text" name="rangeValue" className="form-control form-control-sm" value={range.rangeValue} onChange={(e) => handleSubTestReferenceRangeChange(idx, rangeIdx, e)}/></div>
                              <div className="col-auto"><button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveSubTestReferenceRange(idx, rangeIdx)}>X</button></div>
                          </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reference Ranges section (only for non-complex tests) */}
          {!test.isComplex && test.requiresReferenceRange && (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>Reference Ranges</h5>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddReferenceRange}>Add Range</button>
              </div>
              {referenceRanges.map((range, idx) => (
                <div key={idx} className="row g-3 align-items-end mb-2">
                  <div className="col-md-2"><label className="form-label">Gender</label><select name="gender" className="form-select" value={range.gender} onChange={(e) => handleReferenceRangeChange(idx, e)}><option>Male</option><option>Female</option><option>Any</option></select></div>
                  <div className="col-md-2"><label className="form-label">Age Min</label><input type="text" name="ageMin" className="form-control" value={range.ageMin} onChange={(e) => handleReferenceRangeChange(idx, e)}/></div>
                  <div className="col-md-2"><label className="form-label">Age Max</label><input type="text" name="ageMax" className="form-control" value={range.ageMax} onChange={(e) => handleReferenceRangeChange(idx, e)}/></div>
                  <div className="col-md-2"><label className="form-label">Category</label><select name="category" className="form-select" value={range.category} onChange={(e) => handleReferenceRangeChange(idx, e)}><option>Adult</option><option>Child</option><option>Any</option></select></div>
                  <div className="col-md-2"><label className="form-label">Range Value</label><input type="text" name="rangeValue" className="form-control" value={range.rangeValue} onChange={(e) => handleReferenceRangeChange(idx, e)}/></div>
                  <div className="col-auto"><button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveReferenceRange(idx)}>Remove</button></div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center">
            <button type="submit" className="btn btn-success px-4">Submit Test</button>
          </div>
        </form>
      </>
    );
};


// New Parent Component to manage tabs
const LabTestManager = () => {
    const [activeTab, setActiveTab] = useState("create"); // 'create' or 'view'

    return (
      <div className="row gx-4">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-body">
              <div className="custom-tabs-container">
                  <ul className="nav nav-tabs" id="customTab2" role="tablist">
                      <li className="nav-item" role="presentation">
                          <a 
                              className={`nav-link ${activeTab === 'create' ? 'active' : ''}`} 
                              onClick={() => setActiveTab('create')}
                              id="tab-oneA" data-bs-toggle="tab" role="tab"
                              aria-controls="oneA" aria-selected="true"
                          >
                             <i class="ri-temp-cold-line"></i> Create Test
                          </a>
                      </li>
                      <li className="nav-item">
                        <a 
                            className={`nav-link ${activeTab === 'view' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('view')}
                            id="tab-twoA" data-bs-toggle="tab" role="tab"
                            aria-controls="twoA" aria-selected="true"
                        >
                            <i class="ri-menu-unfold-fill"></i>View Tests
                        </a>
                      </li>
                  </ul>

                  {/* Tab Content */}
                  <div>
                      {activeTab === 'create' && <CreateLabTest />}
                      {/* {activeTab === 'view' && <ViewTests />} */}
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default LabTestManager;