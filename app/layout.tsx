import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YOWU STUDIO｜有无手作",
  description: "把走过的风景，戴在身上。独立首饰、摄影与可佩戴的记忆。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
