// inventoryComponents/AdjustmentHistory.jsx
import React, { useState } from 'react';

const AdjustmentHistory = ({ adjustments, storeName, onRefresh }) => {
  const [expandedId, setExpandedId] = useState(null);

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending', icon: '⏳' },
      approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Approved', icon: '✓' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: '✗' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed', icon: '✅' }
    };
    const c = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
        <span>{c.icon}</span>
        {c.label}
      </span>
    );
  };

  const getDirectionBadge = (direction) => {
    if (direction === 'in') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">📥 Stock In</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">📤 Stock Out</span>;
  };

  if (adjustments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-500">No adjustment records found</p>
        <p className="text-xs text-gray-400 mt-1">Stock adjustments will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
        <div>
          <h3 className="text-xs font-semibold text-gray-700">
            {storeName || 'All Stores'} • {adjustments.length} adjustments
          </h3>
        </div>
        <button
          onClick={onRefresh}
          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
          title="Refresh"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {adjustments.map(adj => {
          const isExpanded = expandedId === adj.id;
          const direction = adj.direction || (adj.adjustment_type?.direction);
          
          return (
            <div key={adj.id} className="hover:bg-gray-50 transition-colors">
              {/* Compact Row */}
              <div 
                className="px-3 py-2 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : adj.id)}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-gray-500">{adj.reference_number}</span>
                      {getDirectionBadge(direction)}
                    </div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5 truncate">
                      {adj.product_name || adj.batch?.brand?.product?.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {adj.brand_name || adj.batch?.brand?.name} • {adj.batch_no || adj.batch?.batch_no}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${direction === 'out' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {direction === 'out' ? '-' : '+'}{adj.quantity}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(adj.date_created).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Adjustment Type:</span>
                        <span className="ml-1 font-medium">{adj.adjustment_type_name || adj.adjustment_type?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Unit Cost:</span>
                        <span className="ml-1 font-medium">₦{parseFloat(adj.unit_cost).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Value:</span>
                        <span className="ml-1 font-medium text-blue-600">₦{parseFloat(adj.total_value).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-1">{getStatusBadge(adj.status)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500">Reason:</div>
                      <div className="text-xs text-gray-700 mt-0.5 bg-gray-50 p-2 rounded">{adj.reason}</div>
                    </div>
                    
                    {adj.notes && (
                      <div>
                        <div className="text-xs text-gray-500">Notes:</div>
                        <div className="text-xs text-gray-700 mt-0.5">{adj.notes}</div>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                      <span>Created by: {adj.created_by_name || adj.created_by?.get_full_name?.() || 'Unknown'}</span>
                      {adj.approved_by_name && <span>Approved by: {adj.approved_by_name}</span>}
                      <span>{new Date(adj.date_created).toLocaleTimeString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdjustmentHistory;