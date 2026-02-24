"use client";

import Image from "next/image";
import Link from "next/link";
import { Vote, BarChart3, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CategoryCard } from "@/components/CategoryCard";
import { getCategories, getPledgesWithCategories, getTotalStats } from "@/lib/queries";
import { categories as staticCategories } from "@/data/pledges";

export default function HomePage() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const pledgesQuery = useQuery({
    queryKey: ["pledges"],
    queryFn: getPledgesWithCategories,
    staleTime: 0,
  });

  const statsQuery = useQuery({
    queryKey: ["totalStats"],
    queryFn: getTotalStats,
    staleTime: 0,
  });

  const cats = categoriesQuery.data || staticCategories;
  const pledges = pledgesQuery.data || [];
  const stats = statsQuery.data;

  const categoryLikes = cats.map((cat) => ({
    ...cat,
    totalLikes: pledges
      .filter((p) => p.category_id === cat.id)
      .reduce((sum, p) => sum + p.like_count, 0),
  }));

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative px-6 pt-10 pb-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/30 shadow-xl mb-4">
              <Image
                src="/images/candidate.jpg"
                alt="주정봉 후보"
                width={112}
                height={112}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <p className="text-blue-200 text-sm font-medium mb-1">
              더불어민주당 대전 서구청장 예비후보
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">주정봉</h1>
            <p className="text-blue-100 text-base sm:text-lg font-medium mb-1">
              서구를 바꾸는 7대 전략
            </p>
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              100가지 약속
            </h2>

            {stats && (
              <div className="flex gap-8 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {stats.totalVotes.toLocaleString()}
                  </p>
                  <p className="text-blue-200 text-xs">총 투표수</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {stats.voterCount.toLocaleString()}
                  </p>
                  <p className="text-blue-200 text-xs">참여자 수</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <Link
                href="/vote"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-95 flex-1"
              >
                <Vote size={20} />
                투표하러 가기
              </Link>
              <Link
                href="/results"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/15 text-white border border-white/30 rounded-xl font-medium text-base hover:bg-white/25 transition-all active:scale-95 flex-1"
              >
                <BarChart3 size={20} />
                결과 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">7대 전략</h3>
          <Link
            href="/vote"
            className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
          >
            전체 공약 보기
            <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categoryLikes.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              totalLikes={cat.totalLikes}
              onClick={() => {
                window.location.href = `/vote?category=${cat.id}`;
              }}
            />
          ))}
        </div>
      </section>

      {/* Top Pledges Preview */}
      {pledges.length > 0 && (
        <section className="px-4 pb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            인기 공약 TOP 5
          </h3>
          <div className="space-y-2">
            {[...pledges]
              .sort((a, b) => b.like_count - a.like_count)
              .slice(0, 5)
              .map((pledge, idx) => (
                <div
                  key={pledge.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200"
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      idx === 0
                        ? "bg-yellow-500"
                        : idx === 1
                          ? "bg-slate-400"
                          : idx === 2
                            ? "bg-amber-700"
                            : "bg-slate-300"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-800 flex-1 min-w-0 truncate">
                    {pledge.title}
                  </p>
                  <span className="text-sm font-semibold text-red-500 flex-shrink-0">
                    {pledge.like_count.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
          <Link
            href="/results"
            className="block mt-4 text-center text-sm text-blue-600 font-medium hover:underline"
          >
            전체 순위 보기 →
          </Link>
        </section>
      )}
    </div>
  );
}
