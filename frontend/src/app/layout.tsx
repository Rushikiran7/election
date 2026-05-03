import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tamil Nadu Smart Election Assistant 2026",
  description: "AI-guided portal for the 2026 Tamil Nadu Assembly Elections. Find candidates, parties, and voting information.",
  keywords: "Tamil Nadu election 2026, candidates, constituency, voting, EVM, DMK, AIADMK, TVK",
  openGraph: {
    title: "Tamil Nadu Smart Election Assistant 2026",
    description: "Know your candidates and navigate the 2026 Tamil Nadu Assembly Elections with AI assistance.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Accessibility: skip-to-content link for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-brand-main focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:shadow-xl"
        >
          Skip to main content
        </a>

        <NavBar />

        <main
          id="main-content"
          role="main"
          aria-label="Tamil Nadu Election Assistant main content"
          className="min-h-screen relative z-10 px-4 md:px-10 py-6 max-w-7xl mx-auto"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Google Analytics placeholder — swap GA_MEASUREMENT_ID for real ID */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TNELECTION2026');
            `,
          }}
        />
      </body>
    </html>
  );
}
