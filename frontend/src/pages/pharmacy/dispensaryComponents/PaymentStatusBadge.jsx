// dispensaryComponents/PaymentStatusBadge.jsx
import React from 'react';

const PaymentStatusBadge = ({ status, size = 'normal' }) => {
  const config = {
    pending: { 
      label: 'Pending', 
      icon: '⏳', 
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      dot: 'bg-gray-400'
    },
    in_progress: { 
      label: 'In Progress', 
      icon: '🔄', 
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      dot: 'bg-blue-500'
    },
    billed: { 
      label: 'Billed', 
      icon: '💰', 
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      dot: 'bg-amber-500'
    },
    partly_paid: { 
      label: 'Partly Paid', 
      icon: '💳', 
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      dot: 'bg-yellow-500'
    },
    paid: { 
      label: 'Paid', 
      icon: '✅', 
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500'
    },
    dispensed: { 
      label: 'Dispensed', 
      icon: '🎁', 
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      dot: 'bg-purple-500'
    },
    cancelled: { 
      label: 'Cancelled', 
      icon: '❌', 
      color: 'bg-red-100 text-red-700 border-red-200',
      dot: 'bg-red-500'
    }
  };

  const c = config[status] || config.pending;
  
  const sizeClasses = size === 'small' 
    ? 'px-1.5 py-0.5 text-[9px]'
    : 'px-2 py-0.5 text-[10px]';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${sizeClasses} font-medium ${c.color}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></div>
      <span>{c.icon}</span>
      <span className="hidden sm:inline">{c.label}</span>
    </span>
  );
};

export default PaymentStatusBadge;