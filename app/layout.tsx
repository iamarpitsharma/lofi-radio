import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "./globals.css";
import { PlayerProvider } from "@/lib/PlayerContext";
import Player from "@/components/Player";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lofi Radio — Free Music & Curated Playlists",
    template: "%s | Lofi Radio",
  },

  description:
    "Listen to free music online with curated playlists for every mood. Enjoy Lofi Radio, P-Pop Vibes, 90s Bollywood, Bhojpuri Bangers, and more.",

  keywords: [
    "lofi radio",
    "online radio",
    "free music online",
    "free music",
    "music playlists",
    "lofi music",
    "lofi beats",
    "study music",
    "focus music",
    "P-Pop music",
    "90s Bollywood songs",
    "Bollywood playlist",
    "Bhojpuri songs",
    "Bhojpuri playlist",
    "Indian music",
  ],

  authors: [
    {
      name: "Arpit Sharma",
    },
  ],

  creator: "Arpit Sharma",

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },

  openGraph: {
    title: "Lofi Radio — Free Music & Curated Playlists",
    description:
      "Listen to free music online with curated playlists for every mood — from lo-fi beats and P-Pop to 90s Bollywood and Bhojpuri bangers.",
    type: "website",
    siteName: "Lofi Radio",
  },

  twitter: {
    card: "summary_large_image",
    title: "Lofi Radio — Free Music & Curated Playlists",
    description:
      "Curated music playlists for every mood. Listen to Lofi, P-Pop, 90s Bollywood, Bhojpuri and more.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          src="https://www.youtube.com/iframe_api"
          async
          defer
        />
      </head>
      <body className="min-h-full flex flex-col">
        <MantineProvider defaultColorScheme="dark">
          <PlayerProvider>
            {children}
            <Player />
          </PlayerProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
