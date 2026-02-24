"use client";

import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? "bg-blue-600 text-white"
            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
        }`}
      >
        전체
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            selected === cat.id
              ? "text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
          style={
            selected === cat.id
              ? { backgroundColor: cat.color }
              : undefined
          }
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
