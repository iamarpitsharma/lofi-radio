'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

export type Track = {
  videoId: string;
  title: string;
  author: string;
  durationText?: string;
};

type PlayerContextType = {
  activePlaylistId: string;
  tracks: Track[];
  isLoadingTracks: boolean;
  error: string | null;
  currentTrackIndex: number;
  isPlaying: boolean;
  playTrack: (index: number) => void;
  registerPlayer: (player: any) => void;
  syncPlayingIndex: (index: number) => void;
  syncIsPlaying: (playing: boolean) => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activePlaylistId, setActivePlaylistId] = useState('lofi');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);

  // Parse playlist ID from pathname
  useEffect(() => {
    if (!pathname) return;
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'playlist' && segments[1]) {
      setActivePlaylistId(segments[1]);
    } else if (segments[0] === 'songs') {
      setActivePlaylistId('lofi');
    } else if (pathname === '/') {
      setActivePlaylistId('lofi');
    }
  }, [pathname]);

  // Fetch playlist tracks from API route
  useEffect(() => {
    let active = true;
    const fetchTracks = async () => {
      setIsLoadingTracks(true);
      setError(null);
      try {
        const res = await fetch(`/api/playlist?id=${activePlaylistId}`);
        if (!res.ok) {
          throw new Error('Failed to load playlist track list');
        }
        const data = await res.json();
        if (active) {
          setTracks(data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to load tracks.');
          setTracks([]);
        }
      } finally {
        if (active) {
          setIsLoadingTracks(false);
        }
      }
    };

    fetchTracks();
    return () => {
      active = false;
    };
  }, [activePlaylistId]);

  const registerPlayer = useCallback((player: any) => {
    playerRef.current = player;
  }, []);

  const playTrack = useCallback((index: number) => {
    if (playerRef.current && typeof playerRef.current.playVideoAt === 'function') {
      try {
        playerRef.current.playVideoAt(index);
        setCurrentTrackIndex(index);
        setIsPlaying(true);
      } catch (err) {
        console.error('Error invoking playVideoAt:', err);
      }
    } else {
      console.warn('YouTube Player API is not loaded or registered yet.');
    }
  }, []);

  const syncPlayingIndex = useCallback((index: number) => {
    setCurrentTrackIndex(index);
  }, []);

  const syncIsPlaying = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        activePlaylistId,
        tracks,
        isLoadingTracks,
        error,
        currentTrackIndex,
        isPlaying,
        playTrack,
        registerPlayer,
        syncPlayingIndex,
        syncIsPlaying,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
