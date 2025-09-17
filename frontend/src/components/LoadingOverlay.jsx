// src/components/LoadingOverlay.jsx
import React from 'react';
// import './LoadingOverlay.css'; // Optional: for styling

const LoadingOverlay = () => {
  const renderSpinners = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <div className="spin-wrapper" key={index}>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
    ));
  };

  return (
    <div id="loading-wrapper">
      {renderSpinners()}
    </div>
  );
};

export default LoadingOverlay;