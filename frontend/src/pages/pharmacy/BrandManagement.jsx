// BrandManagement.jsx - Compact & Beautiful Tabular Version
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';
import { useMessage } from '../../context/MessageProvider';
import PharmacyLayout from './PharmacyLayout';
import BrandDetailModal from './modals/BrandDetailModal';
import BrandEditModal from './modals/BrandEditModal';

const BrandManagement = () => {
  const { user } = useAuth();
  const { showMessage } = useMessage();
  
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    product: '',
    barcode: '',
    cost_price: '',
    selling_price: '',
    unit_of_sale: 1,
    reorder_level: 10,
    created_by: user?.id || ''
  });

  useEffect(() => {
    if (user) {
      fetchBrands();
      fetchProducts();
      setFormData(prev => ({ ...prev, created_by: user.id }));
    }
  }, [user]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/pharmacyapi/brands/');
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      showMessage('Error loading brands', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/pharmacyapi/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showMessage('Error loading products', 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    if (parseFloat(formData.selling_price) < parseFloat(formData.cost_price)) {
      showMessage('Selling price cannot be less than cost price', 'warning');
      setFormLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        unit_of_sale: parseInt(formData.unit_of_sale),
        reorder_level: parseInt(formData.reorder_level),
        product: parseInt(formData.product),
        created_by: user.id
      };

      await axiosInstance.post('/pharmacyapi/brands/', submitData);
      
      setShowForm(false);
      resetForm();
      fetchBrands();
      showMessage('Brand created successfully!', 'success');
      
    } catch (error) {
      console.error('Error creating brand:', error);
      const errorMessage = error.response?.data?.message || 'Error creating brand. Please try again.';
      showMessage(errorMessage, 'danger');
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleViewDetails = (brand) => {
    setSelectedBrand(brand);
    setShowDetailModal(true);
  };

  const handleEditBrand = (brand) => {
    setSelectedBrand(brand);
    setShowEditModal(true);
  };

  const handleBrandUpdate = () => {
    fetchBrands();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      product: '',
      barcode: '',
      cost_price: '',
      selling_price: '',
      unit_of_sale: 1,
      reorder_level: 10,
      created_by: user?.id || ''
    });
  };

  const calculateProfitMargin = () => {
    if (!formData.cost_price || !formData.selling_price) return 0;
    const cost = parseFloat(formData.cost_price);
    const selling = parseFloat(formData.selling_price);
    if (cost === 0) return 0;
    return ((selling - cost) / cost * 100).toFixed(1);
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (brand.barcode && brand.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesProduct = selectedProduct === 'all' || brand.product?.toString() === selectedProduct;
    return matchesSearch && matchesProduct;
  });

  if (!user) {
    return (
      <PharmacyLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="p-3 bg-blue-100 rounded-full">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="mt-2 text-sm text-gray-600">Please log in to access</p>
        </div>
      </PharmacyLayout>
    );
  }

  const profitMargin = calculateProfitMargin();

  return (
    <PharmacyLayout>
      <div className="space-y-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white shadow">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Brand Management</h1>
              <p className="text-[10px] text-blue-100">Manage brands & pricing</p>
            </div>
          </div>
          <button
            className="flex items-center gap-1 px-2 py-1 bg-white text-blue-600 text-xs font-medium rounded shadow hover:shadow-md transition-all"
            onClick={() => setShowForm(true)}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Brand
          </button>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-blue-50 rounded-md p-1.5 text-center">
            <div className="text-[9px] text-blue-600 font-semibold uppercase">Brands</div>
            <div className="text-lg font-bold text-blue-700">{brands.length}</div>
          </div>
          <div className="bg-emerald-50 rounded-md p-1.5 text-center">
            <div className="text-[9px] text-emerald-600 font-semibold uppercase">Active</div>
            <div className="text-lg font-bold text-emerald-700">{brands.filter(b => b.stock_level > 0).length}</div>
          </div>
          <div className="bg-amber-50 rounded-md p-1.5 text-center">
            <div className="text-[9px] text-amber-600 font-semibold uppercase">Low</div>
            <div className="text-lg font-bold text-amber-700">{brands.filter(b => b.is_low_stock).length}</div>
          </div>
          <div className="bg-purple-50 rounded-md p-1.5 text-center">
            <div className="text-[9px] text-purple-600 font-semibold uppercase">Products</div>
            <div className="text-lg font-bold text-purple-700">{products.length}</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="sm:w-48 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 outline-none"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="all">All Products</option>
            {products.map(product => (
              <option key={product.id} value={product.id} className="text-xs">
                {product.name} {product.strength}
              </option>
            ))}
          </select>
          
          <button
            onClick={fetchBrands}
            disabled={loading}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center"
            title="Refresh"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Add Brand Form - Compact */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <h3 className="text-xs font-bold text-gray-800">Create New Brand</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Brand Name *" name="name" value={formData.name} onChange={handleInputChange} className="px-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
                <select name="product" value={formData.product} onChange={handleInputChange} className="px-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required>
                  <option value="">Select Product *</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} {p.strength}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="Barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} className="px-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
                <div className="relative">
                  <span className="absolute left-2 top-1.5 text-gray-500 text-xs">₦</span>
                  <input type="number" step="0.01" placeholder="Cost Price" name="cost_price" value={formData.cost_price} onChange={handleInputChange} className="w-full pl-6 pr-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1.5 text-gray-500 text-xs">₦</span>
                  <input type="number" step="0.01" placeholder="Selling Price" name="selling_price" value={formData.selling_price} onChange={handleInputChange} className="w-full pl-6 pr-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Unit of Sale" name="unit_of_sale" value={formData.unit_of_sale} onChange={handleInputChange} className="px-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
                <input type="number" placeholder="Reorder Level" name="reorder_level" value={formData.reorder_level} onChange={handleInputChange} className="px-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              {profitMargin !== 0 && (
                <div className={`text-[10px] font-medium ${profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  Margin: {profitMargin}%
                </div>
              )}
              <button type="submit" disabled={formLoading} className="w-full py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded-lg">
                {formLoading ? 'Saving...' : 'Save Brand'}
              </button>
            </form>
          </div>
        )}

        {/* Brands Table - Compact & Beautiful */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-3 py-2 border-b">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">
                {filteredBrands.length} Brand{filteredBrands.length !== 1 ? 's' : ''}
              </span>
              <span className="text-[9px] text-gray-400">Stock via Supply & Inventory</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-8 text-center">
                <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-500 mt-1">Loading...</p>
              </div>
            ) : filteredBrands.length === 0 ? (
              <div className="py-8 text-center">
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-gray-500">No brands found</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Brand</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Product</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Price</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Stock</th>
                    <th className="py-2 px-2 text-center font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBrands.map(brand => {
                    const margin = ((brand.selling_price - brand.cost_price) / brand.cost_price * 100).toFixed(1);
                    return (
                      <tr key={brand.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-2 px-3">
                          <div className="font-medium text-gray-800">{brand.name}</div>
                          {brand.barcode && <div className="text-[9px] text-gray-400">#{brand.barcode}</div>}
                        </td>
                        <td className="py-2 px-3">
                          <div className="text-gray-700">{brand.product_name}</div>
                          <div className="text-[9px] text-gray-400">Reorder: {brand.reorder_level}</div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-emerald-600">₦{parseFloat(brand.selling_price).toLocaleString()}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[9px] text-gray-400">₦{parseFloat(brand.cost_price).toLocaleString()}</span>
                            <span className={`text-[9px] px-1 rounded ${margin >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {margin}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                            brand.stock_level === 0 ? 'bg-red-100 text-red-700' :
                            brand.is_low_stock ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              brand.stock_level === 0 ? 'bg-red-500' :
                              brand.is_low_stock ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}></div>
                            {brand.stock_level || 0}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => handleViewDetails(brand)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="View Details"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEditBrand(brand)}
                              className="p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                              title="Edit Brand"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BrandDetailModal show={showDetailModal} onClose={() => setShowDetailModal(false)} brand={selectedBrand} onBrandUpdate={handleBrandUpdate} />
      <BrandEditModal show={showEditModal} onClose={() => setShowEditModal(false)} brand={selectedBrand} onBrandUpdate={handleBrandUpdate} />
    </PharmacyLayout>
  );
};

export default BrandManagement;