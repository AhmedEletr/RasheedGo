// src/screens/SearchScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  Keyboard,
  Image,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24);

// Comprehensive list of alternative search phrases and categories
const SUGGESTION_POOL = [
  { id: 's1', type: 'place', ar: 'قلعة قايتباي رشيد', en: 'Qaitbay Fort Rosetta', subAr: 'معلم تاريخي وأثري', subEn: 'Historic Landmark' },
  { id: 's2', type: 'place', ar: 'حجر رشيد وموقع اكتشافه', en: 'Rosetta Stone Discovery Site', subAr: 'تاريخ وحضارة مصرية', subEn: 'Ancient Egyptian History' },
  { id: 's3', type: 'place', ar: 'منزل الأمصيلي الأثري', en: 'Al-Amasily Ottoman House', subAr: 'عمارة إسلامية ومشربيات', subEn: 'Ottoman Architecture' },
  { id: 's4', type: 'food', ar: 'مطاعم أسماك البوغاز', en: 'Boughaz Seafood Restaurants', subAr: 'مأكولات بحرية طازجة', subEn: 'Fresh Seafood Dining' },
  { id: 's5', type: 'place', ar: 'قصر كوتسيكا التراثي', en: 'Kotsika Heritage Palace', subAr: 'طراز معماري على النيل', subEn: 'Nile Corniche Architecture' },
  { id: 's6', type: 'experience', ar: 'رحلات اليخوت ومصب النيل والبحر', en: 'Nile Estuary Boat Cruises', subAr: 'جولات نيلية سياحية', subEn: 'River Tourism & Cruises' },
  { id: 's7', type: 'hotel', ar: 'فنادق وأماكن إقامة على كورنيش رشيد', en: 'Hotels on Rosetta Corniche', subAr: 'إقامة ومنتجعات', subEn: 'Hotels & Resorts' },
  { id: 's8', type: 'food', ar: 'مقهى الأرابيسك العثماني', en: 'Arabesque Ottoman Cafe', subAr: 'مقاهي شعبية وتراثية', subEn: 'Traditional Heritage Cafe' },
  { id: 's9', type: 'place', ar: 'مسجد المحلي الأثري رشيد', en: 'Al-Mahally Historic Mosque', subAr: 'مساجد وآثار إسلامية', subEn: 'Islamic Monument' },
  { id: 's10', type: 'experience', ar: 'ورش صناعة السفن واليخوت', en: 'Rosetta Shipyard Tours', subAr: 'حرف يدوية وتراثية', subEn: 'Handicraft & Shipbuilders' },
];

const INITIAL_HISTORY = [
  { id: 'h1', ar: 'قلعة قايتباي ورشيد ستون', en: 'Qaitbay Fort & Rosetta' },
  { id: 'h2', ar: 'مطعم أسماك البوغاز', en: 'Boughaz Seafood' },
  { id: 'h3', ar: 'منزل الأمصيلي', en: 'Al-Amasily Masterpiece' },
];

export default function SearchScreen({
  lang = 'ar',
  onBack,
  onSelectResult,
  properties = [],
}) {
  const isAr = lang === 'ar';
  const inputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [submittedQuery, setSubmittedQuery] = useState('');

  // Auto-focus immediately like YouTube search
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleApplyQuery = (queryText) => {
    setSearchQuery(queryText);
    setSubmittedQuery(queryText);
    Keyboard.dismiss();

    // Add to top of history
    setHistory((prev) => {
      const filtered = prev.filter((item) => (isAr ? item.ar : item.en) !== queryText);
      return [{ id: Date.now().toString(), ar: queryText, en: queryText }, ...filtered].slice(0, 8);
    });
  };

  const handleInsertQuery = (queryText) => {
    setSearchQuery(queryText);
    inputRef.current?.focus();
  };

  const handleDeleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Filter suggestion rows based on current input text
  const matchedSuggestions = searchQuery.trim()
    ? SUGGESTION_POOL.filter((item) => {
        const text = isAr ? item.ar : item.en;
        return text.toLowerCase().includes(searchQuery.trim().toLowerCase());
      })
    : [];

  // Filter actual content items if submitted
  const matchedProperties = submittedQuery.trim()
    ? properties.filter((item) => {
        const title = isAr ? item.titleAr : item.titleEn;
        const loc = isAr ? item.locationAr : item.locationEn;
        return (
          title?.toLowerCase().includes(submittedQuery.toLowerCase()) ||
          loc?.toLowerCase().includes(submittedQuery.toLowerCase())
        );
      })
    : [];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Search Bar (Swapped Search Button & Back Button + Squared Styling) */}
      <View style={styles.headerContainer}>
        <View style={[styles.headerRow, { flexDirection: isAr ? 'row' : 'row-reverse' }]}>
          {/* Search Action / Submit Button (Swapped to the original Back position) */}
          <TouchableOpacity
            style={styles.searchSubmitBtn}
            onPress={() => handleApplyQuery(searchQuery)}
            activeOpacity={0.75}
          >
            <Ionicons name="search" size={20} color="#0052CC" />
          </TouchableOpacity>

          {/* Search Input Box with Squared Border Radius */}
          <View style={[styles.inputBox, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
            <TextInput
              ref={inputRef}
              style={[styles.inputField, { textAlign: isAr ? 'right' : 'left' }]}
              placeholder={
                isAr
                  ? 'ابحث في رشيد، المعالم، المطاعم...'
                  : 'Search Rosetta, landmarks, dining...'
              }
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={(txt) => {
                setSearchQuery(txt);
                setSubmittedQuery(''); // Reset submitted view while typing
              }}
              onSubmitEditing={() => handleApplyQuery(searchQuery)}
              returnKeyType="search"
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSubmittedQuery('');
                  inputRef.current?.focus();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.clearBtn}
              >
                <Ionicons name="close" size={19} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Back Button (Swapped to the original Search position) */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Keyboard.dismiss();
              onBack();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Feather
              name={isAr ? 'arrow-right' : 'arrow-left'}
              size={22}
              color="#0F172A"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* RESULT CARDS VIEW (When user clicks Search) */}
      {submittedQuery.trim().length > 0 ? (
        <FlatList
          data={matchedProperties}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.resultsList}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={[styles.resultsHeaderRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
              <Text style={styles.resultsCountText}>
                {isAr
                  ? `نتائج البحث عن "${submittedQuery}" (${matchedProperties.length})`
                  : `Results for "${submittedQuery}" (${matchedProperties.length})`}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <Ionicons name="search-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>
                {isAr ? 'لم نعثر على نتائج مطابقة' : 'No matching results'}
              </Text>
              <Text style={styles.emptySub}>
                {isAr
                  ? 'جرب البحث بكلمات أخرى أو اختر من اقتراحات البحث البديلة'
                  : 'Try searching with different terms or select an alternative row'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.resultCard, { flexDirection: isAr ? 'row-reverse' : 'row' }]}
              activeOpacity={0.85}
              onPress={() => {
                if (onSelectResult) onSelectResult(item);
                onBack();
              }}
            >
              <Image
                source={{ uri: item.image || 'https://picsum.photos/id/1040/800/600' }}
                style={styles.resultImage}
              />
              <View style={[styles.resultInfo, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.resultTitle} numberOfLines={1}>
                  {isAr ? item.titleAr : item.titleEn}
                </Text>
                <View style={[styles.resultLocRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
                  <Ionicons name="location-sharp" size={13} color="#0052CC" />
                  <Text style={styles.resultLocText}>
                    {isAr ? item.locationAr : item.locationEn}
                  </Text>
                </View>
                {item.rating && (
                  <View style={[styles.ratingPill, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
                    <Ionicons name="star" size={11} color="#FFB800" />
                    <Text style={styles.ratingValue}>{item.rating}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        /* YOUTUBE-STYLE FULL WIDTH SEARCH ROWS */
        <FlatList
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.rowsContainer}
          data={
            searchQuery.trim().length > 0
              ? matchedSuggestions
              : [
                  ...history.map((h) => ({ ...h, isHistory: true })),
                  ...SUGGESTION_POOL.map((s) => ({ ...s, isTrending: true })),
                ]
          }
          keyExtractor={(item, index) => item.id || `row-${index}`}
          renderItem={({ item }) => {
            const rowText = isAr ? item.ar : item.en;
            const subText = isAr ? item.subAr : item.subEn;

            return (
              <TouchableOpacity
                style={[styles.searchRow, { flexDirection: isAr ? 'row' : 'row-reverse' }]}
                activeOpacity={0.65}
                onPress={() => handleApplyQuery(rowText)}
              >
                {/* Right/Left Icon (Clock for history, Trending arrow, or search) */}
                <View style={styles.rowIconContainer}>
                  {item.isHistory ? (
                    <MaterialIcons name="history" size={22} color="#64748B" />
                  ) : item.isTrending ? (
                    <Feather name="trending-up" size={18} color="#0052CC" />
                  ) : (
                    <Ionicons name="search-outline" size={18} color="#475569" />
                  )}
                </View>

                {/* Main Text Content */}
                <View style={[styles.rowTextContainer, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
                  <Text style={styles.rowPrimaryText} numberOfLines={1}>
                    {rowText}
                  </Text>
                  {subText && (
                    <Text style={styles.rowSecondaryText} numberOfLines={1}>
                      {subText}
                    </Text>
                  )}
                </View>

                {/* Trailing Icon: Delete if history, or Insert Arrow to fill search bar */}
                {item.isHistory ? (
                  <TouchableOpacity
                    style={styles.rowActionBtn}
                    onPress={() => handleDeleteHistoryItem(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.rowActionBtn}
                    onPress={() => handleInsertQuery(rowText)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather
                      name={isAr ? 'arrow-up-left' : 'arrow-up-right'}
                      size={17}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingTop: STATUSBAR_HEIGHT + 6,
    paddingBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10, // Squared border radius
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputBox: {
    flex: 1,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 10, // Squared border radius
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  searchSubmitBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10, // Squared border radius
    backgroundColor: '#EBF2FD',
    borderWidth: 1,
    borderColor: '#D0E1FD',
  },
  rowsContainer: {
    paddingVertical: 6,
  },
  searchRow: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F8FAFC',
  },
  rowIconContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextContainer: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  rowPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  rowSecondaryText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '400',
  },
  rowActionBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsList: {
    padding: 16,
    gap: 12,
  },
  resultsHeaderRow: {
    marginBottom: 8,
  },
  resultsCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    padding: 10,
    gap: 12,
    alignItems: 'center',
  },
  resultImage: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0B2B64',
    marginBottom: 4,
  },
  resultLocRow: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  resultLocText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  ratingPill: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B2B64',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});