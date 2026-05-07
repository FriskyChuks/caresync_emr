// BrandDetailModal.jsx - With Batches Display
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';

const BrandDetailModal = ({ show, onClose, brand, onBrandUpdate }) => {
  const { showMessage } = useMessage();
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [expandedBatch, setExpandedBatch] = useState(null);

  useEffect(() => {
    if (show && brand) {
      fetchBatches();
    }
  }, [show, brand]);

  const fetchBatches = async () => {
    if (!brand) return;
    
    try {
      setLoadingBatches(true);
      const response = await axiosInstance.get(`/pharmacyapi/batches/?brand_id=${brand.id}`);
      // Sort by expiry date (closest expiry first)
      const sortedBatches = response.data.sort((a, b) => {
        if (!a.expiry_date) return 1;
        if (!b.expiry_date) return -1;
        return new Date(a.expiry_date) - new Date(b.expiry_date);
      });
      setBatches(sortedBatches);
    } catch (error) {
      console.error('Error fetching batches:', error);
      showMessage('Error loading batch information', 'warning');
    } finally {
      setLoadingBatches(false);
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'unknown', label: 'Unknown', color: 'gray', daysLeft: null };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Expired', color: 'red', daysLeft: Math.abs(daysUntilExpiry) };
    }
    if (daysUntilExpiry <= 30) {
      return { status: 'expiring_soon', label: 'Expiring Soon', color: 'amber', daysLeft: daysUntilExpiry };
    }
    return { status: 'valid', label: 'Valid', color: 'emerald', daysLeft: daysUntilExpiry };
  };

  const getTotalStock = () => {
    return batches.reduce((total, batch) => total + (batch.total_stock || batch.stock_in_store || 0), 0);
  };

  const getExpiringCount = () => {
    return batches.filter(batch => {
      const status = getExpiryStatus(batch.expiry_date);
      return status.status === 'expiring_soon';
    }).length;
  };

  const getExpiredCount = () => {
    return batches.filter(batch => {
      const status = getExpiryStatus(batch.expiry_date);
      return status.status === 'expired';
    }).length;
  };

  if (!show || !brand) return null;

  const profitMargin = ((brand.selling_price - brand.cost_price) / brand.cost_price * 100).toFixed(1);
  const totalStock = getTotalStock();
  const expiringCount = getExpiringCount();
  const expiredCount = getExpiredCount();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{brand.name}</h3>
              <p className="text-blue-100 text-sm">{brand.product_name}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-blue-200 transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[80vh]">
          {/* Brand Summary Stats */}
          <div className="grid grid-cols-4 gap-2 p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalStock}</div>
              <div className="text-xs text-gray-600">Total Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{batches.length}</div>
              <div className="text-xs text-gray-600">Total Batches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{expiringCount}</div>
              <div className="text-xs text-gray-600">Expiring Soon</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
              <div className="text-xs text-gray-600">Expired</div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Barcode</div>
                  <div className="text-sm font-medium text-gray-800">{brand.barcode || 'Not set'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Unit of Sale</div>
                  <div className="text-sm font-medium text-gray-800">{brand.unit_of_sale}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Reorder Level</div>
                  <div className="text-sm font-medium text-gray-800">{brand.reorder_level}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Created</div>
                  <div className="text-sm font-medium text-gray-800">
                    {new Date(brand.date_created).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pricing Information
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Cost Price</div>
                  <div className="text-base font-bold text-blue-700">₦{parseFloat(brand.cost_price).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Selling Price</div>
                  <div className="text-base font-bold text-emerald-700">₦{parseFloat(brand.selling_price).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Profit Margin</div>
                  <div className={`text-base font-bold ${profitMargin >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {profitMargin}%
                  </div>
                </div>
              </div>
            </div>

            {/* Batches Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-100 to-blue-50 px-4 py-3 border-b flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Batches ({batches.length})
                </h4>
                <button
                  onClick={fetchBatches}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Refresh batches"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {loadingBatches ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading batches...</p>
                </div>
              ) : batches.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500">No batches found for this brand</p>
                  <p className="text-xs text-gray-400 mt-1">Batches are created when receiving supplies</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {batches.map((batch) => {
                    const expiryStatus = getExpiryStatus(batch.expiry_date);
                    const stock = batch.total_stock || batch.stock_in_store || 0;
                    const isExpanded = expandedBatch === batch.id;
                    
                    return (
                      <div key={batch.id} className="hover:bg-gray-50 transition-colors">
                        {/* Batch Row */}
                        <div 
                          className="px-4 py-3 flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedBatch(isExpanded ? null : batch.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-shrink-0">
                              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium text-gray-800">{batch.batch_no}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${expiryStatus.color}-100 text-${expiryStatus.color}-700`}>
                                  {expiryStatus.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500">
                                  Exp: {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('en-GB') : 'N/A'}
                                </span>
                                <span className={`text-xs font-medium ${
                                  stock === 0 ? 'text-red-600' :
                                  stock < 10 ? 'text-amber-600' :
                                  'text-emerald-600'
                                }`}>
                                  Stock: {stock} units
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-4 pb-3 pt-0 bg-gray-50 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-3 pl-6">
                              <div>
                                <div className="text-xs text-gray-500">Production Date</div>
                                <div className="text-sm text-gray-800">
                                  {batch.production_date ? new Date(batch.production_date).toLocaleDateString('en-GB') : 'Not recorded'}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Days Until Expiry</div>
                                <div className={`text-sm font-medium ${
                                  expiryStatus.status === 'expired' ? 'text-red-600' :
                                  expiryStatus.status === 'expiring_soon' ? 'text-amber-600' :
                                  'text-emerald-600'
                                }`}>
                                  {expiryStatus.daysLeft !== null 
                                    ? expiryStatus.status === 'expired' 
                                      ? `${expiryStatus.daysLeft} days ago` 
                                      : `${expiryStatus.daysLeft} days`
                                    : 'N/A'}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Batch Created</div>
                                <div className="text-sm text-gray-800">
                                  {new Date(batch.date_created).toLocaleDateString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Store Locations</div>
                                <div className="text-sm text-gray-800">
                                  {batch.store_count || 'Information not available'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Information Note */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">About Batches:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Batches are automatically created when receiving supplies</li>
                    <li>Stock levels shown are across all stores</li>
                    <li>Click on a batch row to view more details</li>
                    <li>Expiring soon batches should be dispensed first (FIFO)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 bg-gray-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandDetailModal;