import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";

const PatientBilling = ({ patient_id }) => {
  const [search, setSearch] = useState("");
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: ""
  });

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axiosInstance.get(`/billsapi/patient_bill_records/${patient_id}/`);
        setBills(res.data);
      } catch (err) {
        console.error("Error fetching bills:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [patient_id]);

  useEffect(() => {
    let filtered = bills;

    if (activeTab === "paid") {
      filtered = filtered.filter(bill => bill.status === "paid");
    } else if (activeTab === "pending") {
      filtered = filtered.filter(bill => bill.status !== "paid");
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(bill =>
        bill.description?.toLowerCase().includes(searchLower) ||
        bill.id?.toString().includes(search) ||
        bill.amount?.toString().includes(search)
      );
    }

    const now = new Date();
    if (dateFilter !== "all") {
      filtered = filtered.filter(bill => {
        const billDate = new Date(bill.date_created);
        
        switch (dateFilter) {
          case "today":
            return billDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return billDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return billDate >= monthAgo;
          case "custom":
            if (customDateRange.start && customDateRange.end) {
              const startDate = new Date(customDateRange.start);
              const endDate = new Date(customDateRange.end);
              endDate.setHours(23, 59, 59, 999);
              return billDate >= startDate && billDate <= endDate;
            }
            return true;
          default:
            return true;
        }
      });
    }

    setFilteredBills(filtered);
  }, [bills, search, activeTab, dateFilter, customDateRange]);

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSourceBadge = (sourceModel) => {
    switch (sourceModel) {
      case 'testrequestdetail':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">LAB</span>;
      case 'servicerequestdetail':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">Medical Services</span>;
      case 'requestdetail':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded">Radiology</span>;
      case 'dispensarydetail':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-200 text-indigo-800 rounded">Pharmacy</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">{sourceModel}</span>;
    }
  };

  const getTotalAmount = () => {
    return filteredBills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
  };

  const resetDateFilter = () => {
    setDateFilter("all");
    setCustomDateRange({ start: "", end: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Billing Records</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search bills..."
              className="w-full sm:w-48 pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filter Tabs and Date Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            <button
              className={`px-3 py-1.5 text-sm rounded-lg ${activeTab === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              onClick={() => setActiveTab("all")}
            >
              All Bills
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-lg ${activeTab === "paid" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              onClick={() => setActiveTab("paid")}
            >
              Paid
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-lg ${activeTab === "pending" ? "bg-yellow-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>

            {dateFilter === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({
                    ...prev,
                    start: e.target.value
                  }))}
                />
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({
                    ...prev,
                    end: e.target.value
                  }))}
                />
                <button
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={resetDateFilter}
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500">Total Bills</div>
            <div className="text-lg font-semibold text-gray-900">{filteredBills.length}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500">Total Amount</div>
            <div className="text-lg font-semibold text-gray-900">₦{getTotalAmount().toLocaleString()}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500">Paid</div>
            <div className="text-lg font-semibold text-gray-900">
              {bills.filter(b => b.status === "paid").length}
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500">Pending</div>
            <div className="text-lg font-semibold text-gray-900">
              {bills.filter(b => b.status !== "paid").length}
            </div>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Amount (₦)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBills.map((bill, idx) => (
              <tr key={`${bill.id}-${idx}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#{bill.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div>{new Date(bill.date_created).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(bill.date_created).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-right">
                  {parseFloat(bill.amount || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="truncate max-w-[200px]" title={bill.description}>
                    {bill.description}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getSourceBadge(bill.source_model)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bill.status)}`}>
                    {bill.status?.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBills.length === 0 && (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500 mb-3">No bills found matching your criteria.</p>
          {(search || activeTab !== "all" || dateFilter !== "all") && (
            <button
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => {
                setSearch("");
                setActiveTab("all");
                resetDateFilter();
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientBilling;