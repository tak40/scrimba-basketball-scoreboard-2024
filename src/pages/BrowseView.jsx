import { useFilter } from '../context/FilterContext';
import { useGroupedDishes, useDishes } from '../hooks/useAirtable';
import SearchBar from '../components/SearchBar';
import AllergenFilter from '../components/AllergenFilter';
import CategorySection from '../components/CategorySection';
import { DishCardSkeleton } from '../components/DishCard';

export default function BrowseView() {
  const { searchQuery, selectedAllergens } = useFilter();
  const { data: allDishes } = useDishes();
  const {
    data: groupedDishes,
    isLoading,
    isError,
    error,
    flatData: filteredDishes,
    excludedDishes
  } = useGroupedDishes(searchQuery, selectedAllergens);

  const totalCount = allDishes?.length || 0;
  const filteredCount = filteredDishes?.length || 0;

  return (
    <div className="min-h-screen bg-white safe-area-top safe-area-bottom">
      {/* Header - Clean Apple-like */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-700">
                Nobu Malibu
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                Menu Guide
              </p>
            </div>
            <div className="text-2xl">
              🍣
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-4">
        {/* Search */}
        <div className="mb-3">
          <SearchBar />
        </div>

        {/* Allergen filter */}
        <div className="mb-4">
          <AllergenFilter
            totalCount={totalCount}
            filteredCount={filteredCount}
            excludedDishes={excludedDishes || []}
          />
        </div>

        {/* Error state */}
        {isError && (
          <div className="bg-red-50 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 text-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-semibold">Error loading dishes</span>
            </div>
            <p className="mt-2 text-sm text-red-500">
              {error?.message || 'Please try again later.'}
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {['SPECIALS', 'COLD', 'HOT'].map((category) => (
              <div key={category}>
                <div className="h-10 skeleton rounded-xl mb-3" />
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <DishCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && !isError && filteredCount === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              No dishes found
            </h3>
            <p className="text-gray-400 text-sm">
              {selectedAllergens.length > 0
                ? 'Try removing some allergen filters'
                : 'Try a different search term'}
            </p>
          </div>
        )}

        {/* Categories - New structure: COLD > HOT > DESSERTS > BAR > ARCHIVED */}
        {!isLoading && !isError && groupedDishes && (
          <div className="space-y-1">
            {/* Cold Dishes */}
            <CategorySection
              categoryKey="COLD"
              title="Cold Dishes"
              icon="❄️"
              onMenuDishes={groupedDishes.COLD?.onMenu}
              specialDishes={groupedDishes.COLD?.specials}
              isLoading={isLoading}
            />

            {/* Hot Dishes */}
            <CategorySection
              categoryKey="HOT"
              title="Hot Dishes"
              icon="🔥"
              onMenuDishes={groupedDishes.HOT?.onMenu}
              specialDishes={groupedDishes.HOT?.specials}
              isLoading={isLoading}
            />

            {/* Desserts */}
            <CategorySection
              categoryKey="DESSERTS"
              title="Desserts"
              icon="🍮"
              onMenuDishes={groupedDishes.DESSERTS?.onMenu}
              specialDishes={groupedDishes.DESSERTS?.specials}
              isLoading={isLoading}
            />

            {/* Bar */}
            <CategorySection
              categoryKey="BAR"
              title="Bar"
              icon="🍸"
              onMenuDishes={groupedDishes.BAR?.onMenu}
              specialDishes={groupedDishes.BAR?.specials}
              isLoading={isLoading}
            />

            {/* Archived - at the very bottom */}
            {groupedDishes.ARCHIVED?.length > 0 && (
              <CategorySection
                categoryKey="ARCHIVED"
                title="Archived"
                icon="📦"
                archivedDishes={groupedDishes.ARCHIVED}
                isLoading={isLoading}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer - Year only */}
      <footer className="px-4 py-6 text-center mt-4">
        <p className="text-xs text-gray-300">2026</p>
      </footer>
    </div>
  );
}
