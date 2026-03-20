import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/global/Provider";

export const metadata: Metadata = {
  title: "Jowel Store",
  description: "To fast delivery app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full min-h-screen">
      <body className="min-h-full ">
          <Provider>{children}</Provider>
      </body>
    </html>
  );
}
