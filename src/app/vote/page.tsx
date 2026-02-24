"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";
import { PledgeCard } from "@/components/PledgeCard";
import { useVoteData } from "@/hooks/useVote";
import { getCategories } from "@/lib/queries";
import { categories as staticCategories } from "@/data/pledges";
import { Loader2 } from "lucide-react";

function VoteContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    initialCategory ? parseInt(initialCategory) : null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { pledges, myVotes, isLoading, vote, isVoting } = useVoteData();
  const cats = categoriesQuery.data || staticCategories;

  const filteredPledges = useMemo(() => {
    let result = pledges;
    if (selectedCategory !== null) {
      result = result.filter((p) => p.category_id === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.number.toString().includes(q)
      );
    }
    return result;
  }, [pledges, selectedCategory, searchQuery]);

  const groupedPledges = useMemo(() => {
    if (selectedCategory !== null || searchQuery.trim()) {
      return [{ category: null, pledges: filteredPledges }];
    }
    return cats.map((cat) => ({
      category: cat,
      pledges: filteredPledges.filter((p) => p.category_id === cat.id),
    }));
  }, [filteredPledges, cats, selectedCategory, searchQuery]);

  const myVoteCount = myVotes.size;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900 mb-1">공약 투표</h1>
        <p className="text-sm text-slate-500">
          관심 있는 공약에 하트를 눌러주세요
        </p>
      </div>

      {/* Filters */}
      <div className="sticky top-14 z-40 bg-slate-50 pb-3 pt-1 -mx-4 px-4 space-y-3">
        <CategoryFilter
          categories={cats}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Pledge List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : filteredPledges.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg mb-2">검색 결과가 없습니다</p>
          <p className="text-sm">다른 키워드로 검색해보세요</p>
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {groupedPledges.map((group, gi) => (
            <div key={gi}>
              {group.category && (
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-1 h-5 rounded-full"
                    style={{ backgroundColor: group.category.color }}
                  />
                  <h2 className="text-base font-bold text-slate-800">
                    {group.category.order_num}. {group.category.name}
                  </h2>
                  <span className="text-xs text-slate-400">
                    ({group.category.pledge_count}개)
                  </span>
                </div>
              )}
              <div className="space-y-2">
                {group.pledges.map((pledge) => (
                  <PledgeCard
                    key={pledge.id}
                    pledge={pledge}
                    liked={myVotes.has(pledge.id)}
                    onToggle={() => vote(pledge.id)}
                    disabled={isVoting}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Bar */}
      {myVoteCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-3 text-sm font-medium">
            <span>
              내가 선택한 공약:{" "}
              <strong className="text-blue-400">{myVoteCount}개</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VotePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      }
    >
      <VoteContent />
    </Suspense>
  );
}
