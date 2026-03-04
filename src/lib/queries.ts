import { supabase } from "./supabase";
import type { Category, Pledge, ToggleVoteResult, Opinion } from "@/types";
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

// ============================================
// 구민의 목소리 (Opinions) 관련
// ============================================

function getLocalOpinions(): Opinion[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("sg100_opinions");
  return stored ? JSON.parse(stored) : [];
}

function getLocalReports(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("sg100_opinion_reports");
  return stored ? JSON.parse(stored) : [];
}

function saveLocalReports(reports: string[]) {
  localStorage.setItem("sg100_opinion_reports", JSON.stringify(reports));
}

function saveLocalOpinions(opinions: Opinion[]) {
  localStorage.setItem("sg100_opinions", JSON.stringify(opinions));
}

function getLocalOpinionLikes(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("sg100_opinion_likes");
  return stored ? JSON.parse(stored) : [];
}

function saveLocalOpinionLikes(likes: string[]) {
  localStorage.setItem("sg100_opinion_likes", JSON.stringify(likes));
}

export async function getOpinions(
  sort: "latest" | "popular" = "latest"
): Promise<Opinion[]> {
  if (!isSupabaseConfigured) {
    const opinions = getLocalOpinions();
    return sort === "popular"
      ? [...opinions].sort((a, b) => b.like_count - a.like_count)
      : [...opinions].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
  }
  const orderCol = sort === "popular" ? "like_count" : "created_at";
  const { data, error } = await supabase
    .from("opinions")
    .select("*")
    .order(orderCol, { ascending: false });
  if (error) throw error;
  return data;
}

export async function createOpinion(
  content: string,
  fingerprint: string
): Promise<Opinion> {
  if (!isSupabaseConfigured) {
    const opinions = getLocalOpinions();
    const today = new Date().toDateString();
    const todayCount = opinions.filter(
      (o) =>
        o.fingerprint === fingerprint &&
        new Date(o.created_at).toDateString() === today
    ).length;
    if (todayCount >= 3) throw new Error("오늘 작성 가능한 의견 수(3개)를 초과했습니다.");

    const newOpinion: Opinion = {
      id: crypto.randomUUID(),
      content,
      fingerprint,
      like_count: 0,
      report_count: 0,
      is_hidden: false,
      created_at: new Date().toISOString(),
    };
    saveLocalOpinions([newOpinion, ...opinions]);
    return newOpinion;
  }

  // Supabase: 하루 3개 제한 체크
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("opinions")
    .select("*", { count: "exact", head: true })
    .eq("fingerprint", fingerprint)
    .gte("created_at", todayStart.toISOString());
  if ((count ?? 0) >= 3) throw new Error("오늘 작성 가능한 의견 수(3개)를 초과했습니다.");

  const { data, error } = await supabase
    .from("opinions")
    .insert({ content, fingerprint })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleOpinionLike(
  opinionId: string,
  fingerprint: string
): Promise<{ liked: boolean; like_count: number }> {
  if (!isSupabaseConfigured) {
    const likes = getLocalOpinionLikes();
    const key = `${opinionId}:${fingerprint}`;
    const exists = likes.includes(key);

    if (exists) {
      saveLocalOpinionLikes(likes.filter((l) => l !== key));
    } else {
      saveLocalOpinionLikes([...likes, key]);
    }

    const opinions = getLocalOpinions();
    const updated = opinions.map((o) =>
      o.id === opinionId
        ? { ...o, like_count: o.like_count + (exists ? -1 : 1) }
        : o
    );
    saveLocalOpinions(updated);

    const opinion = updated.find((o) => o.id === opinionId);
    return { liked: !exists, like_count: opinion?.like_count ?? 0 };
  }

  const { data, error } = await supabase.rpc("toggle_opinion_like", {
    p_opinion_id: opinionId,
    p_fingerprint: fingerprint,
  });
  if (error) throw error;
  return data;
}

export async function getMyOpinionLikes(fingerprint: string): Promise<string[]> {
  if (!isSupabaseConfigured) {
    const likes = getLocalOpinionLikes();
    return likes
      .filter((l) => l.endsWith(`:${fingerprint}`))
      .map((l) => l.split(":")[0]);
  }
  const { data, error } = await supabase
    .from("opinion_likes")
    .select("opinion_id")
    .eq("fingerprint", fingerprint);
  if (error) throw error;
  return data.map((l) => l.opinion_id);
}

// ============================================
// 의견 신고 관련
// ============================================

export async function reportOpinion(
  opinionId: string,
  fingerprint: string
): Promise<{ already_reported: boolean; report_count: number }> {
  if (!isSupabaseConfigured) {
    const reports = getLocalReports();
    const key = `${opinionId}:${fingerprint}`;
    if (reports.includes(key)) {
      const opinions = getLocalOpinions();
      const opinion = opinions.find((o) => o.id === opinionId);
      return { already_reported: true, report_count: opinion?.report_count ?? 0 };
    }

    saveLocalReports([...reports, key]);

    const opinions = getLocalOpinions();
    const updated = opinions.map((o) => {
      if (o.id !== opinionId) return o;
      const newCount = o.report_count + 1;
      return { ...o, report_count: newCount, is_hidden: newCount >= 3 };
    });
    saveLocalOpinions(updated);

    const opinion = updated.find((o) => o.id === opinionId);
    return { already_reported: false, report_count: opinion?.report_count ?? 0 };
  }

  const { data, error } = await supabase.rpc("report_opinion", {
    p_opinion_id: opinionId,
    p_fingerprint: fingerprint,
  });
  if (error) {
    // RPC 함수가 없으면 직접 테이블에 insert + report_count 증가
    const { error: insertError } = await supabase
      .from("opinion_reports")
      .insert({ opinion_id: opinionId, fingerprint });
    if (insertError) {
      if (insertError.code === "23505") {
        return { already_reported: true, report_count: 0 };
      }
      throw insertError;
    }

    // report_count 증가 + 3회 이상이면 is_hidden 처리
    const { data: opinion } = await supabase
      .from("opinions")
      .select("report_count")
      .eq("id", opinionId)
      .single();
    const newCount = (opinion?.report_count ?? 0) + 1;
    const updateFields: { report_count: number; is_hidden?: boolean } = { report_count: newCount };
    if (newCount >= 3) updateFields.is_hidden = true;
    await supabase.from("opinions").update(updateFields).eq("id", opinionId);

    return { already_reported: false, report_count: newCount };
  }
  return data;
}

export async function getMyReports(fingerprint: string): Promise<string[]> {
  if (!isSupabaseConfigured) {
    const reports = getLocalReports();
    return reports
      .filter((r) => r.endsWith(`:${fingerprint}`))
      .map((r) => r.split(":")[0]);
  }
  const { data, error } = await supabase
    .from("opinion_reports")
    .select("opinion_id")
    .eq("fingerprint", fingerprint);
  if (error) {
    // opinion_reports 테이블이 아직 DB에 없으면 로컬 fallback
    const reports = getLocalReports();
    return reports
      .filter((r) => r.endsWith(`:${fingerprint}`))
      .map((r) => r.split(":")[0]);
  }
  return data.map((r) => r.opinion_id);
}
