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
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image */}
      <div className="h-48 bg-stone-200 overflow-hidden flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">☕</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-stone-900">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-stone-600 mt-1">{item.description}</p>
        )}

        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-amber-800">
            ${parseFloat(item.price).toFixed(2)}
          </span>

          {/* Quantity controls */}
          {quantity > 0 ? (
            <div className="flex items-center gap-2">
              {onRemove && (
                <button
                  onClick={() => onRemove(item)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-900 px-3 py-1 rounded"
                >
                  −
                </button>
              )}
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => onAdd(item)}
                className="bg-stone-200 hover:bg-stone-300 text-stone-900 px-3 py-1 rounded"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(item)}
              className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded font-medium"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
