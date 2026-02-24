import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SG100 - 서구를 바꾸는 100가지 약속",
  description:
    "대전 서구 구민이 직접 선택하는 관심 공약 투표. 주정봉 후보의 7대 전략 100가지 공약에 투표하세요.",
  openGraph: {
    title: "SG100 - 서구를 바꾸는 100가지 약속",
    description: "대전 서구 구민이 직접 선택하는 관심 공약 투표",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} font-sans antialiased bg-slate-50 text-slate-900`}
      >
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
            <p>SG100 프로젝트 | 서구를 바꾸는 100가지 약속</p>
            <p className="mt-1">더불어민주당 대전 서구청장 예비후보 주정봉</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
