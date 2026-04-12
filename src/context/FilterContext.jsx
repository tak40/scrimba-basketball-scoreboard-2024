import { createContext, useContext, useState, useCallback } from 'react';

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(['COLD']);

  const toggleAllergen = useCallback((allergen) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergen)) {
        return prev.filter(a => a !== allergen);
      }
      return [...prev, allergen];
    });
  }, []);

  const clearAllergens = useCallback(() => {
    setSelectedAllergens([]);
  }, []);

  const toggleCategory = useCallback((category) => {
    setExpandedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  }, []);

  const value = {
    selectedAllergens,
    setSelectedAllergens,
    toggleAllergen,
    clearAllergens,
    searchQuery,
    setSearchQuery,
    expandedCategories,
    toggleCategory,
    setExpandedCategories
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
