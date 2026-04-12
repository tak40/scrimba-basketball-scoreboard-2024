const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const API_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
const DISHES_TABLE = import.meta.env.VITE_DISHES_TABLE || 'DISHES';
const RECIPES_TABLE = import.meta.env.VITE_RECIPES_TABLE || 'RECIPES';

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${BASE_ID}`;

// All allergen fields in the database
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

// Display names for allergens
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

// Station categories mapping - maps Airtable stations to display categories
export const STATION_CATEGORIES = {
  'SPECIALS': ['Special', 'Seasonal_Special', 'Weekend_Special'],
  'COLD': ['Sushi', 'Salad', 'Cold'],
  'HOT': ['Sauté', 'Saute', 'Grill', 'Tempura', 'Hot'],
  'DESSERTS': ['Pastry', 'Dessert'],
  'DRINKS': ['Bar', 'Drink', 'Drinks']
};

// Helper to extract image URL from Airtable attachments
function extractImageUrl(attachments) {
  if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
    return null;
  }
  // Get the first image
  const firstImage = attachments[0];
  // Prefer thumbnails for cards, full URL for detail view
  return {
    full: firstImage.url,
    large: firstImage.thumbnails?.large?.url || firstImage.url,
    small: firstImage.thumbnails?.small?.url || firstImage.url,
    filename: firstImage.filename
  };
}

// Transform Airtable record to dish object
function transformDishRecord(record) {
  const fields = record.fields;

  // Count allergens present in this dish
  const allergenCount = ALLERGEN_FIELDS.filter(
    allergen => fields[allergen] === true
  ).length;

  // Build allergens object
  const allergens = {};
  ALLERGEN_FIELDS.forEach(allergen => {
    allergens[allergen] = fields[allergen] === true;
  });

  return {
    id: record.id,
    dishId: fields.Dish_ID,
    name: fields.Dish_Name || 'Unnamed Dish',
    station: fields.Station || 'Unknown',
    activeStatus: fields.Active_Status,
    price: fields.Price,
    spielFull: fields.Spiel_Full,
    spielShort: fields.Spiel_Short,
    flavorProfile: fields.Flavor_Profile,
    completeIngredients: fields.Complete_Ingredients,
    serviceNotes: fields.Service_Notes,
    sellingTips: fields.Selling_Tips,
    linkedRecipes: fields.Linked_Recipes || [],
    image: extractImageUrl(fields.Dish_Image),
    allergens,
    allergenCount,
    // Keep raw fields for any additional data
    _raw: fields
  };
}

// Transform Airtable record to recipe object
function transformRecipeRecord(record) {
  const fields = record.fields;

  return {
    id: record.id,
    recipeId: fields.Recipe_ID,
    name: fields.Recipe_Name || 'Unnamed Recipe',
    ingredients: fields.Ingredients,
    instructions: fields.Instructions,
    notes: fields.Notes,
    linkedDishes: fields.Linked_Dishes || [],
    _raw: fields
  };
}

// Fetch all records from a table with pagination
async function fetchAllRecords(tableName, transform) {
  const records = [];
  let offset = null;

  do {
    const url = new URL(`${AIRTABLE_API_URL}/${encodeURIComponent(tableName)}`);
    if (offset) {
      url.searchParams.set('offset', offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to fetch ${tableName}`);
    }

    const data = await response.json();
    records.push(...data.records.map(transform));
    offset = data.offset;
  } while (offset);

  return records;
}

// Fetch all dishes
export async function fetchDishes() {
  return fetchAllRecords(DISHES_TABLE, transformDishRecord);
}

// Fetch all recipes
export async function fetchRecipes() {
  return fetchAllRecords(RECIPES_TABLE, transformRecipeRecord);
}

// Fetch a single dish by ID
export async function fetchDishById(id) {
  const url = `${AIRTABLE_API_URL}/${encodeURIComponent(DISHES_TABLE)}/${id}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch dish');
  }

  const record = await response.json();
  return transformDishRecord(record);
}

// Fetch a single recipe by ID
export async function fetchRecipeById(id) {
  const url = `${AIRTABLE_API_URL}/${encodeURIComponent(RECIPES_TABLE)}/${id}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch recipe');
  }

  const record = await response.json();
  return transformRecipeRecord(record);
}

// Get category for a dish based on station
export function getDishCategory(dish) {
  const status = dish.activeStatus;

  // Specials are handled specially with subsections
  if (status === 'Special' || status === 'Seasonal_Special' || status === 'Weekend_Special') {
    return 'SPECIALS';
  }

  // Archived dishes go to OTHER or can be filtered out
  if (status === 'Archived') {
    return 'ARCHIVED';
  }

  const station = dish.station || '';

  // Map stations to categories
  if (['Sushi', 'Salad'].includes(station)) return 'COLD';
  if (['Sauté', 'Saute', 'Grill', 'Tempura'].includes(station)) return 'HOT';
  if (['Pastry'].includes(station)) return 'DESSERTS';
  if (['Bar'].includes(station)) return 'DRINKS';

  return 'OTHER';
}

// Group dishes by category
export function groupDishesByCategory(dishes) {
  const categories = {
    SPECIALS: { regular: [], seasonal: [], weekend: [] },
    COLD: [],
    HOT: [],
    DESSERTS: [],
    DRINKS: [],
    ARCHIVED: [],
    OTHER: []
  };

  dishes.forEach(dish => {
    const category = getDishCategory(dish);

    if (category === 'SPECIALS') {
      if (dish.activeStatus === 'Seasonal_Special') {
        categories.SPECIALS.seasonal.push(dish);
      } else if (dish.activeStatus === 'Weekend_Special') {
        categories.SPECIALS.weekend.push(dish);
      } else {
        categories.SPECIALS.regular.push(dish);
      }
    } else if (category === 'ARCHIVED') {
      categories.ARCHIVED.push(dish);
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
      const ingredients = dish.completeIngredients.split(/[,;]/);
      ingredients.forEach(ingredient => {
        const trimmed = ingredient.trim();
        if (trimmed.toLowerCase().includes(searchTerm)) {
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
