import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PUCO Behavior Grammar",
  description: "PUCO 로봇의 행동 언어 설계 도구. 상황을 입력하면 PUCO가 어떻게 감지하고, 해석하고, 움직이고, 투사하는지 생성합니다.",
  keywords: ["PUCO", "로봇", "행동 문법", "UX", "인터랙션 디자인"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-surface-900 font-sans text-zinc-800 antialiased">
        {children}
      </body>
    </html>
  );
}
