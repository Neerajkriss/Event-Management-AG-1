import { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle2 } from 'lucide-react';
import type { Booking } from '@/types';
import Modal from '@/components/ui/Modal';
import { formatCurrency } from '@/utils/format';

interface PaymentModalProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onConfirmPayment: (bookingId: string) => void;
}

export default function PaymentModal({
  booking,
  open,
  onClose,
  onConfirmPayment,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!booking) return null;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onConfirmPayment(booking.id);
      onClose();
    }, 1500);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Complete Payment"
      size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={processing}>
            Cancel
          </button>
          <button
            className="btn-primary"
            type="submit"
            form="payment-form"
            disabled={processing}
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Pay {formatCurrency(booking.totalPrice)}
              </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Order summary */}
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Order Summary</p>
          <p className="mt-1 font-display text-base font-bold text-gray-900">{booking.eventTitle}</p>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
            <span>{booking.tickets} ticket{booking.tickets > 1 ? 's' : ''}</span>
            <span>{formatCurrency(booking.totalPrice)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="font-display text-lg font-bold text-brand-700">{formatCurrency(booking.totalPrice)}</span>
          </div>
        </div>

        {/* Payment method tabs */}
        <div>
          <p className="label">Payment Method</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition ${
                paymentMethod === 'card' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition ${
                paymentMethod === 'upi' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              UPI
            </button>
          </div>
        </div>

        {/* Payment form */}
        <form id="payment-form" onSubmit={handlePayment} className="space-y-4">
          {paymentMethod === 'card' ? (
            <>
              <div>
                <label className="label" htmlFor="card-number">Card Number</label>
                <input
                  id="card-number"
                  type="text"
                  value={cardForm.number}
                  onChange={(e) => setCardForm((f) => ({ ...f, number: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() }))}
                  className="input font-mono"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="card-name">Name on Card</label>
                <input
                  id="card-name"
                  type="text"
                  value={cardForm.name}
                  onChange={(e) => setCardForm((f) => ({ ...f, name: e.target.value }))}
                  className="input"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="card-expiry">Expiry</label>
                  <input
                    id="card-expiry"
                    type="text"
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm((f) => ({ ...f, expiry: e.target.value }))}
                    className="input"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="card-cvv">CVV</label>
                  <input
                    id="card-cvv"
                    type="password"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                    className="input"
                    placeholder="•••"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="label" htmlFor="upi-id">UPI ID</label>
              <input
                id="upi-id"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="input"
                placeholder="yourname@upi"
                required
              />
              <p className="mt-1.5 text-xs text-gray-400">Enter your UPI ID to proceed with the payment.</p>
            </div>
          )}
        </form>

        <p className="text-center text-xs text-gray-400">
          This is a simulated payment. No real transaction will occur.
        </p>
      </div>
    </Modal>
  );
}
