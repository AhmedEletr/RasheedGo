// src/screens/RestaurantsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { getRestaurants } from '../utils/dataLoader';

const STATUS_BAR_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 52;

// Backup data (kept for reference, but real data is loaded from dataLoader)
export const RESTAURANTS_DATA_BACKUP = [
  {
    id: 'r1',
    nameAr: 'مطعم أسماك البوغاز الشهير',
    nameEn: 'Al-Boughaz Seafood Tavern',
    descAr: 'أعرق مطاعم الأسماك والمأكولات البحرية الطازجة القادمة مباشرة من أسطول الصيد برشيد.',
    descEn: 'Rosetta’s iconic seafood dining featuring daily Mediterranean and Nile estuary catch.',
    storyAr: 'تأسس المطعم على يد عائلة من كبار صيادي رشيد في أربعينيات القرن الماضي بجوار مرسى مراكب الصيد. يشتهر المطعم بطهي أسماك الدنيس والقاروص والوقار والجمبري على الفحم البلدي، واستخدام خلطة تتبيل رشيدية سرية توارثتها الأجيال مع الخبز البلدي الساخن وطواجن فواكه البحر بالكريمة.',
    storyEn: 'Founded by a multi-generational Rosetta fishing family in the 1940s alongside the fishing docks. Renowned for open-flame charcoal grilling of fresh sea bass, sea bream, and colossal Mediterranean tiger prawns seasoned with local herb marinades.',
    addressAr: 'مرسى الصيد، شارع الكورنيش، رشيد',
    addressEn: 'Fishermen Port, Corniche Rd, Rosetta',
    openTimeAr: '١١:٠٠ ص - ٠١:٠٠ ص',
    openTimeEn: '11:00 AM - 01:00 AM',
    stars: 5,
    rating: '4.9',
    cuisineAr: 'مأكولات بحرية طازجة',
    cuisineEn: 'Fresh Seafood Catch',
    ticketPriceAr: 'متوسط الوجبة ١٥٠ - ٣٠٠ جنيه',
    ticketPriceEn: 'Avg Meal EGP 150 - 300',
    images: [
      'https://picsum.photos/id/1060/900/600',
      'https://picsum.photos/id/1068/900/600',
      'https://picsum.photos/id/1070/900/600',
      'https://picsum.photos/id/1047/900/600',
      'https://picsum.photos/id/1050/900/600',
    ],
    highlightsAr: [
      'صيد يومي طازج من البحر والنيل مباشرة',
      'طاجن البوغاز المخصوص بفواكه البحر المخلية',
      'جلسات مفتوحة تطل على حركة مراكب الصيد',
    ],
    highlightsEn: [
      'Daily morning catch directly off the Rosetta fleet',
      'Signature seafood tagine baked in rich cream sauce',
      'Harborside outdoor terrace observing fishing boats',
    ],
  },
  {
    id: 'r2',
    nameAr: 'مقهى ومطعم الأرابيسك العثماني',
    nameEn: 'Arabesque Courtyard & Grill',
    descAr: 'أطباق شرقية مشوية ومشروبات رشيدية مميزة داخل فناء أثري محاط بالمشربيات التاريخية.',
    descEn: 'Authentic charcoal grill and oriental coffee inside a restored 18th-century heritage courtyard.',
    storyAr: 'يقع داخل فناء منزل تاريخي يعود إلى أواخر العصر العثماني في قلب ميدان الحرية. يقدم تجربة طعام فريدة حيث يستمتع الزائر بأصوات خرير النافورة الرخامية ومشربيات الأرابيسك بينما تقدم له القهوة بالهيل وأطباق المشويات والكباب المتبل والمخبوزات الرشيدية الطازجة.',
    storyEn: 'Set within the private courtyard of a late Ottoman heritage house in Freedom Square. Diners sit around an ancient central fountain shaded by wooden mashrabiya while enjoying cardamom coffee, charcoal-grilled kebabs, and traditional pastries.',
    addressAr: 'ميدان الحرية، بجوار منزل الأمصيلي، رشيد',
    addressEn: 'Freedom Sq, near Amasily House, Rosetta',
    openTimeAr: '٠٩:٠٠ ص - ٠٢:٠٠ ص',
    openTimeEn: '09:00 AM - 02:00 AM',
    stars: 4,
    rating: '4.7',
    cuisineAr: 'مشويات ومقهى تراثي',
    cuisineEn: 'Grill & Heritage Cafe',
    ticketPriceAr: 'متوسط الوجبة ٨٠ - ١٨٠ جنيه',
    ticketPriceEn: 'Avg Meal EGP 80 - 180',
    images: [
      'https://picsum.photos/id/1068/900/600',
      'https://picsum.photos/id/1070/900/600',
      'https://picsum.photos/id/1050/900/600',
      'https://picsum.photos/id/1036/900/600',
      'https://picsum.photos/id/1040/900/600',
    ],
    highlightsAr: [
      'فناء عثماني أثري أصيل مع نافورة مياه عتيقة',
      'قهوة تركية ومشروب القرفة بالزنجبيل والنعناع الرشيدي',
      'مشويات كباب وكفتة على الفحم النباتي',
    ],
    highlightsEn: [
      'Authentic Ottoman courtyard with central fountain',
      'Traditional spiced coffees and fresh mint teas',
      'Prime chargrilled lamb kebabs and kofta',
    ],
  },
  {
    id: 'r3',
    nameAr: 'شواية نيل رشيد التراثية',
    nameEn: 'Rosetta Nile View Grill',
    descAr: 'جلسات عائلية ممتدة على شاطئ النيل مع تشكيلة من أشهى أطباق المطبخ البحراوي والمصري.',
    descEn: 'Open-air riverside dining serving Egyptian specialties with panoramic river breezes.',
    storyAr: 'تأسس المطعم على ممشى النيل السياحي ليقدم أشهى أطباق الطهي الريفي الخاص بمحافظة البحيرة؛ من طواجن الحمام المحشي بالأرز والخلطة والبط المسكوفي، إلى جانب طواجن الأرز المعمر بالقشطة الفلاحي والأسماك النيلية المشوية.',
    storyEn: 'Located on the scenic tourist promenade, this restaurant specializes in the culinary traditions of the Beheira Delta countryside. Famous for pigeon stuffed with seasoned rice, clay-pot creamy baked rice (Roz Meamar), and river fish.',
    addressAr: 'طريق الممشى السياحي، رشيد',
    addressEn: 'Tourist Promenade, Rosetta',
    openTimeAr: '١٢:٠٠ م - ١٢:٠٠ ص',
    openTimeEn: '12:00 PM - 12:00 Midnight',
    stars: 5,
    rating: '4.8',
    cuisineAr: 'أطباق مصرية وفلاحي',
    cuisineEn: 'Egyptian Countryside Grill',
    ticketPriceAr: 'متوسط الوجبة ١٠٠ - ٢٢٠ جنيه',
    ticketPriceEn: 'Avg Meal EGP 100 - 220',
    images: [
      'https://picsum.photos/id/1070/900/600',
      'https://picsum.photos/id/1060/900/600',
      'https://picsum.photos/id/1052/900/600',
      'https://picsum.photos/id/1047/900/600',
      'https://picsum.photos/id/1043/900/600',
    ],
    highlightsAr: [
      'طاجن الأرز المعمر الفلاحي بالقشطة الطبيعية',
      'جلسات مباشرة فوق النيل ومناسبة للعائلات',
      'خدمة سريعة مع خبز بلدي ساخن من الفرن مباشرة',
    ],
    highlightsEn: [
      'Traditional baked rice tagine with natural cream',
      'Over-the-water family dining pavilions',
      'Clay-oven bread baked fresh per table order',
    ],
  },
];

export default function RestaurantsScreen({ lang = 'ar', onBack, onRestaurantPress }) {
  const isAr = lang === 'ar';
  const [query, setQuery] = useState('');
  const [restaurantsData, setRestaurantsData] = useState([]);

  // Load real restaurants data on mount (includes restaurants + cafes)
  useEffect(() => {
    const restaurants = getRestaurants();
    setRestaurantsData(restaurants);
  }, []);

  const filtered = restaurantsData.filter((r) => {
    const text = isAr
      ? `${r.nameAr} ${r.addressAr} ${(r.searchTagsAr || []).join(' ')}`
      : `${r.nameEn} ${r.addressEn} ${(r.searchTags || []).join(' ')}`;
    return text.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFD" translucent={false} />

      {/* Top Bar */}
      <View style={[styles.topBar, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.75} onPress={onBack}>
          <Feather name={isAr ? 'arrow-right' : 'arrow-left'} size={20} color="#0052CC" />
        </TouchableOpacity>

        <View style={[styles.searchBox, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
          <Ionicons name="search" size={18} color="#0052CC" />
          <TextInput
            style={[styles.searchInput, { textAlign: isAr ? 'right' : 'left' }]}
            placeholder={isAr ? 'ابحث في مطاعم رشيد...' : 'Search Rosetta dining & seafood...'}
            placeholderTextColor="#8C9BB0"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={17} color="#A2B2C8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.titleHeader, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={styles.screenTitle}>{isAr ? 'مطاعم ومقاهي رشيد' : 'Restaurants & Cafes'}</Text>
          <Text style={styles.screenSubtitle}>
            {isAr ? 'أشهى المأكولات البحرية والنيلية التراثية' : 'Authentic seafood and local culinary gems'}
          </Text>
        </View>

        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.92}
            onPress={() => onRestaurantPress && onRestaurantPress(item)}
          >
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />
              <View style={[styles.cuisinePill, isAr ? { right: 12 } : { left: 12 }]}>
                <Text style={styles.cuisinePillText}>{isAr ? item.cuisineAr : item.cuisineEn}</Text>
              </View>
              <View style={[styles.ratingPill, isAr ? { left: 12 } : { right: 12 }]}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>

            <View style={[styles.cardBody, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
              <View style={[styles.headerRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
                <Text style={styles.cardTitle}>{isAr ? item.nameAr : item.nameEn}</Text>
                <View style={[styles.starsRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <Ionicons key={i} name="star" size={13} color="#FFB800" />
                  ))}
                </View>
              </View>

              <Text
                style={[styles.descText, { textAlign: isAr ? 'right' : 'left' }]}
                numberOfLines={2}
              >
                {isAr ? item.descAr : item.descEn}
              </Text>

              <View style={[styles.addressRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
                <Ionicons name="location-sharp" size={13} color="#0052CC" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {isAr ? item.addressAr : item.addressEn}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFD' },
  topBar: {
    paddingTop: STATUS_BAR_INSET,
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBF1FA',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D4E2F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flex: 1,
    height: 44,
    backgroundColor: '#F7FAFD',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D4E2F4',
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0B2B64', fontWeight: '600', marginHorizontal: 8 },
  listContent: { padding: 16, paddingBottom: 40 },
  titleHeader: { marginBottom: 14 },
  screenTitle: { fontSize: 22, fontWeight: '900', color: '#0B2B64' },
  screenSubtitle: { fontSize: 12.5, fontWeight: '500', color: '#687F9E', marginTop: 3 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2ECF8',
    overflow: 'hidden',
  },
  imageWrap: { width: '100%', height: 165, position: 'relative', backgroundColor: '#E5EEFA' },
  image: { width: '100%', height: '100%' },
  cuisinePill: {
    position: 'absolute',
    top: 10,
    backgroundColor: 'rgba(0, 82, 204, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  cuisinePillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  ratingPill: {
    position: 'absolute',
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 24, 56, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 14 },
  headerRow: { justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0B2B64', flex: 1 },
  starsRow: { gap: 2 },
  descText: { fontSize: 12, color: '#607289', marginTop: 6, lineHeight: 18 },
  addressRow: { alignItems: 'center', gap: 4, marginTop: 8 },
  addressText: { fontSize: 11.5, color: '#0052CC', fontWeight: '600' },
});