import "./globals.css";
import type { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Liga de Boxeo | LDB.AI",
  description: "AI-powered boxing analysis, live news, and matchup predictions.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Liga de Boxeo (LDB.AI)",
    description: "AI-powered boxing analysis and live news.",
    url: process.env.SITE_URL || "http://localhost:3000",
    siteName: "Liga de Boxeo",
    images: [{ url: "/brand/logo.png", width: 800, height: 800 }],
    type: "website"
  },
  twitter: { card: "summary_large_image", title: "Liga de Boxeo", images: ["/brand/logo.png"] }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
