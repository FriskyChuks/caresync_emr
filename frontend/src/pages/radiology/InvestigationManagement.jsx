// InvestigationManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import useAuth from '../../hooks/useAuth';
import { useMessage } from '../../context/MessageProvider';
import InvestigationList from './Investigationsubcomponents/InvestigationList';
import InvestigationForm from './Investigationsubcomponents/InvestigationForm';
import ViewsManagement from './Investigationsubcomponents/ViewsManagement';

const InvestigationManagement = () => {
  const { user } = useAuth();
  const { showMessage } = useMessage();

  const [investigations, setInvestigations] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedInvestigation, setSelectedInvestigation] = useState(null);
  const [showViewsModal, setShowViewsModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    radiology_unit: '',
    has_views: false,
    price: '',
    views: [{ title: '', price: '' }]
  });

  // Fetch investigations and units
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, unitsRes] = await Promise.all([
        axiosInstance.get('/radiologyapi/investigations/'),
        axiosInstance.get('/radiologyapi/units/')
      ]);
      setInvestigations(invRes.data || []);
      setUnits(unitsRes.data || []);
    } catch (err) {
      console.error('Error fetching data', err);
      showMessage('Failed to fetch data', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleViewChange = (index, field, value) => {
    const updatedViews = [...formData.views];
    updatedViews[index] = { ...updatedViews[index], [field]: value };
    setFormData(prev => ({ ...prev, views: updatedViews }));
  };

  const addViewField = () => {
    setFormData(prev => ({
      ...prev,
      views: [...prev.views, { title: '', price: '' }]
    }));
  };

  const removeViewField = (index) => {
    if (formData.views.length > 1) {
      const updatedViews = formData.views.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, views: updatedViews }));
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      radiology_unit: '',
      has_views: false,
      price: '',
      views: [{ title: '', price: '' }]
    });
  };

  // Create investigation
  const handleCreate = async (formData) => {
    setCreating(true);
    try {
      const payload = {
        title: formData.title,
        radiology_unit: parseInt(formData.radiology_unit),
        has_views: formData.has_views,
        price: formData.price || '0.00',
        created_by: user.id
      };

      if (formData.has_views && formData.views.length > 0) {
        payload.views = formData.views
          .filter(view => view.title.trim())
          .map(view => ({
            title: view.title,
            price: view.price || '0.00'
          }));
      }

      await axiosInstance.post('/radiologyapi/investigations/', payload);
      showMessage('Investigation created successfully!', 'success');
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error creating investigation', err);
      showMessage('Failed to create investigation', 'danger');
    } finally {
      setCreating(false);
    }
  };

  // Edit investigation
  const handleEditClick = async (investigation) => {
    try {
      const response = await axiosInstance.get(`/radiologyapi/investigations/${investigation.id}/`);
      const investigationData = response.data;
      
      setFormData({
        id: investigationData.id,
        title: investigationData.title,
        radiology_unit: investigationData.radiology_unit,
        has_views: investigationData.has_views,
        price: investigationData.price,
        views: investigationData.views || []
      });
      
      setShowEditModal(true);
    } catch (err) {
      console.error('Error fetching investigation details', err);
      showMessage('Failed to load investigation details', 'danger');
    }
  };

  const handleUpdate = async (formData) => {
    setUpdating(true);
    try {
      const payload = {
        title: formData.title,
        radiology_unit: parseInt(formData.radiology_unit),
        has_views: formData.has_views,
        price: formData.price || '0.00'
      };

      await axiosInstance.put(`/radiologyapi/investigations-update/${formData.id}/`, payload);
      showMessage('Investigation updated successfully!', 'success');
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error updating investigation', err);
      showMessage('Failed to update investigation', 'danger');
    } finally {
      setUpdating(false);
    }
  };

  // Views management
  const handleViewViews = (investigation) => {
    setSelectedInvestigation(investigation);
    setShowViewsModal(true);
  };

  const handleViewsUpdate = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Investigation Management</h2>
            <p className="text-blue-100 text-sm mt-1">
              Manage radiology investigations and procedures
            </p>
          </div>
          <button 
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center space-x-2"
            onClick={() => setShowCreateModal(true)}
          >
            <span>➕</span>
            <span>New Investigation</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
          <InvestigationList
            investigations={investigations}
            loading={loading}
            onViewViews={handleViewViews}
            onEditInvestigation={handleEditClick}
          />
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Create New Investigation</h3>
                <button 
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="text-white hover:text-blue-200"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4">
              <InvestigationForm
                formData={formData}
                units={units}
                isSubmitting={creating}
                onSubmit={handleCreate}
                onClose={() => { setShowCreateModal(false); resetForm(); }}
                onInputChange={handleInputChange}
                onViewChange={handleViewChange}
                onAddView={addViewField}
                onRemoveView={removeViewField}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Edit Investigation</h3>
                <button 
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="text-white hover:text-indigo-200"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4">
              <InvestigationForm
                formData={formData}
                units={units}
                isEditing={true}
                isSubmitting={updating}
                onSubmit={handleUpdate}
                onClose={() => { setShowEditModal(false); resetForm(); }}
                onInputChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Views Management Modal */}
      <ViewsManagement
        investigation={selectedInvestigation}
        show={showViewsModal}
        onHide={() => setShowViewsModal(false)}
        onUpdate={handleViewsUpdate}
      />
    </div>
  );
};

export default InvestigationManagement;