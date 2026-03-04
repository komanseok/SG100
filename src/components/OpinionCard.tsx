"use client";

import { useState } from "react";
import { Heart, Flag, EyeOff, Eye } from "lucide-react";
import type { Opinion } from "@/types";

interface OpinionCardProps {
  opinion: Opinion;
  liked: boolean;
  reported: boolean;
  onToggleLike: () => void;
  onReport: () => void;
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
  reported,
  onToggleLike,
  onReport,
  disabled,
}: OpinionCardProps) {
  const isBlinded = opinion.is_hidden;
  const [showContent, setShowContent] = useState(false);

  function handleReport() {
    if (reported) return;
    if (!window.confirm("이 의견을 신고하시겠습니까?")) return;
    onReport();
  }

  return (
    <div className={`p-4 rounded-xl border transition-colors ${
      isBlinded
        ? "bg-slate-50 border-slate-200"
        : "bg-white border-slate-200 hover:border-slate-300"
    }`}>
      {isBlinded && !showContent ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400 italic flex items-center gap-1.5">
            <EyeOff size={14} />
            신고가 누적되어 숨겨진 글입니다.
          </p>
          <button
            onClick={() => setShowContent(true)}
            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
          >
            원문 보기
          </button>
        </div>
      ) : (
        <>
          {isBlinded && showContent && (
            <button
              onClick={() => setShowContent(false)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mb-2 transition-colors"
            >
              <Eye size={12} />
              다시 숨기기
            </button>
          )}
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
            {opinion.content}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400">
              {timeAgo(opinion.created_at)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReport}
                disabled={disabled || reported}
                title={reported ? "신고됨" : "신고하기"}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-90 ${
                  reported
                    ? "bg-orange-50 text-orange-500 border border-orange-200 opacity-60 cursor-not-allowed"
                    : "bg-slate-50 text-slate-400 border border-slate-200 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 cursor-pointer"
                }`}
              >
                <Flag size={12} className={reported ? "fill-orange-400" : ""} />
                <span>{reported ? "신고됨" : "신고"}</span>
              </button>
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
        </>
      )}
    </div>
  );
}
