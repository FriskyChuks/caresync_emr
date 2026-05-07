import React, { useState } from 'react';

const TransfersList = ({ 
  transfers, 
  loading,
  user, 
  userStoreId,
  canSeeAllTransfers,
  onHonorTransfer, 
  onDeclineTransfer,
  getStatusBadge 
}) => {
  const [selectedDeclineTransfer, setSelectedDeclineTransfer] = useState(null);
  const [showDeclineReasonModal, setShowDeclineReasonModal] = useState(false);

  const handleViewDeclineReason = (transfer) => {
    setSelectedDeclineTransfer(transfer);
    setShowDeclineReasonModal(true);
  };

  // Filter transfers based on user permissions
  const filteredTransfers = React.useMemo(() => {
    if (!user || !transfers) return [];
    
    // Admin/Manager can see all transfers
    if (canSeeAllTransfers) {
      return transfers;
    }
    
    // Regular users only see transfers involving their store
    if (userStoreId) {
      return transfers.filter(transfer => 
        transfer.from_store === userStoreId || 
        transfer.to_store === userStoreId
      );
    }
    
    return [];
  }, [transfers, user, canSeeAllTransfers, userStoreId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border p-6 text-center">
        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-xs text-gray-500">Loading transfers...</p>
      </div>
    );
  }

  if (filteredTransfers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <p className="text-xs text-gray-500">
          {!userStoreId && !canSeeAllTransfers
            ? 'No store assigned'
            : transfers.length === 0 
              ? 'No transfer requests'
              : 'No transfers for your store'
          }
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-800">
                Transfers ({filteredTransfers.length})
              </h3>
            </div>
            {canSeeAllTransfers && transfers.length !== filteredTransfers.length && (
              <div className="text-[10px] text-gray-500">
                Showing {filteredTransfers.length} of {transfers.length}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-2 px-3 text-left font-medium text-gray-600">ID</th>
                <th className="py-2 px-3 text-left font-medium text-gray-600">Product</th>
                <th className="py-2 px-3 text-left font-medium text-gray-600">Brand</th>
                <th className="py-2 px-3 text-left font-medium text-gray-600">Transferring Store</th>
                <th className="py-2 px-3 text-left font-medium text-gray-600">Requesting/Receiving Store</th>
                <th className="py-2 px-3 text-left font-medium text-gray-600">Qty</th>
                <th className="py-2 px-3 text-left font-medium text-gray-600">Status</th>
                <th className="py-2 px-3 text-left font-medium text-gray-600">Date</th>
                <th className="py-2 px-3 text-center font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransfers.map(transfer => (
                <TransferRow
                  key={transfer.id}
                  transfer={transfer}
                  userStoreId={userStoreId}
                  canSeeAllTransfers={canSeeAllTransfers}
                  onHonorTransfer={onHonorTransfer}
                  onDeclineTransfer={onDeclineTransfer}
                  onViewDeclineReason={handleViewDeclineReason}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decline Reason Modal */}
      {showDeclineReasonModal && selectedDeclineTransfer && (
        <DeclineReasonModal
          transfer={selectedDeclineTransfer}
          onClose={() => setShowDeclineReasonModal(false)}
        />
      )}
    </>
  );
};

const TransferRow = ({ transfer, userStoreId, canSeeAllTransfers, onHonorTransfer, onDeclineTransfer, onViewDeclineReason, getStatusBadge }) => {
  // Check if user is involved in this transfer
  const isFromUserStore = userStoreId === transfer.from_store;
  const isToUserStore = userStoreId === transfer.to_store;
  const isInvolved = isFromUserStore || isToUserStore;
  
  // User can HONOR if: transfer is requested AND user's store is the Transferring Store (has stock to give)
  const canHonor = transfer.status === 'requested' && isFromUserStore;
  
  // User can DECLINE if: transfer is requested AND user's store is the Transferring Store
  const canDecline = transfer.status === 'requested' && isFromUserStore;
  
  // Determine role display
  let roleLabel = null;
  if (isFromUserStore && isToUserStore) {
    roleLabel = { text: 'Internal Transfer', color: 'bg-purple-100 text-purple-700' };
  } else if (isFromUserStore) {
    roleLabel = { text: 'You are Transferring', color: 'bg-blue-100 text-blue-700' };
  } else if (isToUserStore) {
    roleLabel = { text: 'You are Receiving', color: 'bg-emerald-100 text-emerald-700' };
  }
  
  // Get product name
  const productName = transfer.product_name || transfer.batch_details?.brand_details?.product_name || 'N/A';
  const brandName = transfer.brand_name || transfer.batch_details?.brand_name || (transfer.brand ? 'Specific' : 'Any');
  const isDeclined = transfer.status === 'declined';
  
  return (
    <tr className={`hover:bg-gray-50 transition-colors ${isInvolved ? 'bg-blue-50/30' : ''}`}>
      <td className="py-2 px-3">
        <span className="font-mono font-medium text-blue-700">#{transfer.id}</span>
        {roleLabel && (
          <div className="mt-0.5">
            <span className={`inline-block px-1.5 py-0.5 text-[9px] font-medium rounded ${roleLabel.color}`}>
              {roleLabel.text}
            </span>
          </div>
        )}
      </td>
      
      <td className="py-2 px-3">
        <div className="font-medium text-gray-800 max-w-[120px] truncate" title={productName}>
          {productName}
        </div>
      </td>
      
      <td className="py-2 px-3">
        <span className="text-gray-600 text-xs">{brandName}</span>
      </td>
      
      <td className="py-2 px-3">
        <div className="flex items-center gap-1">
          <span className={`font-medium ${isFromUserStore ? 'text-blue-700' : 'text-gray-800'}`}>
            {transfer.from_store_name}
          </span>
          {isFromUserStore && (
            <span className="text-[9px] text-blue-600">(You)</span>
          )}
        </div>
        <div className="text-[9px] text-gray-400 mt-0.5">
          Sending Store
        </div>
      </td>
      
      <td className="py-2 px-3">
        <div className="flex items-center gap-1">
          <span className={`font-medium ${isToUserStore ? 'text-emerald-700' : 'text-gray-800'}`}>
            {transfer.to_store_name}
          </span>
          {isToUserStore && (
            <span className="text-[9px] text-emerald-600">(You)</span>
          )}
        </div>
        <div className="text-[9px] text-gray-400 mt-0.5">
          Receiving Store
        </div>
      </td>
      
      <td className="py-2 px-3">
        <div>
          <span className="font-semibold text-gray-800">{transfer.requested_quantity}</span>
          {transfer.honored_quantity > 0 && (
            <div className="text-[10px] text-emerald-600">✓ {transfer.honored_quantity}</div>
          )}
        </div>
      </td>
      
      <td className="py-2 px-3">
        <div className="flex items-center gap-1">
          {getStatusBadge(transfer.status)}
          {isDeclined && transfer.decline_reason && (
            <button
              onClick={() => onViewDeclineReason(transfer)}
              className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
              title="View decline reason"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
        {isDeclined && transfer.decline_reason && (
          <div className="text-[9px] text-gray-500 mt-0.5 max-w-[100px] truncate cursor-pointer" onClick={() => onViewDeclineReason(transfer)}>
            Reason: {transfer.decline_reason.substring(0, 30)}...
          </div>
        )}
      </td>
      
      <td className="py-2 px-3 whitespace-nowrap">
        <div className="text-gray-700">{new Date(transfer.date_requested).toLocaleDateString()}</div>
        <div className="text-[9px] text-gray-400">{new Date(transfer.date_requested).toLocaleTimeString()}</div>
      </td>
      
      <td className="py-2 px-3">
        <div className="flex items-center justify-center gap-1">
          {/* Honor button - Only visible if user's store is the Transferring Store */}
          {canHonor && (
            <button
              onClick={() => onHonorTransfer(transfer)}
              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded transition-colors"
              title="Honor Transfer (Send Stock)"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          
          {/* Decline button - Only visible if user's store is the Transferring Store */}
          {canDecline && (
            <button
              onClick={() => onDeclineTransfer(transfer)}
              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
              title="Decline Transfer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* View Details - Visible to all involved parties */}
          {(isInvolved || canSeeAllTransfers) && (
            <button 
              className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
              title="View Details"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
          
          {/* No actions for users just viewing */}
          {!canHonor && !canDecline && isInvolved && !canSeeAllTransfers && (
            <span className="text-[9px] text-gray-400 italic">View only</span>
          )}
        </div>
      </td>
    </tr>
  );
};

// Decline Reason Modal Component
const DeclineReasonModal = ({ transfer, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-5 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Transfer Declined</h3>
              <p className="text-red-100 text-xs">Transfer #{transfer.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Transfer Summary */}
          <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs text-gray-500">Product</div>
                <div className="font-medium text-gray-800">{transfer.product_name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Brand Requested</div>
                <div className="font-medium text-gray-800">{transfer.brand_name || 'Any Brand'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Quantity</div>
                <div className="font-medium text-blue-700">{transfer.requested_quantity} units</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Transfer Direction</div>
                <div className="font-medium text-gray-800">
                  {transfer.from_store_name} → {transfer.to_store_name}
                </div>
              </div>
            </div>
          </div>

          {/* Decline Reason */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-red-100 text-red-600 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-800">Reason for Decline</h4>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 whitespace-pre-wrap">
                {transfer.decline_reason || 'No reason provided'}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">What can you do?</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Contact the transferring store for more details</li>
                  <li>Try requesting a different brand or quantity</li>
                  <li>Create a new transfer request with adjusted parameters</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 bg-gray-50 rounded-b-xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransfersList;