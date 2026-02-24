import {
  Building2,
  TrendingUp,
  Scale,
  Shield,
  GraduationCap,
  Sparkles,
  Palette,
} from "lucide-react";
import type { Category } from "@/types";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Building2,
  TrendingUp,
  Scale,
  Shield,
  GraduationCap,
  Sparkles,
  Palette,
};

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
  totalLikes?: number;
}

export function CategoryCard({
  category,
  onClick,
  totalLikes,
}: CategoryCardProps) {
  const Icon = iconMap[category.icon] || Sparkles;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all active:scale-95 w-full"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${category.color}15` }}
      >
        <Icon size={24} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-800 leading-tight">
          {category.name}
        </p>
        <p className="text-xs text-slate-500 mt-1">{category.pledge_count}개 공약</p>
        {totalLikes !== undefined && (
          <p className="text-xs font-medium mt-1" style={{ color: category.color }}>
            {totalLikes.toLocaleString()}표
          </p>
        )}
      </div>
    </button>
  );
}
