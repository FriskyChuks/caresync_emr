// components/ViewsManagement.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useMessage } from '../../../context/MessageProvider';
import ReusableModal from '../../../components/common/ReusableModal';

const ViewsManagement = ({ investigation, show, onHide, onUpdate }) => {
  const { showMessage } = useMessage();
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingView, setEditingView] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [editForm, setEditForm] = useState({
    title: '',
    price: ''
  });

  useEffect(() => {
    if (investigation && show) {
      fetchViews();
    }
  }, [investigation, show]);

  const fetchViews = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/radiologyapi/investigation-views/?investigation=${investigation.id}`);
      setViews(response.data || []);
    } catch (err) {
      console.error('Error fetching views', err);
      showMessage('Failed to fetch views', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (view) => {
    setEditingView(view);
    setEditForm({
      title: view.title,
      price: view.price
    });
    setShowEditModal(true);
  };

  const handleUpdateView = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await axiosInstance.put(`/radiologyapi/investigation-views/${editingView.id}/`, editForm);
      showMessage('View updated successfully!', 'success');
      setShowEditModal(false);
      setEditingView(null);
      fetchViews();
      onUpdate();
    } catch (err) {
      console.error('Error updating view', err);
      showMessage('Failed to update view', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteView = async (viewId) => {
    if (window.confirm('Are you sure you want to delete this view?')) {
      try {
        await axiosInstance.delete(`/radiologyapi/investigation-views/${viewId}/`);
        showMessage('View deleted successfully!', 'success');
        fetchViews();
        onUpdate();
      } catch (err) {
        console.error('Error deleting view', err);
        showMessage('Failed to delete view', 'error');
      }
    }
  };

  const handleAddView = async () => {
    const title = prompt('Enter view title:');
    if (title) {
      try {
        await axiosInstance.post('/radiologyapi/investigation-views/', {
          investigation: investigation.id,
          title: title,
          price: '0.00'
        });
        showMessage('View added successfully!', 'success');
        fetchViews();
        onUpdate();
      } catch (err) {
        console.error('Error adding view', err);
        showMessage('Failed to add view', 'error');
      }
    }
  };

  return (
    <>
      <ReusableModal
        show={show}
        onHide={onHide}
        title={
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">👁️</span>
            <span className="font-bold">Views for {investigation?.title}</span>
          </div>
        }
        size="lg"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">
              Manage Investigation Views
            </div>
            <button
              className="inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-md transition-all duration-300"
              onClick={handleAddView}
            >
              <span className="mr-1">+</span>
              Add View
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : views.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-xs font-semibold text-gray-700">
                    <th className="py-2 px-3 text-left">View Title</th>
                    <th className="py-2 px-3 text-left">Price</th>
                    <th className="py-2 px-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {views.map((view) => (
                    <tr key={view.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2 px-3">
                        <div className="text-sm text-gray-800">{view.title}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-sm font-medium text-emerald-600">
                          ₦{parseFloat(view.price || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          <button 
                            className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                            onClick={() => handleEditClick(view)}
                          >
                            <span className="mr-1">✏️</span>
                            Edit
                          </button>
                          <button 
                            className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400 transition-colors"
                            onClick={() => handleDeleteView(view.id)}
                          >
                            <span className="mr-1">🗑️</span>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-blue-200">
              <span className="text-3xl mb-2 block">📂</span>
              <p className="text-gray-600">No views configured</p>
              <p className="text-sm text-gray-500">Add views to enable multi-view pricing</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Views: <span className="font-medium text-blue-600">{views.length}</span>
          </div>
          <button
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            onClick={onHide}
          >
            Close
          </button>
        </div>
      </ReusableModal>

      {/* Edit View Modal */}
      <ReusableModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        title={
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">✏️</span>
            <span className="font-bold">Edit View</span>
          </div>
        }
        size="md"
      >
        <form onSubmit={handleUpdateView}>
          <div className="p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <span className="text-rose-500">*</span> View Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price (₦)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  value={editForm.price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <button
              type="button"
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowEditModal(false)}
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={updating || !editForm.title.trim()}
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1"></div>
                  Updating...
                </>
              ) : (
                <>
                  <span className="mr-1">💾</span>
                  Update View
                </>
              )}
            </button>
          </div>
        </form>
      </ReusableModal>
    </>
  );
};

export default ViewsManagement;