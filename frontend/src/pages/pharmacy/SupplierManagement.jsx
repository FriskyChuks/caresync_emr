// SupplierManagement.jsx - Table Layout Version
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';
import { useMessage } from '../../context/MessageProvider';
import PharmacyLayout from './PharmacyLayout';

const SupplierManagement = () => {
  const { user } = useAuth();
  const { showMessage } = useMessage();
  
  // Data state
  const [data, setData] = useState({ suppliers: [], products: [], stores: [], supplies: [] });
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('suppliers');
  const [search, setSearch] = useState('');
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showSupplyForm, setShowSupplyForm] = useState(false);
  
  // Form states
  const [supplierForm, setSupplierForm] = useState({ 
    company_name: '', contact_person: '', contact_phone: '', 
    company_email: '', company_address: '', company_url: '' 
  });
  const [supplyStep, setSupplyStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [supplyForm, setSupplyForm] = useState({ 
    batch_no: '', supplier_id: '', store_id: '', 
    quantity: '', price: '', prod_date: '', exp_date: '' 
  });

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toString();
  };

  const fetchData = useCallback(async () => {
    try {
      const [suppliers, products, stores, supplies] = await Promise.all([
        axiosInstance.get('/pharmacyapi/suppliers/'),
        axiosInstance.get('/pharmacyapi/products/'),
        axiosInstance.get('/pharmacyapi/pharmacy-stores/bulk-stores/'),
        axiosInstance.get('/pharmacyapi/supplies/')
      ]);
      setData({ suppliers: suppliers.data, products: products.data, stores: stores.data, supplies: supplies.data });
    } catch (err) {
      showMessage('Error loading data', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  // Product search debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (productSearch.length >= 2) {
        try {
          const res = await axiosInstance.get(`/pharmacyapi/products/?search=${productSearch}`);
          setProducts(res.data);
        } catch (err) { console.error(err); }
      } else {
        setProducts([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const handleSelectProduct = async (product) => {
    setSelectedProduct(product);
    const res = await axiosInstance.get(`/pharmacyapi/brands/?product_id=${product.id}`);
    setBrands(res.data);
    setSupplyStep(2);
  };

  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
    setSupplyStep(3);
  };

  const handleSupplySubmit = async (e) => {
    e.preventDefault();
    try {
      const batch = await axiosInstance.post('/pharmacyapi/batches/', {
        batch_no: supplyForm.batch_no,
        brand: selectedBrand.id,
        production_date: supplyForm.prod_date || null,
        expiry_date: supplyForm.exp_date,
        created_by: user.id
      });
      await axiosInstance.post('/pharmacyapi/supplies/', {
        batch: batch.data.id,
        supplier: parseInt(supplyForm.supplier_id),
        store: parseInt(supplyForm.store_id),
        quantity_supplied: parseInt(supplyForm.quantity),
        supply_price: parseFloat(supplyForm.price),
        created_by: user.id
      });
      showMessage('Supply received successfully!', 'success');
      setShowSupplyForm(false);
      resetSupply();
      fetchData();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error receiving supply', 'danger');
    }
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/pharmacyapi/suppliers/', { ...supplierForm, created_by: user.id });
      showMessage('Supplier created successfully!', 'success');
      setShowSupplierForm(false);
      setSupplierForm({ 
        company_name: '', contact_person: '', contact_phone: '', 
        company_email: '', company_address: '', company_url: '' 
      });
      fetchData();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error creating supplier', 'danger');
    }
  };

  const resetSupply = () => {
    setSupplyStep(1);
    setSelectedProduct(null);
    setSelectedBrand(null);
    setProductSearch('');
    setProducts([]);
    setBrands([]);
    setSupplyForm({ batch_no: '', supplier_id: '', store_id: '', quantity: '', price: '', prod_date: '', exp_date: '' });
  };

  const stats = {
    totalSupplies: data.supplies.length,
    totalUnits: formatNumber(data.supplies.reduce((s, sup) => s + sup.quantity_supplied, 0)),
    totalValue: formatNumber(data.supplies.reduce((s, sup) => s + (sup.quantity_supplied * sup.supply_price), 0))
  };

  const filteredSuppliers = data.suppliers.filter(s => 
    s.company_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSupplies = data.supplies.filter(s => 
    s.brand_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.supplier_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return (
    <PharmacyLayout>
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="p-3 bg-blue-100 rounded-full inline-block">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="mt-2 text-sm text-gray-600">Please log in</p>
        </div>
      </div>
    </PharmacyLayout>
  );

  return (
    <PharmacyLayout>
      <div className="space-y-2 pb-20">
        {/* Ultra Thin Header */}
        <div className="flex justify-between items-center px-2 py-1.5 rounded-md bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white shadow-sm">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-xs font-semibold text-white">Supply Chain</span>
          </div>
          <div className="flex gap-1.5">
            <button 
              onClick={() => { resetSupply(); setShowSupplyForm(true); }} 
              className="px-2 py-0.5 text-[10px] bg-white/20 text-white rounded hover:bg-white/30 transition"
            >
              +Supply
            </button>
            <button 
              onClick={() => setShowSupplierForm(true)} 
              className="px-2 py-0.5 text-[10px] bg-white text-blue-600 font-medium rounded hover:bg-gray-50 transition"
            >
              +Supplier
            </button>
          </div>
        </div>

        {/* Compact Stats Cards */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-blue-50 rounded-md p-1.5 text-center">
            <div className="text-[9px] text-blue-600 font-semibold">Supplies</div>
            <div className="text-base font-bold text-blue-700">{stats.totalSupplies}</div>
          </div>
          <div className="bg-emerald-50 rounded-md p-1.5 text-center">
            <div className="text-[9px] text-emerald-600 font-semibold">Units</div>
            <div className="text-base font-bold text-emerald-700">{stats.totalUnits}</div>
          </div>
          <div className="bg-amber-50 rounded-md p-1.5 text-center">
            <div className="text-[9px] text-amber-600 font-semibold">Value</div>
            <div className="text-base font-bold text-amber-700">₦{stats.totalValue}</div>
          </div>
        </div>

        {/* Compact Tabs */}
        <div className="flex gap-1 bg-gray-100 p-0.5 rounded-md">
          <button 
            onClick={() => setActiveView('suppliers')} 
            className={`flex-1 py-1 rounded text-xs font-medium transition ${
              activeView === 'suppliers' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
            }`}
          >
            Suppliers ({data.suppliers.length})
          </button>
          <button 
            onClick={() => setActiveView('supplies')} 
            className={`flex-1 py-1 rounded text-xs font-medium transition ${
              activeView === 'supplies' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'
            }`}
          >
            History ({data.supplies.length})
          </button>
        </div>

        {/* Compact Search */}
        <div className="relative">
          <svg className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder={`Search ${activeView === 'suppliers' ? 'suppliers by name or contact...' : 'supplies by product or supplier...'}`} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none" 
          />
        </div>

        {/* Supplier Form Modal */}
        {showSupplierForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-sm max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center px-3 py-2 border-b">
                <h3 className="text-sm font-semibold text-gray-800">Add Supplier</h3>
                <button onClick={() => setShowSupplierForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSupplierSubmit} className="p-3 space-y-2">
                <input type="text" placeholder="Company Name *" value={supplierForm.company_name} onChange={e => setSupplierForm({...supplierForm, company_name: e.target.value})} className="w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 outline-none" required />
                <input type="text" placeholder="Contact Person *" value={supplierForm.contact_person} onChange={e => setSupplierForm({...supplierForm, contact_person: e.target.value})} className="w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 outline-none" required />
                <input type="tel" placeholder="Phone *" value={supplierForm.contact_phone} onChange={e => setSupplierForm({...supplierForm, contact_phone: e.target.value})} className="w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 outline-none" required />
                <input type="email" placeholder="Email" value={supplierForm.company_email} onChange={e => setSupplierForm({...supplierForm, company_email: e.target.value})} className="w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 outline-none" />
                <input type="text" placeholder="Address" value={supplierForm.company_address} onChange={e => setSupplierForm({...supplierForm, company_address: e.target.value})} className="w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 outline-none" />
                <button type="submit" className="w-full py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition">Save Supplier</button>
              </form>
            </div>
          </div>
        )}

        {/* Supply Modal - 3 Step Wizard */}
        {showSupplyForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-sm max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center px-3 py-2 border-b bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <div>
                  <h3 className="text-sm font-semibold">Receive Supply</h3>
                  <p className="text-[9px] text-emerald-100">Step {supplyStep}/3</p>
                </div>
                <button onClick={() => { setShowSupplyForm(false); resetSupply(); }} className="text-white/80 hover:text-white">✕</button>
              </div>
              
              <div className="p-3">
                {/* Step 1: Search Product */}
                {supplyStep === 1 && (
                  <>
                    <input type="text" placeholder="Search product..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 outline-none mb-2" autoFocus />
                    <div className="space-y-1.5 max-h-80 overflow-auto">
                      {products.map(p => (
                        <button key={p.id} onClick={() => handleSelectProduct(p)} className="w-full text-left p-2 border rounded-md hover:bg-emerald-50 transition">
                          <div className="text-xs font-medium text-gray-800">{p.name}</div>
                          <div className="text-[10px] text-gray-500">{p.strength} • {p.category}</div>
                        </button>
                      ))}
                      {productSearch.length >= 2 && products.length === 0 && (
                        <div className="text-center text-gray-500 py-3 text-xs">No products found</div>
                      )}
                    </div>
                  </>
                )}

                {/* Step 2: Select Brand */}
                {supplyStep === 2 && selectedProduct && (
                  <>
                    <div className="p-1.5 bg-emerald-50 rounded-md mb-2 text-xs">
                      <span className="text-gray-600">Product:</span> 
                      <span className="font-medium ml-1">{selectedProduct.name}</span>
                    </div>
                    <div className="space-y-1.5 max-h-80 overflow-auto">
                      {brands.map(b => (
                        <button key={b.id} onClick={() => handleSelectBrand(b)} className="w-full text-left p-2 border rounded-md hover:bg-emerald-50 transition">
                          <div className="text-xs font-medium text-gray-800">{b.name}</div>
                          <div className="text-[10px] text-gray-500">₦{parseFloat(b.selling_price).toLocaleString()}</div>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => { setSupplyStep(1); setSelectedProduct(null); }} className="mt-2 text-xs text-gray-500 hover:text-gray-700">← Back</button>
                  </>
                )}

                {/* Step 3: Supply Details */}
                {supplyStep === 3 && selectedBrand && (
                  <form onSubmit={handleSupplySubmit} className="space-y-2">
                    <div className="p-1.5 bg-emerald-50 rounded-md text-xs">
                      <span className="text-gray-600">Item:</span> 
                      <span className="font-medium ml-1">{selectedProduct?.name} - {selectedBrand.name}</span>
                    </div>
                    <input type="text" placeholder="Batch Number *" value={supplyForm.batch_no} onChange={e => setSupplyForm({...supplyForm, batch_no: e.target.value})} className="w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 outline-none" required />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" placeholder="Prod Date" value={supplyForm.prod_date} onChange={e => setSupplyForm({...supplyForm, prod_date: e.target.value})} className="px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 outline-none" />
                      <input type="date" placeholder="Expiry Date *" value={supplyForm.exp_date} onChange={e => setSupplyForm({...supplyForm, exp_date: e.target.value})} className="px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 outline-none" required />
                    </div>
                    <select value={supplyForm.supplier_id} onChange={e => setSupplyForm({...supplyForm, supplier_id: e.target.value})} className="w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 outline-none" required>
                      <option value="">Select Supplier</option>
                      {data.suppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                    </select>
                    <select value={supplyForm.store_id} onChange={e => setSupplyForm({...supplyForm, store_id: e.target.value})} className="w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 outline-none" required>
                      <option value="">Select Store</option>
                      {data.stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="Quantity *" value={supplyForm.quantity} onChange={e => setSupplyForm({...supplyForm, quantity: e.target.value})} className="px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 outline-none" required />
                      <input type="number" step="0.01" placeholder="Unit Price *" value={supplyForm.price} onChange={e => setSupplyForm({...supplyForm, price: e.target.value})} className="px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-emerald-500 outline-none" required />
                    </div>
                    {supplyForm.quantity && supplyForm.price && (
                      <div className="p-1.5 bg-emerald-100 rounded-md text-center">
                        <span className="text-[10px] text-gray-600">Total: </span>
                        <span className="text-xs font-bold text-emerald-700">₦{(parseFloat(supplyForm.quantity) * parseFloat(supplyForm.price)).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => { setSupplyStep(2); setSelectedBrand(null); }} className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition">Back</button>
                      <button type="submit" className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition">Receive</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Suppliers Table */}
        {activeView === 'suppliers' && (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-500 mt-1">Loading...</p>
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-gray-500">No suppliers found</p>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-2 px-2 text-left font-semibold text-gray-600">Company</th>
                      <th className="py-2 px-2 text-left font-semibold text-gray-600">Contact</th>
                      <th className="py-2 px-2 text-left font-semibold text-gray-600">Phone</th>
                      <th className="py-2 px-2 text-center font-semibold text-gray-600">Supplies</th>
                      <th className="py-2 px-2 text-center font-semibold text-gray-600">Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSuppliers.map(s => {
                      const supSupplies = data.supplies.filter(sup => sup.supplier === s.id);
                      const totalUnits = supSupplies.reduce((sum, sup) => sum + sup.quantity_supplied, 0);
                      const unitDisplay = totalUnits >= 1000 ? (totalUnits / 1000).toFixed(1) + 'k' : totalUnits;
                      return (
                        <tr key={s.id} className="hover:bg-gray-50 transition">
                          <td className="py-2 px-2">
                            <div className="font-medium text-gray-800 truncate max-w-[150px]" title={s.company_name}>
                              {s.company_name}
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <div className="text-gray-700 truncate max-w-[100px]" title={s.contact_person}>
                              {s.contact_person}
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <span className="text-gray-600">{s.contact_phone}</span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">
                              {supSupplies.length}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded">
                              {unitDisplay}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            {filteredSuppliers.length > 0 && (
              <div className="bg-gray-50 px-2 py-1 border-t text-[9px] text-gray-400 text-center">
                {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* Supplies History Table */}
        {activeView === 'supplies' && (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="inline-block w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-500 mt-1">Loading...</p>
                </div>
              ) : filteredSupplies.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-gray-500">No supplies found</p>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-2 px-2 text-left font-semibold text-gray-600">Product/Brand</th>
                      <th className="py-2 px-2 text-left font-semibold text-gray-600">Batch</th>
                      <th className="py-2 px-2 text-center font-semibold text-gray-600">Qty</th>
                      <th className="py-2 px-2 text-right font-semibold text-gray-600">Price</th>
                      <th className="py-2 px-2 text-left font-semibold text-gray-600 hidden md:table-cell">Supplier</th>
                      <th className="py-2 px-2 text-left font-semibold text-gray-600 hidden lg:table-cell">Store</th>
                      <th className="py-2 px-2 text-left font-semibold text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSupplies.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 transition">
                        <td className="py-2 px-2">
                          <div className="font-medium text-gray-800 truncate max-w-[120px]" title={s.batch_details?.brand_name || s.brand_name}>
                            {s.batch_details?.brand_name || s.brand_name}
                          </div>
                          <div className="text-[9px] text-gray-400 truncate max-w-[120px]">
                            {s.batch_details?.brand_details?.product_name || s.product_name}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <code className="text-[10px] font-mono text-gray-600 truncate max-w-[80px] block" title={s.batch_details?.batch_no || s.batch_no}>
                            {s.batch_details?.batch_no || s.batch_no}
                          </code>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="font-semibold text-emerald-600">{s.quantity_supplied}</span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <div>₦{s.supply_price.toLocaleString()}</div>
                          <div className="text-[9px] text-gray-400">₦{(s.quantity_supplied * s.supply_price).toLocaleString()}</div>
                        </td>
                        <td className="py-2 px-2 hidden md:table-cell">
                          <span className="text-gray-600 truncate max-w-[100px] block" title={s.supplier_name}>
                            {s.supplier_name}
                          </span>
                        </td>
                        <td className="py-2 px-2 hidden lg:table-cell">
                          <span className="text-gray-500 text-[10px] truncate max-w-[100px] block" title={s.store_name}>
                            {s.store_name}
                          </span>
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                          <span className="text-gray-500 text-[10px]">
                            {new Date(s.date_supplied).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {filteredSupplies.length > 0 && (
              <div className="bg-gray-50 px-2 py-1 border-t text-[9px] text-gray-400 text-center">
                {filteredSupplies.length} supply record{filteredSupplies.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </PharmacyLayout>
  );
};

export default SupplierManagement;