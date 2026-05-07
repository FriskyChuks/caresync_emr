import React, { useState } from 'react';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('visits');
  const [selectedVisit, setSelectedVisit] = useState(0);

  const patientData = {
    name: "Juana Rodriguez",
    gender: "Female",
    age: "24",
    bloodType: "O+",
    consultingDoctor: "Dr. Elina Cruz",
    recentVisit: "28/08/2024",
    upcomingVisit: "08/09/2024",
    avatar: "/assets/images/patient2.png"
  };

  const visits = [
    {
      id: 1,
      doctor: { name: "Dr. Hector Banks", avatar: "/assets/images/doctor1.png" },
      date: "20/05/2024",
      department: "Orthopaedics",
      fee: "$200",
      prescription: "The prescriptions featured in the dataset exhibit illegible handwriting, commonly encountered in medical practices. These images serve as invaluable resources for developing and evaluating algorithms aimed at enhancing handwriting recognition technologies within the medical domain.",
      reports: {
        weight: "48lbs",
        bloodPressure: "120",
        sugarBefore: "90",
        sugarAfter: "180"
      },
      medicines: [
        { name: "Aricep Tablet", duration: "10 Days", morning: 1, afternoon: 0, night: 1 },
        { name: "Cresemba Capsule", duration: "10 Days", morning: 0, afternoon: 1, night: 1 },
        { name: "Justoza Tablet", duration: "10 Days", morning: 1, afternoon: 1, night: 0 }
      ]
    }
  ];

  const healthMetrics = [
    { title: "BP Levels", icon: "💊", data: ["24/04/2024: 140", "16/04/2024: 190", "10/04/2024: 230"], color: "from-blue-500 to-indigo-500" },
    { title: "Sugar Levels", icon: "🩸", data: ["24/04/2024: 140", "16/04/2024: 190", "10/04/2024: 230"], color: "from-emerald-500 to-teal-500" },
    { title: "Heart Rate", icon: "❤️", data: ["24/04/2024: 110", "16/04/2024: 120", "10/04/2024: 100"], color: "from-rose-500 to-pink-500" },
    { title: "Cholesterol", icon: "🧪", data: ["24/04/2024: 180", "16/04/2024: 220", "10/04/2024: 230"], color: "from-amber-500 to-orange-500" }
  ];

  const doctorVisits = [
    { doctor: "Dr. Hector Banks", date: "20/05/2024", department: "Dentist", avatar: "/assets/images/doctor1.png" },
    { doctor: "Dr. Mitchel Alvarez", date: "20/05/2024", department: "Urologist", avatar: "/assets/images/doctor5.png" },
    { doctor: "Dr. Fermin Scott", date: "18/03/2024", department: "Surgeon", avatar: "/assets/images/doctor3.png" }
  ];

  const reports = [
    { id: 1, file: "Reports 1 clinical documentation", date: "May-28, 2024", type: "excel" },
    { id: 2, file: "Reports 2 random files documentation", date: "Mar-20, 2024", type: "excel" },
    { id: 3, file: "Reports 3 glucose level complete report", date: "Feb-18, 2024", type: "excel" }
  ];

  const timeline = [
    { time: "An Hour Ago", doctor: "Dr. Janie Mcdonald", action: "sent a new prescription", medicine: "Amocvmillin" },
    { time: "An Hour Ago", doctor: "Dr. Hector Banks", action: "uploaded a report", medicine: "Lisymorpril" },
    { time: "An Hour Ago", doctor: "Dr. Deena Cooley", action: "sent medicine details", medicine: "Predeymsone" },
    { time: "An Hour Ago", doctor: "Dr. Mitchel Alvarez", action: "added import files", medicine: "Naverreone" },
    { time: "An Hour Ago", doctor: "Dr. Owen Scott", action: "reviewed your file", medicine: "Gabateyntin" }
  ];

  const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
      <div className="flex items-center space-x-3">
        <div className={`p-3 bg-gradient-to-r ${color} rounded-xl`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30' 
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Patient Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive overview and health monitoring for {patientData.name}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <span className="text-sm font-medium text-blue-700">
                  Last Updated: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Profile Card */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-200 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column - Patient Info */}
              <div className="lg:w-3/5">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-lg overflow-hidden">
                      <img
                        src={patientData.avatar}
                        className="w-full h-full object-cover"
                        alt="Patient"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                      Active
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      {patientData.name}
                      <span className="text-lg font-normal text-gray-600 ml-2">
                        PID-00124
                      </span>
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatCard 
                        icon="👤" 
                        label="Gender" 
                        value={patientData.gender}
                        color="from-blue-500 to-indigo-500"
                      />
                      <StatCard 
                        icon="🎂" 
                        label="Age" 
                        value={patientData.age}
                        color="from-emerald-500 to-teal-500"
                      />
                      <StatCard 
                        icon="🩸" 
                        label="Blood Type" 
                        value={patientData.bloodType}
                        color="from-rose-500 to-pink-500"
                      />
                      <StatCard 
                        icon="📅" 
                        label="Upcoming" 
                        value={patientData.upcomingVisit}
                        color="from-amber-500 to-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Doctor Info */}
              <div className="lg:w-2/5">
                <div className="h-full border-l-0 lg:border-l lg:border-blue-200 lg:pl-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                        <span className="text-white text-xl">👨‍⚕️</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Consulting Doctor</h3>
                        <p className="text-xl font-bold text-blue-600">{patientData.consultingDoctor}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-600">📅</span>
                          <div>
                            <p className="text-sm text-gray-600">Recent Visit</p>
                            <p className="font-semibold text-gray-800">{patientData.recentVisit}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600">📅</span>
                          <div>
                            <p className="text-sm text-gray-600">Next Visit</p>
                            <p className="font-semibold text-gray-800">{patientData.upcomingVisit}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 pt-4">
                      <button className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-300">
                        Book Appointment
                      </button>
                      <button className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-300">
                        Upload Report
                      </button>
                      <button className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-300">
                        View History
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <TabButton active={activeTab === 'visits'} onClick={() => setActiveTab('visits')}>
            Visits History
          </TabButton>
          <TabButton active={activeTab === 'metrics'} onClick={() => setActiveTab('metrics')}>
            Health Metrics
          </TabButton>
          <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>
            Reports
          </TabButton>
          <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')}>
            Timeline
          </TabButton>
        </div>

        {/* Main Content Area */}
        {activeTab === 'visits' && (
          <div className="space-y-6">
            {/* Visit Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Recent Visit Details</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-medium rounded-full">
                      Completed
                    </span>
                    <span className="text-sm text-gray-500">#{visits[0].date}</span>
                  </div>
                </div>

                {/* Visit Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                        <img src={visits[0].doctor.avatar} alt="Doctor" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{visits[0].doctor.name}</h4>
                        <p className="text-sm text-gray-600">{visits[0].department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">{visits[0].fee}</div>
                      <p className="text-sm text-gray-600">Fee Paid</p>
                    </div>
                  </div>
                </div>

                {/* Health Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center">
                    <div className="text-blue-600 text-lg mb-1">⚖️</div>
                    <div className="text-lg font-bold text-gray-800">{visits[0].reports.weight}</div>
                    <div className="text-sm text-gray-600">Weight</div>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 text-center">
                    <div className="text-rose-600 text-lg mb-1">💓</div>
                    <div className="text-lg font-bold text-gray-800">{visits[0].reports.bloodPressure}</div>
                    <div className="text-sm text-gray-600">Blood Pressure</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 text-center">
                    <div className="text-emerald-600 text-lg mb-1">🩸</div>
                    <div className="text-lg font-bold text-gray-800">{visits[0].reports.sugarBefore}</div>
                    <div className="text-sm text-gray-600">Sugar Before</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 text-center">
                    <div className="text-amber-600 text-lg mb-1">🩸</div>
                    <div className="text-lg font-bold text-gray-800">{visits[0].reports.sugarAfter}</div>
                    <div className="text-sm text-gray-600">Sugar After</div>
                  </div>
                </div>

                {/* Prescription */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-blue-600 mr-2">📝</span>
                    Prescription
                  </h4>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                    <p className="text-gray-700">{visits[0].prescription}</p>
                  </div>
                </div>

                {/* Medicines */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-emerald-600 mr-2">💊</span>
                    Medicines (For 10 Days)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {visits[0].medicines.map((medicine, index) => (
                      <div key={index} className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-200 p-4">
                        <h5 className="font-semibold text-gray-800 mb-3">{medicine.name}</h5>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Morning</span>
                            <span className="font-semibold text-blue-600">{medicine.morning} pill{medicine.morning !== 1 && 's'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Afternoon</span>
                            <span className="font-semibold text-blue-600">{medicine.afternoon} pill{medicine.afternoon !== 1 && 's'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Night</span>
                            <span className="font-semibold text-blue-600">{medicine.night} pill{medicine.night !== 1 && 's'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300">
                    View Lab Reports
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300">
                    Download Report
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300">
                    Print Prescription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthMetrics.map((metric, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 p-5 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-r ${metric.color} rounded-xl`}>
                    <span className="text-white text-xl">{metric.icon}</span>
                  </div>
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                    Recent Visits
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{metric.title}</h3>
                <div className="space-y-3">
                  {metric.data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item.split(':')[0]}</span>
                      <span className="font-semibold text-gray-800">{item.split(':')[1]}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                      style={{ width: '70%' }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Trend: Stable</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Doctor Visits */}
            <div className="bg-white rounded-2xl border border-blue-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Doctor Visits</h3>
                  <span className="text-sm text-blue-600 font-medium">3 visits</span>
                </div>
                <div className="space-y-4">
                  {doctorVisits.map((visit, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl hover:bg-blue-50 transition-colors duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                          <img src={visit.avatar} alt="Doctor" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{visit.doctor}</p>
                          <p className="text-sm text-gray-600">{visit.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">{visit.date}</p>
                        <button className="mt-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-2xl border border-blue-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Medical Reports</h3>
                  <button className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-300">
                    Upload New
                  </button>
                </div>
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-sm transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                          <span className="text-white">📄</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{report.file}</p>
                          <p className="text-sm text-gray-600">{report.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 text-blue-600 hover:text-blue-700">
                          <span className="text-lg">👁️</span>
                        </button>
                        <button className="p-1.5 text-emerald-600 hover:text-emerald-700">
                          <span className="text-lg">⬇️</span>
                        </button>
                        <button className="p-1.5 text-rose-600 hover:text-rose-700">
                          <span className="text-lg">🗑️</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Health Activity Timeline</h3>
                  <span className="text-sm text-blue-600 font-medium">Live Updates</span>
                </div>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="relative pl-8 pb-6 last:pb-0">
                      <div className="absolute left-0 top-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full border-4 border-white shadow"></div>
                      {index < timeline.length - 1 && (
                        <div className="absolute left-1.5 top-5 w-0.5 h-full bg-gradient-to-b from-blue-200 to-blue-100"></div>
                      )}
                      <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium text-blue-600">{item.doctor}</span> - {item.action}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Medicine: <span className="font-medium text-rose-600">{item.medicine}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                    <span className="text-white text-xl">💊</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Pharmacy</h4>
                    <p className="text-sm text-gray-600">Average Spending</p>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-gray-800 mb-2">$980</div>
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <span className="text-emerald-600 font-medium">+20%</span>
                    <span className="text-gray-600">vs last month</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    You can choose from over 1600 admin dashboard templates on Bootstrap Gallery.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl border border-emerald-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                    <span className="text-white text-xl">🩺</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Insurance Status</h4>
                    <p className="text-sm text-gray-600">Active Coverage</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Coverage</span>
                    <span className="font-medium text-emerald-600">85%</span>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Renewal: <span className="font-medium text-gray-800">Dec 31, 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Patient ID:</span> PID-00124 • 
              <span className="mx-2">|</span>
              <span className="font-medium text-emerald-600">Last Sync:</span> {new Date().toLocaleTimeString()} • 
              <span className="mx-2">|</span>
              <span className="font-medium text-purple-600">Status:</span> Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;