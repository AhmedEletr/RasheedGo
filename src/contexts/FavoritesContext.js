// src/contexts/FavoritesContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext();

const FAVORITES_STORAGE_KEY = '@nexova_favorites';

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setIsLoaded(true);
    }
  };

  const saveFavorites = async (newFavorites) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleFavorite = (itemId) => {
    setFavorites((prev) => {
      const newFavorites = { ...prev };
      if (newFavorites[itemId]) {
        delete newFavorites[itemId];
      } else {
        newFavorites[itemId] = true;
      }
      saveFavorites(newFavorites);
      return newFavorites;
    });
  };

  const isFavorite = (itemId) => {
    return !!favorites[itemId];
  };

  const getFavoriteIds = () => {
    return Object.keys(favorites);
  };

  const getFavoritesByType = (items, type) => {
    const favoriteIds = getFavoriteIds();
    const favoriteItems = items.filter(item => favoriteIds.includes(item.id));

    if (!type || type === 'all') {
      return favoriteItems;
    }

    return favoriteItems.filter(item => {
      // Handle both 'restaurant' and 'cafe' as 'restaurant' type
      if (type === 'restaurant') {
        return item.type === 'restaurant' || item.type === 'cafe' || item.category === 'restaurant' || item.category === 'cafe';
      }
      return item.type === type || item.category === type;
    });
  };

  const clearAllFavorites = async () => {
    setFavorites({});
    await saveFavorites({});
  };

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    getFavoriteIds,
    getFavoritesByType,
    clearAllFavorites,
    isLoaded,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

export default FavoritesContext;
