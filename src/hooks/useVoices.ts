"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOpinions,
  createOpinion,
  toggleOpinionLike,
  getMyOpinionLikes,
  reportOpinion,
  getMyReports,
} from "@/lib/queries";
import { getFingerprint } from "@/lib/fingerprint";
import type { Opinion } from "@/types";

export function useVoices(sort: "latest" | "popular" = "latest") {
  const [fingerprint, setFingerprint] = useState<string>("");
  const queryClient = useQueryClient();

  useEffect(() => {
    getFingerprint().then(setFingerprint);
  }, []);

  const opinionsQuery = useQuery({
    queryKey: ["opinions", sort],
    queryFn: () => getOpinions(sort),
  });

  const myLikesQuery = useQuery({
    queryKey: ["myOpinionLikes", fingerprint],
    queryFn: () => getMyOpinionLikes(fingerprint),
    enabled: !!fingerprint,
  });

  const myReportsQuery = useQuery({
    queryKey: ["myOpinionReports", fingerprint],
    queryFn: () => getMyReports(fingerprint),
    enabled: !!fingerprint,
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => createOpinion(content, fingerprint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opinions"] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: (opinionId: string) =>
      toggleOpinionLike(opinionId, fingerprint),
    onMutate: async (opinionId) => {
      await queryClient.cancelQueries({ queryKey: ["opinions", sort] });
      await queryClient.cancelQueries({
        queryKey: ["myOpinionLikes", fingerprint],
      });

      const prevOpinions = queryClient.getQueryData<Opinion[]>([
        "opinions",
        sort,
      ]);
      const prevLikes = queryClient.getQueryData<string[]>([
        "myOpinionLikes",
        fingerprint,
      ]);

      const isLiked = prevLikes?.includes(opinionId);

      queryClient.setQueryData<Opinion[]>(["opinions", sort], (old) =>
        old?.map((o) =>
          o.id === opinionId
            ? { ...o, like_count: o.like_count + (isLiked ? -1 : 1) }
            : o
        )
      );

      queryClient.setQueryData<string[]>(
        ["myOpinionLikes", fingerprint],
        (old) =>
          isLiked
            ? old?.filter((id) => id !== opinionId)
            : [...(old || []), opinionId]
      );

      return { prevOpinions, prevLikes };
    },
    onError: (_err, _opinionId, context) => {
      if (context?.prevOpinions) {
        queryClient.setQueryData(["opinions", sort], context.prevOpinions);
      }
      if (context?.prevLikes) {
        queryClient.setQueryData(
          ["myOpinionLikes", fingerprint],
          context.prevLikes
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["opinions"] });
      queryClient.invalidateQueries({
        queryKey: ["myOpinionLikes", fingerprint],
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: (opinionId: string) => reportOpinion(opinionId, fingerprint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opinions"] });
      queryClient.invalidateQueries({ queryKey: ["myOpinionReports", fingerprint] });
    },
  });

  return {
    opinions: opinionsQuery.data || [],
    myLikes: new Set(myLikesQuery.data || []),
    myReports: new Set(myReportsQuery.data || []),
    isLoading: opinionsQuery.isLoading,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    toggleLike: likeMutation.mutate,
    isLiking: likeMutation.isPending,
    report: reportMutation.mutateAsync,
    isReporting: reportMutation.isPending,
    fingerprint,
  };
}
