import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
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
  title: "Prelegal — Mutual NDA Creator",
  description: "Create a Mutual Non-Disclosure Agreement in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TRPCReactProvider>
          <div className="min-h-screen bg-background">
            <header className="border-b bg-card">
              <div className="mx-auto max-w-4xl px-4 py-4">
                <p className="text-lg font-semibold tracking-tight">Prelegal</p>
                <p className="text-sm text-muted-foreground">Legal documents, simplified.</p>
              </div>
            </header>
            <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
