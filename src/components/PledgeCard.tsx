"use client";

import { LikeButton } from "./LikeButton";
import type { Pledge, Category } from "@/types";

interface PledgeCardProps {
  pledge: Pledge & { category?: Category };
  liked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function PledgeCard({ pledge, liked, onToggle, disabled }: PledgeCardProps) {
  const color = pledge.category?.color || "#3B82F6";

  return (
    <div className="flex items-start justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {pledge.number}
        </span>
        <p className="text-sm font-medium text-slate-800 leading-relaxed pt-1">
          {pledge.title}
        </p>
      </div>
      <LikeButton
        liked={liked}
        count={pledge.like_count}
        onToggle={onToggle}
        disabled={disabled}
      />
    </div>
  );
}
