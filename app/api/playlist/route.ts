import { NextResponse } from 'next/server';
import playlists from '@/data/Playlists.json';

export const dynamic = 'force-dynamic';

// In-memory cache to prevent spamming YouTube and hitting rate limits
const cache = new Map<string, { tracks: any[]; expiry: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const getPlaylistIdFromUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const list = parsed.searchParams.get('list');
    if (list) return list;
  } catch {
    // ignore
  }
  const fallbackMatch = url.match(/(?:[?&]|%3F|%26)list=([^&]+)/i);
  return fallbackMatch ? fallbackMatch[1] : '';
};

function parseDuration(label: string): string {
  if (!label) return '';
  const match = label.match(/(\d+)\s*hours?,\s*(\d+)\s*minutes?,\s*(\d+)\s*seconds?/i);
  if (match) {
    const h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const s = parseInt(match[3]);
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  const matchMinSec = label.match(/(\d+)\s*minutes?,\s*(\d+)\s*seconds?/i);
  if (matchMinSec) {
    const m = parseInt(matchMinSec[1]);
    const s = parseInt(matchMinSec[2]);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
  const matchSec = label.match(/(\d+)\s*seconds?/i);
  if (matchSec) {
    const s = parseInt(matchSec[1]);
    return `0:${s < 10 ? '0' : ''}${s}`;
  }
  const matchMin = label.match(/(\d+)\s*minutes?/i);
  if (matchMin) {
    const m = parseInt(matchMin[1]);
    return `${m}:00`;
  }
  return '';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inputId = searchParams.get('id');

  if (!inputId) {
    return NextResponse.json({ error: 'Missing playlist id parameter' }, { status: 400 });
  }

  // Resolve internal playlist ID to actual YouTube playlist ID
  const localPlaylist = playlists.find((p) => p.id === inputId);
  const targetPlaylistId = localPlaylist
    ? getPlaylistIdFromUrl(localPlaylist.youtubeUrl)
    : inputId;

  if (!targetPlaylistId) {
    return NextResponse.json({ error: 'Could not resolve playlist ID' }, { status: 400 });
  }

  // Check cache using the actual YouTube playlist ID
  const cached = cache.get(targetPlaylistId);
  if (cached && cached.expiry > Date.now()) {
    return NextResponse.json(cached.tracks);
  }

  const url = `https://www.youtube.com/playlist?list=${targetPlaylistId}`;


  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) {
      throw new Error(`YouTube returned status ${res.status}`);
    }

    const html = await res.text();
    const regex = /var ytInitialData\s*=\s*({.+?});/;
    const match = html.match(regex);

    if (!match) {
      throw new Error('Could not parse ytInitialData from YouTube page');
    }

    const data = JSON.parse(match[1]);

    let items: any[] = [];
    try {
      items = data.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    } catch (e) {
      // Fallback
    }

    if (!items || items.length === 0) {
      throw new Error('No playlist items found in ytInitialData');
    }

    const tracks: any[] = [];
    for (const item of items) {
      const vm = item.lockupViewModel;
      if (!vm) continue;

      const videoId = vm.contentId;
      const title = vm.metadata?.lockupMetadataViewModel?.title?.content;

      if (!videoId || !title) continue;

      let author = 'Unknown Artist';
      try {
        const rows = vm.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows;
        if (rows && rows.length > 0) {
          author = rows[0].metadataParts?.[0]?.text?.content || 'Unknown Artist';
        }
      } catch (err) {}

      let durationText = '';
      try {
        const label = vm.rendererContext?.accessibilityContext?.label;
        if (label) {
          durationText = parseDuration(label);
        }
      } catch (err) {}

      tracks.push({
        videoId,
        title,
        author,
        durationText,
      });
    }

    // Cache results
    cache.set(targetPlaylistId, {
      tracks,
      expiry: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(tracks);
  } catch (error: any) {
    console.error(`Error scraping YouTube playlist ${inputId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch playlist tracks' },
      { status: 500 }
    );
  }
}
