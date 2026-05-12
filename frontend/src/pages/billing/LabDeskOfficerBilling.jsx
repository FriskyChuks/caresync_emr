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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
      partly_billed: { class: 'bg-indigo-100 text-indigo-800', text: 'Partial' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.class}`}>
        {config.text}
      </span>
    );
  };

  // Get active tab name for mobile
  const getActiveTabName = () => {
    if (activeTab === 'all') return 'All Tests';
    return `Request #${activeTab}`;
  };

  const getActiveTabCount = () => {
    if (activeTab === 'all') return getAllBillableDetails().length;
    const request = requests.find(r => r.id === parseInt(activeTab));
    return request?.details?.filter(d => d.status === "pending" || d.status === "partly_billed").length || 0;
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
      <div className="max-w-7xl mx-auto">
        
        {/* Mobile Optimized Header */}
        <div className="relative mb-3 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
          <div className="relative px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-bold text-white tracking-tight truncate">Laboratory Billing</h1>
                  {patientInfo && (
                    <div className="flex items-center gap-1 text-xs text-white/90 truncate">
                      <span className="truncate">{patientInfo.user_info?.fullname}</span>
                      <span className="text-white/60 flex-shrink-0">•</span>
                      <span className="flex-shrink-0">PID: {patientInfo?.patient_number}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-1.5 flex-shrink-0">
                <button 
                  className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all"
                  onClick={() => window.history.back()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <button 
                  className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all"
                  onClick={fetchRequests}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats Grid - 2x2 layout */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2.5 shadow-md">
            <p className="text-xs text-blue-600 font-medium">Requests</p>
            <p className="text-lg font-bold text-gray-800">{requests.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2.5 shadow-md">
            <p className="text-xs text-blue-600 font-medium">Available</p>
            <p className="text-lg font-bold text-gray-800">{allBillableDetails.length}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2.5 shadow-md">
            <p className="text-xs text-blue-600 font-medium">Selected</p>
            <p className="text-lg font-bold text-amber-600">{getSelectedCount()}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2.5 shadow-md">
            <p className="text-xs text-blue-600 font-medium">Total</p>
            <p className="text-sm font-bold text-emerald-600 break-words">{formatNaira(calculateTotal())}</p>
          </div>
        </div>

        {/* Create Bill Button - Full width on mobile */}
        <button
          className={`w-full rounded-lg p-2.5 font-bold transition-all mb-3 text-sm ${
            selectedItems.size > 0 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md active:scale-98' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          onClick={() => selectedItems.size > 0 && setShowModal(true)}
          disabled={selectedItems.size === 0}
        >
          Create Bill ({getSelectedCount()} test{getSelectedCount() !== 1 ? 's' : ''})
        </button>

        {/* Mobile Tab Selector */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{getActiveTabName()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{getActiveTabCount()}</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Tab Dropdown */}
          {showMobileFilters && (
            <div className="mt-1 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
              <button
                className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                  activeTab === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
                onClick={() => {
                  setActiveTab('all');
                  setShowMobileFilters(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <span>All Tests</span>
                  <span className="text-xs text-gray-500">{allBillableDetails.length}</span>
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
                    className={`w-full px-3 py-2.5 text-left text-sm transition-colors border-t border-gray-100 ${
                      activeTab === request.id.toString() ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      setActiveTab(request.id.toString());
                      setShowMobileFilters(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>Request #{request.id}</span>
                      <span className="text-xs text-gray-500">{requestBillableCount}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Tabs - Hidden on mobile */}
        <div className="hidden md:block mb-4 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 min-w-max">
            <button
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Tests ({allBillableDetails.length})
            </button>
            
            {requests.map((request) => {
              const requestBillableCount = request.details?.filter(
                detail => detail.status === "pending" || detail.status === "partly_billed"
              ).length || 0;
              
              if (requestBillableCount === 0) return null;
              
              return (
                <button
                  key={request.id}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                    activeTab === request.id.toString()
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => setActiveTab(request.id.toString())}
                >
                  Req#{request.id} ({requestBillableCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons - Stack on mobile */}
        {currentTabDetails.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg transition active:scale-98"
                onClick={isAllInTabSelected() ? deselectAllInTab : selectAllInTab}
              >
                {isAllInTabSelected() ? 'Deselect Tab' : 'Select Tab'}
              </button>
              <button
                className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg transition active:scale-98"
                onClick={isAllSelected() ? clearAll : selectAll}
              >
                {isAllSelected() ? 'Clear All' : 'Select All'}
              </button>
            </div>
          </div>
        )}

        {/* Tests List - Mobile optimized card view */}
        <div className="space-y-2 pb-20">
          {currentTabDetails.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-3">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Billable Tests</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                All tests have been billed or there are no pending tests for this patient.
              </p>
            </div>
          ) : (
            currentTabDetails.map((detail) => {
              const isChecked = selectedItems.has(detail.id);
              const isExpanded = expandedTests.has(detail.id);
              const subtests = detail.sub_tests || [];
              const hasSubTests = subtests.length > 0;
              const totalAmount = getDetailTotal(detail);

              return (
                <div key={detail.id}>
                  <div
                    className={`bg-white rounded-lg p-3 shadow transition-all active:scale-98 cursor-pointer ${
                      isChecked 
                        ? 'border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-transparent' 
                        : 'border border-gray-200'
                    }`}
                    onClick={() => toggleItem(detail.id)}
                  >
                    <div className="flex gap-2">
                      <div className="flex-shrink-0 pt-0.5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={isChecked}
                          onChange={() => toggleItem(detail.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-1 flex-1">
                              {hasSubTests && (
                                <button
                                  className="mt-0.5 text-gray-400 hover:text-blue-600 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTestExpansion(detail.id);
                                  }}
                                >
                                  <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              )}
                              <h4 className="font-semibold text-gray-900 text-sm break-words flex-1">
                                {detail.test.name}
                              </h4>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="font-bold text-emerald-700 text-sm">
                                {formatNaira(totalAmount)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {getStatusBadge(detail.status)}
                            {activeTab === 'all' && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                Req#{detail.requestId}
                              </span>
                            )}
                            {hasSubTests && (
                              <span className="text-xs text-gray-500">
                                {subtests.length} parameter(s)
                              </span>
                            )}
                          </div>
                          
                          {activeTab === 'all' && (
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(detail.requestDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded sub-tests */}
                  {isExpanded && hasSubTests && (
                    <div className="ml-6 mt-1 space-y-1">
                      {subtests.map((subtest, index) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-2 pl-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                              <span className="text-xs text-gray-700">{subtest.parameter_name}</span>
                            </div>
                            <span className="text-xs font-medium text-emerald-600">
                              {formatNaira(subtest.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Footer - Mobile optimized */}
        {currentTabDetails.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg border-t border-gray-200 p-3">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Selected</p>
                  <p className="text-base font-bold text-amber-600">{getSelectedCountInTab()} / {currentTabDetails.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {formatNaira(calculateTotal())}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal - Mobile optimized */}
      <ReusableModal
        show={showModal}
        onClose={() => setShowModal(false)}
      >
        <div className="relative p-4">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl"></div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Confirm Lab Bill</h3>
              <p className="text-xs text-gray-500">Review and confirm billing</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-blue-600 font-medium mb-1">Tests</p>
                <p className="text-xl font-bold text-gray-800">{getSelectedCount()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-blue-600 font-medium mb-1">Amount</p>
                <p className="text-base font-bold text-emerald-600 break-words">{formatNaira(calculateTotal())}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
            <div className="flex gap-2">
              <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-amber-800">
                This will create a bill for the selected laboratory tests.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 px-3 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg active:scale-98 transition"
              onClick={() => setShowModal(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="flex-1 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg active:scale-98 transition flex items-center justify-center gap-2"
              onClick={handleCreateBill}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span className="text-sm">Processing...</span>
                </>
              ) : (
                <span className="text-sm">Confirm & Create</span>
              )}
            </button>
          </div>
        </div>
      </ReusableModal>
    </div>
  );
};

export default LabDeskOfficerBilling;