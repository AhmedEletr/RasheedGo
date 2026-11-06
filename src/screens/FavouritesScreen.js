import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME as IMPORTED_THEME } from '../constants/theme';
import { STRINGS } from '../constants/translations';

// Safe Theme Fallback for Standalone Testing
const THEME = {
  primary: '#0052CC',
  primaryLight: '#EBF2FD',
  bgCanvas: '#F7FAFD',
  cardBg: '#FFFFFF',
  textMain: '#0B2B64',
  textMuted: '#687F9E',
  borderSubtle: '#E2ECF8',
  ...IMPORTED_THEME,
};

const STATUS_BAR_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 14 : 54;

/* ================= IN-FILE MOCK DATA ================= */
const MOCK_FAVOURITES = [
  {
    id: 'fav-1',
    type: 'place',
    titleAr: 'قلعة قايتباي ورشيد ستون',
    titleEn: 'Qaitbay Fort & Rosetta Stone',
    locationAr: 'مدخل البوغاز، رشيد',
    locationEn: 'Boughaz Estuary, Rosetta',
    tagAr: 'معلم أثري',
    tagEn: 'Historic Fort',
    rating: '4.9',
    image: 'https://picsum.photos/id/1029/900/600',
    isFav: true,
  },
  {
    id: 'fav-2',
    type: 'hotel',
    titleAr: 'فندق بيوت رشيد التراثي',
    titleEn: 'Rosetta Heritage Boutique Inn',
    locationAr: 'حي الأتراك، رشيد',
    locationEn: 'Ottoman Quarter, Rosetta',
    tagAr: 'فندق بوتيكي',
    tagEn: 'Boutique Stay',
    pricePerNight: 85,
    rating: '4.9',
    image: 'https://picsum.photos/id/1050/900/600',
    isFav: true,
  },
  {
    id: 'fav-3',
    type: 'restaurant',
    titleAr: 'مطعم أسماك البوغاز الشهير',
    titleEn: 'Al-Boughaz Fresh Seafood',
    locationAr: 'مرسى الصيد، كورنيش رشيد',
    locationEn: 'Fishing Harbor, Rosetta',
    tagAr: 'مأكولات بحرية',
    tagEn: 'Seafood',
    rating: '4.8',
    image: 'https://picsum.photos/id/1060/900/600',
    isFav: true,
  },
  {
    id: 'fav-4',
    type: 'place',
    titleAr: 'منزل الأمصيلي الأثري',
    titleEn: 'Al-Amasily Masterpiece House',
    locationAr: 'وسط مدينة رشيد التاريخية',
    locationEn: 'Old Rosetta Center',
    tagAr: 'تراث عثماني',
    tagEn: 'Ottoman Architecture',
    rating: '4.8',
    image: 'https://picsum.photos/id/1036/900/600',
    isFav: true,
  },
  {
    id: 'fav-5',
    type: 'hotel',
    titleAr: 'نزل كورنيش النيل والأجنحة',
    titleEn: 'Nile Breeze Waterfront Suites',
    locationAr: 'شارع الكورنيش، رشيد',
    locationEn: 'Corniche Waterfront, Rosetta',
    tagAr: 'إطلالة نيلية',
    tagEn: 'Nile View',
    pricePerNight: 120,
    rating: '4.7',
    image: 'https://picsum.photos/id/1054/900/600',
    isFav: true,
  },
  {
    id: 'fav-6',
    type: 'restaurant',
    titleAr: 'مقهى ديوان الأرابيسك التراثي',
    titleEn: 'Arabesque Courtyard Cafe',
    locationAr: 'ميدان الحرية، رشيد',
    locationEn: 'Freedom Square, Rosetta',
    tagAr: 'مقهى شرقي',
    tagEn: 'Heritage Cafe',
    rating: '4.7',
    image: 'https://picsum.photos/id/1068/900/600',
    isFav: true,
  },
];

const FILTER_TABS = [
  { id: 'all', labelEn: 'All', labelAr: 'الكل' },
  { id: 'place', labelEn: 'Places', labelAr: 'الأماكن' },
  { id: 'hotel', labelEn: 'Hotels', labelAr: 'الفنادق' },
  { id: 'restaurant', labelEn: 'Restaurants', labelAr: 'المطاعم' },
];

export default function FavouritesScreen({
  lang = 'ar',
  properties = null,
  onToggleFav,
  onPlacePress,
}) {
  const t = STRINGS?.[lang] || {};
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState('all');
  const [localItems, setLocalItems] = useState(
    properties && properties.length > 0 ? properties : MOCK_FAVOURITES
  );

  const handleToggle = (id) => {
    if (onToggleFav) {
      onToggleFav(id);
    }
    // Update local state smoothly
    setLocalItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFav: !item.isFav } : item))
    );
  };

  // Base favourites pool
  const allFavs = localItems.filter((p) => p.isFav);

  // Filtered by selected tab
  const displayedItems =
    activeTab === 'all'
      ? allFavs
      : allFavs.filter((item) => item.type === activeTab);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bgCanvas} translucent={false} />

      {/* ================= HEADER ================= */}
      <View
        style={[
          styles.header,
          {
            paddingTop: STATUS_BAR_INSET,
            alignItems: isAr ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        <View style={[styles.headerRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
          <Text style={styles.title}>
            {t.favsTitle || (isAr ? 'المفضلة' : 'Saved Places')}
          </Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{allFavs.length}</Text>
          </View>
        </View>

        <Text style={[styles.subtitle, { textAlign: isAr ? 'right' : 'left' }]}>
          {isAr
            ? `${allFavs.length} معالم وأماكن تم حفظها لرحلتك القادمة`
            : `${allFavs.length} places saved to your Rosetta itinerary`}
        </Text>
      </View>

      {/* ================= 4 FILTER BUTTONS ================= */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.filterScrollContent,
            { flexDirection: isAr ? 'row-reverse' : 'row' },
          ]}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count =
              tab.id === 'all'
                ? allFavs.length
                : allFavs.filter((i) => i.type === tab.id).length;

            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.filterBtn,
                  isActive ? styles.filterBtnActive : styles.filterBtnInactive,
                  { flexDirection: isAr ? 'row-reverse' : 'row' },
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    isActive ? styles.filterBtnTextActive : styles.filterBtnTextInactive,
                  ]}
                >
                  {isAr ? tab.labelAr : tab.labelEn}
                </Text>

                <View
                  style={[
                    styles.filterBadge,
                    isActive ? styles.filterBadgeActive : styles.filterBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      isActive ? styles.filterBadgeTextActive : styles.filterBadgeTextInactive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ================= CARDS LIST ================= */}
      <ScrollView
        contentContainerStyle={styles.scrollList}
        showsVerticalScrollIndicator={false}
      >
        {displayedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-dislike-outline" size={32} color={THEME.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {isAr ? 'لا توجد عناصر في هذا التصنيف' : 'No saved items in this category'}
            </Text>
            <Text style={styles.emptyDesc}>
              {isAr
                ? 'لم تقم بحفظ أي أماكن تابعة لهذا التصنيف حتى الآن.'
                : 'You have not bookmarked any places in this category yet.'}
            </Text>
          </View>
        ) : (
          displayedItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.92}
              onPress={() => onPlacePress && onPlacePress(item)}
            >
              {/* Media Container */}
              <View style={styles.imageWrap}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode="cover"
                />

                {/* Rating Badge */}
                {item.rating && (
                  <View
                    style={[
                      styles.ratingBadge,
                      isAr ? { left: 12 } : { right: 12 },
                    ]}
                  >
                    <Ionicons name="star" size={11} color="#FFB800" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                )}

                {/* Un-favourite Button */}
                <TouchableOpacity
                  style={[
                    styles.heartBtn,
                    isAr ? { right: 12 } : { left: 12 },
                  ]}
                  onPress={() => handleToggle(item.id)}
                  activeOpacity={0.75}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="heart" size={17} color="#FF385C" />
                </TouchableOpacity>
              </View>

              {/* Card Body */}
              <View style={[styles.cardBody, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
                <Text
                  style={[styles.cardTitle, { textAlign: isAr ? 'right' : 'left' }]}
                  numberOfLines={1}
                >
                  {isAr ? item.titleAr : item.titleEn}
                </Text>

                <View
                  style={[
                    styles.locationRow,
                    { flexDirection: isAr ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Ionicons name="location-sharp" size={13} color={THEME.primary} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {isAr ? item.locationAr : item.locationEn}
                  </Text>
                </View>

                {/* Footer Meta Row */}
                <View
                  style={[
                    styles.cardFooterRow,
                    { flexDirection: isAr ? 'row-reverse' : 'row' },
                  ]}
                >
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>
                      {isAr ? item.tagAr : item.tagEn}
                    </Text>
                  </View>

                  {item.pricePerNight ? (
                    <Text style={styles.price}>
                      ${item.pricePerNight}{' '}
                      <Text style={styles.nightText}>/ {isAr ? 'ليلة' : 'night'}</Text>
                    </Text>
                  ) : (
                    <Text style={styles.entryHint}>
                      {isAr ? 'دخول متاح' : 'Open for Visit'}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgCanvas,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: THEME.bgCanvas,
  },
  headerRow: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 27,
    fontWeight: '900',
    color: THEME.textMain,
    letterSpacing: -0.5,
  },
  countPill: {
    backgroundColor: '#EBF2FD',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.primary,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },

  /* 4 FILTER TABS (ZERO SHADOWS, CRISP HAIRLINES) */
  filterSection: {
    marginBottom: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 8,
  },
  filterBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  filterBtnActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  filterBtnInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: THEME.borderSubtle,
  },
  filterBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
  },
  filterBtnTextInactive: {
    color: '#526987',
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterBadgeInactive: {
    backgroundColor: '#EEF4FC',
  },
  filterBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  filterBadgeTextInactive: {
    color: THEME.primary,
  },

  /* CARDS LIST (ZERO SHADOWS) */
  scrollList: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: THEME.cardBg,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: THEME.borderSubtle,
  },
  imageWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#E5EEFA',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EBF2FC',
    zIndex: 2,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 23, 44, 0.72)',
    paddingHorizontal: 7.5,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 3.5,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textMain,
    letterSpacing: -0.2,
  },
  locationRow: {
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  locationText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  cardFooterRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.borderSubtle,
  },
  categoryPill: {
    backgroundColor: '#EEF5FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.primary,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textMain,
  },
  nightText: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.textMuted,
  },
  entryHint: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A859',
  },

  /* EMPTY STATE */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EBF2FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4E2F6',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textMain,
  },
  emptyDesc: {
    fontSize: 13,
    color: THEME.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
    maxWidth: 270,
  },
});