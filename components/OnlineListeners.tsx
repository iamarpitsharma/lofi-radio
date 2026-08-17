'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const STORAGE_KEY = 'lofi-radio-listener-id';

export default function OnlineListeners() {
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        // Get existing listener ID or create one
        let listenerId = localStorage.getItem(STORAGE_KEY);

        if (!listenerId) {
            const generateUUID = () => {
                if (typeof window !== 'undefined' && typeof window.crypto !== 'undefined' && typeof window.crypto.randomUUID === 'function') {
                    return window.crypto.randomUUID();
                }
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = (Math.random() * 16) | 0;
                    const v = c === 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                });
            };
            listenerId = generateUUID();
            localStorage.setItem(STORAGE_KEY, listenerId);
        }

        const channel = supabase.channel('lofi-radio', {
            config: {
                presence: {
                    key: listenerId,
                },
            },
        });

        const updateOnlineCount = () => {
            const presenceState = channel.presenceState();

            setOnlineCount(Object.keys(presenceState).length);
        };

        channel
            .on('presence', { event: 'sync' }, updateOnlineCount)
            .on('presence', { event: 'join' }, updateOnlineCount)
            .on('presence', { event: 'leave' }, updateOnlineCount)
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        listener_id: listenerId,
                        online_at: new Date().toISOString(),
                    });

                    updateOnlineCount();
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="flex items-center gap-2.5 whitespace-nowrap text-[12px] tracking-[0.12em] text-white/55">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

            <span>
                {onlineCount === 1
                    ? '1 listener right now'
                    : `${onlineCount} listeners right now`}
            </span>
        </div>
    );
}