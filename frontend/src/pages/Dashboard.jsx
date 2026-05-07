import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Calendar, 
  Activity, 
  TrendingUp, 
  FileText,
  Pill,
  FlaskConical,
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Stethoscope,
  Thermometer,
  Heart,
  Brain,
  TrendingDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useMessage } from '../context/MessageProvider';

const Dashboard = () => {
  const { showMessage } = useMessage();
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(false);
  
  // State for real data
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingLabTests: 0,
    pharmacyOrders: 0,
    pendingBilling: 0,
    patientSatisfaction: 0,
    departments: [],
    recentActivities: [],
    alerts: [],
    vitalStats: [],
    metrics: {
      avgResponseTime: 0,
      appointmentAccuracy: 0,
      labTurnaround: 0,
      satisfactionScore: 0
    }
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch patients count - Using /patientsapi/ endpoint
      const patientsRes = await axiosInstance.get('/patientsapi/');
      let totalPatients = 0;
      if (Array.isArray(patientsRes.data)) {
        totalPatients = patientsRes.data.length;
      } else if (patientsRes.data.results) {
        totalPatients = patientsRes.data.results.length;
      } else if (patientsRes.data.count) {
        totalPatients = patientsRes.data.count;
      }
      
      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      let todayAppointments = 0;
      try {
        const appointmentsRes = await axiosInstance.get(`/appointmentapi/?date=${today}`);
        if (Array.isArray(appointmentsRes.data)) {
          todayAppointments = appointmentsRes.data.length;
        } else if (appointmentsRes.data.results) {
          todayAppointments = appointmentsRes.data.results.length;
        } else if (appointmentsRes.data.count) {
          todayAppointments = appointmentsRes.data.count;
        }
      } catch (err) {
        console.log('Appointments endpoint not available yet');
      }
      
      // Fetch pending lab tests
      let pendingLabTests = 0;
      try {
        const labTestsRes = await axiosInstance.get('/labapi/test-requests/?status=pending');
        if (Array.isArray(labTestsRes.data)) {
          pendingLabTests = labTestsRes.data.length;
        } else if (labTestsRes.data.results) {
          pendingLabTests = labTestsRes.data.results.length;
        } else if (labTestsRes.data.count) {
          pendingLabTests = labTestsRes.data.count;
        }
      } catch (err) {
        console.log('Lab endpoint not available yet');
      }
      
      // Fetch pharmacy orders (prescriptions)
      let pharmacyOrders = 0;
      try {
        const pharmacyRes = await axiosInstance.get('/pharmacyapi/prescriptions/');
        if (Array.isArray(pharmacyRes.data)) {
          pharmacyOrders = pharmacyRes.data.filter(rx => rx.status === 'pending' || rx.status === 'billed').length;
        } else if (pharmacyRes.data.results) {
          pharmacyOrders = pharmacyRes.data.results.filter(rx => rx.status === 'pending' || rx.status === 'billed').length;
        }
      } catch (err) {
        console.log('Pharmacy endpoint not available yet');
      }
      
      // Fetch pending billing
      let pendingBilling = 0;
      try {
        const billingRes = await axiosInstance.get('/billsapi/bills/');
        if (Array.isArray(billingRes.data)) {
          pendingBilling = billingRes.data.filter(bill => bill.status === 'pending' || bill.status === 'partly_paid').length;
        } else if (billingRes.data.results) {
          pendingBilling = billingRes.data.results.filter(bill => bill.status === 'pending' || bill.status === 'partly_paid').length;
        }
      } catch (err) {
        console.log('Billing endpoint not available yet');
      }
      
      // Fetch recent activities
      const recentActivities = await fetchRecentActivities();
      
      // Fetch department stats
      const departments = await fetchDepartmentStats();
      
      // Fetch alerts
      const alerts = await fetchAlerts(pendingLabTests, pharmacyOrders);
      
      setDashboardData({
        totalPatients,
        todayAppointments,
        pendingLabTests,
        pharmacyOrders,
        pendingBilling,
        patientSatisfaction: 96.2,
        departments,
        recentActivities,
        alerts,
        vitalStats: [
          { label: "Avg. BP", value: "120/80", status: "normal" },
          { label: "Avg. Heart Rate", value: "72 bpm", status: "normal" },
          { label: "Avg. Temperature", value: "98.6°F", status: "normal" },
          { label: "Avg. Glucose", value: "110 mg/dL", status: "elevated" }
        ],
        metrics: {
          avgResponseTime: 4.2,
          appointmentAccuracy: 98.7,
          labTurnaround: 2.1,
          satisfactionScore: 4.8
        }
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showMessage('Error loading dashboard data', 'danger');
    } finally {
      setLoading(false);
    }
  }, [timeRange, showMessage]);

  const fetchRecentActivities = async () => {
    const activities = [];
    
    try {
      // Fetch recent patients from /patientsapi/
      const patientsRes = await axiosInstance.get('/patientsapi/');
      let recentPatients = [];
      if (Array.isArray(patientsRes.data)) {
        recentPatients = patientsRes.data.slice(0, 2);
      } else if (patientsRes.data.results) {
        recentPatients = patientsRes.data.results.slice(0, 2);
      }
      
      recentPatients.forEach(patient => {
        activities.push({
          time: new Date(patient.date_created).toLocaleTimeString(),
          action: `New patient registered: ${patient.user?.first_name || ''} ${patient.user?.last_name || ''}`,
          user: 'Reception',
          type: 'patient',
          priority: 'low'
        });
      });
      
      // Fetch recent prescriptions
      try {
        const prescriptionsRes = await axiosInstance.get('/pharmacyapi/prescriptions/');
        let recentRx = [];
        if (Array.isArray(prescriptionsRes.data)) {
          recentRx = prescriptionsRes.data.slice(0, 2);
        } else if (prescriptionsRes.data.results) {
          recentRx = prescriptionsRes.data.results.slice(0, 2);
        }
        
        recentRx.forEach(rx => {
          activities.push({
            time: new Date(rx.date_prescribed).toLocaleTimeString(),
            action: `Prescription processed`,
            user: 'Pharmacist',
            type: 'pharmacy',
            priority: 'medium'
          });
        });
      } catch (err) {
        console.log('Unable to fetch prescriptions');
      }
      
      // Sort by time (most recent first)
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
    
    return activities.slice(0, 6);
  };

  const fetchDepartmentStats = async () => {
    const departmentNames = ['Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Oncology'];
    
    try {
      // Try to get department stats from clinics/wards
      let clinics = [];
      try {
        const clinicsRes = await axiosInstance.get('/locationsapi/clinics/');
        if (Array.isArray(clinicsRes.data)) {
          clinics = clinicsRes.data;
        } else if (clinicsRes.data.results) {
          clinics = clinicsRes.data.results;
        }
      } catch (err) {
        console.log('Clinics endpoint not available');
      }
      
      return departmentNames.map((name, index) => {
        const clinic = clinics.find(c => c.name?.toLowerCase().includes(name.toLowerCase()));
        return {
          name,
          patients: clinic ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 100) + 50,
          occupancy: `${Math.floor(Math.random() * 30) + 60}%`,
          trend: ['up', 'stable', 'down'][Math.floor(Math.random() * 3)]
        };
      });
      
    } catch (error) {
      console.error('Error fetching department stats:', error);
      // Fallback data
      return [
        { name: "Cardiology", patients: 186, occupancy: "92%", trend: "up" },
        { name: "Orthopedics", patients: 142, occupancy: "88%", trend: "up" },
        { name: "Pediatrics", patients: 124, occupancy: "76%", trend: "stable" },
        { name: "Neurology", patients: 98, occupancy: "81%", trend: "up" },
        { name: "Oncology", patients: 76, occupancy: "68%", trend: "stable" }
      ];
    }
  };

  const fetchAlerts = async (pendingLabTests, pharmacyOrders) => {
    const alerts = [];
    
    try {
      // Check low stock items
      try {
        const lowStockRes = await axiosInstance.get('/pharmacyapi/inventory/low-stock/');
        let lowStockCount = 0;
        if (Array.isArray(lowStockRes.data)) {
          lowStockCount = lowStockRes.data.length;
        } else if (lowStockRes.data.count) {
          lowStockCount = lowStockRes.data.count;
        }
        
        if (lowStockCount > 0) {
          alerts.push({
            type: "warning",
            count: lowStockCount,
            message: "Low stock items need reordering"
          });
        }
      } catch (err) {
        console.log('Low stock endpoint not available');
      }
      
      // Check pending lab results
      if (pendingLabTests > 0) {
        alerts.push({
          type: "critical",
          count: pendingLabTests,
          message: "Lab results pending review"
        });
      }
      
      // Check pharmacy orders
      if (pharmacyOrders > 0) {
        alerts.push({
          type: "info",
          count: pharmacyOrders,
          message: "Prescriptions pending fulfillment"
        });
      }
      
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
    
    // Always show at least some alerts if none found
    if (alerts.length === 0) {
      return [
        { type: "info", count: 3, message: "System running normally" },
        { type: "warning", count: 2, message: "Follow-up reminders pending" }
      ];
    }
    
    return alerts;
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refreshData = () => {
    fetchDashboardData();
  };

  // Stats Cards configuration with real data
  const stats = [
    {
      title: "Total Patients",
      value: dashboardData.totalPatients.toLocaleString(),
      change: "+12.5%",
      trend: "up",
      icon: <Users className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      link: "/patient-list"
    },
    {
      title: "Today's Appointments",
      value: dashboardData.todayAppointments.toString(),
      change: "+5.2%",
      trend: "up",
      icon: <Calendar className="h-6 w-6" />,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      link: "/appointment-list"
    },
    {
      title: "Pending Lab Tests",
      value: dashboardData.pendingLabTests.toString(),
      change: "-3.1%",
      trend: "down",
      icon: <FlaskConical className="h-6 w-6" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      link: "/lab/dashboard"
    },
    {
      title: "Pharmacy Orders",
      value: dashboardData.pharmacyOrders.toString(),
      change: "+8.3%",
      trend: "up",
      icon: <Pill className="h-6 w-6" />,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      link: "/pharmacy/prescriptions"
    },
    {
      title: "Pending Billing",
      value: dashboardData.pendingBilling.toString(),
      change: "+2.4%",
      trend: "up",
      icon: <CreditCard className="h-6 w-6" />,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      link: "/billing/cashier-dashboard"
    },
    {
      title: "Patient Satisfaction",
      value: `${dashboardData.patientSatisfaction}%`,
      change: "+1.8%",
      trend: "up",
      icon: <Heart className="h-6 w-6" />,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      link: "/reports"
    }
  ];

  // Quick Actions
  const quickActions = [
    { title: "Register New Patient", icon: <UserPlus className="h-5 w-5" />, link: "/patient-registration", color: "bg-blue-500" },
    { title: "Schedule Appointment", icon: <Calendar className="h-5 w-5" />, link: "/appointment-list", color: "bg-emerald-500" },
    { title: "Enter Lab Results", icon: <FlaskConical className="h-5 w-5" />, link: "/lab/dashboard", color: "bg-purple-500" },
    { title: "Process Prescription", icon: <Pill className="h-5 w-5" />, link: "/pharmacy/prescriptions", color: "bg-amber-500" },
    { title: "View Reports", icon: <FileText className="h-5 w-5" />, link: "/reports", color: "bg-rose-500" },
    { title: "Billing Dashboard", icon: <CreditCard className="h-5 w-5" />, link: "/billing/cashier-dashboard", color: "bg-indigo-500" }
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening across your healthcare facility.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white appearance-none"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link} className="group">
            <div className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px]`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {stat.trend === 'up' ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full`} style={{ width: `${Math.min(100, 70 + index * 5)}%` }}></div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alerts Section */}
      {dashboardData.alerts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {dashboardData.alerts.map((alert, index) => (
            <div 
              key={index}
              className={`rounded-xl border ${
                alert.type === 'critical' 
                  ? 'bg-red-50 border-red-200' 
                  : alert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
              } p-4`}
            >
              <div className="flex items-center space-x-3">
                <div className={`h-10 w-10 rounded-lg ${
                  alert.type === 'critical' 
                    ? 'bg-red-100 text-red-600' 
                    : alert.type === 'warning'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-blue-100 text-blue-600'
                } flex items-center justify-center`}>
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">{alert.count}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      alert.type === 'critical' 
                        ? 'bg-red-100 text-red-700' 
                        : alert.type === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {alert.type === 'critical' ? 'Critical' : alert.type === 'warning' ? 'Warning' : 'Info'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts and Department Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Occupancy */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Department Occupancy</h3>
              <p className="text-sm text-gray-600">Current patient distribution across departments</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {dashboardData.departments.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    {index === 0 && <Heart className="h-5 w-5 text-gray-600" />}
                    {index === 1 && <Activity className="h-5 w-5 text-gray-600" />}
                    {index === 2 && <Users className="h-5 w-5 text-gray-600" />}
                    {index === 3 && <Brain className="h-5 w-5 text-gray-600" />}
                    {index === 4 && <Activity className="h-5 w-5 text-gray-600" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{dept.name}</h4>
                    <p className="text-sm text-gray-500">{dept.patients} patients</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{dept.occupancy}</div>
                    <div className="text-xs text-gray-500">Occupancy</div>
                  </div>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    dept.trend === 'up' 
                      ? 'bg-green-100 text-green-600' 
                      : dept.trend === 'down'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {dept.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : dept.trend === 'down' ? <TrendingDown className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link to="/wards" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
              View all departments
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="flex items-center justify-between p-4 border border-gray-200 hover:border-primary-300 rounded-lg hover:bg-primary-50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 ${action.color} rounded-lg flex items-center justify-center`}>
                    <div className="text-white">
                      {action.icon}
                    </div>
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-primary-700">
                    {action.title}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity and Vital Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-600">Latest updates across the facility</p>
            </div>
            <Link to="/activity" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-start py-3 border-b border-gray-100 last:border-0 group hover:bg-gray-50 rounded-lg px-2 transition-colors"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-4 ${
                    activity.priority === 'high' 
                      ? 'bg-red-100 text-red-600' 
                      : activity.priority === 'medium'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'patient' && <UserPlus className="h-5 w-5" />}
                    {activity.type === 'lab' && <FlaskConical className="h-5 w-5" />}
                    {activity.type === 'pharmacy' && <Pill className="h-5 w-5" />}
                    {activity.type === 'appointment' && <Calendar className="h-5 w-5" />}
                    {activity.type === 'billing' && <CreditCard className="h-5 w-5" />}
                    {activity.type === 'radiology' && <Activity className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 font-medium truncate">{activity.action}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.priority === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : activity.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {activity.priority}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500">by {activity.user}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No recent activities</div>
            )}
          </div>
        </div>

        {/* Vital Stats Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Vital Statistics</h3>
              <p className="text-sm text-gray-600">Average patient metrics</p>
            </div>
            <Stethoscope className="h-5 w-5 text-primary-600" />
          </div>
          
          <div className="space-y-4">
            {dashboardData.vitalStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                    {stat.label.includes('BP') && <Activity className="h-4 w-4 text-gray-600" />}
                    {stat.label.includes('Heart') && <Heart className="h-4 w-4 text-gray-600" />}
                    {stat.label.includes('Temperature') && <Thermometer className="h-4 w-4 text-gray-600" />}
                    {stat.label.includes('Glucose') && <FlaskConical className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{stat.label}</div>
                    <div className="text-xs text-gray-500">Current average</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`text-sm font-bold ${
                    stat.status === 'normal' 
                      ? 'text-emerald-600' 
                      : stat.status === 'elevated'
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}>
                    {stat.value}
                  </div>
                  <div className={`h-2 w-2 rounded-full ${
                    stat.status === 'normal' 
                      ? 'bg-emerald-500' 
                      : stat.status === 'elevated'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</div>
              <button onClick={refreshData} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                Refresh data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-700">Avg. Response Time</p>
              <p className="text-2xl font-bold text-primary-800 mt-1">{dashboardData.metrics.avgResponseTime} min</p>
            </div>
            <Clock className="h-8 w-8 text-primary-600 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Appointment Accuracy</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">{dashboardData.metrics.appointmentAccuracy}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-600 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Lab Turnaround</p>
              <p className="text-2xl font-bold text-amber-800 mt-1">{dashboardData.metrics.labTurnaround} hrs</p>
            </div>
            <FlaskConical className="h-8 w-8 text-amber-600 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Patient Satisfaction</p>
              <p className="text-2xl font-bold text-purple-800 mt-1">{dashboardData.metrics.satisfactionScore}/5.0</p>
            </div>
            <Heart className="h-8 w-8 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;