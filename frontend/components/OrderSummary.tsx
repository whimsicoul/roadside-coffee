import type { CartItem } from '@/types';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  if (items.length === 0) {
    return <p className="text-coffee-judge text-sm py-6">Your cart is empty</p>;
  }

  return (
    <div>
      <div className="space-y-4 mb-6">
        {items.map((cartItem) => (
          <div
            key={cartItem.menuItem.id}
            className="flex justify-between items-start py-2 border-b border-coffee-oyster/40"
          >
            <div className="flex-1">
              <p className="font-semibold text-coffee-oil text-sm">
                {cartItem.menuItem.name}
              </p>
              <p className="text-xs text-coffee-roman mt-0.5">
                {cartItem.quantity} × ${parseFloat(cartItem.menuItem.price).toFixed(2)}
              </p>
            </div>
            <span className="font-semibold text-coffee-oil text-sm ml-4">
              ${(parseFloat(cartItem.menuItem.price) * cartItem.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-coffee-roman pt-4 mt-4">
        <div className="flex justify-between font-semibold text-coffee-oil text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
