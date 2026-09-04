import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SGDB Ürün Tasarım Merkezi",
  description: "SGDB tişört ve polar tercihlerinizi oluşturun ve kaydedin.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
