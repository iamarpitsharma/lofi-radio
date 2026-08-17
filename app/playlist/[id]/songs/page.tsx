import { notFound } from 'next/navigation';
import { getPlaylistById } from '@/lib/playlists';
import SongsPage from '@/components/SongsPage';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlaylistSongsPage({ params }: Props) {
  const { id } = await params;
  const playlist = getPlaylistById(id);

  if (!playlist) {
    notFound();
  }

  return <SongsPage playlistId={playlist.id} />;
}
