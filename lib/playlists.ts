import playlists from '@/data/Playlists.json';

export type PlaylistItem = {
    id: string;
    title: string;
    youtubeUrl: string;
    fontFamily?: string;
    bgImage?: string;
    subtitle?: string;
    icon?: string;
};

export const playlistList = playlists as PlaylistItem[];

export function getPlaylistById(id: string) {
    return playlistList.find((playlist) => playlist.id === id);
}