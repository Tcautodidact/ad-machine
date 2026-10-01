import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { getWorkspaces, isDemo } from "@/lib/data";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ad Machine",
  description: "Scrape, analyseer en manage ads voor al je bedrijven",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const workspaces = await getWorkspaces();
  return (
    <html lang="nl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col md:flex-row">
        <Suspense>
          <Sidebar workspaces={workspaces} demo={isDemo()} />
        </Suspense>
        <main className="flex-1 min-w-0 px-5 py-6 md:px-10 md:py-10">{children}</main>
      </body>
    </html>
  );
}
