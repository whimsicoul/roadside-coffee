import type { CartItem } from '@/types';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-stone-900 mb-4">Order Summary</h2>

      {items.length === 0 ? (
        <p className="text-stone-600">No items in order.</p>
      ) : (
        <>
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

          <div className="border-t-2 border-stone-300 pt-4">
            <div className="flex justify-between items-center text-xl font-bold text-amber-800">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
