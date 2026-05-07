// InventoryManagement.jsx - Updated with "All Stores" option
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useMessage } from '../../context/MessageProvider';
import useAuth from '../../hooks/useAuth';
import PharmacyLayout from './PharmacyLayout';
import StockAdjustmentModal from './inventoryComponents/StockAdjustmentModal';
import AdjustmentHistory from './inventoryComponents/AdjustmentHistory';
import BatchDetailModal from './inventoryComponents/BatchDetailModal';

const InventoryManagement = () => {
  const { showMessage } = useMessage();
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [adjustmentTypes, setAdjustmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [adjustments, setAdjustments] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState({});

  // Permissions
  const canManageInventory = useCallback(() => {
    if (!user) return false;
    return user.is_superuser || 
           user.is_staff || 
           user.is_pharmacy_store_manager ||
           (user.user_category && ['admin', 'manager'].includes(user.user_category.title?.toLowerCase()));
  }, [user]);

  useEffect(() => {
    fetchStores();
    fetchAdjustmentTypes();
  }, []);

  useEffect(() => {
    if (stores.length > 0 && !selectedStore) {
      const defaultStore = 'all';
      setSelectedStore(defaultStore);
      fetchProducts(defaultStore);
      fetchAdjustments(defaultStore);
    }
  }, [stores]);

  const fetchStores = async () => {
    try {
      const response = await axiosInstance.get('/pharmacyapi/pharmacy-stores/');
      let storesData = response.data;
      
      // Filter stores for non-admin managers
      const isAdmin = user?.is_superuser || 
                      user?.is_staff || 
                      (user?.user_category && ['admin', 'manager'].includes(user.user_category.title?.toLowerCase()));
      
      if (!isAdmin && user?.is_pharmacy_store_manager && user?.pharmacy_store_id) {
        storesData = storesData.filter(store => store.id === user.pharmacy_store_id);
      }
      
      setStores(storesData);
    } catch (error) {
      console.error('Error fetching stores:', error);
      showMessage('Error loading stores', 'danger');
    }
  };

  const fetchAdjustmentTypes = async () => {
    try {
      const response = await axiosInstance.get('/pharmacyapi/adjustment-types/');
      setAdjustmentTypes(response.data);
    } catch (error) {
      console.error('Error fetching adjustment types:', error);
    }
  };

  const fetchProducts = async (storeId) => {
    try {
      setLoading(true);
      let url = '/pharmacyapi/products/';
      const params = new URLSearchParams();
      
      if (storeId && storeId !== 'all') {
        params.append('store_id', storeId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axiosInstance.get(url);
      
      // The backend now returns products with store-specific total_stock_level
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showMessage('Error loading products', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandsAndBatchesForProduct = async (productId, storeId) => {
    setLoadingBrands(prev => ({ ...prev, [productId]: true }));
    try {
      let brandsUrl = `/pharmacyapi/brands/?product_id=${productId}`;
      if (storeId && storeId !== 'all') {
        brandsUrl += `&store_id=${storeId}`;
      }
      const response = await axiosInstance.get(brandsUrl);
      
      // For each brand, fetch batches with stock
      const brandsWithBatches = await Promise.all(
        response.data.map(async (brand) => {
          let batchesUrl = `/pharmacyapi/batches/?brand_id=${brand.id}`;
          if (storeId && storeId !== 'all') {
            batchesUrl += `&store_id=${storeId}`;
          }
          const batchesResponse = await axiosInstance.get(batchesUrl);
          
          // Get inventory for each batch
          const batchesWithStock = await Promise.all(
            batchesResponse.data.map(async (batch) => {
              let invUrl = `/pharmacyapi/inventory/?batch_id=${batch.id}`;
              if (storeId && storeId !== 'all') {
                invUrl += `&store_id=${storeId}`;
              }
              const invResponse = await axiosInstance.get(invUrl);
              
              let stock = 0;
              let storeName = null;
              
              if (storeId === 'all') {
                // Sum stock across all stores and collect store names
                stock = invResponse.data.reduce((sum, item) => sum + item.quantity, 0);
                const storesWithStock = invResponse.data
                  .filter(item => item.quantity > 0)
                  .map(item => item.store_name)
                  .filter((v, i, a) => a.indexOf(v) === i); // unique stores
                storeName = storesWithStock.join(', ');
              } else {
                stock = invResponse.data[0]?.quantity || 0;
                storeName = invResponse.data[0]?.store_name;
              }
              
              return { 
                ...batch, 
                stock, 
                expiry_date: batch.expiry_date,
                store_name: storeName
              };
            })
          );
          
          // Calculate total stock for this brand
          const totalStock = batchesWithStock.reduce((sum, batch) => sum + batch.stock, 0);
          
          return { ...brand, batches: batchesWithStock, totalStock };
        })
      );
      
      // Update products state with brand data
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, brands: brandsWithBatches, expanded: true }
          : product
      ));
    } catch (error) {
      console.error('Error fetching brands:', error);
      showMessage('Error loading product details', 'danger');
    } finally {
      setLoadingBrands(prev => ({ ...prev, [productId]: false }));
    }
  };

  const fetchAdjustments = async (storeId) => {
    try {
      let url = '/pharmacyapi/adjustments/';
      if (storeId !== 'all') {
        url += `?store_id=${storeId}`;
      }
      const response = await axiosInstance.get(url);
      setAdjustments(response.data);
    } catch (error) {
      console.error('Error fetching adjustments:', error);
    }
  };

  const handleStoreChange = (e) => {
    const storeId = e.target.value;
    setSelectedStore(storeId);
    setExpandedProduct(null);
    fetchProducts(storeId);
    fetchAdjustments(storeId);
  };

  const handleProductClick = async (product) => {
    if (expandedProduct === product.id) {
      // Collapse
      setExpandedProduct(null);
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, expanded: false } : p
      ));
    } else {
      // Expand
      setExpandedProduct(product.id);
      if (!product.brands) {
        await fetchBrandsAndBatchesForProduct(product.id, selectedStore);
      } else {
        setProducts(prev => prev.map(p => 
          p.id === product.id ? { ...p, expanded: true } : p
        ));
      }
    }
  };

  const handleAdjustmentSuccess = () => {
    fetchProducts(selectedStore);
    fetchAdjustments(selectedStore);
    setShowAdjustmentModal(false);
    showMessage('Stock adjustment completed successfully!', 'success');
  };

  const handleViewBatch = (batch) => {
    setSelectedBatch(batch);
    setShowBatchModal(true);
  };

  // Filter products based on search and low stock
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.strength.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (lowStockOnly) {
      filtered = filtered.filter(product => (product.total_stock_level || 0) <= (product.reorder_level || 10));
    }
    
    return filtered;
  }, [products, searchTerm, lowStockOnly]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalUnits = products.reduce((sum, p) => sum + (p.total_stock_level || 0), 0);
    const low = products.filter(p => {
      const stock = p.total_stock_level || 0;
      const reorderLevel = p.reorder_level || 10;
      return stock <= reorderLevel && stock > 0;
    }).length;
    const out = products.filter(p => (p.total_stock_level || 0) === 0).length;
    
    return {
      total: products.length,
      totalUnits,
      low,
      out
    };
  }, [products]);

  const currentStore = selectedStore === 'all' 
    ? { id: 'all', name: 'All Stores', is_bulk_store: false }
    : stores.find(s => s.id == selectedStore);

  const getStockStatus = (stock, reorderLevel) => {
    if (stock === 0) return { color: 'red', label: 'Out of Stock', icon: '❌' };
    if (stock <= reorderLevel) return { color: 'amber', label: 'Low Stock', icon: '⚠️' };
    return { color: 'emerald', label: 'In Stock', icon: '✓' };
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { status: 'expired', label: 'Expired', color: 'red', days: Math.abs(daysLeft) };
    if (daysLeft <= 30) return { status: 'soon', label: 'Expiring Soon', color: 'amber', days: daysLeft };
    return { status: 'valid', label: 'Valid', color: 'emerald', days: daysLeft };
  };

  // Get available adjustment types for the store
  const availableAdjustmentTypes = useMemo(() => {
    if (selectedStore === 'all') {
      return adjustmentTypes.filter(t => t.code !== 'RET'); // Return to store not applicable for "All Stores"
    }
    return adjustmentTypes;
  }, [adjustmentTypes, selectedStore]);

  return (
    <PharmacyLayout>
      <div className="space-y-3 pb-20">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white shadow">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Inventory Management</h1>
              <p className="text-[10px] text-blue-100">Track stock by product, brand & batch</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="px-2 py-1.5 text-xs bg-white/20 text-white border border-white/30 rounded-lg focus:ring-1 focus:ring-white outline-none"
              value={selectedStore}
              onChange={handleStoreChange}
            >
              <option value="all">🏪 All Stores (Combined)</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name} {store.is_bulk_store ? '(Bulk)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchProducts(selectedStore)}
              disabled={loading}
              className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Cards - Added Total Units */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-blue-600 font-semibold">Products</div>
                <div className="text-xl font-bold text-blue-700">{stats.total}</div>
              </div>
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-indigo-600 font-semibold">Total Units</div>
                <div className="text-xl font-bold text-indigo-700">{stats.totalUnits.toLocaleString()}</div>
              </div>
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-amber-600 font-semibold">Low Stock</div>
                <div className="text-xl font-bold text-amber-700">{stats.low}</div>
              </div>
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-red-600 font-semibold">Out of Stock</div>
                <div className="text-xl font-bold text-red-700">{stats.out}</div>
              </div>
              <div className="p-1.5 bg-red-100 rounded-lg">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-purple-600 font-semibold">Adjustments</div>
                <div className="text-xl font-bold text-purple-700">{adjustments.length}</div>
              </div>
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📦 Stock Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📜 Adjustment History
          </button>
        </div>

        {/* Search and Filters (Only for Inventory Tab) */}
        {activeTab === 'inventory' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                  />
                  <div className={`w-8 h-4 rounded-full transition-all duration-200 ${lowStockOnly ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transform transition-transform duration-200 ${lowStockOnly ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                  </div>
                </div>
                <span className="text-xs text-gray-700">Low stock only</span>
              </label>
            </div>
            
            {canManageInventory() && selectedStore && selectedStore !== 'all' && (
              <button
                onClick={() => setShowAdjustmentModal(true)}
                className="px-3 py-1.5 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adjust Stock
              </button>
            )}
            
            {(searchTerm || lowStockOnly) && (
              <button
                onClick={() => { setSearchTerm(''); setLowStockOnly(false); }}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'inventory' ? (
          /* Product List with Expandable View */
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-3 py-2 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-gray-700">
                    {currentStore?.name || 'Select Store'} • {filteredProducts.length} products
                    {selectedStore === 'all' && (
                      <span className="ml-2 text-[10px] text-gray-500">
                        (Total stock across all locations)
                      </span>
                    )}
                  </h3>
                </div>
                <span className="text-[10px] text-gray-400">Click product to view brands & batches</span>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {!selectedStore ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-500">Select a store to view inventory</p>
                </div>
              ) : loading ? (
                <div className="py-10 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-500">No products found</p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const stockStatus = getStockStatus(product.total_stock_level || 0, product.reorder_level || 10);
                  const isExpanded = product.expanded || expandedProduct === product.id;
                  const isLoadingBrands = loadingBrands[product.id];
                  
                  return (
                    <div key={product.id} className="hover:bg-gray-50 transition-colors">
                      {/* Product Row - Clickable */}
                      <div 
                        className="px-3 py-3 cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="font-medium text-gray-800">{product.name}</span>
                              <span className="text-xs text-gray-500">{product.strength}</span>
                            </div>
                            <div className="text-xs text-gray-500 ml-6">
                              {product.drugstype_name} {product.drugsform_name && `• ${product.drugsform_name}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className={`text-lg font-bold ${
                                stockStatus.color === 'red' ? 'text-red-600' :
                                stockStatus.color === 'amber' ? 'text-amber-600' : 'text-emerald-600'
                              }`}>
                                {product.total_stock_level || 0}
                              </div>
                              <div className="text-[10px] text-gray-400">units</div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                              stockStatus.color === 'red' ? 'bg-red-100 text-red-700' :
                              stockStatus.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              <span>{stockStatus.icon}</span>
                              <span className="hidden sm:inline">{stockStatus.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Brand & Batch Details */}
                      {isExpanded && (
                        <div className="bg-gray-50 border-t border-gray-100 px-4 py-3">
                          {isLoadingBrands ? (
                            <div className="text-center py-4">
                              <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-xs text-gray-500 mt-1">Loading brands...</p>
                            </div>
                          ) : !product.brands || product.brands.length === 0 ? (
                            <div className="text-center py-4 text-sm text-gray-500">
                              No stock available for this product
                              {selectedStore === 'all' && ' across any store'}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {product.brands.map(brand => (
                                <div key={brand.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                  {/* Brand Header */}
                                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2 border-b">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <div>
                                        <span className="font-semibold text-gray-800">{brand.name}</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                          Total: {brand.totalStock || 0} units
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        ₦{parseFloat(brand.selling_price).toLocaleString()} / unit
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Batches Table */}
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="py-1.5 px-2 text-left font-medium text-gray-600">Batch No</th>
                                          <th className="py-1.5 px-2 text-left font-medium text-gray-600">Expiry</th>
                                          <th className="py-1.5 px-2 text-center font-medium text-gray-600">Stock</th>
                                          <th className="py-1.5 px-2 text-left font-medium text-gray-600">Status</th>
                                          {selectedStore === 'all' && (
                                            <th className="py-1.5 px-2 text-left font-medium text-gray-600">Store</th>
                                          )}
                                          <th className="py-1.5 px-2 text-center font-medium text-gray-600">Action</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {brand.batches.map(batch => {
                                          const expiryStatus = getExpiryStatus(batch.expiry_date);
                                          return (
                                            <tr key={batch.id} className="hover:bg-gray-50">
                                              <td className="py-1.5 px-2">
                                                <code className="font-mono text-gray-700">{batch.batch_no}</code>
                                              </td>
                                              <td className="py-1.5 px-2">
                                                {batch.expiry_date ? (
                                                  <span className={`text-xs ${
                                                    expiryStatus?.color === 'red' ? 'text-red-600' :
                                                    expiryStatus?.color === 'amber' ? 'text-amber-600' : 'text-gray-600'
                                                  }`}>
                                                    {new Date(batch.expiry_date).toLocaleDateString()}
                                                    {expiryStatus?.days && (
                                                      <span className="text-[10px] ml-1">
                                                        ({expiryStatus.status === 'expired' ? `${expiryStatus.days}d overdue` : `${expiryStatus.days}d left`})
                                                      </span>
                                                    )}
                                                  </span>
                                                ) : '-'}
                                              </td>
                                              <td className="py-1.5 px-2 text-center">
                                                <span className={`font-semibold ${
                                                  batch.stock === 0 ? 'text-red-600' :
                                                  batch.stock < 10 ? 'text-amber-600' : 'text-emerald-600'
                                                }`}>
                                                  {batch.stock}
                                                </span>
                                              </td>
                                              <td className="py-1.5 px-2">
                                                {batch.stock === 0 ? (
                                                  <span className="text-xs text-red-600">Out of Stock</span>
                                                ) : batch.stock < 10 ? (
                                                  <span className="text-xs text-amber-600">Low Stock</span>
                                                ) : (
                                                  <span className="text-xs text-emerald-600">In Stock</span>
                                                )}
                                              </td>
                                              {selectedStore === 'all' && (
                                                <td className="py-1.5 px-2">
                                                  <span className="text-xs text-gray-600">{batch.store_name || 'Multiple Stores'}</span>
                                                </td>
                                              )}
                                              <td className="py-1.5 px-2 text-center">
                                                <button
                                                  onClick={() => handleViewBatch(batch)}
                                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                  title="View Batch Details"
                                                >
                                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                  </svg>
                                                </button>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Adjustment History Tab */
          <AdjustmentHistory 
            adjustments={adjustments}
            storeName={currentStore?.name}
            onRefresh={() => fetchAdjustments(selectedStore)}
          />
        )}
      </div>

      {/* Modals - Only show adjustment modal when a specific store is selected */}
      <StockAdjustmentModal
        show={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onSuccess={handleAdjustmentSuccess}
        storeId={selectedStore !== 'all' ? selectedStore : null}
        storeName={currentStore?.name}
        adjustmentTypes={availableAdjustmentTypes}
      />

      <BatchDetailModal
        show={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        batch={selectedBatch}
      />
    </PharmacyLayout>
  );
};

export default InventoryManagement;