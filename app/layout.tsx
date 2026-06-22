import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-plex",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Relay — Dispatch Platform",
  description: "Two-sided logistics dispatch platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${ibmPlexMono.variable} ${dmSans.variable}`}
    >
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
