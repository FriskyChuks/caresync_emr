// ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';
import PharmacyLayout from './PharmacyLayout';
import DrugTypeModal from './modals/DrugTypeModal';
import DrugFormModal from './modals/DrugFormModal';

const ProductManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDrugTypeModal, setShowDrugTypeModal] = useState(false);
  const [showDrugFormModal, setShowDrugFormModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    strength: '',
    drugstype: '',
    drugsform: '',
    category: 'drugs',
    description: '',
    created_by: user?.id || '',
  });

  const [drugsTypes, setDrugsTypes] = useState([]);
  const [drugsForms, setDrugsForms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchDropdownData();
      setFormData(prev => ({ ...prev, created_by: user.id }));
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/pharmacyapi/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [typesResponse, formsResponse] = await Promise.all([
        axiosInstance.get('/pharmacyapi/drugs-types/'),
        axiosInstance.get('/pharmacyapi/drugs-forms/')
      ]);
      setDrugsTypes(typesResponse.data);
      setDrugsForms(formsResponse.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setError('Failed to load dropdown data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    if (!formData.name.trim()) {
      setError('Product name is required');
      setFormLoading(false);
      return;
    }

    if (!formData.drugstype) {
      setError('Drug type is required');
      setFormLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        drugstype: parseInt(formData.drugstype),
        drugsform: formData.drugsform ? parseInt(formData.drugsform) : null,
        created_by: user.id
      };

      await axiosInstance.post('/pharmacyapi/products/', submitData);
      
      setShowForm(false);
      setFormData({
        name: '',
        strength: '',
        drugstype: '',
        drugsform: '',
        category: 'drugs',
        description: '',
        created_by: user.id,
      });
      fetchProducts();
      
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error creating product. Please try again.';
      setError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDrugTypeSuccess = () => {
    fetchDropdownData();
    setShowDrugTypeModal(false);
  };

  const handleDrugFormSuccess = () => {
    fetchDropdownData();
    setShowDrugFormModal(false);
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      name: '',
      strength: '',
      drugstype: '',
      drugsform: '',
      category: 'drugs',
      description: '',
      created_by: user?.id || '',
    });
    setError('');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.strength.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.drugstype_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (!user) {
    return (
      <PharmacyLayout>
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">Please log in to access pharmacy management</p>
        </div>
      </PharmacyLayout>
    );
  }

  return (
    <PharmacyLayout>
      <div className="space-y-3">
        {/* Ultra Compact Header */}
        <div className="rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white shadow-md px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white/20 rounded">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Product Management</h1>
                <p className="text-[10px] text-blue-100 leading-tight">Manage pharmaceutical catalog</p>
              </div>
            </div>
            <button
              className="flex items-center gap-1 px-2 py-1 bg-white text-blue-600 hover:bg-blue-50 text-xs font-medium rounded shadow-sm hover:shadow transition-all"
              onClick={() => setShowForm(true)}
              disabled={formLoading}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add
            </button>
          </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-lg p-2">
            <div className="text-[10px] text-blue-600 font-semibold">TOTAL</div>
            <div className="text-base font-bold text-blue-700">{products.length}</div>
          </div>
          <div className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 rounded-lg p-2">
            <div className="text-[10px] text-emerald-600 font-semibold">DRUGS</div>
            <div className="text-base font-bold text-emerald-700">
              {products.filter(p => p.category === 'drugs').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-white to-amber-50 border border-amber-100 rounded-lg p-2">
            <div className="text-[10px] text-amber-600 font-semibold">CONSUM</div>
            <div className="text-base font-bold text-amber-700">
              {products.filter(p => p.category === 'consumables').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-lg p-2">
            <div className="text-[10px] text-purple-600 font-semibold">TYPES</div>
            <div className="text-base font-bold text-purple-700">{drugsTypes.length}</div>
          </div>
        </div>

        {/* Error Alert - Compact */}
        {error && (
          <div className="p-2 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-xs">
              <div className="p-1 bg-red-100 text-red-600 rounded">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-red-700">{error}</span>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Compact Product Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                New Product
              </h3>
              <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={formLoading}
                    placeholder="Paracetamol"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Strength</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    name="strength"
                    value={formData.strength}
                    onChange={handleInputChange}
                    disabled={formLoading}
                    placeholder="500mg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-700">Type *</label>
                  <div className="flex gap-1">
                    <select
                      className="flex-1 px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                      name="drugstype"
                      value={formData.drugstype}
                      onChange={handleInputChange}
                      required
                      disabled={formLoading}
                    >
                      <option value="">Select</option>
                      {drugsTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="px-2 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 border border-blue-200 rounded hover:border-blue-300"
                      onClick={() => setShowDrugTypeModal(true)}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">Form</label>
                  <div className="flex gap-1">
                    <select
                      className="flex-1 px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                      name="drugsform"
                      value={formData.drugsform}
                      onChange={handleInputChange}
                      disabled={formLoading}
                    >
                      <option value="">Select</option>
                      {drugsForms.map(form => (
                        <option key={form.id} value={form.id}>{form.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="px-2 py-1.5 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-600 border border-purple-200 rounded hover:border-purple-300"
                      onClick={() => setShowDrugFormModal(true)}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">Category *</label>
                  <select
                    className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    disabled={formLoading}
                  >
                    <option value="drugs">Drugs</option>
                    <option value="consumables">Consumables</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={formLoading}
                  placeholder="Brief product description..."
                />
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Compact Search */}
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-7 pr-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="w-28 px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All</option>
              <option value="drugs">Drugs</option>
              <option value="consumables">Consum</option>
            </select>
            <button
              className="px-2 py-1.5 bg-white border border-gray-300 hover:border-gray-400 rounded text-gray-700"
              onClick={fetchProducts}
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Ultra Compact Products Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  {filteredProducts.length}
                </span>
                <span className="text-sm font-medium text-gray-800">Products</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-6 flex flex-col items-center">
                <div className="relative">
                  <div className="w-8 h-8 border-3 border-blue-100 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-2 text-xs text-blue-600">Loading...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-6 text-center">
                <div className="inline-block p-2 bg-gray-100 rounded-full">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="mt-2 text-xs text-gray-600">No products found</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Product</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Type/Form</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Category</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Stock</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-blue-50/30">
                      <td className="py-2 px-3">
                        <div className="font-medium text-gray-800 truncate max-w-[120px]">{product.name}</div>
                        {product.strength && (
                          <div className="text-[10px] text-gray-500">{product.strength}</div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-gray-700">{product.drugstype_name}</div>
                        {product.drugsform_name && (
                          <div className="text-[10px] text-gray-500">{product.drugsform_name}</div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                          product.category === 'drugs' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {product.category === 'drugs' ? '💊' : '🧪'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1">
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                            product.total_stock_level === 0 ? 'bg-red-100 text-red-700' :
                            product.is_low_stock ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {product.total_stock_level || 0}
                          </span>
                          {product.is_low_stock && <span className="text-[8px] text-amber-600">⚠️</span>}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-0.5">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Edit">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Brands">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DrugTypeModal
        show={showDrugTypeModal}
        onClose={() => setShowDrugTypeModal(false)}
        onSuccess={handleDrugTypeSuccess}
      />
      <DrugFormModal
        show={showDrugFormModal}
        onClose={() => setShowDrugFormModal(false)}
        onSuccess={handleDrugFormSuccess}
      />
    </PharmacyLayout>
  );
};

export default ProductManagement;