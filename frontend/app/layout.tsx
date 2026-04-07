import type { Metadata } from "next";
import { Inter, Playfair_Display, Caveat } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-handwritten" });

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
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${caveat.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-coffee-cream text-coffee-oil paper-texture-bg">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
