import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useMessage } from '../../context/MessageProvider';
import ReusableModal from '../../components/common/ReusableModal';

const RadiologyBillingPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { showMessage } = useMessage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const formatNaira = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount || 0);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/radiologyapi/patients/${patientId}/requests/?status__in=pending,in_progress,partly_billed`
      );
      const data = res.data || [];
      setRequests(data);
      if (data.length && data[0].patient_name) {
        setPatientInfo({
          fullname: data[0].patient_name,
          id: data[0].patient_id || patientId
        });
      }
    } catch (err) {
      console.error(err);
      showMessage("Failed to fetch Radiology requests", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchRequests();
  }, [patientId]);

  const getAllBillableDetails = () => {
    const details = [];
    requests.forEach(req => {
      req.details?.forEach(detail => {
        if (detail.status === "pending" || detail.status === "partly_billed") {
          details.push({
            ...detail,
            requestId: req.id,
            requestDate: req.date_created,
            urgency: req.urgency,
            request: req
          });
        }
      });
    });
    return details;
  };

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
          requestDate: request.date_created,
          urgency: request.urgency,
          request: request
        })) || [];
    }
  };

  const toggleItem = (detailId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(detailId)) newSet.delete(detailId);
      else newSet.add(detailId);
      return newSet;
    });
  };

  const selectAllInTab = () => {
    const currentDetails = getCurrentTabDetails();
    setSelectedItems(prev => new Set([...prev, ...currentDetails.map(d => d.id)]));
  };

  const deselectAllInTab = () => {
    const currentDetails = getCurrentTabDetails();
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      currentDetails.forEach(d => newSet.delete(d.id));
      return newSet;
    });
  };

  const selectAll = () => {
    const allDetails = getAllBillableDetails();
    setSelectedItems(new Set(allDetails.map(d => d.id)));
  };

  const clearAll = () => setSelectedItems(new Set());

  const isAllInTabSelected = () => {
    const currentDetails = getCurrentTabDetails();
    return currentDetails.length > 0 && currentDetails.every(d => selectedItems.has(d.id));
  };

  const calculateTotal = () => {
    const allDetails = getAllBillableDetails();
    return allDetails.reduce((sum, detail) => 
      selectedItems.has(detail.id) ? sum + parseFloat(detail.total_price || detail.unit_price || 0) : sum, 0
    );
  };

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
          const amount = parseFloat(detail.total_price || detail.unit_price || 0);
          const description = `${detail.investigation_title}${detail.investigation_view_title ? ` - ${detail.investigation_view_title}` : ''}`;
          payload.push({
            content_type: "requestdetail",
            object_id: detail.id,
            description: description,
            amount: amount,
          });
        }
      });

      const res = await axiosInstance.post("/billsapi/bills/", {
        patient: patientId,
        description: "Billing for Radiology Investigation(s)",
        source: payload,
        amount: calculateTotal()
      });

      if (res.status === 201) {
        showMessage("Radiology bill created successfully!", "success");
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

  const getStatusBadge = (status) => {
    const config = {
      pending: 'bg-amber-100 text-amber-800',
      in_progress: 'bg-blue-100 text-blue-800',
      billed: 'bg-emerald-100 text-emerald-800',
      partly_billed: 'bg-indigo-100 text-indigo-800'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config[status] || config.pending}`}>
        {status === 'partly_billed' ? 'partial' : status.replace('_', ' ')}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const config = {
      routine: 'bg-gray-100 text-gray-700',
      urgent: 'bg-amber-100 text-amber-800',
      stat: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config[urgency] || config.routine}`}>
        {urgency}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-sm font-medium text-purple-600">Loading radiology requests...</p>
        </div>
      </div>
    );
  }

  const allBillableDetails = getAllBillableDetails();
  const currentTabDetails = getCurrentTabDetails();
  const selectedCount = selectedItems.size;
  const totalAmount = calculateTotal();

  // Get active tab name for mobile view
  const getActiveTabName = () => {
    if (activeTab === 'all') return 'All Scans';
    const request = requests.find(r => r.id === parseInt(activeTab));
    return request ? `RAD#${request.id}` : 'All Scans';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Mobile-Optimized Header */}
        <div className="relative mb-3 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 shadow-lg">
          <div className="relative px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-bold text-white tracking-tight truncate">Radiology Billing</h1>
                  {patientInfo && (
                    <div className="flex items-center gap-1 text-xs text-white/90 truncate">
                      <span className="truncate">{patientInfo.fullname}</span>
                      <span className="text-white/60 flex-shrink-0">•</span>
                      <span className="flex-shrink-0">PID: {patientInfo?.patient_number}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-1.5 flex-shrink-0">
                <button 
                  onClick={() => navigate('/radiology-dashboard')}
                  className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
                <button 
                  onClick={fetchRequests}
                  className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats Grid - 2x2 layout on mobile */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white rounded-lg p-2.5 shadow-md">
            <p className="text-xs text-purple-600 font-medium">Requests</p>
            <p className="text-lg font-bold text-gray-800">{requests.length}</p>
          </div>

          <div className="bg-white rounded-lg p-2.5 shadow-md">
            <p className="text-xs text-purple-600 font-medium">Available</p>
            <p className="text-lg font-bold text-gray-800">{allBillableDetails.length}</p>
          </div>

          <div className="bg-white rounded-lg p-2.5 shadow-md">
            <p className="text-xs text-purple-600 font-medium">Selected</p>
            <p className="text-lg font-bold text-amber-600">{selectedCount}</p>
          </div>

          <div className="bg-white rounded-lg p-2.5 shadow-md">
            <p className="text-xs text-purple-600 font-medium">Total</p>
            <p className="text-sm font-bold text-emerald-600 break-words">{formatNaira(totalAmount)}</p>
          </div>
        </div>

        {/* Create Bill Button - Full width on mobile */}
        <button
          className={`w-full rounded-lg p-2.5 font-bold transition-all mb-3 text-sm ${
            selectedCount > 0 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md active:scale-98' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          onClick={() => selectedCount > 0 && setShowModal(true)}
          disabled={selectedCount === 0}
        >
          Create Bill ({selectedCount} item{selectedCount !== 1 ? 's' : ''})
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
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{getActiveTabName()}</span>
                </div>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Tab Dropdown */}
          {showMobileFilters && (
            <div className="mt-1 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
              <button
                className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                  activeTab === 'all' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                }`}
                onClick={() => {
                  setActiveTab('all');
                  setShowMobileFilters(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <span>All Scans</span>
                  <span className="text-xs text-gray-500">{allBillableDetails.length}</span>
                </div>
              </button>
              
              {requests.map((request) => {
                const count = request.details?.filter(d => d.status === "pending" || d.status === "partly_billed").length || 0;
                if (count === 0) return null;
                return (
                  <button
                    key={request.id}
                    className={`w-full px-3 py-2.5 text-left text-sm transition-colors border-t border-gray-100 ${
                      activeTab === request.id.toString() ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      setActiveTab(request.id.toString());
                      setShowMobileFilters(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>RAD Request #{request.id}</span>
                      <span className="text-xs text-gray-500">{count}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Tabs - Hidden on mobile */}
        <div className="hidden md:block mb-3 overflow-x-auto hide-scrollbar">
          <div className="flex gap-1.5 min-w-max">
            <button
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All ({allBillableDetails.length})
            </button>
            
            {requests.map((request) => {
              const count = request.details?.filter(d => d.status === "pending" || d.status === "partly_billed").length || 0;
              if (count === 0) return null;
              return (
                <button
                  key={request.id}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                    activeTab === request.id.toString()
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => setActiveTab(request.id.toString())}
                >
                  RAD#{request.id} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons - Stack vertically on mobile */}
        {currentTabDetails.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg transition active:scale-98"
                onClick={isAllInTabSelected() ? deselectAllInTab : selectAllInTab}
              >
                {isAllInTabSelected() ? 'Deselect Tab' : 'Select Tab'}
              </button>
              <button
                className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg transition active:scale-98"
                onClick={selectedCount === allBillableDetails.length ? clearAll : selectAll}
              >
                {selectedCount === allBillableDetails.length ? 'Clear All' : 'Select All'}
              </button>
            </div>
          </div>
        )}

        {/* Items List - Optimized for touch */}
        <div className="space-y-2 pb-20">
          {currentTabDetails.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-3">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No billable scans available</p>
            </div>
          ) : (
            currentTabDetails.map((detail) => {
              const isChecked = selectedItems.has(detail.id);
              const amount = parseFloat(detail.total_price || detail.unit_price || 0);

              return (
                <div
                  key={detail.id}
                  className={`group bg-white rounded-lg p-3 shadow transition-all active:scale-98 cursor-pointer ${
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
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        checked={isChecked}
                        onChange={() => toggleItem(detail.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm break-words">
                            {detail.investigation_title}
                          </h4>
                          {detail.investigation_view_title && (
                            <p className="text-xs text-gray-600 mt-0.5 break-words">
                              {detail.investigation_view_title}
                            </p>
                          )}
                          {detail.notes && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              📝 {detail.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <span className="font-bold text-emerald-700 text-sm">
                            {formatNaira(amount)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {getStatusBadge(detail.status)}
                        {activeTab === 'all' && (
                          <>
                            {getUrgencyBadge(detail.urgency)}
                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              #{detail.requestId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
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
                  <p className="text-base font-bold text-amber-600">{selectedCount} / {currentTabDetails.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatNaira(totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Mobile optimized */}
      <ReusableModal show={showModal} onClose={() => setShowModal(false)}>
        <div className="relative p-4">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl"></div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Confirm Bill</h3>
              <p className="text-xs text-gray-500">Review billing details</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-purple-600 font-medium mb-1">Scans</p>
                <p className="text-xl font-bold text-gray-800">{selectedCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-purple-600 font-medium mb-1">Amount</p>
                <p className="text-base font-bold text-emerald-600 break-words">{formatNaira(totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
            <div className="flex gap-2">
              <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-amber-800">
                This will create a bill for the selected radiology investigations.
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
              className="flex-1 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg active:scale-98 transition flex items-center justify-center gap-2"
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

export default RadiologyBillingPage;