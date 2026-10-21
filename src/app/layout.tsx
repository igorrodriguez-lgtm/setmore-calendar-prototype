import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Setmore Calendar Prototype",
  description: "Testing a rebuild of the Setmore calendar with EDS",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased text-neutral-900`}>{children}</body>
    </html>
  );
}
