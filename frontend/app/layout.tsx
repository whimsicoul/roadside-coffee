import type { Metadata } from "next";
import { Caveat, Tangerine, Cormorant } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const caveat = Caveat({ subsets: ["latin"], variable: "--font-handwritten" });
const tangerine = Tangerine({ subsets: ["latin"], weight: "700", variable: "--font-display" });
const cormorant = Cormorant({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Roadside Coffee",
  description: "Your favorite coffee ordering platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${caveat.variable} ${tangerine.variable} ${cormorant.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-coffee-cream text-coffee-oil paper-texture-bg">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
