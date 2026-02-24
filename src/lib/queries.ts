import { supabase } from "./supabase";
import type { Category, Pledge, ToggleVoteResult } from "@/types";
import {
  categories as staticCategories,
  pledges as staticPledges,
} from "@/data/pledges";

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getLocalLikeCounts(): Record<number, number> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem("sg100_like_counts");
  return stored ? JSON.parse(stored) : {};
}

function saveLocalLikeCounts(counts: Record<number, number>) {
  localStorage.setItem("sg100_like_counts", JSON.stringify(counts));
}

function getStaticPledgesWithCategories(): (Pledge & { category: Category })[] {
  const likeCounts = getLocalLikeCounts();
  return staticPledges.map((p, idx) => {
    const pledgeId = idx + 1;
    const cat = staticCategories.find((c) => c.id === p.category_id)!;
    return {
      id: pledgeId,
      number: p.number,
      category_id: p.category_id,
      title: p.title,
      like_count: likeCounts[pledgeId] || 0,
      category: { ...cat, order_num: cat.order_num, pledge_count: cat.pledge_count },
    } as Pledge & { category: Category };
  });
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return staticCategories as Category[];
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("order_num");
  if (error) throw error;
  return data;
}

export async function getPledgesWithCategories(): Promise<
  (Pledge & { category: Category })[]
> {
  if (!isSupabaseConfigured) return getStaticPledgesWithCategories();
  const { data, error } = await supabase
    .from("pledges")
    .select("*, category:categories(*)")
    .order("number");
  if (error) throw error;
  return data;
}

export async function getMyVotes(fingerprint: string): Promise<number[]> {
  if (!isSupabaseConfigured) {
    const stored = localStorage.getItem("sg100_votes");
    return stored ? JSON.parse(stored) : [];
  }
  const { data, error } = await supabase
    .from("votes")
    .select("pledge_id")
    .eq("fingerprint", fingerprint);
  if (error) throw error;
  return data.map((v) => v.pledge_id);
}

export async function toggleVote(
  pledgeId: number,
  fingerprint: string
): Promise<ToggleVoteResult> {
  if (!isSupabaseConfigured) {
    // 로컬 모드: localStorage로 투표 관리
    const stored = localStorage.getItem("sg100_votes");
    const votes: number[] = stored ? JSON.parse(stored) : [];
    const exists = votes.includes(pledgeId);
    const newVotes = exists
      ? votes.filter((id) => id !== pledgeId)
      : [...votes, pledgeId];
    localStorage.setItem("sg100_votes", JSON.stringify(newVotes));

    // like_count도 localStorage에 반영
    const likeCounts = getLocalLikeCounts();
    const currentCount = likeCounts[pledgeId] || 0;
    likeCounts[pledgeId] = exists ? Math.max(0, currentCount - 1) : currentCount + 1;
    saveLocalLikeCounts(likeCounts);

    return { liked: !exists, like_count: likeCounts[pledgeId] };
  }
  const { data, error } = await supabase.rpc("toggle_vote", {
    p_pledge_id: pledgeId,
    p_fingerprint: fingerprint,
  });
  if (error) throw error;
  return data;
}

export async function getTotalStats() {
  if (!isSupabaseConfigured) {
    const likeCounts = getLocalLikeCounts();
    const totalVotes = Object.values(likeCounts).reduce((sum, c) => sum + c, 0);
    const stored = localStorage.getItem("sg100_votes");
    const votes: number[] = stored ? JSON.parse(stored) : [];
    return { totalVotes, voterCount: votes.length > 0 ? 1 : 0 };
  }
  const { data: pledges } = await supabase
    .from("pledges")
    .select("like_count");
  const { data: voters } = await supabase
    .from("votes")
    .select("fingerprint");
  const uniqueVoters = new Set(voters?.map((v) => v.fingerprint)).size;

  const totalVotes = pledges?.reduce((sum, p) => sum + p.like_count, 0) ?? 0;
  return { totalVotes, voterCount: uniqueVoters };
}
