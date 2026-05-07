// dispensaryComponents/PrescriptionDetails.jsx
import React from 'react';
import PaymentStatusBadge from './PaymentStatusBadge';
import BatchSelector from './BatchSelector';

const PrescriptionDetails = ({
  selectedPatient,
  prescriptions,
  selectedPrescription,
  loadingPrescriptions,
  selectedBatchSelections,
  quantities,
  availableBatches,
  loadingBatches,
  isPrescriptionReadyForBill,
  isPrescriptionReadyForDispense,
  total,
  onSelectPrescription,
  onFetchBatches,
  onBatchSelect,
  onQuantityChange,
  onGenerateBill,
  onDispense,
  loading
}) => {

  if (!selectedPatient || !selectedPatient.id) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-full flex items-center justify-center min-h-[400px]">
        <div className="text-center p-6">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-gray-500">Select a patient from the queue</p>
          <p className="text-xs text-gray-400 mt-1">Click on any patient to view their prescriptions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Patient Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">{selectedPatient.name}</h3>
            <p className="text-[10px] text-emerald-100">
              HN: {selectedPatient.hospital_number || 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium">
              {prescriptions.length} Prescription{prescriptions.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Tabs */}
      {prescriptions.length > 1 && (
        <div className="flex gap-1 p-2 border-b bg-gray-50 overflow-x-auto">
          {prescriptions.map(rx => (
            <button
              key={rx.id}
              onClick={() => onSelectPrescription(rx)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                selectedPrescription?.id === rx.id
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {new Date(rx.date_prescribed).toLocaleDateString()}
              <PaymentStatusBadge status={rx.status} size="small" />
            </button>
          ))}
        </div>
      )}

      {/* Prescription Content */}
      {loadingPrescriptions ? (
        <div className="py-8 text-center">
          <div className="inline-block w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 mt-2">Loading prescriptions...</p>
        </div>
      ) : !selectedPrescription ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">No active prescriptions</p>
        </div>
      ) : (
        <>
          {/* Prescription Info */}
          <div className="px-4 py-2 bg-gray-50 border-b flex justify-between items-center text-xs">
            <div>
              <span className="text-gray-500">Prescribed by:</span>
              <span className="ml-1 font-medium">{selectedPrescription.prescribed_by_name || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <span className="ml-1">{new Date(selectedPrescription.date_prescribed).toLocaleString()}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {selectedPrescription.details?.map(detail => {
                const isPaid = detail.status === 'paid';
                const isBilled = detail.status === 'billed';
                const canEdit = !isPaid && !isBilled;
                const hasSelection = selectedBatchSelections[detail.id];
                
                return (
                  <div key={detail.id} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-800 text-sm">
                          {detail.product_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Prescribed: {detail.quantity_prescribed} units
                        </div>
                        {detail.dose && detail.frequency && (
                          <div className="text-[10px] text-gray-400 mt-1">
                            {detail.dose} • {detail.frequency} • {detail.duration} days
                          </div>
                        )}
                      </div>
                      <PaymentStatusBadge status={detail.status} />
                    </div>
                    
                    {/* Batch Selection (only if not already paid/billed) */}
                    {canEdit ? (
                      <BatchSelector
                        detailId={detail.id}
                        productId={detail.product}
                        prescribedQuantity={detail.quantity_prescribed}
                        selectedBatch={selectedBatchSelections[detail.id]}
                        quantity={quantities[detail.id]}
                        availableBatches={availableBatches[detail.id]}
                        loading={loadingBatches[detail.id]}
                        onFetchBatches={() => onFetchBatches(detail.id, detail.product)}
                        onBatchSelect={(batchId, maxQty, unitPrice) => 
                          onBatchSelect(detail.id, batchId, maxQty, unitPrice)
                        }
                        onQuantityChange={(qty) => onQuantityChange(detail.id, qty)}
                      />
                    ) : (
                      /* Display selected batch for paid/billed items */
                      hasSelection && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-gray-500">Batch:</span>
                              <span className="ml-1 font-mono">
                                {selectedBatchSelections[detail.id]?.batch_id || 'Selected'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Qty:</span>
                              <span className="ml-1 font-medium">{quantities[detail.id] || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Amount:</span>
                              <span className="ml-1 font-medium text-emerald-600">
                                ₦{((quantities[detail.id] || 0) * (selectedBatchSelections[detail.id]?.unit_price || 0)).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
          </div>

          {/* Summary and Actions */}
          <div className="border-t bg-gray-50 p-3">
            {/* Total Amount */}
            {total > 0 && (
              <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <span className="text-sm font-semibold text-gray-700">Total:</span>
                <span className="text-lg font-bold text-emerald-600">₦{total.toLocaleString()}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isPrescriptionReadyForBill && (
                <button
                  onClick={onGenerateBill}
                  disabled={loading || total === 0}
                  className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Generate Bill
                </button>
              )}
              
              {isPrescriptionReadyForDispense && (
                <button
                  onClick={onDispense}
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Dispense
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PrescriptionDetails;