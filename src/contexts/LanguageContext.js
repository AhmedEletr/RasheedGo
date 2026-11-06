// src/contexts/LanguageContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

const LANGUAGE_STORAGE_KEY = '@nexova_language';

// Screens that should always be in English
const ENGLISH_ONLY_SCREENS = ['AIChatScreen', 'LiveChatScreen'];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ar');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language from AsyncStorage on mount
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored) {
        setLang(stored);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading language:', error);
      setIsLoaded(true);
    }
  };

  const saveLanguage = async (newLang) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const changeLanguage = async (newLang) => {
    setLang(newLang);
    await saveLanguage(newLang);
  };

  const isRTL = lang === 'ar';

  const getLanguageForScreen = (screenName) => {
    // Force English for AI Chat and Live Chat screens
    if (ENGLISH_ONLY_SCREENS.includes(screenName)) {
      return 'en';
    }
    return lang;
  };

  const value = {
    lang,
    setLang: changeLanguage,
    isRTL,
    isLoaded,
    getLanguageForScreen,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
