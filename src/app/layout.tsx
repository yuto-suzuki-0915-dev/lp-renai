import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "moteru | 思考から変われる環境",
  description: "1対1のフィードバックと実践を通して、恋愛の思考と行動を変えるサポート。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
