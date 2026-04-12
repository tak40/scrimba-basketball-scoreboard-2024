import { useQuery, useQueryClient } from '@tanstack/react-query';

// Using merged data (Airtable + Notion JSON)
import {
  fetchMergedDishes,
  groupDishesByNewCategory,
  filterDishesByAllergens,
  searchDishes,
  getAutocompleteSuggestions
} from '../services/mergedData';

// Keep Airtable for recipes
import {
  fetchRecipes,
  fetchRecipeById
} from '../services/airtable';

// Query keys
export const queryKeys = {
  dishes: ['dishes'],
  dish: (id) => ['dish', id],
  recipes: ['recipes'],
  recipe: (id) => ['recipe', id]
};

// Fetch all dishes with caching (merged from Airtable + Notion)
export function useDishes() {
  return useQuery({
    queryKey: queryKeys.dishes,
    queryFn: fetchMergedDishes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 2
  });
}

// Fetch all recipes with caching
export function useRecipes() {
  return useQuery({
    queryKey: queryKeys.recipes,
    queryFn: fetchRecipes,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  });
}

// Fetch a single dish by ID (from merged cache)
export function useDish(id) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.dish(id),
    queryFn: async () => {
      // First try to get from cache
      const dishes = queryClient.getQueryData(queryKeys.dishes);
      const dish = dishes?.find(d => d.id === id);
      if (dish) return dish;

      // If not in cache, fetch all dishes and find it
      const allDishes = await fetchMergedDishes();
      return allDishes.find(d => d.id === id);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!id,
    // Try to get initial data from the dishes cache
    initialData: () => {
      const dishes = queryClient.getQueryData(queryKeys.dishes);
      return dishes?.find(d => d.id === id);
    }
  });
}

// Fetch a single recipe by ID
export function useRecipe(id) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.recipe(id),
    queryFn: () => fetchRecipeById(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!id,
    initialData: () => {
      const recipes = queryClient.getQueryData(queryKeys.recipes);
      return recipes?.find(r => r.id === id);
    }
  });
}

// Hook for filtered and searched dishes
export function useFilteredDishes(searchQuery, selectedAllergens) {
  const { data: dishes, ...queryResult } = useDishes();

  // Apply client-side filtering
  let filteredDishes = dishes || [];
  let excludedDishes = [];

  // First filter by allergens
  if (selectedAllergens && selectedAllergens.length > 0) {
    const safeSet = new Set(filterDishesByAllergens(filteredDishes, selectedAllergens).map(d => d.id));
    excludedDishes = filteredDishes.filter(d => !safeSet.has(d.id));
    filteredDishes = filteredDishes.filter(d => safeSet.has(d.id));
  }

  // Then filter by search query
  if (searchQuery && searchQuery.trim()) {
    filteredDishes = searchDishes(filteredDishes, searchQuery);
  }

  return {
    ...queryResult,
    data: filteredDishes,
    totalCount: dishes?.length || 0,
    filteredCount: filteredDishes.length,
    excludedDishes
  };
}

// Hook for grouped dishes by category (new structure: COLD > HOT > DESSERTS > BAR > ARCHIVED)
export function useGroupedDishes(searchQuery, selectedAllergens) {
  const { data: filteredDishes, excludedDishes, ...rest } = useFilteredDishes(searchQuery, selectedAllergens);

  const groupedDishes = filteredDishes ? groupDishesByNewCategory(filteredDishes) : null;

  return {
    ...rest,
    data: groupedDishes,
    flatData: filteredDishes,
    excludedDishes
  };
}

// Hook for autocomplete suggestions
export function useAutocompleteSuggestions(query) {
  const { data: dishes } = useDishes();

  if (!dishes) return [];

  return getAutocompleteSuggestions(dishes, query);
}

// Prefetch dishes data
export function usePrefetchDishes() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.dishes,
      queryFn: fetchMergedDishes,
      staleTime: 5 * 60 * 1000
    });
  };
}

// Prefetch a single dish
export function usePrefetchDish() {
  const queryClient = useQueryClient();

  return (id) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.dish(id),
      queryFn: async () => {
        const dishes = queryClient.getQueryData(queryKeys.dishes);
        return dishes?.find(d => d.id === id);
      },
      staleTime: 5 * 60 * 1000
    });
  };
}
