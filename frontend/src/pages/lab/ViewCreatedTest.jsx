import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";
import useAuth from '../../hooks/useAuth';
import { useParams } from "react-router-dom";

const ViewTests = () => {
  const { pid } = useParams();
  const { showMessage } = useMessage();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labUnits, setLabUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [unitsRes, testsRes] = await Promise.all([
        axiosInstance.get("/labapi/lab-units/"),
        axiosInstance.get("/labapi/tests/create/"),
      ]);
      setLabUnits(unitsRes.data);
      const sorted = testsRes.data.sort((a, b) => b.id - a.id);
      setTests(sorted);
    } catch (err) {
      console.error("Error fetching lab data", err);
      showMessage("Failed to fetch tests", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pid]);

  const getLabUnitName = (id) => {
    const unit = labUnits.find((u) => u.id === id);
    return unit ? unit.name : "---";
  };

  const filteredTests = tests.filter((test) => {
    const testNameMatch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
    const subTestMatch = test.sub_tests?.some((st) =>
      st.parameter_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return testNameMatch || subTestMatch;
  });

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTests = filteredTests.slice(startIndex, startIndex + itemsPerPage);

  const handleViewTest = (test) => {
    setSelectedTest(test);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTest(null);
  };

  const formatPrice = (price) => {
    const num = parseFloat(price || 0);
    return num.toLocaleString("en-NG");
  };

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

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-600 mt-1">Loading tests...</p>
      </div>
    );
  }

  return (
    <div className="p-1">
      {/* Ultra Compact Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="p-1 bg-blue-100 rounded">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-gray-900">Test Catalog ({tests.length})</h2>
        </div>
        <button
          onClick={fetchData}
          className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Compact Search */}
      <div className="mb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-7 pr-2 py-1.5 text-xs bg-white border border-gray-300 rounded"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-4 gap-1 mb-2">
        <div className="bg-blue-50 p-1 rounded text-center">
          <div className="text-xs text-gray-600">Total</div>
          <div className="text-sm font-bold text-blue-700">{tests.length}</div>
        </div>
        <div className="bg-emerald-50 p-1 rounded text-center">
          <div className="text-xs text-gray-600">Panels</div>
          <div className="text-sm font-bold text-emerald-700">{tests.filter(t => t.sub_tests?.length > 0).length}</div>
        </div>
        <div className="bg-purple-50 p-1 rounded text-center">
          <div className="text-xs text-gray-600">Simple</div>
          <div className="text-sm font-bold text-purple-700">{tests.filter(t => !t.sub_tests || t.sub_tests.length === 0).length}</div>
        </div>
        <div className="bg-amber-50 p-1 rounded text-center">
          <div className="text-xs text-gray-600">Found</div>
          <div className="text-sm font-bold text-amber-700">{filteredTests.length}</div>
        </div>
      </div>

      {/* Compact Table */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-2 text-left">#</th>
                <th className="py-2 px-2 text-left">Test</th>
                <th className="py-2 px-2 text-left">Unit</th>
                <th className="py-2 px-2 text-left">Price</th>
                <th className="py-2 px-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {currentTests.length > 0 ? (
                currentTests.map((test, idx) => (
                  <tr key={test.id} className="border-t border-gray-100 hover:bg-blue-50">
                    <td className="py-1.5 px-2 font-medium">{startIndex + idx + 1}</td>
                    <td className="py-1.5 px-2">
                      <div className="font-medium">{test.name}</div>
                      {test.sub_tests?.length > 0 && (
                        <div className="text-[10px] text-gray-500">{test.sub_tests.length} params</div>
                      )}
                    </td>
                    <td className="py-1.5 px-2">
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px]">
                        {getLabUnitName(test.lab_unit)}
                      </span>
                    </td>
                    <td className="py-1.5 px-2">
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium">
                        ₦{formatPrice(calculatePrice(test))}
                      </span>
                    </td>
                    <td className="py-1.5 px-2">
                      <button
                        onClick={() => handleViewTest(test)}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500 text-xs">
                    {searchTerm ? `No results for "${searchTerm}"` : "No tests found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compact Pagination */}
      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded text-xs"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded text-xs"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Ultra Compact Modal */}
      {showModal && selectedTest && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="bg-blue-600 px-3 py-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Test Details</h3>
              <button onClick={closeModal} className="text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-3 overflow-y-auto max-h-[70vh]">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{selectedTest.name}</h4>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    selectedTest.sub_tests?.length > 0 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedTest.sub_tests?.length > 0 ? 'Panel' : 'Single'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {getLabUnitName(selectedTest.lab_unit)}
                  </span>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">
                    ₦{formatPrice(calculatePrice(selectedTest))}
                  </span>
                </div>
              </div>

              {selectedTest.sub_tests?.length > 0 ? (
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Subtests:</div>
                  <div className="space-y-1">
                    {selectedTest.sub_tests.map((st, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium">{st.parameter_name}</div>
                          {st.reference_range && (
                            <div className="text-[10px] text-gray-500">Ref: {st.reference_range}</div>
                          )}
                        </div>
                        <div className="font-bold text-emerald-700">
                          ₦{formatPrice((parseFloat(st.price) || 0).toFixed(2))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500 text-center py-4">
                  No subtest parameters
                </div>
              )}
            </div>

            <div className="border-t px-3 py-2">
              <button
                onClick={closeModal}
                className="w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTests;