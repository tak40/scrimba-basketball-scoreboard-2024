import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRecipeById } from '../services/localData';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: recipe, isLoading, isError, error } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => fetchRecipeById(id)
  });

  const handleBack = () => navigate(-1);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-32 skeleton rounded-none" />
        <div className="p-4 space-y-4">
          <div className="h-8 skeleton w-3/4 rounded-xl" />
          <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
            <div className="h-4 skeleton w-full rounded" />
            <div className="h-4 skeleton w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || (!isLoading && !recipe)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Recipe not found</h2>
          <p className="text-gray-400 mb-6">{error?.message || 'This recipe may have been removed.'}</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl">
            ← Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white safe-area-bottom">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-100 to-violet-200 pt-16 pb-6 px-4 sm:px-6 safe-area-top">
        {/* Back button */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between safe-area-top">
          <button
            onClick={handleBack}
            className="flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-2 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm">Back</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center pt-4">
          <span className="text-5xl mb-3 block">🧪</span>
          <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-violet-500 text-white mb-3">
            {recipe.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{recipe.name}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          {/* Description */}
          {recipe.description && (
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📖</span>
                <h3 className="font-semibold text-gray-700">Description</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-[15px]">{recipe.description}</p>
            </div>
          )}

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🥢</span>
                <h3 className="font-bold text-gray-800 text-lg">Ingredients</h3>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-violet-500 mt-0.5">•</span>
                      <span className="text-gray-600">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Used In (dishes that use this recipe) */}
          {recipe.usedIn && recipe.usedIn.length > 0 && (
            <div className="bg-sky-50 rounded-2xl p-4 sm:p-5 border border-sky-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🍽️</span>
                <h3 className="font-semibold text-sky-800">Used In These Dishes</h3>
              </div>
              <div className="space-y-2">
                {recipe.usedIn.map((dishId, index) => (
                  <Link
                    key={index}
                    to={`/dish/${dishId}`}
                    className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl hover:bg-sky-100 transition-colors"
                  >
                    <span className="text-sky-600 font-bold">→</span>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {dishId.replace(/-/g, ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
