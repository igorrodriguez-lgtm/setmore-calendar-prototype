import type { Metadata } from "next";
import "./globals.css";
import "./shadcn.css";
import { EdsProvider } from "./eds-provider";

export const metadata: Metadata = {
  title: "Igor's Calendar",
  description: "Prototype rebuild of the Setmore calendar with EDS and shadcn",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="bg-canvas text-primary antialiased">
        <EdsProvider>{children}</EdsProvider>
      </body>
    </html>
  );
}
