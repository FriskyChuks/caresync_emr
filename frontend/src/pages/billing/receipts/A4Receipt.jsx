// src/pages/billing/receipts/A4Receipt.jsx
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

const A4Receipt = ({ payment, patient, bills, onClose, onPrint }) => {
  const receiptRef = useRef(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.receipt_no || payment.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              background: #f0f0f0;
            }
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
            }
            @media print {
              body { 
                padding: 0;
                background: white;
              }
              .no-print { display: none; }
              .receipt-container {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">${printContent}</div>
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
    onPrint?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative max-w-4xl w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-200 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* A4 Receipt */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div ref={receiptRef} className="p-8">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-200 pb-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="text-left">
                  <div className="text-2xl font-bold text-blue-800">FMC KEFFI</div>
                  <div className="text-sm text-gray-600">Federal Medical Centre, Keffi</div>
                  <div className="text-sm text-gray-600">PMB 01, Keffi, Nasarawa State</div>
                  <div className="text-sm text-gray-600">Tel: 08012345678 | Email: info@fmckeffi.gov.ng</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">PAYMENT RECEIPT</div>
                  <div className="text-sm text-gray-600">Receipt No: {payment.receipt_no || `RCP-${payment.id}`}</div>
                  <div className="text-sm text-gray-600">Date: {formatDate(payment.date_created || new Date())}</div>
                </div>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Patient Information Section */}
            <div className="mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Patient Name</div>
                    <div className="text-sm font-medium text-gray-800">
                      {patient?.user_info?.first_name} {patient?.user_info?.last_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Patient ID</div>
                    <div className="text-sm font-medium text-gray-800">{patient?.patient_number}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Phone</div>
                    <div className="text-sm font-medium text-gray-800">{patient?.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Payment Method</div>
                    <div className="text-sm font-medium text-gray-800 uppercase">{payment.payment_method || 'Cash'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Items Table */}
            <div className="mb-6">
              <div className="font-bold text-gray-800 mb-3 text-lg">Bill Details</div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">S/N</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service Type</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Unit Price</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bills?.map((bill, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">{idx + 1}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{bill.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                          {bill.source_model?.replace('detail', '') || 'Service'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">1</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">₦{formatNumber(bill.amount)}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-800 text-right">₦{formatNumber(bill.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan="4" className="py-3 px-4"></td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">Subtotal:</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-800 text-right">₦{formatNumber(payment.subtotal || payment.amount)}</td>
                  </tr>
                  {payment.discount > 0 && (
                    <tr>
                      <td colSpan="4" className="py-2 px-4"></td>
                      <td className="py-2 px-4 text-sm font-semibold text-green-700 text-right">Discount:</td>
                      <td className="py-2 px-4 text-sm font-semibold text-green-700 text-right">-₦{formatNumber(payment.discount)}</td>
                    </tr>
                  )}
                  <tr className="bg-blue-50">
                    <td colSpan="4" className="py-3 px-4"></td>
                    <td className="py-3 px-4 text-base font-bold text-blue-800 text-right">TOTAL PAID:</td>
                    <td className="py-3 px-4 text-base font-bold text-blue-800 text-right">₦{formatNumber(payment.amount_paid || payment.amount)}</td>
                  </tr>
                  {payment.balance > 0 && (
                    <tr>
                      <td colSpan="4" className="py-2 px-4"></td>
                      <td className="py-2 px-4 text-sm font-semibold text-amber-700 text-right">Remaining Balance:</td>
                      <td className="py-2 px-4 text-sm font-semibold text-amber-700 text-right">₦{formatNumber(payment.balance)}</td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            {/* Payment Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-200">
                <div className="text-xs text-emerald-600 font-semibold">Amount Paid</div>
                <div className="text-lg font-bold text-emerald-700">₦{formatNumber(payment.amount_paid || payment.amount)}</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                <div className="text-xs text-amber-600 font-semibold">Payment Method</div>
                <div className="text-lg font-bold text-amber-700 uppercase">{payment.payment_method || 'Cash'}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                <div className="text-xs text-blue-600 font-semibold">Transaction ID</div>
                <div className="text-sm font-bold text-blue-700">{payment.transaction_id || 'N/A'}</div>
              </div>
            </div>

            {/* Additional Notes */}
            {payment.notes && (
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Payment Notes</div>
                  <div className="text-sm text-gray-700">{payment.notes}</div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-6 border-t-2 border-gray-200">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Generated on: {formatDate(new Date())}</span>
                <span>Cashier: {payment.cashier_name || 'System'}</span>
              </div>
              <div className="text-sm font-medium text-gray-700 mb-1">Thank you for choosing FMC Keffi</div>
              <div className="text-xs text-gray-500">This is a computer-generated receipt. Valid without signature.</div>
              <div className="text-xs text-gray-400 mt-2">Powered by CareSync EMR System</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3 no-print">
            <button
              onClick={handleWindowPrint}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save as Image
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default A4Receipt;