import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signalist — Stock Dashboard",
  description: "A stock-market dashboard starter with a responsive header and TradingView widgets.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
