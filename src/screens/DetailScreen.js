// src/screens/DetailScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 400;

export default function DetailScreen({ lang = 'ar', item, onBack, onAskAI }) {
  const isAr = lang === 'ar';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const carouselRef = useRef(null);

  const images =
    item.images && item.images.length >= 5
      ? item.images
      : [
          item.image || 'https://picsum.photos/id/1029/900/600',
          'https://picsum.photos/id/1036/900/600',
          'https://picsum.photos/id/1040/900/600',
          'https://picsum.photos/id/1047/900/600',
          'https://picsum.photos/id/1054/900/600',
        ];

  useEffect(() => {
    const timer = setInterval(() => {
      const nextSlide = (currentSlide + 1) % images.length;
      carouselRef.current?.scrollToIndex({ index: nextSlide, animated: true });
      setCurrentSlide(nextSlide);
    }, 4000);

    return () => clearInterval(timer);
  }, [currentSlide, images.length]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const title = isAr ? item.nameAr || item.titleAr : item.nameEn || item.titleEn;
  const desc = isAr ? item.descAr : item.descEn;
  const address = isAr ? item.addressAr || item.locationAr : item.addressEn || item.locationEn;
  const story = isAr ? item.storyAr : item.storyEn;
  const highlights = isAr ? item.highlightsAr : item.highlightsEn;

  const toggleSpeech = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const narrative = `
      ${title}. 
      ${desc ? (isAr ? 'الوصف: ' : 'Description: ') + desc : ''}. 
      ${item.openTimeAr ? (isAr ? 'مواعيد الزيارة: ' + item.openTimeAr : 'Hours: ' + item.openTimeEn) : ''}
      ${story ? (isAr ? 'القصة والتاريخ: ' : 'The History and Story: ') + story : ''}
    `;

    setIsSpeaking(true);
    Speech.speak(narrative, {
      language: isAr ? 'ar' : 'en',
      rate: 0.92,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  };

  const handleAskAIPress = () => {
    Speech.stop();
    setIsSpeaking(false);
    if (onAskAI) {
      onAskAI(item);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Floating Header Actions */}
      <View style={[styles.floatingHeader, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={styles.circleActionBtn}
          onPress={() => {
            Speech.stop();
            onBack();
          }}
          activeOpacity={0.8}
        >
          <Feather name={isAr ? 'arrow-right' : 'arrow-left'} size={20} color="#0B2B64" />
        </TouchableOpacity>

        {/* Right Action Cluster: AI Explainer Button + TTS Speaker */}
        <View style={[styles.rightCluster, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            style={styles.aiHeaderBtn}
            onPress={handleAskAIPress}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={17} color="#FFFFFF" />
            <Text style={styles.aiHeaderBtnText}>{isAr ? 'اسأل AI' : 'Ask AI'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.circleActionBtn, isSpeaking && styles.speakingActiveBtn]}
            onPress={toggleSpeech}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
              size={22}
              color={isSpeaking ? '#FFFFFF' : '#0052CC'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* 1. TOP CAROUSEL: 400px height with 5 sliding images */}
        <View style={styles.carouselWrapper}>
          <FlatList
            ref={carouselRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentSlide(newIndex);
            }}
            renderItem={({ item: imgUri }) => (
              <Image source={{ uri: imgUri }} style={styles.carouselImage} resizeMode="cover" />
            )}
          />

          <View style={styles.carouselDarkGradient} />

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {images.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentSlide ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 2. CURVED BOTTOM SHEET */}
        <View style={styles.curvedSheet}>
          <View style={styles.sheetHandleBar} />

          {/* Main Title & Address */}
          <View style={[styles.titleHeaderRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
            <View style={{ flex: 1, alignItems: isAr ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.mainTitle, { textAlign: isAr ? 'right' : 'left' }]}>
                {title}
              </Text>
              <View style={[styles.addressBadge, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
                <Ionicons name="location-sharp" size={13} color="#0052CC" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {address}
                </Text>
              </View>
            </View>
          </View>

          {/* AI EXPLAINER INTERACTIVE CARD */}
          <TouchableOpacity
            style={[styles.aiExplainerCard, { flexDirection: isAr ? 'row-reverse' : 'row' }]}
            activeOpacity={0.88}
            onPress={handleAskAIPress}
          >
            <View style={styles.aiExplainerIconWrap}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, alignItems: isAr ? 'flex-end' : 'flex-start' }}>
              <View style={[styles.aiCardHeaderRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
                <Text style={styles.aiExplainerTitle}>
                  {isAr ? 'اسأل رشيدة (AI) للشرح المفصل' : 'Ask Rashida AI to Explain'}
                </Text>
              </View>
              <Text
                style={[styles.aiExplainerSub, { textAlign: isAr ? 'right' : 'left' }]}
                numberOfLines={2}
              >
                {isAr
                  ? 'اضغط هنا لبدء محادثة ذكية فورية مع وكيل الذكاء الاصطناعي لكشف الأسرار والروايات التاريخية'
                  : 'Tap here to launch an instant AI conversation uncovering deep secrets & historic context'}
              </Text>
            </View>
            <Feather
              name={isAr ? 'arrow-left' : 'arrow-right'}
              size={18}
              color="#0052CC"
              style={{ marginHorizontal: 2 }}
            />
          </TouchableOpacity>

          {/* TTS Audio Banner */}
          <TouchableOpacity
            style={[styles.ttsBanner, { flexDirection: isAr ? 'row-reverse' : 'row' }]}
            activeOpacity={0.85}
            onPress={toggleSpeech}
          >
            <View style={styles.ttsIconWrap}>
              <Ionicons
                name={isSpeaking ? 'pause-circle' : 'play-circle'}
                size={26}
                color="#0052CC"
              />
            </View>
            <View style={{ flex: 1, alignItems: isAr ? 'flex-end' : 'flex-start' }}>
              <Text style={styles.ttsBannerTitle}>
                {isSpeaking
                  ? isAr
                    ? 'جارِ القراءة الصوتية الآن...'
                    : 'Reading aloud...'
                  : isAr
                  ? 'استمع إلى المرشد الصوتي التفاعلي'
                  : 'Listen to Audio Guide'}
              </Text>
              <Text style={styles.ttsBannerSub}>
                {isAr
                  ? 'اضغط للاستماع إلى القصة والتفاصيل بصوت نقي'
                  : 'Tap to listen to the history & details'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Info Badges Strip */}
          <View style={[styles.infoBadgesStrip, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
            {item.stars && (
              <View style={styles.infoBadge}>
                <View style={styles.starsCluster}>
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <Ionicons key={i} name="star" size={11} color="#FFB800" />
                  ))}
                </View>
                <Text style={styles.infoBadgeLabel}>{item.rating} / 5.0</Text>
              </View>
            )}

            {(item.openTimeAr || item.dateAr) && (
              <View style={styles.infoBadge}>
                <Ionicons name="time-outline" size={16} color="#0052CC" />
                <Text style={styles.infoBadgeLabel}>
                  {isAr ? item.openTimeAr || item.dateAr : item.openTimeEn || item.dateEn}
                </Text>
              </View>
            )}

            {(item.price || item.ticketPriceAr) && (
              <View style={styles.infoBadge}>
                <Ionicons name="cash-outline" size={16} color="#00A859" />
                <Text style={styles.infoBadgeLabel}>
                  {item.price ? `$${item.price}` : isAr ? item.ticketPriceAr : item.ticketPriceEn}
                </Text>
              </View>
            )}
          </View>

          {/* Section: Overview & Long Description */}
          <View style={styles.sectionBlock}>
            <View style={[styles.sectionHeadingRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionHeading}>
                {isAr ? 'نبذة عامة' : 'Overview & Description'}
              </Text>
            </View>
            <Text style={[styles.bodyDescription, { textAlign: isAr ? 'right' : 'left' }]}>
              {desc}
            </Text>
          </View>

          {/* Section: The Story & Heritage Remark (القصة والتاريخ) */}
          {story && (
            <View style={styles.storyCard}>
              <View style={[styles.storyCardHeader, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
                <MaterialIcons name="auto-stories" size={22} color="#0052CC" />
                <Text style={styles.storyTitle}>
                  {isAr ? 'القصة والرواية التاريخية' : 'The Story & Heritage'}
                </Text>
              </View>
              <Text style={[styles.storyText, { textAlign: isAr ? 'right' : 'left' }]}>
                {story}
              </Text>
            </View>
          )}

          {/* Highlights / Special Features */}
          {highlights && highlights.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={[styles.sectionHeadingRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionHeading}>
                  {isAr ? 'أهم المميزات والملاحظات' : 'Highlights & Features'}
                </Text>
              </View>
              {highlights.map((h, i) => (
                <View
                  key={i}
                  style={[styles.highlightRow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}
                >
                  <Ionicons name="checkmark-circle" size={17} color="#00A859" />
                  <Text style={[styles.highlightText, { textAlign: isAr ? 'right' : 'left' }]}>
                    {h}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#072852',
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight || 24) + 10,
    left: 16,
    right: 16,
    zIndex: 100,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightCluster: {
    alignItems: 'center',
    gap: 10,
  },
  circleActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  aiHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0052CC',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 22,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  aiHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  speakingActiveBtn: {
    backgroundColor: '#0052CC',
  },
  carouselWrapper: {
    width: width,
    height: CAROUSEL_HEIGHT,
    position: 'relative',
    backgroundColor: '#072852',
  },
  carouselImage: {
    width: width,
    height: CAROUSEL_HEIGHT,
  },
  carouselDarkGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 24, 56, 0.28)',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 46,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 22,
    backgroundColor: '#FFFFFF',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  curvedSheet: {
    backgroundColor: '#F7FAFD',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: 14,
    paddingHorizontal: 20,
    minHeight: 500,
  },
  sheetHandleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  titleHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0B2B64',
    lineHeight: 30,
  },
  addressBadge: {
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  addressText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  aiExplainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#C7DBF8',
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  aiExplainerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#0052CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCardHeaderRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  aiExplainerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0B2B64',
  },
  aiBadge: {
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0052CC',
  },
  aiExplainerSub: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  ttsBanner: {
    backgroundColor: '#EBF2FD',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#D4E2F4',
  },
  ttsIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ttsBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0052CC',
  },
  ttsBannerSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  infoBadgesStrip: {
    gap: 10,
    marginBottom: 22,
    flexWrap: 'wrap',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2ECF8',
    gap: 6,
  },
  starsCluster: {
    flexDirection: 'row',
    gap: 2,
  },
  infoBadgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B2B64',
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeadingRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  accentBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#0052CC',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B2B64',
  },
  bodyDescription: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  },
  storyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#DDE9F8',
    marginBottom: 22,
  },
  storyCardHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B2B64',
  },
  storyText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 22,
    fontWeight: '500',
  },
  highlightRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
});