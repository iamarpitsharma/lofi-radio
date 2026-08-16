'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import playlists from '@/data/Playlists.json';

export default function Footer() {
    const router = useRouter();

    return (
        <footer className="relative z-10 mt-[100vh] w-full border-t border-white/10 bg-white/6 pb-40 text-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">

            {/* Content stays constrained */}
            <div className="mx-auto w-[90%] max-w-3xl px-6 py-8">

                {/* Top: Logo & Title */}
                <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        <Image
                            src="/lofi-radio-logo.png"
                            alt="Lofi Radio Logo"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div>
                        <h2 className="text-base font-bold tracking-wider text-white">
                            Lofi Radio
                        </h2>

                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                            Curated around the clock streams
                        </p>
                    </div>
                </div>

                {/* Description */}
                <p className="mt-5 text-sm leading-relaxed text-white/70 font-sans sm:text-[15px]">
                    Immersive radio broadcasts playing round the clock —
                    handcrafted lofi beats, late-night sessions, and timeless
                    tracks. Sit back, tune in, and let the static fade away.
                </p>

                {/* Rotations / Categories Grid */}
                <div className="mt-5 border-t border-white/10 pt-4">
                    <span className="mb-3 block text-[10px] uppercase tracking-[0.3em] text-white/40">
                        Rotations
                    </span>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/80 sm:gap-x-6 sm:text-[15px]">
                        {playlists.map((playlist) => {
                            const href = playlist.id === 'lofi' ? '/' : `/playlist/${playlist.id}`;

                            return (
                                <button
                                    key={playlist.id}
                                    type="button"
                                    onClick={() => router.push(href)}
                                    className="group grid grid-cols-[12px_1fr]  rounded-full border border-transparent  text-left transition hover:border-white/10 hover:bg-white/4 hover:text-white"
                                >
                                    <span className="text-white/60 transition group-hover:text-white">•</span>
                                    <span>{playlist.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Disclaimers & Copyright */}
                <div className="mt-5 border-t border-white/10 pt-4 text-[11px] text-white/50 sm:text-xs">

                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] leading-relaxed text-white/55 sm:text-[11px]">
                            Audio plays through YouTube’s embedded player. Nothing is hosted on this site, and all rights stay with the labels, composers and performers. Song credits are put together from film soundtrack listings.
                        </p>

                        <p className="text-[10px] leading-relaxed text-white/55 sm:text-[11px]">
                            If you hold rights to anything here and want it taken off,
                            email{' '}
                            <a
                                href="mailto:arpitsharma685@gmail.com"
                                className="text-cyan-300 transition hover:text-cyan-200"
                            >
                                arpitsharma685@gmail.com
                            </a>{' '}
                            and it comes down.
                        </p>

                        <p className="pt-2 tracking-[0.12em] text-white/40">
                            © 2026 LOFIRADIO.IN
                        </p>
                    </div>

                </div>

            </div>
        </footer>
    );
}