import type { MenuItem } from '@/types';

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: (item: MenuItem) => void;
  onRemove?: (item: MenuItem) => void;
}

export function MenuItemCard({
  item,
  quantity,
  onAdd,
  onRemove,
}: MenuItemCardProps) {
  return (
    <div className="border-b border-coffee-oyster py-5 px-8 flex items-center justify-between gap-6 hover:bg-coffee-parchment/50 transition-colors duration-150">
      {/* Left: Item details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base text-coffee-oil font-semibold">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-coffee-judge mt-1 line-clamp-1">{item.description}</p>
        )}
      </div>

      {/* Right: Price + Controls */}
      <div className="flex items-center gap-6">
        <span className="font-semibold text-coffee-judge whitespace-nowrap min-w-12 text-right">
          ${parseFloat(item.price).toFixed(2)}
        </span>

        {/* Quantity controls */}
        {quantity > 0 ? (
          <div className="flex items-center gap-2 bg-coffee-parchment/60 border border-coffee-oyster rounded-lg px-3 py-1.5">
            {onRemove && (
              <button
                onClick={() => onRemove(item)}
                className="text-coffee-judge hover:text-coffee-oil font-semibold px-1 py-0 transition-colors text-sm w-6 text-center"
                aria-label={`Remove one ${item.name}`}
              >
                −
              </button>
            )}
            <span className="w-6 text-center font-semibold text-coffee-oil text-sm">{quantity}</span>
            <button
              onClick={() => onAdd(item)}
              className="text-coffee-judge hover:text-coffee-oil font-semibold px-1 py-0 transition-colors text-sm w-6 text-center"
              aria-label={`Add one ${item.name}`}
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdd(item)}
            className="bg-coffee-judge hover:bg-coffee-oil text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
            aria-label={`Add ${item.name} to cart`}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
