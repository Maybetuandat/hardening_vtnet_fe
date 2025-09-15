import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  RuleResponse,
  RuleCreate,
  RuleListResponse,
  RuleSearchParams,
} from "@/types/rule";

interface UseRulesReturn {
  rules: RuleResponse[];
  loading: boolean;
  error: string | null;
  totalRules: number;
  totalPages: number;
  currentPage: number;
  createBulkRules?: (data: RuleCreate[]) => Promise<RuleResponse[]>;
  fetchRules: (params: RuleSearchParams) => Promise<void>;
  createRule: (data: RuleCreate) => Promise<RuleResponse>;
  updateRule: (ruleId: number, data: RuleCreate) => Promise<RuleResponse>;
  deleteRule: (ruleId: number) => Promise<void>;
  getRuleById: (ruleId: number) => Promise<RuleResponse>;
}

export function useRules(): UseRulesReturn {
  const [rules, setRules] = useState<RuleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRules, setTotalRules] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRules = useCallback(async (params: RuleSearchParams) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params.keyword?.trim()) {
        searchParams.append("keyword", params.keyword.trim());
      }
      if (params.workload_id) {
        searchParams.append("workload_id", params.workload_id.toString());
      }
      searchParams.append("page", params.page.toString());
      searchParams.append("page_size", params.page_size.toString());

      const response = await api.get<RuleListResponse>(
        `/rules/?${searchParams.toString()}`
      );

      setRules(response.rules);
      setTotalRules(response.total_rules);
      setTotalPages(response.total_pages);
      setCurrentPage(response.page);
    } catch (err: any) {
      console.error("Error fetching rules:", err);
      setError(err.message || "Failed to fetch rules");
      setRules([]);
      setTotalRules(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRule = useCallback(
    async (data: RuleCreate): Promise<RuleResponse> => {
      try {
        console.log("Creating rule with data:", data);
        const response = await api.post<RuleResponse>("/rules/", data);
        toast.success("Create rule successfully");
        return response;
      } catch (err: any) {
        console.error("Error creating rule:", err);
        const errorMessage = err.message || "Failed to create rule";
        toast.error(`Failed to create rule: ${errorMessage}`);
        throw err;
      }
    },
    []
  );

  const createBulkRules = useCallback(
    async (data: RuleCreate[]): Promise<RuleResponse[]> => {
      try {
        console.log("Creating bulk rules with data:", data);
        const response = await api.post<RuleResponse[]>("/rules/bulk", data);
        toast.success("Create bulk rules successfully");
        return response;
      } catch (err: any) {
        console.error("API error details:", err.response?.data || err);
        toast.error(JSON.stringify(err.response?.data || err));
        throw err;
      }
    },
    []
  );
  const updateRule = useCallback(
    async (ruleId: number, data: RuleCreate): Promise<RuleResponse> => {
      try {
        const response = await api.put<RuleResponse>(`/rules/${ruleId}`, data);
        toast.success("update rule successfully");
        return response;
      } catch (err: any) {
        console.error("Error updating rule:", err);
        const errorMessage = err.message || "Failed to update rule";
        toast.error(`Failed to update rule: ${errorMessage}`);
        throw err;
      }
    },
    []
  );

  const deleteRule = useCallback(async (ruleId: number): Promise<void> => {
    try {
      await api.delete(`/rules/${ruleId}`);
      toast.success("delete rule successfully");
    } catch (err: any) {
      console.error("Error deleting rule:", err);
      const errorMessage = err.message || "Failed to delete rule";
      toast.error(`Failed to delete rule: ${errorMessage}`);
      throw err;
    }
  }, []);

  const getRuleById = useCallback(
    async (ruleId: number): Promise<RuleResponse> => {
      try {
        const response = await api.get<RuleResponse>(`/rules/${ruleId}`);
        return response;
      } catch (err: any) {
        console.error("Error fetching rule by id:", err);
        throw err;
      }
    },
    []
  );

  return {
    rules,
    loading,
    error,
    totalRules,
    totalPages,
    currentPage,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    createBulkRules,
    getRuleById,
  };
}
