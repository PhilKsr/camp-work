#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const TIMEOUT = 8000;
const BATCH_SIZE = 10;
const BATCH_DELAY = 1000;

async function extractImageUrl(
  html: string,
  baseUrl: string,
): Promise<string | null> {
  // Priorität 1: og:image
  let match =
    html.match(
      /<meta[^>]*(?:property|name)\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["']/i,
    ) ||
    html.match(
      /<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*(?:property|name)\s*=\s*["']og:image["']/i,
    );
  if (match) return resolveUrl(match[1], baseUrl);

  // Priorität 2: twitter:image
  match = html.match(
    /<meta[^>]*(?:name|property)\s*=\s*["']twitter:image(?::src)?["'][^>]*content\s*=\s*["']([^"']+)["']/i,
  );
  if (match) return resolveUrl(match[1], baseUrl);

  // Priorität 3: link rel="image_src"
  match = html.match(
    /<link[^>]*rel\s*=\s*["']image_src["'][^>]*href\s*=\s*["']([^"']+)["']/i,
  );
  if (match) return resolveUrl(match[1], baseUrl);

  // Priorität 4: Erstes großes Bild (hero/banner/header)
  const heroMatch = html.match(
    /<img[^>]*(?:class\s*=\s*["'][^"']*(?:hero|banner|header|main|cover|featured)[^"']*["'][^>]*src\s*=\s*["']([^"']+)["']/i,
  );
  if (heroMatch) return resolveUrl(heroMatch[1], baseUrl);

  return null;
}

function resolveUrl(url: string, base: string): string {
  if (url.startsWith('http')) return url;
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

async function fetchWithRetry(
  url: string,
  retries = 1,
): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'CampWork/1.0 (https://campwork.app)' },
        redirect: 'follow',
      });
      if (!res.ok) {
        if (res.status >= 500 && attempt < retries) continue;
        return null;
      }
      // Nur die ersten 100KB lesen (reicht für Meta-Tags)
      const reader = res.body?.getReader();
      if (!reader) return null;
      const decoder = new TextDecoder();
      let html = '';
      while (html.length < 100000) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
      }
      reader.cancel();
      return html;
    } catch {
      if (attempt < retries) continue;
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

async function main() {
  // Lade existierende Bilder um Duplikate zu vermeiden
  const { data: existingImages } = await supabase
    .from('campground_images')
    .select('campground_id');
  const existingSet = new Set(
    existingImages?.map((r) => r.campground_id) || [],
  );

  // Lade alle Campingplätze mit Website
  const { data: campgrounds, error } = await supabase
    .from('campgrounds')
    .select('id, name, website')
    .not('website', 'is', null);

  if (error || !campgrounds) {
    console.error('Fehler beim Laden:', error);
    return;
  }

  // Filtere die die bereits Bilder haben
  const toProcess = campgrounds.filter((c) => !existingSet.has(c.id));
  console.log(`🌐 ${toProcess.length} Websites zu prüfen...`);

  let found = 0;
  let failed = 0;

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (c) => {
        if (!c.website) return null;
        const html = await fetchWithRetry(c.website);
        if (!html) return null;
        const imageUrl = await extractImageUrl(html, c.website);
        if (!imageUrl) return null;
        return {
          campground_id: c.id,
          url: imageUrl,
          source: 'og_image' as const,
          sort_order: 0,
        };
      }),
    );

    const images = results
      .filter(
        (
          r,
        ): r is PromiseFulfilledResult<{
          campground_id: string;
          url: string;
          source: 'og_image';
          sort_order: number;
        }> => r.status === 'fulfilled' && r.value != null,
      )
      .map((r) => r.value);

    if (images.length > 0) {
      const { error } = await supabase
        .from('campground_images')
        .upsert(images, {
          onConflict: 'campground_id,sort_order',
          ignoreDuplicates: true,
        });
      if (!error) found += images.length;
    }

    failed += BATCH_SIZE - images.length;
    console.log(
      `📸 ${found} gefunden, ${failed} fehlgeschlagen (${i + batch.length}/${toProcess.length})`,
    );

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
  }

  console.log(`\n🎉 Website-Scraping abgeschlossen: ${found} neue Bilder`);
}

main().catch(console.error);
