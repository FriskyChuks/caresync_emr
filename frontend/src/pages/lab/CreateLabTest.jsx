import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";
import useAuth from "../../hooks/useAuth";
import { useParams } from "react-router-dom";

/* ---------------------------
   ReferenceRangeForm - Beautiful Design
   --------------------------- */
const ReferenceRangeForm = ({ ranges, onAdd, onChange, onRemove, compact = false }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h6 className="font-semibold text-gray-800">Reference Ranges</h6>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Range
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {ranges.map((range, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border border-blue-200 rounded-xl p-3 hover:border-blue-300 transition-all duration-200 ${
              compact ? "text-sm" : ""
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              {/* Gender */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-blue-700 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Gender
                </label>
                <select
                  name="gender"
                  className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
                  value={range.gender}
                  onChange={(e) => onChange(idx, e)}
                >
                  <option className="text-gray-700">Male</option>
                  <option className="text-gray-700">Female</option>
                  <option className="text-gray-700">Any</option>
                </select>
              </div>

              {/* Age Min */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-blue-700">Age Min</label>
                <input
                  type="text"
                  name="ageMin"
                  className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
                  value={range.ageMin}
                  onChange={(e) => onChange(idx, e)}
                  placeholder="0"
                />
              </div>

              {/* Age Max */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-blue-700">Age Max</label>
                <input
                  type="text"
                  name="ageMax"
                  className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
                  value={range.ageMax}
                  onChange={(e) => onChange(idx, e)}
                  placeholder="100"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-blue-700">Category</label>
                <select
                  name="category"
                  className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
                  value={range.category}
                  onChange={(e) => onChange(idx, e)}
                >
                  <option className="text-gray-700">Adult</option>
                  <option className="text-gray-700">Child</option>
                  <option className="text-gray-700">Any</option>
                </select>
              </div>

              {/* Range Value */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-blue-700">Range Value</label>
                <input
                  type="text"
                  name="rangeValue"
                  className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200"
                  placeholder="30-45"
                  value={range.rangeValue}
                  onChange={(e) => onChange(idx, e)}
                />
              </div>

              {/* Remove Button */}
              <div>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="w-full px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-300 hover:text-red-700 transition-all duration-200 flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------------------
   SubTestForm - Beautiful Card Design
   --------------------------- */
const SubTestForm = ({ sub, idx, onUpdateSub, onRemoveSub, onAddRange, onUpdateRange, onRemoveRange }) => {
  return (
    <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Decorative Side Border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-cyan-500"></div>
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h6 className="font-bold text-gray-900">Sub-Test {idx + 1}</h6>
              <p className="text-sm text-gray-500">Configure individual test parameters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemoveSub(idx)}
            className="px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-300 hover:text-red-700 transition-all duration-200 flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove
          </button>
        </div>

        {/* Sub-Test Details */}
        <div className="grid grid-cols-3 gap-1 mb-2">
          <div>
            <label className="text-xs text-gray-700">Parameter</label>
            <input
              type="text"
              name="parameterName"
              className="w-full text-xs px-2 py-1 bg-white border border-blue-200 rounded"
              value={sub.parameterName}
              onChange={(e) => onUpdateSub(idx, e)}
              required
              placeholder="e.g., PCV"
              size="10"
            />
          </div>

          <div>
            <label className="text-xs text-gray-700">Unit</label>
            <input
              type="text"
              name="siUnit"
              className="w-full text-xs px-2 py-1 bg-white border border-blue-200 rounded"
              value={sub.siUnit}
              onChange={(e) => onUpdateSub(idx, e)}
              placeholder="%"
              size="5"
            />
          </div>

          <div>
            <label className="text-xs text-gray-700">Price (₦)</label>
            <input
              type="number"
              name="price"
              step="0.01"
              className="w-full text-xs px-2 py-1 bg-white border border-blue-200 rounded"
              value={sub.price}
              onChange={(e) => onUpdateSub(idx, e)}
              placeholder="0.00"
              size="8"
            />
          </div>
        </div>

        {/* Reference Ranges for Sub-Test */}
        <div className="mt-4 pt-4 border-t border-blue-100">
          <ReferenceRangeForm
            ranges={sub.referenceRanges}
            onAdd={() => onAddRange(idx)}
            onChange={(rangeIdx, e) => onUpdateRange(idx, rangeIdx, e)}
            onRemove={(rangeIdx) => onRemoveRange(idx, rangeIdx)}
            compact
          />
        </div>
      </div>
    </div>
  );
};

/* ---------------------------
   Main CreateLabTest Component
   --------------------------- */
const CreateLabTest = () => {
  const [labUnits, setLabUnits] = useState([]);
  const { showMessage } = useMessage();
  const [loading, setLoading] = useState(false);
  const { pid } = useParams();
  const { user } = useAuth();

  const [test, setTest] = useState({
    name: "",
    isComplex: false,
    siUnit: "",
    labUnit: "",
    price: 0,
    isActive: true,
    remark: "",
    requiresRemark: false,
    requiresReferenceRange: true,
  });

  const [subTests, setSubTests] = useState([]);
  const [referenceRanges, setReferenceRanges] = useState([
    { gender: "Any", ageMin: "", ageMax: "", category: "Any", rangeValue: "" },
  ]);

  useEffect(() => {
    axiosInstance
      .get("/labapi/lab-units/")
      .then((res) => setLabUnits(res.data || []))
      .catch((err) => console.error("Error fetching Lab Units!", err));
  }, []);

  /* --- Main test inputs --- */
  const handleTestChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTest((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  /* -----------------------------
     Sub-tests helpers
     ----------------------------- */
  const addSubTest = () =>
    setSubTests((prev) => [
      ...prev,
      { parameterName: "", siUnit: "", price: 0, referenceRanges: [{ gender: "Any", ageMin: "", ageMax: "", category: "Any", rangeValue: "" }] },
    ]);

  const updateSubTest = (index, e) => {
    const { name, value, type } = e.target;
    setSubTests((prev) => prev.map((s, i) => (i === index ? { ...s, [name]: type === "number" ? parseFloat(value) || 0 : value } : s)));
  };

  const removeSubTest = (index) => setSubTests((prev) => prev.filter((_, i) => i !== index));

  const addSubTestRange = (subIndex) =>
    setSubTests((prev) =>
      prev.map((s, i) => (i === subIndex ? { ...s, referenceRanges: [...s.referenceRanges, { gender: "Any", ageMin: "", ageMax: "", category: "Any", rangeValue: "" }] } : s))
    );

  const updateSubTestRange = (subIndex, rangeIndex, e) => {
    const { name, value } = e.target;
    setSubTests((prev) =>
      prev.map((s, i) =>
        i === subIndex ? { ...s, referenceRanges: s.referenceRanges.map((r, j) => (j === rangeIndex ? { ...r, [name]: value } : r)) } : s
      )
    );
  };

  const removeSubTestRange = (subIndex, rangeIndex) =>
    setSubTests((prev) => prev.map((s, i) => (i === subIndex ? { ...s, referenceRanges: s.referenceRanges.filter((_, j) => j !== rangeIndex) } : s)));

  /* --- Top-level reference ranges --- */
  const addReferenceRange = () => setReferenceRanges((prev) => [...prev, { gender: "Any", ageMin: "", ageMax: "", category: "Any", rangeValue: "" }]);

  const updateReferenceRange = (index, e) => {
    const { name, value } = e.target;
    setReferenceRanges((prev) => prev.map((r, i) => (i === index ? { ...r, [name]: value } : r)));
  };

  const removeReferenceRange = (index) => setReferenceRanges((prev) => prev.filter((_, i) => i !== index));

  /* --- Submit --- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedSubTests = subTests.map((sub) => ({
      parameter_name: sub.parameterName,
      si_unit: sub.siUnit,
      price: sub.price,
      reference_ranges: sub.referenceRanges.map((r) => ({
        gender: r.gender,
        age_min: r.ageMin,
        age_max: r.ageMax,
        category: r.category,
        range_value: r.rangeValue,
      })),
    }));

    const formattedReferenceRanges =
      test.isComplex || !test.requiresReferenceRange
        ? []
        : referenceRanges.map((r) => ({
            gender: r.gender,
            age_min: r.ageMin,
            age_max: r.ageMax,
            category: r.category,
            range_value: r.rangeValue,
          }));

    const payload = {
      name: test.name,
      is_complex: test.isComplex,
      si_unit: test.siUnit,
      lab_unit: test.labUnit,
      price: test.price,
      is_active: test.isActive,
      remark: test.remark,
      requires_remark: test.requiresRemark,
      requires_reference_range: test.requiresReferenceRange,
      sub_tests: formattedSubTests,
      reference_ranges: formattedReferenceRanges,
    };

    try {
      setLoading(true);
      await axiosInstance.post(`/labapi/tests/create/`, payload);
      showMessage("Test created successfully!", "success");

      // Reset form
      setTest({
        name: "",
        isComplex: false,
        siUnit: "",
        labUnit: "",
        price: 0,
        isActive: true,
        remark: "",
        requiresRemark: false,
        requiresReferenceRange: true,
      });
      setSubTests([]);
      setReferenceRanges([{ gender: "Any", ageMin: "", ageMax: "", category: "Any", rangeValue: "" }]);
    } catch (err) {
      console.error("Error submitting test data:", err);
      showMessage("Error creating test.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1">
      {/* Ultra Compact Header */}
      <div className="mb-3">
        <div className="flex items-center gap-1">
          <div className="p-1 bg-blue-100 rounded">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-base font-bold text-gray-900">New Lab Test</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Test Details - Compact */}
        <div className="bg-white border border-blue-200 rounded p-2">
          <div className="flex items-center gap-1 mb-2">
            <div className="p-1 bg-blue-100 rounded">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Test Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-1">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-700">Test Name</label>
              <input
                name="name"
                value={test.name}
                onChange={handleTestChange}
                type="text"
                className="w-full text-xs px-2 py-1 bg-white border border-blue-200 rounded"
                required
                placeholder="e.g., FBC"
              />
            </div>

            <div>
              <label className="text-xs text-gray-700">SI Unit</label>
              <input
                name="siUnit"
                value={test.siUnit}
                onChange={handleTestChange}
                type="text"
                className="w-full text-xs px-2 py-1 bg-white border border-blue-200 rounded"
                placeholder="Unit"
              />
            </div>

            <div>
              <label className="text-xs text-gray-700">Lab Unit</label>
              <select
                name="labUnit"
                value={test.labUnit}
                onChange={handleTestChange}
                className="w-full text-xs px-2 py-1 bg-white border border-blue-200 rounded"
                required
              >
                <option value="" className="text-xs">Select</option>
                {labUnits.map((u) => (
                  <option key={u.id} value={u.id} className="text-xs">
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {!test.isComplex && (
              <div>
                <label className="text-xs text-gray-700">Price (₦)</label>
                <input
                  name="price"
                  value={test.price}
                  onChange={handleTestChange}
                  type="number"
                  step="0.01"
                  className="w-full text-xs px-2 py-1 bg-white border border-blue-200 rounded"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
        </div>

        {/* Options - Ultra Compact */}
        <div className="bg-white border border-cyan-200 rounded p-2">
          <div className="flex items-center gap-1 mb-2">
            <div className="p-1 bg-cyan-100 rounded">
              <svg className="w-3 h-3 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Configuration</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {[
              { label: "Complex", name: "isComplex" },
              { label: "Ref Range", name: "requiresReferenceRange" },
              { label: "Remark", name: "requiresRemark" },
              { label: "Active", name: "isActive", default: true },
            ].map((option) => (
              <label key={option.name} className="flex items-center gap-1 cursor-pointer">
                <input
                  name={option.name}
                  checked={test[option.name]}
                  onChange={handleTestChange}
                  type="checkbox"
                  className="w-3 h-3 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-xs text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sub-Tests - Compact */}
        {test.isComplex && (
          <div className="bg-white border border-indigo-200 rounded p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <div className="p-1 bg-indigo-100 rounded">
                  <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Sub-Tests</span>
              </div>
              <button
                type="button"
                onClick={addSubTest}
                className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs rounded"
              >
                + Add
              </button>
            </div>

            {subTests.length === 0 ? (
              <div className="text-center py-2 text-xs text-gray-500 border border-dashed border-indigo-200 rounded">
                No sub-tests
              </div>
            ) : (
              <div className="space-y-1">
                {subTests.map((s, idx) => (
                  <SubTestForm
                    key={idx}
                    sub={s}
                    idx={idx}
                    onUpdateSub={updateSubTest}
                    onRemoveSub={removeSubTest}
                    onAddRange={addSubTestRange}
                    onUpdateRange={updateSubTestRange}
                    onRemoveRange={removeSubTestRange}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reference Ranges - Compact */}
        {!test.isComplex && test.requiresReferenceRange && (
          <div className="bg-white border border-blue-200 rounded p-2">
            <div className="flex items-center gap-1 mb-2">
              <div className="p-1 bg-blue-100 rounded">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">Reference Ranges</span>
            </div>
            <ReferenceRangeForm
              ranges={referenceRanges}
              onAdd={addReferenceRange}
              onChange={updateReferenceRange}
              onRemove={removeReferenceRange}
            />
          </div>
        )}

        {/* Submit Button - Compact */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Create Test
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLabTest;