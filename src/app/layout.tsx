import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ModalProvider } from "@/components/ModalProvider";
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DefenseTender - Veille Marchés Publics Défense",
  description: "Plateforme de veille stratégique des marchés publics de défense et sécurité.",
};

import { ClerkProvider } from '@clerk/nextjs'
import { frFR } from '@clerk/localizations'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--bg-body)] text-[var(--foreground)] flex flex-col min-h-screen transition-colors duration-300`}
        >
          <ThemeProvider>
            <ModalProvider>
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </ModalProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
