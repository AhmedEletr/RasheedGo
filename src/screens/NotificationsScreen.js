import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

const STATUS_BAR_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 52;

const NOTIFICATIONS = [
  {
    id: 'n1',
    titleAr: 'جولة مجانية في قلعة قايتباي اليوم',
    titleEn: 'Free Guided Tour at Qaitbay Fort',
    timeAr: 'منذ ١٥ دقيقة',
    timeEn: '15m ago',
    descAr: 'تم بدء الجولات الإرشادية لزوار رشيد للتعريف بمكان اكتشاف حجر رشيد مع مرشد سياحي معتمد.',
    descEn: 'Licensed historical tours have begun today celebrating the Rosetta Stone heritage discovery.',
    icon: 'compass-outline',
    unread: true,
  },
  {
    id: 'n2',
    titleAr: 'تأكيد حجزك في فندق بيوت رشيد',
    titleEn: 'Booking Confirmed at Rosetta Inn',
    timeAr: 'منذ ساعتين',
    timeEn: '2h ago',
    descAr: 'تم تأكيد حجز الغرفة التراثية المطلة على الحديقة بنجاح. نتمنى لك إقامة ممتعة!',
    descEn: 'Your Ottoman suite reservation has been verified. Check-in starts at 02:00 PM.',
    icon: 'checkmark-circle-outline',
    unread: true,
  },
  {
    id: 'n3',
    titleAr: 'مهرجان المأكولات البحرية ينطلق غداً',
    timeAr: 'أمس',
    timeEn: 'Yesterday',
    titleEn: 'Seafood Festival Starts Tomorrow',
    descAr: 'لا تفوت تذوق أفضل الأسماك الطازجة في مرسى الصيد بأسعار خاصة لجميع الزوار.',
    descEn: 'Enjoy exclusive seafood tasting deals along the historical marina harbor.',
    icon: 'restaurant-outline',
    unread: false,
  },
];

export default function NotificationsScreen({ lang = 'ar', onBack }) {
  const isAr = lang === 'ar';
  const [items, setItems] = useState(NOTIFICATIONS);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Top Header */}
      <View style={[styles.header, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.75} onPress={onBack}>
          <Feather name={isAr ? 'arrow-right' : 'arrow-left'} size={20} color="#0052CC" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{isAr ? 'الإشعارات' : 'Notifications'}</Text>

        <TouchableOpacity
          style={styles.markReadBtn}
          onPress={() => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))}
        >
          <Ionicons name="checkmark-done" size={19} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {items.map((n) => (
          <View
            key={n.id}
            style={[
              styles.notifCard,
              n.unread && styles.unreadCard,
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
          >
            <View style={[styles.iconWrap, n.unread && styles.iconWrapUnread]}>
              <Ionicons
                name={n.icon}
                size={22}
                color={n.unread ? '#0052CC' : '#687F9E'}
              />
            </View>

            <View style={{ flex: 1, alignItems: isAr ? 'flex-end' : 'flex-start' }}>
              <View
                style={[
                  styles.titleRow,
                  { flexDirection: isAr ? 'row-reverse' : 'row' },
                ]}
              >
                <Text style={styles.titleText}>{isAr ? n.titleAr : n.titleEn}</Text>
                <Text style={styles.timeText}>{isAr ? n.timeAr : n.timeEn}</Text>
              </View>

              <Text
                style={[
                  styles.descText,
                  { textAlign: isAr ? 'right' : 'left' },
                ]}
              >
                {isAr ? n.descAr : n.descEn}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFD' },
  header: {
    paddingTop: STATUS_BAR_INSET,
    paddingHorizontal: 16,
    paddingBottom: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0B2B64' },
  markReadBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EBF2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { padding: 16 },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2ECF8',
    alignItems: 'flex-start',
    gap: 12,
  },
  unreadCard: {
    borderColor: '#0052CC',
    backgroundColor: '#FFFFFF',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F0F5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapUnread: {
    backgroundColor: '#EBF2FD',
  },
  titleRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  titleText: { fontSize: 14, fontWeight: '800', color: '#0B2B64', flex: 1 },
  timeText: { fontSize: 11, fontWeight: '600', color: '#8C9BB0' },
  descText: { fontSize: 12, color: '#687F9E', lineHeight: 18 },
});