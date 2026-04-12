/**
 * Local Data Service - Uses hard-coded JSON data from Notion
 * This is an alternative to the Airtable service for MVP/offline use
 */

import dishesData from '../data/dishes.json';
import recipesData from '../data/recipes.json';

// Re-export allergen constants for compatibility
export const ALLERGEN_FIELDS = [
  'Gluten',
  'Dairy',
  'Shellfish_Crustacean',
  'Shellfish_Mollusk',
  'Soy',
  'Sesame_Seeds',
  'Sesame_Oil',
  'Egg',
  'Fish',
  'Peanuts',
  'Tree_Nuts',
  'Garlic',
  'Onion',
  'Nightshade',
  'Alcohol',
  'Sulfites',
  'Citrus',
  'Cilantro',
  'Avocado',
  'Mustard',
  'Celery'
];

export const ALLERGEN_DISPLAY_NAMES = {
  'Gluten': 'Gluten',
  'Dairy': 'Dairy',
  'Shellfish_Crustacean': 'Shellfish (Crustacean)',
  'Shellfish_Mollusk': 'Shellfish (Mollusk)',
  'Soy': 'Soy',
  'Sesame_Seeds': 'Sesame Seeds',
  'Sesame_Oil': 'Sesame Oil',
  'Egg': 'Egg',
  'Fish': 'Fish',
  'Peanuts': 'Peanuts',
  'Tree_Nuts': 'Tree Nuts',
  'Garlic': 'Garlic',
  'Onion': 'Onion',
  'Nightshade': 'Nightshade',
  'Alcohol': 'Alcohol',
  'Sulfites': 'Sulfites',
  'Citrus': 'Citrus',
  'Cilantro': 'Cilantro',
  'Avocado': 'Avocado',
  'Mustard': 'Mustard',
  'Celery': 'Celery'
};

// Station categories mapping
export const STATION_CATEGORIES = {
  'SPECIALS': ['Special', 'Seasonal_Special'],
  'COLD': ['Cold'],
  'HOT': ['Hot'],
  'DESSERTS': ['Dessert'],
  'DRINKS': ['Drink', 'Drinks']
};

// Fetch all dishes (returns Promise for compatibility with React Query)
export async function fetchDishes() {
  // Simulate network delay for realistic behavior
  await new Promise(resolve => setTimeout(resolve, 100));
  return dishesData.dishes;
}

// Fetch all recipes
export async function fetchRecipes() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return recipesData.recipes;
}

// Fetch a single dish by ID
export async function fetchDishById(id) {
  await new Promise(resolve => setTimeout(resolve, 50));
  const dish = dishesData.dishes.find(d => d.id === id);
  if (!dish) {
    throw new Error('Dish not found');
  }
  return dish;
}

// Fetch a single recipe by ID
export async function fetchRecipeById(id) {
  await new Promise(resolve => setTimeout(resolve, 50));
  const recipe = recipesData.recipes.find(r => r.id === id);
  if (!recipe) {
    throw new Error('Recipe not found');
  }
  return recipe;
}

// Search recipes
export function searchRecipes(recipes, query) {
  if (!query || query.trim() === '') {
    return recipes;
  }

  const searchTerm = query.toLowerCase().trim();

  return recipes.filter(recipe => {
    const name = (recipe.name || '').toLowerCase();
    const description = (recipe.description || '').toLowerCase();
    const category = (recipe.category || '').toLowerCase();
    const ingredients = (recipe.ingredients || []).join(' ').toLowerCase();

    return (
      name.includes(searchTerm) ||
      description.includes(searchTerm) ||
      category.includes(searchTerm) ||
      ingredients.includes(searchTerm)
    );
  });
}

// Get category for a dish based on station
export function getDishCategory(dish) {
  const status = dish.activeStatus;

  if (status === 'Special' || status === 'Seasonal_Special') {
    return 'SPECIALS';
  }

  const station = dish.station?.toLowerCase() || '';

  if (station.includes('cold')) return 'COLD';
  if (station.includes('hot')) return 'HOT';
  if (station.includes('dessert')) return 'DESSERTS';
  if (station.includes('drink')) return 'DRINKS';

  return 'OTHER';
}

// Group dishes by category
export function groupDishesByCategory(dishes) {
  const categories = {
    SPECIALS: { regular: [], seasonal: [] },
    COLD: [],
    HOT: [],
    DESSERTS: [],
    DRINKS: [],
    OTHER: []
  };

  dishes.forEach(dish => {
    const category = getDishCategory(dish);

    if (category === 'SPECIALS') {
      if (dish.activeStatus === 'Seasonal_Special') {
        categories.SPECIALS.seasonal.push(dish);
      } else {
        categories.SPECIALS.regular.push(dish);
      }
    } else {
      categories[category].push(dish);
    }
  });

  return categories;
}

// Filter dishes by selected allergens (client-side)
export function filterDishesByAllergens(dishes, selectedAllergens) {
  if (!selectedAllergens || selectedAllergens.length === 0) {
    return dishes;
  }

  return dishes.filter(dish => {
    // Dish is safe if NONE of the selected allergens are present
    return !selectedAllergens.some(allergen => dish.allergens[allergen]);
  });
}

// Search dishes by name, ingredients, flavor profile, and all text content
export function searchDishes(dishes, query) {
  if (!query || query.trim() === '') {
    return dishes;
  }

  const searchTerm = query.toLowerCase().trim();

  return dishes.filter(dish => {
    const name = (dish.name || '').toLowerCase();
    const ingredients = (dish.completeIngredients || '').toLowerCase();
    const flavorProfile = Array.isArray(dish.flavorProfile)
      ? dish.flavorProfile.join(' ').toLowerCase()
      : (dish.flavorProfile || '').toLowerCase();
    const spielShort = (dish.spielShort || '').toLowerCase();
    const spielFull = (dish.spielFull || '').toLowerCase();
    const serviceNotes = (dish.serviceNotes || '').toLowerCase();
    const station = (dish.station || '').toLowerCase();

    return (
      name.includes(searchTerm) ||
      ingredients.includes(searchTerm) ||
      flavorProfile.includes(searchTerm) ||
      spielShort.includes(searchTerm) ||
      spielFull.includes(searchTerm) ||
      serviceNotes.includes(searchTerm) ||
      station.includes(searchTerm)
    );
  });
}

// Get autocomplete suggestions
export function getAutocompleteSuggestions(dishes, query, limit = 5) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  const suggestions = new Set();

  dishes.forEach(dish => {
    // Add dish name if it matches
    if (dish.name.toLowerCase().includes(searchTerm)) {
      suggestions.add(dish.name);
    }

    // Add matching ingredients
    if (dish.completeIngredients) {
      const ingredients = dish.completeIngredients.split(/[,;:\n]/);
      ingredients.forEach(ingredient => {
        const trimmed = ingredient.trim();
        if (trimmed.toLowerCase().includes(searchTerm) && trimmed.length < 50) {
          suggestions.add(trimmed);
        }
      });
    }

    // Add matching flavor profiles
    if (dish.flavorProfile) {
      const flavors = Array.isArray(dish.flavorProfile)
        ? dish.flavorProfile
        : dish.flavorProfile.split(/[,;]/);
      flavors.forEach(flavor => {
        const trimmed = String(flavor).trim();
        if (trimmed.toLowerCase().includes(searchTerm)) {
          suggestions.add(trimmed);
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, limit);
}
