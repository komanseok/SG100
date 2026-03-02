"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface OpinionFormProps {
  onSubmit: (content: string) => Promise<unknown>;
  isSubmitting: boolean;
}

const MAX_LENGTH = 300;

export function OpinionForm({ onSubmit, isSubmitting }: OpinionFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const trimmed = content.trim();
  const charCount = trimmed.length;
  const isValid = charCount >= 2 && charCount <= MAX_LENGTH;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    try {
      setError("");
      await onSubmit(trimmed);
      setContent("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "의견 등록에 실패했습니다."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="서구에 대한 의견을 자유롭게 남겨주세요 (2~300자)"
          maxLength={MAX_LENGTH}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <span
          className={`absolute bottom-3 right-3 text-xs ${
            charCount > MAX_LENGTH * 0.9
              ? "text-red-500"
              : "text-slate-400"
          }`}
        >
          {charCount}/{MAX_LENGTH}
        </span>
      </div>
      {error && (
        <p className="text-sm text-red-500 px-1">{error}</p>
      )}
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={16} />
        {isSubmitting ? "등록 중..." : "의견 남기기"}
      </button>
    </form>
  );
}
