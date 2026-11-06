import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  Animated,
  PanResponder,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { STRINGS } from '../constants/translations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - 44;
const ACCENT_BLUE = THEME?.primary || '#195bf4';

const STORY_SLIDES = [
  {
    id: '1',
    tag: 'ANCIENT CITADEL',
    title: 'Fort of Rosetta',
    desc: 'The historic rampart where the Rosetta Stone was unearthed.',
    imageUrl:
      'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '2',
    tag: 'OTTOMAN HERITAGE',
    title: 'The Living Mansions',
    desc: 'Wander through 30+ preserved Islamic residential palaces.',
    imageUrl:
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '3',
    tag: 'THE CONFLUENCE',
    title: 'Where Nile Meets Sea',
    desc: 'Scenic waterways where the Delta meets the Mediterranean.',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  },
];

export default function GetStartedScreen({ lang = 'en', setLang, onContinue }) {
  useEffect(() => {
    if (lang !== 'en' && typeof setLang === 'function') {
      setLang('en');
    }
  }, []);

  const activeLang = lang || 'en';
  const isAr = activeLang === 'ar';

  // Language Transition Smooth Animation
  const langFade = useRef(new Animated.Value(1)).current;
  const langSlide = useRef(new Animated.Value(0)).current;

  const handleLanguageChange = (newLang) => {
    if (newLang === activeLang) return;
    Animated.parallel([
      Animated.timing(langFade, { toValue: 0.15, duration: 120, useNativeDriver: true }),
      Animated.timing(langSlide, {
        toValue: newLang === 'ar' ? 14 : -14,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (typeof setLang === 'function') setLang(newLang);
      langSlide.setValue(newLang === 'ar' ? -14 : 14);
      Animated.parallel([
        Animated.timing(langFade, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(langSlide, {
          toValue: 0,
          friction: 8,
          tension: 45,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Smooth Carousel Controller
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const currentIndexRef = useRef(0);
  const isUserInteracting = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isUserInteracting.current) return;

      const nextIndex = (currentIndexRef.current + 1) % STORY_SLIDES.length;
      currentIndexRef.current = nextIndex;

      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          offset: nextIndex * CAROUSEL_WIDTH,
          animated: true,
        });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleMomentumScrollEnd = (e) => {
    const newIdx = Math.round(e.nativeEvent.contentOffset.x / CAROUSEL_WIDTH);
    currentIndexRef.current = Math.max(0, Math.min(newIdx, STORY_SLIDES.length - 1));
    isUserInteracting.current = false;
  };

  return (
    <View style={[styles.container, { backgroundColor: THEME.bgCanvas }]}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bgCanvas} translucent={false} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Header Pill */}
        <Animated.View
          style={[
            styles.headerRow,
            {
              flexDirection: isAr ? 'row-reverse' : 'row',
              opacity: langFade,
              transform: [{ translateX: langSlide }],
            },
          ]}
        >
          <Text style={[styles.subHeader, { color: THEME.textMuted }]}>
            {isAr ? 'دليل استكشاف رشيد' : 'DISCOVERY EDITION'}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: THEME.borderSubtle }]}>
            <View style={[styles.statusDot, { backgroundColor: THEME.success }]} />
            <Text style={[styles.statusText, { color: THEME.textMain }]}>
              {isAr ? 'تفاعلي' : 'Live'}
            </Text>
          </View>
        </Animated.View>

        {/* Smooth Hardware-Snapping Image Carousel */}
        <View style={styles.carouselContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={STORY_SLIDES}
            horizontal
            pagingEnabled={false}
            snapToInterval={CAROUSEL_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={() => {
              isUserInteracting.current = true;
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: CAROUSEL_WIDTH,
              offset: CAROUSEL_WIDTH * index,
              index,
            })}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.slideCard, { backgroundColor: THEME.borderSubtle }]}>
                <Image source={{ uri: item.imageUrl }} style={styles.slideImage} />
                <View style={styles.slideOverlay} />
                <Animated.View
                  style={[
                    styles.slideContent,
                    {
                      alignItems: isAr ? 'flex-end' : 'flex-start',
                      opacity: langFade,
                      transform: [{ translateX: langSlide }],
                    },
                  ]}
                >
                  <View style={[styles.tagWrap, { backgroundColor: THEME.cardBg }]}>
                    <Text style={[styles.tagText, { color: ACCENT_BLUE }]}>
                      {item.tag}
                    </Text>
                  </View>
                  <Text style={styles.slideTitle}>{item.title}</Text>
                  <Text style={[styles.slideDesc, { textAlign: isAr ? 'right' : 'left' }]}>
                    {item.desc}
                  </Text>
                </Animated.View>
              </View>
            )}
          />

          {/* Real-time Interpolated Pagination Indicators */}
          <View style={styles.paginationRow}>
            {STORY_SLIDES.map((_, idx) => {
              const dotWidth = scrollX.interpolate({
                inputRange: [
                  (idx - 1) * CAROUSEL_WIDTH,
                  idx * CAROUSEL_WIDTH,
                  (idx + 1) * CAROUSEL_WIDTH,
                ],
                outputRange: [6, 22, 6],
                extrapolate: 'clamp',
              });

              const dotColor = scrollX.interpolate({
                inputRange: [
                  (idx - 1) * CAROUSEL_WIDTH,
                  idx * CAROUSEL_WIDTH,
                  (idx + 1) * CAROUSEL_WIDTH,
                ],
                outputRange: [THEME.border || '#D1D5DB', ACCENT_BLUE, THEME.border || '#D1D5DB'],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={idx}
                  style={[
                    styles.pageIndicator,
                    {
                      width: dotWidth,
                      backgroundColor: dotColor,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Section Header */}
        <Animated.View
          style={[
            styles.selectionLabelRow,
            {
              opacity: langFade,
              transform: [{ translateX: langSlide }],
            },
          ]}
        >
          <Text style={[styles.selectionLabel, { color: THEME.textSubtle }]}>
            {isAr ? 'اختر لغة العرض' : 'SELECT INTERFACE LANGUAGE'}
          </Text>
        </Animated.View>

        {/* Language Selection Tiles */}
        <Animated.View
          style={[
            styles.langList,
            {
              opacity: langFade,
              transform: [{ translateX: langSlide }],
            },
          ]}
        >
          {/* English Option */}
          <TouchableOpacity
            style={[
              styles.langTile,
              {
                backgroundColor: THEME.cardBg,
                borderColor: activeLang === 'en' ? ACCENT_BLUE : THEME.border,
              },
              activeLang === 'en' && { backgroundColor: THEME.primaryLight },
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
            onPress={() => handleLanguageChange('en')}
            activeOpacity={0.88}
          >
            <View style={[styles.langLeft, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
              <View
                style={[
                  styles.codeBadge,
                  {
                    backgroundColor: activeLang === 'en' ? ACCENT_BLUE : THEME.bgCanvas,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.codeBadgeText,
                    {
                      color: activeLang === 'en' ? '#FFFFFF' : THEME.textMuted,
                    },
                  ]}
                >
                  EN
                </Text>
              </View>
              <View style={{ alignItems: isAr ? 'flex-end' : 'flex-start' }}>
                <View style={styles.rowInline}>
                  <Text style={[styles.langTitle, { color: THEME.textMain }]}>
                    English
                  </Text>
                </View>
                <Text style={[styles.langSub, { color: THEME.textMuted }]}>
                  Curated routes & historic audio guides
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.checkSquare,
                {
                  borderColor: activeLang === 'en' ? ACCENT_BLUE : THEME.border,
                  backgroundColor: activeLang === 'en' ? ACCENT_BLUE : THEME.cardBg,
                },
              ]}
            >
              {activeLang === 'en' && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>

          {/* Arabic Option */}
          <TouchableOpacity
            style={[
              styles.langTile,
              {
                backgroundColor: THEME.cardBg,
                borderColor: activeLang === 'ar' ? ACCENT_BLUE : THEME.border,
              },
              activeLang === 'ar' && { backgroundColor: THEME.primaryLight },
              { flexDirection: isAr ? 'row-reverse' : 'row' },
            ]}
            onPress={() => handleLanguageChange('ar')}
            activeOpacity={0.88}
          >
            <View style={[styles.langLeft, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
              <View
                style={[
                  styles.codeBadge,
                  {
                    backgroundColor: activeLang === 'ar' ? ACCENT_BLUE : THEME.bgCanvas,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.codeBadgeText,
                    {
                      color: activeLang === 'ar' ? '#FFFFFF' : THEME.textMuted,
                    },
                  ]}
                >
                  AR
                </Text>
              </View>
              <View style={{ alignItems: isAr ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.langTitle, { color: THEME.textMain }]}>
                  العربية
                </Text>
                <Text style={[styles.langSub, { color: THEME.textMuted }]}>
                  النصوص التراثية والتوثيق الأثري الكامل
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.checkSquare,
                {
                  borderColor: activeLang === 'ar' ? ACCENT_BLUE : THEME.border,
                  backgroundColor: activeLang === 'ar' ? ACCENT_BLUE : THEME.cardBg,
                },
              ]}
            >
              {activeLang === 'ar' && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Rocket Slider Section */}
        <View style={styles.footerWrap}>
          <RocketSlider
            label={isAr ? 'اسحب لبدء الاستكشاف' : 'Slide to start exploring'}
            onComplete={onContinue}
          />
          <View style={styles.guaranteeRow}>
            <Feather name="shield" size={12} color={THEME.textSubtle} />
            <Text style={[styles.guaranteeText, { color: THEME.textSubtle }]}>
              {isAr ? 'تطبيق رسمي • توثيق تاريخي دقيق' : 'Online Map Ready • Heritage Guided'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Blue Rocket Slider Button
function RocketSlider({ onComplete, label }) {
  const [trackWidth, setTrackWidth] = useState(SCREEN_WIDTH - 44);
  const KNOB_SIZE = 52;
  const PADDING = 3;
  const maxDrag = Math.max(0, trackWidth - KNOB_SIZE - PADDING * 2);

  const pan = useRef(new Animated.Value(0)).current;
  const hasTriggered = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 3,
      onPanResponderMove: (_, gesture) => {
        if (hasTriggered.current) return;
        const clampedX = Math.min(Math.max(0, gesture.dx), maxDrag);
        pan.setValue(clampedX);
      },
      onPanResponderRelease: (_, gesture) => {
        if (hasTriggered.current) return;
        if (gesture.dx >= maxDrag * 0.75) {
          hasTriggered.current = true;
          Animated.timing(pan, {
            toValue: maxDrag,
            duration: 120,
            useNativeDriver: true,
          }).start(() => {
            if (typeof onComplete === 'function') onComplete();
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            friction: 7,
            tension: 48,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const textOpacity = pan.interpolate({
    inputRange: [0, maxDrag * 0.45],
    outputRange: [1, 0.05],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.sliderTrack,
        { backgroundColor: THEME.cardBg, borderColor: THEME.border },
      ]}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      {/* Dynamic beam background */}
      <Animated.View
        style={[
          styles.fillBeam,
          {
            backgroundColor: THEME.primaryLight || 'rgba(25, 91, 244, 0.1)',
            width: trackWidth,
            left: -trackWidth + KNOB_SIZE + PADDING * 2,
            transform: [{ translateX: pan }],
          },
        ]}
      />

      {/* Label with directional indicators */}
      <Animated.View style={[styles.labelRow, { opacity: textOpacity }]}>
        <Text style={[styles.sliderLabelText, { color: THEME.textMain }]}>{label}</Text>
        <Ionicons name="chevron-forward" size={13} color={THEME.textSubtle} style={{ marginLeft: 6 }} />
        <Ionicons name="chevron-forward" size={13} color={THEME.border} style={{ marginLeft: -8 }} />
      </Animated.View>

      {/* Vibrant Blue Rocket Slider Knob */}
      <Animated.View
        style={[
          styles.sliderKnob,
          {
            backgroundColor: ACCENT_BLUE,
            transform: [{ translateX: pan }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Ionicons
          name="rocket"
          size={22}
          color="#FFFFFF"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 74 : 44,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  subHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  carouselContainer: {
    marginBottom: 22,
  },
  slideCard: {
    width: CAROUSEL_WIDTH,
    height: 350,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(93, 133, 225, 0.42)',
  },
  slideContent: {
    position: 'absolute',
    bottom: 20,
    left: 18,
    right: 18,
  },
  tagWrap: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  slideDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.92)',
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 19,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  pageIndicator: {
    height: 4,
    borderRadius: 2,
  },
  selectionLabelRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  selectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  langList: {
    gap: 10,
    marginBottom: 20,
  },
  langTile: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.2,
  },
  langLeft: {
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  codeBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBadgeText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langTitle: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  defaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  langSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  checkSquare: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerWrap: {
    paddingTop: 6,
  },
  sliderTrack: {
    height: 60,
    borderRadius: 20,
    borderWidth: 1.2,
    justifyContent: 'center',
    paddingHorizontal: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  fillBeam: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  labelRow: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderLabelText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sliderKnob: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#195bf4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  guaranteeText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
});