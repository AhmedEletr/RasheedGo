import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { STRINGS } from '../constants/translations';

const STATUS_BAR_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 10 : 54;

export default function ProfileScreen({ lang = 'en', onBack, onLogOut }) {
  const t = STRINGS?.[lang] || {};
  const isAr = lang === 'ar';

  const confirmLogout = () => {
    Alert.alert(
      isAr ? 'تسجيل الخروج' : 'Log Out',
      isAr ? 'هل أنت متأكد من رغبتك في تسجيل الخروج؟' : 'Are you sure you want to log out?',
      [
        { text: isAr ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isAr ? 'خروج' : 'Log Out',
          style: 'destructive',
          onPress: onLogOut,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bgCanvas} />

      <View style={[styles.header, { paddingTop: STATUS_BAR_INSET }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.65}>
          <Ionicons name={isAr ? 'arrow-forward' : 'arrow-back'} size={22} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.profileTitle || (isAr ? 'الحساب' : 'Account')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* User Identity */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AH</Text>
          </View>
          <Text style={styles.userName}>Ahmed Helmy</Text>
          <Text style={styles.userEmail}>a.helmyeletr@gmail.com</Text>
          <Text style={styles.memberSince}>
            {isAr ? 'عضو منذ مايو 2024' : 'Member since May 2024'}
          </Text>
        </View>

        {/* Activity Group */}
        <Text style={styles.sectionHeader}>{isAr ? 'الرحلات والحجوزات' : 'ACTIVITY'}</Text>
        <View style={styles.groupCard}>
          <TouchableOpacity style={styles.row} activeOpacity={0.65}>
            <View style={styles.rowLeft}>
              <Feather name="compass" size={18} color={THEME.textMuted} />
              <Text style={styles.rowText}>{isAr ? 'حجوزات الفلوكة والجولات' : 'Tours & Excursions'}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.metaBadge}>2</Text>
              <Feather name={isAr ? 'chevron-left' : 'chevron-right'} size={18} color={THEME.textSubtle} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} activeOpacity={0.65}>
            <View style={styles.rowLeft}>
              <Feather name="heart" size={18} color={THEME.textMuted} />
              <Text style={styles.rowText}>{isAr ? 'الأماكن المفضلة' : 'Saved Listings'}</Text>
            </View>
            <Feather name={isAr ? 'chevron-left' : 'chevron-right'} size={18} color={THEME.textSubtle} />
          </TouchableOpacity>
        </View>

        {/* Account Details Group */}
        <Text style={styles.sectionHeader}>{isAr ? 'بيانات الحساب' : 'ACCOUNT'}</Text>
        <View style={styles.groupCard}>
          <TouchableOpacity style={styles.row} activeOpacity={0.65}>
            <View style={styles.rowLeft}>
              <Feather name="user" size={18} color={THEME.textMuted} />
              <Text style={styles.rowText}>{isAr ? 'المعلومات الشخصية' : 'Personal Details'}</Text>
            </View>
            <Feather name={isAr ? 'chevron-left' : 'chevron-right'} size={18} color={THEME.textSubtle} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} activeOpacity={0.65}>
            <View style={styles.rowLeft}>
              <Feather name="credit-card" size={18} color={THEME.textMuted} />
              <Text style={styles.rowText}>{isAr ? 'طرق الدفع' : 'Payment Methods'}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.subtext}>Visa • 4291</Text>
              <Feather name={isAr ? 'chevron-left' : 'chevron-right'} size={18} color={THEME.textSubtle} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Destructive Logout */}
        <View style={styles.groupCard}>
          <TouchableOpacity style={styles.row} onPress={confirmLogout} activeOpacity={0.65}>
            <View style={styles.rowLeft}>
              <Feather name="log-out" size={18} color={THEME.error} />
              <Text style={[styles.rowText, { color: THEME.error }]}>
                {t.logout || (isAr ? 'تسجيل الخروج' : 'Log Out')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 110 }} />
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: THEME.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.textMain,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 14,
    color: THEME.textMuted,
    marginTop: 3,
  },
  memberSince: {
    fontSize: 12,
    color: THEME.textSubtle,
    marginTop: 6,
  },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '600',
    color: THEME.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 12,
  },
  groupCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowText: {
    fontSize: 15,
    fontWeight: '500',
    color: THEME.textMain,
  },
  subtext: {
    fontSize: 13,
    color: THEME.textMuted,
  },
  metaBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textMuted,
    backgroundColor: THEME.borderSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.borderSubtle,
    marginLeft: 30,
  },
});