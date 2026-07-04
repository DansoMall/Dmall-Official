import { CheckCircle2, Clock3, Home, MapPin, PackageCheck, RotateCcw, Truck, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import type { OrderStatus, TrackingStep } from '@/types';

interface Props {
  currentStatus: OrderStatus;
  timeline?: TrackingStep[];
}

const STEPS: Array<{ status: OrderStatus; label: string; description: string; icon: ReactNode }> = [
  { status: 'placed', label: 'Order Placed', description: 'Your order has been received.', icon: <Clock3 size={15} /> },
  { status: 'processing', label: 'Processing', description: 'The seller is preparing your order.', icon: <PackageCheck size={15} /> },
  { status: 'shipped', label: 'Shipped', description: 'Your package has been handed to the courier.', icon: <Truck size={15} /> },
  { status: 'out_for_delivery', label: 'Out for Delivery', description: 'The rider is heading to your delivery address.', icon: <MapPin size={15} /> },
  { status: 'delivered', label: 'Delivered', description: 'Order delivered successfully.', icon: <Home size={15} /> },
];

const ORDER: OrderStatus[] = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const TERMINAL_STEPS: Record<string, { label: string; icon: ReactNode; tone: 'danger' | 'warning' }> = {
  cancelled: { label: 'Order Cancelled', icon: <XCircle size={15} />, tone: 'danger' },
  returned: { label: 'Order Returned', icon: <RotateCcw size={15} />, tone: 'warning' },
};

function formatDateTime(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderTimeline({ currentStatus, timeline }: Props) {
  const currentIdx = ORDER.indexOf(currentStatus);
  const sortedTimeline = [...(timeline ?? [])].sort(
    (a, b) => new Date(a.timestamp ?? 0).getTime() - new Date(b.timestamp ?? 0).getTime()
  );
  const isTerminal = currentStatus === 'cancelled' || currentStatus === 'returned';
  const terminalUpdate = sortedTimeline.find((t) => t.status === currentStatus);

  return (
    <div className="flex flex-col">
      {STEPS.map((step, i) => {
        const isDone = !isTerminal && i < currentIdx;
        const isActive = !isTerminal && i === currentIdx;
        const ts = sortedTimeline.find((t) => t.status === step.status);

        return (
          <div key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center w-8">
              <div
                className={`w-8 h-8 rounded-full mt-0 shrink-0 flex items-center justify-center border-2 ${
                  isDone || ts
                    ? 'bg-success text-white border-success'
                    : isActive
                      ? 'bg-primary text-white border-primary ring-4 ring-primary/10'
                      : 'bg-white text-text-secondary border-border'
                }`}
              >
                {isDone || ts ? <CheckCircle2 size={15} /> : step.icon}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-0.5 flex-1 my-1 ${isDone ? 'bg-success' : 'bg-border'}`} style={{ minHeight: 34 }} />
              )}
            </div>
            <div className="pb-5 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className={`text-[15px] font-bold ${isActive ? 'text-primary' : isDone || ts ? 'text-text-primary' : 'text-text-secondary'}`}>
                {step.label}
              </p>
                {isActive && (
                  <span className="text-[10px] uppercase tracking-wide font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="text-[13px] text-text-secondary mt-0.5">{ts?.description ?? step.description}</p>
              {ts?.timestamp && (
                <p className="text-[11px] text-text-secondary mt-1">{formatDateTime(ts.timestamp)}</p>
              )}
            </div>
          </div>
        );
      })}

      {isTerminal && TERMINAL_STEPS[currentStatus] && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center w-8">
            <div
              className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border-2 ${
                TERMINAL_STEPS[currentStatus].tone === 'danger'
                  ? 'bg-danger text-white border-danger'
                  : 'bg-warning text-white border-warning'
              }`}
            >
              {TERMINAL_STEPS[currentStatus].icon}
            </div>
          </div>
          <div className="pb-1 flex-1">
            <p className="text-[15px] font-bold text-text-primary">{TERMINAL_STEPS[currentStatus].label}</p>
            <p className="text-[13px] text-text-secondary mt-0.5">
              {terminalUpdate?.description ?? 'This order is no longer moving through the delivery flow.'}
            </p>
            {terminalUpdate?.timestamp && (
              <p className="text-[11px] text-text-secondary mt-1">{formatDateTime(terminalUpdate.timestamp)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
