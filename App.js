// App.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import SplashScreen from './src/screens/SplashScreen';
import GetStartedScreen from './src/screens/GetStartedScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import DetailScreen from './src/screens/DetailScreen';
import FavouritesScreen from './src/screens/FavouritesScreen';
import AIChatScreen from './src/screens/AIChatScreen';
import LiveChatScreen from './src/screens/LiveChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BottomNavBar from './src/components/BottomNavBar';

// Sub-Screens
import HotelsScreen from './src/screens/HotelsScreen';
import RestaurantsScreen from './src/screens/RestaurantsScreen';
import EventsScreen from './src/screens/EventsScreen';
import MapScreen from './src/screens/MapScreen';
import PopularPlacesScreen from './src/screens/PopularPlacesScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

// Context Providers
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { LanguageProvider } from './src/contexts/LanguageContext';

// Terms & Privacy Screens (will be created next)
import TermsScreen from './src/screens/TermsScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [activeTab, setActiveTab] = useState('home');
  const [subScreen, setSubScreen] = useState(null); // 'search' | 'hotels' | 'restaurants' | 'events' | 'map' | 'popularPlaces' | 'notifications' | 'detail' | 'liveVoice' | 'terms' | 'privacy' | null
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [chatInitialPrompt, setChatInitialPrompt] = useState(null);
  const [lang, setLang] = useState('ar');

  const openDetail = (item) => {
    setSelectedDetailItem(item);
    setSubScreen('detail');
  };

  const handleAskAI = (item) => {
    const title = lang === 'ar' ? (item.nameAr || item.titleAr) : (item.nameEn || item.titleEn);
    const prompt =
      lang === 'ar'
        ? `اشرح لي بالتفصيل عن "${title}" في رشيد، تاريخه وأسراره التراثية وما يجب أن أعرفه عنه كزائر.`
        : `Explain in detail about "${title}" in Rosetta, its history, architectural secrets, and what I should know as a visitor.`;

    setChatInitialPrompt(prompt);
    setSubScreen(null);
    setActiveTab('chat');
  };

  // Favorites are now managed by FavoritesContext

  const handleLogOut = () => {
    setSubScreen(null);
    setSelectedDetailItem(null);
    setChatInitialPrompt(null);
    setActiveTab('home');
    setCurrentScreen('auth');
  };

  return (
    <LanguageProvider>
      <FavoritesProvider>
        <View style={styles.container}>
      {/* 1. Onboarding & Auth Flow */}
      {currentScreen === 'splash' && (
        <SplashScreen lang={lang} onFinish={() => setCurrentScreen('getStarted')} />
      )}

      {currentScreen === 'getStarted' && (
        <GetStartedScreen
          lang={lang}
          setLang={setLang}
          onContinue={() => setCurrentScreen('auth')}
        />
      )}

      {currentScreen === 'auth' && (
        <AuthScreen
          lang={lang}
          onAuthSuccess={() => {
            setActiveTab('home');
            setCurrentScreen('app');
          }}
        />
      )}

      {/* 2. Main Application Flow */}
      {currentScreen === 'app' && (
        <View style={{ flex: 1 }}>
          {/* Master Detail Screen */}
          {subScreen === 'detail' && selectedDetailItem && (
            <DetailScreen
              lang={lang}
              item={selectedDetailItem}
              onBack={() => setSubScreen(null)}
              onAskAI={handleAskAI}
            />
          )}

          {/* Dedicated Full Search Screen */}
          {subScreen === 'search' && (
            <SearchScreen
              lang={lang}
              onBack={() => setSubScreen(null)}
              onSelectResult={(item) => openDetail(item)}
            />
          )}

          {/* Terms & Privacy Screens */}
          {subScreen === 'terms' && (
            <TermsScreen lang={lang} onBack={() => setSubScreen(null)} />
          )}

          {subScreen === 'privacy' && (
            <PrivacyScreen lang={lang} onBack={() => setSubScreen(null)} />
          )}

          {/* DEDICATED FULL-SCREEN LIVE VOICE MODE (NO FAKE NOTCH, OPENS AS FULL SCREEN) */}
          {subScreen === 'liveVoice' && (
            <LiveChatScreen
              onBack={() => setSubScreen(null)}
              onSwitchToKeyboard={() => {
                setSubScreen(null);
                setActiveTab('chat');
              }}
            />
          )}

          {/* Sub-Screens with Detail Routing */}
          {subScreen === 'hotels' && (
            <HotelsScreen
              lang={lang}
              onBack={() => setSubScreen(null)}
              onHotelPress={(hotel) => openDetail(hotel)}
            />
          )}

          {subScreen === 'restaurants' && (
            <RestaurantsScreen
              lang={lang}
              onBack={() => setSubScreen(null)}
              onRestaurantPress={(restaurant) => openDetail(restaurant)}
            />
          )}

          {subScreen === 'events' && (
            <EventsScreen
              lang={lang}
              onBack={() => setSubScreen(null)}
              onEventPress={(event) => openDetail(event)}
            />
          )}

          {subScreen === 'popularPlaces' && (
            <PopularPlacesScreen
              lang={lang}
              onBack={() => setSubScreen(null)}
              onPlacePress={(place) => openDetail(place)}
            />
          )}

          {subScreen === 'map' && (
            <MapScreen lang={lang} onBack={() => setSubScreen(null)} />
          )}

          {subScreen === 'notifications' && (
            <NotificationsScreen lang={lang} onBack={() => setSubScreen(null)} />
          )}

          {/* Core Tab Screens */}
          {!subScreen && (
            <>
              {activeTab === 'home' && (
                <HomeScreen
                  lang={lang}
                  onSearchPress={() => setSubScreen('search')}
                  onSlidePress={(slide) => openDetail(slide)}
                  onPlacePress={(place) => openDetail(place)}
                  onProfilePress={() => setActiveTab('profile')}
                  onNotificationPress={() => setSubScreen('notifications')}
                  onNavigateHotels={() => setSubScreen('hotels')}
                  onNavigateRestaurants={() => setSubScreen('restaurants')}
                  onNavigateEvents={() => setSubScreen('events')}
                  onNavigateMap={() => setSubScreen('map')}
                  onNavigatePopularPlaces={() => setSubScreen('popularPlaces')}
                />
              )}

              {activeTab === 'favs' && (
                <FavouritesScreen
                  lang={lang}
                  onItemPress={(item) => openDetail(item)}
                />
              )}

              {activeTab === 'chat' && (
                <AIChatScreen
                  lang={lang}
                  onBack={() => setActiveTab('home')}
                  initialPrompt={chatInitialPrompt}
                  onClearInitialPrompt={() => setChatInitialPrompt(null)}
                  onOpenLiveVoice={() => setSubScreen('liveVoice')}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsScreen
                  lang={lang}
                  setLang={setLang}
                  onNavigateProfile={() => setActiveTab('profile')}
                  onNavigateTerms={() => setSubScreen('terms')}
                  onNavigatePrivacy={() => setSubScreen('privacy')}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileScreen
                  lang={lang}
                  onBack={() => setActiveTab('home')}
                  onLogOut={handleLogOut}
                />
              )}
            </>
          )}

          {/* Floating Bottom Nav */}
          {!subScreen && activeTab !== 'chat' && activeTab !== 'profile' && (
            <BottomNavBar
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setSubScreen(null);
                setActiveTab(tab);
              }}
              lang={lang}
            />
          )}
        </View>
      )}
        </View>
      </FavoritesProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
});