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
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border border-amber-100 overflow-hidden">
      {/* Image */}
      <div className="h-44 bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">☕</span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif font-semibold text-stone-900 text-lg">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-stone-600 mt-1 line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center justify-between mt-5">
          <span className="text-xl font-bold text-amber-800">
            ${parseFloat(item.price).toFixed(2)}
          </span>

          {/* Quantity controls */}
          {quantity > 0 ? (
            <div className="flex items-center gap-2">
              {onRemove && (
                <button
                  onClick={() => onRemove(item)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1 rounded-lg font-bold transition-colors"
                >
                  −
                </button>
              )}
              <span className="w-8 text-center font-bold text-amber-900">{quantity}</span>
              <button
                onClick={() => onAdd(item)}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1 rounded-lg font-bold transition-colors"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(item)}
              className="bg-amber-800 hover:bg-amber-900 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
