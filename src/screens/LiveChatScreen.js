// src/screens/LiveChatScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  RadialGradient,
  Stop,
  Rect,
} from 'react-native-svg';

import {
  transcribeAudioREST,
  streamGeminiChatREST,
} from '../services/geminiService';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

let AudioModule = null;
try {
  AudioModule = require('expo-av').Audio;
} catch {}

let FileSystem = null;
try {
  FileSystem = require('expo-file-system');
} catch {}

const THEME = {
  bgLight: '#F8FAFD',
  inkPrimary: '#0F172A',
  inkMuted: '#94A3B8',
  inkFaint: '#CBD5E1',

  bluePrimary: '#1D4ED8',
  blueVibrant: '#2563EB',
  blueGlow: '#60A5FA',
  blueDeep: '#1E3A8A',
  blueSoft: '#EFF6FF',
  blueIce: '#BFDBFE',

  dockBg: '#FFFFFF',
  dockBorder: 'rgba(15, 23, 42, 0.06)',
};

function SvgGlyph({ name, size = 20, color = THEME.inkPrimary }) {
  switch (name) {
    case 'close':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
          <Path d="M18 6 6 18" />
          <Path d="m6 6 12 12" />
        </Svg>
      );
    case 'pause':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Rect x="6" y="5" width="4" height="14" rx="2" />
          <Rect x="14" y="5" width="4" height="14" rx="2" />
        </Svg>
      );
    case 'play':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M7 4.5v15l12-7.5-12-7.5z" />
        </Svg>
      );
    case 'keyboard':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <Rect width="20" height="14" x="2" y="5" rx="3" />
          <Path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M8 15h8" />
        </Svg>
      );
    default:
      return null;
  }
}

function SoundWaveEqualizer({ isListening, isSpeaking }) {
  const bar1 = useRef(new Animated.Value(12)).current;
  const bar2 = useRef(new Animated.Value(20)).current;
  const bar3 = useRef(new Animated.Value(32)).current;
  const bar4 = useRef(new Animated.Value(24)).current;
  const bar5 = useRef(new Animated.Value(36)).current;

  useEffect(() => {
    const isActive = isListening || isSpeaking;
    if (!isActive) {
      Animated.parallel([
        Animated.timing(bar1, { toValue: 6, duration: 200, useNativeDriver: false }),
        Animated.timing(bar2, { toValue: 6, duration: 200, useNativeDriver: false }),
        Animated.timing(bar3, { toValue: 6, duration: 200, useNativeDriver: false }),
        Animated.timing(bar4, { toValue: 6, duration: 200, useNativeDriver: false }),
        Animated.timing(bar5, { toValue: 6, duration: 200, useNativeDriver: false }),
      ]).start();
      return;
    }

    const mult = isSpeaking ? 1.5 : 1.0;
    const createLoop = (animVal, minH, maxH, dur) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animVal, {
            toValue: maxH * mult,
            duration: dur,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(animVal, {
            toValue: minH,
            duration: dur,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
    };

    const a1 = createLoop(bar1, 10, 26, 360);
    const a2 = createLoop(bar2, 16, 38, 420);
    const a3 = createLoop(bar3, 22, 50, 300);
    const a4 = createLoop(bar4, 18, 40, 390);
    const a5 = createLoop(bar5, 24, 48, 330);

    a1.start(); a2.start(); a3.start(); a4.start(); a5.start();

    return () => {
      a1.stop(); a2.stop(); a3.stop(); a4.stop(); a5.stop();
    };
  }, [isListening, isSpeaking]);

  return (
    <View style={styles.equalizerRow}>
      {[bar1, bar2, bar3, bar4, bar5].map((hVal, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.equalizerBar,
            { height: hVal },
            isSpeaking && { backgroundColor: '#93C5FD' },
          ]}
        />
      ))}
    </View>
  );
}

export default function LiveChatScreen({ onBack, onSwitchToKeyboard }) {
  const [currentLang, setCurrentLang] = useState('en'); // 'en' | 'ar'
  const [statusState, setStatusState] = useState('listening'); // 'listening' | 'thinking' | 'speaking' | 'paused'
  const [displayText, setDisplayText] = useState('');

  const recordingRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const lastSpokenTimeRef = useRef(Date.now());
  const webRecogRef = useRef(null);
  const auraScale = useRef(new Animated.Value(1)).current;

  const { isPlaying: isSpeakingTTS, playTTS, stopAudio } = useAudioPlayer();

  useEffect(() => {
    if (statusState === 'paused') {
      auraScale.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(auraScale, {
          toValue: statusState === 'speaking' ? 1.15 : 1.07,
          duration: statusState === 'speaking' ? 1000 : 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(auraScale, {
          toValue: 1,
          duration: statusState === 'speaking' ? 1000 : 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [statusState]);

  /**
   * Generates text reply using gemini-flash-lite-latest, then speaks using gemini-3.8-flash-tts
   */
  const executeTextTurn = useCallback(
    (userText) => {
      if (!userText || !userText.trim()) {
        startListening();
        return;
      }

      setStatusState('thinking');
      setDisplayText(currentLang === 'ar' ? 'جارٍ التفكير...' : 'Thinking...');

      const prompt = `You are a warm, eloquent live tour guide for historical Rosetta (Rashid), Egypt.
The user asked: "${userText}".
Reply directly to the user in 1 or 2 concise spoken sentences without markdown or bullet points in ${
        currentLang === 'ar' ? 'Arabic' : 'English'
      }.`;

      let fullReply = '';
      streamGeminiChatREST({
        prompt: prompt,
        model: 'gemini-flash-lite-latest',
        enableSearch: false,
        onToken: (_token, accumulated) => {
          fullReply = accumulated;
          setDisplayText(accumulated);
        },
        onComplete: (completedText) => {
          const finalReply = (completedText || fullReply).trim();
          setStatusState('speaking');
          setDisplayText(finalReply);

          // Play Gemini TTS audio. Once it finishes, resume listening automatically!
          playTTS({
            text: finalReply,
            messageId: `turn-${Date.now()}`,
            language: currentLang,
            onFinish: () => {
              startListening();
            },
          });
        },
        onError: (err) => {
          console.error('[LiveChatScreen] Generation error:', err);
          setDisplayText(
            currentLang === 'ar'
              ? 'عذراً، حدث خطأ. حاول التحدث مرة أخرى.'
              : 'Could not process that. Please speak again.'
          );
          setTimeout(() => {
            startListening();
          }, 2000);
        },
      });
    },
    [currentLang, playTTS]
  );

  /**
   * Finishes audio recording, transcribes, and executes conversational turn
   */
  const finishRecordingTurn = useCallback(async () => {
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recordingRef.current) {
      try {
        const recording = recordingRef.current;
        recordingRef.current = null;
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        if (uri && FileSystem) {
          setStatusState('thinking');
          setDisplayText(currentLang === 'ar' ? 'جارٍ تحويل الصوت إلى نص...' : 'Listening to what you said...');

          const base64Audio = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const transcribed = await transcribeAudioREST({
            audioBase64: base64Audio,
            mimeType: 'audio/m4a',
          });

          if (transcribed && transcribed.trim()) {
            executeTextTurn(transcribed);
          } else {
            startListening();
          }
          return;
        }
      } catch (err) {
        console.warn('[finishRecordingTurn] Error processing recording:', err);
        startListening();
      }
    }
  }, [currentLang, executeTextTurn]);

  /**
   * Starts listening to user speech
   */
  const startListening = useCallback(async () => {
    await stopAudio();
    setStatusState('listening');
    setDisplayText(
      currentLang === 'ar'
        ? 'تفضل بالتحدث الآن، أنا أستمع إليك...'
        : "Speak now, I'm listening..."
    );
    hasSpokenRef.current = false;

    // Web Speech API for browsers
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          if (webRecogRef.current) webRecogRef.current.abort();
          const recog = new SpeechRecognition();
          recog.lang = currentLang === 'ar' ? 'ar-EG' : 'en-US';
          recog.continuous = false;
          recog.interimResults = true;

          recog.onresult = (e) => {
            const transcript = Array.from(e.results)
              .map((r) => r[0].transcript)
              .join('');
            setDisplayText(transcript);
            if (e.results[0].isFinal) {
              executeTextTurn(transcript);
            }
          };

          recog.onerror = () => {
            setStatusState('paused');
          };

          webRecogRef.current = recog;
          recog.start();
          return;
        } catch (e) {
          console.debug('[Web Speech API]', e);
        }
      }
    }

    // Native Mobile Recording with expo-av
    if (AudioModule) {
      try {
        const { status } = await AudioModule.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Microphone Needed', 'Please allow microphone access to talk with Rasheeda Live.');
          setStatusState('paused');
          return;
        }

        await AudioModule.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          playThroughEarpieceAndroid: false,
          shouldDuckAndroid: true,
        });

        const recording = new AudioModule.Recording();

        // Pass isMeteringEnabled: true so status.metering is active!
        await recording.prepareToRecordAsync({
          isMeteringEnabled: true,
          android: {
            extension: '.m4a',
            outputFormat: AudioModule.AndroidOutputFormat.MPEG_4,
            audioEncoder: AudioModule.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a',
            audioQuality: AudioModule.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
          },
        });

        recording.setProgressUpdateInterval(100);
        recording.setOnRecordingStatusUpdate((recStatus) => {
          if (recStatus.isRecording) {
            const metering = recStatus.metering;
            // When voice is detected (typical speech level: -45 to -10 dB)
            if (metering !== undefined && metering > -45) {
              hasSpokenRef.current = true;
              lastSpokenTimeRef.current = Date.now();
            }
          }
        });

        await recording.startAsync();
        recordingRef.current = recording;

        // VAD Timer: Detects 1.4 seconds of silence after speech has started
        if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
        silenceTimerRef.current = setInterval(() => {
          if (hasSpokenRef.current && Date.now() - lastSpokenTimeRef.current > 1400) {
            finishRecordingTurn();
          }
        }, 200);
      } catch (err) {
        console.error('[startListening] Error starting recording:', err);
        setStatusState('paused');
      }
    }
  }, [currentLang, executeTextTurn, finishRecordingTurn, stopAudio]);

  const pauseListening = useCallback(async () => {
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }
    if (webRecogRef.current) {
      try {
        webRecogRef.current.abort();
      } catch {}
      webRecogRef.current = null;
    }
    await stopAudio();
    setStatusState('paused');
  }, [stopAudio]);

  useEffect(() => {
    startListening();
    return () => {
      pauseListening();
    };
  }, []);

  const toggleLanguage = () => {
    pauseListening();
    const nextLang = currentLang === 'en' ? 'ar' : 'en';
    setCurrentLang(nextLang);
    setTimeout(() => {
      startListening();
    }, 300);
  };

  const handleCenterButton = () => {
    if (statusState === 'listening') {
      if (hasSpokenRef.current) {
        finishRecordingTurn();
      } else {
        pauseListening();
      }
    } else if (statusState === 'speaking' || statusState === 'thinking') {
      pauseListening();
    } else {
      startListening();
    }
  };

  const isListening = statusState === 'listening';
  const isSpeaking = statusState === 'speaking' || isSpeakingTTS;

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFD" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.voiceModeCapsule}>
          <Text style={styles.voiceModeText}>RASHEEDA LIVE VOICE</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.langSwitcherPill, pressed && styles.btnPressed]}
          onPress={toggleLanguage}
          hitSlop={6}
        >
          <Text style={styles.langSwitcherText}>
            {currentLang === 'en' ? 'English (Kore)' : 'العربية (Aoede)'}
          </Text>
        </Pressable>
      </View>

      {/* 3D Glowing Reactive Orb */}
      <View style={styles.orbStage}>
        <Animated.View
          style={[
            styles.outerAuraRing,
            { transform: [{ scale: auraScale }] },
            isSpeaking && { borderColor: 'rgba(59, 130, 246, 0.4)', backgroundColor: 'rgba(239, 246, 255, 0.8)' },
          ]}
        />

        <Pressable
          style={styles.sphereContainer}
          onPress={isListening && hasSpokenRef.current ? finishRecordingTurn : undefined}
        >
          <Svg width={180} height={180} viewBox="0 0 180 180">
            <Defs>
              <RadialGradient id="sphere3DGrad" cx="38%" cy="32%" r="65%">
                <Stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
                <Stop offset="35%" stopColor="#2563EB" stopOpacity="1" />
                <Stop offset="75%" stopColor="#1D4ED8" stopOpacity="1" />
                <Stop offset="100%" stopColor="#1E3A8A" stopOpacity="1" />
              </RadialGradient>
            </Defs>
            <Circle cx="90" cy="90" r="88" fill="url(#sphere3DGrad)" />
          </Svg>

          <View style={styles.equalizerCenterWrapper}>
            <SoundWaveEqualizer isListening={isListening} isSpeaking={isSpeaking} />
          </View>
        </Pressable>
      </View>

      {/* Transcription & Response Stage */}
      <View style={styles.transcriptionStage}>
        <Text style={[styles.statusIndicator, statusState === 'paused' && styles.statusPaused]}>
          {statusState === 'speaking'
            ? currentLang === 'ar' ? 'يتحدث الآن...' : 'Speaking...'
            : statusState === 'thinking'
            ? currentLang === 'ar' ? 'جارٍ التفكير...' : 'Thinking...'
            : statusState === 'listening'
            ? currentLang === 'ar' ? 'جار الاستماع...' : 'Listening...'
            : currentLang === 'ar' ? 'متوقف مؤقتاً' : 'Paused'}
        </Text>

        <Text
          style={[
            styles.speechText,
            currentLang === 'ar' && { textAlign: 'center', writingDirection: 'rtl', lineHeight: 34 },
          ]}
        >
          {displayText}
        </Text>
      </View>

      {/* Floating Bottom Pill Dock */}
      <View style={styles.bottomDockWrapper}>
        <View style={styles.pillDock}>
          <Pressable
            style={({ pressed }) => [styles.dockSideBtn, pressed && styles.btnPressed]}
            onPress={() => {
              pauseListening();
              onBack?.();
            }}
            hitSlop={8}
          >
            <SvgGlyph name="close" size={18} color={THEME.inkPrimary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.dockCenterBtn, pressed && styles.btnPressed]}
            onPress={handleCenterButton}
          >
            <SvgGlyph
              name={statusState === 'paused' ? 'play' : 'pause'}
              size={22}
              color="#FFFFFF"
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.dockSideBtn, pressed && styles.btnPressed]}
            onPress={() => {
              pauseListening();
              onSwitchToKeyboard ? onSwitchToKeyboard() : onBack?.();
            }}
            hitSlop={8}
          >
            <SvgGlyph name="keyboard" size={20} color={THEME.inkPrimary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: THEME.bgLight,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 20,
    paddingBottom: Platform.OS === 'ios' ? 42 : 26,
  },
  btnPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
  },
  topHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  voiceModeCapsule: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: THEME.dockBg,
    borderWidth: 1,
    borderColor: THEME.dockBorder,
  },
  voiceModeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.inkMuted,
    letterSpacing: 1.6,
  },
  langSwitcherPill: {
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 14,
    backgroundColor: THEME.blueSoft,
    borderWidth: 1,
    borderColor: THEME.blueIce,
  },
  langSwitcherText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.bluePrimary,
  },
  orbStage: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
  },
  outerAuraRing: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.14)',
    backgroundColor: 'rgba(239, 246, 255, 0.4)',
  },
  sphereContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equalizerCenterWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  equalizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 50,
  },
  equalizerBar: {
    width: 4.5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  transcriptionStage: {
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 12,
    minHeight: 110,
    justifyContent: 'center',
  },
  statusIndicator: {
    fontSize: 14.5,
    fontWeight: '700',
    color: THEME.blueVibrant,
    letterSpacing: -0.2,
  },
  statusPaused: {
    color: THEME.inkMuted,
  },
  speechText: {
    fontSize: 19,
    fontWeight: '500',
    lineHeight: 28,
    color: THEME.inkPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  bottomDockWrapper: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pillDock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.dockBg,
    borderRadius: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 16,
    borderWidth: 1,
    borderColor: THEME.dockBorder,
  },
  dockSideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockCenterBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: THEME.bluePrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});