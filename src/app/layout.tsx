import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

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
    template: "%s | EventJini",
    default: "EventJini | Gen-Z Event Platform",
  },
  description:
    "Seamlessly manage, host, and experience events with EventJini. The premium Event Management SaaS.",
  keywords: ["event management", "SaaS", "ticketing", "events", "Gen-Z events", "EventJini"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eventjini.com",
    title: "EventJini | Gen-Z Event Platform",
    description: "Seamlessly manage, host, and experience events with EventJini. The premium Event Management SaaS.",
    siteName: "EventJini",
    images: [
      {
        url: "https://eventjini.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EventJini - The Premium Event OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EventJini | Gen-Z Event Platform",
    description: "Seamlessly manage, host, and experience events with EventJini. The premium Event Management SaaS.",
    images: ["https://eventjini.com/twitter-image.jpg"],
    creator: "@eventjini",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#ededed",
            },
          }}
        />
      </body>
    </html>
  );
}
