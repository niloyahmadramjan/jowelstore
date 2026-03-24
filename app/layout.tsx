import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/global/Provider";
import Navbar from "./components/home/Navbar";
import Footer from "./components/home/Footer";
import { ThemeProvider } from "./context/theme-context";

export const metadata: Metadata = {
  title: {
    default: "JowelStore — Premium Grocery & Jewellery",
    template: "%s — JowelStore",
  },
  description:
    "Farm-fresh groceries and certified jewellery delivered to your door.",
  keywords: ["grocery", "jewellery", "fresh", "delivery", "Bangladesh"],
  authors: [{ name: "JowelStore" }],

  icons: {
    icon: "/brand/favicon.svg",
    shortcut: "/brand/favicon.svg",
    apple: "/brand/icon-mark.svg",
  },

  openGraph: {
    title: "JowelStore — Premium Grocery & Jewellery",
    description:
      "Farm-fresh groceries and certified jewellery, delivered with care.",
    url: "https://jowelstore.vercel.app",
    siteName: "JowelStore",
    images: [
      {
        url: "/brand/og-image.svg",
        width: 1200,
        height: 630,
        alt: "JowelStore — Fresh picks, finest gems",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "JowelStore — Premium Grocery & Jewellery",
    description:
      "Farm-fresh groceries and certified jewellery, delivered with care.",
    images: ["/brand/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="w-full min-h-screen">
      <body className="min-h-full ">
        <ThemeProvider>
          <Provider>
            <Navbar />
            {children}
            <Footer />
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
