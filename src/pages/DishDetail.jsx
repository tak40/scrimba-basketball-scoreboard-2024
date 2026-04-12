import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDish } from '../hooks/useAirtable';
import { ALLERGEN_FIELDS, ALLERGEN_DISPLAY_NAMES } from '../services/airtable';

// Get icon for station
const getStationIcon = (station) => {
  const s = station?.toLowerCase() || '';
  if (s.includes('cold') || s.includes('sushi') || s.includes('salad')) return '❄️';
  if (s.includes('hot') || s.includes('grill') || s.includes('saute') || s.includes('sauté')) return '🔥';
  if (s.includes('dessert') || s.includes('pastry')) return '🍮';
  if (s.includes('drink') || s.includes('bar')) return '🍸';
  if (s.includes('temp') || s.includes('fry')) return '🍤';
  return '🍽️';
};

// Status badge styles based on menuStatus
const getStatusStyle = (menuStatus, activeStatus) => {
  const status = menuStatus || activeStatus;
  if (status === 'archived' || status === 'Archived')
    return { bg: 'bg-gray-500', text: 'Archived', icon: '📦' };
  if (status === 'weekend' || status === 'Weekend_Special')
    return { bg: 'bg-purple-500', text: 'Weekend Special', icon: '🗓️' };
  if (status === 'seasonal' || status === 'Seasonal_Special')
    return { bg: 'bg-teal-500', text: 'Seasonal', icon: '✨' };
  if (status === 'special' || status === 'Special')
    return { bg: 'bg-amber-500', text: 'Off-Menu Special', icon: '⭐' };
  return { bg: 'bg-green-600', text: 'On Menu', icon: '📋' };
};

export default function DishDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: dish, isLoading: dishLoading, isError, error } = useDish(id);

  const handleBack = () => navigate(-1);

  const handleShare = async () => {
    if (navigator.share && dish) {
      try {
        await navigator.share({
          title: dish.name,
          text: dish.spielShort || `Check out ${dish.name} at Nobu Malibu`,
          url: window.location.href
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  // Loading state
  if (dishLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4]">
        <div className="h-[280px] skeleton bg-gray-200 rounded-none" />
        <div className="p-6 space-y-6">
          <div className="h-10 skeleton bg-gray-200 w-3/4 rounded-xl" />
          <div className="h-px bg-[#c9a96e]" />
          <div className="space-y-3">
            <div className="h-4 skeleton bg-gray-200 w-full rounded" />
            <div className="h-4 skeleton bg-gray-200 w-full rounded" />
            <div className="h-4 skeleton bg-gray-200 w-5/6 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || (!dishLoading && !dish)) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dish not found</h2>
          <p className="text-gray-500 mb-6">{error?.message || 'This dish may have been removed.'}</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-[#c9a96e] text-white font-semibold px-6 py-3 rounded-xl">
            ← Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  // Handle image
  const getImageUrl = () => {
    if (!dish.image) return null;
    if (typeof dish.image === 'string') return dish.image.trim() || null;
    if (typeof dish.image === 'object') return dish.image.full || dish.image.large || null;
    return null;
  };
  const imageUrl = getImageUrl();
  const hasImage = !!imageUrl;

  const flavorTags = dish.flavorProfile
    ? (Array.isArray(dish.flavorProfile) ? dish.flavorProfile : dish.flavorProfile.split(/[,;]/).map(f => f.trim())).filter(Boolean)
    : [];

  const status = getStatusStyle(dish.menuStatus, dish.activeStatus);

  // All data from merged dish object
  const {
    spielFull,
    spielShort,
    cookingMethod,
    buildPlating,
    ingredientGroups,
    allergenNotes,
    flavorNotes,
    notes: dishNotes,
    serverNotes,
    saucePrep,
    category
  } = dish;

  return (
    <div className="min-h-screen bg-[#f8f7f4] safe-area-bottom">
      {/* Hero Section */}
      <div className="relative">
        {hasImage ? (
          <div className="relative h-[280px] overflow-hidden">
            <img src={imageUrl} alt={dish.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="relative h-[280px] bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <span className="text-7xl opacity-40">{getStationIcon(dish.station)}</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        )}

        {/* Back/Share buttons - with generous top padding for notch */}
        <div className="absolute top-0 left-0 right-0 pt-16 px-4 pb-4 flex items-center justify-between safe-area-top z-10">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2.5 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm">Back</span>
          </button>
          <button
            onClick={handleShare}
            className="bg-white/95 backdrop-blur-sm text-gray-900 p-2.5 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        {/* Title, Price, Status */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
            {dish.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            {dish.price && (
              <span className="text-xl font-bold text-[#b8944f]">${typeof dish.price === 'number' ? dish.price.toFixed(0) : dish.price}</span>
            )}
            {dish.price && <span className="text-gray-300">|</span>}
            {dish.station && <span className="text-sm text-gray-600 font-medium">{dish.station}</span>}
            {category && <span className="text-sm text-gray-400">({category})</span>}
            <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${status.bg}`}>
              {status.icon} {status.text}
            </span>
          </div>
        </div>

        {/* Gold Divider */}
        <div className="border-t-2 border-[#c9a96e] my-6" />

        {/* Flavor Tags */}
        {flavorTags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {flavorTags.map((flavor, i) => (
              <span key={i} className="px-3 py-1 text-xs font-medium rounded-full bg-white text-gray-700 border border-gray-200 shadow-sm">
                {flavor}
              </span>
            ))}
          </div>
        )}

        {/* ===== SPIEL SECTION ===== */}
        {(spielFull || spielShort) && (
          <div className="space-y-5 mb-6">
            {spielFull && (
              <div>
                <h3 className="text-base font-bold text-[#8b6914] uppercase tracking-wide mb-3">Full Spiel</h3>
                <p className="text-gray-800 leading-relaxed text-lg">{spielFull}</p>
              </div>
            )}
            {spielShort && (
              <div>
                <h3 className="text-base font-bold text-gray-500 uppercase tracking-wide mb-3">Quick Spiel</h3>
                <p className="text-gray-700 leading-relaxed text-lg italic">{spielShort}</p>
              </div>
            )}
          </div>
        )}

        {/* ===== SERVER NOTES (Important for Guest Interaction) ===== */}
        {serverNotes && (
          <>
            <div className="border-t-2 border-[#c9a96e] my-6" />
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Server Notes
              </h3>
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                {serverNotes.important && (
                  <p className="text-amber-800 font-semibold text-base mb-4 pb-3 border-b border-amber-200">
                    {serverNotes.important}
                  </p>
                )}
                {serverNotes.guestInteraction && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-amber-700 uppercase mb-2">Guest Interaction</h4>
                    <ul className="space-y-2">
                      {serverNotes.guestInteraction.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                          <span className="text-amber-600 mt-0.5 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {serverNotes.spiceOptions && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-amber-700 uppercase mb-2">Spice Options</h4>
                    <ul className="space-y-1.5">
                      <li className="text-gray-700 text-sm"><strong>Rocoto:</strong> {serverNotes.spiceOptions.rocoto}</li>
                      <li className="text-gray-700 text-sm"><strong>Shiso Serrano:</strong> {serverNotes.spiceOptions.shisoSerrano}</li>
                      <li className="text-gray-700 text-sm"><strong>Yuzu Soy:</strong> {serverNotes.spiceOptions.yuzuSoy}</li>
                    </ul>
                  </div>
                )}
                {serverNotes.rubs && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-amber-700 uppercase mb-2">Rubs</h4>
                    <ul className="space-y-1.5">
                      <li className="text-gray-700 text-sm"><strong>Rocoto:</strong> {serverNotes.rubs.rocoto}</li>
                      <li className="text-gray-700 text-sm"><strong>Shiso Serrano:</strong> {serverNotes.rubs.shisoSerrano}</li>
                      <li className="text-gray-700 text-sm"><strong>Yuzu Soy:</strong> {serverNotes.rubs.yuzuSoy}</li>
                    </ul>
                  </div>
                )}
                {serverNotes.wellDoneRequest && (
                  <p className="text-gray-600 text-sm italic border-t border-amber-200 pt-3 mt-3">
                    <strong>Well-done request:</strong> {serverNotes.wellDoneRequest}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ===== SAUCE/COMPONENT PREP (Separate from cooking) ===== */}
        {saucePrep && (
          <>
            <div className="border-t-2 border-[#c9a96e] my-6" />
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🧪</span>
                Sauce & Component Prep
              </h3>
              <div className="space-y-4">
                {saucePrep.shisoRocotoButter && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-[#8b6914] mb-2">Shiso Rocoto Butter</h4>
                    <p className="text-gray-600 text-sm mb-2">{saucePrep.shisoRocotoButter.description}</p>
                    <ul className="space-y-1 mb-2">
                      {saucePrep.shisoRocotoButter.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                          <span className="text-[#c9a96e]">•</span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                    {saucePrep.shisoRocotoButter.note && (
                      <p className="text-amber-700 text-sm font-medium bg-amber-50 rounded-lg p-2 mt-2">
                        {saucePrep.shisoRocotoButter.note}
                      </p>
                    )}
                  </div>
                )}
                {saucePrep.rocotoSriracha && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-[#8b6914] mb-2">Rocoto Sriracha</h4>
                    <p className="text-gray-600 text-sm mb-2">{saucePrep.rocotoSriracha.description}</p>
                    <div className="mb-3">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Ingredients:</p>
                      <ul className="space-y-1">
                        {saucePrep.rocotoSriracha.ingredients.map((ing, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                            <span className="text-[#c9a96e]">•</span>
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {saucePrep.rocotoSriracha.process && (
                      <div className="mb-2">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Process:</p>
                        <ol className="space-y-1.5">
                          {saucePrep.rocotoSriracha.process.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                              <span className="flex-shrink-0 w-5 h-5 bg-[#c9a96e] text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {saucePrep.rocotoSriracha.note && (
                      <p className="text-gray-600 text-sm italic mt-2">{saucePrep.rocotoSriracha.note}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ===== COOKING METHOD SECTION ===== */}
        {cookingMethod && cookingMethod.length > 0 && (
          <>
            <div className="border-t-2 border-[#c9a96e] my-6" />
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">👨‍🍳</span>
                Cooking Method
              </h3>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <ol className="space-y-3">
                  {cookingMethod.map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-7 h-7 bg-[#c9a96e] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <p className="text-gray-800 text-base leading-relaxed pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </>
        )}

        {/* ===== BUILD & PLATING SECTION ===== */}
        {buildPlating && (Array.isArray(buildPlating) ? buildPlating.length > 0 : buildPlating.trim()) && (
          <>
            <div className="border-t-2 border-[#c9a96e] my-6" />
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🍽️</span>
                Build & Plating
              </h3>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <ol className="space-y-3">
                  {(Array.isArray(buildPlating) ? buildPlating : buildPlating.split('\n').filter(Boolean)).map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-7 h-7 bg-[#c9a96e] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <p className="text-gray-800 text-base leading-relaxed pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </>
        )}

        {/* ===== COMPLETE INGREDIENTS SECTION ===== */}
        {ingredientGroups && ingredientGroups.length > 0 && (
          <>
            <div className="border-t-2 border-[#c9a96e] my-6" />
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🥢</span>
                Complete Ingredients
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ingredientGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-[#8b6914] mb-3 pb-2 border-b border-[#c9a96e]/30">
                      {group.label}
                    </h4>
                    {group.items && group.items.length > 0 ? (
                      <ul className="space-y-2">
                        {group.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 text-gray-700 text-base">
                            <span className="text-[#c9a96e] mt-0.5 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 text-base italic">Component only</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== FLAVOR NOTES SECTION ===== */}
        {flavorNotes && (
          <>
            <div className="border-t-2 border-[#c9a96e] my-6" />
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">✨</span>
                Flavor Notes
              </h3>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <p className="text-gray-800 leading-relaxed text-lg">{flavorNotes}</p>
              </div>
            </div>
          </>
        )}

        {/* ===== ALLERGEN INFORMATION SECTION ===== */}
        <div className="border-t-2 border-[#c9a96e] my-6" />
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            Allergen Information
            <span className="ml-auto text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {dish.allergenCount || 0} present
            </span>
          </h3>
          {dish.allergens && (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 mb-4">
              {ALLERGEN_FIELDS.map((allergen) => {
                const hasAllergen = dish.allergens[allergen];
                return (
                  <div
                    key={allergen}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl min-h-[50px] ${
                      hasAllergen ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className={`text-lg font-bold ${hasAllergen ? 'text-red-600' : 'text-gray-300'}`}>
                      {hasAllergen ? '✓' : '✗'}
                    </span>
                    <span className={`text-[10px] text-center leading-tight font-medium ${hasAllergen ? 'text-red-700' : 'text-gray-400'}`}>
                      {ALLERGEN_DISPLAY_NAMES[allergen]?.replace(/[()]/g, '').split(' ')[0] || allergen}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-gray-500">
            <span className="text-red-600 font-bold">✓</span> = Contains allergen • <span className="text-gray-400">✗</span> = Safe
          </p>
        </div>

        {/* ===== ALLERGEN CONTEXT NOTES ===== */}
        {allergenNotes && allergenNotes.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Allergen Context</h4>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <ul className="space-y-1.5">
                {allergenNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                    <span className="text-[#c9a96e] mt-0.5 font-bold">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ===== SERVICE NOTES / ADDITIONAL NOTES ===== */}
        {(dish.serviceNotes || dishNotes) && (
          <>
            <div className="border-t-2 border-[#c9a96e] my-6" />
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Notes
              </h3>
              <div className="bg-white rounded-2xl p-5 border border-[#c9a96e]/50 shadow-sm space-y-4">
                {dish.serviceNotes && (
                  <div className="space-y-3">
                    {dish.serviceNotes.split(/(?:\. (?=[A-Z])|\n)/).filter(Boolean).map((para, i) => (
                      <p key={i} className="text-gray-800 leading-relaxed text-lg">{para.trim()}{!para.trim().endsWith('.') ? '.' : ''}</p>
                    ))}
                  </div>
                )}
                {dishNotes && (
                  <div className="space-y-3">
                    {dishNotes.split(/(?:\. (?=[A-Z])|\n)/).filter(Boolean).map((para, i) => (
                      <p key={i} className="text-gray-700 leading-relaxed text-lg">{para.trim()}{!para.trim().endsWith('.') ? '.' : ''}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ===== LINKED RECIPES ===== */}
        {dish.linkedRecipes && dish.linkedRecipes.length > 0 && (
          <>
            <div className="border-t-2 border-[#c9a96e] my-6" />
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🔗</span>
                Related Recipes
              </h3>
              <div className="space-y-2">
                {(typeof dish.linkedRecipes === 'string'
                  ? dish.linkedRecipes.split(',').map(r => r.trim())
                  : dish.linkedRecipes
                ).map((recipeId, index) => (
                  <Link
                    key={index}
                    to={`/recipe/${recipeId}`}
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-[#c9a96e] transition-colors shadow-sm"
                  >
                    <span className="text-[#c9a96e] font-bold">→</span>
                    <span className="text-sm font-medium text-gray-800">{recipeId}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
