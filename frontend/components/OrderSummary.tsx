import type { CartItem } from '@/types';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  if (items.length === 0) {
    return <p className="text-stone-500 text-sm py-4">No items yet.</p>;
  }

  return (
    <div>
      <div className="space-y-3 mb-6">
        {items.map((cartItem) => (
          <div
            key={cartItem.menuItem.id}
            className="flex justify-between items-center py-2 border-b border-stone-200"
          >
            <div>
              <p className="font-medium text-stone-900">
                {cartItem.menuItem.name}
              </p>
              <p className="text-sm text-stone-600">
                Qty: {cartItem.quantity} × $
                {parseFloat(cartItem.menuItem.price).toFixed(2)}
              </p>
            </div>
            <span className="font-semibold text-stone-900">
              ${(
                parseFloat(cartItem.menuItem.price) * cartItem.quantity
              ).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-amber-100 pt-4 mt-4">
        <div className="flex justify-between font-bold text-amber-800 text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
