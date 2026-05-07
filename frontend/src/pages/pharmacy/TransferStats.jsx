import React from 'react';

const TransferStats = ({ transfers }) => {
  const stats = {
    requested: transfers.filter(t => t.status === 'requested').length,
    honored: transfers.filter(t => t.status === 'honored').length,
    partially_honored: transfers.filter(t => t.status === 'partially_honored').length,
    declined: transfers.filter(t => t.status === 'declined').length,
  };

  const total = transfers.length;
  const getPercent = (count) => total > 0 ? ((count / total) * 100).toFixed(0) : 0;

  const statConfig = [
    { key: 'requested', label: 'REQ', icon: '⏳', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500', count: stats.requested },
    { key: 'honored', label: 'HON', icon: '✅', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500', count: stats.honored },
    { key: 'partially_honored', label: 'PAR', icon: '⚡', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500', count: stats.partially_honored },
    { key: 'declined', label: 'DEC', icon: '❌', color: 'red', bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500', count: stats.declined },
  ];

  return (
    <div className="grid grid-cols-4 gap-1">
      {statConfig.map(stat => (
        <div key={stat.key} className={`${stat.bg} rounded-md p-1 shadow-sm`}>
          <div className="flex justify-between items-center">
            <span className="text-[10px]">{stat.icon}</span>
            <span className="text-[7px] font-bold text-white bg-gray-500 px-1 rounded-full">
              {getPercent(stat.count)}%
            </span>
          </div>
          <div className="text-sm font-bold text-gray-800 leading-tight">{stat.count}</div>
          <div className={`text-[7px] font-bold ${stat.text} uppercase tracking-tighter leading-tight`}>{stat.label}</div>
          <div className="mt-0.5">
            <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${stat.bar} rounded-full`} style={{ width: `${getPercent(stat.count)}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransferStats;