// src/lab/components/useLabResults.jsx
import { useState, useEffect, useCallback } from "react";
import { useMessage } from "../../../context/MessageProvider";
import useAuth from "../../../hooks/useAuth";
import axiosInstance from "../../../api/axiosInstance";

/**
 * useLabResults(request_id)
 * - fetches TestRequest and existing LabResults
 * - builds formState keyed by detail.id
 * - exposes helpers to update local state
 * - exposes buildBulkPayload() and submitBulk()
 * - supports MLS comments via existing detail endpoint
 */
const useLabResults = (request_id) => {
  const { showMessage } = useMessage();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [formState, setFormState] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingComment, setSavingComment] = useState(null);

  const fetchRequest = useCallback(async () => {
    if (!request_id) return;
    setLoading(true);
    try {
      const [reqRes, resRes] = await Promise.all([
        axiosInstance.get(`/labapi/test-requests/${request_id}/`),
        axiosInstance.get(`/labapi/lab-results/?test_request=${request_id}`),
      ]);

      const reqData = reqRes.data;
      const lrList = Array.isArray(resRes.data) ? resRes.data : [];

      // map latest lab result by detail id
      const existingResults = {};
      lrList.forEach((lr) => {
        const detailId = lr.detail ?? lr.test_detail ?? null;
        if (!detailId) return;
        const prev = existingResults[detailId];
        if (!prev || lr.id > prev.id) existingResults[detailId] = lr;
      });

      // build formState and comments
      const initial = {};
      const initialComments = {};
      
      (reqData.details || []).forEach((detail) => {
        const lr = existingResults[detail.id] || null;

        // sub-results from server (if any) keyed by sub_test id
        const sub_results = {};
        if (lr?.sub_test_results && Array.isArray(lr.sub_test_results)) {
          lr.sub_test_results.forEach((sr) => {
            sub_results[sr.sub_test] = {
              value: sr.result_value ?? "",
              critical: !!sr.is_critical,
              retest: !!sr.needs_retest,
              reference_range: sr.reference_range ?? "",
              existing: true, // marks server-saved value
            };
          });
        }

        initial[detail.id] = {
          value: lr?.result_value ?? "",
          notes: lr?.remark ?? "",
          critical: !!lr?.is_critical,
          retest: !!lr?.needs_retest,
          reference_range: lr?.reference_range ?? "",
          lab_result_id: lr?.id ?? null,
          lab_result_exists: !!lr?.id,
          lab_result_has_value: !!(lr?.result_value && String(lr.result_value).trim() !== ""),
          sub_results,
        };
        
        // Load existing MLS comment
        if (detail.mls_comment) {
          initialComments[detail.id] = detail.mls_comment;
        }
      });

      setRequest(reqData);
      setFormState(initial);
      setComments(initialComments);
    } catch (err) {
      console.error("fetchRequest error:", err);
      showMessage("Failed to load request or results.", "danger");
    } finally {
      setLoading(false);
    }
  }, [request_id, showMessage]);

  /* --------------- form updaters --------------- */
  const handleResultChange = useCallback((detailId, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [detailId]: {
        ...(prev[detailId] || {}),
        [field]: value,
      },
    }));
  }, []);

  const handleSubValueChange = useCallback((detailId, subId, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [detailId]: {
        ...(prev[detailId] || {}),
        sub_results: {
          ...((prev[detailId] && prev[detailId].sub_results) || {}),
          [subId]: {
            ...((prev[detailId] && prev[detailId].sub_results && prev[detailId].sub_results[subId]) || {}),
            [field]: value,
          },
        },
      },
    }));
  }, []);

  const handleSubFlagChange = handleSubValueChange;

  /* --------------- MLS Comment Handlers --------------- */
  const handleCommentChange = useCallback((detailId, comment) => {
    setComments(prev => ({
      ...prev,
      [detailId]: comment
    }));
  }, []);
  
  const saveComment = useCallback(async (detailId) => {
    const comment = comments[detailId] || "";
    setSavingComment(detailId);
    
    try {
      // Use existing test-request-details endpoint to update mls_comment
      const response = await axiosInstance.patch(`/labapi/test-request-details/${detailId}/`, {
        mls_comment: comment
      });
      
      showMessage("Comment saved successfully", "success");
      
      // Update local request data with the response
      if (response.data) {
        setRequest(prev => {
          if (!prev) return prev;
          const updatedDetails = prev.details.map(d => 
            d.id === detailId ? { ...d, mls_comment: response.data.mls_comment } : d
          );
          return { ...prev, details: updatedDetails };
        });
        
        // Update comments state to confirm save
        setComments(prev => ({
          ...prev,
          [detailId]: response.data.mls_comment
        }));
      }
      
    } catch (err) {
      console.error("Error saving comment:", err);
      const errorMsg = err?.response?.data?.error || 
                      err?.response?.data?.message || 
                      err?.message || 
                      "Failed to save comment";
      showMessage(errorMsg, "danger");
    } finally {
      setSavingComment(null);
    }
  }, [comments, showMessage]);

  /* --------------- canEdit - respects payment status --------------- */
  const canEdit = useCallback(
    (detail) => {
      if (!request) return false;
      if (user?.is_staff || user?.is_superuser) return true;
      if (detail.status === "completed") return false;
      // Results can only be entered if status is 'paid' or 'in_progress'
      return detail.status === "paid" || detail.status === "in_progress";
    },
    [request, user]
  );

  /* --------------- build bulk payload --------------- */
  const buildBulkPayload = useCallback(() => {
    if (!request) return null;
    const results = [];

    for (const detail of request.details || []) {
      // Skip if not editable (payment pending or completed)
      if (!canEdit(detail)) continue;
      
      const d = formState[detail.id] || {};
      const hasMain =
        d.value !== undefined &&
        d.value !== null &&
        String(d.value).trim() !== "";

      // collect sub-tests that have values
      const subEntries = [];
      for (const st of detail.sub_tests || []) {
        const sr = (d.sub_results && d.sub_results[st.id]) || {};
        const v = sr.value;
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          subEntries.push({
            sub_test: st.id,
            result_value: String(v),
            is_critical: !!sr.critical,
            needs_retest: !!sr.retest,
            reference_range: sr.reference_range || "",
          });
        }
      }

      // skip details that have nothing to save
      if (!hasMain && subEntries.length === 0) continue;

      results.push({
        test: detail.test.id,
        test_detail: detail.id,
        result_value: hasMain ? String(d.value) : "",
        remark: d.notes || "",
        is_critical: !!d.critical,
        needs_retest: !!d.retest,
        reference_range: d.reference_range || "",
        sub_tests: subEntries,
      });
    }

    return {
      test_request: request.id,
      validated_by: user?.id ?? null,
      results,
    };
  }, [formState, request, user, canEdit]);

  /* --------------- submit bulk results --------------- */
  const submitBulk = useCallback(async () => {
    const payload = buildBulkPayload();
    if (!payload) {
      showMessage("No request loaded.", "warning");
      return null;
    }
    if (!Array.isArray(payload.results) || payload.results.length === 0) {
      showMessage("No results to save.", "warning");
      return null;
    }

    setSaving(true);
    try {
      const res = await axiosInstance.post("/labapi/lab-results/bulk-submit/", payload);
      
      if (res.data.payment_blocked?.length > 0) {
        showMessage(`Warning: ${res.data.payment_blocked.length} test(s) skipped due to pending payment`, "warning");
      } else {
        showMessage("Results saved successfully.", "success");
      }
      
      // refresh server state
      await fetchRequest();
      return res.data;
    } catch (err) {
      console.error("submitBulk error:", err);
      const data = err?.response?.data ?? err?.message ?? "Failed to save results";
      showMessage(typeof data === "string" ? data : JSON.stringify(data), "danger");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [buildBulkPayload, fetchRequest, showMessage]);

  /* --------------- initial fetch --------------- */
  useEffect(() => {
    if (request_id) {
      fetchRequest();
    }
  }, [request_id, fetchRequest]);

  const hasAnyExisting = Object.values(formState || {}).some((d) => !!d?.lab_result_exists);

  return {
    request,
    formState,
    comments,
    loading,
    saving,
    savingComment,
    hasAnyExisting,
    fetchRequest,
    handleResultChange,
    handleSubValueChange,
    handleSubFlagChange,
    handleCommentChange,
    saveComment,
    buildBulkPayload,
    submitBulk,
    canEdit,
  };
};

export default useLabResults;