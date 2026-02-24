"use client";

import { Heart } from "lucide-react";

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
}

export function LikeButton({ liked, count, onToggle, disabled }: LikeButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-90 ${
        liked
          ? "bg-red-50 text-red-600 border border-red-200"
          : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <Heart
        size={16}
        className={`transition-all ${liked ? "fill-red-500 text-red-500 scale-110" : ""}`}
      />
      <span>{count.toLocaleString()}</span>
    </button>
  );
}
