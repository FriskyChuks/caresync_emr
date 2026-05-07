// dispensaryComponents/DispensaryDetail.jsx - Compact but detailed
import React, { useState, useEffect, useRef } from 'react';
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
  
  const savedSelectionsRef = useRef({});
  const savedQuantitiesRef = useRef({});
  const savedIncludedItemsRef = useRef({});

  useEffect(() => {
    if (selectedPatient?.id && storeId) {
      fetchPatientAllPrescriptions();
    }
  }, [selectedPatient?.id, storeId]);

  useEffect(() => {
    if (selectedPrescription) {
      const prescriptionId = selectedPrescription.id;
      
      if (savedSelectionsRef.current[prescriptionId]) {
        setSelectedItems(savedSelectionsRef.current[prescriptionId]);
        setQuantities(savedQuantitiesRef.current[prescriptionId] || {});
        setIncludedItems(savedIncludedItemsRef.current[prescriptionId] || {});
      } else {
        const initialIncluded = {};
        selectedPrescription.details?.forEach(detail => {
          if (detail.status === 'pending') initialIncluded[detail.id] = true;
        });
        setIncludedItems(initialIncluded);
        setSelectedItems({});
        setQuantities({});
      }
      
      setAvailableBatches({});
      setPollingActive(false);
    }
  }, [selectedPrescription?.id]);

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
        if (updatedPrescription) {
          let detailsChanged = false;
          if (updatedPrescription.details && selectedPrescription.details) {
            for (let i = 0; i < updatedPrescription.details.length; i++) {
              const oldDetail = selectedPrescription.details.find(d => d.id === updatedPrescription.details[i].id);
              if (oldDetail && oldDetail.status !== updatedPrescription.details[i].status) {
                detailsChanged = true;
                break;
              }
            }
          }
          
          const statusChanged = updatedPrescription.status !== selectedPrescription.status;
          
          if (statusChanged || detailsChanged) {
            const currentPendingSelections = {};
            const currentPendingQuantities = {};
            const currentIncludedItems = {};
            
            for (const detail of prescriptionDetails) {
              const updatedDetail = updatedPrescription.details?.find(d => d.id === detail.id);
              if (updatedDetail && updatedDetail.status === 'pending') {
                if (selectedItems[detail.id]) currentPendingSelections[detail.id] = selectedItems[detail.id];
                if (quantities[detail.id]) currentPendingQuantities[detail.id] = quantities[detail.id];
                if (includedItems[detail.id]) currentIncludedItems[detail.id] = includedItems[detail.id];
              }
            }
            
            onPrescriptionSelect(updatedPrescription);
            
            if (Object.keys(currentPendingSelections).length > 0) {
              setTimeout(() => {
                setSelectedItems(currentPendingSelections);
                setQuantities(currentPendingQuantities);
                setIncludedItems(currentIncludedItems);
              }, 100);
            }
            
            if (statusChanged && updatedPrescription.status === 'paid') {
              showMessage('Payment received! Ready to dispense.', 'success');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const prescriptionDetails = selectedPrescription?.details || [];

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
          fetchPatientAllPrescriptions();
          
          if (updatedPrescription.status === 'paid') {
            showMessage('Payment received! Ready to dispense.', 'success');
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

  const refreshPrescriptionData = async () => {
    try {
      const response = await axiosInstance.get(`/pharmacyapi/patient-prescriptions/${selectedPatient.id}/?store_id=${storeId}`);
      
      let prescriptionsData = [];
      if (Array.isArray(response.data)) {
        prescriptionsData = response.data;
      } else if (typeof response.data === 'object' && response.data !== null) {
        prescriptionsData = Object.values(response.data);
      }
      
      const updatedPrescription = prescriptionsData.find(rx => rx.id === selectedPrescription.id);
      
      if (updatedPrescription) {
        const currentPendingSelections = {};
        const currentPendingQuantities = {};
        const currentIncludedItems = {};
        
        for (const detail of prescriptionDetails) {
          const updatedDetail = updatedPrescription.details?.find(d => d.id === detail.id);
          if (updatedDetail && updatedDetail.status === 'pending') {
            if (selectedItems[detail.id]) currentPendingSelections[detail.id] = selectedItems[detail.id];
            if (quantities[detail.id]) currentPendingQuantities[detail.id] = quantities[detail.id];
            if (includedItems[detail.id]) currentIncludedItems[detail.id] = includedItems[detail.id];
          }
        }
        
        onPrescriptionSelect(updatedPrescription);
        
        if (Object.keys(currentPendingSelections).length > 0) {
          setTimeout(() => {
            setSelectedItems(currentPendingSelections);
            setQuantities(currentPendingQuantities);
            setIncludedItems(currentIncludedItems);
          }, 100);
        }
      }
      
      fetchPatientAllPrescriptions();
    } catch (error) {
      console.error('Error refreshing:', error);
    }
  };

  const toggleIncludeItem = (detailId) => {
    setIncludedItems(prev => ({ ...prev, [detailId]: !prev[detailId] }));
    if (selectedPrescription) {
      savedIncludedItemsRef.current[selectedPrescription.id] = {
        ...savedIncludedItemsRef.current[selectedPrescription.id],
        [detailId]: !includedItems[detailId]
      };
    }
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
      
      const prescriptionId = selectedPrescription.id;
      savedSelectionsRef.current[prescriptionId] = {
        ...savedSelectionsRef.current[prescriptionId],
        [detailId]: { batch_id: batchId, brand_name: brandName, unit_price: unitPrice, max_quantity: maxQuantity }
      };
      savedQuantitiesRef.current[prescriptionId] = {
        ...savedQuantitiesRef.current[prescriptionId],
        [detailId]: defaultQty
      };
    }
  };

  const handleQuantityChange = (detailId, value) => {
    const qty = parseInt(value) || 0;
    const maxQty = selectedItems[detailId]?.max_quantity || 0;
    if (qty <= maxQty) {
      setQuantities(prev => ({ ...prev, [detailId]: qty }));
      const prescriptionId = selectedPrescription.id;
      savedQuantitiesRef.current[prescriptionId] = {
        ...savedQuantitiesRef.current[prescriptionId],
        [detailId]: qty
      };
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
      await refreshPrescriptionData();
      if (onRefreshPatient) onRefreshPatient(selectedPatient.id);
    } catch (error) {
      console.error('Error:', error);
      showMessage('Error generating bill', 'danger');
    } finally {
      setProcessing(false);
    }
  };

  const handleDispense = () => {
    const itemsToDispense = [];
    for (const detail of prescriptionDetails) {
      if (detail.status === 'paid') {
        const selection = selectedItems[detail.id];
        const quantity = quantities[detail.id];
        if (selection && quantity > 0) {
          itemsToDispense.push({
            detail_id: detail.id,
            batch_id: selection.batch_id,
            brand_name: selection.brand_name,
            quantity: quantity,
            unit_price: selection.unit_price
          });
        }
      }
    }
    
    if (itemsToDispense.length === 0) {
      showMessage('No paid items ready', 'warning');
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
      await refreshPrescriptionData();
      if (onRefreshPatient) onRefreshPatient(selectedPatient.id);
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
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="lg:hidden p-0.5 text-white hover:bg-white/20 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h3 className="font-bold text-white text-sm">{selectedPatient.name}</h3>
                <p className="text-[9px] text-emerald-100">HN: {selectedPatient.hospital_number}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-white/80">{storeName?.substring(0, 15)}</div>
              <div className="text-[8px] text-emerald-100">{selectedPrescription?.status}</div>
            </div>
          </div>
        </div>

        {/* Prescription Tabs - Compact */}
        {patientPrescriptions.length > 1 && (
          <div className="flex gap-0.5 p-1 border-b bg-gray-50 overflow-x-auto">
            {patientPrescriptions.map(rx => (
              <button
                key={rx.id}
                onClick={() => onPrescriptionSelect(rx)}
                className={`px-2 py-0.5 text-[9px] font-medium rounded whitespace-nowrap flex items-center gap-1 ${
                  selectedPrescription?.id === rx.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {new Date(rx.date_prescribed).toLocaleDateString()}
                <PaymentStatusBadge status={rx.status} size="small" />
              </button>
            ))}
          </div>
        )}

        {!selectedPrescription ? (
          <div className="py-3 text-center text-xs text-gray-500">No active prescriptions</div>
        ) : (
          <>
            {/* Compact Stats Bar */}
            <div className="px-2 py-1 bg-gray-50 border-b flex justify-between items-center text-[9px]">
              <div className="flex gap-2">
                {pendingSelectedCount > 0 && <span>📋 {pendingSelectedCount} pending</span>}
                {billedCount > 0 && <span className="text-yellow-600">💰 {billedCount} billed</span>}
                {paidCount > 0 && <span className="text-green-600">✅ {paidCount} paid</span>}
                {dispensedCount > 0 && <span className="text-purple-600">🎁 {dispensedCount} done</span>}
              </div>
              {hasPendingSelected && <span className="font-bold text-emerald-600">₦{total.toLocaleString()}</span>}
            </div>

            {/* Items List - More Compact */}
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
                          className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 focus:ring-emerald-500"
                        />
                      )}
                      {!isPending && <div className={`w-2 h-2 rounded-full mt-1.5 ${isPaid ? 'bg-green-500' : isBilled ? 'bg-yellow-500' : 'bg-purple-500'}`}></div>}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className={`text-xs font-medium truncate ${!isIncluded && isPending ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {detail.product_name}
                          </span>
                          <span className={`text-[8px] px-1 py-0.5 rounded ${statusColor} whitespace-nowrap`}>
                            {statusBadge}
                          </span>
                        </div>
                        <div className="text-[9px] text-gray-500">{detail.quantity_prescribed} units</div>
                        
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
                          <div className="mt-1 text-[9px] text-gray-500 flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{selectedItems[detail.id]?.brand_name}</span>
                            <span className="text-gray-400">({selectedItems[detail.id]?.batch_id})</span>
                            <span>Qty: {quantities[detail.id] || 0}</span>
                            <span className="text-emerald-600">₦{((quantities[detail.id] || 0) * (selectedItems[detail.id]?.unit_price || 0)).toLocaleString()}</span>
                          </div>
                        )}
                        
                        {/* Excluded message */}
                        {isPending && !isIncluded && (
                          <div className="mt-0.5 text-[8px] text-gray-400 italic">Excluded from billing</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons - Compact */}
            <div className="border-t bg-gray-50 p-2 flex gap-2">
              {hasPendingSelected && (
                <button
                  onClick={handleGenerateBill}
                  disabled={processing}
                  className="flex-1 px-2 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Bill ({pendingSelectedCount})
                </button>
              )}
              
              {hasPaidItems && (
                <button
                  onClick={handleDispense}
                  disabled={processing}
                  className="flex-1 px-2 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded flex items-center justify-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Dispense ({paidCount})
                </button>
              )}
            </div>
            
            {/* Empty state message */}
            {!hasPendingSelected && !hasPaidItems && pendingItems.length > 0 && (
              <div className="text-center text-[10px] text-gray-400 py-2 border-t">
                Select items above to generate a bill
              </div>
            )}
            {!hasPendingSelected && !hasPaidItems && pendingItems.length === 0 && prescriptionDetails.length > 0 && (
              <div className="text-center text-[10px] text-gray-400 py-2 border-t">
                All items processed
              </div>
            )}
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