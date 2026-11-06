// src/services/geminiService.js

const API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  '';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Extracts verified web grounding citations from Google Search tool responses
 */
function extractGroundingSources(json) {
  const sources = [];
  try {
    const rawChunks =
      json?.interaction?.grounding_metadata?.grounding_chunks ||
      json?.interaction?.groundingMetadata?.groundingChunks ||
      json?.grounding_metadata?.grounding_chunks ||
      json?.groundingMetadata?.groundingChunks ||
      json?.interaction?.candidates?.[0]?.groundingMetadata?.groundingChunks ||
      [];

    rawChunks.forEach((item, index) => {
      const uri = item.web?.uri || item.web?.url;
      if (uri) {
        let domain = uri;
        try {
          domain = new URL(uri).hostname.replace('www.', '');
        } catch {
          domain = uri.split('/')[2] || 'web';
        }

        sources.push({
          id: index + 1,
          title: item.web?.title || `Source [${index + 1}]`,
          domain: domain,
          url: uri,
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
          fallbackColor: index % 2 === 0 ? '#1D4ED8' : '#0F172A',
          fallbackInitial: domain.charAt(0).toUpperCase(),
          description: item.web?.snippet || 'Verified web reference document.',
        });
      }
    });
  } catch (err) {
    console.debug('[GeminiService] Grounding parser notice:', err);
  }
  return sources;
}

/**
 * Robust extractor for Gemini Interactions TTS responses.
 */
function extractAudioPayload(json) {
  if (!json) return null;

  if (Array.isArray(json.steps)) {
    for (const step of json.steps) {
      if (Array.isArray(step.content)) {
        for (const item of step.content) {
          if (item.type === 'audio' && item.data) {
            return {
              data: item.data,
              mimeType: item.mime_type || item.mimeType || 'audio/wav',
            };
          }
        }
      }
    }
  }

  if (json.output_audio?.data) {
    return {
      data: json.output_audio.data,
      mimeType: json.output_audio.mime_type || 'audio/wav',
    };
  }

  const parts = json.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'audio/wav',
      };
    }
    if (part.inline_data?.data) {
      return {
        data: part.inline_data.data,
        mimeType: part.inline_data.mime_type || 'audio/wav',
      };
    }
  }

  if (Array.isArray(json.output)) {
    for (const out of json.output) {
      if (Array.isArray(out.content)) {
        for (const item of out.content) {
          if ((item.type === 'audio' || item.data) && item.data) {
            return {
              data: item.data,
              mimeType: item.mime_type || item.mimeType || 'audio/wav',
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Transcribes recorded user audio using gemini-3.5-transcribe via Interactions API
 */
export async function transcribeAudioREST({ audioBase64, mimeType = 'audio/m4a' }) {
  if (!API_KEY) {
    throw new Error('Missing API Key: Configure EXPO_PUBLIC_GEMINI_API_KEY');
  }

  const url = `${BASE_URL}/interactions?key=${API_KEY}`;
  const payload = {
    model: 'gemini-3.5-transcribe',
    input: [
      {
        type: 'audio',
        data: audioBase64,
        mime_type: mimeType,
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
      'Api-Revision': '2026-05-20',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Transcription error [${response.status}]: ${err}`);
  }

  const json = await response.json();
  const transcript =
    json.output_text ||
    json.steps?.[0]?.content?.[0]?.text ||
    json.candidates?.[0]?.content?.parts?.[0]?.text ||
    '';

  return transcript.trim();
}

/**
 * Text streaming via Server-Sent Events (SSE) using gemini-flash-lite-latest
 */
export function streamGeminiChatREST({
  prompt,
  model = 'gemini-flash-lite-latest',
  enableSearch = false,
  onToken,
  onSources,
  onComplete,
  onError,
}) {
  if (!API_KEY) {
    onError?.(new Error('Missing API Key: Please configure EXPO_PUBLIC_GEMINI_API_KEY in your .env'));
    return () => {};
  }

  const url = `${BASE_URL}/interactions?alt=sse&key=${API_KEY}`;

  const payload = {
    model: model,
    input: prompt,
    stream: true,
  };

  if (enableSearch) {
    payload.tools = [{ type: 'google_search' }];
  }

  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('x-goog-api-key', API_KEY);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Api-Revision', '2026-05-20');
  xhr.setRequestHeader('Accept', 'text/event-stream');

  let processedIndex = 0;
  let lineBuffer = '';
  let fullAccumulatedText = '';
  let sourcesExtracted = false;

  xhr.onprogress = () => {
    const incoming = xhr.responseText.substring(processedIndex);
    processedIndex = xhr.responseText.length;
    lineBuffer += incoming;

    const lines = lineBuffer.split('\n');
    lineBuffer = lines.pop() || '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith('data:')) continue;

      const jsonStr = line.replace(/^data:\s*/, '').trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(jsonStr);

        if (parsed.event_type === 'step.delta' && parsed.delta?.type === 'text') {
          const delta = parsed.delta.text || '';
          fullAccumulatedText += delta;
          onToken?.(delta, fullAccumulatedText);
        }

        if (parsed.delta?.type === 'text' && parsed.delta.text && parsed.event_type !== 'step.delta') {
          const delta = parsed.delta.text;
          fullAccumulatedText += delta;
          onToken?.(delta, fullAccumulatedText);
        }

        if (!sourcesExtracted && (parsed.interaction || parsed.grounding_metadata || parsed.groundingMetadata)) {
          const extracted = extractGroundingSources(parsed);
          if (extracted.length > 0) {
            sourcesExtracted = true;
            onSources?.(extracted);
          }
        }
      } catch (err) {}
    }
  };

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      onComplete?.(fullAccumulatedText);
    } else {
      let errorMessage = `HTTP Error ${xhr.status}`;
      try {
        const errObj = JSON.parse(xhr.responseText);
        errorMessage = errObj?.error?.message || xhr.responseText;
      } catch {}
      onError?.(new Error(errorMessage));
    }
  };

  xhr.onerror = () => {
    onError?.(new Error('Network or SSL handshake failure.'));
  };

  xhr.send(JSON.stringify(payload));

  return () => {
    try {
      xhr.abort();
    } catch {}
  };
}

/**
 * High-fidelity Text-To-Speech generation using gemini-3.8-flash-tts
 * Multilingual Female Voices: 'Kore' (English) | 'Aoede' (Arabic)
 */
export async function generateGeminiSpeechREST({
  text,
  language = 'en',
  voice = null,
}) {
  if (!API_KEY) {
    throw new Error('Missing API Key: Configure EXPO_PUBLIC_GEMINI_API_KEY in your .env');
  }

  const isArabic = language === 'ar' || /[\u0600-\u06FF]/.test(text);
  const selectedVoice = voice || (isArabic ? 'Aoede' : 'Kore');

  const cleanedText = text
    .replace(/\[\d+\]/g, '')
    .replace(/[*_#`~]/g, '')
    .trim();

  const url = `${BASE_URL}/interactions?key=${API_KEY}`;

  const payload = {
    model: 'gemini-3.8-flash-tts',
    input: [
      {
        type: 'user_input',
        content: [
          {
            type: 'text',
            text: cleanedText.slice(0, 800),
            annotations: [
              {
                type: 'speech_metadata',
                style: isArabic
                  ? 'clear, eloquent, natural Classical Arabic'
                  : 'warm, articulate, natural and friendly',
              },
            ],
          },
        ],
      },
    ],
    response_format: { type: 'audio' },
    generation_config: {
      speech_config: [{ voice: selectedVoice }],
    },
    stream: false,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
      'Api-Revision': '2026-05-20',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`TTS Error [${response.status}]: ${errText}`);
  }

  const json = await response.json();
  const audioPayload = extractAudioPayload(json);

  if (!audioPayload || !audioPayload.data) {
    console.error('[GeminiService] Unexpected payload received:', JSON.stringify(json));
    throw new Error('No audio buffer data received from TTS engine.');
  }

  return audioPayload;
}