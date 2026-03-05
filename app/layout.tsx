import type { Metadata } from "next";
import { JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono", // ✅ globals.css mein var(--font-jetbrains-mono) hai
  weight: ["400", "500", "700"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne", // ✅ globals.css mein var(--font-syne) hai
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FORGE — AI Website Builder",
  description: "Build production React apps with AI in seconds",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} ${syne.variable} font-mono bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}