import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getPlaylistById, playlistList } from '@/lib/playlists';
import PlaylistPage from '@/components/PlaylistPage';

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export async function generateStaticParams() {
    return playlistList.map((playlist) => ({
        id: playlist.id,
    }));
}

export async function generateMetadata({
    params,
}: Props): Promise<Metadata> {
    const { id } = await params;

    const playlist = getPlaylistById(id);

    if (!playlist) {
        return {
            title: 'Playlist Not Found | Lofi Radio',
        };
    }

    return {
        title: `${playlist.title} | Lofi Radio`,
        description: playlist.subtitle
            ? `${playlist.subtitle} Listen to ${playlist.title} online with Lofi Radio.`
            : `Listen to ${playlist.title} online with Lofi Radio.`,
    };
}

export default async function PlaylistPageRoute({
    params,
}: Props) {
    const { id } = await params;

    const playlist = getPlaylistById(id);

    if (!playlist) {
        notFound();
    }

    return (
        <PlaylistPage
            playlistId={playlist.id}
        />
    );
}