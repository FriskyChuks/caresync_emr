// dispensaryComponents/BrandBatchSelector.jsx
import React, { useState, useEffect } from 'react';

const BrandBatchSelector = ({
  detailId,
  productId,
  prescribedQuantity,
  selectedItem,
  quantity,
  availableBatches,
  loading,
  onFetchBatches,
  onBatchSelect,
  onQuantityChange
}) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [filteredBatches, setFilteredBatches] = useState([]);

  useEffect(() => {
    if (!availableBatches && productId) {
      onFetchBatches();
    }
  }, [productId]);

  useEffect(() => {
    if (availableBatches && selectedBrand) {
      const batches = availableBatches.filter(b => b.brand_name === selectedBrand);
      setFilteredBatches(batches);
    } else {
      setFilteredBatches([]);
    }
  }, [selectedBrand, availableBatches]);

  // Get unique brands from available batches
  const uniqueBrands = availableBatches 
    ? [...new Map(availableBatches.map(b => [b.brand_name, b])).values()]
    : [];

  const handleBrandSelect = (brandName) => {
    setSelectedBrand(brandName);
    // Reset batch selection when brand changes
    if (selectedItem) {
      onBatchSelect(detailId, null, null, null, null);
    }
  };

  const handleBatchSelectInternal = (batch) => {
    onBatchSelect(detailId, batch.batch_id, batch.brand_name, batch.unit_price, batch.available_quantity);
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { status: 'expired', label: 'Expired', color: 'text-red-600' };
    if (daysLeft <= 30) return { status: 'soon', label: `${daysLeft} days left`, color: 'text-amber-600' };
    return { status: 'valid', label: `${daysLeft} days left`, color: 'text-emerald-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-gray-500 ml-2">Loading batches...</span>
      </div>
    );
  }

  if (!availableBatches || availableBatches.length === 0) {
    return (
      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-center">
        <p className="text-xs text-amber-700">No batches available for this product</p>
        <p className="text-[10px] text-amber-600 mt-1">Please check inventory or receive stock</p>
      </div>
    );
  }

  // If already selected, show selected info with option to change
  if (selectedItem && selectedItem.batch_id) {
    return (
      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Selected:</span>
              <span className="font-medium text-gray-800">{selectedItem.brand_name}</span>
              <span className="text-xs text-gray-400">({selectedItem.batch_id})</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="text-gray-500">Unit: ₦{selectedItem.unit_price.toLocaleString()}</span>
              <span className="text-gray-500">Max: {selectedItem.max_quantity} units</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={selectedItem.max_quantity}
              value={quantity || ''}
              onChange={(e) => onQuantityChange(detailId, e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              onClick={() => {
                setSelectedBrand('');
                onBatchSelect(detailId, null, null, null, null);
                onQuantityChange(detailId, 0);
              }}
              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Brand Dropdown */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Select Brand
        </label>
        <select
          value={selectedBrand}
          onChange={(e) => handleBrandSelect(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        >
          <option value="">Choose a brand</option>
          {uniqueBrands.map(brand => (
            <option key={brand.brand_name} value={brand.brand_name}>
              {brand.brand_name} - ₦{brand.unit_price.toLocaleString()}/unit
            </option>
          ))}
        </select>
      </div>

      {/* Batch Dropdown (only show if brand selected) */}
      {selectedBrand && filteredBatches.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Select Batch
          </label>
          <select
            onChange={(e) => {
              const batch = filteredBatches.find(b => b.batch_id === parseInt(e.target.value));
              if (batch) handleBatchSelectInternal(batch);
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="">Choose a batch</option>
            {filteredBatches.map(batch => {
              const expiryStatus = getExpiryStatus(batch.expiry_date);
              return (
                <option key={batch.batch_id} value={batch.batch_id}>
                  {batch.batch_no} - {batch.available_quantity} units available
                  {expiryStatus && ` - ${expiryStatus.label}`}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {selectedBrand && filteredBatches.length === 0 && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <p className="text-xs text-amber-700">No batches available for {selectedBrand}</p>
        </div>
      )}
    </div>
  );
};

export default BrandBatchSelector;