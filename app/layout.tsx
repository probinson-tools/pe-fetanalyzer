import type { Metadata } from "next";
import "./globals.css";
import StripUrlCredentials from "@/components/StripUrlCredentials";

export const metadata: Metadata = {
  title: "pe-fetanalyzer",
  description: "CSS Selector Generator — analyze element snapshots and generate optimal CSS selectors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col">
        <StripUrlCredentials />
        {children}
      </body>
    </html>
  );
}
