import { Link } from 'react-router-dom';

// Category color schemes - lighter bg on hover, MUCH DARKER text on hover for visibility
const CARD_COLORS = {
  COLD: {
    bg: 'bg-sky-50 hover:bg-sky-100/80 border-sky-200',
    text: 'text-gray-700 group-hover:text-black group-hover:font-semibold'
  },
  HOT: {
    bg: 'bg-rose-50 hover:bg-rose-100/80 border-rose-200',
    text: 'text-gray-700 group-hover:text-black group-hover:font-semibold'
  },
  DESSERTS: {
    bg: 'bg-pink-50 hover:bg-pink-100/80 border-pink-200',
    text: 'text-gray-700 group-hover:text-black group-hover:font-semibold'
  },
  BAR: {
    bg: 'bg-violet-50 hover:bg-violet-100/80 border-violet-200',
    text: 'text-gray-700 group-hover:text-black group-hover:font-semibold'
  },
  ARCHIVED: {
    bg: 'bg-gray-50 hover:bg-gray-100/80 border-gray-300',
    text: 'text-gray-500 group-hover:text-gray-700'
  },
  OTHER: {
    bg: 'bg-gray-50 hover:bg-gray-100/80 border-gray-200',
    text: 'text-gray-700 group-hover:text-black group-hover:font-semibold'
  }
};

// Status badge styles
const STATUS_BADGES = {
  on_menu: {
    label: 'On Menu',
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: null
  },
  special: {
    label: 'Special',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    icon: null
  },
  weekend: {
    label: 'Weekend',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    icon: null
  },
  seasonal: {
    label: 'Seasonal',
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    icon: null
  },
  archived: {
    label: 'Archived',
    bg: 'bg-gray-200',
    text: 'text-gray-600',
    icon: null
  }
};

// Get icon for category (fallback when no image)
const getCategoryIcon = (categoryKey) => {
  switch (categoryKey) {
    case 'COLD': return '❄️';
    case 'HOT': return '🔥';
    case 'DESSERTS': return '🍮';
    case 'BAR': return '🍸';
    case 'ARCHIVED': return '📦';
    default: return '🍽️';
  }
};

export default function DishCard({ dish, categoryKey }) {
  const { id, name, allergenCount, image, menuStatus } = dish;

  // Get menu status - use menuStatus from merged data, or infer from activeStatus
  const status = menuStatus || (
    dish.activeStatus === 'Archived' ? 'archived' :
    dish.activeStatus === 'Weekend_Special' ? 'weekend' :
    dish.activeStatus === 'Seasonal_Special' ? 'seasonal' :
    dish.activeStatus === 'Special' ? 'special' :
    'on_menu'
  );

  // Get status badge config
  const statusBadge = STATUS_BADGES[status] || STATUS_BADGES.on_menu;

  // Get color scheme based on category
  const colors = CARD_COLORS[categoryKey] || CARD_COLORS.OTHER;

  // Handle image - Airtable returns object {full, large, small}, local data returns string
  const getImageUrl = () => {
    if (!image) return null;
    if (typeof image === 'string') return image.trim() || null;
    if (typeof image === 'object') return image.large || image.full || image.small || null;
    return null;
  };
  const imageUrl = getImageUrl();
  const hasImage = !!imageUrl;

  return (
    <Link
      to={`/dish/${id}`}
      className={`group block rounded-xl overflow-hidden border active:scale-[0.97] transition-all duration-150 ${colors.bg}`}
    >
      {/* Show image if available, otherwise show icon placeholder */}
      {hasImage ? (
        <div className="relative aspect-square w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/* Status badge overlay - top right */}
          <div className="absolute top-1 right-1">
            <span className={`text-[8px] sm:text-[9px] font-semibold backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm ${statusBadge.bg} ${statusBadge.text}`}>
              {statusBadge.label}
            </span>
          </div>
          {/* Allergen badge overlay - bottom left */}
          {allergenCount > 0 && (
            <div className="absolute bottom-1 left-1">
              <span className="text-[10px] bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm text-gray-600 flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {allergenCount}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* No image - show icon-based card */
        <div className="relative aspect-square w-full flex items-center justify-center bg-white/50">
          <span className="text-3xl sm:text-4xl opacity-60">
            {getCategoryIcon(categoryKey)}
          </span>
          {/* Status badge - top right */}
          <div className="absolute top-1 right-1">
            <span className={`text-[8px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded-full shadow-sm ${statusBadge.bg} ${statusBadge.text}`}>
              {statusBadge.label}
            </span>
          </div>
          {/* Allergen badge - bottom left */}
          {allergenCount > 0 && (
            <div className="absolute bottom-1 left-1">
              <span className="text-[10px] bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm text-gray-600 flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {allergenCount}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Dish name - below image/icon */}
      <div className="p-1.5 sm:p-2">
        <h3 className={`font-medium text-[10px] sm:text-[11px] md:text-xs leading-tight line-clamp-2 transition-colors ${colors.text}`}>
          {name}
        </h3>
      </div>
    </Link>
  );
}

// Skeleton version for loading state - with image placeholder
export function DishCardSkeleton() {
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      <div className="aspect-square w-full skeleton" />
      <div className="p-1.5 sm:p-2">
        <div className="h-3 skeleton rounded w-4/5 mb-1" />
        <div className="h-3 skeleton rounded w-3/5" />
      </div>
    </div>
  );
}
