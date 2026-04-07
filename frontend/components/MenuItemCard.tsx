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
    <div className="border-b border-coffee-oyster py-4 flex items-center justify-between gap-4 hover:bg-coffee-parchment/40 transition-all duration-200 px-2 hover:shadow-paper-sm hover:mx-2 hover:-mx-2">
      {/* Left: Item details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-handwritten text-lg text-coffee-oil font-semibold">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-coffee-judge italic mt-1 line-clamp-1">{item.description}</p>
        )}
      </div>

      {/* Right: Price + Controls */}
      <div className="flex items-center gap-4">
        <span className="font-serif font-bold text-coffee-judge whitespace-nowrap">
          ${parseFloat(item.price).toFixed(2)}
        </span>

        {/* Quantity controls */}
        {quantity > 0 ? (
          <div className="flex items-center gap-1 bg-coffee-cream border border-coffee-roman rounded-lg px-2 py-1">
            {onRemove && (
              <button
                onClick={() => onRemove(item)}
                className="text-coffee-judge hover:text-coffee-oil font-bold px-2 py-1 transition-colors"
                aria-label={`Remove one ${item.name}`}
              >
                −
              </button>
            )}
            <span className="w-6 text-center font-bold text-coffee-oil text-sm">{quantity}</span>
            <button
              onClick={() => onAdd(item)}
              className="text-coffee-judge hover:text-coffee-oil font-bold px-2 py-1 transition-colors"
              aria-label={`Add one ${item.name}`}
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdd(item)}
            className="bg-coffee-judge hover:bg-coffee-oil text-coffee-cream px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
            aria-label={`Add ${item.name} to cart`}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
