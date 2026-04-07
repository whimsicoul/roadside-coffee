'use client';

import type { Order } from '@/types';

interface OrderProgressStepperProps {
  status: Order['status'];
}

const steps = ['pending', 'arrived', 'ready', 'completed'] as const;
const stepLabels = {
  pending: 'Ordered',
  arrived: 'Arrived',
  ready: 'Ready',
  completed: 'Completed',
};

export function OrderProgressStepper({ status }: OrderProgressStepperProps) {
  const currentIndex = steps.indexOf(status);

  return (
    <div className="flex items-center gap-2 py-4">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center flex-1">
          {/* Step circle */}
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
              index <= currentIndex
                ? index === currentIndex
                  ? 'bg-amber-500 text-white'
                  : 'bg-coffee-judge text-white'
                : 'bg-coffee-oyster text-coffee-roman'
            }`}
          >
            {index + 1}
          </div>

          {/* Label */}
          <div className="text-xs font-medium text-coffee-roman ml-2">
            {stepLabels[step]}
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 ${
                index < currentIndex ? 'bg-coffee-judge' : 'bg-coffee-oyster'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
