import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from '../context/ThemeContext';
import "./globals.css";
import Head from 'next/head';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DomAI",
  description: "The future of intelligent conversation is here.",
  icons: {
    icon: '/image/logo/Icon_chat.svg',
  },
  verification: {
    google: '3U5spYtXAu0uOIhUX8xWToGizggVXFaImdwVFnV_7Jw',
  },
  other: {
    "google-adsense-account": "ca-pub-5602570319866246",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href={metadata.icons.icon} />
        <meta name="google-site-verification" content={metadata.verification.google} />
        <meta name="google-adsense-account" content={metadata.other["google-adsense-account"]} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "DomAI",
          "url": "https://www.get-domai.xyz/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.get-domai.xyz/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}} />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
