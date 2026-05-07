import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";
import { useMessage } from "../../context/MessageProvider";
import ReusableModal from "../../components/common/ReusableModal";
import PriceFormat from "./PriceFormat";

const LabTestRequest = ({ patient, onSuccess }) => {
  const { user } = useAuth();
  const { showMessage } = useMessage();

  const [units, setUnits] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [unitsRes, testsRes] = await Promise.all([
        axiosInstance.get("/labapi/lab-units/"),
        axiosInstance.get("/labapi/tests/create/"),
      ]);
      setUnits(unitsRes.data || []);
      setTests(testsRes.data || []);
      if ((unitsRes.data || []).length > 0) setSelectedUnit(unitsRes.data[0].id);
    } catch (err) {
      console.error("Error fetching lab data", err);
      showMessage("Failed to fetch lab units or tests.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSelection = (type, parentId, item) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };

      if (type === "test") {
        const key = `test-${item.id}`;

        if (updated[key]) {
          delete updated[key];
          if (item.is_complex && item.sub_tests) {
            item.sub_tests.forEach((st) => delete updated[`subtest-${st.id}`]);
          }
        } else {
          updated[key] = { ...item, type, parentId };
          if (item.is_complex && item.sub_tests) {
            item.sub_tests.forEach((st) => {
              updated[`subtest-${st.id}`] = {
                ...st,
                type: "subtest",
                parentId: item.id,
              };
            });
          }
        }
      } else if (type === "subtest") {
        const key = `subtest-${item.id}`;
        if (updated[key]) {
          delete updated[key];
        } else {
          updated[key] = { ...item, type: "subtest", parentId };
        }

        const parentTest = tests.find((t) => t.id === parentId);
        const parentKey = `test-${parentId}`;
        const stillSelected = parentTest?.sub_tests?.some(
          (st) => updated[`subtest-${st.id}`]
        );

        if (stillSelected) {
          updated[parentKey] = { ...parentTest, type: "test", parentId: null };
        } else {
          delete updated[parentKey];
        }
      }

      return updated;
    });
  };

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
    return Object.values(summary).map((test) => ({ ...test, showMainInSummary: true }));
  };

  const totalPrice = React.useMemo(() => {
    return getSummary().reduce((sum, test) => {
      let priceToAdd = 0;
      const totalSubTestsCount = test.sub_tests?.length || 0;
      const selectedSubTestsCount = test.subtests?.length || 0;

      if (!test.is_complex || totalSubTestsCount === 0) {
        priceToAdd = Number(test.price) || 0;
      } else {
        if (selectedSubTestsCount === totalSubTestsCount) {
          priceToAdd = Number(test.price) || 0;
        } else {
          priceToAdd = (test.subtests || []).reduce(
            (subtestSum, st) => subtestSum + (Number(st.price) || 0),
            0
          );
        }
      }
      return sum + priceToAdd;
    }, 0);
  }, [selectedItems, tests]);

  const handleSubmit = async () => {
    if (!patient || !patient.id) {
      showMessage("Patient information is missing.", "danger");
      return;
    }

    const selectedTests = getSummary();
    if (!selectedTests.length) {
      showMessage("Please select at least one test before submitting.", "warning");
      return;
    }

    const payload = {
      patient: patient.id,
      requested_by: user?.id,
      details: selectedTests.map((t) => ({
        test_id: t.id,
        sub_test_ids: (t.subtests || []).map((st) => st.id),
        status: "pending",
      })),
    };

    try {
      await axiosInstance.post("/labapi/test-requests/create/", payload);
      showMessage("Lab test request submitted successfully!", "success");
      setSelectedItems({});
      setShowConfirm(false);
      if (typeof onSuccess === "function") onSuccess();
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        const messages = Object.entries(errors)
          .map(([field, msgs]) =>
            Array.isArray(msgs) ? `${field}: ${msgs.join(", ")}` : `${field}: ${msgs}`
          )
          .join(" | ");
        showMessage(`Submission failed: ${messages}`, "danger");
      } else {
        showMessage("Submission failed: Could not connect to server.", "danger");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-blue-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-3 bg-gradient-to-r from-red-50 to-rose-100 border border-red-200 rounded-lg text-red-700 text-center">
        Patient not found
      </div>
    );
  }

  const filteredTests = tests.filter(t => t.lab_unit === selectedUnit);

  return (
    <div className="space-y-3">
      {/* Patient Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">{patient.user_info?.fullname || `${patient.first_name} ${patient.last_name}`}</div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>PID: {patient.id}</span>
                <span>•</span>
                <span>{patient.phone}</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Requesting lab tests</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left - Unit Tabs */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg border border-blue-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 border-b border-blue-200">
              <div className="flex flex-wrap gap-1.5">
                {units.length === 0 ? (
                  <span className="text-gray-500 text-sm">No units found</span>
                ) : (
                  units.map((u) => (
                    <button
                      key={u.id}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                        selectedUnit === u.id
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-blue-300 hover:text-blue-600"
                      }`}
                      onClick={() => setSelectedUnit(u.id)}
                    >
                      {u.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="p-3">
              {filteredTests.length === 0 ? (
                <div className="text-center py-4">
                  <div className="inline-block p-2 bg-gray-100 rounded-full mb-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No tests available in this unit</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredTests.map((test) => (
                    <div key={test.id} className="group">
                      <div className={`bg-white border rounded-lg p-3 hover:shadow-md transition-all duration-200 ${
                        selectedItems[`test-${test.id}`] 
                          ? 'border-blue-300 bg-blue-50/50' 
                          : 'border-gray-200 hover:border-blue-200'
                      }`}>
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            className="mt-0.5 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                            checked={!!selectedItems[`test-${test.id}`]}
                            onChange={() => toggleSelection("test", null, test)}
                            id={`test-${test.id}`}
                          />
                          <div className="flex-1 min-w-0">
                            <label 
                              htmlFor={`test-${test.id}`} 
                              className="text-sm font-semibold text-gray-800 cursor-pointer flex items-center justify-between"
                            >
                              <span className="truncate">{test.name}</span>
                              <span className="ml-2">
                                <PriceFormat amount={test.price} />
                              </span>
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                              {test.is_complex && (
                                <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 text-xs rounded">
                                  Complex Panel
                                </span>
                              )}
                              {test.sub_tests?.length > 0 && (
                                <span className="text-xs text-gray-500">
                                  {test.sub_tests.length} parameters
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Subtests */}
                        {test.is_complex && selectedItems[`test-${test.id}`] && test.sub_tests.length > 0 && (
                          <div className="mt-2 pl-6 space-y-1.5 border-l border-blue-200">
                            {test.sub_tests.map((st) => (
                              <div key={st.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="w-3.5 h-3.5 text-blue-600 bg-white border-gray-300 rounded"
                                  checked={!!selectedItems[`subtest-${st.id}`]}
                                  onChange={() => toggleSelection("subtest", test.id, st)}
                                  id={`subtest-${st.id}`}
                                />
                                <label 
                                  htmlFor={`subtest-${st.id}`} 
                                  className="text-xs text-gray-700 cursor-pointer flex-1 flex items-center justify-between"
                                >
                                  <span className="truncate">{st.parameter_name}</span>
                                  <span className="text-emerald-600 font-medium ml-2">
                                    ₦{Number(st.price || 0).toFixed(2)}
                                  </span>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right - Summary */}
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg border border-emerald-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 border-b border-emerald-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Order Summary</h3>
                <div className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-700 text-xs rounded">
                  {Object.keys(selectedItems).length} items
                </div>
              </div>
            </div>

            <div className="p-3 max-h-64 overflow-y-auto">
              {Object.keys(selectedItems).length === 0 ? (
                <div className="text-center py-4">
                  <div className="inline-block p-2 bg-gray-100 rounded-full mb-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No tests selected</p>
                  <p className="text-xs text-gray-400 mt-1">Select tests from the list</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getSummary().map((test) => (
                    <div key={test.id} className="bg-white border border-gray-200 rounded p-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-gray-800 truncate">{test.name}</div>
                        <PriceFormat amount={test.price} showDecimals={false} />
                      </div>
                      {test.subtests.length > 0 && (
                        <div className="mt-1.5 pl-2 space-y-1 border-l border-gray-300">
                          {test.subtests.map((st) => (
                            <div key={st.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 truncate">{st.parameter_name}</span>
                              <span className="text-emerald-600 font-medium">
                                ₦{Number(st.price || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-emerald-200 p-3 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-gray-800">Total Amount</div>
                <div className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ₦{totalPrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <button
                className={`w-full py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  Object.keys(selectedItems).length === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm hover:shadow'
                }`}
                disabled={Object.keys(selectedItems).length === 0}
                onClick={() => setShowConfirm(true)}
              >
                Submit Request
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg border border-blue-200 p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Selected Tests</span>
                <span className="font-semibold text-blue-700">{Object.keys(selectedItems).length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Complex Panels</span>
                <span className="font-semibold text-purple-700">
                  {filteredTests.filter(t => t.is_complex && selectedItems[`test-${t.id}`]).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Individual Tests</span>
                <span className="font-semibold text-emerald-700">
                  {filteredTests.filter(t => !t.is_complex && selectedItems[`test-${t.id}`]).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ReusableModal show={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Request">
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Review Request</div>
                <div className="text-xs text-gray-600">
                  {Object.keys(selectedItems).length} tests • Total: ₦{totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">Are you sure you want to submit this lab test request?</p>
          
          <div className="flex justify-end gap-2 pt-2">
            <button 
              className="px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg border border-gray-300 transition-all"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all shadow-sm"
              onClick={handleSubmit}
            >
              Confirm & Submit
            </button>
          </div>
        </div>
      </ReusableModal>
    </div>
  );
};

export default LabTestRequest;