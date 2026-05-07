import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';
import { useMessage } from '../../context/MessageProvider';
import PharmacyLayout from './PharmacyLayout';
import PharmacyStoreModal from './modals/PharmacyStoreModal';
import HonorTransferModal from './modals/HonorTransferModal';
import DeclineTransferModal from './modals/DeclineTransferModal';
import TransferStats from './TransferStats';
import TransferRequestForm from './TransferRequestForm';
import TransfersList from './TransfersList';

const StockTransferManagement = () => {
  const { showMessage } = useMessage();
  const { user } = useAuth();
  
  // ========== STATE DECLARATIONS ==========
  
  // Transfers state
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showHonorModal, setShowHonorModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dropdown data
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stores, setStores] = useState([]);
  
  // Form state
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [toStoreFilter, setToStoreFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    brand: '',
    from_store: '',
    to_store: '',
    requested_quantity: '',
    request_reason: '',
    requested_by: user?.id || ''
  });

  // ========== PERMISSIONS & USER INFO ==========
  
  const canSeeAllTransfers = useMemo(() => {
    if (!user) return false;
    if (user.is_superuser || user.is_staff) return true;
    if (user.is_pharmacy_store_manager) return true;
    if (user.user_category && ['admin', 'manager', 'support', 'developer'].includes(user.user_category.title)) {
      return true;
    }
    return false;
  }, [user]);

  const canCreateTransfer = useMemo(() => {
    if (!user) return false;
    if (user.is_superuser || user.is_staff || user.is_pharmacy_store_manager) return true;
    if (user.user_category && ['admin', 'manager', 'support', 'developer'].includes(user.user_category.title)) {
      return true;
    }
    return !!user.pharmacy_store_id;
  }, [user]);

  const userStoreInfo = useMemo(() => {
    if (!user) return { id: null, name: null };
    const userStore = stores.find(s => s.id === user.pharmacy_store_id);
    return { 
      id: user.pharmacy_store_id, 
      name: userStore?.name || user.pharmacy_store_name || 'Your Store'
    };
  }, [user, stores]);

  // ========== DATA FETCHING ==========
  
  const fetchTransfers = async () => {
    try {
      setLoading(true);
      let url = '/pharmacyapi/stock-transfers/';
      const params = new URLSearchParams();
      
      if (statusFilter) params.append('status', statusFilter);
      
      if (!canSeeAllTransfers && userStoreInfo.id) {
        params.append('store_id', userStoreInfo.id);
      }
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axiosInstance.get(url);
      setTransfers(response.data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      showMessage('Error loading transfers', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [productsRes, brandsRes, storesRes] = await Promise.all([
        axiosInstance.get('/pharmacyapi/products/'),
        axiosInstance.get('/pharmacyapi/brands/'),
        axiosInstance.get('/pharmacyapi/pharmacy-stores/')
      ]);
      setProducts(productsRes.data);
      setBrands(brandsRes.data);
      setStores(storesRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      showMessage('Error loading form data', 'danger');
    }
  };

  // ========== EFFECTS ==========
  
  useEffect(() => {
    if (user) {
      fetchTransfers();
      fetchDropdownData();
    }
  }, [user]);

  useEffect(() => {
    fetchTransfers();
  }, [statusFilter]);

  // Auto-set to_store (requesting store) when user has a store
  useEffect(() => {
    if (userStoreInfo.id && !formData.to_store && showForm) {
      setFormData(prev => ({ ...prev, to_store: userStoreInfo.id }));
    }
  }, [userStoreInfo.id, formData.to_store, showForm]);

  // Product search
  useEffect(() => {
    if (productSearch) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.strength.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [productSearch, products]);

  // Brand filter
  useEffect(() => {
    if (selectedProduct) {
      const filtered = brands.filter(brand => brand.product === selectedProduct.id);
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands([]);
    }
    setFormData(prev => ({ ...prev, brand: '' }));
  }, [selectedProduct, brands]);

  // ========== HANDLERS ==========
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      showMessage('Please select a product', 'warning');
      return;
    }
    
    if (!formData.requested_quantity || parseInt(formData.requested_quantity) <= 0) {
      showMessage('Please enter a valid quantity', 'warning');
      return;
    }
    
    if (!formData.from_store) {
      showMessage('Please select source store', 'warning');
      return;
    }
    
    if (!formData.to_store) {
      showMessage('Destination store not set', 'warning');
      return;
    }
    
    if (formData.from_store === formData.to_store) {
      showMessage('Source and destination stores cannot be the same', 'warning');
      return;
    }
    
    try {
      const submitData = {
        product: selectedProduct.id,
        brand: formData.brand || null,
        from_store: parseInt(formData.from_store),
        to_store: parseInt(formData.to_store),
        requested_quantity: parseInt(formData.requested_quantity),
        request_reason: formData.request_reason || '',
        requested_by: user.id
      };

      await axiosInstance.post('/pharmacyapi/stock-transfers/', submitData);
      
      resetForm();
      fetchTransfers();
      showMessage('Transfer request submitted successfully!', 'success');
    } catch (error) {
      console.error('Error creating transfer:', error);
      showMessage(error.response?.data?.message || 'Error creating transfer request', 'danger');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({ 
      brand: '', 
      from_store: '', 
      to_store: '', 
      requested_quantity: '', 
      request_reason: '', 
      requested_by: user?.id || '' 
    });
    setSelectedProduct(null);
    setProductSearch('');
    setFilteredProducts([]);
    setFilteredBrands([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setProductSearch(product ? `${product.name} ${product.strength}` : '');
    if (!product) setFormData(prev => ({ ...prev, brand: '' }));
  };

  const handleBrandSelect = (brandId) => {
    setFormData(prev => ({ ...prev, brand: brandId }));
  };

  const handleStoreFilterChange = (filter) => {
    setToStoreFilter(filter);
  };

  const handleHonorTransfer = (transfer) => {
    setSelectedTransfer(transfer);
    setShowHonorModal(true);
  };

  const handleDeclineTransfer = (transfer) => {
    setSelectedTransfer(transfer);
    setShowDeclineModal(true);
  };

  const handleTransferSuccess = () => {
    fetchTransfers();
    setSelectedTransfer(null);
  };

  const handleStoreSuccess = () => {
    fetchDropdownData();
  };

  // Get filtered stores for source selection (exclude user's store)
  const getFilteredSourceStores = () => {
    let filtered = stores;
    
    switch (toStoreFilter) {
      case 'bulk':
        filtered = stores.filter(s => s.is_bulk_store);
        break;
      case 'outlet':
        filtered = stores.filter(s => !s.is_bulk_store);
        break;
      default:
        break;
    }
    
    // Exclude user's own store from source options
    return filtered.filter(store => store.id !== userStoreInfo.id);
  };

  const getStatusBadge = (status) => {
    const config = {
      requested: { bg: 'bg-amber-500', text: 'REQUESTED', icon: '⏳' },
      honored: { bg: 'bg-emerald-500', text: 'HONORED', icon: '✅' },
      partially_honored: { bg: 'bg-blue-500', text: 'PARTIAL', icon: '⚡' },
      declined: { bg: 'bg-red-500', text: 'DECLINED', icon: '❌' }
    };
    const c = config[status] || { bg: 'bg-gray-500', text: status.toUpperCase(), icon: '📄' };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-full ${c.bg}`}>
        <span>{c.icon}</span>
        <span className="hidden sm:inline">{c.text}</span>
      </span>
    );
  };

  // Source stores (stores that have stock, excluding user's store)
  const sourceStores = getFilteredSourceStores();

  if (!user) {
    return (
      <PharmacyLayout>
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <p className="text-amber-800 font-medium">Please log in to access this page</p>
          </div>
        </div>
      </PharmacyLayout>
    );
  }

  return (
    <PharmacyLayout>
      <div className="space-y-2 max-w-full pb-20">
        {/* Header with Action Buttons - Ultra Compact with Full Text on Desktop */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow sticky top-0 z-10">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-xs font-bold text-white">Stock Transfer</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Status Filter - Full text on desktop, icon on mobile */}
            <select
              className="px-1.5 py-0.5 text-[10px] sm:text-xs bg-white/20 text-white border border-white/30 rounded focus:ring-1 focus:ring-white outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="requested" className="text-gray-900">⏳ Requested</option>
              <option value="honored" className="text-gray-900">✅ Honored</option>
              <option value="partially_honored" className="text-gray-900">⚡ Partial</option>
              <option value="declined" className="text-gray-900">❌ Declined</option>
            </select>
            
            {/* New Transfer Request Button - Full text on desktop */}
            {canCreateTransfer && (
              <button
                className="px-1.5 py-0.5 bg-white text-blue-600 text-[10px] sm:text-xs font-medium rounded shadow-sm flex items-center gap-0.5 whitespace-nowrap"
                onClick={() => setShowForm(!showForm)}
              >
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                {showForm ? 'Cancel' : 'New Request'}
              </button>
            )}
          </div>
        </div>

        {/* User Store Info */}
        {userStoreInfo.id && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-blue-700">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs font-medium">
              Requesting: <strong className="font-bold">{userStoreInfo.name}</strong>
            </span>
          </div>
          {!canSeeAllTransfers && (
            <div className="text-[10px] text-blue-600 mt-0.5 ml-5">
              Only showing transfers involving your store
            </div>
          )}
          {canSeeAllTransfers && (
            <div className="text-[10px] text-blue-600 mt-0.5 ml-5">
              Admin: Viewing all stores
            </div>
          )}
        </div>
      )}

      {!userStoreInfo.id && !canSeeAllTransfers && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs font-medium text-amber-800">
              No store assigned
            </span>
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5 ml-5">
            Contact administrator to assign a store
          </div>
        </div>
      )}

        {/* Stats */}
        <TransferStats transfers={transfers} />

        {/* Transfer Request Form - Shows when button is clicked */}
        {showForm && canCreateTransfer && (
          <TransferRequestForm
            formData={formData}
            products={products}
            filteredProducts={filteredProducts}
            productSearch={productSearch}
            selectedProduct={selectedProduct}
            filteredBrands={filteredBrands}
            toStores={sourceStores}
            toStoreFilter={toStoreFilter}
            userStoreId={userStoreInfo.id}
            userStoreName={userStoreInfo.name}
            onInputChange={handleInputChange}
            onProductSearchChange={(e) => setProductSearch(e.target.value)}
            onProductSelect={handleProductSelect}
            onBrandSelect={handleBrandSelect}
            onStoreFilterChange={handleStoreFilterChange}
            onShowStoreModal={() => setShowStoreModal(true)}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Transfers List */}
        <TransfersList
          transfers={transfers}
          loading={loading}
          user={user}
          userStoreId={userStoreInfo.id}
          canSeeAllTransfers={canSeeAllTransfers}
          onHonorTransfer={handleHonorTransfer}
          onDeclineTransfer={handleDeclineTransfer}
          getStatusBadge={getStatusBadge}
        />
      </div>

      {/* Modals */}
      <PharmacyStoreModal show={showStoreModal} onClose={() => setShowStoreModal(false)} onSuccess={handleStoreSuccess} />
      <HonorTransferModal show={showHonorModal} transfer={selectedTransfer} onClose={() => setShowHonorModal(false)} onSuccess={handleTransferSuccess} />
      <DeclineTransferModal show={showDeclineModal} transfer={selectedTransfer} onClose={() => setShowDeclineModal(false)} onSuccess={handleTransferSuccess} />
    </PharmacyLayout>
  );
};

export default StockTransferManagement;