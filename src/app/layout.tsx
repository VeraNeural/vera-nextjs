import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TrialProvider } from "@/components/trial/TrialContext";
import AudioPlayer from "@/components/audio/AudioPlayer";

export const metadata: Metadata = {
  title: "VERA - Your AI Co-Regulator",
  description:
    "Experience nervous system co-regulation with VERA, your compassionate AI companion for emotional support and mental wellness.",
  keywords: [
    "AI therapy",
    "mental health",
    "emotional support",
    "co-regulation",
    "VERA",
    "wellness",
  ],
  authors: [{ name: "VERA Neural" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "VERA - Your AI Co-Regulator",
    description: "Experience nervous system co-regulation with VERA",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0e27",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <TrialProvider>
          <AudioPlayer />
          {children}
        </TrialProvider>
      </body>
    </html>
  );
}
