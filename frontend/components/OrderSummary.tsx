import type { CartItem } from '@/types';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  if (items.length === 0) {
    return <p className="text-coffee-roman text-sm py-4">No items yet.</p>;
  }

  return (
    <div>
      <div className="space-y-3 mb-6">
        {items.map((cartItem) => (
          <div
            key={cartItem.menuItem.id}
            className="flex justify-between items-center py-2 border-b border-coffee-oyster"
          >
            <div>
              <p className="font-medium text-coffee-oil">
                {cartItem.menuItem.name}
              </p>
              <p className="text-sm text-coffee-roman">
                Qty: {cartItem.quantity} × $
                {parseFloat(cartItem.menuItem.price).toFixed(2)}
              </p>
            </div>
            <span className="font-semibold text-coffee-oil">
              ${(
                parseFloat(cartItem.menuItem.price) * cartItem.quantity
              ).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-coffee-roman pt-4 mt-4">
        <div className="flex justify-between font-bold text-coffee-judge text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
