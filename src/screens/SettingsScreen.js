import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { STRINGS } from '../constants/translations';

const STATUS_BAR_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 12 : 54;

/**
 * Compact Modern Square Toggle Switch
 * 38x22px track | 18x16px squircle thumb
 * High-speed spring physics, zero drop shadows, precision hairline borders
 */
function SquareToggle({ value, onToggle, activeColor = THEME.primary }) {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      damping: 20,
      mass: 0.8,
      stiffness: 280,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  // Precise track padding: 2px offset -> slides 16px across to sit exactly 2px from opposite border
  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 16],
  });

  const trackBgColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#EDF2F7', activeColor],
  });

  const trackBorderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#CBD5E1', activeColor],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Animated.View
        style={[
          styles.toggleTrack,
          {
            backgroundColor: trackBgColor,
            borderColor: trackBorderColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.toggleThumb,
            { transform: [{ translateX: thumbTranslateX }] },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ lang = 'en', setLang, onNavigateProfile }) {
  const t = STRINGS?.[lang] || {};
  const isAr = lang === 'ar';

  const [notifs, setNotifs] = useState(true);
  const [offlineMaps, setOfflineMaps] = useState(true);
  const [haptics, setHaptics] = useState(true);

  const handleClearCache = () => {
    Alert.alert(
      isAr ? 'مسح الذاكرة المؤقتة' : 'Clear Cache',
      isAr ? 'تم تحرير 24.2 ميجابايت بنجاح.' : '24.2 MB freed successfully.',
      [{ text: isAr ? 'حسناً' : 'Done' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bgCanvas} />

      <View
        style={[
          styles.header,
          {
            paddingTop: STATUS_BAR_INSET,
            alignItems: isAr ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        <Text style={styles.headerTitle}>
          {t.settingsTitle || (isAr ? 'الإعدادات' : 'Settings')}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Card Banner */}
        <TouchableOpacity
          style={[
            styles.profileRow,
            { flexDirection: isAr ? 'row-reverse' : 'row' },
          ]}
          activeOpacity={0.7}
          onPress={onNavigateProfile}
        >
          <View style={styles.avatarSquare}>
            <Text style={styles.avatarText}>AH</Text>
          </View>
          <View style={[styles.profileDetails, { alignItems: isAr ? 'flex-end' : 'flex-start' }]}>
            <Text style={styles.profileName}>Ahmed Helmy</Text>
            <Text style={styles.profileEmail}>a.helmyeletr@gmail.com</Text>
          </View>
          <Feather name={isAr ? 'chevron-left' : 'chevron-right'} size={18} color={THEME.textSubtle} />
        </TouchableOpacity>

        {/* Section: Preferences */}
        <Text
          style={[
            styles.sectionHeader,
            { textAlign: isAr ? 'right' : 'left', marginHorizontal: 12 },
          ]}
        >
          {isAr ? 'التفضيلات' : 'PREFERENCES'}
        </Text>
        <View style={styles.groupCard}>
          {/* Language Row */}
          <View
            style={[
              styles.row,
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
          >
            <View
              style={[
                styles.rowLeft,
                { flexDirection: isAr ? 'row-reverse' : 'row' },
              ]}
            >
              <Feather name="globe" size={18} color={THEME.textMuted} />
              <Text style={styles.rowText}>{isAr ? 'اللغة' : 'Language'}</Text>
            </View>
            <TouchableOpacity
              style={styles.langPill}
              activeOpacity={0.7}
              onPress={() => setLang(lang === 'en' ? 'ar' : 'en')}
            >
              <Text style={styles.langPillText}>{lang === 'en' ? 'English' : 'العربية'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Notifications Toggle */}
          <View
            style={[
              styles.row,
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
          >
            <View
              style={[
                styles.rowLeft,
                { flexDirection: isAr ? 'row-reverse' : 'row' },
              ]}
            >
              <Feather name="bell" size={18} color={THEME.textMuted} />
              <Text style={styles.rowText}>{isAr ? 'الإشعارات' : 'Notifications'}</Text>
            </View>
            <SquareToggle
              value={notifs}
              onToggle={() => setNotifs(!notifs)}
              activeColor={THEME.primary}
            />
          </View>

          <View style={styles.divider} />

          {/* Offline Data Toggle */}
          <View
            style={[
              styles.row,
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
          >
            <View
              style={[
                styles.rowLeft,
                { flexDirection: isAr ? 'row-reverse' : 'row' },
              ]}
            >
              <Feather name="download-cloud" size={18} color={THEME.textMuted} />
              <Text style={styles.rowText}>{isAr ? 'بيانات التراث بدون إنترنت' : 'Offline Heritage Data'}</Text>
            </View>
            <SquareToggle
              value={offlineMaps}
              onToggle={() => setOfflineMaps(!offlineMaps)}
              activeColor={THEME.primary}
            />
          </View>

          <View style={styles.divider} />

          {/* Haptics Toggle */}
          <View
            style={[
              styles.row,
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
          >
            <View
              style={[
                styles.rowLeft,
                { flexDirection: isAr ? 'row-reverse' : 'row' },
              ]}
            >
              <Feather name="smartphone" size={18} color={THEME.textMuted} />
              <Text style={styles.rowText}>{isAr ? 'الاستجابة اللمسية' : 'Haptic Feedback'}</Text>
            </View>
            <SquareToggle
              value={haptics}
              onToggle={() => setHaptics(!haptics)}
              activeColor={THEME.primary}
            />
          </View>
        </View>

        {/* Section: Storage */}
        <Text
          style={[
            styles.sectionHeader,
            { textAlign: isAr ? 'right' : 'left', marginHorizontal: 12 },
          ]}
        >
          {isAr ? 'البيانات والتخزين' : 'STORAGE'}
        </Text>
        <View style={styles.groupCard}>
          <TouchableOpacity
            style={[
              styles.row,
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.rowLeft,
                { flexDirection: isAr ? 'row-reverse' : 'row' },
              ]}
            >
              <Feather name="trash-2" size={18} color={THEME.textMuted} />
              <Text style={styles.rowText}>{isAr ? 'مسح الذاكرة المؤقتة' : 'Clear Temporary Cache'}</Text>
            </View>
            <Text style={styles.subtext}>24.2 MB</Text>
          </TouchableOpacity>
        </View>

        {/* Section: About */}
        <Text
          style={[
            styles.sectionHeader,
            { textAlign: isAr ? 'right' : 'left', marginHorizontal: 12 },
          ]}
        >
          {isAr ? 'عن التطبيق' : 'ABOUT'}
        </Text>
        <View style={styles.groupCard}>
          <TouchableOpacity
            style={[
              styles.row,
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.rowLeft,
                { flexDirection: isAr ? 'row-reverse' : 'row' },
              ]}
            >
              <Feather name="file-text" size={18} color={THEME.textMuted} />
              <Text style={styles.rowText}>{isAr ? 'الشروط والخصوصية' : 'Terms & Privacy'}</Text>
            </View>
            <Feather name={isAr ? 'chevron-left' : 'chevron-right'} size={18} color={THEME.textSubtle} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View
            style={[
              styles.row,
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
          >
            <View
              style={[
                styles.rowLeft,
                { flexDirection: isAr ? 'row-reverse' : 'row' },
              ]}
            >
              <Feather name="info" size={18} color={THEME.textMuted} />
              <Text style={styles.rowText}>{isAr ? 'الإصدار' : 'Version'}</Text>
            </View>
            <Text style={styles.subtext}>2.4.0 (104)</Text>
          </View>
        </View>

        <View style={{ height: 80 }} />
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
    paddingBottom: 14,
    backgroundColor: THEME.bgCanvas,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.textMain,
    letterSpacing: -0.4,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  profileRow: {
    alignItems: 'center',
    backgroundColor: THEME.cardBg,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    marginBottom: 24,
  },
  avatarSquare: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: THEME.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4E2F6',
  },
  avatarText: {
    color: THEME.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  profileDetails: {
    flex: 1,
    marginHorizontal: 14,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textMain,
  },
  profileEmail: {
    fontSize: 12.5,
    color: THEME.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  groupCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  row: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    minHeight: 52,
  },
  rowLeft: {
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: THEME.textMain,
  },
  subtext: {
    fontSize: 13.5,
    color: THEME.textMuted,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: THEME.borderSubtle,
    marginHorizontal: 2,
  },
  langPill: {
    backgroundColor: '#EBF2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4E2F6',
  },
  langPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: THEME.primary,
  },

  /* Compact Modern Square Switch */
  toggleTrack: {
    width: 38,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 18,
    height: 16,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});