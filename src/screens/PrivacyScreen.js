// src/screens/PrivacyScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

const STATUS_BAR_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 12 : 54;

export default function PrivacyScreen({ lang = 'en', onBack }) {
  const isAr = lang === 'ar';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bgCanvas} />

      <View style={[styles.header, { paddingTop: STATUS_BAR_INSET }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name={isAr ? 'arrow-right' : 'arrow-left'} size={22} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { textAlign: isAr ? 'right' : 'left' }]}>
          {isAr ? 'آخر تحديث: نوفمبر 2024' : 'Last Updated: November 2024'}
        </Text>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '1. جمع المعلومات' : '1. Information Collection'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'نجمع معلومات محدودة لتحسين تجربتك، بما في ذلك: الأماكن المفضلة، إعدادات اللغة، وتفضيلات التطبيق. لا نجمع بيانات شخصية حساسة.'
              : 'We collect limited information to improve your experience, including: favorite places, language preferences, and app settings. We do not collect sensitive personal data.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '2. استخدام المعلومات' : '2. Use of Information'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'نستخدم المعلومات التي نجمعها لـ: تحسين المحتوى، تخصيص التجربة، إرسال الإشعارات المهمة، وتطوير ميزات جديدة.'
              : 'We use the information we collect to: improve content, personalize experience, send important notifications, and develop new features.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '3. تخزين البيانات وأمانها' : '3. Data Storage & Security'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'يتم تخزين البيانات محليًا على جهازك باستخدام AsyncStorage. لا نحتفظ ببياناتك على خوادمنا. نستخدم إجراءات أمنية قياسية لحماية المعلومات.'
              : 'Data is stored locally on your device using AsyncStorage. We do not retain your data on our servers. We use standard security measures to protect information.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '4. خدمات الطرف الثالث' : '4. Third-Party Services'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'قد يستخدم التطبيق روابط خارجية لمواقع الجهات الخارجية (مثل خرائط جوجل). نحن لسنا مسؤولين عن ممارسات الخصوصية لهذه المواقع.'
              : 'The app may contain external links to third-party websites (such as Google Maps). We are not responsible for the privacy practices of these sites.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '5. حقوق المستخدم' : '5. User Rights'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'لديك الحق في: الوصول إلى بياناتك، تصحيح المعلومات غير الدقيقة، حذف بياناتك عن طريق مسح ذاكرة التخزين المؤقت في الإعدادات.'
              : 'You have the right to: access your data, correct inaccurate information, delete your data by clearing cache in Settings.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '6. سياسة ملفات تعريف الارتباط' : '6. Cookie Policy'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'لا يستخدم التطبيق ملفات تعريف الارتباط التقليدية. نستخدم التخزين المحلي لحفظ التفضيلات فقط.'
              : 'The app does not use traditional cookies. We use local storage to save preferences only.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '7. خصوصية الأطفال' : '7. Children\'s Privacy'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'التطبيق مناسب لجميع الأعمار. لا نجمع عمدًا معلومات من الأطفال دون 13 عامًا بدون موافقة الوالدين.'
              : 'The app is suitable for all ages. We do not knowingly collect information from children under 13 without parental consent.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '8. الاتصال بنا' : '8. Contact Us'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'لأي أسئلة حول الخصوصية، يرجى التواصل: privacy@rashidgo.app'
              : 'For any privacy questions, please contact: privacy@rashidgo.app'}
          </Text>
        </View>

        <View style={{ height: 60 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: THEME.bgCanvas,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: THEME.textMain,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  lastUpdated: {
    fontSize: 12,
    color: THEME.textMuted,
    marginBottom: 20,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textMain,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: THEME.textMuted,
    lineHeight: 22,
  },
});
