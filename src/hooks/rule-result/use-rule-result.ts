import { useState, useCallback } from "react";
import { RuleResult, RuleResultListResponse } from "@/types/compliance";
import { api } from "@/lib/api";

interface UseRuleResultsReturn {
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
  refreshData: () => void;
}

export function useRuleResults(): UseRuleResultsReturn {
  const [ruleResults, setRuleResults] = useState<RuleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Store last fetch parameters for refresh
  const [lastFetchParams, setLastFetchParams] = useState<{
    complianceId: number;
    keyword?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  } | null>(null);

  const fetchRuleResults = useCallback(
    async (
      complianceId: number,
      keyword?: string,
      status?: string,
      page = 1,
      pageSize = 10
    ) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          compliance_id: complianceId.toString(),
          page: page.toString(),
          page_size: pageSize.toString(),
        });

        if (keyword) {
          params.append("keyword", keyword);
        }
        if (status) {
          params.append("status", status);
        }

        console.log("Fetching rule results with params:", params.toString());

        const response = await api.get<RuleResultListResponse>(
          `/rule-results?${params.toString()}`
        );

        console.log("Rule results response:", response);

        setRuleResults(response.results);
        setTotalItems(response.total);
        setCurrentPage(response.page);
        setTotalPages(response.total_pages);
        setPageSize(response.page_size);

        // Store parameters for refresh
        setLastFetchParams({
          complianceId,
          keyword,
          status,
          page,
          pageSize,
        });
      } catch (err) {
        console.error("Error fetching rule results:", err);
        setError("Không thể tải danh sách rule results");
        setRuleResults([]);
        setTotalItems(0);
        setCurrentPage(1);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateRuleStatus = useCallback(
    async (ruleResultId: number, newStatus: "passed" | "failed") => {
      try {
        // Fix: Send new_status as query parameter, not in request body
        const params = new URLSearchParams({
          new_status: newStatus,
        });

        console.log(`Updating rule ${ruleResultId} status to:`, newStatus);

        await api.put(
          `/rule-results/${ruleResultId}/status?${params.toString()}`
        );

        // Update local state
        setRuleResults((prev) =>
          prev.map((rr) =>
            rr.id === ruleResultId ? { ...rr, status: newStatus } : rr
          )
        );

        console.log("Rule status updated successfully");
        return true;
      } catch (err) {
        console.error("Error updating rule status:", err);
        return false;
      }
    },
    []
  );

  const refreshData = useCallback(() => {
    if (lastFetchParams) {
      fetchRuleResults(
        lastFetchParams.complianceId,
        lastFetchParams.keyword,
        lastFetchParams.status,
        lastFetchParams.page,
        lastFetchParams.pageSize
      );
    }
  }, [lastFetchParams, fetchRuleResults]);

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
