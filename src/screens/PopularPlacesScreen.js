// src/screens/PopularPlacesScreen.js
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
import { getPlaces } from '../utils/dataLoader';

const STATUS_BAR_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 52;

// Backup data (kept for reference)
export const PLACES_DATA_BACKUP = [
  {
    id: 'p1',
    nameAr: 'قلعة قايتباي وموقع حجر رشيد',
    nameEn: 'Qaitbay Fort & Rosetta Stone Site',
    descAr: 'الحصن الدفاعي التاريخي الذي تم بداخله العثور على حجر رشيد الشهير عام ١٧٩٩م بيد الجندي الفرنسي بوشار.',
    descEn: 'Mamluk citadel guarding the Nile estuary where the bilingual Rosetta Stone was discovered in 1799.',
    storyAr: 'أنشأ السلطان المملوكي الأشرف قايتباي هذه القلعة الحصينة عام ١٤٨٢م لحماية سواحل مصر الشمالية ومصب النيل من الغزوات. في أغسطس ١٧٩٩، وأثناء قيام جنود الحملة الفرنسية بترميم أحد أسوار القلعة، اصطدمت فأس الضابط بوشار بحجر من البازلت الأسود يحمل ثلاثة خطوط تاريخية، ليصبح فيما بعد مفتاح حل لغز الهيروغليفية على يد شامبليون.',
    storyEn: 'Erected in 1482 AD by Mamluk Sultan Al-Ashraf Qaitbay to defend Egypt’s northern sea border. In August 1799, French engineering officer Pierre-François Bouchard discovered the basalt granodiorite slab embedded in a wall, unlocking centuries of Pharaonic mysteries.',
    addressAr: 'مدخل البوغاز الساحلي، رشيد',
    addressEn: 'Boughaz Nile Estuary Point, Rosetta',
    openTimeAr: '٠٨:٠٠ ص - ٠٥:٠٠ م',
    openTimeEn: '08:00 AM - 05:00 PM',
    stars: 5,
    rating: '4.9',
    ticketPriceAr: '٤٠ جنيه للمصريين / ١٥٠ للأجانب',
    ticketPriceEn: 'EGP 40 (Locals) / EGP 150 (Foreigners)',
    images: [
      'https://picsum.photos/id/1029/900/600',
      'https://picsum.photos/id/1036/900/600',
      'https://picsum.photos/id/1040/900/600',
      'https://picsum.photos/id/1047/900/600',
      'https://picsum.photos/id/1054/900/600',
    ],
    highlightsAr: [
      'الموقع الفعلي لاكتشاف حجر رشيد',
      'إطلالة بانورامية ساحرة على التقاء النيل بالبحر الأبيض المتوسط',
      'أبراج حربية ومدافع أثرية محفوظة بعناية',
    ],
    highlightsEn: [
      'Actual discovery trench of the Rosetta Stone',
      'Direct panoramic view of the Nile-Mediterranean confluence',
      'Mamluk stone battlements and historic cannons',
    ],
  },
  {
    id: 'p2',
    nameAr: 'منزل الأمصيلي الأثري الفاخر',
    nameEn: 'Al-Amasily Masterpiece House',
    descAr: 'قمة إبداع العمارة العثمانية في رشيد، يشتهر بأسقفه المطعمة بالذهب ومشربيات خشب الأرابيسك المتشابكة.',
    descEn: 'The pinnacle of Ottoman domestic craft with gold-leaf ceiling carvings and ornate mashrabiya.',
    storyAr: 'شيده عثمان أغا الطوبجي عام ١٨٠٨م، ويعد تحفة معمارية تتكون من ثلاثة أدوار مبنية بالطوب المنجور الأحمر والأسود المكحل بالكحل الأبيض. يضم دولاب المناولة السري الدوار لنقل الأطعمة دون اختلاط الخدم، وأسقفاً خشبية مزخرفة بماء الذهب، وأرضيات من الرخام الإيطالي الفاخر.',
    storyEn: 'Constructed in 1808 AD by Ottoman officer Osman Agha Al-Tobgy. Built with alternating red and black bricks, it features revolving wall pantries (dūlāb al-munāwalah) ensuring privacy, intricate gilded cypress ceilings, and fine Italian marble floors.',
    addressAr: 'حارة الأمصيلي، حي الأتراك، رشيد',
    addressEn: 'Al-Amasily Ln, Turk District, Rosetta',
    openTimeAr: '٠٩:٠٠ ص - ٠٤:٣٠ م',
    openTimeEn: '09:00 AM - 04:30 PM',
    stars: 5,
    rating: '4.8',
    ticketPriceAr: '٣٠ جنيه مصري',
    ticketPriceEn: 'EGP 30',
    images: [
      'https://picsum.photos/id/1036/900/600',
      'https://picsum.photos/id/1040/900/600',
      'https://picsum.photos/id/1047/900/600',
      'https://picsum.photos/id/1050/900/600',
      'https://picsum.photos/id/1054/900/600',
    ],
    highlightsAr: [
      'أضخم وأجمل واجهة مشربيات أرابيسك خشبية في مصر',
      'دولاب المناولة الجداري الدوار النادر',
      'قاعة استقبال عثمانية مفروشة بالسجاد العتيق',
    ],
    highlightsEn: [
      'Egypt’s most refined wooden lattice mashrabiya facade',
      'Rare authentic revolving wall-pantry system',
      'Ottoman reception hall (Salamlik) with antique kilims',
    ],
  },
  {
    id: 'p3',
    nameAr: 'طاحونة أبو شاهين الأثرية',
    nameEn: 'Abu Shaheen Historic Mill',
    descAr: 'أقدم طاحونة غلال ثنائية تعمل بدواب الخيل محفوظة بكامل تروسها الخشبية الحجرية منذ العصر العثماني.',
    descEn: 'Egypt’s oldest dual-grinding grain mill preserved with original wooden cogs and millstones.',
    storyAr: 'بنيت في القرن الثامن عشر لتوفير الدقيق لأهالي رشيد وحامية القلعة. تتميز بآلية هندسية فريدة تسمح بتشغيل حجرين ضخمين في وقت واحد بواسطة زوج من الخيول أو الثيران، مع قنوات خشبية لنقل الدقيق المطحون في تصميم إسلامي وصناعي بديع.',
    storyEn: 'Built in the late 18th century to supply flour to Rosetta’s residents and soldiers. It features an ingenious dual-gear wooden axle powered by working draft horses, grinding wheat through paired imported granite stones.',
    addressAr: 'شارع الشيخ قنديل، رشيد',
    addressEn: 'Sheikh Qandil St, Rosetta',
    openTimeAr: '٠٩:٠٠ ص - ٠٤:٠٠ م',
    openTimeEn: '09:00 AM - 04:00 PM',
    stars: 4,
    rating: '4.7',
    ticketPriceAr: '٢٠ جنيه مصري',
    ticketPriceEn: 'EGP 20',
    images: [
      'https://picsum.photos/id/1040/900/600',
      'https://picsum.photos/id/1047/900/600',
      'https://picsum.photos/id/1050/900/600',
      'https://picsum.photos/id/1052/900/600',
      'https://picsum.photos/id/1060/900/600',
    ],
    highlightsAr: [
      'تروس خشبية أصلية عملاقة تعمل حتى اليوم',
      'أحجار طحن غرانيتية ضخمة مستوردة من أسوان',
      'إرشاد أثري يشرح طريقة إنتاج الغلال قديماً',
    ],
    highlightsEn: [
      'Massive original wooden cogs and drive shaft',
      'Historic granite millstones sourced from Aswan',
      'Guided demonstration of Ottoman industrial engineering',
    ],
  },
  {
    id: 'p4',
    nameAr: 'منارة رشيد ومدخل البوغاز الطبيعي',
    nameEn: 'Rosetta Lighthouse & Estuary',
    descAr: 'النقطة الفريدة التي يمتزج فيها نهر النيل العذب بمياه البحر الأبيض المتوسط المالحة في مشهد مهيب.',
    descEn: 'The geographic junction where the freshwater Nile embraces the salty Mediterranean.',
    storyAr: 'تعتبر هذه النقطة نهاية مسيرة نهر النيل الطويلة التي تبدأ من قلب إفريقيا لمسافة تزيد عن ٦٦٠٠ كم. هنا يقف فنار رشيد التاريخي ليرشد سفن الصيد وسفن التجارة الدولية، وتحيط بالمنطقة مزارع النخيل ومرافئ صناعة المراكب الخشبية.',
    storyEn: 'The culminating terminus of the Nile’s 6,600 km journey from equatorial Africa into the Mediterranean Sea. The landmark lighthouse has guided merchantmen and fishing fleets through the estuary shallows for over a century.',
    addressAr: 'نهاية كورنيش رشيد الشمالي، البوغاز',
    addressEn: 'Northern Corniche End, Rosetta Estuary',
    openTimeAr: 'مفتوح على مدار ٢٤ ساعة',
    openTimeEn: 'Open 24 Hours',
    stars: 5,
    rating: '4.9',
    ticketPriceAr: 'مفتوح ومجاني',
    ticketPriceEn: 'Free Public Area',
    images: [
      'https://picsum.photos/id/1043/900/600',
      'https://picsum.photos/id/1052/900/600',
      'https://picsum.photos/id/1054/900/600',
      'https://picsum.photos/id/1068/900/600',
      'https://picsum.photos/id/1070/900/600',
    ],
    highlightsAr: [
      'ظاهرة التقاء الماء العذب بالماء المالح',
      'أفضل موقع لالتقاط صور غروب الشمس النيلية',
      'رحلات بحرية قصيرة بقوارب الصيد التقليدية',
    ],
    highlightsEn: [
      'Natural phenomenon of Nile freshwater meeting seawater',
      'Premier sunset photography spot in northern Egypt',
      'Short felucca and boat excursions available on site',
    ],
  },
];

export default function PopularPlacesScreen({ lang = 'ar', onBack, onPlacePress }) {
  const isAr = lang === 'ar';
  const [query, setQuery] = useState('');
  const [placesData, setPlacesData] = useState([]);

  // Load real places data on mount (all 33 places)
  useEffect(() => {
    const places = getPlaces();
    setPlacesData(places);
  }, []);

  const filtered = placesData.filter((p) => {
    const text = isAr
      ? `${p.nameAr} ${p.addressAr} ${(p.searchTagsAr || []).join(' ')}`
      : `${p.nameEn} ${p.addressEn} ${(p.searchTags || []).join(' ')}`;
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
            placeholder={isAr ? 'ابحث في أشهر معالم رشيد...' : 'Search Rosetta popular places...'}
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
          <Text style={styles.screenTitle}>{isAr ? 'أشهر معالم رشيد' : 'Popular Attractions'}</Text>
          <Text style={styles.screenSubtitle}>
            {isAr ? 'استكشف أهم البيوت والآثار المسجلة عالمياً' : 'Must-visit historical sites, forts and landmarks'}
          </Text>
        </View>

        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.92}
            onPress={() => onPlacePress && onPlacePress(item)}
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

              <View style={[styles.timeRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
                <Ionicons name="time-outline" size={13.5} color="#00A859" />
                <Text style={styles.timeText}>
                  {isAr ? `مواعيد الزيارة: ${item.openTimeAr}` : `Hours: ${item.openTimeEn}`}
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
  timeRow: {
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F4FA',
  },
  timeText: { fontSize: 11.5, color: '#00A859', fontWeight: '700' },
});