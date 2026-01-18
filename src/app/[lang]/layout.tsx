
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { languages } from "@/i18n/settings";

const inter = Inter({ subsets: ["latin"] });

// Generate static params for all supported languages
export async function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  title: "Ski School OS",
  description: "Ski School Operations Platform",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params
  // Removed html and body tags to prevent nesting with the root layout
  return (
    <div className={`lang-root ${inter.className}`}>
      {children}
    </div>
  );
}
