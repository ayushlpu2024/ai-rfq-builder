import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetalRFQ — AI-Powered RFQ Builder for Metal Industry",
  description:
    "Create professional Request for Quotation documents for metals and steel procurement. AI-powered RFQ generation with Indian market focus — grades, standards, and commercial terms.",
  keywords: ["RFQ", "metals", "steel", "procurement", "quotation", "India", "AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
