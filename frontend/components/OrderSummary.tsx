import type { CartItem } from '@/types';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  if (items.length === 0) {
    return <p className="text-coffee-judge text-3xl py-8">Your cart is empty</p>;
  }

  return (
    <div>
      <div className="space-y-6 mb-8">
        {items.map((cartItem) => (
          <div
            key={cartItem.menuItem.id}
            className="flex justify-between items-start py-3 border-b border-coffee-oyster/40"
          >
            <div className="flex-1">
              <p className="font-semibold text-coffee-oil text-3xl">
                {cartItem.menuItem.name}
              </p>
              <p className="text-2xl text-coffee-roman mt-1">
                {cartItem.quantity} × ${parseFloat(cartItem.menuItem.price).toFixed(2)}
              </p>
            </div>
            <span className="font-semibold text-coffee-oil text-3xl ml-6">
              ${(parseFloat(cartItem.menuItem.price) * cartItem.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-coffee-roman pt-6 mt-6">
        <div className="flex justify-between font-semibold text-coffee-oil text-4xl">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
