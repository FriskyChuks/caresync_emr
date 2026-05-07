import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VitalSignsChart = ({ vitals = [], patient }) => {
  const [selectedMetrics, setSelectedMetrics] = useState(['temp', 'pulse', 'spo2', 'bp_systolic']);

  const isInPatient = patient?.active_visit?.current_location?.ward_id;

  const chartData = useMemo(() => {
    if (!vitals.length) return [];

    return vitals
      .filter(vital => vital.date_recorded)
      .sort((a, b) => new Date(a.date_recorded) - new Date(b.date_recorded))
      .map(vital => {
        const bp = vital.bp ? vital.bp.split('/') : [null, null];
        const bmi = vital.weight && vital.height 
          ? (vital.weight / ((vital.height / 100) ** 2)).toFixed(1)
          : null;

        return {
          datetime: new Date(vital.date_recorded).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(vital.date_recorded).toLocaleDateString("en-GB"),
          timestamp: new Date(vital.date_recorded).getTime(),
          temp: vital.temp,
          pulse: vital.pulse,
          spo2: vital.spo2,
          bp_systolic: bp[0] ? parseInt(bp[0]) : null,
          bp_diastolic: bp[1] ? parseInt(bp[1]) : null,
          weight: vital.weight,
          height: vital.height,
          bmi: bmi,
          bp_display: vital.bp
        };
      });
  }, [vitals]);

  const metricsConfig = {
    temp: { 
      name: 'Temp', 
      unit: '°C', 
      color: '#ef4444',
      gradient: 'from-red-500 to-pink-500',
      domain: [35, 42],
      stroke: '#ef4444'
    },
    pulse: { 
      name: 'Pulse', 
      unit: 'bpm', 
      color: '#10b981',
      gradient: 'from-emerald-500 to-green-500',
      domain: [40, 180],
      stroke: '#10b981'
    },
    spo2: { 
      name: 'SpO₂', 
      unit: '%', 
      color: '#06b6d4',
      gradient: 'from-cyan-500 to-blue-500',
      domain: [85, 100],
      stroke: '#06b6d4'
    },
    bp_systolic: { 
      name: 'BP Sys', 
      unit: 'mmHg', 
      color: '#8b5cf6',
      gradient: 'from-violet-500 to-purple-500',
      domain: [80, 200],
      stroke: '#8b5cf6'
    },
    bp_diastolic: { 
      name: 'BP Dia', 
      unit: 'mmHg', 
      color: '#f59e0b',
      gradient: 'from-amber-500 to-yellow-500',
      domain: [40, 120],
      stroke: '#f59e0b'
    },
    weight: { 
      name: 'Weight', 
      unit: 'kg', 
      color: '#ec4899',
      gradient: 'from-pink-500 to-rose-500',
      domain: [0, 200],
      stroke: '#ec4899'
    },
    bmi: { 
      name: 'BMI', 
      unit: 'kg/m²', 
      color: '#3b82f6',
      gradient: 'from-blue-500 to-indigo-500',
      domain: [15, 40],
      stroke: '#3b82f6'
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
          <div className="text-xs font-medium text-gray-500 mb-2">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between mb-1 last:mb-0">
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-gray-700">{entry.name}</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {entry.value} {metricsConfig[entry.dataKey]?.unit}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!isInPatient) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h4 className="text-yellow-800 font-medium mb-1">In-Patient Charts Only</h4>
        <p className="text-yellow-600 text-sm">Patient must be in a ward to view vital trends</p>
      </div>
    );
  }

  if (!vitals.length) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h4 className="text-gray-900 font-medium mb-2">No Vital Signs Data</h4>
        <p className="text-gray-600 text-sm mb-4">Start monitoring to see trends over time</p>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800">
          Record First Vitals
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Vital Trends</h3>
              <p className="text-xs text-gray-500">{chartData.length} readings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select 
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
                value={selectedMetrics[0]}
                onChange={(e) => setSelectedMetrics([e.target.value])}
              >
                {Object.entries(metricsConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.name}</option>
                ))}
              </select>
              <svg className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Selection */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {Object.entries(metricsConfig).map(([key, config]) => (
            <label key={key} className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="hidden"
                checked={selectedMetrics.includes(key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMetrics(prev => [...prev, key]);
                  } else {
                    setSelectedMetrics(prev => prev.filter(m => m !== key));
                  }
                }}
              />
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedMetrics.includes(key) ? `bg-gradient-to-r ${config.gradient} text-white` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedMetrics.includes(key) ? 'bg-white' : `bg-${config.color.split('-')[1]}-500`}`} />
                  {config.name}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="datetime" 
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {selectedMetrics.map(metric => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  name={metricsConfig[metric]?.name}
                  stroke={metricsConfig[metric]?.stroke}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Latest Readings */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Latest Readings</h4>
            <div className="text-xs text-gray-500">{chartData[chartData.length - 1]?.date}</div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {selectedMetrics.map(metric => {
              const latest = chartData[chartData.length - 1];
              const value = latest?.[metric];
              const config = metricsConfig[metric];
              
              if (!value) return null;

              return (
                <div key={metric} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">{config.name}</div>
                      <div className="text-lg font-bold text-gray-900">
                        {value} <span className="text-xs text-gray-500">{config.unit}</span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${config.gradient} bg-opacity-10 flex items-center justify-center`}>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.gradient}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalSignsChart;