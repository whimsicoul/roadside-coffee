'use client';

import type { Order } from '@/types';

interface OrderStatusBadgeProps {
  status: Order['status'];
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-coffee-oyster text-coffee-judge',
  },
  arrived: {
    label: 'Arrived',
    className: 'bg-orange-100 text-orange-800',
  },
  ready: {
    label: 'Ready for Pickup',
    className: 'bg-green-100 text-green-800',
  },
  completed: {
    label: 'Completed',
    className: 'bg-stone-100 text-coffee-roman',
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
