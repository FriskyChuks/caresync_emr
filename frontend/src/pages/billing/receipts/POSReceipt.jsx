// src/pages/billing/receipts/POSReceipt.jsx
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

const POSReceipt = ({ payment, patient, bills, onClose, onPrint }) => {
  const receiptRef = useRef(null);

//   console.log('patient', patient);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString();
  };

  const handlePrint = async () => {
    if (receiptRef.current) {
      try {
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `receipt_${payment.receipt_no || payment.id}.png`;
        link.href = image;
        link.click();
        onPrint?.();
      } catch (error) {
        console.error('Error generating receipt:', error);
      }
    }
  };

  const handleWindowPrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const originalTitle = document.title;
    document.title = `Receipt_${payment.receipt_no || payment.id}`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px;
              padding: 20px;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .receipt {
              max-width: 300px;
              margin: 0 auto;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">${printContent}</div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    document.title = originalTitle;
    onPrint?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-md w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* POS Receipt */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div ref={receiptRef} className="p-4 font-mono text-xs">
            {/* Header */}
            <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
              <div className="font-bold text-sm mb-1">FMC KEFFI</div>
              <div className="text-[10px] text-gray-600">Federal Medical Centre, Keffi</div>
              <div className="text-[10px] text-gray-600">PMB 01, Keffi, Nasarawa State</div>
              <div className="text-[10px] text-gray-600">Tel: 08012345678</div>
              <div className="text-[10px] text-gray-600">VAT: 123456789-0001</div>
              <div className="w-full h-px bg-gray-200 my-2"></div>
              <div className="font-bold text-xs">PAYMENT RECEIPT</div>
              <div className="text-[10px] text-gray-600 mt-1">Receipt No: {payment.receipt_no || `RCP-${payment.id}`}</div>
            </div>

            {/* Patient Info */}
            <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">Patient Name:</span>
                <span className="text-right">{patient?.fullname}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="font-semibold">Patient ID:</span>
                <span>{patient?.patient_number}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="font-semibold">Date:</span>
                <span>{formatDate(payment.date_created || new Date())}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="font-semibold">Payment Method:</span>
                <span className="uppercase">{payment.payment_method || 'Cash'}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
              <div className="font-bold text-center mb-2">BILL DETAILS</div>
              <div className="grid grid-cols-12 gap-1 font-semibold border-b border-gray-300 pb-1 mb-1">
                <div className="col-span-7">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-3 text-right">Amount</div>
              </div>
              {bills?.map((bill, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-1 mb-1 text-[10px]">
                  <div className="col-span-7 truncate">{bill.description}</div>
                  <div className="col-span-2 text-right">1</div>
                  <div className="col-span-3 text-right">₦{formatNumber(bill.amount)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₦{formatNumber(payment.subtotal || payment.amount)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Discount:</span>
                <span>₦{formatNumber(payment.discount || 0)}</span>
              </div>
              <div className="flex justify-between mt-1 pt-1 border-t border-gray-300 font-bold">
                <span>TOTAL PAID:</span>
                <span>₦{formatNumber(payment.amount_paid || payment.amount)}</span>
              </div>
            </div>

            {/* Balance Info */}
            {payment.balance > 0 && (
              <div className="text-center text-red-600 font-semibold text-[10px] mb-2">
                Remaining Balance: ₦{formatNumber(payment.balance)}
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-2 border-t border-dashed border-gray-300">
              <div className="text-[10px] font-semibold">Thank you for your payment!</div>
              <div className="text-[9px] text-gray-500 mt-1">Cashier: {payment.cashier_name || 'System'}</div>
              <div className="text-[9px] text-gray-500">Powered by CareSync EMR</div>
              <div className="text-[9px] text-gray-400 mt-1">*This is a computer generated receipt*</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              onClick={handleWindowPrint}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSReceipt;