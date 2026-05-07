import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const FluidBalanceChart = ({ fluidData = [], compact = false }) => {
  const [chartType, setChartType] = useState('balance');

  const chartData = useMemo(() => {
    if (!fluidData.length) return [];

    return fluidData
      .filter(record => record.recorded_at)
      .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
      .map(record => ({
        time: new Date(record.recorded_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        datetime: new Date(record.recorded_at).toLocaleString(),
        timestamp: new Date(record.recorded_at).getTime(),
        intake: record.intake_volume || 0,
        output: record.output_volume || 0,
        net_balance: record.net_balance || 0,
        intake_type: record.intake_type,
        output_type: record.output_type,
        cumulative_balance: 0
      }))
      .map((record, index, array) => {
        const previousBalance = index > 0 ? array[index - 1].cumulative_balance : 0;
        record.cumulative_balance = previousBalance + record.net_balance;
        return record;
      });
  }, [fluidData]);

  const totals = useMemo(() => {
    const totalIntake = fluidData.reduce((sum, record) => sum + (record.intake_volume || 0), 0);
    const totalOutput = fluidData.reduce((sum, record) => sum + (record.output_volume || 0), 0);
    const netBalance = totalIntake - totalOutput;
    return { totalIntake, totalOutput, netBalance };
  }, [fluidData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${entry.dataKey === 'intake' ? 'bg-emerald-500' : entry.dataKey === 'output' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                <span className="text-xs text-gray-600">{entry.name}:</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{entry.value} ml</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!fluidData.length) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h4 className="text-gray-700 font-medium mb-1">No Fluid Data</h4>
        <p className="text-gray-500 text-sm">No records available for charting</p>
      </div>
    );
  }

  const chartHeight = compact ? '280px' : '400px';

  return (
    <div className={`${compact ? '' : 'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'}`}>
      {!compact && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Fluid Trends</h4>
                <p className="text-xs text-gray-500">Real-time monitoring</p>
              </div>
            </div>
            
            <select 
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="balance">Net Balance</option>
              <option value="comparison">Intake vs Output</option>
              <option value="intake">Intake Only</option>
              <option value="output">Output Only</option>
            </select>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-2 border border-emerald-100 shadow-sm">
              <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Total Intake</div>
              <div className="text-lg font-bold text-emerald-900">{totals.totalIntake} ml</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-rose-100 shadow-sm">
              <div className="text-[10px] font-semibold text-rose-700 uppercase tracking-wide">Total Output</div>
              <div className="text-lg font-bold text-rose-900">{totals.totalOutput} ml</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-blue-100 shadow-sm">
              <div className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">Net Balance</div>
              <div className={`text-lg font-bold ${totals.netBalance >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                {totals.netBalance} ml
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${compact ? 'p-1' : 'p-4'}`}>
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'balance' && (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  angle={compact ? 0 : -45}
                  textAnchor="end"
                  height={compact ? 30 : 50}
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="net_balance"
                  name="Net Balance"
                  stroke="#3b82f6"
                  fill="url(#balanceGradient)"
                  strokeWidth={2}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            )}

            {chartType === 'comparison' && (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  angle={compact ? 0 : -45}
                  textAnchor="end"
                  height={compact ? 30 : 50}
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="intake" name="Intake" fill="#10b981" radius={[2, 2, 0, 0]} barSize={20} />
                <Bar dataKey="output" name="Output" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={20} />
              </BarChart>
            )}

            {chartType === 'intake' && (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="intakeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  angle={compact ? 0 : -45}
                  textAnchor="end"
                  height={compact ? 30 : 50}
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="intake"
                  name="Fluid Intake"
                  stroke="#10b981"
                  fill="url(#intakeGradient)"
                  strokeWidth={2}
                />
              </LineChart>
            )}

            {chartType === 'output' && (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="outputGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  angle={compact ? 0 : -45}
                  textAnchor="end"
                  height={compact ? 30 : 50}
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="output"
                  name="Fluid Output"
                  stroke="#ef4444"
                  fill="url(#outputGradient)"
                  strokeWidth={2}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Data Summary */}
        {!compact && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-gray-900">Recent Records</h5>
              <span className="text-xs text-gray-500">Last 5 entries</span>
            </div>
            
            <div className="space-y-2">
              {chartData.slice(-5).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-12">{record.time}</div>
                    <div className="flex items-center gap-2">
                      {record.intake > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-xs font-semibold text-emerald-700">{record.intake}ml</span>
                          {record.intake_type && (
                            <span className="text-[10px] text-gray-500">({record.intake_type})</span>
                          )}
                        </div>
                      )}
                      {record.output > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                          <span className="text-xs font-semibold text-rose-700">{record.output}ml</span>
                          {record.output_type && (
                            <span className="text-[10px] text-gray-500">({record.output_type})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${record.net_balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {record.net_balance}ml
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FluidBalanceChart;