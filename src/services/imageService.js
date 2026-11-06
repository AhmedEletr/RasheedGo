// src/services/imageService.js
import { Buffer } from 'buffer';

const CF_ACCOUNT_ID = process.env.EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID || '';
const CF_API_TOKEN = process.env.EXPO_PUBLIC_CLOUDFLARE_API_TOKEN || '';
const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY || '';

/**
 * 1. Generates image via Cloudflare Workers AI Flux-1-Schnell
 */
export async function generateCloudflareFlux(prompt) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    throw new Error('Missing Cloudflare credentials in .env (EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID & TOKEN).');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      steps: 4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudflare Flux Generation failed (${response.status}): ${errorText}`);
  }

  const contentType = response.headers.get('content-type') || '';

  // JSON format containing base64 string
  if (contentType.includes('application/json')) {
    const json = await response.json();
    const base64Data = json.result?.image || json.image;
    if (!base64Data) {
      throw new Error(`Unexpected Cloudflare JSON response: ${JSON.stringify(json)}`);
    }
    return base64Data;
  }

  // Binary stream format
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

/**
 * 2. Uploads base64 image to ImgBB with an exact 7-day expiration (604,800 seconds)
 */
export async function uploadToImgBB7Days(base64Image, fileName = 'flux_image.jpg') {
  if (!IMGBB_API_KEY) {
    console.warn('[imageService] IMGBB key missing; using base64 preview.');
    return `data:image/jpeg;base64,${base64Image}`;
  }

  // 7 days = 7 * 24 * 3600 = 604800 seconds
  const expirationSeconds = 604800;
  const endpoint = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}&expiration=${expirationSeconds}`;

  try {
    const formData = new FormData();
    formData.append('image', base64Image);
    formData.append('name', fileName);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const json = await response.json();
      const hostedUrl = json?.data?.display_url || json?.data?.url;
      if (hostedUrl) {
        return hostedUrl;
      }
    }
  } catch (err) {
    console.warn('[imageService] ImgBB upload failed; attempting fallback host.', err);
  }

  // Fallback to FreeImageHost
  try {
    const formData = new FormData();
    formData.append('source', base64Image);
    formData.append('action', 'upload');
    formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
    formData.append('format', 'json');

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.image?.url) return json.image.url;
    }
  } catch {}

  // Local fallback
  return `data:image/jpeg;base64,${base64Image}`;
}

/**
 * Pipeline: Generate with Cloudflare Flux -> Upload to ImgBB (7 days)
 */
export async function generateAndHostFluxImage(prompt) {
  const base64Data = await generateCloudflareFlux(prompt);
  const hostedUrl = await uploadToImgBB7Days(base64Data, `flux_${Date.now()}.jpg`);
  return hostedUrl;
}