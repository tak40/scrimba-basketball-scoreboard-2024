import { useState } from 'react';
import { useFilter } from '../context/FilterContext';
import { ALLERGEN_FIELDS, ALLERGEN_DISPLAY_NAMES } from '../services/localData';

export default function AllergenFilter({ totalCount, filteredCount, excludedDishes = [] }) {
  const { selectedAllergens, toggleAllergen, clearAllergens } = useFilter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllExcluded, setShowAllExcluded] = useState(false);

  const hasActiveFilters = selectedAllergens.length > 0;
  const excludedCount = totalCount - filteredCount;

  // Show more excluded dishes on mobile
  const visibleExcludedCount = showAllExcluded ? excludedDishes.length : 8;

  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between touch-target hover:bg-gray-100 active:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${hasActiveFilters ? 'text-primary' : 'text-gray-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="font-semibold text-gray-700">
            Allergen Filter
          </span>
          {hasActiveFilters && (
            <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {selectedAllergens.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Safe dishes counter */}
          <span className="text-sm text-gray-500">
            <span className="font-semibold text-success">{filteredCount}</span>
            <span className="text-gray-400">/{totalCount}</span>
          </span>

          {/* Expand/collapse icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
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
        </div>
      </button>

      {/* Expandable content */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-2">
          {/* Clear all button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllergens}
              className="mb-3 text-sm text-error hover:text-red-700 font-semibold transition-colors"
            >
              Clear all
            </button>
          )}

          {/* Allergen checkboxes - responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALLERGEN_FIELDS.map((allergen) => {
              const isSelected = selectedAllergens.includes(allergen);
              return (
                <label
                  key={allergen}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 touch-target ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-white/80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleAllergen(allergen)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-white/20'
                        : 'bg-gray-200'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">
                    {ALLERGEN_DISPLAY_NAMES[allergen]}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Help text */}
          <p className="mt-3 text-xs text-gray-400">
            Select allergens to filter. Only safe dishes will be shown.
          </p>

          {/* Excluded dishes section - improved responsiveness */}
          {hasActiveFilters && excludedCount > 0 && excludedDishes.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-error mb-2">
                {excludedCount} dishes contain selected allergens:
              </p>
              <div className="flex flex-wrap gap-1">
                {excludedDishes.slice(0, visibleExcludedCount).map((dish) => (
                  <span
                    key={dish.id}
                    className="text-xs bg-error/10 text-error px-2 py-1 rounded-lg font-medium truncate max-w-[150px]"
                    title={dish.name}
                  >
                    {dish.name}
                  </span>
                ))}
                {excludedDishes.length > visibleExcludedCount && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllExcluded(true);
                    }}
                    className="text-xs text-gray-500 px-2 py-1 rounded-lg font-medium hover:text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    +{excludedDishes.length - visibleExcludedCount} more
                  </button>
                )}
                {showAllExcluded && excludedDishes.length > 8 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllExcluded(false);
                    }}
                    className="text-xs text-gray-500 px-2 py-1 rounded-lg font-medium hover:text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
