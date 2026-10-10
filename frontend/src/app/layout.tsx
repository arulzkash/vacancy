import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

const inter = localFont({
  src: "../../public/fonts/Inter-Variable.ttf",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dicoding Jobs",
  description: "Technical test Product Engineer Intern Dicoding",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
