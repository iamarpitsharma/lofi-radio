'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from '@mantine/core';
import {
    GiCoffeeCup,
    GiFire,
} from 'react-icons/gi';
import {
    MdRadio,
    MdAutoAwesome,
} from 'react-icons/md';

import OnlineListeners from '@/components/OnlineListeners';
import Player from '@/components/Player';
import Footer from '@/components/Footer';
import playlists from '@/data/Playlists.json';

type PlaylistItem = {
    id?: string;
    title: string;
    youtubeUrl: string;
    fontFamily?: string;
    bgImage?: string;
    subtitle?: string;
    icon?: string;
};

const playlistIcons: Record<string, React.ElementType> = {
    coffee: GiCoffeeCup,
    sparkles: MdAutoAwesome,
    radio: MdRadio,
    flame: GiFire,
};
type PlaylistPageProps = {
    playlistId: string;
};
export default function PlaylistPage({ playlistId }: PlaylistPageProps) {
    const router = useRouter();

    const playlistList: PlaylistItem[] = Array.isArray(playlists)
        ? (playlists as PlaylistItem[])
        : [];

    const playlistIndex = playlistList.findIndex(
        (playlist) => playlist.id === playlistId
    );

    const defaultIndex = playlistIndex >= 0 ? playlistIndex : 0;

    const [currentTime, setCurrentTime] = useState<string>('');
    const [currentIndex, setCurrentIndex] = useState<number>(defaultIndex);

    const activePlaylist = playlistList[currentIndex] || {
        id: 'lofi',
        title: 'Lofi Radio',
        youtubeUrl:
            'https://youtube.com/playlist?list=PLgxs93BSP-hrI_pMZT28kVmGcvfFq234b',
        fontFamily: 'font-lobster',
        bgImage: '/background.png',
        subtitle: "everyone's asleep. you're not.",
        icon: 'coffee',
    };

    const titleWords = (activePlaylist.title || 'Lofi Radio').split(' ');

    const firstWord = titleWords[0] || 'Lofi';

    const secondWord =
        titleWords.slice(1).join(' ') || 'Radio';

    // Active playlist icon
    const ActiveIcon =
        playlistIcons[activePlaylist.icon || ''] || MdRadio;

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();

            const hours24 = now.getHours();
            const minutes = now.getMinutes();

            const period = hours24 >= 12 ? 'PM' : 'AM';

            const hours12 = hours24 % 12 || 12;

            const formattedHours = hours12
                .toString()
                .padStart(2, '0');

            const formattedMinutes = minutes
                .toString()
                .padStart(2, '0');

            setCurrentTime(`${formattedHours}:${formattedMinutes} ${period}`);
        };

        updateClock();

        const timer = setInterval(updateClock, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden bg-[#120d0b] text-white font-jetbrains">
            {/* Google Fonts */}
            <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Bungee&family=JetBrains+Mono:wght@400;500&family=Lobster&family=Montserrat:wght@600&family=Playfair+Display:wght@700&family=Righteous&display=swap');

        .font-jetbrains {
            font-family: 'JetBrains Mono', monospace;
        }

        .font-lobster {
            font-family: 'Lobster', cursive;
        }

        .font-bungee {
            font-family: 'Bungee', cursive;
        }

        .font-playfair {
            font-family: 'Playfair Display', serif;
        }

        .font-righteous {
            font-family: 'Righteous', cursive;
        }

        .font-bebas {
            font-family: 'Bebas Neue', sans-serif;
            letter-spacing: 0.04em;
        }

        /* -------------------------------- */
        /* Playlist Glassmorphism Dropdown */
        /* -------------------------------- */

        .playlist-dropdown {
            overflow: hidden;
        }

        .playlist-option {
            transition:
                background 180ms ease,
                transform 180ms ease;
        }

        .playlist-option:hover {
          background: rgba(255, 255, 255, 0.08) !important;
        }

        .playlist-option[data-combobox-selected='true'] {
          background: rgba(255, 255, 255, 0.12) !important;
        }

        .playlist-option[data-combobox-selected='true']:hover {
          background: rgba(255, 255, 255, 0.16) !important;
        }

        /* Mantine input arrow */
        .playlist-input {
          transition:
            background 200ms ease,
            border-color 200ms ease,
            box-shadow 200ms ease;
        }

        .playlist-input:hover {
          background: rgba(255, 255, 255, 0.09) !important;
          border-color: rgba(255, 255, 255, 0.22) !important;
        }

        .playlist-input:focus {
          border-color: rgba(255, 255, 255, 0.28) !important;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.08),
            0 12px 40px rgba(15, 23, 42, 0.2) !important;
        }
      `}</style>

            {/* -------------------------------- */}
            {/* Dynamic Background */}
            {/* -------------------------------- */}

            <div
                className="fixed left-0 top-0 z-0 h-screen w-full bg-cover bg-center bg-no-repeat transition-all duration-700"
                style={{
                    backgroundImage: `url('${activePlaylist.bgImage || '/background.png'}')`,
                }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_35%),linear-gradient(180deg,rgba(10,10,10,0.38),rgba(7,7,10,0.82))]" />
            </div>

            <div className="fixed left-0 top-0 z-0 h-screen w-full bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_30%,rgba(255,255,255,0.02))]" />

            {/* -------------------------------- */}
            {/* Header */}
            {/* -------------------------------- */}

            <header className="absolute left-0 top-0 z-20 flex w-full items-center justify-between px-6 pt-8 sm:px-10 sm:pt-10">
                {/* Clock */}
                <div className="flex items-center">
                    <div className="font-jetbrains text-sm font-medium tracking-[0.08em] text-white/80 sm:text-base">
                        {currentTime || '12:00 AM'}
                    </div>
                </div>

                {/* -------------------------------- */}
                {/* Playlist Selector */}
                {/* -------------------------------- */}

                <div className="relative">
                    <label
                        htmlFor="playlist-select"
                        className="sr-only"
                    >
                        Select playlist
                    </label>

                    <Select
                        id="playlist-select"
                        value={String(currentIndex)}
                        onChange={(value) => {
                            if (value === null) return;

                            const index = Number(value);
                            const selectedPlaylist = playlistList[index];

                            if (!selectedPlaylist) return;

                            setCurrentIndex(index);

                            if (selectedPlaylist.id === 'lofi') {
                                router.push('/');
                            } else {
                                router.push(`/playlist/${selectedPlaylist.id}`);
                            }
                        }}
                        data={playlistList.map((playlist, index) => ({
                            value: String(index),
                            label: playlist.title,
                        }))}
                        allowDeselect={false}
                        checkIconPosition="right"
                        leftSection={
                            <ActiveIcon
                                size={16}
                                className="text-white/80"
                            />
                        }
                        renderOption={({ option }) => {
                            const playlist =
                                playlistList[Number(option.value)];

                            const Icon =
                                playlistIcons[playlist?.icon || ''] ||
                                MdRadio;

                            return (
                                <div className="flex w-full items-center gap-3">
                                    {/* Icon */}
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                        <Icon size={17} />
                                    </div>

                                    {/* Text */}
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <span className="truncate text-[11px] font-medium uppercase tracking-[0.12em] text-white">
                                            {playlist?.title}
                                        </span>
                                    </div>
                                </div>
                            );
                        }}
                        classNames={{
                            root: 'w-[165px] sm:w-[205px]',
                            input: 'playlist-input',
                            dropdown: 'playlist-dropdown',
                            option: 'playlist-option',
                        }}
                        styles={{
                            input: {
                                height: 40,

                                borderRadius: 9999,

                                border: '1px solid rgba(255,255,255,0.15)',

                                background: 'rgba(255,255,255,0.055)',

                                backdropFilter: 'blur(18px)',
                                WebkitBackdropFilter: 'blur(18px)',

                                color: 'white',

                                fontSize: 10,
                                fontWeight: 500,

                                letterSpacing: '0.16em',

                                textTransform: 'uppercase',

                                paddingLeft: 40,
                                paddingRight: 36,

                                boxShadow:
                                    '0 12px 40px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.04)',
                            },

                            section: {
                                color: 'rgba(255,255,255,0.75)',
                            },

                            dropdown: {
                                marginTop: 8,

                                padding: 6,

                                borderRadius: 18,

                                border:
                                    '1px solid rgba(255,255,255,0.14)',

                                background:
                                    'linear-gradient(145deg, rgba(35,35,42,0.78), rgba(15,15,20,0.72))',

                                backdropFilter: 'blur(28px)',
                                WebkitBackdropFilter: 'blur(28px)',

                                boxShadow:
                                    '0 24px 70px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',

                                overflow: 'hidden',
                            },

                            options: {
                                padding: 2,
                            },

                            option: {
                                minHeight: 50,

                                borderRadius: 13,

                                padding: '8px 10px',

                                color: 'white',

                                background: 'transparent',
                            },

                            empty: {
                                color: 'rgba(255,255,255,0.5)',
                            },
                        }}
                    />
                </div>
            </header>

            <div className="absolute left-1/2 top-24 z-20 -translate-x-1/2 sm:top-10">
                <OnlineListeners />
            </div>

            {/* -------------------------------- */}
            {/* Center Title */}
            {/* -------------------------------- */}

            <div className="pointer-events-none absolute left-1/2 top-1/4 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
                <h1
                    className={`${activePlaylist.fontFamily} text-6xl font-normal leading-tight tracking-wide text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4),0_0_40px_rgba(255,255,255,0.2)] sm:text-8xl`}
                >
                    {firstWord}

                    <br />

                    <span className="inline-block pl-8 sm:pl-12">
                        {secondWord}
                    </span>
                </h1>

                <p className="mt-4 text-[10px] uppercase tracking-[0.5em] text-white/50 sm:text-xs">
                    {activePlaylist.subtitle ||
                        "everyone's asleep. you're not."}
                </p>
            </div>

            {/* -------------------------------- */}
            {/* Player */}
            {/* -------------------------------- */}

            <Player
                key={currentIndex}
                currentIndex={currentIndex}
            />

            <Footer />
        </main>
    );
}