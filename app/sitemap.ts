import type { MetadataRoute } from 'next';
import { playlistList } from '@/lib/playlists';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lofiradio.in';

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/songs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dynamic playlist routes from our JSON data
  const playlistRoutes: MetadataRoute.Sitemap = playlistList.flatMap((playlist) => [
    {
      url: `${baseUrl}/playlist/${playlist.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/playlist/${playlist.id}/songs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]);

  return [...routes, ...playlistRoutes];
}
