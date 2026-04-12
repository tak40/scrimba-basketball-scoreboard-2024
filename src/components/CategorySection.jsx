import { useFilter } from '../context/FilterContext';
import DishCard, { DishCardSkeleton } from './DishCard';

// Category color schemes - subtle and elegant
const CATEGORY_COLORS = {
  COLD: {
    bg: 'bg-sky-50',
    hover: 'hover:bg-sky-100',
    text: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-700',
    border: 'border-sky-200'
  },
  HOT: {
    bg: 'bg-rose-50',
    hover: 'hover:bg-rose-100',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    border: 'border-rose-200'
  },
  DESSERTS: {
    bg: 'bg-pink-50',
    hover: 'hover:bg-pink-100',
    text: 'text-pink-700',
    badge: 'bg-pink-100 text-pink-700',
    border: 'border-pink-200'
  },
  BAR: {
    bg: 'bg-violet-50',
    hover: 'hover:bg-violet-100',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
    border: 'border-violet-200'
  },
  ARCHIVED: {
    bg: 'bg-gray-50',
    hover: 'hover:bg-gray-100',
    text: 'text-gray-500',
    badge: 'bg-gray-100 text-gray-500',
    border: 'border-gray-200'
  },
  OTHER: {
    bg: 'bg-gray-50',
    hover: 'hover:bg-gray-100',
    text: 'text-gray-700',
    badge: 'bg-gray-100 text-gray-700',
    border: 'border-gray-200'
  }
};

export default function CategorySection({
  title,
  icon,
  onMenuDishes,
  specialDishes,
  archivedDishes,
  isLoading,
  categoryKey
}) {
  const { expandedCategories, toggleCategory } = useFilter();
  const isExpanded = expandedCategories.includes(categoryKey);
  const colors = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.OTHER;

  // Calculate total dishes
  const totalDishes = (onMenuDishes?.length || 0) + (specialDishes?.length || 0) + (archivedDishes?.length || 0);

  // Don't render if no dishes and not loading
  if (!isLoading && totalDishes === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      {/* Category header with color coding */}
      <button
        onClick={() => toggleCategory(categoryKey)}
        className={`w-full flex items-center justify-between px-4 py-3 ${colors.bg} ${colors.hover} rounded-2xl touch-target mb-2 active:scale-[0.99] transition-all duration-200 border ${colors.border}`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{icon}</span>
          <h2 className={`font-semibold text-base ${colors.text}`}>
            {title}
          </h2>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${colors.badge}`}>
            {totalDishes}
          </span>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 ${colors.text} opacity-60 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expandable content */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-1">
            {[...Array(6)].map((_, i) => (
              <DishCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* New structure: On Menu dishes first, then Specials */}
        {!isLoading && (onMenuDishes || specialDishes) && (
          <div className="space-y-4 px-1">
            {/* On Menu dishes */}
            {onMenuDishes && onMenuDishes.length > 0 && (
              <div>
                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${colors.text}`}>
                  <span>📋</span> On Menu
                  <span className="text-[10px] font-medium opacity-70">({onMenuDishes.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {onMenuDishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} categoryKey={categoryKey} />
                  ))}
                </div>
              </div>
            )}

            {/* Off-Menu Specials */}
            {specialDishes && specialDishes.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>⭐</span> Off-Menu Specials
                  <span className="text-[10px] font-medium opacity-70">({specialDishes.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {specialDishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} categoryKey={categoryKey} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Archived dishes (separate section) */}
        {!isLoading && archivedDishes && archivedDishes.length > 0 && (
          <div className="px-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {archivedDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} categoryKey="ARCHIVED" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
