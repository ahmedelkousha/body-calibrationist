import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shelleys.studio"),
  title: {
    default: "Shelley's — Slow beauty, considered care",
    template: "%s · Shelley's",
  },
  description:
    "A quiet studio for holistic massage, bespoke facials and advanced skin therapy. Small-batch products, seasonal workshops and care that meets you where you are.",
  keywords: [
    "holistic massage",
    "bespoke facial",
    "advanced skin therapy",
    "wellness studio",
    "skin consultation",
    "shelley's",
  ],
  openGraph: {
    title: "Shelley's — Slow beauty, considered care",
    description:
      "Holistic massage, bespoke facials, advanced skin therapy and small-batch products from a small studio by the sea.",
    type: "website",
    images: ["/images/hero.webp"],
  },
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream text-ink">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
