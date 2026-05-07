// TransferRequestForm.jsx - Compact Version
import React from 'react';

const TransferRequestForm = ({
  formData,
  products,
  filteredProducts,
  productSearch,
  selectedProduct,
  filteredBrands,
  toStores,
  toStoreFilter,
  userStoreId,
  userStoreName,
  onInputChange,
  onProductSearchChange,
  onProductSelect,
  onBrandSelect,
  onStoreFilterChange,
  onShowStoreModal,
  onSubmit,
  onCancel
}) => {
  
  // Auto-set to_store (requesting store) when user has a store
  React.useEffect(() => {
    if (userStoreId && !formData.to_store) {
      onInputChange({ target: { name: 'to_store', value: userStoreId } });
    }
  }, [userStoreId, formData.to_store, onInputChange]);

  // Check if user has a store assigned
  const hasUserStore = !!userStoreId;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="text-sm font-bold text-white">New Transfer Request</h3>
        </div>
        <button onClick={onCancel} className="text-white/80 hover:text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* No Store Assigned Warning */}
        {!hasUserStore && (
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>No store assigned. Contact administrator.</span>
          </div>
        )}

        {/* User Store Info - Compact */}
        {hasUserStore && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Requesting: <strong>{userStoreName}</strong></span>
            </div>
          </div>
        )}

        {!hasUserStore ? (
          /* Disabled form */
          <div className="space-y-2 opacity-60 pointer-events-none">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input type="text" className="w-full pl-7 pr-2 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-lg" placeholder="Search product..." disabled />
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            {/* Product Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Search product..."
                value={productSearch}
                onChange={onProductSearchChange}
                required
              />
            </div>
            
            {/* Product Search Results */}
            {productSearch && filteredProducts.length > 0 && (
              <div className="border border-gray-200 rounded-lg max-h-32 overflow-y-auto bg-white shadow-lg">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className={`p-1.5 text-xs border-b last:border-b-0 cursor-pointer hover:bg-blue-50 transition-colors ${
                      selectedProduct?.id === product.id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => onProductSelect(product)}
                  >
                    <span className="font-medium">{product.name}</span>
                    <span className="text-gray-500 ml-1">{product.strength}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Product */}
            {selectedProduct && (
              <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center text-xs">
                <span className="text-gray-600">Selected:</span>
                <span className="font-medium text-gray-800">{selectedProduct.name} {selectedProduct.strength}</span>
                <button type="button" onClick={() => onProductSelect(null)} className="text-red-500 hover:text-red-700">✕</button>
              </div>
            )}

            {/* Brand + Quantity - Same Line */}
            {selectedProduct && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.brand || ''}
                    onChange={(e) => onBrandSelect(e.target.value)}
                  >
                    <option value="">Any Brand</option>
                    {filteredBrands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    name="requested_quantity"
                    value={formData.requested_quantity}
                    onChange={onInputChange}
                    placeholder="Qty"
                    min="1"
                  />
                </div>
              </div>
            )}

            {/* Store Selection - Same Line */}
            {selectedProduct && formData.requested_quantity && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {/* Source Store (Has Stock) */}
                  <div>
                    <div className="flex gap-1 mb-1">
                      <button
                        type="button"
                        className={`flex-1 text-[10px] py-0.5 rounded ${toStoreFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => onStoreFilterChange('all')}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className={`flex-1 text-[10px] py-0.5 rounded ${toStoreFilter === 'bulk' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => onStoreFilterChange('bulk')}
                      >
                        Bulk
                      </button>
                      <button
                        type="button"
                        className={`flex-1 text-[10px] py-0.5 rounded ${toStoreFilter === 'outlet' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => onStoreFilterChange('outlet')}
                      >
                        Outlet
                      </button>
                    </div>
                    <select
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      name="from_store"
                      value={formData.from_store}
                      onChange={onInputChange}
                      required
                    >
                      <option value="">Source Store</option>
                      {toStores.map(store => (
                        <option key={store.id} value={store.id}>
                          {store.name} {store.is_bulk_store ? '(Bulk)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Your Store (Receiving) - Read-only */}
                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">Your Store</div>
                    <div className="relative">
                      <select
                        className="w-full px-2 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                        value={formData.to_store || ''}
                        disabled
                      >
                        <option value={userStoreId}>{userStoreName}</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason - Optional */}
                <textarea
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  name="request_reason"
                  rows="1"
                  value={formData.request_reason}
                  onChange={onInputChange}
                  placeholder="Reason (optional)"
                />

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-medium rounded-lg transition-all"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all"
                    onClick={onCancel}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default TransferRequestForm;