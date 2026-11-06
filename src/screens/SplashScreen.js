import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { THEME } from '../constants/theme';

// Asset paths
const LOGO_GIF = require('../../assets/logogif.gif');
const SPLASH_BG = require('../../assets/splash.png');

export default function SplashScreen({ onFinish, lang = 'en' }) {
  const isAr = lang === 'ar';

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (typeof onFinish === 'function') {
        onFinish();
      }
    }, 2600);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image 
        source={SPLASH_BG} 
        style={StyleSheet.absoluteFillObject} 
        contentFit="cover" 
      />

      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />

      {/* Center Brand Area */}
      <Animated.View style={[styles.centerWrap, { opacity, transform: [{ scale }] }]}>
        <Image 
          source={LOGO_GIF} 
          style={styles.logo} 
          contentFit="contain"
          autoplay={true}
          onError={(error) => console.warn('Failed to load GIF:', error)}
        />
        <Text style={styles.brandSub}>
          {isAr ? 'الدليل الرقمي لمدينة رشيد' : 'Heritage & Travel Guide'}
        </Text>
      </Animated.View>

      {/* Footer Branding */}
      <Animated.View style={[styles.footerWrap, { opacity }]}>
        <Text style={styles.footerLabel}>
          Developed by <Text style={styles.devName}>DevZix</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    // Increased size for the GIF
    width: 220,
    height: 220,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000', // Set to white to stand out against splash background
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.85)',
    fontWeight: '500',
    marginTop: 6,
  },
  footerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  footerLabel: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '700', // Bold
    letterSpacing: 0.5,
  },
  devName: {
    fontWeight: '900', // Extra bold
    color: '#000000',
    letterSpacing: 0.6,
  },
});