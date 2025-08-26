import { useState, useCallback } from "react";
import { api } from "@/lib/api";

export interface RuleResult {
  id: number;
  rule_id: number;
  compliance_result_id: number;
  rule_name: string;
  status: "passed" | "failed";
  output: string;
  error_message?: string;
  severity: string;
  created_at: string;
  updated_at: string;
}

export interface RuleResultListResponse {
  results: RuleResult[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UseRuleResultsReturn {
  ruleResults: RuleResult[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;

  fetchRuleResults: (
    complianceId: number,
    keyword?: string,
    status?: string,
    page?: number,
    pageSize?: number
  ) => Promise<void>;

  updateRuleStatus: (
    ruleResultId: number,
    newStatus: "passed" | "failed"
  ) => Promise<boolean>;

  refreshData: () => Promise<void>;
}

export function useRuleResults(): UseRuleResultsReturn {
  const [ruleResults, setRuleResults] = useState<RuleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [currentParams, setCurrentParams] = useState({
    complianceId: 0,
    keyword: "",
    status: "",
  });

  const fetchRuleResults = useCallback(
    async (
      complianceId: number,
      keyword?: string,
      status?: string,
      page: number = 1,
      size: number = 10
    ) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append("compliance_id", complianceId.toString());
        if (keyword?.trim()) params.append("keyword", keyword.trim());
        if (status && status !== "all") params.append("status", status);
        params.append("page", page.toString());
        params.append("page_size", size.toString());

        const queryString = params.toString();
        const url = `/rule-results?${queryString}`;

        const data = await api.get<RuleResultListResponse>(url);

        setRuleResults(data.results || []);
        setTotalItems(data.total || 0);
        setCurrentPage(data.page || 1);
        setTotalPages(data.total_pages || 0);
        setPageSize(data.page_size || 10);

        setCurrentParams({
          complianceId,
          keyword: keyword ?? "",
          status: status ?? "",
        });
      } catch (err: any) {
        const errorMessage =
          err.message || "Có lỗi xảy ra khi tải rule results";
        setError(errorMessage);
        console.error("Error fetching rule results:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateRuleStatus = useCallback(
    async (
      ruleResultId: number,
      newStatus: "passed" | "failed"
    ): Promise<boolean> => {
      try {
        setError(null);

        const params = new URLSearchParams();
        params.append("new_status", newStatus);

        await api.put(
          `/rule-results/${ruleResultId}/status?${params.toString()}`
        );

        // Update local state
        setRuleResults((prev) =>
          prev.map((rule) =>
            rule.id === ruleResultId ? { ...rule, status: newStatus } : rule
          )
        );

        return true;
      } catch (err: any) {
        const errorMessage =
          err.message || "Có lỗi xảy ra khi cập nhật trạng thái";
        setError(errorMessage);
        console.error("Error updating rule status:", err);
        return false;
      }
    },
    []
  );

  const refreshData = useCallback(async () => {
    if (currentParams.complianceId > 0) {
      await fetchRuleResults(
        currentParams.complianceId,
        currentParams.keyword,
        currentParams.status,
        currentPage,
        pageSize
      );
    }
  }, [fetchRuleResults, currentParams, currentPage, pageSize]);

  return {
    ruleResults,
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    fetchRuleResults,
    updateRuleStatus,
    refreshData,
  };
}
