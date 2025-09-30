// src/hooks/fix-log/use-fix-logs.ts

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { FixLog, FixLogListResponse } from "@/types/fix-log";

interface UseFixLogsReturn {
  fixLogs: FixLog[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;

  fetchFixLogs: (
    complianceId?: number,
    ruleResultId?: number,
    userId?: number,
    keyword?: string,
    page?: number,
    pageSize?: number
  ) => Promise<void>;

  refreshData: () => Promise<void>;
}

export function useFixLogs(): UseFixLogsReturn {
  const [fixLogs, setFixLogs] = useState<FixLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [currentParams, setCurrentParams] = useState({
    complianceId: undefined as number | undefined,
    ruleResultId: undefined as number | undefined,
    userId: undefined as number | undefined,
    keyword: undefined as string | undefined,
  });

  const fetchFixLogs = useCallback(
    async (
      complianceId?: number,
      ruleResultId?: number,
      userId?: number,
      keyword?: string,
      page: number = 1,
      size: number = 20
    ) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (complianceId)
          params.append("compliance_id", complianceId.toString());
        if (ruleResultId)
          params.append("rule_result_id", ruleResultId.toString());
        if (userId) params.append("user_id", userId.toString());
        if (keyword?.trim()) params.append("keyword", keyword.trim());

        params.append("page", page.toString());
        params.append("page_size", size.toString());

        const queryString = params.toString();
        const url = `/fixes/logs${queryString ? `?${queryString}` : ""}`;

        const data = await api.get<FixLogListResponse>(url);

        console.log("Fix logs data:", data); // Debug log

        // Backend trả về object với property items
        setFixLogs(data.items || []);
        setTotalItems(data.total || 0);
        setCurrentPage(data.page || 1);
        setTotalPages(data.total_pages || 0);
        setPageSize(data.page_size || size);

        setCurrentParams({
          complianceId,
          ruleResultId,
          userId,
          keyword,
        });

        setError(null);
      } catch (err: any) {
        const errorMessage = err.message || "Error fetching fix logs";
        setError(errorMessage);
        console.error("Error fetching fix logs:", err);
        setFixLogs([]);
        setTotalItems(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshData = useCallback(async () => {
    await fetchFixLogs(
      currentParams.complianceId,
      currentParams.ruleResultId,
      currentParams.userId,
      currentParams.keyword,
      currentPage,
      pageSize
    );
  }, [fetchFixLogs, currentParams, currentPage, pageSize]);

  return {
    fixLogs,
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    fetchFixLogs,
    refreshData,
  };
}
