import type { Metadata } from "next";
import {
  Fraunces,
  IBM_Plex_Mono,
  Source_Sans_3,
} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "RBI Statistics on Indian States 2024-25",
  description: "Interactive visualization of the RBI Handbook of Statistics on Indian States, featuring state-wise data on GDP, banking, exports, tourism, and more.",
  keywords: ["RBI", "India", "States", "Statistics", "GDP", "Banking", "Exports", "Tourism"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${body.variable} ${display.variable} ${mono.variable} antialiased`}
      >
        <div className="site-background" aria-hidden="true" />
        <div className="page-shell">
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-[#0b1d2a] text-white py-10 mt-16 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className="text-white/70 text-sm">
                  Data Source: RBI Handbook of Statistics on Indian States, 2024-25
                </p>
                <p className="text-white/50 text-xs mt-2">
                  Reserve Bank of India | Department of Economic and Policy Research
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
