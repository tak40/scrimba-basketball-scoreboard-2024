import { fetchDishes as fetchAirtableDishes, ALLERGEN_FIELDS } from './airtable';

// Fetch and merge data from both Airtable and notionDetails.json
export async function fetchMergedDishes() {
  // Fetch from both sources in parallel
  const [airtableDishes, notionData] = await Promise.all([
    fetchAirtableDishes().catch(err => {
      console.warn('Failed to fetch Airtable dishes:', err);
      return [];
    }),
    fetch('/notionDetails.json')
      .then(res => res.json())
      .catch(err => {
        console.warn('Failed to fetch Notion details:', err);
        return { dishes: [] };
      })
  ]);

  const notionDishes = notionData.dishes || [];

  // Create a map of Airtable dishes by name (normalized) for matching
  const airtableByName = new Map();
  airtableDishes.forEach(dish => {
    const normalizedName = normalizeName(dish.name);
    airtableByName.set(normalizedName, dish);
  });

  // Create a map of Notion dishes by name
  const notionByName = new Map();
  notionDishes.forEach(dish => {
    const normalizedName = normalizeName(dish.name);
    notionByName.set(normalizedName, dish);
  });

  // Merge: Start with all Airtable dishes, enrich with Notion data
  const mergedDishes = [];
  const processedNotionIds = new Set();

  // Process Airtable dishes
  airtableDishes.forEach(airtableDish => {
    const normalizedName = normalizeName(airtableDish.name);
    const notionDish = notionByName.get(normalizedName);

    if (notionDish) {
      processedNotionIds.add(notionDish.id);
      // Merge Airtable (has images, allergens) with Notion (has details)
      mergedDishes.push(mergeDish(airtableDish, notionDish));
    } else {
      // Airtable only - use as-is with inferred category
      mergedDishes.push({
        ...airtableDish,
        category: inferCategory(airtableDish),
        menuStatus: inferMenuStatus(airtableDish),
        source: 'airtable'
      });
    }
  });

  // Add Notion-only dishes (not in Airtable)
  notionDishes.forEach(notionDish => {
    if (!processedNotionIds.has(notionDish.id)) {
      // Create a dish object from Notion data
      mergedDishes.push(createDishFromNotion(notionDish));
    }
  });

  return mergedDishes;
}

// Normalize dish name for matching
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Merge Airtable dish with Notion data
function mergeDish(airtable, notion) {
  return {
    // Keep Airtable ID and core fields
    id: airtable.id,
    dishId: airtable.dishId,
    name: airtable.name,

    // Category and status from Notion (more accurate)
    category: notion.category || inferCategory(airtable),
    menuStatus: notion.menuStatus || inferMenuStatus(airtable),
    station: airtable.station || notion.station,

    // Use Airtable's spiel if available, fallback to Notion
    spielFull: airtable.spielFull || notion.spielFull,
    spielShort: airtable.spielShort || notion.spielShort,

    // Airtable has images and allergens
    image: airtable.image,
    allergens: airtable.allergens,
    allergenCount: airtable.allergenCount,
    price: airtable.price,

    // Notion has rich details
    cookingMethod: notion.cookingMethod,
    buildPlating: notion.buildPlating,
    ingredientGroups: notion.ingredientGroups,
    allergenNotes: notion.allergenNotes,
    flavorNotes: notion.flavorNotes,
    notes: notion.notes,
    serverNotes: notion.serverNotes,
    saucePrep: notion.saucePrep,

    // Keep raw data
    _raw: airtable._raw,
    _notionData: notion,
    source: 'merged'
  };
}

// Create a dish object from Notion-only data
function createDishFromNotion(notion) {
  // Build allergens object from allergenNotes
  const allergens = {};
  let allergenCount = 0;

  ALLERGEN_FIELDS.forEach(allergen => {
    allergens[allergen] = false;
  });

  // Parse allergenNotes to set allergen flags
  if (notion.allergenNotes && Array.isArray(notion.allergenNotes)) {
    notion.allergenNotes.forEach(note => {
      const lowerNote = note.toLowerCase();
      if (lowerNote.includes('gluten')) { allergens.Gluten = true; allergenCount++; }
      if (lowerNote.includes('dairy') || lowerNote.includes('butter') || lowerNote.includes('cream')) { allergens.Dairy = true; allergenCount++; }
      if (lowerNote.includes('shellfish') || lowerNote.includes('crustacean') || lowerNote.includes('shrimp') || lowerNote.includes('crab') || lowerNote.includes('lobster') || lowerNote.includes('prawn')) { allergens.Shellfish_Crustacean = true; allergenCount++; }
      if (lowerNote.includes('mollusk') || lowerNote.includes('scallop') || lowerNote.includes('clam') || lowerNote.includes('oyster') || lowerNote.includes('mussel')) { allergens.Shellfish_Mollusk = true; allergenCount++; }
      if (lowerNote.includes('soy')) { allergens.Soy = true; allergenCount++; }
      if (lowerNote.includes('sesame seed')) { allergens.Sesame_Seeds = true; allergenCount++; }
      if (lowerNote.includes('sesame oil')) { allergens.Sesame_Oil = true; allergenCount++; }
      if (lowerNote.includes('egg')) { allergens.Egg = true; allergenCount++; }
      if (lowerNote.includes('fish') || lowerNote.includes('salmon') || lowerNote.includes('tuna') || lowerNote.includes('fluke') || lowerNote.includes('kampachi') || lowerNote.includes('bonito')) { allergens.Fish = true; allergenCount++; }
      if (lowerNote.includes('peanut')) { allergens.Peanuts = true; allergenCount++; }
      if (lowerNote.includes('tree nut') || lowerNote.includes('almond') || lowerNote.includes('cashew') || lowerNote.includes('walnut') || lowerNote.includes('macadamia')) { allergens.Tree_Nuts = true; allergenCount++; }
      if (lowerNote.includes('garlic') || lowerNote.includes('allium') || lowerNote.includes('onion') || lowerNote.includes('shallot') || lowerNote.includes('leek') || lowerNote.includes('chive')) {
        allergens.Garlic = lowerNote.includes('garlic');
        allergens.Onion = lowerNote.includes('onion') || lowerNote.includes('shallot') || lowerNote.includes('leek') || lowerNote.includes('chive');
        allergenCount++;
      }
      if (lowerNote.includes('nightshade') || lowerNote.includes('pepper') || lowerNote.includes('tomato') || lowerNote.includes('togarashi') || lowerNote.includes('sriracha') || lowerNote.includes('serrano') || lowerNote.includes('jalapeño')) { allergens.Nightshade = true; allergenCount++; }
      if (lowerNote.includes('alcohol') || lowerNote.includes('sake') || lowerNote.includes('wine') || lowerNote.includes('mirin')) { allergens.Alcohol = true; allergenCount++; }
      if (lowerNote.includes('sulfite')) { allergens.Sulfites = true; allergenCount++; }
      if (lowerNote.includes('citrus') || lowerNote.includes('yuzu') || lowerNote.includes('lemon') || lowerNote.includes('lime') || lowerNote.includes('orange')) { allergens.Citrus = true; allergenCount++; }
      if (lowerNote.includes('cilantro')) { allergens.Cilantro = true; allergenCount++; }
      if (lowerNote.includes('avocado')) { allergens.Avocado = true; allergenCount++; }
      if (lowerNote.includes('mustard')) { allergens.Mustard = true; allergenCount++; }
      if (lowerNote.includes('celery')) { allergens.Celery = true; allergenCount++; }
    });
  }

  return {
    id: `notion_${notion.id}`,
    dishId: notion.id,
    name: notion.name,
    category: notion.category,
    menuStatus: notion.menuStatus,
    station: notion.station,
    spielFull: notion.spielFull,
    spielShort: notion.spielShort,
    image: null, // No image from Notion
    allergens,
    allergenCount,
    price: null,
    cookingMethod: notion.cookingMethod,
    buildPlating: notion.buildPlating,
    ingredientGroups: notion.ingredientGroups,
    allergenNotes: notion.allergenNotes,
    flavorNotes: notion.flavorNotes,
    notes: notion.notes,
    serverNotes: notion.serverNotes,
    saucePrep: notion.saucePrep,
    activeStatus: mapMenuStatusToActiveStatus(notion.menuStatus),
    _notionData: notion,
    source: 'notion'
  };
}

// Map menuStatus to Airtable's activeStatus format
function mapMenuStatusToActiveStatus(menuStatus) {
  switch (menuStatus) {
    case 'on_menu': return 'Active';
    case 'special': return 'Special';
    case 'weekend': return 'Weekend_Special';
    case 'seasonal': return 'Seasonal_Special';
    case 'archived': return 'Archived';
    default: return 'Active';
  }
}

// Infer category from Airtable dish
function inferCategory(dish) {
  const station = dish.station || '';
  const status = dish.activeStatus || '';

  // Check for archived first
  if (status === 'Archived') return 'ARCHIVED';

  // Map by station
  if (['Sushi', 'Salad'].includes(station)) return 'COLD';
  if (['Sauté', 'Saute', 'Grill', 'Tempura'].includes(station)) return 'HOT';
  if (['Pastry'].includes(station)) return 'DESSERTS';
  if (['Bar'].includes(station)) return 'BAR';

  return 'OTHER';
}

// Infer menuStatus from Airtable activeStatus
function inferMenuStatus(dish) {
  const status = dish.activeStatus || '';

  switch (status) {
    case 'Active': return 'on_menu';
    case 'Special': return 'special';
    case 'Weekend_Special': return 'weekend';
    case 'Seasonal_Special': return 'seasonal';
    case 'Archived': return 'archived';
    default: return 'on_menu';
  }
}

// Group dishes by category with on-menu first, then specials
export function groupDishesByNewCategory(dishes) {
  const categories = {
    COLD: { onMenu: [], specials: [] },
    HOT: { onMenu: [], specials: [] },
    DESSERTS: { onMenu: [], specials: [] },
    BAR: { onMenu: [], specials: [] },
    ARCHIVED: [],
    OTHER: { onMenu: [], specials: [] }
  };

  dishes.forEach(dish => {
    const category = dish.category || inferCategory(dish);
    const menuStatus = dish.menuStatus || inferMenuStatus(dish);

    if (category === 'ARCHIVED' || menuStatus === 'archived') {
      categories.ARCHIVED.push(dish);
    } else if (categories[category]) {
      if (menuStatus === 'on_menu') {
        categories[category].onMenu.push(dish);
      } else {
        // special, weekend, seasonal all go to specials
        categories[category].specials.push(dish);
      }
    } else {
      if (menuStatus === 'on_menu') {
        categories.OTHER.onMenu.push(dish);
      } else {
        categories.OTHER.specials.push(dish);
      }
    }
  });

  return categories;
}

// Filter dishes by allergens
export function filterDishesByAllergens(dishes, selectedAllergens) {
  if (!selectedAllergens || selectedAllergens.length === 0) {
    return dishes;
  }

  return dishes.filter(dish => {
    // Dish is safe if NONE of the selected allergens are present
    return !selectedAllergens.some(allergen => dish.allergens && dish.allergens[allergen]);
  });
}

// Search dishes
export function searchDishes(dishes, query) {
  if (!query || query.trim() === '') {
    return dishes;
  }

  const searchTerm = query.toLowerCase().trim();

  return dishes.filter(dish => {
    const name = (dish.name || '').toLowerCase();
    const spielShort = (dish.spielShort || '').toLowerCase();
    const spielFull = (dish.spielFull || '').toLowerCase();
    const flavorNotes = (dish.flavorNotes || '').toLowerCase();
    const station = (dish.station || '').toLowerCase();

    return (
      name.includes(searchTerm) ||
      spielShort.includes(searchTerm) ||
      spielFull.includes(searchTerm) ||
      flavorNotes.includes(searchTerm) ||
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
    if (dish.name.toLowerCase().includes(searchTerm)) {
      suggestions.add(dish.name);
    }
  });

  return Array.from(suggestions).slice(0, limit);
}
