import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Abstract Doc",
  description: "A Next.js TypeScript application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
