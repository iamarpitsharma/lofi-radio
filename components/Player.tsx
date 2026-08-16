'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Slider } from '@mantine/core';
import YouTube from 'react-youtube';
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import playlists from '@/data/Playlists.json';

type PlaylistItem = {
  id?: string;
  title: string;
  youtubeUrl: string;
  fontFamily?: string;
};

type PlayerApi = {
  playVideo?: () => void;
  pauseVideo?: () => void;
  stopVideo?: () => void;
  setVolume?: (value: number) => void;
  unMute?: () => void;
  mute?: () => void;
  seekTo?: (time: number, allowSeekAhead: boolean) => void;
  getCurrentTime?: () => number;
  getDuration?: () => number;
  getVideoData?: () => { video_id?: string; title?: string; author?: string };
  nextVideo?: () => void;
  previousVideo?: () => void;
};

const resolvePlaylist = (currentIndex = 0): PlaylistItem => {
  if (Array.isArray(playlists) && playlists.length > 0) {
    return playlists[currentIndex] ?? playlists[0];
  }

  const legacyPlaylist = (playlists as { defaultPlaylist?: PlaylistItem })?.defaultPlaylist;
  if (legacyPlaylist) {
    return legacyPlaylist;
  }

  return {
    id: 'lofi',
    title: 'Tunning in...',
    youtubeUrl: 'https://youtube.com/playlist?list=PLgxs93BSP-hrI_pMZT28kVmGcvfFq234b&si=VAKgQEnGOxOW_DTS',
    fontFamily: 'font-sans',
  };
};

const getPlaylistId = (url: string) => {
  try {
    const parsed = new URL(url);
    const list = parsed.searchParams.get('list');
    if (list) return list;
  } catch {
    // ignore malformed urls and fall back to a direct parse
  }

  const fallbackMatch = url.match(/(?:[?&]|%3F|%26)list=([^&]+)/i);
  return fallbackMatch ? fallbackMatch[1] : '';
};

const getVideoImage = (videoId: string | undefined) => {
  if (!videoId) return '/background.png';
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export default function Player({ currentIndex = 0 }: { currentIndex?: number }) {
  const playerRef = useRef<PlayerApi>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeControls, setShowVolumeControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [artUrl, setArtUrl] = useState<string>('/background.png');
  const [statusText, setStatusText] = useState('');
  const activePlaylist = resolvePlaylist(currentIndex);
  const [trackTitle, setTrackTitle] = useState(() => activePlaylist.title);
  const [trackAuthor, setTrackAuthor] = useState('Late Night Mix');

  const playlistFontClass = activePlaylist.fontFamily ?? 'font-sans';
  const youtubeUrl = activePlaylist.youtubeUrl;
  const youtubePlaylistId = getPlaylistId(youtubeUrl);

  const youtubeOpts = useMemo(
    () => ({
      width: '200',
      height: '120',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        listType: 'playlist',
        list: youtubePlaylistId,
        loop: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
      },
    }),
    [youtubePlaylistId],
  );

  useEffect(() => {
    const loadPlaylistArt = async () => {
      try {
        const response = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`,
        );

        if (!response.ok) throw new Error('Thumbnail not found');

        const data = (await response.json()) as { thumbnail_url?: string };
        if (data.thumbnail_url) {
          setArtUrl(data.thumbnail_url);
        }
      } catch {
        setArtUrl('/background.png');
      }
    };

    loadPlaylistArt();
  }, [youtubeUrl]);

  useEffect(() => {
    const playerApi = playerRef.current;
    if (!playerApi) return;

    if (playerApi.setVolume) {
      playerApi.setVolume(Math.round(volume * 100));
    }

    if (!isMuted) {
      playerApi.unMute?.();
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const playerApi = playerRef.current;
    if (!playerApi) return;

    if (isMuted) {
      playerApi.mute?.();
    } else {
      playerApi.unMute?.();
    }
  }, [isMuted]);

  useEffect(() => {
    if (!isPlaying || !playerRef.current) return;

    const intervalId = window.setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const nextTime = Number(playerRef.current.getCurrentTime()) || 0;
        setCurrentTime(nextTime);
      }
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [isPlaying]);

  const updateVideoMeta = () => {
    const playerApi = playerRef.current;
    if (!playerApi || !playerApi.getVideoData) return;

    const videoData = playerApi.getVideoData();
    const nextVideoId = videoData?.video_id;
    const title = videoData?.title || activePlaylist.title;
    const author = videoData?.author || 'Late Night Mix';

    setTrackTitle(title);
    setTrackAuthor(author);
    setArtUrl(getVideoImage(nextVideoId));

    if (playerApi.getDuration) {
      const nextDuration = Number(playerApi.getDuration()) || 0;
      setDuration(nextDuration);
    }
  };

  const seekTo = (nextTime: number) => {
    const safeTime = Math.max(0, nextTime);
    const playerApi = playerRef.current;
    if (playerApi?.seekTo) {
      playerApi.seekTo(safeTime, true);
    }
    setCurrentTime(safeTime);
  };

  const togglePlay = () => {
    const nextState = !isPlaying;
    const playerApi = playerRef.current;
    if (playerApi) {
      if (nextState) {
        playerApi.playVideo?.();
      } else {
        playerApi.pauseVideo?.();
      }
    }
    setIsPlaying(nextState);
    setStatusText(nextState ? 'Playing live mix' : 'Paused');
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    setShowVolumeControls((prev) => !prev);
  };

  useEffect(() => {
    if (!showVolumeControls) return;

    const timeoutId = window.setTimeout(() => {
      setShowVolumeControls(false);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [showVolumeControls, volume]);

  const nextTrack = () => {
    const playerApi = playerRef.current;
    if (playerApi?.nextVideo) {
      playerApi.nextVideo();
    }
    setTimeout(() => updateVideoMeta(), 300);
  };

  const previousTrack = () => {
    const playerApi = playerRef.current;
    if (playerApi?.previousVideo) {
      playerApi.previousVideo();
    }
    setTimeout(() => updateVideoMeta(), 300);
  };

  const formatTime = (time: number) => {
    if (Number.isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const displayTitle = trackTitle || 'Tunning in...';

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-3xl">
        {statusText ? (
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.35em] text-white/85 shadow-[0_0_18px_rgba(255,255,255,0.12)] backdrop-blur-md">
              {statusText}
            </div>
          </div>
        ) : null}

        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(135deg,rgba(17,17,17,0.72),rgba(30,30,30,0.6),rgba(15,15,15,0.8))] px-3 py-3 shadow-[0_28px_80px_rgba(3,7,18,0.4)] backdrop-blur-2xl sm:px-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.04),_transparent_34%)]" />
          <div className="pointer-events-none absolute -left-[9999px] top-0 h-[120px] w-[200px] overflow-hidden opacity-0">
            <YouTube
              key={youtubePlaylistId}
              opts={youtubeOpts}
              onReady={(event) => {
                playerRef.current = event.target;
                setStatusText('');
                updateVideoMeta();
                if (typeof event.target.setVolume === 'function') {
                  event.target.setVolume(Math.round(volume * 100));
                }
                if (isMuted) {
                  event.target.mute();
                } else {
                  event.target.unMute();
                }
              }}
              onStateChange={(event) => {
                const playerState = event.data;
                const playing = playerState === 1;
                setIsPlaying(playing);
                setStatusText('');

                if (typeof event.target.getCurrentTime === 'function') {
                  setCurrentTime(event.target.getCurrentTime());
                }
                if (typeof event.target.getDuration === 'function') {
                  setDuration(event.target.getDuration());
                }

                updateVideoMeta();
              }}
              onError={(error) => {
                console.error('YouTube Player Error:', error);
                setStatusText('Unable to load playlist');
              }}
            />
          </div>

          <div className="relative grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center lg:gap-5">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4 overflow-hidden">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/20 bg-slate-900/60 shadow-[0_0_22px_rgba(255,255,255,0.14)] ring-1 ring-white/15 sm:h-[4.5rem] sm:w-[4.5rem]">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-700 animate-[spin_12s_linear_infinite]"
                  style={{
                    backgroundImage: `url('${artUrl}')`,
                    animationPlayState: isPlaying ? 'running' : 'paused',
                  }}
                />
                <div className="absolute inset-2 rounded-full border border-white/10" />
              </div>

              <div className="min-w-0 w-full flex-1 overflow-hidden">
                <p className={`truncate text-sm font-semibold tracking-[0.12em] text-white sm:text-base`}>
                  {displayTitle}
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-white/65 sm:text-[10px]">
                  {trackAuthor}
                </p>

                <div className="mt-2 flex w-full items-center gap-1">
                  <Slider
                    color="white"
                    size="xs"
                    min={0}
                    max={duration || 100}
                    step={1}
                    value={Math.round(currentTime)}
                    onChange={(val) => seekTo(Number(val))}
                    label={null}
                    classNames={{
                      root: 'min-w-0 flex-1',
                      track: 'bg-white/20 border-0',
                      bar: 'bg-white',
                      thumb:
                        'w-3 h-3 bg-white border-0 shadow-[0_0_5px_rgba(255,255,255,0.8)]',
                    }}
                  />

                  <span className="shrink-0 whitespace-nowrap font-mono text-[9px] ml-1 text-white/75 sm:text-[10px]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={previousTrack}
                className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white/80 transition hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:text-white"
                aria-label="Previous track"
              >
                <SkipBack size={18} />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.26)] transition hover:scale-105 hover:shadow-[0_0_28px_rgba(255,255,255,0.32)] sm:h-14 sm:w-14"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={nextTrack}
                className="rounded-full border border-white/15 bg-white/5 p-2.5 text-white/80 transition hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:text-white"
                aria-label="Next track"
              >
                <SkipForward size={18} />
              </button>

              <div className="flex items-center gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="rounded-full border border-white/15 bg-white/5 p-2 text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${showVolumeControls ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0'
                    }`}
                >
                  <div className="w-20">
                    <Slider
                      color="white"
                      size="xs"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={(val) => {
                        const nextVolume = Number(val);
                        setVolume(nextVolume);
                        if (nextVolume > 0 && isMuted) {
                          setIsMuted(false);
                        }
                      }}
                      label={(value) => `${Math.round(Number(value) * 100)}`}
                      classNames={{
                        root: 'w-20',
                        track: 'bg-white/20 border-0',
                        bar: 'bg-white',
                        thumb: 'w-3 h-3 bg-white border-0 shadow-[0_0_5px_rgba(255,255,255,0.8)]',
                      }}
                      aria-label="Volume"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden shrink-0 items-center justify-end gap-2 sm:flex sm:gap-3">
              <button
                type="button"
                onClick={toggleMute}
                className="rounded-full border border-white/15 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>

              <Slider
                color="white"
                size="xs"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(val) => {
                  const nextVolume = Number(val);
                  setVolume(nextVolume);
                  if (nextVolume > 0 && isMuted) {
                    setIsMuted(false);
                  }
                }}
                label={(value) => `${Math.round(Number(value) * 100)}`}
                classNames={{
                  root: 'w-20 sm:w-24',
                  track: 'bg-white/20 border-0',
                  bar: 'bg-white',
                  thumb: 'w-3 h-3 bg-white border-0 shadow-[0_0_5px_rgba(255,255,255,0.8)]',
                }}
                aria-label="Volume"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <a
            href="mailto:arpitsharma684@gmail.com"
            className="text-[10px] uppercase tracking-[0.32em] text-white/70 transition hover:text-white"
          >
            contact: arpitsharma684@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
