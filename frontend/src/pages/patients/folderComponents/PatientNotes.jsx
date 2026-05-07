import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import useAuth from "../../../hooks/useAuth";
import { useMessage } from "../../../context/MessageProvider";
import ClerkingForm from "../../clerking/ClerkingForm";
import ReusableModal from "../../../components/common/ReusableModal";

const PatientNotes = ({ refreshTrigger = 0, maxHeight = "400px" }) => {
  const { pid } = useParams();
  const { user } = useAuth();
  const { showMessage } = useMessage();

  const [notes, setNotes] = useState([]);
  const [noteTypes, setNoteTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({});

  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (pid) {
      fetchNotes();
      fetchNoteTypes();
    }
  }, [pid, refreshTrigger]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/clerkingapi/patient_notes/${pid}/`);
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching patient notes:", err);
      showMessage("Unable to load notes", "danger");
    } finally {
      setLoading(false);
    }
  };

  const fetchNoteTypes = async () => {
    try {
      const response = await axiosInstance.get("/clerkingapi/notetype/");
      setNoteTypes(response.data);
    } catch (error) {
      console.error("Error fetching note types:", error);
    }
  };

  const formatDateTime = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) =>
        filterType === "all" ? true : note.note_type === parseInt(filterType)
      )
      .filter(
        (note) =>
          note.header?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.body?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
  }, [notes, filterType, searchTerm]);

  // View Handlers
  const handleViewNote = (note) => {
    setSelectedNote(note);
    setShowViewModal(true);
  };

  const handleViewModalClose = () => {
    setShowViewModal(false);
    setSelectedNote(null);
  };

  // Add Note Handlers
  const handleAddNote = () => {
    setFormData({});
    setShowAddModal(true);
  };

  const handleAddInputChange = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    if (!formData.note_type || !formData.header?.trim() || !formData.body?.trim()) {
      showMessage("Please fill in all required fields", "warning");
      setSaving(false);
      return;
    }

    try {
      const createData = {
        patient: parseInt(pid),
        note_type: parseInt(formData.note_type),
        header: formData.header.trim(),
        body: formData.body.trim(),
        created_by: user.id,
      };

      await axiosInstance.post(`/clerkingapi/note/`, createData);

      setShowAddModal(false);
      setFormData({});
      await fetchNotes();
      showMessage("Note created successfully", "success");
    } catch (error) {
      console.error("Error creating note:", error);
      showMessage("Failed to create note", "danger");
    } finally {
      setSaving(false);
    }
  };

  // Edit Handlers
  const handleEditNote = (note) => {
    setEditingNote(note);
    setFormData({
      note_type: note.note_type,
      header: note.header,
      body: note.body,
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData = {
        patient: parseInt(pid),
        note_type: parseInt(formData.note_type),
        header: formData.header?.trim(),
        body: formData.body?.trim(),
        created_by: user.id,
      };

      await axiosInstance.patch(
        `/clerkingapi/note/update/${editingNote.id}/`,
        updateData
      );

      setShowEditModal(false);
      setEditingNote(null);
      setFormData({});
      await fetchNotes();
      showMessage("Note updated successfully", "success");
    } catch {
      showMessage("Failed to update note", "danger");
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    if (!saving) {
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingNote(null);
      setFormData({});
    }
  };

  // Note type colors for consistent styling
  const getNoteTypeColor = (typeName) => {
    const colorMap = {
      'General': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: '📝', gradient: 'from-blue-400 to-blue-600' },
      'Clinical': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: '🏥', gradient: 'from-red-400 to-red-600' },
      'Progress': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: '📈', gradient: 'from-green-400 to-green-600' },
      'Discharge': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: '🏡', gradient: 'from-purple-400 to-purple-600' },
      'Follow-up': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: '↪️', gradient: 'from-orange-400 to-orange-600' },
      'Medication': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', icon: '💊', gradient: 'from-indigo-400 to-indigo-600' },
      'Procedure': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', icon: '🔬', gradient: 'from-pink-400 to-pink-600' },
      'Assessment': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', icon: '📋', gradient: 'from-teal-400 to-teal-600' },
    };
    
    const defaultColor = { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: '📄', gradient: 'from-gray-400 to-gray-600' };
    return colorMap[typeName] || defaultColor;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-gradient-to-r from-blue-500 to-purple-500 border-r-transparent"></div>
          <p className="mt-3 text-gray-500">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Beautiful Header with Gradient */}
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <div className="text-white text-lg">📋</div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Patient Notes</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                    {filteredNotes.length} notes
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
                  <span className="text-white/80 text-xs">Updated</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {/* Add Note Button */}
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Note
              </button>

              {/* Filter and Search */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Filter Dropdown */}
                <div className="relative">
                  <select
                    className="appearance-none w-full sm:w-auto pl-10 pr-8 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all" className="text-gray-900">All Types</option>
                    {noteTypes.map((type) => (
                      <option key={type.id} value={type.id} className="text-gray-900">
                        {type.title}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    className="w-full sm:w-48 pl-9 pr-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Table */}
        <div className="overflow-auto" style={{ maxHeight }}>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center mb-4">
                <div className="text-3xl">📝</div>
              </div>
              <h4 className="text-gray-900 font-medium mb-1">No notes found</h4>
              <p className="text-gray-500 text-sm mb-4">Start by creating your first note</p>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Note
              </button>
            </div>
          ) : (
            <div className="p-3">
              <div className="space-y-2">
                {filteredNotes.map((note) => {
                  const typeColor = getNoteTypeColor(note.notetype);
                  return (
                    <div 
                      key={note.id} 
                      className="group bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => handleViewNote(note)}
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}>
                              {typeColor.icon} {note.notetype}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(note.date_created)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditNote(note);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-500"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {note.header}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2 whitespace-pre-wrap">
                            {note.body}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="text-gray-500">By:</span>
                              <span className="font-medium text-gray-700">{note.written_by}</span>
                            </div>
                          </div>
                          <span className="text-gray-400 text-[10px]">
                            Click to view details
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal using ReusableModal */}
      <ReusableModal
        show={showAddModal}
        onClose={handleModalClose}
        title={
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Create New Note</span>
            </div>
          </div>
        }
        size="xl"
      >
        <form onSubmit={handleCreateNote}>
          <ClerkingForm
            formData={formData}
            onChange={handleAddInputChange}
            disabled={saving}
          />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-blue-100">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={saving}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="group relative flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Create Note
                </>
              )}
            </button>
          </div>
        </form>
      </ReusableModal>

      {/* Edit Modal using ReusableModal */}
      <ReusableModal
        show={showEditModal}
        onClose={handleModalClose}
        title={
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-medium">Edit Note</span>
            </div>
          </div>
        }
        size="xl"
      >
        <form onSubmit={handleSaveEdit}>
          <ClerkingForm
            formData={formData}
            onChange={handleEditInputChange}
            disabled={saving}
          />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-blue-100">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={saving}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="group relative flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Update Note
                </>
              )}
            </button>
          </div>
        </form>
      </ReusableModal>

      {/* View Modal */}
      {showViewModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-95 animate-in fade-in zoom-in">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                      <div className="text-white">📋</div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Note Details</h3>
                      <p className="text-sm text-gray-500">{selectedNote.notetype}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleViewModalClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                    <div className="text-xs text-blue-600 font-medium mb-1">Header</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedNote.header}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                    <div className="text-xs text-green-600 font-medium mb-1">Written By</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedNote.written_by}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 font-medium mb-1">Date Created</div>
                  <div className="text-sm font-semibold text-gray-900">{formatDateTime(selectedNote.date_created)}</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <div className="text-sm font-semibold text-gray-900">Note Content</div>
                  </div>
                  <div className="p-4">
                    <pre className="text-gray-700 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {selectedNote.body}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    handleViewModalClose();
                    handleEditNote(selectedNote);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Note
                </button>
                <button
                  onClick={handleViewModalClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientNotes;