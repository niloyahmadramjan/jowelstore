

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default:  "JowelStore — Premium Grocery & Jewellery",
    template: "%s — JowelStore",
  },
  description:
    "Farm-fresh groceries and certified jewellery delivered to your door.",
  keywords: ["grocery", "jewellery", "fresh", "delivery", "Bangladesh"],
  authors:  [{ name: "JowelStore" }],

  icons: {
    icon:        "/brand/favicon.svg",
    shortcut:    "/brand/favicon.svg",
    apple:       "/brand/icon-mark.svg",
  },

  openGraph: {
    title:       "JowelStore — Premium Grocery & Jewellery",
    description: "Farm-fresh groceries and certified jewellery, delivered with care.",
    url:         "https://jowelstore.vercel.app",
    siteName:    "JowelStore",
    images: [
      {
        url:    "/brand/favicon.svg",
        width:  1200,
        height: 630,
        alt:    "JowelStore — Fresh picks, finest gems",
      },
    ],
    locale: "en_US",
    type:   "website",
  },

  twitter: {
    card:        "summary_large_image",
    title:       "JowelStore — Premium Grocery & Jewellery",
    description: "Farm-fresh groceries and certified jewellery, delivered with care.",
    images:      ["/brand/favicon.svg"],
  },
};
