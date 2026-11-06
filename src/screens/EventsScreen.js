// src/screens/EventsScreen.js
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
import { getEvents } from '../utils/dataLoader';

const STATUS_BAR_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 52;

// Backup data (kept for reference)
export const BEHEIRA_EVENTS_DATA_BACKUP = [
  {
    id: 'e1',
    nameAr: 'احتفالات العيد القومي للبحيرة وإيقاد شعلة النصر',
    nameEn: 'Beheira National Day & Victory Torch Festival',
    descAr: 'الحدث الأضخم في محافظة البحيرة؛ يبدأ سنوياً من ميدان الحرية بمدينة رشيد بإيقاد شعلة النصر بحضور المحافظ والقيادات، تخليداً لذكرى هزيمة حملة فريزر الإنجليزية عام ١٨٠٧.',
    descEn: 'Beheira’s premier historic celebration starting from Freedom Square in Rosetta with the lighting of the Victory Torch commemorating the 1807 triumph over the Fraser expedition.',
    storyAr: 'في ١٩ سبتمبر ١٨٠٧، أرسل أهالي رشيد وحاكمها رسائل العزة حين استدرجوا جنود الحملة الإنجليزية داخل شوارع المدينة القديمة الضيقة، ثم انقضوا عليهم من النوافذ والمشربيات حتى اضطرت القوات للانسحاب وجلاء الإنجليز. تحتفل البحيرة بهذا اليوم عيداً قومياً بإيقاد شعلة تاريخية وسط أهازيج شعبية وكرنفالات فلكلورية.',
    storyEn: 'On September 19, 1807, the citizens of Rosetta lured British troops into the narrow labyrinth of the old town, attacking from mashrabiya windows until the Fraser campaign was decisively defeated and evacuated. Every year, the victory torch is ignited at Freedom Square.',
    addressAr: 'ميدان الحرية وشارع دهليز الملك، رشيد',
    addressEn: 'Freedom Square & Dehleez El-Mulk St, Rosetta',
    dateAr: '١٩ سبتمبر سنوياً',
    dateEn: 'Annual Sept 19',
    ticketPriceAr: 'دخول عام مجاني',
    ticketPriceEn: 'Free Public Event',
    images: [
      'https://picsum.photos/id/1018/900/600',
      'https://picsum.photos/id/1029/900/600',
      'https://picsum.photos/id/1036/900/600',
      'https://picsum.photos/id/1040/900/600',
      'https://picsum.photos/id/1047/900/600',
    ],
    highlightsAr: [
      'إيقاد شعلة النصر الرسمية بميدان الحرية',
      'عروض التنورة والفرسان والموسيقى النحاسية',
      'ندوات تاريخية في متحف رشيد الوطني وقصور الثقافة',
    ],
    highlightsEn: [
      'Lighting the Victory Torch ceremony at Freedom Square',
      'Tanoura, marching brass bands, and equestrian shows',
      'Heritage lectures at Rosetta National Museum',
    ],
  },
  {
    id: 'e2',
    nameAr: 'مهرجان رشيد للموسيقى والغناء (دار الأوبرا)',
    nameEn: 'Rosetta Music & Singing Festival (Opera House)',
    descAr: 'مهرجان غنائي صيفي ضخم تنظمه دار الأوبرا المصرية ووزارة الثقافة بميناء رشيد التراثي وكورنيش النيل، بمشاركة كبار نجوم الطرب العربي وفرق الأوبرا الموسيقية.',
    descEn: 'A high-profile open-air festival staged by the Cairo Opera House at Rosetta Port and Corniche, featuring legendary Egyptian and Arab singers accompanied by live orchestras.',
    storyAr: 'أطلقت دار الأوبرا المصرية هذا المهرجان احتفاءً بمرور قرنين على فك رموز حجر رشيد. تحولت ساحات ميناء الصيد إلى مسارح مكشوفة مضاءة بأحدث التقنيات تطل على النيل العذب والبحر المتوسط، ليكون نافذة فنية تعيد لرشيد رونقها الحضاري الخالد.',
    storyEn: 'Inaugurated to commemorate the decipherment of the Rosetta Stone, turning the historic fishing harbor into illuminated open-air amphitheaters overlooking the Nile with performances by renowned Arab vocalists and opera stars.',
    addressAr: 'ميناء رشيد الجديد وممشى الكورنيش، رشيد',
    addressEn: 'New Rosetta Port Arena & Nile Promenade, Rosetta',
    dateAr: 'سبتمبر وأكتوبر',
    dateEn: 'September & October',
    ticketPriceAr: 'تذاكر من دار الأوبرا',
    ticketPriceEn: 'Opera House Tickets',
    images: [
      'https://picsum.photos/id/1050/900/600',
      'https://picsum.photos/id/1052/900/600',
      'https://picsum.photos/id/1054/900/600',
      'https://picsum.photos/id/1060/900/600',
      'https://picsum.photos/id/1068/900/600',
    ],
    highlightsAr: [
      'ليالٍ غنائية لأبرز مطربي مصر والعالم العربي',
      'عزف منفرد على آلة الماريمبا وأوركسترا الموسيقى العربية',
      'أجواء نسيم النيل والبحر المفتوحة',
    ],
    highlightsEn: [
      'Star-studded vocal performances',
      'Arab Music Institute live orchestra and marimba recitals',
      'Picturesque open-air riverfront atmosphere',
    ],
  },
  {
    id: 'e3',
    nameAr: 'مهرجان دمنهور الدولي للموسيقى والفولكلور',
    nameEn: 'Damanhour International Folklore & Arabic Music Festival',
    descAr: 'تظاهرة فنية وثقافية دولية تستضيفها دار أوبرا دمنهور التاريخية بالبحيرة، تضم فرق الفنون الشعبية من دول حوض البحر الأبيض المتوسط وأوروبا وآسيا.',
    descEn: 'An international heritage showcase at the historic Damanhour Opera House in Beheira, bringing together folk dance troupes and musicians from across the Mediterranean, Asia, and Europe.',
    storyAr: 'تعتبر دار أوبرا دمنهور المشيدة عام ١٩٣٠ تحفة معمارية إيطالية مصرية فريدة في قلب محافظة البحيرة. يستقطب المهرجان سنوياً وفوداً عالمية لتقديم لوحات راقصة واستعراضية تعبر عن أصالة التراث الشعبي وتلاقح الحضارات.',
    storyEn: 'Damanhour Opera House, an Italianate architectural marvel built in 1930 in Beheira, serves as the home for this global gathering celebrating traditional dances, costumes, and centuries-old folk rhythms.',
    addressAr: 'دار أوبرا دمنهور، ميدان المحطة، دمنهور، البحيرة',
    addressEn: 'Damanhour Opera House, Station Sq, Damanhour, Beheira',
    dateAr: 'أكتوبر ونوفمبر',
    dateEn: 'October & November',
    ticketPriceAr: '٥٠ - ١٥٠ جنيه مصري',
    ticketPriceEn: 'EGP 50 - 150',
    images: [
      'https://picsum.photos/id/1070/900/600',
      'https://picsum.photos/id/1040/900/600',
      'https://picsum.photos/id/1036/900/600',
      'https://picsum.photos/id/1029/900/600',
      'https://picsum.photos/id/1018/900/600',
    ],
    highlightsAr: [
      'عروض حية لفرق الفنون الشعبية الإسبانية واليونانية والمصرية',
      'ندوات صالون الأوبرا الثقافي في حب التراث',
      'معارض فنون تشكيلية وصور تاريخية للبحيرة',
    ],
    highlightsEn: [
      'International folklore dance companies from Spain, Greece, and Egypt',
      'Cultural salon talks on Mediterranean folk traditions',
      'Fine arts and historical photo exhibits',
    ],
  },
  {
    id: 'e4',
    nameAr: 'سباق قوارب النيل والتجديف ومهرجان البوغاز',
    nameEn: 'Rosetta Nile Regatta & Boughaz Sailing Race',
    descAr: 'كرنفال مائي ورياضي ينطلق بمشاركة أندية الصيد واليخوت من نقطة التقاء النيل بالبحر في البوغاز وصولاً إلى مراسي كورنيش رشيد.',
    descEn: 'Spectacular water sports and rowing competition racing from the historic Boughaz meeting point down through the Rosetta Corniche docks.',
    storyAr: 'بفضل طبيعة رشيد الفريدة كمدينة تحتضن مخرج النيل إلى البحر المتوسط، توارث أبناؤها صناعة السفن ومهارات الإبحار لقرون. يحيي هذا السباق التراث الملاحي العريق بمشاركة العشرات من قوارب الفلوكة والقوارب الشراعية الحديثة.',
    storyEn: 'Rosetta’s heritage is rooted in master shipbuilders and seafarers. The Nile Regatta celebrates this legacy with dozens of traditional wooden feluccas and modern racing skiffs competing along the estuary.',
    addressAr: 'نادي رشيد الرياضي لليخوت، كورنيش النيل',
    addressEn: 'Rosetta Yacht Club, Corniche Promenade',
    dateAr: '٥ ديسمبر',
    dateEn: 'December 5',
    ticketPriceAr: 'مشاهدة مفتوحة للجمهور',
    ticketPriceEn: 'Free Waterfront Spectating',
    images: [
      'https://picsum.photos/id/1047/900/600',
      'https://picsum.photos/id/1052/900/600',
      'https://picsum.photos/id/1054/900/600',
      'https://picsum.photos/id/1029/900/600',
      'https://picsum.photos/id/1043/900/600',
    ],
    highlightsAr: [
      'استعراض القوارب الشراعية والمراكب المزينة بالأعلام',
      'مضمار سباق تجديف مفتوح على مسافة ٥ كم',
      'عروض مائية وموسيقى نيلية حية',
    ],
    highlightsEn: [
      'Parade of decorated sailing boats and traditional vessels',
      '5km rowing and kayak competition along the river',
      'Live acoustic Nile melodies along the piers',
    ],
  },
];

export default function EventsScreen({ lang = 'ar', onBack, onEventPress }) {
  const isAr = lang === 'ar';
  const [query, setQuery] = useState('');
  const [eventsData, setEventsData] = useState([]);

  // Load real events data on mount (all 12 events)
  useEffect(() => {
    const events = getEvents();
    setEventsData(events);
  }, []);

  const filtered = eventsData.filter((e) => {
    const text = isAr
      ? `${e.nameAr} ${e.addressAr} ${(e.searchTagsAr || []).join(' ')}`
      : `${e.nameEn} ${e.addressEn} ${(e.searchTags || []).join(' ')}`;
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
            placeholder={isAr ? 'ابحث في فعاليات رشيد والبحيرة...' : 'Search Rosetta & Beheira events...'}
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
          <Text style={styles.screenTitle}>{isAr ? 'فعاليات ومهرجانات رشيد والبحيرة' : 'Rosetta & Beheira Events'}</Text>
          <Text style={styles.screenSubtitle}>
            {isAr ? 'احتفالات العيد القومي، ليالي الأوبرا، والسباقات النيلية' : 'National celebrations, Opera festivals, and Regattas'}
          </Text>
        </View>

        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.92}
            onPress={() => onEventPress && onEventPress(item)}
          >
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />
              <View style={[styles.dateBadge, isAr ? { right: 12 } : { left: 12 }]}>
                <Ionicons name="calendar" size={12} color="#FFFFFF" />
                <Text style={styles.dateBadgeText}>{isAr ? item.dateAr : item.dateEn}</Text>
              </View>
            </View>

            <View style={[styles.cardBody, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
              <Text style={styles.cardTitle}>{isAr ? item.nameAr : item.nameEn}</Text>

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
  screenTitle: { fontSize: 21, fontWeight: '900', color: '#0B2B64' },
  screenSubtitle: { fontSize: 12.5, fontWeight: '500', color: '#687F9E', marginTop: 3 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2ECF8',
    overflow: 'hidden',
  },
  imageWrap: { width: '100%', height: 160, position: 'relative', backgroundColor: '#E5EEFA' },
  image: { width: '100%', height: '100%' },
  dateBadge: {
    position: 'absolute',
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 82, 204, 0.92)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  dateBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0B2B64' },
  descText: { fontSize: 12, color: '#607289', marginTop: 6, lineHeight: 18 },
  addressRow: { alignItems: 'center', gap: 4, marginTop: 8 },
  addressText: { fontSize: 11.5, color: '#0052CC', fontWeight: '600' },
});