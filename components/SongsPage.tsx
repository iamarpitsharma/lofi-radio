'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { Search, X, Play, Music, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { usePlayer, Track } from '@/lib/PlayerContext';
import playlists from '@/data/Playlists.json';
import Footer from '@/components/Footer';

type SongsPageProps = {
  playlistId: string;
};

// Row item component memoized to prevent redundant renders of non-visible elements
const SongRow = React.memo(function SongRow({
  index,
  style,
  data,
}: ListChildComponentProps<{
  filteredTracks: Track[];
  currentTrackIndex: number;
  isCurrentPlaylistActive: boolean;
  isPlaying: boolean;
  onSelectTrack: (origIndex: number) => void;
  tracks: Track[];
}>) {
  const { filteredTracks, currentTrackIndex, isCurrentPlaylistActive, isPlaying, onSelectTrack, tracks } = data;
  const track = filteredTracks[index];

  if (!track) return null;

  // Find the original index of this track in the full playlist array
  const originalIndex = tracks.findIndex((t) => t.videoId === track.videoId);

  const isActive = isCurrentPlaylistActive && originalIndex === currentTrackIndex;

  return (
    <div
      style={style}
      className={`flex items-center justify-between px-4 border-b border-white/5 cursor-pointer transition-all duration-150 ${
        isActive
          ? 'bg-cyan-500/10 text-cyan-300'
          : 'hover:bg-white/5 text-white/80 hover:text-white'
      }`}
      onClick={() => onSelectTrack(originalIndex >= 0 ? originalIndex : index)}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Left Indicator */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          {isActive && isPlaying ? (
            <div className="flex items-end gap-[3px] h-4">
              <span className="w-[3px] bg-cyan-400 rounded-full animate-bounce eq-bar-1" />
              <span className="w-[3px] bg-cyan-400 rounded-full animate-bounce eq-bar-2" style={{ animationDelay: '0.15s' }} />
              <span className="w-[3px] bg-cyan-400 rounded-full animate-bounce eq-bar-3" style={{ animationDelay: '0.3s' }} />
            </div>
          ) : isActive ? (
            <Play size={13} className="text-cyan-400 fill-cyan-400" />
          ) : (
            <Music size={13} className="text-white/40" />
          )}
        </div>

        {/* Thumbnail (MQ) */}
        <div
          className="h-10 w-14 shrink-0 rounded bg-cover bg-center border border-white/10 bg-slate-900/60"
          style={{
            backgroundImage: `url('https://img.youtube.com/vi/${track.videoId}/mqdefault.jpg')`,
          }}
        />

        {/* Text metadata */}
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-medium tracking-[0.06em] ${isActive ? 'font-semibold' : ''}`}>
            {track.title}
          </p>
          <p className="truncate text-[10px] uppercase tracking-[0.18em] text-white/45 mt-0.5">
            {track.author}
          </p>
        </div>
      </div>

      {/* Duration */}
      {track.durationText && (
        <div className="shrink-0 font-mono text-xs text-white/50 pl-3">
          {track.durationText}
        </div>
      )}
    </div>
  );
});

// React Import is required for React.memo in this next setup, let's make sure it imports React
import React from 'react';

export default function SongsPage({ playlistId }: SongsPageProps) {
  const router = useRouter();
  const {
    activePlaylistId,
    tracks,
    isLoadingTracks,
    error,
    currentTrackIndex,
    isPlaying,
    playTrack,
  } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');

  const activePlaylist = useMemo(() => {
    return playlists.find((p) => p.id === playlistId) || playlists[0];
  }, [playlistId]);

  const isCurrentPlaylistActive = activePlaylistId === playlistId;

  // Filter tracks in real-time
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return tracks;
    const query = searchQuery.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.author.toLowerCase().includes(query)
    );
  }, [tracks, searchQuery]);

  const handleSelectTrack = useCallback(
    (originalIndex: number) => {
      // If the active playlist in the player is not this one, we must navigate back to set it, or let the player mount it.
      // Wait! If the user clicks a song from a different playlist, we need to push them back to the playlist page
      // to mount that playlist in the player, OR we can let them play it directly if the player supports list swaps.
      // But the player changes its playlistId route parameter key when we go to a new playlist, which triggers a reload.
      // So if this page is NOT the active playlist, we should first navigate back to the main playlist page!
      if (!isCurrentPlaylistActive) {
        if (playlistId === 'lofi') {
          router.push(`/?playIndex=${originalIndex}`);
        } else {
          router.push(`/playlist/${playlistId}?playIndex=${originalIndex}`);
        }
      } else {
        playTrack(originalIndex);
      }
    },
    [isCurrentPlaylistActive, playlistId, router, playTrack]
  );

  // Item data object passed to the react-window Row renderer to avoid closure allocations
  const itemData = useMemo(
    () => ({
      filteredTracks,
      currentTrackIndex,
      isCurrentPlaylistActive,
      isPlaying,
      onSelectTrack: handleSelectTrack,
      tracks,
    }),
    [filteredTracks, currentTrackIndex, isCurrentPlaylistActive, isPlaying, handleSelectTrack, tracks]
  );

  const playlistTitle = activePlaylist.title || 'Lofi Radio';

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#0d0908] text-white font-jetbrains flex flex-col">
      {/* Styles for visual equalizer animation */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .eq-bar-1 { animation: bounce 0.8s ease-in-out infinite alternate; }
        .eq-bar-2 { animation: bounce 0.5s ease-in-out infinite alternate; }
        .eq-bar-3 { animation: bounce 0.7s ease-in-out infinite alternate; }
        
        /* Sleek custom scrollbars for tracklist */
        .tracklist-container::-webkit-scrollbar {
          width: 6px;
        }
        .tracklist-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .tracklist-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 99px;
        }
        .tracklist-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.22);
        }
      `}</style>

      {/* Dynamic Blurred Background */}
      <div
        className="fixed left-0 top-0 z-0 h-screen w-full bg-cover bg-center bg-no-repeat transition-all duration-700 opacity-60"
        style={{
          backgroundImage: `url('${activePlaylist.bgImage || '/bg/lofi.png'}')`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_40%),linear-gradient(180deg,rgba(10,10,10,0.5),rgba(5,5,5,0.92))]" />
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex-grow px-6 pt-10 pb-12 flex flex-col items-center">
        {/* Navigation back button */}
        <div className="w-full max-w-2xl mb-8 flex justify-start">
          <Link
            href={playlistId === 'lofi' ? '/' : `/playlist/${playlistId}`}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/80 transition-all hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Back to Player</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-[0.08em] uppercase text-white/95 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {playlistTitle}
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/40">
            Select a track to play immediately
          </p>
        </div>

        {/* Central Track Container Card */}
        <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/15 bg-black/45 shadow-[0_32px_80px_rgba(3,7,18,0.5)] backdrop-blur-2xl">
          {/* Real-time search bar */}
          <div className="relative border-b border-white/10 px-5 py-4 flex items-center">
            <Search size={18} className="absolute left-[33px] text-white/40" />
            <input
              type="text"
              placeholder="Search tracks by title or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 rounded-full border border-white/10 bg-white/[0.04] text-sm tracking-[0.08em] placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.06] focus:outline-none transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-9 text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* List States (Loading, Error, Empty, and Virtualized List) */}
          <div className="h-[400px] w-full">
            {isLoadingTracks && tracks.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-cyan-400" />
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Loading tracks...</p>
              </div>
            ) : error && tracks.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center gap-3">
                <Music size={24} className="text-rose-400/65" />
                <p className="text-xs tracking-[0.08em] text-white/60">{error}</p>
                <button
                  onClick={() => router.refresh()}
                  className="mt-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/80 hover:bg-white/10 hover:text-white"
                >
                  Retry
                </button>
              </div>
            ) : filteredTracks.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center gap-2">
                <Search size={24} className="text-white/20" />
                <p className="text-xs tracking-[0.08em] text-white/45">No matching tracks found.</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] text-cyan-400 hover:bg-white/10"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              // Virtualized List using react-window
              <List
                height={400}
                itemCount={filteredTracks.length}
                itemSize={56}
                width="100%"
                itemData={itemData}
                className="tracklist-container"
              >
                {SongRow}
              </List>
            )}
          </div>
        </div>
      </div>

      {/* Footer component at page bottom */}
      <div className="relative z-10 w-full mt-auto">
        <Footer className="mt-16" />
      </div>
    </main>
  );
}
