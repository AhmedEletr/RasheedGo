// src/hooks/useAudioPlayer.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { generateGeminiSpeechREST } from '../services/geminiService';

let AudioModule = null;
try {
  AudioModule = require('expo-av').Audio;
} catch {}

let FileSystem = null;
try {
  FileSystem = require('expo-file-system');
} catch {}

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const soundRef = useRef(null);
  const isCancelledRef = useRef(false);

  const stopAudio = useCallback(async () => {
    isCancelledRef.current = true;
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setIsPlaying(false);
    setLoadingAudio(false);
    setActiveMessageId(null);
  }, []);

  const playTTS = useCallback(
    async ({ text, messageId, language = 'en', onFinish = null }) => {
      await stopAudio();
      isCancelledRef.current = false;
      setLoadingAudio(true);
      setActiveMessageId(messageId);

      try {
        const { data: base64Audio, mimeType } = await generateGeminiSpeechREST({
          text,
          language,
          voice: language === 'ar' ? 'Aoede' : 'Kore',
        });

        if (isCancelledRef.current) return;

        let playbackUri = `data:${mimeType || 'audio/wav'};base64,${base64Audio}`;

        if (FileSystem && FileSystem.cacheDirectory) {
          try {
            const cachePath = `${FileSystem.cacheDirectory}gemini_tts_${Date.now()}.wav`;
            await FileSystem.writeAsStringAsync(cachePath, base64Audio, {
              encoding: FileSystem.EncodingType.Base64,
            });
            playbackUri = cachePath;
          } catch (writeError) {
            console.debug('[useAudioPlayer] Cache fallback:', writeError);
          }
        }

        if (AudioModule) {
          await AudioModule.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });

          const { sound } = await AudioModule.Sound.createAsync(
            { uri: playbackUri },
            { shouldPlay: true }
          );

          soundRef.current = sound;
          setLoadingAudio(false);
          setIsPlaying(true);

          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              setIsPlaying(false);
              setActiveMessageId(null);
              onFinish?.();
            }
          });
        } else if (typeof window !== 'undefined' && window.Audio) {
          const webAudio = new window.Audio(playbackUri);
          setLoadingAudio(false);
          setIsPlaying(true);
          webAudio.onended = () => {
            setIsPlaying(false);
            setActiveMessageId(null);
            onFinish?.();
          };
          webAudio.play();
        } else {
          setLoadingAudio(false);
          setActiveMessageId(null);
          onFinish?.();
        }
      } catch (err) {
        console.error('[useAudioPlayer] Audio playback error:', err);
        setLoadingAudio(false);
        setIsPlaying(false);
        setActiveMessageId(null);
        onFinish?.();
      }
    },
    [stopAudio]
  );

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    isPlaying,
    loadingAudio,
    activeMessageId,
    playTTS,
    stopAudio,
  };
}