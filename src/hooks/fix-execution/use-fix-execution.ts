// src/hooks/use-fixable-rules.ts
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { FixableRulesResponse } from "@/types/fix";
import { toast } from "sonner";

interface UseFixableRulesResult {
  fixableRules: FixableRulesResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchFixableRules: (serverId: number) => Promise<void>;
  refetch: () => void;
}

export const useFixableRules = (serverId?: number): UseFixableRulesResult => {
  const [fixableRules, setFixableRules] = useState<FixableRulesResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFixableRules = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await api.get<FixableRulesResponse>(
        `/api/fixes/server/${id}/fixable-rules`
      );
      setFixableRules(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch fixable rules";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (serverId) {
      fetchFixableRules(serverId);
    }
  }, [serverId, fetchFixableRules]);

  useEffect(() => {
    if (serverId) {
      fetchFixableRules(serverId);
    }
  }, [serverId, fetchFixableRules]);

  return {
    fixableRules,
    isLoading,
    error,
    fetchFixableRules,
    refetch,
  };
};
