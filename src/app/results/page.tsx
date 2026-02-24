"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPledgesWithCategories, getCategories, getTotalStats } from "@/lib/queries";
import { categories as staticCategories } from "@/data/pledges";
import { Trophy, Heart, Users, BarChart3 } from "lucide-react";

export default function ResultsPage() {
  const [viewMode, setViewMode] = useState<"ranking" | "category">("ranking");

  const pledgesQuery = useQuery({
    queryKey: ["pledges"],
    queryFn: getPledgesWithCategories,
    staleTime: 0,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const statsQuery = useQuery({
    queryKey: ["totalStats"],
    queryFn: getTotalStats,
    staleTime: 0,
  });

  const pledges = pledgesQuery.data || [];
  const cats = categoriesQuery.data || staticCategories;
  const stats = statsQuery.data;

  const rankedPledges = useMemo(
    () => [...pledges].sort((a, b) => b.like_count - a.like_count),
    [pledges]
  );

  const maxLikes = rankedPledges[0]?.like_count || 1;

  const categoryStats = useMemo(() => {
    return cats.map((cat) => {
      const catPledges = pledges.filter((p) => p.category_id === cat.id);
      const totalLikes = catPledges.reduce((sum, p) => sum + p.like_count, 0);
      return { ...cat, totalLikes };
    }).sort((a, b) => b.totalLikes - a.totalLikes);
  }, [cats, pledges]);

  const totalCategoryLikes = categoryStats.reduce((s, c) => s + c.totalLikes, 0) || 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900 mb-1">투표 결과</h1>
      <p className="text-sm text-slate-500 mb-6">실시간 구민 관심 공약 순위</p>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Heart size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">
                {stats.totalVotes.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">총 투표수</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">
                {stats.voterCount.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">참여자 수</p>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode("ranking")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "ranking"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          <Trophy size={16} />
          인기순
        </button>
        <button
          onClick={() => setViewMode("category")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "category"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          <BarChart3 size={16} />
          카테고리별
        </button>
      </div>

      {viewMode === "ranking" ? (
        /* Ranking View */
        <div className="space-y-2">
          {rankedPledges.map((pledge, idx) => {
            const barWidth = maxLikes > 0 ? (pledge.like_count / maxLikes) * 100 : 0;
            const cat = cats.find((c) => c.id === pledge.category_id);
            const isTop3 = idx < 3;

            return (
              <div
                key={pledge.id}
                className={`relative bg-white rounded-xl border p-4 overflow-hidden ${
                  isTop3 ? "border-blue-200" : "border-slate-200"
                }`}
              >
                {/* Background bar */}
                <div
                  className="absolute inset-y-0 left-0 opacity-10 rounded-xl"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: cat?.color || "#3B82F6",
                  }}
                />
                <div className="relative flex items-center gap-3">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {pledge.number}. {pledge.title}
                    </p>
                    {cat && (
                      <p className="text-xs mt-0.5" style={{ color: cat.color }}>
                        {cat.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Heart size={14} className="text-red-500 fill-red-500" />
                    <span className="text-sm font-bold text-slate-900">
                      {pledge.like_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Category View */
        <div className="space-y-6">
          {/* Category bar chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              카테고리별 투표 현황
            </h3>
            <div className="space-y-3">
              {categoryStats.map((cat) => {
                const pct = ((cat.totalLikes / totalCategoryLikes) * 100).toFixed(1);
                const barWidth = (cat.totalLikes / (categoryStats[0]?.totalLikes || 1)) * 100;
                return (
                  <div key={cat.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">
                        {cat.name}
                      </span>
                      <span className="text-slate-500">
                        {cat.totalLikes.toLocaleString()}표 ({pct}%)
                      </span>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Per-category top pledges */}
          {categoryStats.map((cat) => {
            const catPledges = [...pledges]
              .filter((p) => p.category_id === cat.id)
              .sort((a, b) => b.like_count - a.like_count);

            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-1 h-5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <h3 className="text-base font-bold text-slate-800">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {cat.totalLikes.toLocaleString()}표
                  </span>
                </div>
                <div className="space-y-1.5">
                  {catPledges.map((pledge, idx) => (
                    <div
                      key={pledge.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200"
                    >
                      <span className="text-xs font-bold text-slate-400 w-5 text-right">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-700 flex-1 min-w-0 truncate">
                        {pledge.number}. {pledge.title}
                      </p>
                      <span className="text-sm font-semibold text-red-500 flex-shrink-0">
                        {pledge.like_count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
