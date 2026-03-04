"use client";

import { useState } from "react";
import { MessageCircle, Clock, TrendingUp } from "lucide-react";
import { useVoices } from "@/hooks/useVoices";
import { OpinionForm } from "@/components/OpinionForm";
import { OpinionCard } from "@/components/OpinionCard";

type SortType = "latest" | "popular";

export default function VoicesPage() {
  const [sort, setSort] = useState<SortType>("latest");
  const {
    opinions,
    myLikes,
    myReports,
    isLoading,
    create,
    isCreating,
    toggleLike,
    isLiking,
    report,
    isReporting,
  } = useVoices(sort);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
          <MessageCircle size={20} className="text-blue-600" />
          <h1 className="text-lg font-bold text-blue-900">구민의 목소리</h1>
        </div>
        <p className="text-sm text-slate-500">
          서구에 대한 자유로운 의견을 남겨주세요
        </p>
      </div>

      {/* 작성 폼 */}
      <OpinionForm onSubmit={create} isSubmitting={isCreating} />

      {/* 정렬 + 개수 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          총 <strong className="text-slate-700">{opinions.length}</strong>개의
          의견
        </span>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setSort("latest")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sort === "latest"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Clock size={12} />
            최신순
          </button>
          <button
            onClick={() => setSort("popular")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sort === "popular"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <TrendingUp size={12} />
            공감순
          </button>
        </div>
      </div>

      {/* 의견 목록 */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : opinions.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">아직 등록된 의견이 없습니다.</p>
          <p className="text-xs mt-1">첫 번째 의견을 남겨보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {opinions.map((opinion) => (
            <OpinionCard
              key={opinion.id}
              opinion={opinion}
              liked={myLikes.has(opinion.id)}
              reported={myReports.has(opinion.id)}
              onToggleLike={() => toggleLike(opinion.id)}
              onReport={() => report(opinion.id)}
              disabled={isLiking || isReporting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
