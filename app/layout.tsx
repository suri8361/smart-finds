import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { loadCatalog } from "@/lib/data/catalog";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Clean, modern sans (bold, upright) for headlines/wordmarks only
// (`font-display tracking-tight font-semibold` utility, wired up in globals.css) — body and UI copy stay
// in Geist Sans. Swapped in for Fraunces on Nov 1, 2026: the serif + italic
// was hard on the eyes.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Products come from the `data` branch while the site runs (lib/data/catalog.ts). Pages re-read
// it at least once a day by themselves, and right away when the import calls /api/refresh.
// (The home page re-checks every 10 minutes for its rotating hero photos.)
export const revalidate = 86400;

const baseMetadata: Metadata = {
  title: {
    default: "Smart Finds — Curated Picks You Can Trust",
    template: "%s | Smart Finds",
  },
  description:
    "Smart Finds is an independently curated shopping guide to great finds from Amazon, SHEIN, AliExpress, Temu and more.",
};

export async function generateMetadata(): Promise<Metadata> {
  const catalog = await loadCatalog();
  // Invisible to visitors: which product list this page was built from (for checking the data branch is live).
  return { ...baseMetadata, other: { "sf-catalog": `${catalog.source} ${catalog.version}` } };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await loadCatalog();
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <Footer />
        <MobileTabBar />
      </body>
    </html>
  );
}
