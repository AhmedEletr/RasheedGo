// src/screens/AIChatScreen.js
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Animated,
  Easing,
  Image,
  PanResponder,
  useWindowDimensions,
  Alert,
  Linking,
} from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
} from 'react-native-svg';

import { streamGeminiChatREST } from '../services/geminiService';
import { runBingWebSearch } from '../services/searchService';
import { generateAndHostFluxImage } from '../services/imageService';

// Optional native media libraries for saving to Camera Roll
let MediaLibrary = null;
let FileSystem = null;
try {
  MediaLibrary = require('expo-media-library');
} catch {}
try {
  FileSystem = require('expo-file-system');
} catch {}

/* =====================================================================
   1. DESIGN SYSTEM TOKENS (HAIRLINE BORDERS, CLEAN SURFACES)
   ===================================================================== */
export const THEME = {
  bg: '#FFFFFF',
  subtleBg: '#F8FAFC',
  cardBg: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  surfaceHover: '#E2E8F0',
  border: '#E2E8F0', // Clean 1px hairline border
  borderHairline: 'rgba(15, 23, 42, 0.08)',

  inkPrimary: '#090D16',
  inkSecondary: '#475569',
  inkMuted: '#94A3B8',
  inkFaint: '#CBD5E1',

  bluePrimary: '#1D4ED8',
  blueVibrant: '#2563EB',
  blueLight: '#3B82F6',
  blueSky: '#60A5FA',
  blueSoft: '#EFF6FF',
  blueIce: '#BFDBFE',
  beamCyan: '#38BDF8',
  beamWhite: '#FFFFFF',

  palmDeep: '#14532D',
  palmForest: '#15803D',
  palmEmerald: '#22C55E',
  palmLight: '#4ADE80',
  palmSunlit: '#86EFAC',

  codeBgLight: '#FFFFFF',
  codeHeaderLight: '#F8FAFC',
  codeBorderLight: '#E2E8F0',
  codeTextDark: '#0F172A',
};

const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 50;
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const copyToClipboard = async (text) => {
  try {
    const ExpoClipboard = require('expo-clipboard');
    if (ExpoClipboard?.setStringAsync) {
      await ExpoClipboard.setStringAsync(text);
      return true;
    }
  } catch {
    try {
      const { Clipboard } = require('react-native');
      if (Clipboard?.setString) {
        Clipboard.setString(text);
        return true;
      }
    } catch {}
  }
  return false;
};

const CARDS_DATA = [
  {
    id: 'agent',
    type: 'agent',
    title: 'Claim your own agent',
    desc: 'Autonomous guide with memory that grows with you.',
    prompt: 'Explain how you can serve as an autonomous Rosetta historical guide agent.',
  },
  {
    id: 'image',
    type: 'image',
    title: 'Flux Image Studio',
    desc: 'Generate with Cloudflare Flux & host on ImgBB for 7 days.',
    prompt: 'Paint a cinematic golden hour sunset over Rosetta where the Nile meets the Mediterranean.',
  },
  {
    id: 'heritage',
    type: 'heritage',
    title: 'Live Bing Search',
    desc: 'Search real-time archaeological discoveries in Rosetta.',
    prompt: 'Search the web for recent archaeological excavations and museum discoveries in Rosetta Rashid Egypt.',
  },
];

/* =====================================================================
   2. NOVIKOV 8-SPOKE FADE SPINNER
   ===================================================================== */
function NovikovSpokeSpinner({ size = 20, color = THEME.inkPrimary }) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ rotate: spin }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 3L12 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={1.0} />
        <Path d="M18.3639 5.63605L16.2426 7.75737" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.88} />
        <Path d="M21 12L18 12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.76} />
        <Path d="M18.3641 18.3639L16.2428 16.2426" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.64} />
        <Path d="M12 21L12 18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.52} />
        <Path d="M5.63623 18.3639L7.75755 16.2426" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
        <Path d="M3 12L6 12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.28} />
        <Path d="M5.63586 5.63605L7.75718 7.75737" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.16} />
      </Svg>
    </Animated.View>
  );
}

/* =====================================================================
   3. ICONS
   ===================================================================== */
function RocketLogo({ size = 14 }) {
  return (
    <Svg viewBox="0 0 100 120" width={size} height={size * 1.2}>
      <Path
        d="M 50,7 C 57.5,10.5 63,41.5 64.5,61.5 C 65.5,71.5 76,89.5 87.5,111.5 C 91,116 78,115.5 68,107.5 C 60,103.5 54,100 50,100 C 46,100 40,103.5 32,107.5 C 22,115.5 9,116 12.5,111.5 C 24,89.5 34.5,71.5 35.5,61.5 C 37,41.5 42.5,10.5 50,7 Z"
        fill={THEME.inkPrimary}
      />
    </Svg>
  );
}

export function SvgIcon({ name, size = 18, color = THEME.inkPrimary, strokeWidth = 2 }) {
  switch (name) {
    case 'chevronLeft':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Path d="m15 18-6-6 6-6" />
        </Svg>
      );
    case 'redoCycle':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <Path d="M3 3v5h5" />
          <Path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <Path d="M21 21v-5h-5" />
        </Svg>
      );
    case 'waveVoice':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
          <Path d="M12 3v18" />
          <Path d="M8 8v8" />
          <Path d="M4 11v2" />
          <Path d="M16 6v12" />
          <Path d="M20 10v4" />
        </Svg>
      );
    case 'download':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <Path d="m7 10 5 5 5-5" />
          <Path d="M12 15V3" />
        </Svg>
      );
    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M20 6 9 17l-5-5" />
        </Svg>
      );
    case 'copy':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <Path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </Svg>
      );
    case 'globe':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <Path d="M2 12h20" />
        </Svg>
      );
    case 'palette':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="13.5" cy="6.5" r=".5" fill={color} />
          <Circle cx="17.5" cy="10.5" r=".5" fill={color} />
          <Circle cx="8.5" cy="7.5" r=".5" fill={color} />
          <Circle cx="6.5" cy="12.5" r=".5" fill={color} />
          <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.12a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.51 5.56-5.56C22 6.5 17.5 2 12 2Z" />
        </Svg>
      );
    case 'plus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
          <Path d="M12 5v14" />
          <Path d="M5 12h14" />
        </Svg>
      );
    case 'arrowUp':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Path d="m5 12 7-7 7 7" />
          <Path d="M12 19V5" />
        </Svg>
      );
    case 'close':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
          <Path d="M18 6 6 18" />
          <Path d="m6 6 12 12" />
        </Svg>
      );
    case 'stop':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color}>
          <Rect x="6" y="6" width="12" height="12" rx="2.5" />
        </Svg>
      );
    case 'camera':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <Circle cx="12" cy="13" r="4" />
        </Svg>
      );
    case 'image':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Rect width="18" height="18" x="3" y="3" rx="4" />
          <Circle cx="8.5" cy="8.5" r="1.5" />
          <Path d="m21 15-5-5L5 21" />
        </Svg>
      );
    case 'file':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <Path d="M14 2v6h6" />
        </Svg>
      );
    case 'externalLink':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M15 3h6v6" />
          <Path d="M10 14 21 3" />
          <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </Svg>
      );
    default:
      return null;
  }
}

function ReliableFavicon({ source, size = 18 }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !source.favicon) {
    return (
      <View
        style={[
          styles.fallbackFaviconBox,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: source.fallbackColor || THEME.blueVibrant },
        ]}
      >
        <Text style={[styles.fallbackFaviconLetter, { fontSize: size * 0.55 }]}>
          {source.fallbackInitial || source.domain?.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: source.favicon }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onError={() => setHasError(true)}
      resizeMode="cover"
    />
  );
}

export function RasheedaMascotOrb({ size = 32 }) {
  return (
    <View style={{ width: size, height: size * 1.15, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size * 1.15} viewBox="0 0 50 56">
        <Defs>
          <RadialGradient id="mascotSphereGrad" cx="36%" cy="30%" r="68%">
            <Stop offset="0%" stopColor="#93C5FD" />
            <Stop offset="30%" stopColor="#3B82F6" />
            <Stop offset="70%" stopColor="#1D4ED8" />
            <Stop offset="100%" stopColor="#0B132B" />
          </RadialGradient>
          <LinearGradient id="palmArchGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor={THEME.palmDeep} />
            <Stop offset="50%" stopColor={THEME.palmForest} />
            <Stop offset="100%" stopColor={THEME.palmLight} />
          </LinearGradient>
        </Defs>

        <Path d="M 25,18 C 22,8 14,3 7,7 C 12,12 18,17 24,19 Z" fill={THEME.palmDeep} opacity={0.85} />
        <Path d="M 25,18 C 28,8 36,3 43,7 C 38,12 32,17 26,19 Z" fill={THEME.palmDeep} opacity={0.85} />
        <Path d="M 23,20 C 18,13 11,10 2,13 C 2,13 7,10 13,8 C 17,7 21,11 23,17 Z" fill="url(#palmArchGrad)" />
        <Path d="M 27,20 C 32,13 39,10 48,13 C 48,13 43,10 37,8 C 33,7 29,11 27,17 Z" fill="url(#palmArchGrad)" />
        <Circle cx="25" cy="35" r="16.5" fill="url(#mascotSphereGrad)" />
        <Circle cx="19.2" cy="34" r="3.7" fill="#FFFFFF" />
        <Circle cx="20" cy="34" r="2.2" fill="#090D16" />
        <Circle cx="30.8" cy="34" r="3.7" fill="#FFFFFF" />
        <Circle cx="31.6" cy="34" r="2.2" fill="#090D16" />
      </Svg>
    </View>
  );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

function LuminousBeamBorder({ width, height, cornerRadius = 24 }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!width || !height) return;
    anim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [width, height, anim]);

  if (!width || !height) return null;

  const pathD = `M 0,${height} L 0,${cornerRadius} A ${cornerRadius},${cornerRadius} 0 0 1 ${cornerRadius},0 L ${
    width - cornerRadius
  },0 A ${cornerRadius},${cornerRadius} 0 0 1 ${width},${cornerRadius} L ${width},${height}`;

  const perimeter = (height - cornerRadius) * 2 + (width - cornerRadius * 2) + Math.PI * cornerRadius;
  const beamLength = Math.max(160, width * 0.55);
  const cycleDistance = perimeter + beamLength;

  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -cycleDistance],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="radiantBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={THEME.bluePrimary} stopOpacity="0" />
            <Stop offset="25%" stopColor={THEME.blueVibrant} stopOpacity="0.7" />
            <Stop offset="60%" stopColor={THEME.beamCyan} stopOpacity="1" />
            <Stop offset="92%" stopColor={THEME.beamWhite} stopOpacity="1" />
            <Stop offset="100%" stopColor={THEME.beamCyan} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        <Path d={pathD} stroke={THEME.border} strokeWidth={1} fill="none" />
        <AnimatedPath
          d={pathD}
          stroke={THEME.beamCyan}
          strokeWidth={4.5}
          strokeOpacity={0.25}
          strokeDasharray={[beamLength * 1.1, perimeter]}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          strokeLinecap="round"
        />
        <AnimatedPath
          d={pathD}
          stroke="url(#radiantBeamGrad)"
          strokeWidth={2}
          strokeDasharray={[beamLength, perimeter]}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

/* =====================================================================
   4. STREAMING-NATIVE MARKDOWN RENDERER
   ===================================================================== */
function MarkdownMessage({ content, isUser, onOpenSources }) {
  const isArabic = useMemo(() => /[\u0600-\u06FF]/.test(content || ''), [content]);

  const renderInlineSpans = (text, keyPrefix) => {
    const regex = /(\[\d+\]|\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      const k = `${keyPrefix}-${idx}`;

      const citMatch = part.match(/^\[(\d+)\]$/);
      if (citMatch) {
        return (
          <Text key={k} style={styles.citationBadge} onPress={() => onOpenSources?.()}>
            {' '}{citMatch[1]}{' '}
          </Text>
        );
      }

      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <Text
            key={k}
            style={styles.mdLinkText}
            onPress={() => Linking.openURL(linkMatch[2]).catch(() => {})}
          >
            {linkMatch[1]}
          </Text>
        );
      }

      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <Text key={k} style={styles.inlineCodePill}>
            {' '}{part.slice(1, -1)}{' '}
          </Text>
        );
      }

      if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
        return (
          <Text key={k} style={{ fontWeight: '700', fontStyle: 'italic', color: THEME.inkPrimary }}>
            {part.slice(3, -3)}
          </Text>
        );
      }

      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <Text key={k} style={{ fontWeight: '700', color: THEME.inkPrimary }}>
            {part.slice(2, -2)}
          </Text>
        );
      }

      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <Text key={k} style={{ fontStyle: 'italic', color: THEME.inkSecondary }}>
            {part.slice(1, -1)}
          </Text>
        );
      }

      if (part.startsWith('~~') && part.endsWith('~~') && part.length > 4) {
        return (
          <Text key={k} style={{ textDecorationLine: 'line-through', color: THEME.inkMuted }}>
            {part.slice(2, -2)}
          </Text>
        );
      }

      return <Text key={k}>{part}</Text>;
    });
  };

  const renderBlocks = () => {
    if (!content) return null;

    const codeSegments = content.split(/(```[\s\S]*?```)/g);

    return codeSegments.map((segment, segIdx) => {
      if (segment.startsWith('```') && segment.endsWith('```')) {
        const raw = segment.slice(3, -3).trim();
        const lines = raw.split('\n');
        let language = 'CODE';
        let body = raw;

        if (lines.length > 1 && !lines[0].includes(' ') && lines[0].length < 15) {
          language = lines[0].trim().toUpperCase();
          body = lines.slice(1).join('\n');
        }

        return (
          <View key={`code-${segIdx}`} style={styles.codeBlockCardLight}>
            <View style={styles.codeBlockHeaderLight}>
              <Text style={styles.codeBlockLangLight}>{language}</Text>
              <Pressable
                style={styles.codeCopyBtnLight}
                onPress={() => copyToClipboard(body)}
                hitSlop={6}
              >
                <SvgIcon name="copy" size={13} color={THEME.inkSecondary} />
                <Text style={styles.codeCopyTextLight}>Copy</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.codeBlockContentLight} selectable={true}>{body}</Text>
            </ScrollView>
          </View>
        );
      }

      const lines = segment.split('\n');
      return lines.map((line, lineIdx) => {
        const lineKey = `line-${segIdx}-${lineIdx}`;
        const trimmed = line.trim();

        if (!trimmed) {
          return <View key={lineKey} style={{ height: 6 }} />;
        }

        if (/^(---|___|\*\*\*)$/.test(trimmed)) {
          return <View key={lineKey} style={styles.mdDivider} />;
        }

        if (line.startsWith('# ')) {
          return <Text key={lineKey} style={[styles.mdH1, isArabic && styles.rtlText]}>{renderInlineSpans(line.slice(2), lineKey)}</Text>;
        }
        if (line.startsWith('## ')) {
          return <Text key={lineKey} style={[styles.mdH2, isArabic && styles.rtlText]}>{renderInlineSpans(line.slice(3), lineKey)}</Text>;
        }
        if (line.startsWith('### ')) {
          return <Text key={lineKey} style={[styles.mdH3, isArabic && styles.rtlText]}>{renderInlineSpans(line.slice(4), lineKey)}</Text>;
        }
        if (line.startsWith('#### ')) {
          return <Text key={lineKey} style={[styles.mdH4, isArabic && styles.rtlText]}>{renderInlineSpans(line.slice(5), lineKey)}</Text>;
        }

        if (line.startsWith('> ')) {
          return (
            <View key={lineKey} style={[styles.blockquoteRowLight, isArabic && { borderLeftWidth: 0, borderRightWidth: 3.5 }]}>
              <Text style={[styles.blockquoteTextLight, isArabic && styles.rtlText]}>
                {renderInlineSpans(line.slice(2), lineKey)}
              </Text>
            </View>
          );
        }

        const taskMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.*)/);
        if (taskMatch) {
          const checked = taskMatch[1].toLowerCase() === 'x';
          return (
            <View key={lineKey} style={[styles.listRow, isArabic && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.taskCheckbox, checked && styles.taskCheckboxActive]}>
                {checked && <SvgIcon name="check" size={10} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={[styles.listText, checked && { textDecorationLine: 'line-through', color: THEME.inkMuted }, isArabic && styles.rtlText]}>
                {renderInlineSpans(taskMatch[2], lineKey)}
              </Text>
            </View>
          );
        }

        if (/^[-*+]\s+/.test(trimmed)) {
          return (
            <View key={lineKey} style={[styles.listRow, isArabic && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={[styles.listText, isArabic && styles.rtlText]}>
                {renderInlineSpans(trimmed.replace(/^[-*+]\s+/, ''), lineKey)}
              </Text>
            </View>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <View key={lineKey} style={[styles.listRow, isArabic && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.numBullet}>{numMatch[1]}.</Text>
              <Text style={[styles.listText, isArabic && styles.rtlText]}>
                {renderInlineSpans(numMatch[2], lineKey)}
              </Text>
            </View>
          );
        }

        if (trimmed.startsWith('|') && trimmed.endsWith('|') && !trimmed.includes('---')) {
          const cells = trimmed.slice(1, -1).split('|');
          return (
            <View key={lineKey} style={styles.tableRow}>
              {cells.map((c, cIdx) => (
                <View key={`cell-${cIdx}`} style={styles.tableCell}>
                  <Text style={styles.tableCellText}>{renderInlineSpans(c.trim(), `${lineKey}-cell-${cIdx}`)}</Text>
                </View>
              ))}
            </View>
          );
        }

        return (
          <Text
            key={lineKey}
            style={[
              isUser ? styles.userBubbleText : styles.assistantText,
              isArabic && styles.rtlText,
            ]}
            selectable={true}
          >
            {renderInlineSpans(line, lineKey)}
          </Text>
        );
      });
    });
  };

  return <View style={styles.mdContainer}>{renderBlocks()}</View>;
}

/* =====================================================================
   5. ATTACHMENT MODAL
   ===================================================================== */
export function AttachmentModal({ visible, onClose, onSelect }) {
  const options = [
    { id: 'camera', label: 'Take a photo', icon: 'camera' },
    { id: 'gallery', label: 'Photo Library', icon: 'image' },
    { id: 'file', label: 'Document File', icon: 'file' },
  ];

  if (!visible) return null;

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetOverlayRoot}>
        <Pressable style={styles.transparentBackdrop} onPress={onClose} />
        <View style={styles.attachmentSheetPanel}>
          <View style={styles.sheetTopControls}>
            <Text style={styles.sheetPrimaryTitle}>Add Attachment</Text>
            <Pressable onPress={onClose} style={styles.sheetCloseCircularBtn} hitSlop={8}>
              <SvgIcon name="close" size={13} color={THEME.inkSecondary} />
            </Pressable>
          </View>

          {options.map((opt) => (
            <Pressable
              key={opt.id}
              style={({ pressed }) => [styles.attachOptionRow, pressed && { backgroundColor: THEME.subtleBg }]}
              onPress={() => {
                onSelect({
                  name: opt.id === 'file' ? 'Rosetta_Monograph.pdf' : 'Citadel_Snapshot.jpg',
                  uri: opt.id === 'file' ? null : `https://picsum.photos/seed/${uid()}/400/400`,
                });
                onClose();
              }}
            >
              <View style={styles.attachOptionIcon}>
                <SvgIcon name={opt.icon} size={18} color={THEME.blueVibrant} strokeWidth={2} />
              </View>
              <Text style={styles.attachOptionText}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

/* =====================================================================
   6. SHEET & HEADER COMPONENTS
   ===================================================================== */
export function SwipeableSourcesSheet({ visible, onClose, sources }) {
  const { height: screenH } = useWindowDimensions();
  const snapMid = screenH * 0.55;
  const translateY = useRef(new Animated.Value(screenH)).current;
  const currentSnapRef = useRef('mid');

  useEffect(() => {
    if (visible) {
      currentSnapRef.current = 'mid';
      Animated.spring(translateY, {
        toValue: snapMid,
        useNativeDriver: true,
        bounciness: 3,
        speed: 13,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: screenH,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, screenH, snapMid, translateY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
        onPanResponderMove: (_, gesture) => {
          const baseOffset = currentSnapRef.current === 'full' ? 0 : snapMid;
          const target = baseOffset + gesture.dy;
          if (target >= 0) translateY.setValue(target);
        },
        onPanResponderRelease: (_, gesture) => {
          if (currentSnapRef.current === 'mid') {
            if (gesture.dy < -50 || gesture.vy < -0.5) {
              currentSnapRef.current = 'full';
              Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 2 }).start();
            } else if (gesture.dy > 60 || gesture.vy > 0.6) {
              Animated.timing(translateY, { toValue: screenH, duration: 200, useNativeDriver: true }).start(() => onClose());
            } else {
              Animated.spring(translateY, { toValue: snapMid, useNativeDriver: true, bounciness: 4 }).start();
            }
          } else if (currentSnapRef.current === 'full') {
            if (gesture.dy > 50 || gesture.vy > 0.5) {
              currentSnapRef.current = 'mid';
              Animated.spring(translateY, { toValue: snapMid, useNativeDriver: true, bounciness: 3 }).start();
            } else {
              Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 3 }).start();
            }
          }
        },
      }),
    [snapMid, screenH, onClose, translateY]
  );

  if (!visible) return null;

  return (
    <Modal visible={true} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.sheetOverlayRoot} pointerEvents="box-none">
        <Pressable style={styles.transparentBackdrop} onPress={onClose} />

        <Animated.View style={[styles.fullSwipeableSheet, { height: screenH, transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers} style={styles.sheetDraggableHandleZone}>
            <View style={styles.sheetPillHandle} />
            <View style={styles.sheetTopControls}>
              <View style={styles.sheetTitleGroup}>
                <Text style={styles.sheetPrimaryTitle}>Bing Live Sources</Text>
                <View style={styles.sheetCounterPill}>
                  <Text style={styles.sheetCounterText}>{sources.length} indexed</Text>
                </View>
              </View>
              <Pressable onPress={onClose} style={styles.sheetCloseCircularBtn} hitSlop={8}>
                <SvgIcon name="close" size={13} color={THEME.inkSecondary} />
              </Pressable>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sourcesScrollContainer}>
            {sources.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.sourceRecordCard, pressed && { backgroundColor: THEME.subtleBg }]}
                onPress={() => copyToClipboard(item.url)}
              >
                <ReliableFavicon source={item} size={28} />
                <View style={styles.sourceRecordInfo}>
                  <Text style={styles.sourceRecordTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.sourceRecordDomain}>{item.domain}</Text>
                  <Text style={styles.sourceRecordDesc} numberOfLines={3}>{item.description}</Text>
                </View>
                <SvgIcon name="externalLink" size={14} color={THEME.inkMuted} />
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function HeaderBar({ onBack, onRedo, modelName = 'astromind-a1-mini' }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotationCount = useRef(0);

  const handleRedoPress = () => {
    rotationCount.current += 1;
    Animated.timing(rotateAnim, {
      toValue: rotationCount.current,
      duration: 620,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
      useNativeDriver: true,
    }).start();

    if (onRedo) onRedo();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.headerContainer}>
      <Pressable style={({ pressed }) => [styles.headerBtn, pressed && styles.btnPressed]} onPress={onBack} hitSlop={8}>
        <SvgIcon name="chevronLeft" size={19} color={THEME.inkPrimary} strokeWidth={2.4} />
      </Pressable>

      <View style={styles.headerCenterArea}>
        {/* Model Pill without Chevron Down */}
        <View style={styles.headerModelPill}>
          <RocketLogo size={13} />
          <Text style={styles.headerModelText}>{modelName}</Text>
        </View>
      </View>

      <Pressable style={({ pressed }) => [styles.headerBtn, pressed && styles.btnPressed]} onPress={handleRedoPress} hitSlop={8}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <SvgIcon name="redoCycle" size={18} color={THEME.inkPrimary} strokeWidth={2.2} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

export function SourcesBadgeDiv({ sources, onPress }) {
  const previewSources = sources.slice(0, 3);

  return (
    <Pressable style={({ pressed }) => [styles.sourcesAboveLabelDiv, pressed && styles.btnPressed]} onPress={onPress}>
      <View style={styles.faviconsAvatarStack}>
        {previewSources.map((item, index) => (
          <View
            key={item.id}
            style={[styles.avatarWrapCircle, { zIndex: 10 - index, marginLeft: index === 0 ? 0 : -9 }]}
          >
            <ReliableFavicon source={item} size={18} />
          </View>
        ))}
      </View>
      <Text style={styles.sourcesBadgeLabelText}>{sources.length} Bing Sources</Text>
      <View style={styles.sourcesIndicatorDot} />
    </Pressable>
  );
}

/* =====================================================================
   7. CHAT BUBBLE (WITH INLINE WAITING SPINNER & FLOATING DOWNLOAD ICON)
   ===================================================================== */
export function ChatBubble({ message, onOpenSources }) {
  const lastTapRef = useRef(0);

  const handleDoubleTap = async () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      const textToCopy = message.text || message.prompt;
      if (textToCopy) await copyToClipboard(textToCopy);
    }
    lastTapRef.current = now;
  };

  const handleDownloadImageToGallery = async (imageUri) => {
    if (!imageUri) return;
    try {
      if (MediaLibrary && FileSystem) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera roll permissions are required to save images.');
          return;
        }

        let localFileUri = '';
        if (imageUri.startsWith('data:')) {
          const base64Data = imageUri.split(',')[1];
          localFileUri = `${FileSystem.cacheDirectory}flux_${Date.now()}.jpg`;
          await FileSystem.writeAsStringAsync(localFileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else {
          const ext = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
          localFileUri = `${FileSystem.cacheDirectory}flux_${Date.now()}.${ext}`;
          const res = await FileSystem.downloadAsync(imageUri, localFileUri);
          localFileUri = res.uri;
        }

        await MediaLibrary.saveToLibraryAsync(localFileUri);
        Alert.alert('Image Saved', 'The image has been saved to your Photo Library.');
        return;
      }

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const a = document.createElement('a');
        a.href = imageUri;
        a.download = `flux_${Date.now()}.jpg`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      await copyToClipboard(imageUri);
      Alert.alert('Link Copied', 'Direct download requires expo-media-library. Image URL copied to clipboard.');
    } catch (err) {
      console.error('[ChatBubble] Download failed:', err);
      Alert.alert('Download Failed', 'Could not save the image to your gallery.');
    }
  };

  if (message.role === 'user') {
    return (
      <View style={styles.userMessageRow}>
        <Pressable onPress={handleDoubleTap} style={styles.userBubble}>
          {message.attachment?.uri && (
            <Image source={{ uri: message.attachment.uri }} style={styles.userAttachmentImg} />
          )}
          <MarkdownMessage content={message.text} isUser={true} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.assistantMessageRow}>
      {message.sources && message.sources.length > 0 && (
        <SourcesBadgeDiv sources={message.sources} onPress={() => onOpenSources(message.sources)} />
      )}

      {/* Cloudflare Flux Generated Image Output */}
      {message.kind === 'image' && (
        <View style={styles.assistantImageWrapper}>
          <View style={styles.assistantImageCard}>
            {message.imageUri ? (
              <>
                <Image source={{ uri: message.imageUri }} style={styles.assistantImage} resizeMode="cover" />
                {/* Floating Download Icon on Bottom Right Corner */}
                <Pressable
                  style={styles.floatingImageDownloadBtn}
                  onPress={() => handleDownloadImageToGallery(message.imageUri)}
                  hitSlop={8}
                >
                  <SvgIcon name="download" size={16} color="#FFFFFF" strokeWidth={2.4} />
                </Pressable>
              </>
            ) : (
              /* Exclusive 8-Spoke Spoke Fade Spinner (Zero Extra Elements) */
              <View style={styles.assistantImageLoadingOnly}>
                <NovikovSpokeSpinner size={38} color={THEME.inkPrimary} />
              </View>
            )}
          </View>
        </View>
      )}

      {/* Spinner inside the AI response bubble until streaming tokens arrive */}
      {message.streaming && !message.text && (
        <View style={styles.assistantResponseWaitingContainer}>
          <NovikovSpokeSpinner size={20} color={THEME.inkPrimary} />
        </View>
      )}

      {/* Formatted Markdown Assistant Response */}
      {!!message.text && (
        <Pressable onPress={handleDoubleTap}>
          <MarkdownMessage
            content={message.text}
            isUser={false}
            onOpenSources={() => message.sources && onOpenSources(message.sources)}
          />
        </Pressable>
      )}
    </View>
  );
}

/* =====================================================================
   8. MAIN SCREEN ROOT
   ===================================================================== */
export default function AIChatScreen({
  onBack,
  initialPrompt = null,
  onClearInitialPrompt = null,
  onOpenLiveVoice = null,
}) {
  const chatScrollRef = useRef(null);
  const cancelStreamRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [imageActive, setImageActive] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [activeSheetSources, setActiveSheetSources] = useState([]);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(true);

  const handleSend = useCallback(
    async (customPrompt) => {
      const query = (customPrompt ?? inputText).trim();
      if ((!query && !attachment) || isBusy) return;

      const userMessage = { id: uid(), role: 'user', text: query, attachment };
      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      setAttachment(null);
      setIsBusy(true);

      const botId = uid();

      // CASE A: Cloudflare Flux-1-Schnell + 7-Day ImgBB Storage
      if (imageActive) {
        setMessages((prev) => [
          ...prev,
          {
            id: botId,
            role: 'assistant',
            kind: 'image',
            prompt: query,
            imageUri: null,
            text: '',
            streaming: true,
          },
        ]);

        try {
          const hostedUrl = await generateAndHostFluxImage(query);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId
                ? {
                    ...m,
                    imageUri: hostedUrl,
                    text: '',
                    streaming: false,
                  }
                : m
            )
          );
        } catch (err) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId
                ? { ...m, text: `Flux Error: ${err.message || 'Image generation failed.'}`, streaming: false }
                : m
            )
          );
        } finally {
          setIsBusy(false);
          setImageActive(false);
        }
        return;
      }

      // CASE B: Live Web Search Grounding via Bing -> Gemini
      if (searchActive) {
        setMessages((prev) => [
          ...prev,
          {
            id: botId,
            role: 'assistant',
            kind: 'search',
            sources: [],
            text: '',
            streaming: true,
          },
        ]);

        const searchSources = await runBingWebSearch(query);

        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, sources: searchSources } : m))
        );

        const groundingPrompt = `
You are Rasheeda AI, an intelligent research assistant.
The following are real-time Bing search results for the user query: "${query}"

--- BING SEARCH DATA ---
${searchSources
  .map(
    (s, i) =>
      `[${i + 1}] Title: ${s.title}\nDomain: ${s.domain}\nURL: ${s.url}\nSummary: ${s.description}`
  )
  .join('\n\n')}
--- END SEARCH DATA ---

Instructions:
1. Synthesize a coherent, concise answer directly answering the user query using the above Bing search data.
2. Format your response cleanly using Markdown (bolding, lists, and headers where helpful).
3. Insert citation markers like [1], [2] immediately following referenced facts.
`;

        cancelStreamRef.current = streamGeminiChatREST({
          prompt: groundingPrompt,
          enableSearch: false,
          onToken: (_, fullText) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === botId ? { ...m, text: fullText } : m))
            );
          },
          onComplete: () => {
            setMessages((prev) =>
              prev.map((m) => (m.id === botId ? { ...m, streaming: false } : m))
            );
            setIsBusy(false);
          },
          onError: (err) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botId
                  ? { ...m, text: `Error: ${err.message || 'Streaming failed.'}`, streaming: false }
                  : m
              )
            );
            setIsBusy(false);
          },
        });
        return;
      }

      // CASE C: Standard Direct Gemini Stream
      setMessages((prev) => [
        ...prev,
        { id: botId, role: 'assistant', kind: 'text', sources: [], text: '', streaming: true },
      ]);

      cancelStreamRef.current = streamGeminiChatREST({
        prompt: `Answer using Markdown formatting (bolding, lists, tables, and headers where applicable):\n\n${query}`,
        enableSearch: false,
        onToken: (_, fullText) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, text: fullText } : m))
          );
        },
        onComplete: () => {
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, streaming: false } : m))
          );
          setIsBusy(false);
        },
        onError: (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId ? { ...m, text: `Error: ${err.message}`, streaming: false } : m
            )
          );
          setIsBusy(false);
        },
      });
    },
    [inputText, attachment, isBusy, imageActive, searchActive]
  );

  const handleStopGeneration = () => {
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
      cancelStreamRef.current = null;
    }
    setIsBusy(false);
  };

  const handleRedoChat = () => {
    handleStopGeneration();
    setMessages([]);
    setInputText('');
    setAttachment(null);
    setIsBusy(false);
    setShowGetStarted(true);
    setSearchActive(false);
    setImageActive(false);
  };

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      const t = setTimeout(() => {
        handleSend(initialPrompt);
        if (onClearInitialPrompt) onClearInitialPrompt();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [initialPrompt]);

  return (
    <KeyboardAvoidingView
      style={styles.mainScreenRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={{ paddingTop: STATUS_TOP }}>
        <HeaderBar onBack={onBack} onRedo={handleRedoChat} modelName="astromind-a1-mini" />
      </View>

      <View style={styles.bodyStage}>
        {messages.length === 0 ? (
          <View style={styles.emptyViewWrap}>
            <View style={styles.centerBrandWrap}>
              <RasheedaMascotOrb size={54} />
              <Text style={styles.centerBrandText}>Rasheeda AI</Text>
              <Text style={styles.centerBrandSub}>
                astromind-a1-mini • Bing Web Grounding • Cloudflare Flux
              </Text>
            </View>

            {showGetStarted && (
              <View style={styles.getStartedContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
                  {CARDS_DATA.map((item) => (
                    <Pressable
                      key={item.id}
                      style={({ pressed }) => [styles.cardContainer, pressed && { transform: [{ scale: 0.98 }] }]}
                      onPress={() => {
                        if (item.id === 'image') setImageActive(true);
                        if (item.id === 'heritage') setSearchActive(true);
                        handleSend(item.prompt);
                      }}
                    >
                      <View style={styles.cardIconBox}>
                        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                          <Rect x="4" y="3" width="13" height="15" rx="3" fill="#60A5FA" />
                          <Rect x="7" y="6" width="13" height="15" rx="3" fill="#2563EB" />
                        </Svg>
                      </View>
                      <View style={styles.cardTextContent}>
                        <Text style={styles.cardItemTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.cardItemDesc} numberOfLines={2}>{item.desc}</Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        ) : (
          <ScrollView
            ref={chatScrollRef}
            contentContainerStyle={styles.chatScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                message={m}
                onOpenSources={(srcs) => {
                  setActiveSheetSources(srcs);
                  setIsSourcesOpen(true);
                }}
              />
            ))}
          </ScrollView>
        )}

        <ComposerDock
          value={inputText}
          onChangeText={setInputText}
          onSubmit={() => (isBusy ? handleStopGeneration() : handleSend())}
          onAttach={() => setIsAttachOpen(true)}
          onToggleSearch={() => {
            setSearchActive((prev) => !prev);
            setImageActive(false);
          }}
          searchActive={searchActive}
          onToggleImage={() => {
            setImageActive((prev) => !prev);
            setSearchActive(false);
          }}
          imageActive={imageActive}
          isBusy={isBusy}
          attachment={attachment}
          onClearAttachment={() => setAttachment(null)}
          onOpenLiveVoice={onOpenLiveVoice}
        />
      </View>

      <SwipeableSourcesSheet
        visible={isSourcesOpen}
        onClose={() => setIsSourcesOpen(false)}
        sources={activeSheetSources}
      />

      <AttachmentModal
        visible={isAttachOpen}
        onClose={() => setIsAttachOpen(false)}
        onSelect={(att) => setAttachment(att)}
      />
    </KeyboardAvoidingView>
  );
}

/* =====================================================================
   9. COMPOSER DOCK (RESTORED SUBTLE 1PX HAIRLINE BORDER)
   ===================================================================== */
function ComposerDock({
  value,
  onChangeText,
  onSubmit,
  onAttach,
  onToggleSearch,
  searchActive,
  onToggleImage,
  imageActive,
  isBusy,
  attachment,
  onClearAttachment,
  onOpenLiveVoice,
}) {
  const [inputH, setInputH] = useState(38);
  const [dockLayout, setDockLayout] = useState({ width: 0, height: 0 });
  const hasContent = value.trim().length > 0 || !!attachment;

  return (
    <View style={styles.dockWrapper}>
      {attachment && (
        <View style={styles.dockAttachmentPill}>
          <SvgIcon name="file" size={12} color={THEME.blueVibrant} />
          <Text style={styles.dockAttachmentName} numberOfLines={1}>{attachment.name}</Text>
          <Pressable onPress={onClearAttachment} hitSlop={6}>
            <SvgIcon name="close" size={12} color={THEME.inkSecondary} />
          </Pressable>
        </View>
      )}

      {/* Restored 1px clean hairline frame */}
      <View
        style={styles.dockCard}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width > 0 && height > 0) setDockLayout({ width, height });
        }}
      >
        {dockLayout.width > 0 && (
          <LuminousBeamBorder width={dockLayout.width} height={dockLayout.height} cornerRadius={24} />
        )}

        <View style={styles.dockTopRow}>
          <RasheedaMascotOrb size={30} />
          <TextInput
            style={[styles.dockTextInput, { height: inputH }]}
            placeholder={
              searchActive
                ? 'Search live web with Bing real-time sources...'
                : imageActive
                ? 'Describe image to generate with Cloudflare Flux...'
                : 'Ask astromind-a1-mini anything...'
            }
            placeholderTextColor={THEME.inkMuted}
            value={value}
            onChangeText={onChangeText}
            multiline
            numberOfLines={3}
            onContentSizeChange={(e) => {
              const h = e.nativeEvent.contentSize.height;
              setInputH(Math.min(Math.max(h, 38), 76));
            }}
          />
        </View>

        <View style={styles.dockControlsRow}>
          <Pressable
            style={({ pressed }) => [styles.dockMiniBtn, pressed && styles.btnPressed]}
            onPress={onAttach}
            hitSlop={6}
          >
            <SvgIcon name="plus" size={17} color={THEME.inkPrimary} strokeWidth={2.2} />
          </Pressable>

          <View style={styles.dockRightGroup}>
            {/* Restored 1px hairline dual tools capsule */}
            <View style={styles.dualToolsPill}>
              <Pressable
                style={({ pressed }) => [
                  styles.toolIconItem,
                  searchActive && styles.toolIconItemActive,
                  pressed && styles.btnPressed,
                ]}
                onPress={onToggleSearch}
                hitSlop={6}
              >
                <SvgIcon
                  name="globe"
                  size={16}
                  color={searchActive ? THEME.blueVibrant : THEME.inkSecondary}
                  strokeWidth={2}
                />
              </Pressable>

              <View style={styles.toolIconSeparator} />

              <Pressable
                style={({ pressed }) => [
                  styles.toolIconItem,
                  imageActive && styles.toolIconItemActive,
                  pressed && styles.btnPressed,
                ]}
                onPress={onToggleImage}
                hitSlop={6}
              >
                <SvgIcon
                  name="palette"
                  size={16}
                  color={imageActive ? THEME.blueVibrant : THEME.inkSecondary}
                  strokeWidth={2}
                />
              </Pressable>
            </View>

            {isBusy ? (
              <Pressable
                style={({ pressed }) => [styles.dockActionBtn, styles.dockActionBtnActive, pressed && styles.btnPressed]}
                onPress={onSubmit}
              >
                <SvgIcon name="stop" size={14} color="#FFFFFF" />
              </Pressable>
            ) : hasContent ? (
              <Pressable
                style={({ pressed }) => [styles.dockActionBtn, styles.dockActionBtnActive, pressed && styles.btnPressed]}
                onPress={onSubmit}
              >
                <SvgIcon name="arrowUp" size={17} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.dockWaveBtn, pressed && styles.btnPressed]}
                onPress={onOpenLiveVoice}
                hitSlop={6}
              >
                <SvgIcon name="waveVoice" size={17} color={THEME.blueVibrant} strokeWidth={2.4} />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

/* =====================================================================
   10. STYLES
   ===================================================================== */
const styles = StyleSheet.create({
  mainScreenRoot: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  bodyStage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  btnPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },

  /* Header Bar */
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.bg,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.cardBg,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenterArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerModelPill: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: THEME.cardBg,
    borderWidth: 1,
    borderColor: THEME.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  headerModelText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
    color: THEME.inkPrimary,
    letterSpacing: -0.2,
  },

  /* Empty Center State */
  emptyViewWrap: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerBrandWrap: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 8,
  },
  centerBrandText: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.inkPrimary,
    letterSpacing: -0.4,
  },
  centerBrandSub: {
    fontSize: 12.5,
    color: THEME.inkMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Horizontal Cards */
  getStartedContainer: {
    width: '100%',
    paddingBottom: 8,
  },
  cardsScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  cardContainer: {
    width: 250,
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContent: {
    flex: 1,
    gap: 2,
  },
  cardItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.inkPrimary,
  },
  cardItemDesc: {
    fontSize: 11,
    color: THEME.inkSecondary,
    lineHeight: 15,
  },

  /* Sources Capsule Div */
  sourcesAboveLabelDiv: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: THEME.subtleBg,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 20,
    height: 36,
    paddingHorizontal: 9,
    gap: 8,
    marginBottom: 8,
  },
  faviconsAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: THEME.surfaceMuted,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackFaviconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackFaviconLetter: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sourcesBadgeLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  sourcesIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.blueVibrant,
  },

  /* Composer Dock (Clean 1px Hairline Frame) */
  dockWrapper: {
    width: '100%',
    transform: [{ translateY: -2 }],
  },
  dockAttachmentPill: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.surfaceMuted,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 16,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dockAttachmentName: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.inkPrimary,
    maxWidth: 180,
  },
  dockCard: {
    backgroundColor: THEME.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    overflow: 'hidden',
  },
  dockTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dockTextInput: {
    flex: 1,
    fontSize: 14.5,
    color: THEME.inkPrimary,
    paddingVertical: 4,
    paddingHorizontal: 0,
    textAlignVertical: 'top',
  },
  dockControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dockMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dualToolsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surfaceMuted,
    borderRadius: 18,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: THEME.borderHairline,
  },
  toolIconItem: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  toolIconItemActive: {
    backgroundColor: THEME.blueSoft,
  },
  toolIconSeparator: {
    width: 1,
    height: 14,
    backgroundColor: THEME.border,
    marginHorizontal: 2,
  },
  dockActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockActionBtnActive: {
    backgroundColor: THEME.inkPrimary,
  },
  dockWaveBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.blueSoft,
    borderWidth: 1,
    borderColor: THEME.blueIce,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Messages & Bubbles */
  chatScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  userMessageRow: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: THEME.surfaceMuted,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: THEME.borderHairline,
  },
  userAttachmentImg: {
    width: 180,
    height: 120,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: THEME.subtleBg,
  },
  userBubbleText: {
    fontSize: 14.5,
    lineHeight: 21,
    color: THEME.inkPrimary,
  },
  assistantMessageRow: {
    alignSelf: 'flex-start',
    maxWidth: '94%',
  },
  assistantText: {
    fontSize: 14.5,
    lineHeight: 22,
    color: THEME.inkPrimary,
    letterSpacing: -0.1,
  },
  assistantResponseWaitingContainer: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  /* Markdown Typography */
  mdContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  mdDivider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 8,
  },
  mdH1: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.inkPrimary,
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  mdH2: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.inkPrimary,
    marginTop: 6,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  mdH3: {
    fontSize: 14.5,
    fontWeight: '600',
    color: THEME.inkPrimary,
    marginTop: 4,
    marginBottom: 2,
  },
  mdH4: {
    fontSize: 13.5,
    fontWeight: '600',
    color: THEME.inkSecondary,
    marginTop: 3,
    marginBottom: 1,
  },
  mdLinkText: {
    fontSize: 14.5,
    color: THEME.blueVibrant,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  inlineCodePill: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12.5,
    color: THEME.inkPrimary,
    backgroundColor: THEME.surfaceMuted,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  codeBlockCardLight: {
    backgroundColor: THEME.codeBgLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.codeBorderLight,
    marginVertical: 6,
    overflow: 'hidden',
  },
  codeBlockHeaderLight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: THEME.codeBorderLight,
    backgroundColor: THEME.codeHeaderLight,
  },
  codeBlockLangLight: {
    fontSize: 10.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: THEME.inkSecondary,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  codeCopyBtnLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  codeCopyTextLight: {
    fontSize: 11,
    color: THEME.inkSecondary,
    fontWeight: '500',
  },
  codeBlockContentLight: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12.5,
    lineHeight: 18,
    color: THEME.codeTextDark,
    padding: 12,
  },
  blockquoteRowLight: {
    borderLeftWidth: 3.5,
    borderLeftColor: THEME.blueVibrant,
    paddingLeft: 10,
    marginVertical: 4,
    backgroundColor: THEME.subtleBg,
    paddingVertical: 6,
    borderRadius: 4,
  },
  blockquoteTextLight: {
    fontSize: 13.5,
    lineHeight: 20,
    color: THEME.inkSecondary,
    fontStyle: 'italic',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginVertical: 1.5,
  },
  taskCheckbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: THEME.inkMuted,
    marginTop: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxActive: {
    backgroundColor: THEME.blueVibrant,
    borderColor: THEME.blueVibrant,
  },
  bulletDot: {
    fontSize: 14,
    color: THEME.blueVibrant,
    lineHeight: 20,
  },
  numBullet: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12.5,
    fontWeight: '700',
    color: THEME.blueVibrant,
    lineHeight: 20,
  },
  listText: {
    flex: 1,
    fontSize: 14.5,
    lineHeight: 21,
    color: THEME.inkPrimary,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.bg,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: THEME.border,
  },
  tableCellText: {
    fontSize: 12.5,
    color: THEME.inkPrimary,
  },
  citationBadge: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: THEME.blueVibrant,
    backgroundColor: THEME.blueSoft,
    borderColor: THEME.blueIce,
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
    paddingHorizontal: 3,
    marginHorizontal: 2,
    fontWeight: '700',
  },

  /* Image Card & Floating Bottom-Right Download Button */
  assistantImageWrapper: {
    width: 250,
    marginBottom: 8,
  },
  assistantImageCard: {
    width: 250,
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: THEME.surfaceMuted,
    borderWidth: 1,
    borderColor: THEME.border,
    position: 'relative',
  },
  assistantImage: {
    width: '100%',
    height: '100%',
  },
  assistantImageLoadingOnly: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingImageDownloadBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(9, 13, 22, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  /* Sources Sheet */
  sheetOverlayRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  transparentBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  fullSwipeableSheet: {
    backgroundColor: THEME.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  sheetDraggableHandleZone: {
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderHairline,
  },
  sheetPillHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.inkFaint,
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetTopControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetPrimaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.inkPrimary,
  },
  sheetCounterPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 999,
    backgroundColor: THEME.blueSoft,
  },
  sheetCounterText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.bluePrimary,
    fontVariant: ['tabular-nums'],
  },
  sheetCloseCircularBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourcesScrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 10,
  },
  sourceRecordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.borderHairline,
    gap: 12,
  },
  sourceRecordInfo: {
    flex: 1,
    gap: 2,
  },
  sourceRecordTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.inkPrimary,
  },
  sourceRecordDomain: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: THEME.blueVibrant,
  },
  sourceRecordDesc: {
    fontSize: 11.5,
    lineHeight: 15,
    color: THEME.inkSecondary,
  },

  /* Attachment Modal */
  attachmentSheetPanel: {
    backgroundColor: THEME.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  attachOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 12,
  },
  attachOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachOptionText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: THEME.inkPrimary,
  },
});