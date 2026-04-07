'use client';

import type { Order } from '@/types';

interface OrderStatusBadgeProps {
  status: Order['status'];
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800',
  },
  arrived: {
    label: 'Arrived',
    className: 'bg-blue-100 text-blue-800',
  },
  ready: {
    label: 'Ready for Pickup',
    className: 'bg-green-100 text-green-800',
  },
  completed: {
    label: 'Completed',
    className: 'bg-stone-100 text-stone-600',
  },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
