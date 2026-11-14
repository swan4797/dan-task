import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import "@/styles/globals.scss";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Instant Valuation",
    template: "%s – Instant Valuation",
  },
  description:
    "Get an instant estimate of a property's value from recent sold prices nearby",
};

export const viewport: Viewport = {
  themeColor: "#2f5d50",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Header />

        <main className="main" id="main-content">
          <div className="container">{children}</div>
        </main>

        <Footer />
      </body>
    </html>
  );
}
