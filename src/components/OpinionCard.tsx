"use client";

import { Heart } from "lucide-react";
import type { Opinion } from "@/types";

interface OpinionCardProps {
  opinion: Opinion;
  liked: boolean;
  onToggleLike: () => void;
  disabled?: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

export function OpinionCard({
  opinion,
  liked,
  onToggleLike,
  disabled,
}: OpinionCardProps) {
  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
        {opinion.content}
      </p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-400">
          {timeAgo(opinion.created_at)}
        </span>
        <button
          onClick={onToggleLike}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-90 ${
            liked
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <Heart
            size={14}
            className={`transition-all ${
              liked ? "fill-red-500 text-red-500 scale-110" : ""
            }`}
          />
          <span>{opinion.like_count}</span>
        </button>
      </div>
    </div>
  );
}
