import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import ReusableModal from "../../components/common/ReusableModal";
import { useMessage } from "../../context/MessageProvider";

const LabDeskOfficerBilling = () => {
  const { pid } = useParams();
  const { showMessage } = useMessage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedTests, setExpandedTests] = useState(new Set());

  // Format currency
  const formatNaira = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount || 0);

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/labapi/patient-requests/${pid}/?status=pending,partly_billed`
      );
      const data = res.data || [];
      setRequests(data);
      if (data.length) setPatientInfo(data[0].patient_info);
    } catch (err) {
      console.error(err);
      showMessage("Failed to fetch Lab requests", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pid) fetchRequests();
  }, [pid]);

  // Get all billable details
  const getAllBillableDetails = () => {
    const details = [];
    requests.forEach(req => {
      req.details?.forEach(detail => {
        if (detail.status === "pending" || detail.status === "partly_billed") {
          details.push({
            ...detail,
            requestId: req.id,
            requestDate: req.request_date,
            requestStatus: req.status,
            request: req
          });
        }
      });
    });
    return details;
  };

  // Get billable details for current tab
  const getCurrentTabDetails = () => {
    if (activeTab === 'all') {
      return getAllBillableDetails();
    } else {
      const request = requests.find(req => req.id === parseInt(activeTab));
      if (!request) return [];
      
      return request.details
        ?.filter(detail => detail.status === "pending" || detail.status === "partly_billed")
        .map(detail => ({
          ...detail,
          requestId: request.id,
          requestDate: request.request_date,
          requestStatus: request.status,
          request: request
        })) || [];
    }
  };

  // Toggle single item selection
  const toggleItem = (detailId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(detailId)) {
        newSet.delete(detailId);
      } else {
        newSet.add(detailId);
      }
      return newSet;
    });
  };

  // Toggle test expansion
  const toggleTestExpansion = (detailId) => {
    setExpandedTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(detailId)) {
        newSet.delete(detailId);
      } else {
        newSet.add(detailId);
      }
      return newSet;
    });
  };

  // Select all in current tab
  const selectAllInTab = () => {
    const currentDetails = getCurrentTabDetails();
    const currentIds = currentDetails.map(detail => detail.id);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      currentIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  // Deselect all in current tab
  const deselectAllInTab = () => {
    const currentDetails = getCurrentTabDetails();
    const currentIds = currentDetails.map(detail => detail.id);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      currentIds.forEach(id => newSet.delete(id));
      return newSet;
    });
  };

  // Select all across all requests
  const selectAll = () => {
    const allDetails = getAllBillableDetails();
    const allIds = allDetails.map(detail => detail.id);
    setSelectedItems(new Set(allIds));
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedItems(new Set());
  };

  // Check if all in current tab are selected
  const isAllInTabSelected = () => {
    const currentDetails = getCurrentTabDetails();
    if (currentDetails.length === 0) return false;
    return currentDetails.every(detail => selectedItems.has(detail.id));
  };

  // Check if all billable items are selected
  const isAllSelected = () => {
    const allDetails = getAllBillableDetails();
    return allDetails.length > 0 && selectedItems.size === allDetails.length;
  };

  // Calculate total amount for selected items
  const calculateTotal = () => {
    let total = 0;
    const allDetails = getAllBillableDetails();
    allDetails.forEach(detail => {
      if (selectedItems.has(detail.id)) {
        let amount = parseFloat(detail.test.price || 0);
        (detail.sub_tests || []).forEach(st => {
          amount += parseFloat(st.price || 0);
        });
        total += amount;
      }
    });
    return total;
  };

  // Get selected count for current tab
  const getSelectedCountInTab = () => {
    const currentDetails = getCurrentTabDetails();
    return currentDetails.filter(detail => selectedItems.has(detail.id)).length;
  };

  // Get total selected count
  const getSelectedCount = () => {
    return selectedItems.size;
  };

  // Calculate total for a specific detail
  const getDetailTotal = (detail) => {
    let total = parseFloat(detail.test.price || 0);
    (detail.sub_tests || []).forEach(st => {
      total += parseFloat(st.price || 0);
    });
    return total;
  };

  // Bill creation
  const handleCreateBill = async () => {
    if (selectedItems.size === 0) {
      return showMessage("Please select at least one item to bill", "warning");
    }

    setSaving(true);
    try {
      const payload = [];
      const allDetails = getAllBillableDetails();

      allDetails.forEach(detail => {
        if (selectedItems.has(detail.id)) {
          const amount = getDetailTotal(detail);
          
          payload.push({
            content_type: "testrequestdetail",
            object_id: detail.id,
            description: detail.test.name,
            amount: amount,
          });
        }
      });

      const res = await axiosInstance.post("/billsapi/bills/", {
        patient: pid,
        description: "Billing for Lab Test(s)",
        source: payload,
        amount: calculateTotal(),
      });

      if (res.status === 201) {
        showMessage("Lab bill created successfully!", "success");
        setSelectedItems(new Set());
        setShowModal(false);
        await fetchRequests();
      } else {
        showMessage("Failed to create bill.", "danger");
      }
    } catch (err) {
      console.error('Billing error:', err);
      showMessage("Billing failed. Please retry.", "danger");
    } finally {
      setSaving(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-amber-100 text-amber-800', text: 'Pending' },
      in_progress: { class: 'bg-blue-100 text-blue-800', text: 'In Progress' },
      billed: { class: 'bg-emerald-100 text-emerald-800', text: 'Billed' },
      partly_billed: { class: 'bg-indigo-100 text-indigo-800', text: 'Partly Billed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-blue-200"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">Loading Lab Requests</h3>
            <p className="text-sm text-gray-500">Fetching patient test information...</p>
          </div>
        </div>
      </div>
    );
  }

  const allBillableDetails = getAllBillableDetails();
  const currentTabDetails = getCurrentTabDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Laboratory Billing</h1>
                {patientInfo && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                      <span className="font-medium">Patient:</span> {patientInfo.user_info.fullname}
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                      ID: {patientInfo.id}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                onClick={() => window.history.back()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button 
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                onClick={fetchRequests}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm">
          <div className="text-sm font-medium text-blue-600 mb-1">Requests</div>
          <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm">
          <div className="text-sm font-medium text-blue-600 mb-1">Available Tests</div>
          <div className="text-2xl font-bold text-gray-900">{allBillableDetails.length}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm">
          <div className="text-sm font-medium text-blue-600 mb-1">Selected</div>
          <div className="text-2xl font-bold text-amber-600">{getSelectedCount()}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm">
          <div className="text-sm font-medium text-blue-600 mb-1">Total Amount</div>
          <div className="text-2xl font-bold text-emerald-600">{formatNaira(calculateTotal())}</div>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 shadow-lg">
          <button
            className="w-full h-full flex items-center justify-center gap-2 text-white font-medium hover:opacity-90 transition-opacity"
            onClick={() => setShowModal(true)}
            disabled={selectedItems.size === 0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Create Bill ({getSelectedCount()})
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => setActiveTab('all')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              All Tests ({allBillableDetails.length})
            </div>
          </button>
          
          {requests.map((request) => {
            const requestBillableCount = request.details?.filter(
              detail => detail.status === "pending" || detail.status === "partly_billed"
            ).length || 0;
            
            if (requestBillableCount === 0) return null;
            
            return (
              <button
                key={request.id}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === request.id.toString()
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                onClick={() => setActiveTab(request.id.toString())}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Req#{request.id} ({requestBillableCount})
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {activeTab === 'all' ? (
                  <>All Laboratory Tests</>
                ) : (
                  <>Request #{activeTab} - {currentTabDetails.length} tests</>
                )}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select tests to include in billing
              </p>
            </div>
            
            <div className="flex gap-2">
              {currentTabDetails.length > 0 && (
                <>
                  <button
                    className="px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-150 flex items-center gap-1"
                    onClick={isAllInTabSelected() ? deselectAllInTab : selectAllInTab}
                  >
                    {isAllInTabSelected() ? "Deselect Tab" : "Select Tab"}
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-150 flex items-center gap-1"
                    onClick={isAllSelected() ? clearAll : selectAll}
                  >
                    {isAllSelected() ? "Clear All" : "Select All"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {currentTabDetails.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Billable Tests</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                All tests have been billed or there are no pending tests for this patient.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={isAllInTabSelected()}
                      onChange={isAllInTabSelected() ? deselectAllInTab : selectAllInTab}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Test Details
                  </th>
                  {activeTab === 'all' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Request
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider text-right">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentTabDetails.map((detail) => {
                  const isChecked = selectedItems.has(detail.id);
                  const isExpanded = expandedTests.has(detail.id);
                  const subtests = detail.sub_tests || [];
                  const hasSubTests = subtests.length > 0;
                  const totalAmount = getDetailTotal(detail);

                  return (
                    <React.Fragment key={detail.id}>
                      <tr 
                        className={`hover:bg-gray-50 ${isChecked ? 'bg-emerald-50' : ''}`}
                        onClick={() => toggleItem(detail.id)}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={isChecked}
                            onChange={() => toggleItem(detail.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <button
                              className={`mt-1 text-gray-400 hover:text-blue-600 ${!hasSubTests ? 'invisible' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTestExpansion(detail.id);
                              }}
                            >
                              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <div>
                              <div className="font-medium text-gray-900">{detail.test.name}</div>
                              {hasSubTests && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {subtests.length} parameter(s)
                                </div>
                              )}
                              {activeTab === 'all' && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Request: #{detail.requestId}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {activeTab === 'all' && (
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-900">
                                {new Date(detail.requestDate).toLocaleDateString()}
                              </div>
                              {getStatusBadge(detail.requestStatus)}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-emerald-700">
                            {formatNaira(totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(detail.status)}
                        </td>
                      </tr>
                      
                      {/* Expanded sub-tests */}
                      {isExpanded && hasSubTests && subtests.map((subtest, index) => (
                        <tr key={`${detail.id}-${index}`} className="bg-blue-50">
                          <td className="px-6 py-2"></td>
                          <td className="px-6 py-2 pl-16">
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                              {subtest.parameter_name}
                            </div>
                          </td>
                          {activeTab === 'all' && <td className="px-6 py-2"></td>}
                          <td className="px-6 py-2 text-right">
                            <span className="text-sm text-emerald-600">
                              {formatNaira(subtest.price)}
                            </span>
                          </td>
                          <td className="px-6 py-2"></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {currentTabDetails.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-amber-600">{getSelectedCountInTab()}</span> of{' '}
                <span className="font-medium">{currentTabDetails.length}</span> selected in this tab •{' '}
                <span className="font-medium text-blue-600">{getSelectedCount()}</span> total selected
              </div>
              <div className="text-lg font-bold text-emerald-700">
                Total: {formatNaira(calculateTotal())}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ReusableModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Lab Bill Creation</h3>
              <p className="text-sm text-gray-600">Review and confirm billing details</p>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm font-medium text-blue-600 mb-2">Tests</div>
                <div className="text-3xl font-bold text-gray-900">{getSelectedCount()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-blue-600 mb-2">Total Amount</div>
                <div className="text-3xl font-bold text-emerald-700">{formatNaira(calculateTotal())}</div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Note</p>
                <p>This will create a bill for the selected laboratory tests across all requests.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-150"
              onClick={() => setShowModal(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
              onClick={handleCreateBill}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm Bill Creation
                </>
              )}
            </button>
          </div>
        </div>
      </ReusableModal>
    </div>
  );
};

export default LabDeskOfficerBilling;