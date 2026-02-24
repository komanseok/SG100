"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getPledgesWithCategories, getMyVotes, toggleVote } from "@/lib/queries";
import { getFingerprint } from "@/lib/fingerprint";
import type { Pledge, Category } from "@/types";

export function useVoteData() {
  const [fingerprint, setFingerprint] = useState<string>("");
  const queryClient = useQueryClient();

  useEffect(() => {
    getFingerprint().then(setFingerprint);
  }, []);

  const pledgesQuery = useQuery({
    queryKey: ["pledges"],
    queryFn: getPledgesWithCategories,
  });

  const myVotesQuery = useQuery({
    queryKey: ["myVotes", fingerprint],
    queryFn: () => getMyVotes(fingerprint),
    enabled: !!fingerprint,
  });

  const voteMutation = useMutation({
    mutationFn: (pledgeId: number) => toggleVote(pledgeId, fingerprint),
    onMutate: async (pledgeId) => {
      await queryClient.cancelQueries({ queryKey: ["pledges"] });
      await queryClient.cancelQueries({ queryKey: ["myVotes", fingerprint] });

      const prevPledges = queryClient.getQueryData<(Pledge & { category: Category })[]>(["pledges"]);
      const prevVotes = queryClient.getQueryData<number[]>(["myVotes", fingerprint]);

      const isLiked = prevVotes?.includes(pledgeId);

      queryClient.setQueryData<(Pledge & { category: Category })[]>(
        ["pledges"],
        (old) =>
          old?.map((p) =>
            p.id === pledgeId
              ? { ...p, like_count: p.like_count + (isLiked ? -1 : 1) }
              : p
          )
      );

      queryClient.setQueryData<number[]>(["myVotes", fingerprint], (old) =>
        isLiked
          ? old?.filter((id) => id !== pledgeId)
          : [...(old || []), pledgeId]
      );

      return { prevPledges, prevVotes };
    },
    onError: (_err, _pledgeId, context) => {
      if (context?.prevPledges) {
        queryClient.setQueryData(["pledges"], context.prevPledges);
      }
      if (context?.prevVotes) {
        queryClient.setQueryData(["myVotes", fingerprint], context.prevVotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pledges"] });
      queryClient.invalidateQueries({ queryKey: ["myVotes", fingerprint] });
    },
  });

  return {
    pledges: pledgesQuery.data || [],
    myVotes: new Set(myVotesQuery.data || []),
    isLoading: pledgesQuery.isLoading,
    vote: voteMutation.mutate,
    isVoting: voteMutation.isPending,
  };
}
