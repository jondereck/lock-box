import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import db from "@/lib/db";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lock Box",
  description: "A simple authentication service.",
};

export default  function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
