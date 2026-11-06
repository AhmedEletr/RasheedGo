import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Easing,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { STRINGS } from '../constants/translations';

// Asset imports
const LOGIN_BG = require('../../assets/login.png');
const BRAND_LOGO = require('../../assets/bg.png');

export default function AuthScreen({ lang = 'en', onAuthSuccess }) {
  const t = STRINGS?.[lang] || {};
  const isAr = lang === 'ar';

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [segmentWidth, setSegmentWidth] = useState(0);

  // 1. Sliding Segment Indicator Animation (0: Login, 1: Register)
  const modeAnim = useRef(new Animated.Value(0)).current;

  // 2. Full Name Smooth Unfold Animation (0: Hidden, 1: Visible)
  const fullNameAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const isRegister = mode === 'register';

    Animated.parallel([
      Animated.spring(modeAnim, {
        toValue: isRegister ? 1 : 0,
        tension: 68,
        friction: 10,
        useNativeDriver: false,
      }),
      Animated.timing(fullNameAnim, {
        toValue: isRegister ? 1 : 0,
        duration: 280,
        easing: isRegister
          ? Easing.out(Easing.cubic)
          : Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  }, [mode]);

  const switchMode = (newMode) => {
    if (newMode !== mode) {
      setMode(newMode);
    }
  };

  const handleSubmit = () => {
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  const halfWidth = segmentWidth > 0 ? (segmentWidth - 8) / 2 : 0;
  const slideDistance = isAr ? -halfWidth : halfWidth;

  const segmentTranslateX = modeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, slideDistance],
  });

  // Tab Text Color Cross-fades
  const loginTextColor = modeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.textMain, THEME.textMuted],
  });

  const registerTextColor = modeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.textMuted, THEME.textMain],
  });

  // Smooth Field Unfold & Collapse Interpolations
  const fullNameHeight = fullNameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });

  const fullNameMargin = fullNameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  const fullNameOpacity = fullNameAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0, 1],
  });

  const fullNameTranslateY = fullNameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  const fullNameBorderWidth = fullNameAnim.interpolate({
    inputRange: [0, 0.08, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* TOP IMAGE BACKGROUND */}
      <ImageBackground
        source={LOGIN_BG}
        style={styles.heroBackground}
        resizeMode="cover"
      >
        <View style={styles.brandContainer}>
          {/* Increased size bg.png logo */}
          <Image
            source={BRAND_LOGO}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandSubtitle}>
            {isAr ? 'بوابتك الذكية لاستكشاف رشيد' : 'Your Smart Guide to Rasheed'}
          </Text>
        </View>
      </ImageBackground>

      {/* CURVED BOTTOM CARD */}
      <View style={styles.bottomCard}>
        {/* Animated Sliding Segment Switcher */}
        <View
          style={[
            styles.segmentContainer,
            { flexDirection: isAr ? 'row-reverse' : 'row' },
          ]}
          onLayout={(e) => setSegmentWidth(e.nativeEvent.layout.width)}
        >
          {halfWidth > 0 && (
            <Animated.View
              style={[
                styles.slidingPill,
                {
                  width: halfWidth,
                  left: isAr ? undefined : 4,
                  right: isAr ? 4 : undefined,
                  transform: [{ translateX: segmentTranslateX }],
                },
              ]}
            />
          )}

          <TouchableOpacity
            style={styles.segmentBtn}
            onPress={() => switchMode('login')}
            activeOpacity={0.75}
          >
            <Animated.Text
              style={[
                styles.segmentText,
                { color: loginTextColor },
                mode === 'login' && styles.segmentTextActive,
              ]}
            >
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.segmentBtn}
            onPress={() => switchMode('register')}
            activeOpacity={0.75}
          >
            <Animated.Text
              style={[
                styles.segmentText,
                { color: registerTextColor },
                mode === 'register' && styles.segmentTextActive,
              ]}
            >
              {isAr ? 'حساب جديد' : 'Register'}
            </Animated.Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.formContainer}>
          {/* Smooth Eased Unfold for Full Name Input */}
          <Animated.View
            pointerEvents={mode === 'register' ? 'auto' : 'none'}
            style={[
              styles.inputWrap,
              {
                height: fullNameHeight,
                marginBottom: fullNameMargin,
                opacity: fullNameOpacity,
                borderWidth: fullNameBorderWidth,
                transform: [{ translateY: fullNameTranslateY }],
                flexDirection: isAr ? 'row-reverse' : 'row',
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={19}
              color={THEME.textSubtle}
              style={isAr ? styles.inputIconAr : styles.inputIconEn}
            />
            <TextInput
              style={[styles.input, { textAlign: isAr ? 'right' : 'left' }]}
              placeholder={isAr ? 'الاسم بالكامل' : 'Full name'}
              placeholderTextColor={THEME.textSubtle}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </Animated.View>

          {/* Email / Username Input */}
          <View
            style={[
              styles.inputWrap,
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={19}
              color={THEME.textSubtle}
              style={isAr ? styles.inputIconAr : styles.inputIconEn}
            />
            <TextInput
              style={[styles.input, { textAlign: isAr ? 'right' : 'left' }]}
              placeholder={
                isAr ? 'البريد الإلكتروني أو اسم المستخدم' : 'Email or username'
              }
              placeholderTextColor={THEME.textSubtle}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View
            style={[
              styles.inputWrap,
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color={THEME.textSubtle}
              style={isAr ? styles.inputIconAr : styles.inputIconEn}
            />
            <TextInput
              style={[styles.input, { textAlign: isAr ? 'right' : 'left' }]}
              placeholder={isAr ? 'كلمة المرور' : 'Password'}
              placeholderTextColor={THEME.textSubtle}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={THEME.textSubtle}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { flexDirection: isAr ? 'row-reverse' : 'row' },
          ]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>
            {mode === 'login'
              ? isAr
                ? 'تسجيل الدخول'
                : 'Sign In'
              : isAr
              ? 'إنشاء الحساب'
              : 'Create Account'}
          </Text>
          <Ionicons
            name={isAr ? 'arrow-back' : 'arrow-forward'}
            size={18}
            color={THEME.cardBg}
            style={isAr ? { marginRight: 8 } : { marginLeft: 8 }}
          />
        </TouchableOpacity>

        {/* Footer Switch Link */}
        <TouchableOpacity
          style={styles.footerToggle}
          onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}
          activeOpacity={0.7}
        >
          <Text style={styles.footerText}>
            {mode === 'login'
              ? isAr
                ? 'ليس لديك حساب؟ '
                : "Don't have an account? "
              : isAr
              ? 'لديك حساب بالفعل؟ '
              : 'Already have an account? '}
            <Text style={styles.footerHighlight}>
              {mode === 'login'
                ? isAr
                  ? 'سجّل الآن'
                  : 'Register'
                : isAr
                ? 'تسجيل الدخول'
                : 'Sign In'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgCanvas,
  },

  /* Hero Image Background */
  heroBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  brandLogo: {
    width: 230,
    height: 100,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },

  /* Curved Bottom Card */
  bottomCard: {
    backgroundColor: THEME.cardBg,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    shadowColor: THEME.textMain,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 12,
    marginTop: -28,
  },

  /* Animated Segmented Switcher */
  segmentContainer: {
    position: 'relative',
    backgroundColor: THEME.bgCanvas,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
  },
  slidingPill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: THEME.cardBg,
    borderRadius: 12,
    shadowColor: THEME.textMain,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    zIndex: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    fontWeight: '800',
  },

  /* Form Inputs */
  formContainer: {
    marginBottom: 14,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: THEME.bgCanvas,
    borderRadius: 16,
    borderColor: THEME.border,
    height: 50,
    paddingHorizontal: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  inputIconEn: {
    marginRight: 10,
  },
  inputIconAr: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: THEME.textMain,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 6,
  },

  /* Primary Button */
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    borderRadius: 18,
    height: 50,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    color: THEME.cardBg,
    fontSize: 15.5,
    fontWeight: '800',
  },

  /* Footer */
  footerToggle: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  footerText: {
    fontSize: 13,
    color: THEME.textMuted,
    fontWeight: '500',
  },
  footerHighlight: {
    color: THEME.primary,
    fontWeight: '700',
  },
});