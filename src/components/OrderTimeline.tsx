import type { OrderStatus, TrackingStep } from '@/types';

interface Props {
  currentStatus: OrderStatus;
  timeline?: TrackingStep[];
}

const STEPS: Array<{ status: OrderStatus; label: string; description: string }> = [
  { status: 'placed', label: 'Order Placed', description: 'Your order has been received' },
  { status: 'processing', label: 'Processing', description: 'Seller is preparing your order' },
  { status: 'shipped', label: 'Shipped', description: 'Your order is on the way' },
  { status: 'out_for_delivery', label: 'Out for Delivery', description: 'Driver is heading to you' },
  { status: 'delivered', label: 'Delivered', description: 'Order delivered successfully' },
];

const ORDER: OrderStatus[] = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderTimeline({ currentStatus, timeline }: Props) {
  const currentIdx = ORDER.indexOf(currentStatus);

  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        const ts = timeline?.find((t) => t.status === step.status);

        return (
          <div key={step.status} className="flex gap-4">
            {/* Left: dot + line */}
            <div className="flex flex-col items-center w-8">
              <div
                className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 ${
                  isDone ? 'bg-success' : isActive ? 'bg-primary ring-2 ring-primary-light' : 'bg-border'
                }`}
              />
              {i < STEPS.length - 1 && (
                <div className={`w-0.5 flex-1 my-1 ${isDone ? 'bg-success' : 'bg-border'}`} style={{ minHeight: 28 }} />
              )}
            </div>
            {/* Right: content */}
            <div className="pb-5">
              <p className={`text-[15px] font-semibold ${isActive ? 'text-primary' : isDone ? 'text-text-primary' : 'text-text-secondary'}`}>
                {step.label}
              </p>
              <p className="text-[13px] text-text-secondary">{ts?.description ?? step.description}</p>
              {ts?.timestamp && (
                <p className="text-[11px] text-text-secondary mt-0.5">{new Date(ts.timestamp).toLocaleString()}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
