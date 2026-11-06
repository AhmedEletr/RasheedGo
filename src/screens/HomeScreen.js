import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24);
const STICKY_HEADER_HEIGHT = STATUSBAR_HEIGHT + 58;
const HERO_HEIGHT = 280;
const SCROLL_DISTANCE = 140;

const CARD_WIDTH = width - 48;
const CARD_SPACING = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

const FALLBACK_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80',
};
const HERO_LOCAL_IMAGE = require('../../assets/home.jpg');

/* ================= FEATURED SLIDES DATA ================= */
const FEATURED_SLIDES = [
  {
    id: 'slide-1',
    tagAr: 'معلم أثري',
    tagEn: 'Historic Landmark',
    titleAr: 'قصر كوتسيكا التراثي',
    titleEn: 'Kotsika Heritage Palace',
    subtitleAr: 'طراز معماري فريد يطل على كورنيش النيل برشيد',
    subtitleEn: 'Iconic architectural marvel on the Rosetta Corniche',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'slide-2',
    tagAr: 'تاريخ عريق',
    tagEn: 'Ancient History',
    titleAr: 'قلعة قايتباي ورشيد ستون',
    titleEn: 'Qaitbay Fort & Rosetta Stone',
    subtitleAr: 'حيث تم اكتشاف المفتاح لفك ألغاز الحضارة الفرعونية',
    subtitleEn: 'The historic site where the Rosetta Stone was discovered',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'slide-3',
    tagAr: 'عمارة إسلامية',
    tagEn: 'Islamic Heritage',
    titleAr: 'منزل الأمصيلي الأثري',
    titleEn: 'Al-Amasily Masterpiece',
    subtitleAr: 'روعة مشربيات الأرابيسك والعمارة العثمانية الخالدة',
    subtitleEn: 'Masterpiece of Ottoman woodwork and Islamic craft',
    image: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=1200&q=80',
  },
];

/* ================= HORIZONTAL SECTIONS DATA ================= */
const POPULAR_PLACES = [
  {
    id: 'p-1',
    titleAr: 'بيت قاضي رشيد',
    titleEn: 'Beit Al-Qadi',
    locationAr: 'حي الأتراك، رشيد',
    locationEn: 'Turk District, Rosetta',
    rating: '4.8',
    image: 'https://picsum.photos/id/1040/800/600',
  },
  {
    id: 'p-2',
    titleAr: 'منارة رشيد التاريخية',
    titleEn: 'Rosetta Lighthouse',
    locationAr: 'مدخل البوغاز، رشيد',
    locationEn: 'Boughaz Entrance, Rosetta',
    rating: '4.7',
    image: 'https://picsum.photos/id/1043/800/600',
  },
  {
    id: 'p-3',
    titleAr: 'نادي رشيد واليخوت',
    titleEn: 'Rosetta Sports & Marina',
    locationAr: 'كورنيش النيل، رشيد',
    locationEn: 'Corniche St, Rosetta',
    rating: '4.9',
    image: 'https://picsum.photos/id/1047/800/600',
  },
];

const POPULAR_HOTELS = [
  {
    id: 'h-1',
    titleAr: 'فندق بيوت رشيد التراثي',
    titleEn: 'Rosetta Heritage Inn',
    locationAr: 'وسط البلد القديمة',
    locationEn: 'Old Town Center',
    rating: '4.9',
    image: 'https://picsum.photos/id/1050/800/600',
  },
  {
    id: 'h-2',
    titleAr: 'منتجع كورنيش النيل',
    titleEn: 'Nile Corniche Resort',
    locationAr: 'طريق الكورنيش، رشيد',
    locationEn: 'Corniche Rd, Rosetta',
    rating: '4.7',
    image: 'https://picsum.photos/id/1052/800/600',
  },
  {
    id: 'h-3',
    titleAr: 'نزل البوغاز البوتيكي',
    titleEn: 'Al-Boughaz Boutique Hotel',
    locationAr: 'مصب النيل والبحر',
    locationEn: 'Nile Estuary Point',
    rating: '4.8',
    image: 'https://picsum.photos/id/1054/800/600',
  },
];

const POPULAR_RESTAURANTS = [
  {
    id: 'r-1',
    titleAr: 'مطعم أسماك البوغاز',
    titleEn: 'Boughaz Seafood Haven',
    locationAr: 'مرسى الصيد، رشيد',
    locationEn: 'Fishermen Port, Rosetta',
    rating: '4.9',
    image: 'https://picsum.photos/id/1060/800/600',
  },
  {
    id: 'r-2',
    titleAr: 'مقهى الأرابيسك العثماني',
    titleEn: 'Arabesque Heritage Cafe',
    locationAr: 'ميدان الحرية، رشيد',
    locationEn: 'Freedom Square, Rosetta',
    rating: '4.6',
    image: 'https://picsum.photos/id/1068/800/600',
  },
  {
    id: 'r-3',
    titleAr: 'شواية نيل رشيد',
    titleEn: 'Rosetta Nile Grill',
    locationAr: 'ممشى النيل السياحي',
    locationEn: 'Nile Promenade St',
    rating: '4.8',
    image: 'https://picsum.photos/id/1070/800/600',
  },
];

export default function HomeScreen({
  lang = 'ar',
  onNotificationPress,
  onProfilePress,
  onSearchPress,
  onSlidePress,
  onPlacePress,
  onToggleFav,
  onNavigateHotels,
  onNavigateRestaurants,
  onNavigateEvents,
  onNavigateMap,
  onNavigatePopularPlaces,
}) {
  const isAr = lang === 'ar';

  const [favorites, setFavorites] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  const sliderRef = useRef(null);
  const isUserTouchingRef = useRef(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const CATEGORIES = [
    {
      id: 'bed',
      icon: (color) => <Ionicons name="bed-outline" size={24} color={color} />,
      onPress: onNavigateHotels,
    },
    {
      id: 'restaurant',
      icon: (color) => <Ionicons name="restaurant-outline" size={23} color={color} />,
      onPress: onNavigateRestaurants,
    },
    {
      id: 'event',
      icon: (color) => <Ionicons name="calendar-outline" size={23} color={color} />,
      onPress: onNavigateEvents,
    },
    {
      id: 'map',
      icon: (color) => <Ionicons name="map-outline" size={23} color={color} />,
      onPress: onNavigateMap,
    },
  ];

  /* Auto carousel rotation */
  useEffect(() => {
    const timer = setInterval(() => {
      if (isUserTouchingRef.current) return;
      sliderRef.current?.scrollToOffset({
        offset:
          ((Math.round(scrollX._value / SNAP_INTERVAL) + 1) %
            FEATURED_SLIDES.length) *
          SNAP_INTERVAL,
        animated: true,
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [scrollX]);

  const handleToggleFav = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    if (onToggleFav) onToggleFav(id);
  };

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  /* Scroll-driven Hero Interpolations */
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [0, -35],
    extrapolate: 'clamp',
  });

  /* Search bar morph animation between hero and sticky header */
  const searchBarWidth = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [width - 32, width - 128],
    extrapolate: 'clamp',
  });

  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [HERO_HEIGHT - 44, STATUSBAR_HEIGHT + 4],
    extrapolate: 'clamp',
  });

  const stickyBgOpacity = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE * 0.6, SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const activeHeroSource = imageErrors['hero'] ? FALLBACK_IMAGE : HERO_LOCAL_IMAGE;

  const renderHorizontalSection = (
    title,
    items,
    showViewAll = false,
    onViewAllAction = null
  ) => (
    <View style={styles.sectionWrap}>
      <View
        style={[
          styles.sectionHeaderRow,
          { flexDirection: isAr ? 'row' : 'row-reverse' },
        ]}
      >
        {showViewAll ? (
          <TouchableOpacity
            style={styles.viewAllBtn}
            activeOpacity={0.7}
            onPress={onViewAllAction}
          >
            <Feather
              name={isAr ? 'chevron-left' : 'chevron-right'}
              size={15}
              color="#0052CC"
            />
            <Text style={styles.viewAllBtnText}>
              {isAr ? 'عرض الكل' : 'View all'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        <View
          style={[
            styles.titleGroup,
            { flexDirection: isAr ? 'row' : 'row-reverse' },
          ]}
        >
          <Text style={styles.sectionHeaderTitle}>{title}</Text>
          <View style={styles.titleVerticalBar} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.placesHorizontalContent,
          { flexDirection: isAr ? 'row-reverse' : 'row' },
        ]}
      >
        {items.map((item) => {
          const isFav = !!favorites[item.id];
          const imageUrl = imageErrors[item.id] ? FALLBACK_IMAGE.uri : item.image;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.placeCard}
              activeOpacity={0.9}
              onPress={() => onPlacePress && onPlacePress(item)}
            >
              <View style={styles.placeCoverContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.placeCoverImage}
                  resizeMode="cover"
                  onError={() => handleImageError(item.id)}
                />
                <TouchableOpacity
                  style={styles.placeFavBtn}
                  onPress={() => handleToggleFav(item.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isFav ? 'heart' : 'heart-outline'}
                    size={17}
                    color={isFav ? '#FF385C' : '#FFFFFF'}
                  />
                </TouchableOpacity>

                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color="#FFB800" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>

              <View
                style={[
                  styles.placeCardBody,
                  { alignItems: isAr ? 'flex-end' : 'flex-start' },
                ]}
              >
                <Text style={styles.placeCardTitle} numberOfLines={1}>
                  {isAr ? item.titleAr : item.titleEn}
                </Text>
                <View
                  style={[
                    styles.locationMetaRow,
                    { flexDirection: isAr ? 'row' : 'row-reverse' },
                  ]}
                >
                  <Ionicons
                    name="location-sharp"
                    size={12}
                    color="#0052CC"
                    style={isAr ? { marginLeft: 3 } : { marginRight: 3 }}
                  />
                  <Text style={styles.locationMetaText}>
                    {isAr ? item.locationAr : item.locationEn}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Fixed Sticky Header Overlay */}
      <Animated.View style={[styles.stickyHeaderOverlay, { opacity: stickyBgOpacity }]} />

      {/* Sticky Top Action Row: Profile & Notifications */}
      <View
        pointerEvents="box-none"
        style={[
          styles.stickyActionRow,
          { flexDirection: isAr ? 'row' : 'row-reverse' },
        ]}
      >
        <TouchableOpacity
          style={styles.squaredCurvedBtn}
          activeOpacity={0.85}
          onPress={onProfilePress}
        >
          <Ionicons name="person" size={19} color="#0052CC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.squaredCurvedBtn}
          activeOpacity={0.85}
          onPress={onNotificationPress}
        >
          <View style={styles.notifBadge} />
          <Ionicons name="notifications-outline" size={20} color="#0052CC" />
        </TouchableOpacity>
      </View>

      {/* Interactive Search Bar Trigger (Navigates to Full Search Screen) */}
      <Animated.View
        style={[
          styles.animatedSearchContainer,
          {
            width: searchBarWidth,
            transform: [{ translateY: searchBarTranslateY }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={onSearchPress}
          style={[
            styles.searchBox,
            { flexDirection: isAr ? 'row-reverse' : 'row' },
          ]}
        >
          <Ionicons name="search" size={19} color="#0052CC" />
          <Text
            style={[
              styles.searchPlaceholderText,
              { textAlign: isAr ? 'right' : 'left' },
            ]}
          >
            {isAr
              ? 'ابحث عن المعالم، الفنادق، المطاعم...'
              : 'Search For Anything...'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Scrollable Main Body */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroWrapper,
            { opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] },
          ]}
        >
          <Image
            source={activeHeroSource}
            style={styles.heroImage}
            resizeMode="cover"
            onError={() => handleImageError('hero')}
          />
        </Animated.View>

        {/* Curved Sheet Container */}
        <View style={styles.curvedSheetContainer}>
          <View style={styles.searchBarPlaceholder} />

          {/* 3 Featured Carousel Big Cards */}
          <View style={styles.carouselSection}>
            <Animated.FlatList
              ref={sliderRef}
              data={FEATURED_SLIDES}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              snapToAlignment="start"
              decelerationRate="fast"
              contentContainerStyle={styles.carouselListContent}
              keyExtractor={(item) => item.id}
              onTouchStart={() => {
                isUserTouchingRef.current = true;
              }}
              onTouchEnd={() => {
                isUserTouchingRef.current = false;
              }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
              renderItem={({ item, index }) => {
                const imageUrl = imageErrors[item.id] ? FALLBACK_IMAGE.uri : item.image;

                return (
                  <TouchableOpacity
                    activeOpacity={0.94}
                    onPress={() => onSlidePress && onSlidePress(item)}
                    style={styles.slideOuterContainer}
                  >
                    <ImageBackground
                      source={{ uri: imageUrl }}
                      style={styles.slideCard}
                      imageStyle={styles.slideCardImage}
                      resizeMode="cover"
                      onError={() => handleImageError(item.id)}
                    >
                      <View style={styles.slideVignette} />

                      <View style={styles.slideContentLayout}>
                        <View
                          style={[
                            styles.slideCardHeader,
                            { flexDirection: isAr ? 'row' : 'row-reverse' },
                          ]}
                        >
                          <View style={styles.slideBadge}>
                            <Text style={styles.slideBadgeText}>
                              {isAr ? item.tagAr : item.tagEn}
                            </Text>
                          </View>
                          <View style={styles.slideCounterPill}>
                            <Text style={styles.slideCounterText}>
                              {index + 1} / {FEATURED_SLIDES.length}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.slideTextBlock,
                            { alignItems: isAr ? 'flex-end' : 'flex-start' },
                          ]}
                        >
                          <Text style={styles.slideTitle} numberOfLines={1}>
                            {isAr ? item.titleAr : item.titleEn}
                          </Text>
                          <Text style={styles.slideSubtitle} numberOfLines={2}>
                            {isAr ? item.subtitleAr : item.subtitleEn}
                          </Text>

                          <View
                            style={[
                              styles.slideCtaPill,
                              { flexDirection: isAr ? 'row' : 'row-reverse' },
                            ]}
                          >
                            <Feather
                              name={isAr ? 'arrow-left' : 'arrow-right'}
                              size={14}
                              color="#0052CC"
                            />
                            <Text style={styles.slideCtaText}>
                              {isAr ? 'اكتشف المعلم' : 'Explore Monument'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                );
              }}
            />

            {/* Pagination Indicators */}
            <View style={styles.dotsIndicatorContainer}>
              {FEATURED_SLIDES.map((_, dotIdx) => {
                const dotInputRange = [
                  (dotIdx - 1) * SNAP_INTERVAL,
                  dotIdx * SNAP_INTERVAL,
                  (dotIdx + 1) * SNAP_INTERVAL,
                ];

                const dotWidth = scrollX.interpolate({
                  inputRange: dotInputRange,
                  outputRange: [7, 24, 7],
                  extrapolate: 'clamp',
                });

                const dotOpacity = scrollX.interpolate({
                  inputRange: dotInputRange,
                  outputRange: [0.35, 1, 0.35],
                  extrapolate: 'clamp',
                });

                const dotColor = scrollX.interpolate({
                  inputRange: dotInputRange,
                  outputRange: ['#B8CAE5', '#0052CC', '#B8CAE5'],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    key={dotIdx}
                    style={[
                      styles.rectangleDot,
                      {
                        width: dotWidth,
                        opacity: dotOpacity,
                        backgroundColor: dotColor,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* 4 Category Shortcuts */}
          <View
            style={[
              styles.categoryStrip,
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.squaredCategoryBox}
                activeOpacity={0.7}
                onPress={cat.onPress}
              >
                {cat.icon('#0052CC')}
              </TouchableOpacity>
            ))}
          </View>

          {/* Section: Popular Places */}
          {renderHorizontalSection(
            isAr ? 'أشهر الأماكن' : 'Popular Places',
            POPULAR_PLACES,
            true,
            onNavigatePopularPlaces
          )}

          {/* Section: Popular Hotels */}
          {renderHorizontalSection(
            isAr ? 'أشهر الفنادق' : 'Popular Hotels',
            POPULAR_HOTELS,
            false
          )}

          {/* Section: Popular Restaurants */}
          {renderHorizontalSection(
            isAr ? 'أشهر المطاعم' : 'Popular Restaurants',
            POPULAR_RESTAURANTS,
            false
          )}

          <View style={styles.bottomExtendedSpace} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#072852' },
  stickyHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: STICKY_HEADER_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBF1FA',
    zIndex: 90,
  },
  stickyActionRow: {
    position: 'absolute',
    top: STATUSBAR_HEIGHT + 4,
    left: 16,
    right: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  squaredCurvedBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D4E3F7',
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF385C',
  },
  animatedSearchContainer: { position: 'absolute', alignSelf: 'center', zIndex: 95 },
  searchBox: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D6E4F7',
    shadowColor: '#072852',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  searchPlaceholderText: {
    flex: 1,
    fontSize: 13.5,
    color: '#8C9BB0',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  heroWrapper: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: '#072852',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroBottomBlurContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  heroBlurClone: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: HERO_HEIGHT,
  },
  heroBlurTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 40, 82, 0.3)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  curvedSheetContainer: {
    backgroundColor: '#F7FAFD',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -26,
    paddingTop: 12,
  },
  searchBarPlaceholder: { height: 30, marginBottom: 8 },
  carouselSection: { marginTop: 6 },
  carouselListContent: { paddingHorizontal: 16 },
  slideOuterContainer: { width: CARD_WIDTH, marginRight: CARD_SPACING },
  slideCard: {
    height: 200,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#072852',
  },
  slideCardImage: {
    borderRadius: 22,
    width: '100%',
    height: '100%',
  },
  slideVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 20, 48, 0.44)',
  },
  slideContentLayout: { flex: 1, padding: 16, justifyContent: 'space-between' },
  slideCardHeader: { justifyContent: 'space-between', alignItems: 'center' },
  slideBadge: {
    backgroundColor: 'rgba(0, 82, 204, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  slideBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  slideCounterPill: {
    backgroundColor: 'rgba(7, 24, 56, 0.65)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  slideCounterText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  slideTextBlock: { justifyContent: 'flex-end' },
  slideTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  slideSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.94)',
    marginTop: 3,
  },
  slideCtaPill: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: 12,
    marginTop: 10,
    gap: 5,
  },
  slideCtaText: { fontSize: 11.5, fontWeight: '800', color: '#0052CC' },
  dotsIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
  },
  rectangleDot: {
    height: 6,
    borderRadius: 3.5,
  },
  categoryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginTop: 22,
    marginBottom: 6,
  },
  squaredCategoryBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D4E2F4',
  },
  sectionWrap: { marginTop: 24 },
  sectionHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF2FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 2,
  },
  viewAllBtnText: { fontSize: 12, fontWeight: '700', color: '#0052CC' },
  titleGroup: { alignItems: 'center', gap: 8 },
  sectionHeaderTitle: { fontSize: 18, fontWeight: '900', color: '#0B2B64' },
  titleVerticalBar: {
    width: 3.5,
    height: 16,
    backgroundColor: '#0052CC',
    borderRadius: 2,
  },
  placesHorizontalContent: { paddingHorizontal: 12, gap: 12 },
  placeCard: {
    width: width * 0.44,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EBF1FA',
    overflow: 'hidden',
  },
  placeCoverContainer: {
    width: '100%',
    height: 118,
    position: 'relative',
    backgroundColor: '#E5EEFA',
  },
  placeCoverImage: { width: '100%', height: '100%' },
  placeFavBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(7, 24, 56, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 23, 44, 0.72)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  ratingText: { color: '#FFFFFF', fontSize: 10.5, fontWeight: '700' },
  placeCardBody: { padding: 12 },
  placeCardTitle: { fontSize: 13.5, fontWeight: '800', color: '#0B2B64' },
  locationMetaRow: { alignItems: 'center', marginTop: 5 },
  locationMetaText: { fontSize: 11, fontWeight: '600', color: '#6E809A' },
  bottomExtendedSpace: { height: 80 },
});