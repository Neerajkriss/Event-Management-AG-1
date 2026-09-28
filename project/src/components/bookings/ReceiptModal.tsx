import { CheckCircle2, Download, Receipt } from 'lucide-react';
import type { Booking } from '@/types';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDateTime } from '@/utils/format';

interface ReceiptModalProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
}

export default function ReceiptModal({ booking, open, onClose }: ReceiptModalProps) {
  if (!booking) return null;

  const downloadReceipt = () => {
    const text = `
========================================
           EVENTHUB RECEIPT             
========================================
Receipt No:    ${booking.id.toUpperCase()}
Event:         ${booking.eventTitle}
Customer:      ${booking.userName} (${booking.userEmail})
Tickets:       ${booking.tickets}
Total Paid:    Rs. ${booking.totalPrice.toLocaleString('en-IN')}
Status:        CONFIRMED (PAID)
Date:          ${new Date(booking.createdAt).toLocaleString('en-IN')}
========================================
Thank you for your booking!
Support: support@eventhub.com
========================================
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${booking.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Payment Successful!"
      size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={downloadReceipt}>
            <Download className="h-4 w-4" />
            Download Receipt
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-100 text-success-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="mt-3 font-display text-lg font-bold text-gray-900">Payment Complete!</p>
          <p className="mt-1 text-sm text-gray-500">
            Your booking for <span className="font-medium text-gray-700">{booking.eventTitle}</span> is now confirmed.
          </p>
        </div>

        {/* Receipt summary */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Receipt className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Receipt Summary</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Receipt No:</span>
              <span className="font-mono font-medium text-gray-900">{booking.id.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Event:</span>
              <span className="font-medium text-gray-900">{booking.eventTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tickets:</span>
              <span className="font-medium text-gray-900">{booking.tickets}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <span className="font-semibold text-gray-700">Amount Paid:</span>
              <span className="font-display text-lg font-bold text-success-600">{formatCurrency(booking.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span className="font-medium text-gray-900">{formatDateTime(booking.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
