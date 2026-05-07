import React, { useEffect } from "react";

const ReferenceRangeInput = ({ testItem, selectedValue, onChange }) => {
  const ranges = testItem.reference_ranges || [];

  useEffect(() => {
    if (ranges.length === 1 && !selectedValue) {
      onChange(testItem.id, ranges[0].id);
    }
  }, [ranges, testItem.id, onChange, selectedValue]);

  if (ranges.length <= 1) {
    const range = ranges[0];
    return (
      <div className="mt-2 p-2 bg-light border rounded small text-muted">
        {range ? `${range.gender} ${range.age_min}-${range.age_max} yrs → ${range.range_value}` : "No reference range available."}
      </div>
    );
  }

  return (
    <select
      className="form-select form-select-sm mt-2"
      value={selectedValue || ""}
      onChange={(e) => onChange(testItem.id, e.target.value)}
      required
    >
      <option value="" disabled>Select a reference range...</option>
      {ranges.map(r => (
        <option key={r.id} value={r.id}>
          {`${r.gender} ${r.age_min}-${r.age_max} yrs → ${r.range_value}`}
        </option>
      ))}
    </select>
  );
};

export default ReferenceRangeInput;