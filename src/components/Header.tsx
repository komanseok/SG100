"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Vote, BarChart3, Home, MessageCircle } from "lucide-react";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/vote", label: "투표하기", icon: Vote },
  { href: "/results", label: "결과보기", icon: BarChart3 },
  { href: "/voices", label: "구민의 목소리", icon: MessageCircle },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SG</span>
          </div>
          <span className="font-bold text-lg text-slate-900">SG100</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
