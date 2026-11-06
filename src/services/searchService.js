// src/services/searchService.js

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

/**
 * Extracts domain name from URL
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    const parts = url.split('/');
    return parts[2] ? parts[2].replace('www.', '') : 'web';
  }
}

/**
 * Parses Bing Web Search HTML
 */
export async function runBingWebSearch(query) {
  const cleanQuery = query
    .replace(/^(search for|find|look up|ابحث عن|ما هو|من هو)\s+/i, "")
    .trim();

  const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(cleanQuery)}&setlang=en`;

  try {
    const response = await fetch(searchUrl, { headers: HEADERS });
    if (!response.ok) throw new Error(`Bing responded with ${response.status}`);
    const html = await response.text();

    const results = [];

    // 1. Try Cheerio if present
    try {
      const cheerio = require('cheerio');
      const $ = cheerio.load(html);

      $('li.b_algo').each((_, el) => {
        if (results.length >= 5) return false;
        const titleAnchor = $(el).find('h2 a');
        const title = titleAnchor.text().trim();
        const link = titleAnchor.attr('href');
        const snippet = $(el).find('.b_caption p, .b_algoSlug, p').first().text().trim();

        if (title && link && link.startsWith('http') && snippet) {
          const domain = extractDomain(link);
          results.push({
            id: results.length + 1,
            title,
            url: link,
            domain,
            description: snippet,
            favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            fallbackColor: results.length % 2 === 0 ? '#1D4ED8' : '#0F172A',
            fallbackInitial: domain.charAt(0).toUpperCase(),
          });
        }
      });
    } catch {
      // 2. Native zero-dependency regex fallback for React Native Hermes
      const algoRegex = /<li class="b_algo"[\s\S]*?<h2><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;
      let match;
      while ((match = algoRegex.exec(html)) !== null && results.length < 5) {
        const link = match[1];
        const rawTitle = match[2].replace(/<[^>]+>/g, '').trim();
        const rawSnippet = match[3].replace(/<[^>]+>/g, '').trim();

        if (link && link.startsWith('http') && rawTitle && rawSnippet) {
          const domain = extractDomain(link);
          results.push({
            id: results.length + 1,
            title: rawTitle,
            url: link,
            domain,
            description: rawSnippet,
            favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            fallbackColor: results.length % 2 === 0 ? '#1D4ED8' : '#0F172A',
            fallbackInitial: domain.charAt(0).toUpperCase(),
          });
        }
      }
    }

    if (results.length > 0) return results;
  } catch (err) {
    console.warn('[searchService] Bing search fallback triggered:', err);
  }

  // Fallback to DuckDuckGo HTML search
  return runDuckDuckGoFallback(cleanQuery);
}

async function runDuckDuckGoFallback(query) {
  try {
    const targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(targetUrl, { headers: HEADERS });
    const html = await response.text();
    const results = [];

    const regex = /<a class="result__url" href="([^"]+)[\s\S]*?<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = regex.exec(html)) !== null && results.length < 5) {
      let rawLink = match[1];
      if (rawLink.includes("uddg=")) {
        const m = rawLink.match(/uddg=([^&]+)/);
        if (m) rawLink = decodeURIComponent(m[1]);
      }
      const snippet = match[2].replace(/<[^>]+>/g, '').trim();
      const domain = extractDomain(rawLink);

      if (rawLink.startsWith('http')) {
        results.push({
          id: results.length + 1,
          title: `Result from ${domain}`,
          url: rawLink,
          domain,
          description: snippet,
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
          fallbackColor: '#1D4ED8',
          fallbackInitial: domain.charAt(0).toUpperCase(),
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}