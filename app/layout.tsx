import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "智批 AI｜智能作业批改系统",
  description: "多学科 OCR、分步判分、个性化评语与知识点薄弱分析一体化平台。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
