import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface RuleResponse {
  id: number;
  name: string;
  description?: string;
  severity: string;
  workload_id: number;
  parameters?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RuleCreate {
  name: string;
  description?: string;
  severity: string;
  workload_id: number;
  parameters?: Record<string, any>;
  is_active: boolean;
}

export interface RuleListResponse {
  rules: RuleResponse[];
  total_rules: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RuleSearchParams {
  keyword?: string;
  workload_id?: number;
  page: number;
  page_size: number;
}

interface UseRulesReturn {
  rules: RuleResponse[];
  loading: boolean;
  error: string | null;
  totalRules: number;
  totalPages: number;
  currentPage: number;
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
        `/rules?${searchParams.toString()}`
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
        const response = await api.post<RuleResponse>("/rules", data);
        toast.success("Tạo rule thành công");
        return response;
      } catch (err: any) {
        console.error("Error creating rule:", err);
        const errorMessage = err.message || "Failed to create rule";
        toast.error(`Có lỗi xảy ra khi tạo rule: ${errorMessage}`);
        throw err;
      }
    },
    []
  );

  const updateRule = useCallback(
    async (ruleId: number, data: RuleCreate): Promise<RuleResponse> => {
      try {
        const response = await api.put<RuleResponse>(`/rules/${ruleId}`, data);
        toast.success("Cập nhật rule thành công");
        return response;
      } catch (err: any) {
        console.error("Error updating rule:", err);
        const errorMessage = err.message || "Failed to update rule";
        toast.error(`Có lỗi xảy ra khi cập nhật rule: ${errorMessage}`);
        throw err;
      }
    },
    []
  );

  const deleteRule = useCallback(async (ruleId: number): Promise<void> => {
    try {
      await api.delete(`/rules/${ruleId}`);
      toast.success("Xóa rule thành công");
    } catch (err: any) {
      console.error("Error deleting rule:", err);
      const errorMessage = err.message || "Failed to delete rule";
      toast.error(`Có lỗi xảy ra khi xóa rule: ${errorMessage}`);
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
    getRuleById,
  };
}
