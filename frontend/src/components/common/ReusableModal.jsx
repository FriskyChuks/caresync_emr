import React, { useEffect } from "react";
import { X } from "lucide-react";

const ReusableModal = ({ 
  show, 
  onClose, 
  title, 
  children, 
  size = "md",
  closeOnBackdrop = true,
  showFooter = true,
  footerContent,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false
}) => {
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };
    
    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!show) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  // Calculate max height based on screen size
  const getMaxHeight = () => {
    if (typeof window !== 'undefined') {
      // For larger screens, use 85vh, for mobile use 90vh
      return window.innerWidth < 768 ? '85vh' : '85vh';
    }
    return '85vh';
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
        
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-slide-up`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: getMaxHeight() }}
          >
            {/* Header - Sticky */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {title}
                </h3>
              </div>
              
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Close"
                disabled={isLoading}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Body - Increased max-height and better scrolling */}
            <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 130px)' }}>
              {children}
            </div>

            {/* Footer - Sticky at bottom */}
            {showFooter && (
              <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                {footerContent ? (
                  footerContent
                ) : (
                  <div className="flex justify-end space-x-3">
                    {/* You can uncomment these if needed */}
                    {/* <button
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {cancelText}
                    </button> */}
                    {/* <button
                      onClick={onConfirm}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        confirmText
                      )}
                    </button> */}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add animation styles if not already present */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default ReusableModal;