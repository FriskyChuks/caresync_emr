// PriceFormat.jsx
import React from "react";

const PriceFormat = ({ amount, showDecimals = true }) => {
  if (amount == null || isNaN(amount)) return (
    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
      0
    </span>
  );

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  const formattedAmount = formatter.format(amount);
  
  return (
    <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium">
      <span className="mr-1"></span>
      {formattedAmount.replace("NGN", "").trim()}
    </span>
  );
};

export default PriceFormat;