// dispensaryComponents/DispensaryDetail.jsx - Complete with auto-refresh after dispensing

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';
import PaymentStatusBadge from './PaymentStatusBadge';
import BrandBatchSelector from './BrandBatchSelector';
import DispenseConfirmModal from './DispenseConfirmModal';

const DispensaryDetail = ({ 
  selectedPatient, 
  selectedPrescription,
  storeId,
  storeName,
  loading,
  onBack,
  onPrescriptionSelect,
  onRefreshPatient
}) => {
  const { showMessage } = useMessage();
  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});
  const [availableBatches, setAvailableBatches] = useState({});
  const [loadingBatches, setLoadingBatches] = useState({});
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseItems, setDispenseItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [includedItems, setIncludedItems] = useState({});

  // Load billed items from PrescriptionDetailBill table
  const loadBilledItems = async () => {
    if (!selectedPrescription) return;
    
    try {
      console.log('🔍 Loading billed items for prescription:', selectedPrescription.id);
      const response = await axiosInstance.get(`/pharmacyapi/prescriptions/${selectedPrescription.id}/billed-items/`);
      const billedItems = response.data;
      
      console.log('🔍 Billed items from database:', billedItems);
      
      if (billedItems.length > 0) {
        const newSelectedItems = {};
        const newQuantities = {};
        const newIncludedItems = {};
        
        billedItems.forEach(item => {
          newSelectedItems[item.detail_id] = {
            batch_id: item.batch_id,
            batch_no: item.batch_no,
            brand_name: item.brand_name,
            unit_price: item.unit_price,
            max_quantity: item.quantity,
            quantity: item.quantity,
            bill_id: item.bill_id,
            bill_status: item.bill_status,
            is_paid: item.is_paid
          };
          newQuantities[item.detail_id] = item.quantity;
          newIncludedItems[item.detail_id] = true;
        });
        
        setSelectedItems(newSelectedItems);
        setQuantities(newQuantities);
        setIncludedItems(newIncludedItems);
      } else {
        // No billed items, reset selections for pending items
        setSelectedItems({});
        setQuantities({});
        const initialIncluded = {};
        selectedPrescription.details?.forEach(detail => {
          if (detail.status === 'pending') {
            initialIncluded[detail.id] = true;
          }
        });
        setIncludedItems(initialIncluded);
      }
    } catch (error) {
      console.error('Error loading billed items:', error);
    }
  };

  // Load billed items when prescription is selected or status changes
  useEffect(() => {
    loadBilledItems();
  }, [selectedPrescription?.id, selectedPrescription?.status]);

  // Fetch all prescriptions for this patient
  useEffect(() => {
    if (selectedPatient?.id && storeId) {
      fetchPatientAllPrescriptions();
    }
  }, [selectedPatient?.id, storeId]);

  const fetchPatientAllPrescriptions = async () => {
    try {
      const response = await axiosInstance.get(`/pharmacyapi/patient-prescriptions/${selectedPatient.id}/?store_id=${storeId}`);
      
      let prescriptionsData = [];
      if (Array.isArray(response.data)) {
        prescriptionsData = response.data;
      } else if (typeof response.data === 'object' && response.data !== null) {
        prescriptionsData = Object.values(response.data);
      }
      
      setPatientPrescriptions(prescriptionsData);
      
      if (selectedPrescription) {
        const updatedPrescription = prescriptionsData.find(rx => rx.id === selectedPrescription.id);
        if (updatedPrescription && updatedPrescription.status !== selectedPrescription.status) {
          console.log('Status changed from', selectedPrescription.status, 'to', updatedPrescription.status);
          onPrescriptionSelect(updatedPrescription);
          
          if (updatedPrescription.status === 'paid') {
            showMessage('Payment received! Ready to dispense.', 'success');
            // Reload billed items when payment is received
            loadBilledItems();
          }
        }
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const prescriptionDetails = selectedPrescription?.details || [];

  // Polling for status changes
  useEffect(() => {
    if (!pollingActive) return;
    if (!selectedPrescription || selectedPrescription.status !== 'billed') {
      setPollingActive(false);
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await axiosInstance.get(`/pharmacyapi/patient-prescriptions/${selectedPatient.id}/?store_id=${storeId}`);
        
        let prescriptionsData = [];
        if (Array.isArray(response.data)) {
          prescriptionsData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          prescriptionsData = Object.values(response.data);
        }
        
        const updatedPrescription = prescriptionsData.find(rx => rx.id === selectedPrescription.id);
        
        if (updatedPrescription && updatedPrescription.status !== selectedPrescription.status) {
          setPollingActive(false);
          onPrescriptionSelect(updatedPrescription);
          
          if (updatedPrescription.status === 'paid') {
            showMessage('Payment received! Ready to dispense.', 'success');
            loadBilledItems();
          }
          if (onRefreshPatient) onRefreshPatient(selectedPatient.id);
        }
      } catch (error) {
        console.error('Error polling:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pollingActive, selectedPrescription, selectedPatient, storeId, onPrescriptionSelect, onRefreshPatient, showMessage]);

  useEffect(() => {
    if (selectedPrescription?.status === 'billed' && !pollingActive) {
      setPollingActive(true);
    }
  }, [selectedPrescription?.status]);

  const toggleIncludeItem = (detailId) => {
    setIncludedItems(prev => ({ ...prev, [detailId]: !prev[detailId] }));
  };

  const fetchAvailableBatches = async (detailId, productId) => {
    if (availableBatches[detailId]) return;
    
    setLoadingBatches(prev => ({ ...prev, [detailId]: true }));
    try {
      const response = await axiosInstance.get(`/pharmacyapi/prescription-details/${detailId}/available-batches/?store_id=${storeId}`);
      setAvailableBatches(prev => ({ ...prev, [detailId]: response.data }));
      
      if (response.data.length > 0 && !selectedItems[detailId]) {
        const firstBatch = response.data[0];
        handleBatchSelect(detailId, firstBatch.batch_id, firstBatch.brand_name, firstBatch.unit_price, firstBatch.available_quantity);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoadingBatches(prev => ({ ...prev, [detailId]: false }));
    }
  };

  const handleBatchSelect = (detailId, batchId, brandName, unitPrice, maxQuantity) => {
    setSelectedItems(prev => ({
      ...prev,
      [detailId]: { batch_id: batchId, brand_name: brandName, unit_price: unitPrice, max_quantity: maxQuantity }
    }));
    
    const detail = prescriptionDetails.find(d => d.id === detailId);
    if (detail) {
      const defaultQty = Math.min(detail.quantity_prescribed, maxQuantity);
      setQuantities(prev => ({ ...prev, [detailId]: defaultQty }));
    }
  };

  const handleQuantityChange = (detailId, value) => {
    const qty = parseInt(value) || 0;
    const maxQty = selectedItems[detailId]?.max_quantity || 0;
    if (qty <= maxQty) {
      setQuantities(prev => ({ ...prev, [detailId]: qty }));
    }
  };

  const calculateTotal = () => {
    let total = 0;
    for (const detail of prescriptionDetails) {
      if (detail.status !== 'pending') continue;
      if (!includedItems[detail.id]) continue;
      const selection = selectedItems[detail.id];
      const quantity = quantities[detail.id];
      if (selection && quantity > 0) total += quantity * selection.unit_price;
    }
    return total;
  };

  const handleGenerateBill = async () => {
    const itemsToBill = [];
    const detailIdsToBill = [];
    
    for (const detail of prescriptionDetails) {
      if (detail.status !== 'pending') continue;
      if (!includedItems[detail.id]) continue;
      
      const selection = selectedItems[detail.id];
      const quantity = quantities[detail.id];
      
      if (selection && quantity > 0) {
        itemsToBill.push({
          content_type: 'prescriptiondetail',
          object_id: detail.id,
          batch_id: selection.batch_id,
          quantity: quantity,
          unit_price: selection.unit_price,
          amount: quantity * selection.unit_price,
          description: `${detail.product_name} - ${quantity} units`
        });
        detailIdsToBill.push(detail.id);
      }
    }
    
    if (itemsToBill.length === 0) {
      showMessage('Select at least one item to bill', 'warning');
      return;
    }
    
    setProcessing(true);
    try {
      await axiosInstance.post('/billsapi/bills/', {
        patient: selectedPatient.id,
        source: itemsToBill,
        description: 'Pharmacy Dispensing'
      });
      
      await axiosInstance.post(`/pharmacyapi/prescriptions/${selectedPrescription.id}/bill-items/`, {
        detail_ids: detailIdsToBill
      });
      
      showMessage(`Bill generated for ${itemsToBill.length} item(s)`, 'success');
      
      // Reload billed items after billing
      await loadBilledItems();
      
      // Refresh prescription data
      const response = await axiosInstance.get(`/pharmacyapi/patient-prescriptions/${selectedPatient.id}/?store_id=${storeId}`);
      let prescriptionsData = [];
      if (Array.isArray(response.data)) {
        prescriptionsData = response.data;
      } else if (typeof response.data === 'object' && response.data !== null) {
        prescriptionsData = Object.values(response.data);
      }
      const updatedPrescription = prescriptionsData.find(rx => rx.id === selectedPrescription.id);
      if (updatedPrescription) {
        onPrescriptionSelect(updatedPrescription);
      }
      
      if (onRefreshPatient) onRefreshPatient(selectedPatient.id);
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error generating bill', 'danger');
    } finally {
      setProcessing(false);
    }
  };

  const handleDispense = () => {
    console.log('=== DISPENSE CHECK ===');
    console.log('Selected items:', selectedItems);
    
    const itemsToDispense = [];
    
    for (const [detailId, selection] of Object.entries(selectedItems)) {
      const detail = prescriptionDetails.find(d => d.id === parseInt(detailId));
      // Only dispense if the detail is paid
      if (detail && detail.status === 'paid') {
        const quantity = quantities[detailId] || selection.quantity || selection.max_quantity;
        if (quantity > 0) {
          itemsToDispense.push({
            detail_id: parseInt(detailId),
            batch_id: selection.batch_id,
            brand_name: selection.brand_name,
            quantity: quantity,
            unit_price: selection.unit_price
          });
        }
      }
    }
    
    console.log('Items to dispense:', itemsToDispense);
    
    if (itemsToDispense.length === 0) {
      showMessage('No paid items ready for dispensing', 'warning');
      return;
    }
    
    setDispenseItems(itemsToDispense);
    setShowDispenseModal(true);
  };

  const handleConfirmDispense = async () => {
    setShowDispenseModal(false);
    setProcessing(true);
    try {
      await axiosInstance.post(`/pharmacyapi/prescriptions/${selectedPrescription.id}/dispense-items/`, {
        store_id: storeId,
        items: dispenseItems
      });
      showMessage('Dispensed successfully!', 'success');
      
      // Wait a moment for backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reload billed items after dispense to update status
      await loadBilledItems();
      
      // Refresh prescription data to get updated statuses
      const response = await axiosInstance.get(`/pharmacyapi/patient-prescriptions/${selectedPatient.id}/?store_id=${storeId}`);
      let prescriptionsData = [];
      if (Array.isArray(response.data)) {
        prescriptionsData = response.data;
      } else if (typeof response.data === 'object' && response.data !== null) {
        prescriptionsData = Object.values(response.data);
      }
      const updatedPrescription = prescriptionsData.find(rx => rx.id === selectedPrescription.id);
      if (updatedPrescription) {
        onPrescriptionSelect(updatedPrescription);
      }
      
      // Refresh the parent queue
      if (onRefreshPatient) {
        await onRefreshPatient(selectedPatient.id);
      }
      
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error dispensing', 'danger');
    } finally {
      setProcessing(false);
    }
  };

  const total = calculateTotal();
  const pendingItems = prescriptionDetails.filter(d => d.status === 'pending');
  const pendingSelectedCount = pendingItems.filter(d => includedItems[d.id]).length;
  const billedCount = prescriptionDetails.filter(d => d.status === 'billed').length;
  const paidCount = prescriptionDetails.filter(d => d.status === 'paid').length;
  const dispensedCount = prescriptionDetails.filter(d => d.status === 'dispensed').length;
  const hasPendingSelected = pendingSelectedCount > 0 && total > 0;
  const hasPaidItems = paidCount > 0;

  if (!selectedPatient) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-xs text-gray-500">Select a patient from the queue</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="lg:hidden p-1 text-white hover:bg-white/20 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h3 className="font-bold text-white text-sm">{selectedPatient.name}</h3>
                <p className="text-xs text-purple-100">HN: {selectedPatient.hospital_number}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/80">{storeName?.substring(0, 15)}</div>
              <div className="text-xs text-purple-100">{selectedPrescription?.status}</div>
            </div>
          </div>
        </div>

        {/* Prescription Tabs */}
        {patientPrescriptions.length > 1 && (
          <div className="flex gap-1 p-1 border-b bg-gray-50 overflow-x-auto">
            {patientPrescriptions.map(rx => (
              <button
                key={rx.id}
                onClick={() => onPrescriptionSelect(rx)}
                className={`px-2 py-1 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1 transition ${
                  selectedPrescription?.id === rx.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {new Date(rx.date_prescribed).toLocaleDateString()}
                <PaymentStatusBadge status={rx.status} size="small" />
              </button>
            ))}
          </div>
        )}

        {!selectedPrescription ? (
          <div className="py-3 text-center text-sm text-gray-500">No active prescriptions</div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {pendingSelectedCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">
                      <span className="text-sm">📋</span> {pendingSelectedCount} pending
                    </span>
                  )}
                  {billedCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold">
                      <span className="text-sm">💰</span> {billedCount} billed
                    </span>
                  )}
                  {paidCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                      <span className="text-sm">✅</span> {paidCount} paid
                    </span>
                  )}
                  {dispensedCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                      <span className="text-sm">🎁</span> {dispensedCount} done
                    </span>
                  )}
                </div>
                
                {hasPendingSelected && (
                  <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-xl shadow-sm">
                    <span className="text-sm font-semibold text-purple-800">Total:</span>
                    <span className="text-lg md:text-xl font-bold text-purple-700">
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Items List */}
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {prescriptionDetails.map(detail => {
                const isPaid = detail.status === 'paid';
                const isBilled = detail.status === 'billed';
                const isPending = detail.status === 'pending';
                const isDispensed = detail.status === 'dispensed';
                const hasSelection = selectedItems[detail.id];
                const isIncluded = includedItems[detail.id];
                
                let statusBadge = '';
                let statusColor = '';
                if (isDispensed) { statusBadge = 'Done'; statusColor = 'bg-purple-100 text-purple-700'; }
                else if (isPaid) { statusBadge = 'Ready'; statusColor = 'bg-green-100 text-green-700'; }
                else if (isBilled) { statusBadge = 'Billed'; statusColor = 'bg-yellow-100 text-yellow-700'; }
                else { statusBadge = 'Pending'; statusColor = 'bg-gray-100 text-gray-700'; }
                
                return (
                  <div key={detail.id} className={`p-2 ${!isPending ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-start gap-2">
                      {/* Checkbox - only for pending items */}
                      {isPending && (
                        <input
                          type="checkbox"
                          checked={isIncluded}
                          onChange={() => toggleIncludeItem(detail.id)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      )}
                      {!isPending && <div className={`w-2 h-2 rounded-full mt-1.5 ${isPaid ? 'bg-green-500' : isBilled ? 'bg-yellow-500' : 'bg-purple-500'}`}></div>}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className={`text-sm font-medium truncate ${!isIncluded && isPending ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {detail.product_name}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColor} whitespace-nowrap`}>
                            {statusBadge}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{detail.quantity_prescribed} units</div>
                        
                        {/* Batch Selection - Only for pending included items */}
                        {isPending && isIncluded && (
                          <BrandBatchSelector
                            detailId={detail.id}
                            productId={detail.product}
                            prescribedQuantity={detail.quantity_prescribed}
                            selectedItem={selectedItems[detail.id]}
                            quantity={quantities[detail.id]}
                            availableBatches={availableBatches[detail.id]}
                            loading={loadingBatches[detail.id]}
                            onFetchBatches={() => fetchAvailableBatches(detail.id, detail.product)}
                            onBatchSelect={handleBatchSelect}
                            onQuantityChange={handleQuantityChange}
                          />
                        )}
                        
                        {/* Selected batch summary for non-pending items */}
                        {!isPending && hasSelection && (
                          <div className="mt-1 text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{selectedItems[detail.id]?.brand_name}</span>
                            <span className="text-gray-400">({selectedItems[detail.id]?.batch_no})</span>
                            <span>Qty: {quantities[detail.id] || selectedItems[detail.id]?.quantity}</span>
                            <span className="text-purple-600">₦{((quantities[detail.id] || selectedItems[detail.id]?.quantity) * selectedItems[detail.id]?.unit_price).toLocaleString()}</span>
                          </div>
                        )}
                        
                        {/* Excluded message */}
                        {isPending && !isIncluded && (
                          <div className="mt-0.5 text-xs text-gray-400 italic">Excluded from billing</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="border-t bg-gray-50 p-2 flex gap-2">
              {hasPendingSelected && (
                <button
                  onClick={handleGenerateBill}
                  disabled={processing}
                  className="flex-1 px-2 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Bill ({pendingSelectedCount})
                </button>
              )}
              
              {hasPaidItems && (
                <button
                  onClick={handleDispense}
                  disabled={processing}
                  className="flex-1 px-2 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Dispense ({paidCount})
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <DispenseConfirmModal
        show={showDispenseModal}
        onClose={() => setShowDispenseModal(false)}
        onConfirm={handleConfirmDispense}
        items={dispenseItems}
        loading={processing}
      />
    </>
  );
};

export default DispensaryDetail;