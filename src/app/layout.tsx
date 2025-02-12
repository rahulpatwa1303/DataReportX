import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DataReportX - Generate and Customize Reports Easily",
  description:
    "DataReportX allows you to create, customize, and download detailed reports tailored to your needs, powered by Next.js.",
  keywords:
    "data reports, custom reports, report generation, create reports, Next.js app",
  authors: [{ name: "Rahul Patwa" }],
  openGraph: {
    title: "DataReportX - Generate and Customize Reports Easily",
    description:
      "Create personalized reports with ease. DataReportX helps you generate detailed reports tailored to your needs, powered by Next.js.",
    url: "https://www.datreportx.com", // replace with your actual URL
    siteName: "DataReportX",
    images: [
      {
        url: "https://www.datreportx.com/og-image.jpg", // replace with your image URL
        width: 1200,
        height: 630,
        alt: "DataReportX - Custom Reports",
      },
    ],
    type: "website",
  },
  robots: "index, follow", // can be adjusted depending on whether you want to index the page
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        data-new-gr-c-s-check-loaded="14.1218.0"
        data-gr-ext-installed=""
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
