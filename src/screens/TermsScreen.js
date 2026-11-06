// src/screens/TermsScreen.js
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

export default function TermsScreen({ lang = 'en', onBack }) {
  const isAr = lang === 'ar';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bgCanvas} />

      <View style={[styles.header, { paddingTop: STATUS_BAR_INSET }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name={isAr ? 'arrow-right' : 'arrow-left'} size={22} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isAr ? 'الشروط والأحكام' : 'Terms of Service'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { textAlign: isAr ? 'right' : 'left' }]}>
          {isAr ? 'آخر تحديث: نوفمبر 2024' : 'Last Updated: November 2024'}
        </Text>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '1. قبول الشروط' : '1. Acceptance of Terms'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'باستخدامك لتطبيق رشيد جو، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام التطبيق.'
              : 'By using the RasheedGo app, you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, please do not use the app.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '2. وصف الخدمة' : '2. Service Description'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'رشيد جو هو دليل سياحي تفاعلي لمدينة رشيد (روزيتا) في مصر. يوفر التطبيق معلومات عن المعالم التاريخية، الفنادق، المطاعم، والفعاليات المحلية.'
              : 'RasheedGo is an interactive tourist guide for the city of Rasheed (Rosetta) in Egypt. The app provides information about historic landmarks, hotels, restaurants, and local events.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '3. مسؤوليات المستخدم' : '3. User Responsibilities'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'يتحمل المستخدم مسؤولية استخدام التطبيق بطريقة قانونية وأخلاقية. يجب عدم استخدام التطبيق لأي غرض غير قانوني أو ضار.'
              : 'Users are responsible for using the app in a legal and ethical manner. The app must not be used for any illegal or harmful purposes.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '4. الملكية الفكرية' : '4. Intellectual Property'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'جميع المحتويات في التطبيق، بما في ذلك النصوص والصور والشعارات، محمية بموجب قوانين الملكية الفكرية. يُحظر نسخ أو توزيع أي محتوى بدون إذن مسبق.'
              : 'All content in the app, including texts, images, and logos, is protected under intellectual property laws. Copying or distributing any content without prior permission is prohibited.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '5. سياسة الخصوصية' : '5. Privacy Policy'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'يرجى مراجعة سياسة الخصوصية الخاصة بنا لفهم كيفية جمع واستخدام معلوماتك الشخصية.'
              : 'Please review our Privacy Policy to understand how we collect and use your personal information.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '6. حدود المسؤولية' : '6. Limitation of Liability'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'لا يتحمل مطورو التطبيق أي مسؤولية عن الأضرار المباشرة أو غير المباشرة الناتجة عن استخدام التطبيق. المعلومات المقدمة للأغراض الإرشادية فقط.'
              : 'The app developers are not liable for any direct or indirect damages resulting from the use of the app. Information provided is for guidance purposes only.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '7. تعديلات الشروط' : '7. Changes to Terms'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. ستصبح التعديلات سارية فور نشرها في التطبيق.'
              : 'We reserve the right to modify these terms at any time. Modifications become effective immediately upon publication in the app.'}
          </Text>
        </View>

        <View style={[styles.section, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr ? '8. معلومات الاتصال' : '8. Contact Information'}
          </Text>
          <Text style={[styles.sectionText, { textAlign: isAr ? 'right' : 'left' }]}>
            {isAr
              ? 'للاستفسارات، يرجى التواصل عبر: support@rashidgo.app'
              : 'For inquiries, please contact: support@rashidgo.app'}
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
