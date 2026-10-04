import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const terminalMono = JetBrains_Mono({
  variable: "--font-terminal-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Heist School",
  description: "Interactive coding and security infiltration challenges.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`dark ${geistSans.variable} ${terminalMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background font-mono text-foreground selection:bg-accent-primary/25 selection:text-accent-primary"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
