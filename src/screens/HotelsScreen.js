// src/screens/HotelsScreen.js
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
import { getHotels } from '../utils/dataLoader';

const STATUS_BAR_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 52;

export const HOTELS_DATA = [
  {
    id: 'h1',
    nameAr: 'فندق بيوت رشيد التراثي البوتيكي',
    nameEn: 'Rosetta Heritage Boutique Hotel',
    descAr: 'إقامة فاخرة بنكهة عثمانية أصيلة في قلب حارة الأتراك، مع أسقف خشبية وأرابيسك يدوي متقن.',
    descEn: 'Authentic Ottoman architecture with handcrafted woodwork in the historic Turkish Quarter.',
    storyAr: 'يقع الفندق في قصر مرمم يرجع تاريخه لعام ١٨٢٠ ميلادي. تم تحويل غرفه التراثية إلى أجنحة ملكية تحافظ على الطوب الرشيدي المنجور الأحمر والأسود، مع توفير أحدث وسائل الراحة ووجبة إفطار تضم الفطير المشلتت والعسل الأسود الرشيدي على سطح يطل على مآذن المدينة العثمانية.',
    storyEn: 'Housed within a restored 1820s merchant estate. Rooms feature original interlocking Ottoman joinery and exposed brick masonry, combined with luxury boutique linens and breakfast served atop a rooftop terrace gazing across Rosetta’s historic minarets.',
    addressAr: 'شارع علي الجمل، حي الأتراك، رشيد',
    addressEn: 'Ali El-Gamal St, Turk District, Rosetta',
    stars: 5,
    rating: '4.9',
    price: 85,
    images: [
      'https://picsum.photos/id/1050/900/600',
      'https://picsum.photos/id/1052/900/600',
      'https://picsum.photos/id/1054/900/600',
      'https://picsum.photos/id/1060/900/600',
      'https://picsum.photos/id/1036/900/600',
    ],
    highlightsAr: [
      'أثاث عتيق من خشب الأرو والأرابيسك اليدوي',
      'إفطار ريفي رشيدي طازج مجاني على السطح',
      'جولات مشي تاريخية مجانية برفقة مرشد الفندق',
    ],
    highlightsEn: [
      'Handcrafted antique oak and mashrabiya furnishings',
      'Complimentary traditional Egyptian rooftop breakfast',
      'Curated private walking tours through the Old Town',
    ],
  },
  {
    id: 'h2',
    nameAr: 'منتجع كورنيش النيل واليخوت',
    nameEn: 'Nile Corniche Waterfront Resort',
    descAr: 'إطلالة بانورامية ساحرة على النيل الخالد قبل التقائه بالبحر المتوسط مباشرة.',
    descEn: 'Stunning direct waterfront rooms overlooking the Nile estuary and yacht marina.',
    storyAr: 'صمم المنتجع على الواجهة البحرية لكورنيش رشيد ليوفر للنزلاء تجربة فريدة تجمع بين هدوء النهر ورحلات الإبحار الخاصة. يتميز بمرسى خاص باليخوت وحدائق نخيل غناء، ومطاعم تقدم المأكولات البحرية الطازجة على رصيف ممتد فوق سطح الماء.',
    storyEn: 'Designed along Rosetta’s expansive river promenade, this resort provides a serene escape where the river breeze meets private yacht cruises. Features private berths, manicured date-palm gardens, and overwater dining pavilions.',
    addressAr: 'ممشى كورنيش النيل، رشيد',
    addressEn: 'Corniche Promenade, Rosetta',
    stars: 4,
    rating: '4.7',
    price: 110,
    images: [
      'https://picsum.photos/id/1052/900/600',
      'https://picsum.photos/id/1054/900/600',
      'https://picsum.photos/id/1060/900/600',
      'https://picsum.photos/id/1068/900/600',
      'https://picsum.photos/id/1070/900/600',
    ],
    highlightsAr: [
      'شرفات خاصة بإطلالة مباشرة ١٠٠٪ على النيل',
      'مرسى يخت خاص برحلات الغروب',
      'مسبح خارجي دافئ وسبا متكامل',
    ],
    highlightsEn: [
      '100% direct Nile-view private balconies',
      'Private yacht charter dock for sunset sails',
      'Heated outdoor pool and holistic wellness spa',
    ],
  },
  {
    id: 'h3',
    nameAr: 'نزل البوغاز البوتيكي البيئي',
    nameEn: 'Al-Boughaz Estuary Lodge',
    descAr: 'هدوء الطبيعة بين النخيل ومصب النيل، يوفر غرفاً عصرية متكاملة الخدمات ورحلات صيد خاصة.',
    descEn: 'Serene stay situated near the palm groves and the famous Nile-Mediterranean estuary.',
    storyAr: 'يقع النزل في أهدأ بقاع رشيد بالقرب من مزارع النخيل الكثيفة التي تشتهر بها محافظة البحيرة. يتبنى النزل مبادئ الاستدامة البيئية، وتصنع جدرانه من مواد طبيعية عازلة للحرارة، ويوفر لنزلائه قوارب صيد برفقة صيادي رشيد المخضرمين.',
    storyEn: 'Nestled between the lush palm oases and the estuary waters. Emphasizing sustainable eco-architecture, the lodge utilizes local thermal clay brick and organizes private sea-and-river angling expeditions with veteran Rosetta fishermen.',
    addressAr: 'طريق البوغاز الساحلي، رشيد',
    addressEn: 'Boughaz Coastal Rd, Rosetta',
    stars: 4,
    rating: '4.8',
    price: 70,
    images: [
      'https://picsum.photos/id/1054/900/600',
      'https://picsum.photos/id/1060/900/600',
      'https://picsum.photos/id/1068/900/600',
      'https://picsum.photos/id/1040/900/600',
      'https://picsum.photos/id/1029/900/600',
    ],
    highlightsAr: [
      'موقع هادئ وسط مزارع نخيل البلح الرشيدي',
      'رحلات صيد بالقوارب مجهزة بالكامل',
      'غرف صديقة للبيئة مع مأكولات عضوية طازجة',
    ],
    highlightsEn: [
      'Secluded amidst indigenous date-palm groves',
      'Fully-outfitted recreational fishing excursions',
      'Eco-conscious suites serving organic farm-to-table meals',
    ],
  },
];

export default function HotelsScreen({ lang = 'ar', onBack, onHotelPress }) {
  const isAr = lang === 'ar';
  const [query, setQuery] = useState('');
  const [hotelsData, setHotelsData] = useState([]);

  // Load real hotels data on mount
  useEffect(() => {
    const hotels = getHotels();
    setHotelsData(hotels);
  }, []);

  const filtered = hotelsData.filter((h) => {
    const text = isAr ? `${h.nameAr} ${h.addressAr}` : `${h.nameEn} ${h.addressEn}`;
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
            placeholder={isAr ? 'ابحث في فنادق رشيد...' : 'Search hotels in Rosetta...'}
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
          <Text style={styles.screenTitle}>{isAr ? 'فنادق وأماكن الإقامة' : 'Hotels & Stays'}</Text>
          <Text style={styles.screenSubtitle}>
            {isAr ? `${filtered.length} ${filtered.length === 1 ? 'فندق' : 'فنادق'} متاح` : `${filtered.length} ${filtered.length === 1 ? 'hotel' : 'hotels'} available`}
          </Text>
        </View>

        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.92}
            onPress={() => onHotelPress && onHotelPress(item)}
          >
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />
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

              <View style={[styles.footerRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
                <Text style={styles.priceText}>
                  ${item.price} <Text style={styles.nightText}>/ {isAr ? 'ليلة' : 'night'}</Text>
                </Text>
                <View style={styles.bookBadge}>
                  <Text style={styles.bookBadgeText}>{isAr ? 'احجز الآن' : 'Reserve'}</Text>
                </View>
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
  footerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F4FA',
  },
  priceText: { fontSize: 15, fontWeight: '900', color: '#0B2B64' },
  nightText: { fontSize: 11, fontWeight: '400', color: '#687F9E' },
  bookBadge: {
    backgroundColor: '#EBF2FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  bookBadgeText: { fontSize: 11.5, fontWeight: '800', color: '#0052CC' },
});