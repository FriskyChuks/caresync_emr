import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Save,
  Shield,
  Edit,
  Trash2,
  Search,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Pill,
  FlaskConical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';
import useAuth from '../../../hooks/useAuth';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { showMessage } = useMessage();
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pharmacyStores, setPharmacyStores] = useState([]);
  const [labUnits, setLabUnits] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    pageSize: 10
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    other_name: '',
    username: '',
    email: '',
    gender: '',
    user_category: '',
    pharmacy_store: '',
    lab_unit: '',
    password: '',
    re_password: '',
    is_active: true,
    is_staff: false,
    is_intern: false,
    is_pharmacy_store_manager: false,
  });

  // Fetch users with search and filter
  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('page_size', pagination.pageSize);
      
      // Add search term if exists
      if (searchTerm && searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
      }
      
      // Add category filter if exists
      if (filterCategory && filterCategory !== '') {
        params.append('user_category', filterCategory);
      }
      
      const url = `/accountapi/users/${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('Fetching users from URL:', url);
      
      const response = await axiosInstance.get(url);
      
      console.log('Users response:', response.data);
      
      // Handle paginated response
      if (response.data.results) {
        setUsers(response.data.results);
        setPagination({
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: page,
          pageSize: pagination.pageSize
        });
      } else {
        setUsers(Array.isArray(response.data) ? response.data : []);
        setPagination(prev => ({
          ...prev,
          count: Array.isArray(response.data) ? response.data.length : 0,
          currentPage: page
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterCategory, pagination.pageSize, showMessage]);

  // Fetch user categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/accountapi/usergroup/');
      console.log('Categories response:', response.data);
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Fetch pharmacy stores
  const fetchPharmacyStores = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/pharmacyapi/pharmacy-stores/');
      setPharmacyStores(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching pharmacy stores:', error);
    }
  }, []);

  // Fetch lab units
  const fetchLabUnits = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/labapi/lab-units/');
      setLabUnits(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching lab units:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchUsers(1);
    fetchCategories();
    fetchPharmacyStores();
    fetchLabUnits();
  }, []);

  // Refetch when search/filter changes (with debounce)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== undefined || filterCategory !== undefined) {
        fetchUsers(1);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filterCategory]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      other_name: '',
      username: '',
      email: '',
      gender: '',
      user_category: '',
      pharmacy_store: '',
      lab_unit: '',
      password: '',
      re_password: '',
      is_active: true,
      is_staff: false,
      is_intern: false,
      is_pharmacy_store_manager: false,
    });
    setEditingUser(null);
    setShowPassword(false);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation
    if (!editingUser) {
      if (formData.password !== formData.re_password) {
        showMessage('Passwords do not match', 'error');
        setSubmitting(false);
        return;
      }
      if (formData.password.length < 8) {
        showMessage('Password must be at least 8 characters long', 'error');
        setSubmitting(false);
        return;
      }
    }

    try {
      // Prepare user data
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email || '',
        user_category: formData.user_category ? parseInt(formData.user_category) : null,
        pharmacy_store: formData.pharmacy_store ? parseInt(formData.pharmacy_store) : null,
        lab_unit: formData.lab_unit ? parseInt(formData.lab_unit) : null,
        is_active: formData.is_active,
        is_staff: formData.is_staff,
        is_intern: formData.is_intern,
        is_pharmacy_store_manager: formData.is_pharmacy_store_manager,
        gender: formData.gender ? parseInt(formData.gender) : null,
        other_name: formData.other_name || '',
      };

      // Add password for new users
      if (!editingUser) {
        userData.password = formData.password;
        userData.re_password = formData.re_password;
        userData.patient = {
          status: 'adult',
          phone: '',
          date_of_birth: null,
          age: null
        };
      } else if (formData.password) {
        userData.password = formData.password;
        userData.re_password = formData.re_password;
      }

      console.log('Saving user data:', userData);

      if (editingUser) {
        await axiosInstance.put(`/accountapi/users/${editingUser.id}/`, userData);
        showMessage('User updated successfully!', 'success');
      } else {
        await axiosInstance.post('/accountapi/users/', userData);
        showMessage('User created successfully!', 'success');
      }

      fetchUsers(pagination.currentPage);
      setShowUserForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
      const errorData = error.response?.data;
      let errorMsg = 'An error occurred. Please try again.';
      
      if (errorData) {
        if (typeof errorData === 'object') {
          const firstError = Object.entries(errorData)[0];
          if (firstError) {
            const [field, messages] = firstError;
            errorMsg = `${field}: ${Array.isArray(messages) ? messages[0] : messages}`;
          }
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
      }
      
      showMessage(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      other_name: user.other_name || '',
      username: user.username || '',
      email: user.email || '',
      gender: user.gender?.id || user.gender || '',
      user_category: user.user_category?.id || user.user_category || '',
      pharmacy_store: user.pharmacy_store?.id || user.pharmacy_store || '',
      lab_unit: user.lab_unit?.id || user.lab_unit || '',
      password: '',
      re_password: '',
      is_active: user.is_active,
      is_staff: user.is_staff,
      is_intern: user.is_intern || false,
      is_pharmacy_store_manager: user.is_pharmacy_store_manager || false,
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axiosInstance.delete(`/accountapi/users/${userId}/`);
      showMessage('User deleted successfully!', 'success');
      fetchUsers(pagination.currentPage);
    } catch (error) {
      console.error('Error deleting user:', error);
      showMessage('Failed to delete user.', 'error');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await axiosInstance.patch(`/accountapi/users/${userId}/toggle-status/`);
      showMessage(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
      fetchUsers(pagination.currentPage);
    } catch (error) {
      console.error('Error toggling user status:', error);
      showMessage('Failed to update user status.', 'error');
    }
  };

  const handleToggleStaff = async (userId, currentStatus) => {
    try {
      await axiosInstance.patch(`/accountapi/users/${userId}/toggle-staff/`);
      showMessage(`Staff status updated successfully!`, 'success');
      fetchUsers(pagination.currentPage);
    } catch (error) {
      console.error('Error toggling staff status:', error);
      showMessage('Failed to update staff status.', 'error');
    }
  };

  const getCategoryName = (category) => {
    if (!category) return '-';
    if (typeof category === 'object') return category.title;
    const cat = categories.find(c => c.id === category);
    return cat?.title || '-';
  };

  const getPharmacyStoreName = (store) => {
    if (!store) return '-';
    if (typeof store === 'object') return store.name;
    const storeObj = pharmacyStores.find(s => s.id === store);
    return storeObj?.name || '-';
  };

  const getLabUnitName = (unit) => {
    if (!unit) return '-';
    if (typeof unit === 'object') return unit.name;
    const unitObj = labUnits.find(u => u.id === unit);
    return unitObj?.name || '-';
  };

  // Access Denied for non-admin users
  if (!currentUser?.is_staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500">Manage users, roles, and permissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <button
              onClick={() => {
                resetForm();
                setShowUserForm(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add New User</span>
            </button>

            {/* Search and Filter */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 text-primary-600 animate-spin" />
            </div>
          )}

          {/* Users Table */}
          {!loading && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                                <div className="text-xs text-gray-400">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                              {getCategoryName(user.user_category)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.pharmacy_store && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <Pill className="h-4 w-4 text-gray-400" />
                                <span>{getPharmacyStoreName(user.pharmacy_store)}</span>
                              </div>
                            )}
                            {user.lab_unit && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <FlaskConical className="h-4 w-4 text-gray-400" />
                                <span>{getLabUnitName(user.lab_unit)}</span>
                              </div>
                            )}
                            {!user.pharmacy_store && !user.lab_unit && (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                                user.is_active 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleStaff(user.id, user.is_staff)}
                              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                                user.is_staff 
                                  ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {user.is_staff ? 'Staff' : 'User'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-primary-600 hover:text-primary-900"
                                title="Edit user"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete user"
                                disabled={user.id === currentUser?.id}
                              >
                                <Trash2 className={`h-4 w-4 ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.count > 0 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => fetchUsers(pagination.currentPage - 1)}
                      disabled={!pagination.previous}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchUsers(pagination.currentPage + 1)}
                      disabled={!pagination.next}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.currentPage * pagination.pageSize, pagination.count)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.count}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => fetchUsers(pagination.currentPage - 1)}
                          disabled={!pagination.previous}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary-50 text-sm font-medium text-primary-600"
                        >
                          {pagination.currentPage}
                        </button>
                        <button
                          onClick={() => fetchUsers(pagination.currentPage + 1)}
                          disabled={!pagination.next}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button
                onClick={() => {
                  setShowUserForm(false);
                  resetForm();
                }}
                className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Name
                    </label>
                    <input
                      type="text"
                      name="other_name"
                      value={formData.other_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="1">Male</option>
                      <option value="2">Female</option>
                      <option value="3">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  {!editingUser && (
                    <>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={!editingUser}
                          minLength={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-8 text-gray-500"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="re_password"
                          value={formData.re_password}
                          onChange={handleInputChange}
                          required={!editingUser}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Role and Permissions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Role & Permissions</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="user_category"
                      value={formData.user_category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pharmacy Store
                    </label>
                    <select
                      name="pharmacy_store"
                      value={formData.pharmacy_store}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">None</option>
                      {pharmacyStores.map(store => (
                        <option key={store.id} value={store.id}>{store.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lab Unit
                    </label>
                    <select
                      name="lab_unit"
                      value={formData.lab_unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">None</option>
                      {labUnits.map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_staff"
                      checked={formData.is_staff}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Staff (Admin Access)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_intern"
                      checked={formData.is_intern}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Intern</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_pharmacy_store_manager"
                      checked={formData.is_pharmacy_store_manager}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Pharmacy Store Manager</span>
                  </label>
                </div>
              </div>

              {/* Password change for edit mode */}
              {editingUser && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Change Password (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        name="re_password"
                        value={formData.re_password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{editingUser ? 'Update User' : 'Create User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;