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
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      billed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      partly_billed: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${config[status] || config.pending}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const config = {
      routine: 'bg-gray-100 text-gray-700 border-gray-200',
      urgent: 'bg-amber-100 text-amber-800 border-amber-200',
      stat: 'bg-red-100 text-red-800 border-red-200'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${config[urgency] || config.routine}`}>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* Main Container with rounded corners */}
      <div className="max-w-7xl mx-auto px-3 py-3 md:px-4 md:py-4">
        
        {/* Gorgeous Rounded Header */}
        <div className="relative mb-4 md:mb-6 overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 shadow-xl">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative px-4 py-4 md:px-6 md:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    Radiology Billing
                  </h1>
                  {patientInfo && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {patientInfo.fullname}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        ID: {patientInfo.id}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate('/radiology/dashboard')}
                  className="group px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <button 
                  onClick={fetchRequests}
                  className="group px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Elegant Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 md:mb-6">
          <div className="group bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Requests</p>
                <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{requests.length}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Available</p>
                <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{allBillableDetails.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Selected</p>
                <p className="text-xl md:text-2xl font-bold text-amber-600 mt-1">{selectedCount}</p>
              </div>
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Total Amount</p>
                <p className="text-sm md:text-base font-bold text-emerald-600 mt-1 truncate">{formatNaira(totalAmount)}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <button
              className={`w-full h-full rounded-xl md:rounded-2xl p-3 md:p-4 font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                selectedCount > 0 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              onClick={() => selectedCount > 0 && setShowModal(true)}
              disabled={selectedCount === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm md:text-base">Create Bill</span>
            </button>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="mb-4 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 min-w-max">
            <button
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
              onClick={() => setActiveTab('all')}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                All Scans
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{allBillableDetails.length}</span>
              </div>
            </button>
            
            {requests.map((request) => {
              const count = request.details?.filter(d => d.status === "pending" || d.status === "partly_billed").length || 0;
              if (count === 0) return null;
              return (
                <button
                  key={request.id}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === request.id.toString()
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                  onClick={() => setActiveTab(request.id.toString())}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    RAD#{request.id}
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{count}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Bar */}
        {currentTabDetails.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 mb-4 flex gap-2 shadow-md">
            <button
              className="flex-1 px-3 py-2 text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:shadow-md transition-all duration-300"
              onClick={isAllInTabSelected() ? deselectAllInTab : selectAllInTab}
            >
              {isAllInTabSelected() ? 'Deselect Tab' : 'Select Tab'}
            </button>
            <button
              className="flex-1 px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:shadow-md transition-all duration-300"
              onClick={selectedCount === allBillableDetails.length ? clearAll : selectAll}
            >
              {selectedCount === allBillableDetails.length ? 'Clear All' : 'Select All'}
            </button>
          </div>
        )}

        {/* Beautiful Items Grid */}
        <div className="space-y-3">
          {currentTabDetails.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-4">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Billable Scans</h3>
              <p className="text-gray-500 text-sm">All scans have been billed or there are no pending investigations.</p>
            </div>
          ) : (
            currentTabDetails.map((detail) => {
              const isChecked = selectedItems.has(detail.id);
              const amount = parseFloat(detail.total_price || detail.unit_price || 0);

              return (
                <div
                  key={detail.id}
                  className={`group bg-white rounded-xl md:rounded-2xl p-4 shadow-md transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                    isChecked 
                      ? 'border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 to-transparent shadow-emerald-100' 
                      : 'border border-gray-200 hover:shadow-xl'
                  }`}
                  onClick={() => toggleItem(detail.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-2 border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer transition-all duration-200"
                        checked={isChecked}
                        onChange={() => toggleItem(detail.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {isChecked && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-base">
                            {detail.investigation_title}
                          </h3>
                          {detail.investigation_view_title && (
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {detail.investigation_view_title}
                            </p>
                          )}
                          {detail.notes && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2 bg-gray-50 p-2 rounded-lg">
                              📝 {detail.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-700 text-lg">
                            {formatNaira(amount)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {getStatusBadge(detail.status)}
                        {activeTab === 'all' && (
                          <>
                            {getUrgencyBadge(detail.urgency)}
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                              RAD#{detail.requestId}
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

        {/* Sticky Footer Summary */}
        {currentTabDetails.length > 0 && (
          <div className="sticky bottom-0 mt-4 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 p-4 backdrop-blur-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Selected Items</p>
                <p className="text-lg font-bold text-amber-600">{selectedCount} of {currentTabDetails.length}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {formatNaira(totalAmount)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Elegant Modal */}
      <ReusableModal show={showModal} onClose={() => setShowModal(false)}>
        <div className="relative p-6">
          {/* Decorative gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Bill Creation</h3>
              <p className="text-sm text-gray-500">Review and confirm billing details</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 mb-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-purple-600 font-medium mb-1">Scans to Bill</p>
                <p className="text-2xl font-bold text-gray-800">{selectedCount}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-purple-600 font-medium mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-emerald-600">{formatNaira(totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-800">
                This will create a bill for the selected radiology investigations. The bill will be added to the patient's account.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300"
              onClick={() => setShowModal(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
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
                  Confirm & Create Bill
                </>
              )}
            </button>
          </div>
        </div>
      </ReusableModal>
    </div>
  );
};

export default RadiologyBillingPage;