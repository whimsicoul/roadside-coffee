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
    <div className="border-b border-coffee-oyster py-8 px-10 flex items-center justify-between gap-8 hover:bg-coffee-parchment/50 transition-colors duration-150">
      {/* Left: Item details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-5xl text-coffee-oil font-semibold">{item.name}</h3>
        {item.description && (
          <p className="text-4xl text-coffee-judge mt-2 line-clamp-2">{item.description}</p>
        )}
      </div>

      {/* Right: Price + Controls */}
      <div className="flex items-center gap-8">
        <span className="font-semibold text-coffee-judge whitespace-nowrap min-w-24 text-right text-4xl">
          ${parseFloat(item.price).toFixed(2)}
        </span>

        {/* Quantity controls */}
        {quantity > 0 ? (
          <div className="flex items-center gap-3 bg-coffee-parchment/60 border border-coffee-oyster rounded-lg px-5 py-3">
            {onRemove && (
              <button
                onClick={() => onRemove(item)}
                className="text-coffee-judge hover:text-coffee-oil font-semibold px-2 py-1 transition-colors text-3xl w-10 text-center"
                aria-label={`Remove one ${item.name}`}
              >
                −
              </button>
            )}
            <span className="w-8 text-center font-semibold text-coffee-oil text-3xl">{quantity}</span>
            <button
              onClick={() => onAdd(item)}
              className="text-coffee-judge hover:text-coffee-oil font-semibold px-2 py-1 transition-colors text-3xl w-10 text-center"
              aria-label={`Add one ${item.name}`}
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdd(item)}
            className="bg-coffee-judge hover:bg-coffee-oil text-white px-8 py-4 rounded-lg font-semibold text-3xl transition-colors whitespace-nowrap"
            aria-label={`Add ${item.name} to cart`}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
